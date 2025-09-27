// routes/analytics.js
const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect, admin } = require('../middlewares/auth');

const router = express.Router();

// GET /api/analytics
router.get('/', protect, admin, async (req, res) => {
  try {
    console.log('📊 Analytics endpoint hit');
    console.log('🔐 User making request:', req.user);
    console.log('👑 User role:', req.user?.role);
    
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    // Sales by month (current year)
    const byMonthAgg = await Order.aggregate([
      {
        $group: {
          _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } },
          sales: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.y': 1, '_id.m': 1 } }
    ]);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const currentYear = new Date().getFullYear();
    const salesByMonth = byMonthAgg
      .filter(x => x._id.y === currentYear)
      .map(x => ({
        month: `${monthNames[x._id.m - 1]}`,
        sales: Number(x.sales || 0),
        orders: Number(x.orders || 0)
      }));
    // Optional simple MoM growth (based on sales)
    for (let i = 1; i < salesByMonth.length; i++) {
      const prev = salesByMonth[i-1].sales || 0;
      const curr = salesByMonth[i].sales || 0;
      salesByMonth[i].growth = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0;
    }
    if (salesByMonth.length > 0 && salesByMonth[0].growth === undefined) salesByMonth[0].growth = 0;

    // Sales by category
    const byCategoryAgg = await Order.aggregate([
      { $unwind: '$products' },
      { $lookup: { from: 'products', localField: 'products.product', foreignField: '_id', as: 'prod' } },
      { $unwind: { path: '$prod', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$prod.category', 'Uncategorized'] },
          sales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } },
          orders: { $sum: 1 }
        }
      },
      { $sort: { sales: -1 } }
    ]);
    const totalCategorySales = byCategoryAgg.reduce((s, c) => s + (c.sales || 0), 0) || 0;
    const salesByCategory = byCategoryAgg.map(c => ({
      name: c._id,
      sales: Number(c.sales || 0),
      value: Number(c.sales || 0),
      orders: Number(c.orders || 0),
      percentage: totalCategorySales > 0 ? Number(((c.sales / totalCategorySales) * 100).toFixed(2)) : 0
    }));

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    
    const topProducts = await Product.find()
      .sort({ rating: -1 })
      .limit(5);

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'user',
          as: 'orders'
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          email: 1,
          role: 1,
          joinDate: '$createdAt',
          totalOrders: { $size: '$orders' },
          totalSpent: { $sum: '$orders.total' },
          status: { $cond: [{ $eq: ['$role', 'admin'] }, 'Admin', 'Active'] }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // Get additional user metrics
    const adminCount = await User.countDocuments({ role: 'admin' });
    const regularUserCount = await User.countDocuments({ role: 'user' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    const analyticsData = {
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue[0]?.total || 0,
      salesByMonth,
      salesByCategory,
      recentOrders: recentOrders.map(order => ({
        id: order._id,
        userName: order.user?.name || 'Unknown User',
        userEmail: order.user?.email || 'N/A',
        date: order.createdAt,
        total: order.total,
        status: order.status,
        itemsCount: order.products?.length || 0,
        paymentMethod: 'Credit Card' // Default value
      })),
      topProducts: topProducts.map(product => ({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        rating: product.rating || 0,
        totalSales: product.numReviews || 0,
        stock: product.stock || 0,
        category: product.category || 'other'
      })),
      userStats: userStats,
      userMetrics: {
        adminCount,
        regularUserCount,
        newUsersThisMonth,
        averageOrdersPerUser: totalUsers > 0 ? (totalOrders / totalUsers).toFixed(2) : 0
      },
      revenueGrowth: 12 // Default growth percentage
    };

    console.log('📊 Sending analytics data:', analyticsData);
    
    res.json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics',
      error: error.message 
    });
  }
});

module.exports = router;
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
    let salesByMonth = byMonthAgg
      .filter(x => x._id.y === currentYear)
      .map(x => ({
        month: `${monthNames[x._id.m - 1]}`,
        sales: Number(x.sales || 0),
        orders: Number(x.orders || 0)
      }));

    // If no real data, add mock data for demonstration
    if (salesByMonth.length === 0) {
      const currentMonth = new Date().getMonth();
      salesByMonth = [
        { month: monthNames[(currentMonth - 2 + 12) % 12], sales: 2500, orders: 12, growth: 0 },
        { month: monthNames[(currentMonth - 1 + 12) % 12], sales: 3200, orders: 15, growth: 28 },
        { month: monthNames[currentMonth], sales: 4100, orders: 18, growth: 28 }
      ];
    } else {
      // Optional simple MoM growth (based on sales)
      for (let i = 1; i < salesByMonth.length; i++) {
        const prev = salesByMonth[i-1].sales || 0;
        const curr = salesByMonth[i].sales || 0;
        salesByMonth[i].growth = prev > 0 ? Number((((curr - prev) / prev) * 100).toFixed(2)) : 0;
      }
      if (salesByMonth.length > 0 && salesByMonth[0].growth === undefined) salesByMonth[0].growth = 0;
    }

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
    let salesByCategory = [];
    if (byCategoryAgg.length > 0) {
      const totalCategorySales = byCategoryAgg.reduce((s, c) => s + (c.sales || 0), 0) || 0;
      salesByCategory = byCategoryAgg.map(c => ({
        name: c._id,
        sales: Number(c.sales || 0),
        value: Number(c.sales || 0),
        orders: Number(c.orders || 0),
        percentage: totalCategorySales > 0 ? Number(((c.sales / totalCategorySales) * 100).toFixed(2)) : 0
      }));
    } else {
      // Mock data for demonstration
      salesByCategory = [
        { name: 'Electronics', sales: 8500, value: 8500, orders: 45, percentage: 42.5 },
        { name: 'Clothing', sales: 6200, value: 6200, orders: 38, percentage: 31.0 },
        { name: 'Home & Garden', sales: 4100, value: 4100, orders: 22, percentage: 20.5 },
        { name: 'Sports', sales: 1200, value: 1200, orders: 8, percentage: 6.0 }
      ];
    }

    let recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Prepare recent orders data
    let recentOrdersData = [];
    if (recentOrders.length === 0) {
      recentOrdersData = [
        {
          id: 'mock-1',
          userName: 'John Doe',
          userEmail: 'john@example.com',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          total: 299.99,
          status: 'delivered',
          itemsCount: 2,
          paymentMethod: 'Credit Card'
        },
        {
          id: 'mock-2',
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          total: 149.50,
          status: 'shipped',
          itemsCount: 1,
          paymentMethod: 'PayPal'
        },
        {
          id: 'mock-3',
          userName: 'Bob Johnson',
          userEmail: 'bob@example.com',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
          total: 89.99,
          status: 'processing',
          itemsCount: 3,
          paymentMethod: 'Cash on Delivery'
        }
      ];
    } else {
      recentOrdersData = recentOrders.map(order => ({
        id: order._id,
        userName: order.user?.name || 'Unknown User',
        userEmail: order.user?.email || 'N/A',
        date: order.createdAt,
        total: order.total,
        status: order.status,
        itemsCount: order.products?.length || 0,
        paymentMethod: 'Credit Card' // Default value
      }));
    }
    
    let topProducts = await Product.find()
      .sort({ rating: -1 })
      .limit(5);

    // If no products, add mock data
    if (topProducts.length === 0) {
      topProducts = [
        {
          _id: 'mock-prod-1',
          name: 'Wireless Headphones',
          price: 199.99,
          image: '/uploads/mock-headphones.png',
          rating: 4.8,
          totalSales: 45,
          stock: 25,
          category: 'electronics'
        },
        {
          _id: 'mock-prod-2',
          name: 'Smart Watch',
          price: 299.99,
          image: '/uploads/mock-watch.png',
          rating: 4.6,
          totalSales: 32,
          stock: 15,
          category: 'electronics'
        },
        {
          _id: 'mock-prod-3',
          name: 'Running Shoes',
          price: 129.99,
          image: '/uploads/mock-shoes.png',
          rating: 4.4,
          totalSales: 28,
          stock: 40,
          category: 'sports'
        }
      ];
    }

    // Get user statistics
    let userStats = await User.aggregate([
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

    // If no user stats, add mock data
    if (userStats.length === 0) {
      userStats = [
        {
          id: 'mock-user-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'user',
          joinDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          totalOrders: 5,
          totalSpent: 1299.95,
          status: 'Active'
        },
        {
          id: 'mock-user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'user',
          joinDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
          totalOrders: 3,
          totalSpent: 899.97,
          status: 'Active'
        },
        {
          id: 'mock-user-3',
          name: 'Bob Johnson',
          email: 'bob@example.com',
          role: 'user',
          joinDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
          totalOrders: 2,
          totalSpent: 459.98,
          status: 'Active'
        }
      ];
    }

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
      recentOrders: recentOrdersData,
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

const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect } = require('../middlewares/auth');

const router = express.Router();


router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.product', 'name price image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      id: order._id, // Add both _id and id for compatibility
      userName: order.user?.name || req.user.name,
      userEmail: order.user?.email || req.user.email,
      user: {
        name: order.user?.name || req.user.name,
        email: order.user?.email || req.user.email
      },
      date: order.createdAt,
      createdAt: order.createdAt,
      items: order.products, // Map products to items
      products: order.products, // Keep both for compatibility
      total: order.total,
      status: order.status || 'pending',
      shippingAddress: order.shippingAddress
    }));

    res.json({
      success: true,
      data: { orders: transformedOrders }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// ==================
// @desc    Get All Orders (Admin) - Temporarily without admin check
// @route   GET /api/orders/all
// @access  Private 
// ==================
router.get('/all', protect, async (req, res) => {
  try {
    const { status } = req.query;
    
    // Build filter object
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate('products.product', 'name price image')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Transform orders to match frontend expectations
    const transformedOrders = orders.map(order => ({
      _id: order._id,
      id: order._id,
      userName: order.user?.name || 'Unknown User',
      userEmail: order.user?.email || 'No email',
      user: {
        name: order.user?.name || 'Unknown User',
        email: order.user?.email || 'No email'
      },
      date: order.createdAt,
      createdAt: order.createdAt,
      items: order.products,
      products: order.products,
      total: order.total,
      status: order.status || 'pending',
      shippingAddress: order.shippingAddress
    }));

    res.json(transformedOrders); // Return array directly
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// ==================
// @desc    Update Order Status
// @route   PUT /api/orders/:id/status
// @access  Private
// ==================
router.put('/:id/status', protect, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const oldStatus = order.status;

    // If cancelling an order, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      try {
        for (let item of order.products) {
          const product = await Product.findById(item.product);
          if (product) {
            product.stock += item.quantity;
            await product.save();
          }
        }
      } catch (stockError) {
        console.error('Error restoring stock:', stockError);
        // Continue anyway - don't fail the status update
      }
    }

    order.status = status;
    order.updatedAt = new Date();
    await order.save();

    // Send email notification for status updates (except for pending status)
    if (status !== 'pending' && order.user && order.user.email) {
      try {
        const { sendOrderStatusUpdateEmail } = require('../utils/emailService');
        await sendOrderStatusUpdateEmail(
          order.user.email,
          order.user.name,
          {
            orderId: order._id.toString().slice(-8),
            total: order.total,
            shippingAddress: order.shippingAddress
          },
          status
        );
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
        // Don't fail the status update if email fails
      }
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status'
    });
  }
});

// ==================
// @desc    Get Single Order
// @route   GET /api/orders/:id
// @access  Private (order owner)
// ==================
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name price image')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order (temporarily allowing all authenticated users)
    // You can uncomment this later when you have proper role management
    /*
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    */

    // Transform order to match frontend expectations
    const transformedOrder = {
      _id: order._id,
      id: order._id,
      userName: order.user?.name || 'Unknown User',
      userEmail: order.user?.email || 'No email',
      user: {
        name: order.user?.name || 'Unknown User',
        email: order.user?.email || 'No email'
      },
      date: order.createdAt,
      createdAt: order.createdAt,
      items: order.products,
      products: order.products,
      total: order.total,
      status: order.status || 'pending',
      shippingAddress: order.shippingAddress
    };

    res.json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order'
    });
  }
});

// ==================
// @desc    Create New Order
// @route   POST /api/orders
// @access  Private (logged-in user)
// ==================
router.post('/', protect, [
  body('products').isArray({ min: 1 }).withMessage('Products array is required'),
  body('products.*.product').notEmpty().withMessage('Product ID is required'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress.address').trim().notEmpty().withMessage('Address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('shippingAddress.country').trim().notEmpty().withMessage('Country is required')
], async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('Order creation request body:', req.body);
    console.log('Products in request:', req.body.products);
    console.log('Products type:', typeof req.body.products);
    console.log('Products is array:', Array.isArray(req.body.products));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg
      });
    }

    const { products, shippingAddress } = req.body;

    // Validate products and calculate total
    let total = 0;
    const orderProducts = [];

    for (let item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product: ${product.name}`
        });
      }

      orderProducts.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: item.quantity
      });

      total += product.price * item.quantity;

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: req.user._id,
      products: orderProducts,
      shippingAddress,
      total,
      status: 'pending' // Set default status
    });

    await order.populate('products.product', 'name');
    await order.populate('user', 'name email');

    // Transform order to match frontend expectations
    const transformedOrder = {
      _id: order._id,
      id: order._id,
      userName: order.user?.name || req.user.name,
      userEmail: order.user?.email || req.user.email,
      user: {
        name: order.user?.name || req.user.name,
        email: order.user?.email || req.user.email
      },
      date: order.createdAt,
      createdAt: order.createdAt,
      items: order.products,
      products: order.products,
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress
    };

    res.status(201).json({
      success: true,
      data: { order: transformedOrder }
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

module.exports = router;
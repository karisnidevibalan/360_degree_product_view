const Order = require("../models/Order");

exports.createOrder = async (req, res) => {
  try {
    const { products, totalPrice, shippingAddress } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      products,
      total: totalPrice, // Use 'total' to match the Order model schema
      shippingAddress: shippingAddress || {
        address: "Default Address",
        city: "Default City", 
        postalCode: "00000",
        country: "Default Country"
      }
    });

    await newOrder.save();
    res.status(201).json({ msg: "Order placed successfully", order: newOrder });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// Get orders of logged-in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.product", "name price image category")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load .env file with explicit path and debug
const envPath = path.resolve(__dirname, '.env');
console.log('Loading .env from:', envPath);

const envConfig = require('dotenv').config({ path: envPath });
if (envConfig.error) {
  console.error('❌ Error loading .env file:', envConfig.error);
} else {
  console.log('✅ Environment variables loaded successfully');
  console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Found' : 'Not found');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Rest of your server configuration...
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
<<<<<<< HEAD
const cartRoutes=require('./routes/cart');
const analyticsRoutes = require('./routes/analytics'); // ADD THIS LINE
const chatbotRoutes = require('./routes/chatbot');
=======
const cartRoutes = require('./routes/cart');
const analyticsRoutes = require('./routes/analytics');
const chatbotRoutes = require('./routes/chatbot');
const reviewRoutes = require('./routes/reviews');
const paymentRoutes = require('./routes/payment.routes');
>>>>>>> ecommerce/main
const errorHandler = require('./middlewares/error');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/cart', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
<<<<<<< HEAD
app.use('/api/chatbot', chatbotRoutes); 
=======
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);

>>>>>>> ecommerce/main
// Error Handler (must be last)
app.use(errorHandler);

// MongoDB Connection + Start Server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log('Current environment variables:', {
        NODE_ENV: process.env.NODE_ENV,
        RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? '****' + process.env.RAZORPAY_KEY_SECRET.slice(-4) : 'Not found'
      });
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
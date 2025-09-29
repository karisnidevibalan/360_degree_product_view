const dotenv = require('dotenv');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/users', require('./routes/users'));
// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const cartRoutes=require('./routes/cart');
const analyticsRoutes = require('./routes/analytics'); // ADD THIS LINE
const chatbotRoutes = require('./routes/chatbot');
const reviewRoutes = require('./routes/reviews');
const errorHandler = require('./middlewares/error');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/cart', cartRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes); 
// Error Handler (must be last)
app.use(errorHandler);

// MongoDB Connection + Start Server
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });

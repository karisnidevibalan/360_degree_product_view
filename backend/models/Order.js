const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    quantity: { 
      type: Number, 
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'online'],
    default: 'cash_on_delivery'
<<<<<<< HEAD
=======
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentDetails: {
    paymentId: { type: String },
    orderId: { type: String },
    signature: { type: String },
    status: { type: String },
    method: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'INR' },
    refundStatus: { type: String },
    refundAmount: { type: Number, default: 0 },
    captured: { type: Boolean, default: false },
    email: { type: String },
    contact: { type: String },
    fee: { type: Number },
    tax: { type: Number },
    errorCode: { type: String },
    errorDescription: { type: String },
    bank: { type: String },
    wallet: { type: String },
    vpa: { type: String },
    cardId: { type: String },
    bankTransactionId: { type: String },
    international: { type: Boolean, default: false },
    upiTransactionId: { type: String },
    upiVpa: { type: String },
    upiResponseCode: { type: String },
    upiApprovalRefNo: { type: String },
    acquirerData: {
      rrn: { type: String },
      upiTransactionId: { type: String },
      upiResponseCode: { type: String },
      upiApprovalRefNo: { type: String },
      aadhaarNumber: { type: String },
      arn: { type: String },
      bankTransactionId: { type: String },
      paymentId: { type: String },
      referenceNo: { type: String },
      statusCode: { type: String },
      statusDescription: { type: String },
      transactionTimestamp: { type: Date },
      utr: { type: String }
    }
>>>>>>> ecommerce/main
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
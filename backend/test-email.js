const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('./utils/emailService');
require('dotenv').config();

// Test data for order confirmation email
const testOrderData = {
  orderId: '12345678',
  orderDate: new Date(),
  total: 1500,
  items: [
    {
      name: 'Test Product 1',
      price: 500,
      quantity: 2
    },
    {
      name: 'Test Product 2', 
      price: 500,
      quantity: 1
    }
  ],
  shippingAddress: {
    address: '123 Test Street',
    city: 'Test City',
    postalCode: '12345',
    country: 'Test Country'
  }
};

// Test data for order status update email
const testStatusUpdateData = {
  orderId: '12345678',
  total: 1500
};

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality...\n');
  
  // Check environment variables
  console.log('📧 Checking Email Configuration:');
  
  if (process.env.SMTP_HOST) {
    console.log('🔧 SMTP Configuration Detected:');
    console.log(`SMTP_HOST: ${process.env.SMTP_HOST ? '✅ Set' : '❌ Not set'}`);
    console.log(`SMTP_PORT: ${process.env.SMTP_PORT || '587 (default)'}`);
    console.log(`SMTP_USER: ${process.env.SMTP_USER ? '✅ Set' : '❌ Not set'}`);
    console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? '✅ Set' : '❌ Not set'}`);
    console.log(`SMTP_SECURE: ${process.env.SMTP_SECURE || 'false (default)'}\n`);
    
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log('❌ SMTP configuration is incomplete!');
      console.log('Please set the following environment variables:');
      console.log('SMTP_HOST=your-smtp-server.com');
      console.log('SMTP_PORT=587');
      console.log('SMTP_USER=your-email@domain.com');
      console.log('SMTP_PASS=your-password');
      console.log('SMTP_SECURE=false');
      return;
    }
  } else {
    console.log('🔧 Service-based Configuration:');
    console.log(`EMAIL_SERVICE: ${process.env.EMAIL_SERVICE || 'gmail (default)'}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
    console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}\n`);
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email configuration is incomplete!');
      console.log('Please set the following environment variables:');
      console.log('EMAIL_USER=your-email@gmail.com');
      console.log('EMAIL_PASS=your-app-password');
      console.log('\nFor Gmail, you need to:');
      console.log('1. Enable 2-factor authentication');
      console.log('2. Generate an App Password');
      console.log('3. Use the App Password (not your regular password)');
      return;
    }
  }
  
  // Test order confirmation email
  console.log('📨 Testing Order Confirmation Email...');
  try {
    const result = await sendOrderConfirmationEmail(
      'test@example.com', // Replace with your test email
      'Test User',
      testOrderData
    );
    console.log('✅ Order confirmation email sent successfully!');
    console.log(`Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.log('❌ Failed to send order confirmation email:');
    console.log(`Error: ${error.message}\n`);
  }
  
  // Test order status update email
  console.log('📨 Testing Order Status Update Email...');
  try {
    const result = await sendOrderStatusUpdateEmail(
      'test@example.com', // Replace with your test email
      'Test User',
      testStatusUpdateData,
      'shipped'
    );
    console.log('✅ Order status update email sent successfully!');
    console.log(`Message ID: ${result.messageId}\n`);
  } catch (error) {
    console.log('❌ Failed to send order status update email:');
    console.log(`Error: ${error.message}\n`);
  }
  
  console.log('🎉 Email testing completed!');
}

// Run the test
testEmailFunctionality().catch(console.error);

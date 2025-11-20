const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
<<<<<<< HEAD
  // Check if SMTP configuration is provided
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
      }
    });
  } else {
    // Fallback to service-based configuration (Gmail, etc.)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
=======
  try {
    // Check if SMTP configuration is provided
    if (process.env.SMTP_HOST) {
      if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        throw new Error('SMTP_USER and SMTP_PASS are required when using SMTP_HOST');
      }
      
      console.log('Creating SMTP transporter with host:', process.env.SMTP_HOST);
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true' || false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
        }
      });
    } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      // Fallback to service-based configuration (Gmail, etc.)
      console.log('Creating service-based email transporter');
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      throw new Error('No valid email configuration found. Please set up SMTP or service-based email settings.');
    }
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw error;
>>>>>>> ecommerce/main
  }
};

// Send order confirmation email
const sendOrderConfirmationEmail = async (userEmail, userName, orderDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Confirmation - Order #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #28a745; margin: 0;">Order Confirmed!</h2>
            <p style="margin: 10px 0 0 0; color: #6c757d;">Thank you for your order, ${userName}!</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #343a40; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Order Date:</strong> ${new Date(orderDetails.orderDate).toLocaleDateString()}</p>
            <p><strong>Payment Method:</strong> Cash on Delivery</p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
            
            <h4 style="color: #343a40; margin-top: 20px;">Items Ordered:</h4>
            <div style="margin: 15px 0;">
              ${orderDetails.items.map(item => `
                <div style="display: flex; justify-content: space-between; padding: 10px; background-color: #f8f9fa; margin: 5px 0; border-radius: 4px;">
                  <div>
                    <strong>${item.name}</strong><br>
                    <small>Quantity: ${item.quantity}</small>
                  </div>
                  <div>₹${item.price * item.quantity}</div>
                </div>
              `).join('')}
            </div>
            
            <h4 style="color: #343a40; margin-top: 20px;">Shipping Address:</h4>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px;">
              <p style="margin: 0;">
                ${orderDetails.shippingAddress.address}<br>
                ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.postalCode}<br>
                ${orderDetails.shippingAddress.country}
              </p>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h4 style="color: #856404; margin: 0 0 10px 0;">Important Information:</h4>
              <ul style="color: #856404; margin: 0; padding-left: 20px;">
                <li>Your order will be processed within 1-2 business days</li>
                <li>You will receive another email when your order is shipped</li>
                <li>Payment will be collected upon delivery</li>
                <li>Please keep this email for your records</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d;">
            <p>Thank you for choosing our store!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send order status update email
const sendOrderStatusUpdateEmail = async (userEmail, userName, orderDetails, newStatus) => {
  try {
    const transporter = createTransporter();
    
    const statusMessages = {
      'processing': 'Your order is being processed and will be shipped soon.',
      'shipped': 'Your order has been shipped and is on its way to you.',
      'delivered': 'Your order has been delivered successfully.',
      'cancelled': 'Your order has been cancelled.'
    };

    const statusColors = {
      'processing': '#ffc107',
      'shipped': '#17a2b8',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Order Update - Order #${orderDetails.orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: ${statusColors[newStatus] || '#6c757d'}; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">Order Status Updated</h2>
            <p style="margin: 10px 0 0 0;">Your order status has been updated to: <strong>${newStatus.toUpperCase()}</strong></p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #dee2e6; border-radius: 8px;">
            <h3 style="color: #343a40; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> #${orderDetails.orderId}</p>
            <p><strong>Customer:</strong> ${userName}</p>
            <p><strong>New Status:</strong> <span style="background-color: ${statusColors[newStatus] || '#6c757d'}; color: white; padding: 4px 8px; border-radius: 4px;">${newStatus.toUpperCase()}</span></p>
            <p><strong>Total Amount:</strong> ₹${orderDetails.total}</p>
            
            <div style="background-color: #e9ecef; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <h4 style="color: #343a40; margin: 0 0 10px 0;">Status Update:</h4>
              <p style="margin: 0; color: #495057;">${statusMessages[newStatus] || 'Your order status has been updated.'}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6c757d;">
            <p>Thank you for your patience!</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Order status update email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending order status update email:', error);
    throw error;
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};

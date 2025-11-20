import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { FiTruck, FiLock, FiCheck, FiDollarSign } from 'react-icons/fi';
=======
import { FiTruck, FiLock, FiCheck, FiDollarSign, FiCreditCard, FiShield } from 'react-icons/fi';
>>>>>>> ecommerce/main
import { useCart } from '../context/cartContext';
import { useAuth } from '../context/authContext';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';
import Image from '../components/Image';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
<<<<<<< HEAD

  // Debug: Log cart items when component mounts
=======
  const [paymentMethod, setPaymentMethod] = useState('cod');

>>>>>>> ecommerce/main
  useEffect(() => {
    console.log('Checkout component - Cart items:', cartItems);
    console.log('Checkout component - Cart items length:', cartItems.length);
  }, [cartItems]);
<<<<<<< HEAD
=======

>>>>>>> ecommerce/main
  const [formData, setFormData] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
<<<<<<< HEAD
    
    // Options
=======
>>>>>>> ecommerce/main
    shippingMethod: 'standard'
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Calculate totals
  const subtotal = getCartTotal();
  const shipping = formData.shippingMethod === 'express' ? 19.99 : subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async () => {
    try {
      setLoading(true);
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay SDK. Please check your internet connection.');
        setLoading(false);
        return;
      }

      // Create order on backend
      const orderResponse = await api.post('/payments/create-order', {
        amount: Math.round(total * 100),
        currency: 'INR',
        receipt: `order_rcpt_${Date.now()}`
      });

      // Use Razorpay test key directly
      const options = {
        key: 'rzp_test_RgPhDkqd6kwdDQ', // Your Razorpay test key
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: "Your E-Commerce Store",
        description: "Order Payment",
        order_id: orderResponse.data.id,
        handler: handleRazorpaySuccess,
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#3399cc"
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            alert('Payment cancelled. Please try again.');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      razorpay.on('payment.failed', (response) => {
        setLoading(false);
        alert(`Payment failed: ${response.error.description}`);
      });
    } catch (error) {
      console.error('Error initializing Razorpay:', error);
      setLoading(false);
      alert('Failed to initialize payment. Please try again.');
    }
  };

  const handleRazorpaySuccess = async (paymentResponse) => {
    setLoading(true);
    try {
      // Log payment response for debugging
      console.log('Payment response:', paymentResponse);
      
      // Skip verification for now
      console.log('Skipping payment verification for development');

      // Create order after successful payment
      const orderData = {
        products: cartItems.map(item => ({
          product: item.productId || item.id || item._id,
          quantity: item.quantity || 1
        })),
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        paymentId: paymentResponse.razorpay_payment_id,
        orderId: paymentResponse.razorpay_order_id,
        shippingAddress: {
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country
        },
        totalAmount: total
      };

      // Create order
      const response = await api.post('/orders', orderData);
      console.log('Order created:', response.data);
      
      // Clear cart and show success
      clearCart();
      setOrderPlaced(true);
      setLoading(false);
      
      // Redirect to order success page or show success message
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Order creation failed:', error);
      setLoading(false);
      alert('Payment was successful but there was an issue creating your order. Please contact support with payment ID: ' + 
        (paymentResponse.razorpay_payment_id || 'N/A'));
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    alert(`Payment error: ${error?.message || 'Something went wrong with the payment'}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
<<<<<<< HEAD
      // Debug: Log cart items structure
      console.log('Cart items:', cartItems);
      console.log('Cart items length:', cartItems.length);
      
      // Check if cart is empty
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Please add items to cart before placing an order.');
        setLoading(false);
        return;
      }

      // Prepare order data for cash on delivery
      const products = cartItems.map(item => {
        // Handle different cart item structures
        const productId = item.productId || item.id || item._id;
        console.log('Processing cart item:', item, 'Product ID:', productId);
        
        if (!productId) {
          throw new Error(`Invalid product ID for item: ${item.name || 'Unknown'}`);
        }
        
        return {
          product: productId,
          quantity: item.quantity || 1
        };
      });

      // Validate products array
      if (!products || products.length === 0) {
        throw new Error('No valid products found in cart');
      }

      const orderData = {
        products: products,
        shippingAddress: {
          address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country
        }
      };

      console.log('Submitting order with data:', orderData);
      console.log('Products array:', orderData.products);
      console.log('Products array length:', orderData.products.length);
      console.log('First product:', orderData.products[0]);
      
      const response = await api.createOrder(orderData);
      console.log('Order response:', response);
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order failed:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Order failed: ${error.response?.data?.message || error.message || 'Please try again.'}`);
=======
      if (paymentMethod === 'razorpay') {
        await handleRazorpayPayment();
      } else if (paymentMethod === 'cod') {
        // Handle COD order
        const orderData = {
          products: cartItems.map(item => ({
            product: item.productId || item.id || item._id,
            quantity: item.quantity || 1,
            price: item.price,
            name: item.name,
            image: item.image
          })),
          paymentMethod: 'cod',
          paymentStatus: 'pending',
          shippingAddress: {
            address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            city: formData.city,
            postalCode: formData.zipCode,
            country: formData.country
          },
          totalAmount: total
        };

        const response = await api.createOrder(orderData);
        console.log('COD Order created:', response);
        clearCart();
        setOrderPlaced(true);
      }
      // For Razorpay, the payment flow is handled by the RazorpayButton component
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('There was an issue creating your order. Please try again.');
>>>>>>> ecommerce/main
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty
  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  // Success screen
  if (orderPlaced) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="card-body">
              <FiCheck size={64} color="var(--success)" style={{ marginBottom: '2rem' }} />
              <h1 style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                Order Placed Successfully!
              </h1>
              <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
<<<<<<< HEAD
                Thank you for your purchase. You will receive an order confirmation email shortly. 
                Payment will be collected upon delivery.
=======
                Thank you for your purchase. You will receive an order confirmation email shortly.
                {paymentMethod === 'cod' && ' Payment will be collected upon delivery.'}
>>>>>>> ecommerce/main
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn btn-primary"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="btn btn-secondary"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
          {/* Left Column - Forms */}
          <div style={{ gridColumn: '1 / 3', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Shipping Information */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiTruck />
                  <h3>Shipping Information</h3>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-input"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-input"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-input"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Address *</label>
                  <input
                    type="text"
                    name="address"
                    className="form-input"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      name="city"
                      className="form-input"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      name="state"
                      className="form-input"
                      value={formData.state}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      className="form-input"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Shipping Method</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="standard"
                        checked={formData.shippingMethod === 'standard'}
                        onChange={handleInputChange}
                      />
                      Standard (5-7 days) - {subtotal > 50 ? 'Free' : '$9.99'}
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <input
                        type="radio"
                        name="shippingMethod"
                        value="express"
                        checked={formData.shippingMethod === 'express'}
                        onChange={handleInputChange}
                      />
                      Express (2-3 days) - $19.99
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiDollarSign />
                  <h3>Payment Method</h3>
                  <FiLock size={16} color="var(--success)" />
                </div>
              </div>
              <div className="card-body">
<<<<<<< HEAD
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '1rem', 
                  backgroundColor: 'var(--success-light)', 
                  border: '2px solid var(--success)', 
                  borderRadius: 'var(--border-radius)',
                  marginBottom: '1rem'
                }}>
                  <FiDollarSign size={24} color="var(--success)" />
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--success)' }}>
                      Cash on Delivery
                    </h4>
                    <p style={{ margin: 0, color: 'var(--gray-600)' }}>
                      Pay when your order is delivered to your doorstep
                    </p>
                  </div>
                </div>
                
                <div style={{ 
                  backgroundColor: 'var(--info-light)', 
                  padding: '1rem', 
                  borderRadius: 'var(--border-radius)',
                  border: '1px solid var(--info)'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--info)' }}>
                    How Cash on Delivery Works:
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--gray-600)' }}>
                    <li>Place your order without any upfront payment</li>
                    <li>We'll process and ship your order</li>
                    <li>Pay the delivery person when you receive your order</li>
                    <li>Only cash payments are accepted upon delivery</li>
                  </ul>
                </div>
=======
                <div style={{ marginBottom: '1rem' }}>
                  
                  {/* Cash on Delivery */}
                  <div 
                    onClick={() => setPaymentMethod('cod')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      padding: '1rem', 
                      backgroundColor: paymentMethod === 'cod' ? 'rgba(16, 185, 129, 0.1)' : '#f9fafb',
                      border: `2px solid ${paymentMethod === 'cod' ? '#10b981' : '#e5e7eb'}`, 
                      borderRadius: '8px',
                      marginBottom: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: `2px solid ${paymentMethod === 'cod' ? '#10b981' : '#9ca3af'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {paymentMethod === 'cod' && (
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: '#10b981' 
                        }} />
                      )}
                    </div>
                    <FiDollarSign size={24} color={paymentMethod === 'cod' ? '#10b981' : '#6b7280'} />
                    <div>
                      <h4 style={{ 
                        margin: '0 0 0.25rem 0', 
                        color: paymentMethod === 'cod' ? '#10b981' : '#1f2937'
                      }}>
                        Cash on Delivery
                      </h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                        Pay when your order is delivered to your doorstep
                      </p>
                    </div>
                  </div>

                  {/* Razorpay Payment */}
                  <div 
                    onClick={() => setPaymentMethod('razorpay')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1rem', 
                      padding: '1rem', 
                      backgroundColor: paymentMethod === 'razorpay' ? 'rgba(59, 130, 246, 0.1)' : '#f9fafb',
                      border: `2px solid ${paymentMethod === 'razorpay' ? '#3b82f6' : '#e5e7eb'}`, 
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      border: `2px solid ${paymentMethod === 'razorpay' ? '#3b82f6' : '#9ca3af'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {paymentMethod === 'razorpay' && (
                        <div style={{ 
                          width: '12px', 
                          height: '12px', 
                          borderRadius: '50%', 
                          backgroundColor: '#3b82f6' 
                        }} />
                      )}
                    </div>
                    <FiCreditCard size={24} color={paymentMethod === 'razorpay' ? '#3b82f6' : '#6b7280'} />
                    <div>
                      <h4 style={{ 
                        margin: '0 0 0.25rem 0', 
                        color: paymentMethod === 'razorpay' ? '#3b82f6' : '#1f2937'
                      }}>
                        Pay Online (Razorpay)
                      </h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>
                        Credit/Debit Card, UPI, Net Banking
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                {paymentMethod === 'razorpay' && (
                  <div style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.05)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FiShield size={18} color="#3b82f6" />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      Secure payment powered by Razorpay. Your payment information is encrypted.
                    </span>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div style={{ 
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginTop: '1rem'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '0.875rem' }}>
                      How Cash on Delivery Works:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                      <li>Place your order without any upfront payment</li>
                      <li>We'll process and ship your order</li>
                      <li>Pay the delivery person when you receive your order</li>
                    </ul>
                  </div>
                )}
>>>>>>> ecommerce/main
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="card" style={{ position: 'sticky', top: '2rem' }}>
              <div className="card-header">
                <h3>Order Summary</h3>
              </div>
              <div className="card-body">
                {/* Cart Items */}
                <div style={{ marginBottom: '1.5rem' }}>
                  {cartItems.map((item) => (
                    <div
                      key={item.id || item._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          marginRight: '1rem',
                          position: 'relative',
                          borderRadius: '0.5rem',
                          overflow: 'hidden',
                          backgroundColor: '#f3f4f6',
                        }}
<<<<<<< HEAD
                        onError={(e) => {
                          // Create a simple fallback image using canvas
                          const canvas = document.createElement('canvas');
                          canvas.width = 50;
                          canvas.height = 50;
                          const ctx = canvas.getContext('2d');
                          ctx.fillStyle = '#f0f0f0';
                          ctx.fillRect(0, 0, 50, 50);
                          ctx.fillStyle = '#666';
                          ctx.font = '10px Arial';
                          ctx.textAlign = 'center';
                          ctx.fillText('Product', 25, 30);
                          e.target.src = canvas.toDataURL();
                        }}
                      />
=======
                      >
                        <Image
                          productId={item.id || item._id}
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            padding: '0.25rem',
                          }}
                        />
                      </div>
>>>>>>> ecommerce/main
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Shipping:</span>
                    <span>{formatPrice(shipping)}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Tax:</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  <hr />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '600' }}>
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button
                  type="submit"
                  className="btn btn-primary btn-full btn-lg"
                  disabled={loading}
                >
<<<<<<< HEAD
                  <FiDollarSign />
                  {loading ? 'Processing...' : `Place Order (COD) - ${formatPrice(total)}`}
                </button>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'center', marginTop: '1rem' }}>
                  <FiDollarSign size={12} style={{ marginRight: '0.25rem' }} />
                  Pay when your order is delivered
                </div>
=======
                  {loading ? (
                    'Processing...'
                  ) : paymentMethod === 'razorpay' ? (
                    <>
                      <FiCreditCard />
                      Pay {formatPrice(total)}
                    </>
                  ) : (
                    <>
                      <FiDollarSign />
                      Place Order - {formatPrice(total)}
                    </>
                  )}
                </button>
                
                {paymentMethod === 'cod' && (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                    <FiDollarSign size={12} style={{ marginRight: '0.25rem' }} />
                    Pay when your order is delivered
                  </div>
                )}
>>>>>>> ecommerce/main
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiTruck, FiLock, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useAuth } from '../context/authContext';
import { api} from '../utils/api';
import { formatPrice } from '../utils/helpers';

const Checkout = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({
    // Shipping Information
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    
    // Payment Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: user?.name || '',
    
    // Options
    shippingMethod: 'standard',
    sameAsBilling: true
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate order processing
      const orderData = {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        total: total,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        shippingMethod: formData.shippingMethod
      };

      await api.createOrder(orderData);
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

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
                Thank you for your purchase. You will receive an order confirmation email shortly.
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
          {/* Shipping & Payment Forms */}
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

            {/* Payment Information */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiCreditCard />
                  <h3>Payment Information</h3>
                  <FiLock size={16} color="var(--success)" />
                </div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Cardholder Name *</label>
                  <input
                    type="text"
                    name="cardholderName"
                    className="form-input"
                    value={formData.cardholderName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    className="form-input"
                    placeholder="1234 5678 9012 3456"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      className="form-input"
                      placeholder="MM/YY"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      className="form-input"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
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
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                        paddingBottom: '1rem',
                        borderBottom: '1px solid var(--gray-200)'
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: 'var(--border-radius)'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Shipping:</span>
                    <div style={{ textAlign: 'right' }}>
                      <span>{formatPrice(shipping)}</span>
                      {shipping === 0 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                          Free!
                        </div>
                      )}
                    </div>
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
                  <FiLock />
                  {loading ? 'Processing...' : `Place Order - ${formatPrice(total)}`}
                </button>
                
                <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)', textAlign: 'center', marginTop: '1rem' }}>
                  <FiLock size={12} style={{ marginRight: '0.25rem' }} />
                  Your payment information is secure and encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
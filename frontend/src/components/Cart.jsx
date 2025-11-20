import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { useAuth } from '../context/authContext';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();



  // Helper function to get consistent product ID
  const getProductId = (item) => {
    // For database items, use productId field, for local items use _id or id
    if (item.productId) {
      return item.productId.toString();
    }
    return (item._id || item.id)?.toString();
  };

  // Helper function to get correct image URL
  const getImageUrl = (item) => {
    if (!item.image) {
      return 'https://via.placeholder.com/80x80?text=Product';
    }
    
    // If image is already a full URL, use it as is
    if (item.image.startsWith('http')) {
      return item.image;
    }
    
    // If it's just a filename, construct the full URL
    return `http://localhost:5000/uploads/${item.image}`;
  };

  const handleQuantityChange = (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    const productId = getProductId(item);
    console.log('Updating quantity for product:', productId, 'to:', newQuantity);
    
    // Validate productId before API call
    if (!productId || productId === 'undefined') {
      console.error('Invalid product ID:', productId, 'for item:', item);
      return;
    }
    
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (item) => {
    const productId = getProductId(item);
    console.log('Removing product:', productId);
    
    // Validate productId before API call
    if (!productId || productId === 'undefined') {
      console.error('Invalid product ID:', productId, 'for item:', item);
      return;
    }
    
    removeFromCart(productId);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0', minHeight: '60vh' }}>
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <FiShoppingBag size={64} color="var(--gray-400)" style={{ marginBottom: '2rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--gray-600)' }}>Your cart is empty</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--gray-500)' }}>
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="btn btn-secondary"
        >
          <FiTrash2 />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-3" style={{ gap: '2rem' }}>
        {/* Cart Items */}
        <div style={{ gridColumn: '1 / 3' }}>
          <div className="card">
            <div className="card-body">
              <h3 style={{ marginBottom: '1.5rem' }}>
                Cart Items ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
              </h3>

              {cartItems.map((item, index) => {
                const productId = getProductId(item);
                
                // Skip items without valid IDs and log warning
                if (!productId || productId === 'undefined') {
                  console.warn('Skipping cart item with invalid ID:', item);
                  return null;
                }
                
                // Use productId as key, fallback to index if needed
                const itemKey = productId || `item-${index}`;
                
                return (
                  <div key={itemKey} className="cart-item" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem',
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.1)',
                    marginBottom: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <Link to={`/product/${productId}`}>
                      <img
                        src={getImageUrl(item)}
                        alt={item.name}
                        className="cart-item-image"
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=Product';
                        }}
                      />
                    </Link>

                    <div className="cart-item-info" style={{ flex: 1 }}>
                      <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
                        <h4 className="cart-item-title" style={{
                          fontWeight: 600,
                          marginBottom: '0.25rem',
                          color: '#0F172A'
                        }}>{item.name}</h4>
                      </Link>
                      <p style={{ fontSize: '0.875rem', color: '#737373', margin: '0.25rem 0' }}>
                        Category: {item.category}
                      </p>
                      <div className="cart-item-price" style={{
                        background: 'linear-gradient(135deg, #4169E1, #0F172A)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 600
                      }}>
                        {formatPrice(item.price)} each
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="quantity-controls" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid #4169E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s',
                          color: '#4169E1'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#4169E1';
                          e.target.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FFFFFF';
                          e.target.style.color = '#4169E1';
                        }}
                      >
                        <FiMinus />
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, parseInt(e.target.value) || 1)}
                        className="quantity-input"
                        style={{
                          width: '60px',
                          textAlign: 'center',
                          border: '2px solid #4169E1',
                          borderRadius: '4px',
                          padding: '0.5rem',
                          background: '#FFFFFF'
                        }}
                      />

                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        style={{
                          width: '32px',
                          height: '32px',
                          border: '2px solid #4169E1',
                          background: '#FFFFFF',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s',
                          color: '#4169E1'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#4169E1';
                          e.target.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#FFFFFF';
                          e.target.style.color = '#4169E1';
                        }}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '0.5rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item)}
                        className="btn btn-danger btn-sm"
                        title="Remove item from cart"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })}
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                        Free shipping!
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

                {subtotal < 50 && (
                  <div className="alert alert-warning">
                    <small>Add {formatPrice(50 - subtotal)} more for free shipping!</small>
                  </div>
                )}
              </div>
            </div>
            <div className="card-footer">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <button
                  onClick={handleProceedToCheckout}
                  className="btn btn-primary btn-full btn-lg"
                >
                  {user ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
                <Link to="/products" className="btn btn-secondary btn-full">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
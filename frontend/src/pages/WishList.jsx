import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { formatPrice } from '../utils/helpers';

const Wishlist = () => {
  const { addToCart, removeFromWishlist, wishlist } = useCart();

  // Helper function to get consistent product ID
  const getProductId = (product) => {
    return product._id || product.id;
  };

  // Helper function to get correct image URL
  const getImageUrl = (product) => {
    if (!product.image) {
      return 'https://via.placeholder.com/300x200?text=Product+Image';
    }
    
    // If image is already a full URL, use it as is
    if (product.image.startsWith('http')) {
      return product.image;
    }
    
    // If it's just a filename, construct the full URL
    return `http://localhost:5000/uploads/${product.image}`;
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const handleMoveToCart = (product) => {
    const productId = getProductId(product);
    addToCart(product);
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 0', minHeight: '60vh' }}>
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <FiHeart size={64} color="var(--gray-400)" style={{ marginBottom: '2rem' }} />
          <h2 style={{ marginBottom: '1rem', color: 'var(--gray-600)' }}>Your wishlist is empty</h2>
          <p style={{ marginBottom: '2rem', color: 'var(--gray-500)' }}>
            Save items you love for later by clicking the heart icon on any product.
          </p>
          <Link to="/products" className="btn btn-primary btn-lg">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>My Wishlist</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="grid grid-3">
        {wishlist.map((product) => {
          const productId = getProductId(product);
          return (
            <div key={productId} className="card">
              <Link to={`/product/${productId}`}>
                <img
                  src={getImageUrl(product)}
                  alt={product.name}
                  style={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Product+Image';
                  }}
                />
              </Link>

              <div className="card-body">
                <Link to={`/product/${productId}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    marginBottom: '0.5rem',
                    color: 'var(--dark)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>
                </Link>

                <div style={{ marginBottom: '0.5rem' }}>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem' }}>
                    {product.category}
                  </span>
                </div>

                <div style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  color: 'var(--primary)', 
                  marginBottom: '1rem' 
                }}>
                  {formatPrice(product.price)}
                </div>

                {product.rating && (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    marginBottom: '1rem' 
                  }}>
                    <div style={{ display: 'flex', color: '#f59e0b' }}>
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < Math.floor(product.rating) ? '#f59e0b' : '#e5e7eb'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                      {product.rating} ({product.numreviews || 0} reviews)
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="btn btn-primary btn-full"
                    disabled={!product.stock}
                  >
                    <FiShoppingCart />
                    {product.stock ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-secondary"
                      disabled={!product.stock}
                      style={{ flex: 1 }}
                    >
                      Add to Cart
                    </button>
                    
                    <button
                      onClick={() => handleRemoveFromWishlist(productId)}
                      className="btn btn-danger"
                      title="Remove from wishlist"
                      style={{ minWidth: '44px' }}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center" style={{ marginTop: '3rem' }}>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
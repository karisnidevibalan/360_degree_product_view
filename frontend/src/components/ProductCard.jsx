import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiCheck } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product, showActions = true }) => {
  const { addToCart, wishlist, addToWishlist, removeFromWishlist, isInCart, getItemQuantityInCart } = useCart();

  // Check if product is in wishlist using context
  const isWishlisted = wishlist.some(item => item._id === product._id);
  
  // Check if product is in cart
  const inCart = isInCart(product._id);
  const cartQuantity = getItemQuantityInCart(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      addToCart(product);
      console.log('Product added to cart:', product.name);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (isWishlisted) {
        removeFromWishlist(product._id);
        console.log('Removed from wishlist:', product.name);
      } else {
        addToWishlist(product);
        console.log('Added to wishlist:', product.name);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={i} fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<FiStar key="half" fill="currentColor" style={{ opacity: 0.5 }} />);
    }

    for (let i = stars.length; i < 5; i++) {
      stars.push(<FiStar key={i} />);
    }

    return stars;
  };

  // Function to get the correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const cleanPath = imagePath.startsWith('uploads/') ? imagePath.substring(8) : imagePath;
    return `http://localhost:5000/uploads/${cleanPath}`;
  };

  // Create a luxury-themed fallback image
  const createFallbackImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 300, 250);
    
    // Gold border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 300, 250);
    
    // Gold text
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 16px Inter, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('No Image', 150, 125);
    
    return canvas.toDataURL();
  };

  return (
    <div 
      className="product-card"
      style={{
        background: '#FFFFFF',
        border: '1px solid #E5E5E5',
        borderRadius: '8px',
        boxShadow: '0 2px 8px 0 rgb(0 0 0 / 0.15)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        position: 'relative'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 10px 25px -5px rgb(0 0 0 / 0.25)';
        e.currentTarget.style.borderColor = '#D4AF37';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px 0 rgb(0 0 0 / 0.15)';
        e.currentTarget.style.borderColor = '#E5E5E5';
      }}
    >
      {/* Product Image Container */}
      <div 
        className="product-image-container" 
        style={{ 
          position: 'relative', 
          overflow: 'hidden',
          borderRadius: '8px 8px 0 0',
          transformOrigin: 'center center'
        }}
      >
        <Link to={`/product/${product._id}`}>
          <div style={{ 
            width: '100%',
            height: '250px',
            overflow: 'hidden',
            transition: 'transform 0.3s ease',
            transformOrigin: 'center center'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
          >
            {getImageUrl(product.image) ? (
              <img
                src={getImageUrl(product.image)}
                alt={product.name}
                className="product-image"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={(e) => {
                  console.error('Original image failed to load:', e.target.src);
                  if (!e.target.src.startsWith('data:')) {
                    e.target.src = createFallbackImage();
                  }
                }}
                onLoad={() => {
                  console.log('Image loaded successfully:', product.name);
                }}
              />
            ) : (
              <img
                src={createFallbackImage()}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
          </div>
        </Link>

        {/* In Cart Badge */}
        {inCart && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            backgroundColor: '#10B981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            zIndex: 2
          }}>
            <FiCheck size={12} />
            In Cart ({cartQuantity})
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div 
            style={{ 
              position: 'absolute', 
              top: inCart ? '40px' : '10px', 
              left: '10px',
              zIndex: 2,
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: '#DC143C',
              color: '#FFFFFF',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Out of Stock
          </div>
        )}

        {/* Wishlist Button */}
        {showActions && (
          <button
            onClick={handleWishlistToggle}
            className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: '50%',
              border: '2px solid',
              borderColor: isWishlisted ? '#DC143C' : '#000000',
              background: isWishlisted ? '#DC143C' : '#FFFFFF',
              color: isWishlisted ? '#FFFFFF' : '#000000',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              zIndex: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
            }}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            onMouseEnter={(e) => {
              if (isWishlisted) {
                e.target.style.background = '#B91C36';
                e.target.style.borderColor = '#B91C36';
              } else {
                e.target.style.background = '#000000';
                e.target.style.color = '#FFFFFF';
                e.target.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (isWishlisted) {
                e.target.style.background = '#DC143C';
                e.target.style.borderColor = '#DC143C';
              } else {
                e.target.style.background = '#FFFFFF';
                e.target.style.color = '#000000';
                e.target.style.borderColor = '#000000';
                e.target.style.transform = 'scale(1)';
              }
            }}
          >
            <FiHeart 
              size={18}
              fill={isWishlisted ? 'currentColor' : 'none'}
              style={{
                transition: 'all 0.2s ease'
              }}
            />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div 
        className="product-info" 
        style={{ 
          padding: '1.5rem',
          background: '#FFFFFF',
          borderRadius: '0 0 8px 8px'
        }}
      >
        <Link 
          to={`/product/${product._id}`} 
          style={{ 
            textDecoration: 'none', 
            color: 'inherit' 
          }}
        >
          <h3 
            className="product-title"
            style={{
              fontSize: '1.1rem',
              fontWeight: '600',
              marginBottom: '0.75rem',
              lineHeight: '1.4',
              color: '#000000',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#D4AF37';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#000000';
            }}
          >
            {product.name}
          </h3>
        </Link>

        <div 
          className="product-price"
          style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '0.75rem'
          }}
        >
          {formatPrice(product.price)}
        </div>

        {/* Rating */}
        {product.rating && (
          <div 
            className="product-rating"
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1rem'
            }}
          >
            <div style={{ display: 'flex', color: '#D4AF37', marginRight: '0.5rem' }}>
              {renderStars(product.rating)}
            </div>
            <span style={{ 
              fontSize: '0.875rem', 
              color: '#737373'
            }}>
              ({product.numreviews || 0} reviews)
            </span>
          </div>
        )}

        {/* Category */}
        <div style={{ marginBottom: '1rem' }}>
          <span 
            style={{ 
              display: 'inline-block',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #D4AF37, #FFD700)',
              color: '#000000',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            {product.category}
          </span>
        </div>

        {/* Add to Cart Button */}
        {showActions && (
          <button
            onClick={handleAddToCart}
            disabled={!product.stock}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '8px',
              border: product.stock ? 'none' : '2px solid #404040',
              background: product.stock 
                ? (inCart ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #D4AF37, #FFD700)')
                : '#6c757d',
              color: product.stock ? (inCart ? '#ffffff' : '#000000') : '#ffffff',
              cursor: product.stock ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              opacity: product.stock ? 1 : 0.6,
              fontWeight: '600',
              fontSize: '0.875rem',
              boxShadow: product.stock 
                ? (inCart ? '0 4px 15px rgba(16, 185, 129, 0.3)' : '0 4px 15px rgba(212, 175, 55, 0.3)')
                : 'none',
              transform: 'translateY(0)',
            }}
            title={inCart ? `Already in cart (${cartQuantity})` : 'Add to cart'}
            onMouseEnter={(e) => {
              if (product.stock) {
                if (inCart) {
                  e.target.style.background = 'linear-gradient(135deg, #047857, #065f46)';
                } else {
                  e.target.style.background = 'linear-gradient(135deg, #B8860B, #D4AF37)';
                  e.target.style.color = '#ffffff';
                }
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = inCart 
                  ? '0 8px 25px rgba(16, 185, 129, 0.4)'
                  : '0 8px 25px rgba(212, 175, 55, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock) {
                if (inCart) {
                  e.target.style.background = 'linear-gradient(135deg, #10B981, #059669)';
                } else {
                  e.target.style.background = 'linear-gradient(135deg, #D4AF37, #FFD700)';
                  e.target.style.color = '#000000';
                }
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = inCart 
                  ? '0 4px 15px rgba(16, 185, 129, 0.3)'
                  : '0 4px 15px rgba(212, 175, 55, 0.3)';
              }
            }}
          >
            <FiShoppingCart size={18} />
            {product.stock 
              ? (inCart ? `In Cart (${cartQuantity})` : 'Add to Cart')
              : 'Out of Stock'
            }
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
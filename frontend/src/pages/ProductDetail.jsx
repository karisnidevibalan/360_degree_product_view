import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiStar, FiMinus, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../context/cartContext';
import { api } from '../utils/api';
import {formatPrice} from '../utils/helpers'

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist, getItemQuantityInCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const [productData, reviewsData] = await Promise.all([
        api.getProduct(id),
        api.getProductReviews(id)
      ]);
      setProduct(productData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    // Show success message or update UI
  };

  const handleAddToWishlist = () => {
    addToWishlist(product);
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

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="text-center">
          <h2>Product not found</h2>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const currentCartQuantity = getItemQuantityInCart(product.id);
  const totalQuantityInCart = currentCartQuantity + quantity;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/products" className="btn btn-secondary">
          <FiArrowLeft />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        {/* Product Images */}
        <div>
          <div className="card" style={{ marginBottom: '1rem' }}>
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Create a simple fallback image using canvas
                const canvas = document.createElement('canvas');
                canvas.width = 400;
                canvas.height = 400;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#f0f0f0';
                ctx.fillRect(0, 0, 400, 400);
                ctx.fillStyle = '#666';
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Product Image', 200, 200);
                e.target.src = canvas.toDataURL();
              }}
            />
          </div>

          {/* Additional product images would go here */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[product.image, product.image, product.image].map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`card ${selectedImage === index ? 'border-primary' : ''}`}
                style={{
                  width: '80px',
                  height: '80px',
                  overflow: 'hidden',
                  border: selectedImage === index ? '2px solid var(--primary)' : '1px solid var(--gray-200)'
                }}
              >
                <img
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <div className="card">
            <div className="card-body">
              {/* Category */}
              <div style={{ marginBottom: '1rem' }}>
                <span className="badge badge-primary">
                  {product.category}
                </span>
              </div>

              {/* Product Name */}
              <h1 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: '600' }}>
                {product.name}
              </h1>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', color: '#f59e0b' }}>
                  {renderStars(product.rating)}
                </div>
                <span style={{ color: 'var(--gray-600)' }}>
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Stock Status */}
              <div style={{ marginBottom: '1.5rem' }}>
                {product.inStock ? (
                  <div style={{ color: 'var(--success)', fontWeight: '600' }}>
                    ✓ In Stock ({product.stock} available)
                  </div>
                ) : (
                  <div style={{ color: 'var(--danger)', fontWeight: '600' }}>
                    ✗ Out of Stock
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Description</h3>
                <p style={{ color: 'var(--gray-600)', lineHeight: '1.6' }}>
                  {product.description}
                </p>
              </div>

              {/* Quantity Selector */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Quantity</label>
                <div className="quantity-controls" style={{ marginTop: '0.5rem' }}>
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <FiMinus />
                  </button>
                  
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="quantity-input"
                  />
                  
                  <button
                    className="quantity-btn"
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                  >
                    <FiPlus />
                  </button>
                </div>
                
                {currentCartQuantity > 0 && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginTop: '0.5rem' }}>
                    {currentCartQuantity} already in cart
                    {totalQuantityInCart > product.stock && 
                      <span style={{ color: 'var(--danger)' }}>
                        {' '}(Total exceeds stock: {totalQuantityInCart}/{product.stock})
                      </span>
                    }
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary btn-lg"
                  disabled={!product.inStock || totalQuantityInCart > product.stock}
                  style={{ flex: 1 }}
                >
                  <FiShoppingCart />
                  Add to Cart
                </button>
                
                <button
                  onClick={handleAddToWishlist}
                  className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-secondary'} btn-lg`}
                  style={{ minWidth: '60px' }}
                >
                  <FiHeart fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Additional Info */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                  <div>🚚 Free shipping on orders over $50</div>
                  <div>📦 30-day hassle-free returns</div>
                  <div>🔒 Secure payment processing</div>
                  <div>📞 24/7 customer support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="card" style={{ marginTop: '3rem' }}>
        <div className="card-header">
          <h3>Customer Reviews ({reviews.length})</h3>
        </div>
        <div className="card-body">
          {reviews.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <FiStar size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--gray-500)' }}>
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((review) => (
                <div key={review._id} style={{
                  padding: '1rem',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--border-radius)',
                  backgroundColor: 'var(--gray-50)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.25rem' }}>
                        {Array.from({ length: 5 }, (_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                            style={i < review.rating ? { color: '#fbbf24', fill: 'currentColor' } : { color: '#d1d5db' }}
                          />
                        ))}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--gray-900)'
                      }}>
                        {review.user?.name || 'Anonymous'}
                      </div>
                      {review.isVerifiedPurchase && (
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--success)',
                          marginTop: '0.25rem'
                        }}>
                          ✓ Verified Purchase
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)'
                    }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--gray-700)',
                    lineHeight: '1.5'
                  }}>
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
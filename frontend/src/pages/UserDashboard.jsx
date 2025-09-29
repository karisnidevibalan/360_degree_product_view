import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingCart, FiHeart, FiPackage, FiEdit, FiEye, FiMessageSquare, FiStar } from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import {api} from "../utils/api";
import {formatPrice, formatDate, getStatusColor } from '../utils/helpers';
import Chatbot from '../components/Chatbot';

const UserDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { getCartItemsCount, wishlist } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [reviewableProducts, setReviewableProducts] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user]);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const [ordersData, reviewableData, reviewsData, profileDataResponse] = await Promise.all([
        api.getUserOrders(),
        api.getReviewableProducts(),
        api.getUserReviews(),
        api.getProfile()
      ]);
      setOrders(ordersData);
      setReviewableProducts(reviewableData);
      setUserReviews(reviewsData);

      const profileSource = profileDataResponse?.data?.user || profileDataResponse?.user;
      if (profileSource) {
        setProfileData({
          name: profileSource.name || '',
          email: profileSource.email || '',
          phone: profileSource.phone || '',
          address: profileSource.address || ''
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const result = await updateProfile(profileData);
      if (result.success) {
        setEditing(false);
        setProfileData({
          name: result.user.name || '',
          email: result.user.email || '',
          phone: result.user.phone || '',
          address: result.user.address || ''
        });
        setUser(result.user);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createReview({
        productId: reviewModal.product._id,
        orderId: reviewModal.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      alert('Review submitted successfully!');
      setReviewModal(null);
      setReviewForm({ rating: 5, comment: '' });

      // Reload user data to update reviewable products and reviews
      loadUserData();
    } catch (error) {
      alert('Failed to submit review: ' + error.message);
    }
  };

  const handleReviewFormChange = (e) => {
    const { name, value } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openReviewModal = (product, orderId) => {
    setReviewModal({ product, orderId });
    setReviewForm({ rating: 5, comment: '' });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <AiFillStar
          key={i}
          className="text-yellow-400"
          size={16}
        />
      ) : (
        <AiOutlineStar
          key={i}
          className="text-gray-300"
          size={16}
        />
      )
    ));
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '2rem' }}>My Account</h1>

      {/* Overview Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiShoppingCart size={32} color="var(--primary)" />
          </div>
          <span className="stat-number">{orders.length}</span>
          <span className="stat-label">Total Orders</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiPackage size={32} color="var(--success)" />
          </div>
          <span className="stat-number">{getCartItemsCount()}</span>
          <span className="stat-label">Items in Cart</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiHeart size={32} color="var(--danger)" />
          </div>
          <span className="stat-number">{wishlist.length}</span>
          <span className="stat-label">Wishlist Items</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiUser size={32} color="var(--accent)" />
          </div>
          <span className="stat-number">{formatPrice(totalSpent)}</span>
          <span className="stat-label">Total Spent</span>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <FiStar size={32} color="var(--warning)" />
          </div>
          <span className="stat-number">{userReviews.length}</span>
          <span className="stat-label">Reviews Written</span>
        </div>
      </div>

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Profile Information */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Profile Information</h3>
              <button
                onClick={() => {
                  if (editing) {
                    setProfileData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      address: user?.address || ''
                    });
                  }
                  setEditing(!editing);
                }}
                className="btn btn-sm btn-secondary"
              >
                <FiEdit />
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
          <div className="card-body">
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={profileData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={profileData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={profileData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea
                    name="address"
                    className="form-textarea"
                    rows="3"
                    value={profileData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full">
                  Save Changes
                </button>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Name
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.name || 'Not provided'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Email
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.email}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Phone
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.phone || 'Not provided'}</div>
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--gray-600)' }}>
                    Address
                  </label>
                  <div style={{ marginTop: '0.25rem' }}>{user?.address || 'Not provided'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link to="/cart" className="btn btn-primary">
                <FiShoppingCart />
                View Cart ({getCartItemsCount()} items)
              </Link>
              
              <Link to="/wishlist" className="btn btn-secondary">
                <FiHeart />
                My Wishlist ({wishlist.length} items)
              </Link>
              
              <Link to="/products" className="btn btn-success">
                <FiPackage />
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order History */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Order History</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <FiPackage size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
                You haven't placed any orders yet.
              </p>
              <Link to="/products" className="btn btn-primary">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{formatDate(order.date)}</td>
                      <td>{order.items.length} item(s)</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary">
                          <FiEye />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Products to Review */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>Products to Review</h3>
        </div>
        <div className="card-body">
          {reviewableProducts.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <FiMessageSquare size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
                No products to review at the moment. Reviews will appear here after your orders are delivered.
              </p>
            </div>
          ) : (
            <div className="grid grid-3" style={{ gap: '1rem' }}>
              {reviewableProducts.map((item) => (
                <div key={`${item.orderId}-${item.product._id}`} className="card">
                  <div className="card-body" style={{ padding: '1rem' }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: 'var(--border-radius)',
                        marginBottom: '0.75rem'
                      }}
                    />
                    <h4 style={{
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      marginBottom: '0.5rem'
                    }}>{item.product.name}</h4>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-600)',
                      marginBottom: '0.5rem'
                    }}>
                      Ordered on {formatDate(item.orderDate)}
                    </p>
                    <p style={{
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      marginBottom: '0.75rem'
                    }}>
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                    <button
                      onClick={() => openReviewModal(item.product, item.orderId)}
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                    >
                      <FiStar style={{ display: 'inline', marginRight: '0.25rem' }} />
                      Write Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* My Reviews */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">
          <h3>My Reviews</h3>
        </div>
        <div className="card-body">
          {userReviews.length === 0 ? (
            <div className="text-center" style={{ padding: '2rem 0' }}>
              <FiStar size={48} color="var(--gray-400)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
                You haven't written any reviews yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {userReviews.map((review) => (
                <div key={review._id} style={{
                  background: 'var(--white)',
                  borderRadius: 'var(--border-radius)',
                  padding: '1rem',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--gray-200)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={review.product.image}
                        alt={review.product.name}
                        style={{
                          width: '3rem',
                          height: '3rem',
                          objectFit: 'cover',
                          borderRadius: 'var(--border-radius)'
                        }}
                      />
                      <div>
                        <h4 style={{
                          fontSize: '0.875rem',
                          fontWeight: '600'
                        }}>{review.product.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {renderStars(review.rating)}
                        </div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      color: 'var(--gray-500)'
                    }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--gray-700)'
                  }}>{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--dark)',
              color: 'var(--light)',
              borderRadius: 'var(--border-radius)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 className="modal-title">Write a Review</h3>
                <button
                  onClick={() => setReviewModal(null)}
                  className="modal-close"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="modal-content-inner">
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={reviewModal.product.image}
                    alt={reviewModal.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-semibold">{reviewModal.product.name}</h4>
                    <p className="text-sm text-gray-600">
                      Share your experience with this product
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    name="rating"
                    value={reviewForm.rating}
                    onChange={handleReviewFormChange}
                    className="form-input"
                    required
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                    <option value={4}>⭐⭐⭐⭐ Very Good</option>
                    <option value={3}>⭐⭐⭐ Good</option>
                    <option value={2}>⭐⭐ Fair</option>
                    <option value={1}>⭐ Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Your Review</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewFormChange}
                    className="form-textarea"
                    rows="4"
                    placeholder="Tell others about your experience with this product..."
                    required
                    maxLength="500"
                  />
                  <small className="text-gray-500">
                    {reviewForm.comment.length}/500 characters
                  </small>
                </div>

                <div className="flex space-x-3">
                  <button type="submit" className="btn btn-primary">
                    Submit Review
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewModal(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiShoppingCart, FiHeart, FiPackage, FiEdit, FiEye } from 'react-icons/fi';
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
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  useEffect(() => {
    loadUserOrders();
  }, []);

  const loadUserOrders = async () => {
    try {
      const data = await api.getOrders({ userId: user.id });
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
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

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default UserDashboard;
import React, { useState, useEffect } from 'react';
import { FiEye, FiFilter, FiRefreshCw, FiPackage, FiTruck, FiCheckCircle, FiXCircle, FiAlertCircle } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice, formatDate, getStatusColor } from '../utils/helpers';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const loadOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
      console.log('Loading orders with filters:', filters);
      
      const data = await api.getOrders(filters);
      console.log('Received orders:', data);
      
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError(error.message || 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    if (window.confirm(`Are you sure you want to change the order status to "${newStatus}"?`)) {
      try {
        setError(null);
        await api.updateOrderStatus(orderId, newStatus);
        await loadOrders(true);
        alert('Order status updated successfully!');
      } catch (error) {
        console.error('Error updating order status:', error);
        setError(error.message || 'Error updating order status. Please try again.');
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const handleRefresh = () => {
    loadOrders(true);
  };

  const getStatusOptions = (currentStatus) => {
    const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    return statuses.filter(status => status !== currentStatus);
  };

  const getOrderStats = () => {
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0)
    };
  };

  const stats = getOrderStats();

  if (loading && !refreshing) {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <div className="loading">
            <div className="spinner"></div>
            <span style={{ marginLeft: '1rem' }}>Loading orders...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Order Management</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiRefreshCw className={refreshing ? 'loading' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiFilter />
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
          <FiAlertCircle style={{ marginRight: '0.5rem', flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{error}</span>
          <button
            onClick={() => setError(null)}
            className="btn btn-sm btn-link"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiPackage className="stat-icon" />
            <div>
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending Orders</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiTruck className="stat-icon" />
            <div>
              <span className="stat-number">{stats.shipped}</span>
              <span className="stat-label">Shipped Orders</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <FiCheckCircle className="stat-icon" />
            <div>
              <span className="stat-number">{stats.delivered}</span>
              <span className="stat-label">Delivered Orders</span>
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="stat-icon">$</span>
            <div>
              <span className="stat-number">{formatPrice(stats.totalRevenue)}</span>
              <span className="stat-label">Total Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <FiPackage size={48} color="#ccc" />
              <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>No orders found</h3>
              <p style={{ color: 'var(--gray-500)' }}>
                {statusFilter !== 'all' 
                  ? `No orders with status "${statusFilter}" were found.`
                  : 'There are no orders in the system yet.'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id || order._id}>
                      <td>#{(order.id || order._id)?.toString().slice(-8)}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>
                          {order.userName || order.user?.name || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                          {order.userEmail || order.user?.email || 'No email'}
                        </div>
                      </td>
                      <td>{formatDate(order.date || order.createdAt)}</td>
                      <td>{order.items?.length || order.products?.length || 0} item(s)</td>
                      <td>{formatPrice(order.total || 0)}</td>
                      <td>
                        <span className={`badge badge-${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="btn btn-sm btn-secondary"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', minWidth: 'auto' }}
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id || order._id, e.target.value)}
                          >
                            <option value={order.status}>Current: {order.status}</option>
                            {getStatusOptions(order.status).map(status => (
                              <option key={status} value={status}>Change to: {status}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">
                Order #{(selectedOrder.id || selectedOrder._id)?.toString().slice(-8)} Details
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="grid grid-2" style={{ marginBottom: '2rem' }}>
                <div>
                  <h4>Customer Information</h4>
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Name:</strong> {selectedOrder.userName || selectedOrder.user?.name || 'Unknown User'}<br/>
                    <strong>Email:</strong> {selectedOrder.userEmail || selectedOrder.user?.email || 'No email'}<br/>
                    <strong>Order Date:</strong> {formatDate(selectedOrder.date || selectedOrder.createdAt)}<br/>
                    <strong>Status:</strong> <span className={`badge badge-${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h4>Order Summary</h4>
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Items:</strong> {selectedOrder.items?.length || selectedOrder.products?.length || 0}<br/>
                    <strong>Total:</strong> {formatPrice(selectedOrder.total || 0)}<br/>
                    {selectedOrder.shippingAddress && (
                      <>
                        <strong>Shipping Address:</strong><br/>
                        <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                          {selectedOrder.shippingAddress.address}<br/>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}<br/>
                          {selectedOrder.shippingAddress.country}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <h4>Order Items</h4>
              <div style={{ marginTop: '1rem' }}>
                {(selectedOrder.items || selectedOrder.products || []).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      backgroundColor: 'var(--gray-50)',
                      borderRadius: 'var(--border-radius)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <strong>{item.name || item.product?.name || 'Unknown Item'}</strong><br/>
                      <span style={{ color: 'var(--gray-600)', fontSize: '0.875rem' }}>
                        Quantity: {item.quantity} × {formatPrice(item.price || 0)}
                      </span>
                      {item.image && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img 
                            src={item.image} 
                            alt={item.name}
                            style={{ 
                              width: '48px', 
                              height: '48px', 
                              objectFit: 'cover', 
                              borderRadius: '4px' 
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                      {formatPrice((item.price || 0) * (item.quantity || 0))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Order Total */}
              <div style={{ 
                marginTop: '1.5rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid var(--gray-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '600' }}>Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {formatPrice(selectedOrder.total || 0)}
                </span>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  const newStatus = prompt('Enter new status (pending, shipped, delivered, cancelled):');
                  if (newStatus && ['pending', 'shipped', 'delivered', 'cancelled'].includes(newStatus)) {
                    handleStatusUpdate(selectedOrder.id || selectedOrder._id, newStatus);
                    setShowModal(false);
                  }
                }}
                className="btn btn-primary"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
import React, { useState, useEffect } from 'react';
import { FiUsers, FiEye, FiEdit, FiSearch, FiAlertCircle } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice, formatDate } from "../utils/helpers";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch users from backend
      const userData = await api.getUsers();
      console.log('Loaded users:', userData);
      
      // Transform backend user data to match frontend expectations
      const transformedUsers = userData.map(user => ({
        id: user._id || user.id,
        name: user.name || 'Unknown',
        email: user.email || 'No email',
        joinDate: user.createdAt || user.joinDate || new Date().toISOString(),
        orders: user.orders || 0,
        totalSpent: user.totalSpent || 0,
        status: user.status || (user.role === 'admin' ? 'active' : 'active'), // Default to active
        role: user.role || 'user'
      }));
      
      setUsers(transformedUsers);
      
    } catch (error) {
      console.error('Error loading users:', error);
      setError(error.message);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, newStatus) => {
    try {
      setUpdateLoading(true);
      setError(null);
      
      // Update user with the new status
      await api.updateUser(userId, { status: newStatus });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
      
      // Update selected user if it's the one being updated
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => ({ ...prev, status: newStatus }));
      }
      
      alert('User status updated successfully!');
      
    } catch (error) {
      console.error('Error updating user status:', error);
      setError(`Error updating user status: ${error.message}`);
      alert(`Error updating user status: ${error.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalRevenue = users.reduce((sum, user) => sum + (user.totalSpent || 0), 0);
  const totalOrders = users.reduce((sum, user) => sum + (user.orders || 0), 0);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>User Management</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
          Total Users: {totalUsers}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#dc2626'
        }}>
          <FiAlertCircle />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              fontSize: '1.25rem',
              cursor: 'pointer',
              color: '#dc2626'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <span className="stat-number">{totalUsers}</span>
          <span className="stat-label">Total Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{activeUsers}</span>
          <span className="stat-label">Active Users</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{totalOrders}</span>
          <span className="stat-label">Total Orders</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{formatPrice(totalRevenue)}</span>
          <span className="stat-label">Total Revenue</span>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div style={{ position: 'relative', maxWidth: '400px' }}>
            <input
              type="text"
              placeholder="Search users..."
              className="form-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
            <FiSearch 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--gray-400)'
              }} 
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          {filteredUsers.length === 0 && !loading ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--gray-500)'
            }}>
              {searchQuery ? 'No users found matching your search.' : 'No users available.'}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Join Date</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div
                            style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--primary)',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '600'
                            }}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>{user.name}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>{formatDate(user.joinDate)}</td>
                      <td>{user.orders}</td>
                      <td>{formatPrice(user.totalSpent)}</td>
                      <td>
                        <span className={`badge ${user.status === 'active' ? 'badge-success' : user.status === 'banned' ? 'badge-danger' : 'badge-warning'}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            onClick={() => handleViewUser(user)}
                            className="btn btn-sm btn-secondary"
                            title="View Details"
                          >
                            <FiEye />
                          </button>
                          <select
                            className="form-select"
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem', minWidth: '100px' }}
                            value={user.status}
                            onChange={(e) => handleUserStatusUpdate(user.id, e.target.value)}
                            disabled={updateLoading}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="banned">Banned</option>
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

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3 className="modal-title">User Details - {selectedUser.name}</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="grid grid-2" style={{ gap: '2rem' }}>
                <div>
                  <h4>Personal Information</h4>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Name:</strong> {selectedUser.name}</div>
                    <div><strong>Email:</strong> {selectedUser.email}</div>
                    <div><strong>User ID:</strong> {selectedUser.id}</div>
                    <div><strong>Role:</strong> {selectedUser.role}</div>
                    <div>
                      <strong>Status:</strong>{' '}
                      <span className={`badge ${selectedUser.status === 'active' ? 'badge-success' : selectedUser.status === 'banned' ? 'badge-danger' : 'badge-warning'}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div><strong>Join Date:</strong> {formatDate(selectedUser.joinDate)}</div>
                  </div>
                </div>

                <div>
                  <h4>Activity Summary</h4>
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div><strong>Total Orders:</strong> {selectedUser.orders}</div>
                    <div><strong>Total Spent:</strong> {formatPrice(selectedUser.totalSpent)}</div>
                    <div><strong>Average Order Value:</strong> {formatPrice(selectedUser.totalSpent / Math.max(selectedUser.orders, 1))}</div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <h5>Quick Stats</h5>
                    <div className="stats-grid" style={{ marginTop: '1rem', gridTemplateColumns: '1fr' }}>
                      <div className="stat-card">
                        <span className="stat-number">{selectedUser.orders}</span>
                        <span className="stat-label">Orders Placed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--gray-50)', borderRadius: 'var(--border-radius)' }}>
                <h5>Account Actions</h5>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-sm btn-primary">Send Message</button>
                  <button className="btn btn-sm btn-warning">Reset Password</button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleUserStatusUpdate(selectedUser.id, selectedUser.status === 'active' ? 'banned' : 'active')}
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : (selectedUser.status === 'active' ? 'Ban User' : 'Activate User')}
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
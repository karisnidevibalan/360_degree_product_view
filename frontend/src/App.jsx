import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/authContext';
import { CartProvider, useCart } from './context/cartContext';
import { NotificationProvider, useNotification } from './context/notificationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationToast from './components/NotificationToast';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import UserManagement from './pages/UserManagement';
import Cart from './components/Cart';
import Wishlist from './pages/WishList';
import ProductListing from './pages/ProductListing';

// Role selection component
const RoleSelector = ({ onRoleSelect }) => {
  return (
    <div className="role-selector">
      <div className="container">
        <div className="hero">
          <h1>Welcome to E-Shop</h1>
          <p>Please select your role to continue</p>
          <div className="flex justify-center gap-4 mt-4">
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => onRoleSelect('user')}
            >
              Continue as User
            </button>
            <button 
              className="btn btn-secondary btn-lg"
              onClick={() => onRoleSelect('admin')}
            >
              Continue as Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Updated ProtectedRoute Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, userRole, loading, token } = useAuth();
  
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Fixed Admin Layout Component
const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li><Link to="/admin">Dashboard</Link></li>
            <li><Link to="/admin/products">Products</Link></li>
            <li><Link to="/admin/orders">Orders</Link></li>
            <li><Link to="/admin/users">Users</Link></li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

// Component to connect cart context with notification context
const NotificationConnector = () => {
  const { registerNotificationCallback } = useCart();
  const notificationMethods = useNotification();

  useEffect(() => {
    registerNotificationCallback(notificationMethods);
  }, [registerNotificationCallback, notificationMethods]);

  return null;
};

function App() {
  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    // Check if role was previously selected
    const savedRole = localStorage.getItem('userRole');
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
  };

  if (!selectedRole) {
    return <RoleSelector onRoleSelect={handleRoleSelect} />;
  }

  return (
    <AuthProvider initialRole={selectedRole}>
      <NotificationProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppContent selectedRole={selectedRole} />
            </div>
          </Router>
        </CartProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent({ selectedRole }) {
  const { user, userRole } = useAuth();

  return (
    <>
      {/* Connect notification system with cart */}
      <NotificationConnector />
      
      {userRole !== 'admin' && <Header />}
      
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* User Routes */}
        {userRole === 'user' && (
          <>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
          </>
        )}
        
        {/* Admin Routes */}
        {userRole === 'admin' && (
          <>
            <Route 
              path="/" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <ProductManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/orders" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <OrderManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout>
                    <UserManagement />
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
          </>
        )}
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {userRole !== 'admin' && <Footer />}
      
      {/* Notification Toast Component */}
      <NotificationToast />
    </>
  );
}

export default App;


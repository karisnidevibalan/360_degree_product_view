import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useCart } from '../context/cartContext';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiSearch, FiLogOut } from 'react-icons/fi';

const Header = () => {
  const { user, logout } = useAuth();
  const { getCartItemsCount, wishlist } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-content">
          {/* Logo */}
          <Link to="/" className="navbar-brand">
            Starlit & Co
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center" style={{ flex: 1, maxWidth: '400px', margin: '0 2rem' }}>
            <div className="flex w-full">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              >
                <FiSearch />
              </button>
            </div>
          </form>

          {/* Navigation */}
          <nav className="navbar-nav">
            <Link to="/" className={isActive('/') ? 'active' : ''}>
              Home
            </Link>
            <Link to="/products" className={isActive('/products') ? 'active' : ''}>
              Products
            </Link>
          </nav>

          {/* Actions */}
          <div className="navbar-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="btn btn-secondary" style={{ position: 'relative' }}>
              <FiHeart />
              {wishlist.length > 0 && (
                <span 
                  className="badge badge-danger" 
                  style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="btn btn-secondary" style={{ position: 'relative' }}>
              <FiShoppingCart />
              {getCartItemsCount() > 0 && (
                <span 
                  className="badge badge-primary" 
                  style={{ 
                    position: 'absolute', 
                    top: '-8px', 
                    right: '-8px',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <FiUser />
                  <span>{user.name}</span>
                </button>
                
                {showUserMenu && (
                  <div 
                    className="card" 
                    style={{ 
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      minWidth: '200px',
                      zIndex: 1000,
                      marginTop: '0.5rem'
                    }}
                  >
                    <div className="card-body" style={{ padding: '1rem' }}>
                      <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--gray-200)' }}>
                        <div style={{ fontWeight: '600' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>{user.email}</div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <Link 
                          to="/dashboard" 
                          className="btn btn-secondary btn-sm"
                          onClick={() => setShowUserMenu(false)}
                          style={{ justifyContent: 'flex-start' }}
                        >
                          <FiUser />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="btn btn-danger btn-sm"
                          style={{ justifyContent: 'flex-start' }}
                        >
                          <FiLogOut />
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Link to="/login" className="btn btn-secondary">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search (visible only on mobile) */}
      <div className="container" style={{ display: 'none' }}>
        <form onSubmit={handleSearch} className="flex" style={{ padding: '1rem 0' }}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ flex: 1, marginRight: '0.5rem' }}
          />
          <button type="submit" className="btn btn-primary">
            <FiSearch />
          </button>
        </form>
      </div>

      {/* Click outside to close user menu */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
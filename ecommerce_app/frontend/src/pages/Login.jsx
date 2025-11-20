import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import axios from "axios";
const Login = () => {
  const { login, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password, userRole);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem' }}>
      <div className="card">
        <div className="card-body">
          <div className="text-center" style={{ marginBottom: '2rem' }}>
            <h1>Welcome Back</h1>
            <p style={{ color: 'var(--gray-600)' }}>
              Sign in to your {userRole} account
            </p>
          </div>

          {/* Demo Credentials Info */}
          <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
            <h4>Demo Credentials:</h4>
            <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
              <strong>User:</strong> user@example.com / user123<br/>
              <strong>Admin:</strong> admin@example.com / admin123
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <FiMail 
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

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                />
                <FiLock 
                  style={{ 
                    position: 'absolute', 
                    left: '0.75rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: 'var(--gray-400)'
                  }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--gray-400)'
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <input type="checkbox" />
                Remember me
              </label>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <p style={{ color: 'var(--gray-600)' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '500' }}>
                Sign up here
              </Link>
            </p>
          </div>

          {/* Role Switch */}
          <div className="text-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>
              Want to switch to {userRole === 'user' ? 'admin' : 'user'} mode?{' '}
              <button
                onClick={() => {
                  localStorage.removeItem('userRole');
                  window.location.reload();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Switch Role
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
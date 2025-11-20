import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3>E-Shop</h3>
            <p>Your trusted online shopping destination for quality products at great prices.</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <a href="#" aria-label="Facebook">
                <FiFacebook size={20} />
              </a>
              <a href="#" aria-label="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="#" aria-label="Instagram">
                <FiInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/dashboard">Account</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h3>Categories</h3>
            <ul>
              <li><Link to="/products?category=electronics">Electronics</Link></li>
              <li><Link to="/products?category=clothing">Clothing</Link></li>
              <li><Link to="/products?category=home">Home & Garden</Link></li>
              <li><Link to="/products?category=sports">Sports</Link></li>
              <li><Link to="/products?category=fashion">Fashion</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMail size={16} />
                <span>support@eshop.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiPhone size={16} />
                <span>1-800-123-4567</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiMapPin size={16} />
                <span>123 Shopping St, City, State 12345</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 E-Shop. All rights reserved. | Built with React</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
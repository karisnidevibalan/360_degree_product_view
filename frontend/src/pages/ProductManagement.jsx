import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { api } from '../utils/api';
import { formatPrice } from '../utils/helpers';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    image: '',
    stock: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      showNotification('error', 'Failed to load products. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { name, price, category, description, image, stock } = formData;
    
    if (!name.trim()) return 'Product name is required';
    if (!price || parseFloat(price) < 0) return 'Valid price is required';
    if (!category) return 'Category is required';
    if (!description.trim()) return 'Description is required';
    if (!image.trim()) return 'Image URL is required';
    if (!stock || parseInt(stock) < 0) return 'Valid stock quantity is required';
    
    // Basic URL validation
    try {
      new URL(image);
    } catch {
      return 'Please enter a valid image URL';
    }
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      showNotification('error', validationError);
      return;
    }

    setSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, productData);
        showNotification('success', 'Product updated successfully!');
      } else {
        await api.addProduct(productData);
        showNotification('success', 'Product added successfully!');
      }

      await loadProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      showNotification('error', error.message || 'Failed to save product. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      image: product.image,
      stock: product.stock.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (productId, productName) => {
    if (window.confirm(`Are you sure you want to delete "${productName}"?`)) {
      try {
        await api.deleteProduct(productId);
        await loadProducts();
        showNotification('success', 'Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('error', 'Failed to delete product. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      image: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [
    'electronics',
    'clothing', 
    'books',
    'home',
    'sports',
    'other'
  ];

  return (
    <div className="container">
      {/* Notification */}
      {notification.show && (
        <div 
          className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'}`}
          style={{ 
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '300px'
          }}
        >
          {notification.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          {notification.message}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Product Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <FiPlus />
          Add Product
        </button>
      </div>

      {/* Search and Stats */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search products..."
                className="form-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.5rem', minWidth: '300px' }}
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
            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
              Showing {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center" style={{ padding: '3rem 0' }}>
              <div style={{ color: 'var(--gray-500)', fontSize: '1.125rem' }}>
                {searchQuery ? 'No products found matching your search.' : 'No products available. Add your first product!'}
              </div>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product._id || product.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: 'var(--border-radius)'
                            }}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/50x50?text=Product';
                            }}
                          />
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                              {product.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>
                              ID: {product._id || product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-secondary">
                          {product.category}
                        </span>
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {formatPrice(product.price)}
                      </td>
                      <td>
                        <span style={{ 
                          color: product.stock < 10 ? 'var(--danger)' : 'var(--gray-700)',
                          fontWeight: product.stock < 10 ? '600' : 'normal'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${product.stock > 0 ? 'badge-success' : 'badge-danger'}`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleEdit(product)}
                            className="btn btn-sm btn-secondary"
                            title="Edit Product"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id || product.id, product.name)}
                            className="btn btn-sm btn-danger"
                            title="Delete Product"
                          >
                            <FiTrash2 />
                          </button>
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

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={resetForm}
                className="modal-close"
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-input"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input
                    type="number"
                    name="stock"
                    className="form-input"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL *</label>
                <input
                  type="url"
                  name="image"
                  className="form-input"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                />
                {formData.image && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--gray-200)'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting 
                  ? (editingProduct ? 'Updating...' : 'Adding...') 
                  : (editingProduct ? 'Update Product' : 'Add Product')
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
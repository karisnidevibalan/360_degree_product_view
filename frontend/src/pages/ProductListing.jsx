import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from "../utils/api";

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || 'all',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || '',
    search: searchParams.get('search') || ''
  });

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null); // Reset error state
    try {
      console.log('Loading products with filters:', filters); // Debug log
      const data = await api.getProducts(filters);
      console.log('Products received:', data); // Debug log
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Expected array but received:', typeof data, data);
        setProducts([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setError(`Failed to load products: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== 'all') params.set(k, v);
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: '',
      search: ''
    };
    setFilters(clearedFilters);
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Products</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: 'var(--gray-600)' }}>
            {loading ? 'Loading...' : `${products.length} products found`}
          </span>
        </div>
      </div>


      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee',
          color: '#c33',
          padding: '1rem',
          borderRadius: '4px',
          marginBottom: '1rem',
          border: '1px solid #fcc'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={loadProducts} 
            style={{ 
              marginLeft: '1rem', 
              padding: '0.25rem 0.5rem',
              background: '#c33',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="filters">
        <div className="filters-row">
          {/* Search */}
          <div className="filter-group">
            <label className="form-label">Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="filter-group">
            <label className="form-label">Category</label>
            <select
              className="form-select"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
              <option value="sports">Sports</option>
              <option value="fashion">Fashion</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <label className="form-label">Min Price</label>
            <input
              type="number"
              className="form-input"
              placeholder="$0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label className="form-label">Max Price</label>
            <input
              type="number"
              className="form-input"
              placeholder="₹1000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="form-label">Sort By</label>
            <select
              className="form-select"
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            >
              <option value="">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div className="filter-group">
            <label className="form-label">&nbsp;</label>
            <button
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : error ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <h3 style={{ color: '#c33', marginBottom: '1rem' }}>Unable to load products</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
            {error}
          </p>
          <button onClick={loadProducts} className="btn btn-primary">
            Try Again
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center" style={{ padding: '4rem 0' }}>
          <h3 style={{ color: 'var(--gray-600)', marginBottom: '1rem' }}>No products found</h3>
          <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>
            Try adjusting your filters or search terms
          </p>
          <button onClick={clearFilters} className="btn btn-primary">
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListing;
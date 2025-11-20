import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiTruck, FiShield, FiHeadphones } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import { api } from '../utils/api';
import Carousel from '../components/Carousel';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      try {
        const products = await api.getProducts();
        
        // Get top-rated products as featured
        const featured = [...products].sort((a, b) => b.rating - a.rating).slice(0, 8);
        setFeaturedProducts(featured);
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedProducts();
  }, []);

  const categories = [
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=300&h=200&fit=crop',
      link: '/products?category=electronics'
    },
    {
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop',
      link: '/products?category=clothing'
    },
    {
      name: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300&h=200&fit=crop',
      link: '/products?category=home'
    },
    {
      name: 'Sports',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
      link: '/products?category=sports'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Hero Carousel */}
      <Carousel
        slides={[
          {
            image:
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1600&auto=format&fit=crop',
            badge: 'Limited Time',
            title: 'Premium Gadgets, Exclusive Prices',
            subtitle: 'Upgrade your setup with top-rated electronics and accessories.',
            primaryCta: { href: '/products?category=electronics', label: 'Shop Electronics' },
            secondaryCta: { href: '/products?sortBy=rating', label: 'Best Sellers' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
            badge: 'New Season',
            title: 'Style Redefined',
            subtitle: 'Discover curated fashion picks for every occasion.',
            primaryCta: { href: '/products?category=clothing', label: 'Shop Clothing' },
            secondaryCta: { href: '/products', label: 'Explore All' },
          },
          {
            image:
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1600&auto=format&fit=crop',
            badge: 'Editor’s Pick',
            title: 'Home & Living Essentials',
            subtitle: 'Handpicked decor to make your space truly yours.',
            primaryCta: { href: '/products?category=home', label: 'Shop Home' },
            secondaryCta: { href: '/products?sortBy=rating', label: 'Top Rated' },
          },
        ]}
      />

      {/* Features */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--gray-50)' }} className="py-16 bg-slate-50/60">
        <div className="container">
          <div className="grid grid-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center card p-6 shadow-sm hover:shadow-lg transition-shadow rounded-xl">
              <FiTruck size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 className="text-lg font-semibold">Free Shipping</h3>
              <p className="text-slate-600">Free shipping on orders over $50</p>
            </div>
            <div className="text-center card p-6 shadow-sm hover:shadow-lg transition-shadow rounded-xl">
              <FiShield size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 className="text-lg font-semibold">Secure Payment</h3>
              <p className="text-slate-600">100% secure payment processing</p>
            </div>
            <div className="text-center card p-6 shadow-sm hover:shadow-lg transition-shadow rounded-xl">
              <FiHeadphones size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 className="text-lg font-semibold">24/7 Support</h3>
              <p className="text-slate-600">Round-the-clock customer support</p>
            </div>
            <div className="text-center card p-6 shadow-sm hover:shadow-lg transition-shadow rounded-xl">
              <FiShoppingBag size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
              <h3 className="text-lg font-semibold">Easy Returns</h3>
              <p className="text-slate-600">30-day hassle-free returns</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '4rem 0' }} className="py-16">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-slate-600 mt-2">Find exactly what you're looking for</p>
          </div>

          <div className="grid grid-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="card group overflow-hidden rounded-xl hover:border-primary transition-colors"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x200?text=Category';
                  }}
                />
                <div className="card-body text-center p-4">
                  <h3 className="text-base font-semibold">{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--gray-50)' }} className="py-16 bg-slate-50">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '3rem' }}>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Featured Products</h2>
            <p className="text-slate-600 mt-2">Our top-rated products loved by customers</p>
          </div>

          {loading ? (
            <div className="loading flex justify-center">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/products" className="btn btn-primary btn-lg inline-flex items-center">
              Explore All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ padding: '4rem 0', backgroundColor: 'var(--primary)', color: 'white' }} className="py-16 bg-[var(--primary)] text-white">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Stay Updated</h2>
          <p style={{ marginBottom: '2rem', opacity: 0.9 }} className="mt-2 opacity-90">
            Subscribe to our newsletter for the latest deals and product updates
          </p>
          <form
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem', maxWidth: '400px', margin: '0 auto' }}
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input rounded-md"
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-secondary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
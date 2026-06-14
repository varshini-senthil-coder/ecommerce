import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts({ sort: 'rating_desc', limit: 8 })
      .then((res) => setFeatured(res.items || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="hero">
        <div>
          <h1>
            Everything you need, <span className="accent">delivered fast.</span>
          </h1>
          <p>
            Browse thousands of products across electronics, fashion, and home essentials —
            with smart search, filters, and a wishlist that remembers what you love.
          </p>
        </div>
        <Link to="/products" className="btn btn-primary">
          Shop All Products
        </Link>
      </section>

      <h2 className="page-title" style={{ fontSize: '1.4rem' }}>
        Top Rated Picks
      </h2>

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : (
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

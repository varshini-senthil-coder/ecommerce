import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchCategories } from '../services/api';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <header className="header">
      <div className="container header-top">
        <Link to="/" className="brand">
          Click<span className="brand-mark">Cart</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products, brands and categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="header-actions">
          {user ? (
            <button onClick={logout}>
              <span>👤 {user.name.split(' ')[0]}</span>
              <span>Logout</span>
            </button>
          ) : (
            <Link to="/login">
              <span>👤</span>
              <span>Sign In</span>
            </Link>
          )}

          <Link to="/wishlist">
            <span>♡</span>
            <span>Wishlist</span>
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </Link>

          <Link to="/cart">
            <span>🛒</span>
            <span>Cart</span>
            {cart.itemCount > 0 && <span className="badge">{cart.itemCount}</span>}
          </Link>
        </div>
      </div>

      <nav className="header-categories">
        <div className="container">
          <Link to="/products">All Products</Link>
          {categories.map((c) => (
            <Link key={c.id} to={`/products?category=${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

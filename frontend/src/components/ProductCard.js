import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const wishlisted = user ? isWishlisted(product.id) : false;
  const price = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const outOfStock = product.stock_quantity <= 0;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    if (!user) return;
    if (wishlisted) removeFromWishlist(product.id);
    else addToWishlist(product.id);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!user) return;
    addToCart(product.id, 1);
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <button
        className={`wishlist-btn ${wishlisted ? 'active' : ''}`}
        onClick={handleWishlistToggle}
        title={user ? (wishlisted ? 'Remove from wishlist' : 'Add to wishlist') : 'Sign in to use wishlist'}
      >
        {wishlisted ? '♥' : '♡'}
      </button>

      <div className="thumb">
  <img 
    src={`http://localhost:5000${product.thumbnail_url}`} 
    alt={product.name} 
    loading="lazy"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = 'https://via.placeholder.com/800x800?text=No+Image';
    }}
  />
</div>
      <div className="body">
        <span className="category-label">{product.category_name}</span>
        <h4>{product.name}</h4>
        <div className="rating">⭐ {Number(product.rating_avg).toFixed(1)} ({product.rating_count})</div>
        <div className="price-row">
          <span className="price">${Number(price).toFixed(2)}</span>
          {hasDiscount && <span className="price-original">${Number(product.price).toFixed(2)}</span>}
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart} disabled={outOfStock || !user}>
          {outOfStock ? 'Out of Stock' : user ? 'Add to Cart' : 'Sign in to buy'}
        </button>
      </div>
    </Link>
  );
}
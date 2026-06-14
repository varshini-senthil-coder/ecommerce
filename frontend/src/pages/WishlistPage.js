import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!user) {
    return (
      <div className="empty-state">
        <h3>Sign in to view your wishlist</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading wishlist...</div>;

  if (wishlist.length === 0) {
    return (
      <div className="empty-state">
        <h3>Your wishlist is empty</h3>
        <p>Save items you love for later.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Your Wishlist</h1>
      <div className="product-grid">
        {wishlist.map((item) => {
          const price = item.discount_price ?? item.price;
          const outOfStock = item.stock_quantity <= 0;
          return (
            <div className="product-card" key={item.wishlist_item_id}>
              <button className="wishlist-btn active" onClick={() => removeFromWishlist(item.product_id)}>
                ♥
              </button>
              <Link to={`/products/${item.slug}`} className="thumb">
                <img src={item.thumbnail_url} alt={item.name} />
              </Link>
              <div className="body">
                <h4>
                  <Link to={`/products/${item.slug}`}>{item.name}</Link>
                </h4>
                <div className="rating">⭐ {Number(item.rating_avg).toFixed(1)}</div>
                <div className="price-row">
                  <span className="price">${Number(price).toFixed(2)}</span>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(item.product_id, 1)}
                  disabled={outOfStock}
                >
                  {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

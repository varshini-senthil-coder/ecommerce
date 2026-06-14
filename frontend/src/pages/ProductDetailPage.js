import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchProduct } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProduct(idOrSlug)
      .then((res) => setProduct(res.data))
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  if (loading) return <div className="loading">Loading product...</div>;
  if (error || !product) return <div className="error-message">{error || 'Product not found.'}</div>;

  const price = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
  const outOfStock = product.stock_quantity <= 0;
  const wishlisted = user ? isWishlisted(product.id) : false;

  const images = product.images && product.images.length > 0
    ? product.images.map((i) => i.image_url)
    : [product.thumbnail_url];

  const handleAddToCart = async () => {
    if (!user) return;
    await addToCart(product.id, quantity);
    setMessage('Added to cart!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleWishlistToggle = async () => {
    if (!user) return;
    if (wishlisted) await removeFromWishlist(product.id);
    else await addToWishlist(product.id);
  };

  return (
    <div className="product-detail">
      <div>
        <div className="gallery-main">
          <img
            src={images[activeImage]}
            alt={product.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/products/placeholder.svg';
            }}
          />
        </div>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${product.name} ${idx + 1}`}
                style={{
                  width: 60,
                  height: 60,
                  objectFit: 'cover',
                  borderRadius: 8,
                  cursor: 'pointer',
                  border: idx === activeImage ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                }}
                onClick={() => setActiveImage(idx)}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <span className="category-label" style={{ color: 'var(--color-accent)', fontWeight: 700 }}>
          {product.category_name}
        </span>
        <h1>{product.name}</h1>

        <div className="meta">
          <span>⭐ {Number(product.rating_avg).toFixed(1)} ({product.rating_count} reviews)</span>
          {product.brand_name && <span>Brand: {product.brand_name}</span>}
          <span>SKU: {product.sku}</span>
        </div>

        <div className="price-block">
          <span className="price">${Number(price).toFixed(2)}</span>
          {hasDiscount && (
            <span className="price-original" style={{ fontSize: '1.1rem' }}>
              ${Number(product.price).toFixed(2)}
            </span>
          )}
        </div>

        <span className={`stock-pill ${outOfStock ? 'out' : ''}`}>
          {outOfStock ? 'Out of stock' : `${product.stock_quantity} in stock`}
        </span>

        <p style={{ marginTop: 18, color: 'var(--color-ink-soft)', lineHeight: 1.6 }}>
          {product.description}
        </p>

        {!outOfStock && (
          <div className="qty-control" style={{ width: 120, marginTop: 14 }}>
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}>+</button>
          </div>
        )}

        <div className="actions">
          <button className="btn btn-primary" onClick={handleAddToCart} disabled={outOfStock || !user}>
            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <button className="btn btn-outline" onClick={handleWishlistToggle} disabled={!user}>
            {wishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
          </button>
        </div>

        {!user && (
          <p style={{ fontSize: '0.85rem', color: 'var(--color-ink-soft)', marginTop: 10 }}>
            Sign in to add items to your cart or wishlist.
          </p>
        )}
        {message && <p style={{ color: 'var(--color-success)', marginTop: 10 }}>{message}</p>}

        {product.attributes && product.attributes.length > 0 && (
          <div className="attributes-table">
            {product.attributes.map((a, idx) => (
              <div className="row" key={idx}>
                <span>{a.attr_name}</span>
                <span>{a.attr_value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
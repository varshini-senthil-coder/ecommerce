import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const { cart, loading, updateQuantity, removeFromCart } = useCart();

  if (!user) {
    return (
      <div className="empty-state">
        <h3>Sign in to view your cart</h3>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>
          Sign In
        </Link>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading cart...</div>;

  if (cart.items.length === 0) {
    return (
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-block' }}>
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-list">
        {cart.items.map((item) => (
          <div className="cart-row" key={item.cart_item_id}>
            <img src={item.thumbnail_url} alt={item.name} />
            <div>
              <div className="name">{item.name}</div>
              <div style={{ color: 'var(--color-ink-soft)', fontSize: '0.85rem' }}>
                ${Number(item.unit_price).toFixed(2)} each
              </div>
            </div>
            <div className="qty-control">
              <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                disabled={item.quantity >= item.stock_quantity}
              >
                +
              </button>
            </div>
            <div style={{ fontWeight: 700 }}>${Number(item.line_total).toFixed(2)}</div>
            <button className="remove-link" onClick={() => removeFromCart(item.product_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="row">
          <span>Subtotal ({cart.itemCount} items)</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <div className="row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="row total">
          <span>Total</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: 14 }}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
}

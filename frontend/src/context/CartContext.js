import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchCart, addToCartApi, updateCartItemApi, removeFromCartApi } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, itemCount: 0 });
      return;
    }
    setLoading(true);
    try {
      const res = await fetchCart();
      setCart(res.data);
    } catch (err) {
      console.error('Failed to load cart', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId, quantity = 1) => {
    await addToCartApi(productId, quantity);
    await refreshCart();
  };

  const updateQuantity = async (productId, quantity) => {
    await updateCartItemApi(productId, quantity);
    await refreshCart();
  };

  const removeFromCart = async (productId) => {
    await removeFromCartApi(productId);
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, updateQuantity, removeFromCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

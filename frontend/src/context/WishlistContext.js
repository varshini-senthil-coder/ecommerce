import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchWishlist, addToWishlistApi, removeFromWishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchWishlist();
      setWishlist(res.data);
    } catch (err) {
      console.error('Failed to load wishlist', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const addToWishlist = async (productId) => {
    await addToWishlistApi(productId);
    await refreshWishlist();
  };

  const removeFromWishlist = async (productId) => {
    await removeFromWishlistApi(productId);
    await refreshWishlist();
  };

  const isWishlisted = (productId) => wishlist.some((w) => w.product_id === productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, addToWishlist, removeFromWishlist, isWishlisted, refreshWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

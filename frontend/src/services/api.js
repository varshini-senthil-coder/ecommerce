import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token (if present) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Products ----
export const fetchProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const fetchProduct = (idOrSlug) => api.get(`/products/${idOrSlug}`).then((r) => r.data);

// ---- Categories ----
export const fetchCategories = () => api.get('/categories').then((r) => r.data);

// ---- Auth ----
export const registerUser = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const loginUser = (payload) => api.post('/auth/login', payload).then((r) => r.data);

// ---- Cart ----
export const fetchCart = () => api.get('/cart').then((r) => r.data);
export const addToCartApi = (productId, quantity = 1) =>
  api.post('/cart', { productId, quantity }).then((r) => r.data);
export const updateCartItemApi = (productId, quantity) =>
  api.put(`/cart/${productId}`, { quantity }).then((r) => r.data);
export const removeFromCartApi = (productId) =>
  api.delete(`/cart/${productId}`).then((r) => r.data);

// ---- Wishlist ----
export const fetchWishlist = () => api.get('/wishlist').then((r) => r.data);
export const addToWishlistApi = (productId) =>
  api.post('/wishlist', { productId }).then((r) => r.data);
export const removeFromWishlistApi = (productId) =>
  api.delete(`/wishlist/${productId}`).then((r) => r.data);

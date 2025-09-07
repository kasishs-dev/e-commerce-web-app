// services/cartService.js
import { api } from './api';

// Get cart items
export const getCartItems = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cart items');
  }
};

// Add item to cart
export const addToCart = async (productData) => {
  try {
    const response = await api.post('/cart', productData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

// Update cart item quantity
export const updateCartItem = async (itemId, quantity) => {
  try {
    const response = await api.put(`/cart/${itemId}`, { quantity });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update cart item');
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/${itemId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to remove cart item');
  }
};

// Clear cart
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
};
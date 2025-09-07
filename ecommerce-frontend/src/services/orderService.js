// services/orderService.js
import { api } from './api';

// Get all orders (admin only)
export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

// Get detailed orders with product information (admin only)
export const getDetailedOrders = async () => {
  try {
    const response = await api.get('/orders/admin/detailed');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch detailed orders');
  }
};

// Get order details with product information
export const getOrderDetails = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order details');
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel order');
  }
};

// Get user expenses (admin only)
export const getUserExpenses = async (userId) => {
  try {
    const response = await api.get(`/orders/expenses/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user expenses');
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    let response;
    if (status === 'delivered') {
      response = await api.put(`/orders/${orderId}/deliver`);
    } else if (status === 'paid') {
      response = await api.put(`/orders/${orderId}/pay`);
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update order status');
  }
};

// Create new order
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    console.error('Error response:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to create order');
  }
};

// Get user's orders
export const getMyOrders = async () => {
  try {
    console.log('Fetching user orders...');
    const response = await api.get('/orders/my');
    console.log('Orders fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};
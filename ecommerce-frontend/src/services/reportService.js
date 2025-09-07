import { api } from './api';
import axios from 'axios';

// Fallback API instance if main api is undefined
const createApiInstance = () => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const instance = axios.create({ baseURL });
  
  // Add auth token to requests
  instance.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });
  
  return instance;
};

// Use api if available, otherwise create fallback
const apiClient = api || createApiInstance();

// Get sales overview
export const getSalesOverview = async (period = '30') => {
  try {    
    const response = await apiClient.get(`/reports/overview?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales overview:', error);
    throw error;
  }
};

// Get sales by period
export const getSalesByPeriod = async (period = 'daily', days = '30') => {
  try {
    const response = await apiClient.get(`/reports/sales-by-period?period=${period}&days=${days}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sales by period:', error);
    throw error;
  }
};

// Get top products
export const getTopProducts = async (period = '30', limit = '10') => {
  try {
    const response = await apiClient.get(`/reports/top-products?period=${period}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error);
    throw error;
  }
};

// Get customer analytics
export const getCustomerAnalytics = async (period = '30') => {
  try {
    const response = await apiClient.get(`/reports/customers?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching customer analytics:', error);
    throw error;
  }
};

// Get order status distribution
export const getOrderStatusDistribution = async (period = '30') => {
  try {
    const response = await apiClient.get(`/reports/order-status?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order status distribution:', error);
    throw error;
  }
};

// Export sales report
export const exportSalesReport = async (format = 'json', period = '30') => {
  try {
    const response = await apiClient.get(`/reports/export?format=${format}&period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Error exporting sales report:', error);
    throw error;
  }
};

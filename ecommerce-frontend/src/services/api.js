// services/api.js
import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      baseURL: config.baseURL,
      timeout: config.timeout,
      hasToken: !!token,
      timestamp: new Date().toISOString()
    });
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      timeout: error.config?.timeout,
      responseData: error.response?.data,
      timestamp: new Date().toISOString()
    });
    
    // Handle network errors
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error('Request timeout. The server is taking too long to respond. Please try again.'));
      }
      if (error.message === 'Network Error') {
        return Promise.reject(new Error('Network error. Please check if the server is running on http://localhost:5000'));
      }
      if (error.code === 'ECONNREFUSED') {
        return Promise.reject(new Error('Connection refused. Please make sure the backend server is running.'));
      }
      return Promise.reject(new Error('Unable to connect to server. Please check your connection and try again.'));
    }
    
    // Handle HTTP errors
    const status = error.response?.status;
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new Error('Session expired. Please login again.'));
      
      case 403:
        return Promise.reject(new Error('Access denied. You do not have permission.'));
      
      case 404:
        return Promise.reject(new Error('Resource not found.'));
      
      case 500:
        console.error('Server Error Details:', error.response?.data);
        return Promise.reject(new Error(`Server error: ${error.response?.data?.message || 'Please try again later.'}`));
      
      default:
        return Promise.reject(new Error(errorMessage));
    }
  }
);

export { api };
export default api;
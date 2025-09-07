// services/productService.js
import { api } from './api';

// Get all products (for admin)
export const getAdminProducts = async () => {
  try {
    const response = await api.get('/products/admin');
    return response.data.products;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

// Get single product
export const getProduct = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch product');
  }
};

// Create product (admin only)
export const createProduct = async (formData) => {
  try {
    const response = await api.post('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create product');
  }
};

// Update product (admin only)
export const updateProduct = async ({ id, productData }) => {
  try {
    const response = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update product');
  }
};

// Soft delete product (admin only)
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete product');
  }
};

// Restore soft deleted product (admin only)
export const restoreProduct = async (id) => {
  try {
    const response = await api.put(`/products/${id}/restore`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to restore product');
  }
};

// Hard delete product (admin only)
export const hardDeleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}/hard`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to permanently delete product');
  }
};

// Get all products including soft deleted (admin only)
export const getAllProducts = async (includeDeleted = false) => {
  try {
    const response = await api.get(`/products/admin?includeDeleted=${includeDeleted}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch all products');
  }
};

// Create review
export const createReview = async (productId, reviewData) => {
  try {
    const response = await api.post(`/products/${productId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create review');
  }
};

// Get filter options
export const getFilterOptions = async () => {
  try {
    const response = await api.get('/products/filters/options');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch filter options');
  }
};

// Get search suggestions
export const getSearchSuggestions = async (query) => {
  try {
    const response = await api.get('/products/search/suggestions', {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch suggestions');
  }
};

// Get products with advanced filtering, searching, and sorting
export const getProducts = async (filters = {}) => {
  try {
    // Clean up filters - remove empty values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => 
        value !== '' && value !== null && value !== undefined
      )
    );

    console.log('Sending filters to API:', cleanFilters);
    
    const response = await api.get('/products', { params: cleanFilters });
    console.log('API response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

export const fetchProducts = async () => {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};
// utils/queryUtils.js
import { useQueryClient } from '@tanstack/react-query';

export const useInvalidateProductQueries = () => {
  const queryClient = useQueryClient();

  const invalidateAllProductQueries = () => {
    // Invalidate all product-related queries
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    queryClient.invalidateQueries({ queryKey: ['filterOptions'] });
    queryClient.invalidateQueries({ queryKey: ['adminStats'] });
    
    // Also invalidate any product-specific queries
    queryClient.invalidateQueries({ 
      queryKey: ['product'],
      exact: false 
    });
  };

  return { invalidateAllProductQueries };
};

// Helper function to invalidate all product queries
export const invalidateProductQueries = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: ['products'] });
  queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
  queryClient.invalidateQueries({ queryKey: ['filterOptions'] });
  queryClient.invalidateQueries({ queryKey: ['adminStats'] });
  queryClient.invalidateQueries({ 
    queryKey: ['product'],
    exact: false 
  });
};

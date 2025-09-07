// context/CacheContext.js
import { createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const CacheContext = createContext();

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
};

export const CacheProvider = ({ children }) => {
  const queryClient = useQueryClient();

  const invalidateUserData = () => {
    queryClient.invalidateQueries(['userExpenses']);
    queryClient.invalidateQueries(['adminStats']);
    queryClient.invalidateQueries(['recentOrders']);
    queryClient.invalidateQueries(['orders']);
  };

  const value = {
    invalidateUserData,
  };

  return (
    <CacheContext.Provider value={value}>
      {children}
    </CacheContext.Provider>
  );
};
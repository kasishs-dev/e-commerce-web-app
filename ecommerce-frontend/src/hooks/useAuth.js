// hooks/useAuth.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on app load and page refresh
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData);
            setUser(user);
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear invalid data
            localStorage.removeItem('user');
            localStorage.removeItem('token');
          }
        }
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes (like from other tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userData) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
    setUser(null);
  };

  const isAuthenticated = useCallback(() => {
    return !!user;
  }, [user]);

  const isAdmin = useCallback(() => {
    return user && user.role === 'admin';
  }, [user]);

  return { user, isLoading, login, logout, isAuthenticated, isAdmin };
};
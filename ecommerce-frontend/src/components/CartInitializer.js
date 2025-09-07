// components/CartInitializer.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { fetchCart } from '../store/slices/cartSlice';

export default function CartInitializer() {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated()) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, isLoading]);

  return null; // This component doesn't render anything
}
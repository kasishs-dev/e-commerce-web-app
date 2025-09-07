// context/CartContext.js
import { createContext, useContext, useReducer } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      return { ...state, totalItems: state.totalItems + 1 };
    case 'REMOVE_FROM_CART':
      return { ...state, totalItems: Math.max(0, state.totalItems - 1) };
    case 'SET_CART':
      return { ...state, totalItems: action.payload };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, { totalItems: 0 });

  return (
    <CartContext.Provider value={{ ...cart, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
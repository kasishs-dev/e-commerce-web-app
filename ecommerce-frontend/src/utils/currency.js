// utils/currency.js

// Format price in Indian Rupees
export const formatPrice = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return `₹${price.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

// Format price without currency symbol (for calculations)
export const formatPriceNumber = (price) => {
  if (typeof price !== 'number') {
    price = parseFloat(price) || 0;
  }
  return price.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};

// Get currency symbol
export const CURRENCY_SYMBOL = '₹';

// Get currency code
export const CURRENCY_CODE = 'INR';
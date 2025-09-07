// store/slices/cartSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCartItems, addToCart, updateCartItem, removeFromCart, clearCart as clearCartService } from '../../services/cartService';

export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      return await getCartItems();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addItemToCart = createAsyncThunk(
  'cart/addItem',
  async (cartItem, { rejectWithValue }) => {
    try {
      return await addToCart(cartItem);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  'cart/updateItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      return await updateCartItem(itemId, quantity);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  'cart/removeItem',
  async (itemId, { rejectWithValue }) => {
    try {
      return await removeFromCart(itemId);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearUserCart = createAsyncThunk(
  'cart/clearCart',
  async (_, { rejectWithValue }) => {
    try {
      return await clearCartService();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to safely calculate totals
const calculateTotals = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return { totalPrice: 0, totalItems: 0 };
  }

  const totalPrice = items.reduce((total, item) => {
    const price = parseFloat(item.price) || 0;
    const qty = parseInt(item.qty) || 0;
    return total + (price * qty);
  }, 0);

  const totalItems = items.reduce((total, item) => {
    const qty = parseInt(item.qty) || 0;
    return total + qty;
  }, 0);

  return { totalPrice, totalItems };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    totalPrice: 0,
    totalItems: 0,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    // Add a reducer to handle local cart updates without API calls
    addItemLocally: (state, action) => {
      const product = action.payload;
      
      // Validate product data
      if (!product || !product._id || !product.name || !product.price) {
        console.error('Invalid product data:', product);
        return;
      }

      const existingItem = state.items.find(item => item._id === product._id);
      
      if (existingItem) {
        existingItem.qty += parseInt(product.qty) || 1;
      } else {
        state.items.push({
          _id: product._id,
          name: product.name,
          price: parseFloat(product.price) || 0,
          image: product.image || '',
          qty: parseInt(product.qty) || 1
        });
      }
      
      // Recalculate totals
      const { totalPrice, totalItems } = calculateTotals(state.items);
      state.totalPrice = totalPrice;
      state.totalItems = totalItems;
    },
    removeItemLocally: (state, action) => {
      const itemId = action.payload;
      state.items = state.items.filter(item => item._id !== itemId);
      
      // Recalculate totals
      const { totalPrice, totalItems } = calculateTotals(state.items);
      state.totalPrice = totalPrice;
      state.totalItems = totalItems;
    },
    updateItemQuantityLocally: (state, action) => {
      const { itemId, qty } = action.payload;
      const item = state.items.find(item => item._id === itemId);
      
      if (item) {
        item.qty = Math.max(1, parseInt(qty) || 1);
        
        // Recalculate totals
        const { totalPrice, totalItems } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItems = totalItems;
      }
    },
    clearCartLocally: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
    },
    // Add the clearCart function that checkout is looking for
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalItems = 0;
    },
    // Initialize cart with safe defaults
    initializeCart: (state) => {
      if (!state.items) state.items = [];
      if (typeof state.totalPrice !== 'number') state.totalPrice = 0;
      if (typeof state.totalItems !== 'number') state.totalItems = 0;
      
      // Recalculate totals to ensure consistency
      const { totalPrice, totalItems } = calculateTotals(state.items);
      state.totalPrice = totalPrice;
      state.totalItems = totalItems;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch cart
      .addCase(fetchCart.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle different response structures
        const cartData = action.payload.cart || action.payload;
        state.items = Array.isArray(cartData.items) ? cartData.items : [];
        
        // Recalculate totals to ensure consistency
        const { totalPrice, totalItems } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItems = totalItems;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Add to cart
      .addCase(addItemToCart.fulfilled, (state, action) => {
        // Handle different response structures
        const cartData = action.payload.cart || action.payload;
        state.items = Array.isArray(cartData.items) ? cartData.items : [];
        
        // Recalculate totals to ensure consistency
        const { totalPrice, totalItems } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItems = totalItems;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Update quantity
      .addCase(updateItemQuantity.fulfilled, (state, action) => {
        const cartData = action.payload.cart || action.payload;
        state.items = Array.isArray(cartData.items) ? cartData.items : [];
        
        // Recalculate totals to ensure consistency
        const { totalPrice, totalItems } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItems = totalItems;
      })
      // Remove item
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        const cartData = action.payload.cart || action.payload;
        state.items = Array.isArray(cartData.items) ? cartData.items : [];
        
        // Recalculate totals to ensure consistency
        const { totalPrice, totalItems } = calculateTotals(state.items);
        state.totalPrice = totalPrice;
        state.totalItems = totalItems;
      })
      // Clear cart
      .addCase(clearUserCart.fulfilled, (state) => {
        state.items = [];
        state.totalPrice = 0;
        state.totalItems = 0;
      });
  },
});

export const { 
  clearCartError, 
  addItemLocally, 
  removeItemLocally, 
  updateItemQuantityLocally, 
  clearCartLocally,
  clearCart, // Add this export
  initializeCart
} = cartSlice.actions;
export default cartSlice.reducer;
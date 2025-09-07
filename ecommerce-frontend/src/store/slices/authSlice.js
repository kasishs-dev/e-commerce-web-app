// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Helper function to safely access localStorage
const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      return null;
    }
  }
  return null;
};

const initialState = {
  user: null, // Start with null to avoid hydration mismatch
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Set user after hydration (client-side only)
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { dispatch }) => {
    const user = getStoredUser();
    if (user) {
      dispatch(setUser(user));
    }
    return user;
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, thunkAPI) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const user = { ...userData, _id: Date.now().toString(), token: 'mock-token' };
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue('Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData, thunkAPI) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock validation
      let user = null;
      if (userData.email === 'admin@example.com' && userData.password === 'password123') {
        user = { 
          name: 'Admin User', 
          email: 'admin@example.com', 
          _id: '1', 
          role: 'admin', 
          token: 'mock-admin-token' 
        };
      } else if (userData.email === 'user@example.com' && userData.password === 'password123') {
        user = { 
          name: 'Regular User', 
          email: 'user@example.com', 
          _id: '2', 
          role: 'user', 
          token: 'mock-user-token' 
        };
      } else {
        throw new Error('Invalid credentials');
      }
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    logout: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
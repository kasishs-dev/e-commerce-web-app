// pages/test-checkout.js - Test checkout functionality
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { fetchCart, addItemToCart, clearUserCart } from '../store/slices/cartSlice';
import { getProducts } from '../services/productService';
import { useQuery } from '@tanstack/react-query';

export default function TestCheckout() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const dispatch = useDispatch();
  const [testProduct, setTestProduct] = useState(null);
  
  // Get cart data from Redux store
  const { items: cartItems, totalPrice, totalItems, isLoading: cartLoading, error: cartError } = useSelector((state) => state.cart);

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  useEffect(() => {
    if (isAuthenticated()) {
      dispatch(fetchCart());
    }
  }, [dispatch]); // Removed isAuthenticated from dependencies

  useEffect(() => {
    if (products && products.length > 0 && !testProduct) {
      setTestProduct(products[0]);
    }
  }, [products, testProduct]);

  const addTestProduct = () => {
    if (testProduct) {
      dispatch(addItemToCart({
        _id: testProduct._id,
        name: testProduct.name,
        price: testProduct.price,
        image: testProduct.image,
        quantity: 1
      }));
    }
  };

  const clearCart = () => {
    dispatch(clearUserCart());
  };

  if (authLoading) {
    return <div className="container mx-auto px-4 py-8">Loading authentication...</div>;
  }

  if (!isAuthenticated()) {
    return <div className="container mx-auto px-4 py-8">Please login to test checkout</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout Test Page</h1>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded-lg mb-8">
        <h2 className="text-lg font-semibold mb-4">Debug Information</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>User:</strong> {user?.name || 'Not logged in'}</p>
            <p><strong>Cart Loading:</strong> {cartLoading ? 'Yes' : 'No'}</p>
            <p><strong>Cart Error:</strong> {cartError || 'None'}</p>
          </div>
          <div>
            <p><strong>Total Items:</strong> {totalItems}</p>
            <p><strong>Total Price:</strong> ${totalPrice?.toFixed(2) || '0.00'}</p>
            <p><strong>Cart Items:</strong> {cartItems?.length || 0}</p>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Test Actions</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Add a test product to cart:</p>
            <button
              onClick={addTestProduct}
              disabled={!testProduct || productsLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {productsLoading ? 'Loading...' : 'Add Test Product'}
            </button>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Clear cart:</p>
            <button
              onClick={clearCart}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Cart Items</h2>
        {cartItems && cartItems.length > 0 ? (
          <div className="space-y-2">
            {cartItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-2 bg-gray-50 rounded">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.price}</p>
                </div>
                <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Cart is empty</p>
        )}
      </div>

      {/* Checkout Button */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Checkout</h2>
        {totalItems > 0 ? (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Total: {totalItems} items - ${totalPrice?.toFixed(2) || '0.00'}
            </p>
            <button
              onClick={() => window.location.href = '/checkout'}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Proceed to Checkout
            </button>
          </div>
        ) : (
          <p className="text-gray-500">Add items to cart first</p>
        )}
      </div>
    </div>
  );
}

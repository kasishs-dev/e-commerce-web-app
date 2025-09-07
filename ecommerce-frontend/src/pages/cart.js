// pages/cart.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../context/AuthContext';
import { 
  removeItemLocally, 
  updateItemQuantityLocally, 
  clearCartLocally,
  initializeCart
} from '../store/slices/cartSlice';
import { formatPrice } from '../utils/currency';
import Image from 'next/image';
import Link from 'next/link';
import Spinner from '../components/Spinner';

export default function Cart() {
  const { items = [], totalPrice = 0, totalItems = 0 } = useSelector((state) => state.cart);
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  // Initialize cart on component mount
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);

  // Safe calculations
  const safeTotalPrice = isNaN(totalPrice) ? 0 : totalPrice;
  const safeTotalItems = isNaN(totalItems) ? 0 : totalItems;
  const safeItems = Array.isArray(items) ? items : [];

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(productId);
    setIsUpdating(true);
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch(updateItemQuantityLocally({ itemId: productId, qty: newQuantity }));
    } finally {
      setIsUpdating(false);
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (productId) => {
    setUpdatingItem(productId);
    setIsUpdating(true);
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch(removeItemLocally(productId));
    } finally {
      setIsUpdating(false);
      setUpdatingItem(null);
    }
  };

  const handleClearCart = async () => {
    setIsUpdating(true);
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      dispatch(clearCartLocally());
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    router.push('/checkout');
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">��</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to view your cart</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">Review your items before checkout</p>
        </div>

        {safeItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500 mb-6">Add some items to get started</p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Cart Header */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({safeTotalItems})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      disabled={isUpdating}
                      className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <Spinner size="sm" />
                          Clearing...
                        </>
                      ) : (
                        'Clear Cart'
                      )}
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-100">
                  {safeItems.map((item) => {
                    const safeQty = parseInt(item.qty) || 1;
                    const safePrice = parseFloat(item.price) || 0;
                    const itemTotal = safePrice * safeQty;
                    
                    return (
                      <div key={item._id} className="p-6">
                        <div className="flex items-center gap-4">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={item.image || '/placeholder-product.jpg'}
                              alt={item.name || 'Product'}
                              fill
                              className="object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${item._id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                                {item.name || 'Unknown Product'}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-500 mt-1">
                              {formatPrice(safePrice)} each
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQuantityChange(item._id, safeQty - 1)}
                              disabled={isUpdating || safeQty <= 1 || updatingItem === item._id}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updatingItem === item._id ? (
                                <Spinner size="sm" />
                              ) : (
                                '-'
                              )}
                            </button>
                            <span className="w-8 text-center font-medium">
                              {safeQty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, safeQty + 1)}
                              disabled={isUpdating || updatingItem === item._id}
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {updatingItem === item._id ? (
                                <Spinner size="sm" />
                              ) : (
                                '+'
                              )}
                            </button>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(itemTotal)}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isUpdating || updatingItem === item._id}
                            className="text-red-600 hover:text-red-700 p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingItem === item._id ? (
                              <Spinner size="sm" />
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal ({safeTotalItems} items)</span>
                    <span className="text-gray-900">{formatPrice(safeTotalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {safeTotalPrice > 1000 ? 'Free' : formatPrice(50)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18% GST)</span>
                    <span className="text-gray-900">{formatPrice(safeTotalPrice * 0.18)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">
                        {formatPrice(safeTotalPrice + (safeTotalPrice * 0.18) + (safeTotalPrice > 1000 ? 0 : 50))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isUpdating}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-4 flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Spinner size="sm" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </button>

                {/* Continue Shopping */}
                <Link
                  href="/"
                  className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
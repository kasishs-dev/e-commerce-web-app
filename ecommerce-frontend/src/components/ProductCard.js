// components/ProductCard.js
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addItemLocally } from '../store/slices/cartSlice';
import { useAuth } from '../context/AuthContext';
import { useLoading } from '../context/LoadingContext';
import { formatPrice } from '../utils/currency';
import { getImageUrl } from '../utils/imageUtils';
import Spinner from './Spinner';
import RetryButton from './RetryButton';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addToCartError, setAddToCartError] = useState(null);
  
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { showLoading, hideLoading } = useLoading();
  const { items = [], totalItems } = useSelector((state) => state.cart);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    setIsAddingToCart(true);
    setAddToCartError(null);
    showLoading('Adding to cart...');
    
    try {
      // Simulate API delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      dispatch(addItemLocally({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: quantity
      }));
      
      console.log('Item added to cart successfully');
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setAddToCartError(error.message);
    } finally {
      setIsAddingToCart(false);
      hideLoading();
    }
  };

  const handleRetryAddToCart = () => {
    handleAddToCart();
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const imageUrl = getImageUrl(product.image);

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex gap-4 p-6">
          {/* Product Image */}
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Spinner size="sm" />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            <Link href={`/product/${product._id}`}>
              <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.description}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-500 ml-1">
                  ({product.numReviews || 0})
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price || 0)}
              </div>
              <div className="text-sm text-gray-500">
                {product.countInStock > 0 ? (
                  <span className="text-green-600">In Stock ({product.countInStock})</span>
                ) : (
                  <span className="text-red-600">Out of Stock</span>
                )}
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="flex flex-col gap-2 w-32">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={isAddingToCart}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={isAddingToCart}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
            
            {addToCartError ? (
              <div className="space-y-2">
                <p className="text-xs text-red-600">{addToCartError}</p>
                <RetryButton onRetry={handleRetryAddToCart} isLoading={isAddingToCart} className="w-full text-xs py-1" />
              </div>
            ) : (
              <button
                onClick={handleAddToCart}
                disabled={product.countInStock === 0 || isAddingToCart}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <>
                    <Spinner size="sm" />
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view (default) - same structure but with error handling
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Product Image */}
      <div className="relative aspect-w-1 aspect-h-1 bg-gray-100">
        <Link href={`/product/${product._id}`}>
          <div className="relative w-full h-48">
            {!imageError ? (
              <Image
                src={imageUrl}
                alt={product.name}
                fill
                className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                unoptimized={true}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                <Spinner size="md" />
              </div>
            )}
          </div>
        </Link>
        
        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Link
              href={`/product/${product._id}`}
              className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Quick View
            </Link>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4">
        <Link href={`/product/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-500 ml-1">
              ({product.numReviews || 0})
            </span>
          </div>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(product.price || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {product.countInStock > 0 ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </div>
        </div>

        {/* Quantity and Add to Cart */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={isAddingToCart}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center font-medium">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={isAddingToCart}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
          
          {addToCartError ? (
            <div className="space-y-2">
              <p className="text-xs text-red-600 text-center">{addToCartError}</p>
              <RetryButton onRetry={handleRetryAddToCart} isLoading={isAddingToCart} className="w-full text-xs py-2" />
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || isAddingToCart}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isAddingToCart ? (
                <>
                  <Spinner size="sm" />
                  Adding...
                </>
              ) : (
                'Add to Cart'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
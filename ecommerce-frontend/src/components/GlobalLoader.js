// components/GlobalLoader.js
import { useLoading } from '../context/LoadingContext';

export default function GlobalLoader() {
  const { isLoading, loadingMessage } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-6">
        {/* Main Spinner */}
        <div className="relative">
          <div className="w-20 h-20 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{loadingMessage}</h3>
          <p className="text-sm text-gray-600">Please wait while we process your request</p>
        </div>

        {/* Animated Progress Bar */}
        <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full animate-pulse"></div>
        </div>

        {/* Loading Dots */}
        <div className="flex space-x-2">
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
}
// components/RetryButton.js
import { useState } from 'react';

export default function RetryButton({ onRetry, isLoading = false, className = '' }) {
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = async () => {
    setRetryCount(prev => prev + 1);
    try {
      await onRetry();
    } catch (error) {
      console.error('Retry failed:', error);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={isLoading}
      className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 ${className}`}
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Retrying...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry {retryCount > 0 && `(${retryCount})`}
        </>
      )}
    </button>
  );
}
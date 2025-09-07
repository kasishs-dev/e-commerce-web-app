// components/LoadingOverlay.js
import Spinner from './Spinner';

export default function LoadingOverlay({ 
  isLoading, 
  message = 'Loading...', 
  showSpinner = true,
  className = '' 
}) {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="text-center">
          {showSpinner && (
            <div className="flex justify-center mb-4">
              <Spinner size="lg" />
            </div>
          )}
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}
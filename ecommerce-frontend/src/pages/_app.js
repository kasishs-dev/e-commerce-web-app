// pages/_app.js
import { Provider } from 'react-redux';
import { store } from '../store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '../context/AuthContext';
import { LoadingProvider } from '../context/LoadingContext';
import Navigation from '../components/Navigation';
import GlobalLoader from '../components/GlobalLoader';
import NetworkError from '../components/NetworkError';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initializeCart } from '../store/slices/cartSlice';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.response?.status >= 400 && error.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Component to initialize cart
function CartInitializer() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(initializeCart());
  }, [dispatch]);
  
  return null;
}

export default function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LoadingProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
              <CartInitializer />
              <Navigation />
              <main>
                <Component {...pageProps} />
              </main>
              {/* <PageLoader /> */}
              <GlobalLoader />
              <NetworkError />
              {/* <ServerStatus /> */}
            </div>
          </LoadingProvider>
        </AuthProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </Provider>
  );
}
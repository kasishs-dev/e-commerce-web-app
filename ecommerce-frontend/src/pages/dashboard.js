// Example for pages/dashboard.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated()) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Please log in</h2>
          <p className="text-gray-600 mt-2">You need to be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600 mb-4">Email: {user?.email}</p>
        <p className="text-gray-600">Role: <span className="capitalize">{user?.role}</span></p>
        
        {/* {user?.role === 'admin' && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">Admin Features</h3>
            <ul className="list-disc list-inside mt-2 text-blue-700">
              <li>Product Management</li>
              <li>User Management</li>
              <li>Order Management</li>
              <li>Sales Reports</li>
            </ul>
          </div>
        )} */}
      </div>
    </div>
  );
}
// pages/admin/user-expenses.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getUsers } from '../../services/adminService';
import { getUserExpenses } from '../../services/orderService';

export default function UserExpenses() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState(null);

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  // Fetch user expenses when a user is selected
  const { data: userExpenses, isLoading: expensesLoading, refetch: refetchExpenses } = useQuery({
    queryKey: ['userExpenses', selectedUserId],
    queryFn: () => getUserExpenses(selectedUserId),
    enabled: !authLoading && isAuthenticated() && isAdmin() && !!selectedUserId,
    // Add polling to refresh data every 30 seconds
    refetchInterval: 30000, // 30 seconds
    // Also refetch when window regains focus
    refetchOnWindowFocus: true,
  });

  // Manual refresh function
  const handleRefresh = () => {
    refetchExpenses();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated() || !isAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">User Expenses</h1>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={!selectedUserId || expensesLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {expensesLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Selection */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Select User</h2>
          {usersLoading ? (
            <div className="animate-pulse">Loading users...</div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {users?.map((user) => (
                <button
                  key={user._id}
                  onClick={() => setSelectedUserId(user._id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedUserId === user._id
                      ? 'bg-blue-100 border-blue-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                  <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Expenses */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {!selectedUserId ? (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">👤</div>
              <p>Select a user to view their expenses</p>
            </div>
          ) : expensesLoading ? (
            <div className="animate-pulse">Loading expenses...</div>
          ) : userExpenses ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Expense Summary</h2>
                <div className="text-xs text-gray-500">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{userExpenses.totalExpenses}
                  </div>
                  <div className="text-sm text-blue-800">Total Expenses</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {userExpenses.totalOrders}
                  </div>
                  <div className="text-sm text-green-800">Total Orders</div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <div className="text-lg font-semibold text-yellow-800">
                  Average Order Value: ₹{userExpenses.averageOrderValue}
                </div>
              </div>

              <h3 className="text-lg font-semibold mb-4">Order History</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {userExpenses.orders?.map((order) => (
                  <div key={order._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Order #{order._id.slice(-6)}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">₹{order.totalPrice.toFixed(2)}</div>
                      <div className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p>No expense data found for this user</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
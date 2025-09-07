// pages/admin/dashboard.js
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { getDashboardStats, getRecentOrders, getUsers } from '../../services/adminService';
import AdminStats from '../../components/AdminStats';
import RecentOrdersTable from '../../components/admin/RecentOrdersTable';
import UsersTable from '../../components/admin/UsersTable';
import { useAuth } from '../../hooks/useAuth';

export default function AdminDashboard() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Always define hooks at the top level
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['adminStats'],
    queryFn: getDashboardStats,
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['recentOrders'],
    queryFn: getRecentOrders,
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  const { data: users, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated() || !isAdmin())) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated() || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Access Denied</h2>
          <p className="text-gray-600 mt-2">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, <span className="font-semibold">{user.name}</span>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/products" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl mb-2">📦</div>
          <h3 className="font-semibold">Product Management</h3>
          <p className="text-sm text-gray-600">Manage products and inventory</p>
        </Link>

        <Link href="/admin/users" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl mb-2">👥</div>
          <h3 className="font-semibold">User Management</h3>
          <p className="text-sm text-gray-600">Manage users and roles</p>
        </Link>

        <Link href="/admin/orders" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl mb-2">📋</div>
          <h3 className="font-semibold">Order Management</h3>
          <p className="text-sm text-gray-600">View and manage orders</p>
        </Link>

        <Link href="/admin/reports" className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="font-semibold">Sales Reports</h3>
          <p className="text-sm text-gray-600">View sales analytics</p>
        </Link>
      </div>

      {/* Statistics */}
      <AdminStats stats={stats} isLoading={statsLoading} error={statsError} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Recent Orders */}
        <RecentOrdersTable orders={orders} isLoading={ordersLoading} error={ordersError} />

        {/* Users Table */}
        <UsersTable users={users} isLoading={usersLoading} error={usersError} />
      </div>
    </div>
  );
}

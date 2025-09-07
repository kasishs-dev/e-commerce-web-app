// pages/admin/orders.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { 
  getDetailedOrders, 
  cancelOrder, 
  updateOrderStatus 
} from '../../services/orderService';

export default function AdminOrders() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch detailed orders
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['detailedOrders'],
    queryFn: getDetailedOrders,
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }) => cancelOrder(orderId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailedOrders'] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
      setShowCancelModal(false);
      setCancelReason('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['detailedOrders'] });
      queryClient.invalidateQueries({ queryKey: ['recentOrders'] });
    },
  });

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const confirmCancel = () => {
    if (selectedOrder && cancelReason.trim()) {
      cancelOrderMutation.mutate({
        orderId: selectedOrder._id,
        reason: cancelReason.trim()
      });
    }
  };

  const handleStatusUpdate = (orderId, status) => {
    if (confirm(`Are you sure you want to mark this order as ${status}?`)) {
      updateStatusMutation.mutate({ orderId, status });
    }
  };

  const canCancelOrder = (order) => {
    return !order.isDelivered && !order.isCancelled && new Date() < new Date(order.deliveryDate);
  };

  const getStatusColor = (order) => {
    if (order.isCancelled) return 'bg-red-100 text-red-800';
    if (order.isDelivered) return 'bg-green-100 text-green-800';
    if (order.isPaid) return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusText = (order) => {
    if (order.isCancelled) return 'Cancelled';
    if (order.isDelivered) return 'Delivered';
    if (order.isPaid) return 'Paid';
    return 'Pending';
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
        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: {orders?.length || 0}
        </div>
      </div>

      {ordersError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          Error: {ordersError.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ordersLoading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="animate-pulse">Loading orders...</div>
                  </td>
                </tr>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order._id.slice(-6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {order.user?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.user?.email || 'No email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {order.orderItems?.length || 0} items
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.orderItems?.slice(0, 2).map(item => item.name).join(', ')}
                        {order.orderItems?.length > 2 && '...'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.totalPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order)}`}>
                        {getStatusText(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.deliveryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {!order.isCancelled && !order.isDelivered && order.isPaid && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, 'delivered')}
                          className="text-green-600 hover:text-green-900"
                          disabled={updateStatusMutation.isPending}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {canCancelOrder(order) && (
                        <button
                          onClick={() => handleCancelOrder(order)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Cancel
                        </button>
                      )}
                      {order.isCancelled && (
                        <span className="text-xs text-gray-500">
                          Reason: {order.cancellationReason || 'No reason provided'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cancel Order #{selectedOrder?._id.slice(-6)}
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cancellation Reason
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter reason for cancellation..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelOrderMutation.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// pages/orders/[id].js
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getOrderDetails, cancelOrder } from '../../services/orderService';
import { formatPrice } from '../../utils/currency';
import Link from 'next/link';
import Image from 'next/image';

export default function OrderDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch order details
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['orderDetails', id],
    queryFn: () => getOrderDetails(id),
    enabled: !!id && !authLoading && isAuthenticated(),
  });

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: ({ orderId, reason }) => cancelOrder(orderId, reason),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orderDetails', id] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      setShowCancelModal(false);
      setCancelReason('');
      alert(`Order #${data._id?.slice(-6)} has been cancelled successfully.`);
    },
    onError: (error) => {
      console.error('Cancellation failed:', error);
      alert('Failed to cancel order. Please try again.');
    },
  });

  const handleCancelOrder = () => {
    if (order && cancelReason.trim()) {
      cancelOrderMutation.mutate({
        orderId: order._id,
        reason: cancelReason.trim()
      });
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view order details</h2>
          <Link href="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Order</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <div className="space-x-4">
            <button 
              onClick={() => router.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <Link href="/orders" className="btn-primary">
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link href="/orders" className="btn-primary">
            My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="text-gray-600 mt-1">Order #{order._id.slice(-6)}</p>
        </div>
        <Link 
          href="/orders" 
          className="btn-secondary"
        >
          ← Back to Orders
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Order Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.isCancelled 
                  ? 'bg-red-100 text-red-800'
                  : order.isDelivered
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {order.isCancelled 
                  ? 'Cancelled' 
                  : order.isDelivered 
                  ? 'Delivered' 
                  : 'Processing'
                }
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Order Date:</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              {order.isPaid && (
                <div className="flex justify-between">
                  <span>Paid Date:</span>
                  <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.isDelivered && (
                <div className="flex justify-between">
                  <span>Delivered Date:</span>
                  <span>{new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              )}
              {order.isCancelled && (
                <div className="flex justify-between">
                  <span>Cancelled Date:</span>
                  <span>{new Date(order.cancelledAt).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.qty}</p>
                    <p className="text-gray-600">Price: {formatPrice(item.price)} each</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatPrice(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p className="font-medium">{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
            <div className="space-y-2 text-gray-600">
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status:</span>
                <span className={`font-medium ${
                  order.isPaid ? 'text-green-600' : 'text-red-600'
                }`}>
                  {order.isPaid ? 'Paid' : 'Pending'}
                </span>
              </div>
              {order.paymentResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">
                    Transaction ID: {order.paymentResult.id}
                  </p>
                  <p className="text-sm text-gray-600">
                    Status: {order.paymentResult.status}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cancellation Reason */}
          {order.isCancelled && order.cancellationReason && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Cancellation Reason</h2>
              <p className="text-gray-600">{order.cancellationReason}</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Items ({order.orderItems?.length || 0}):</span>
                <span>{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>{formatPrice(order.taxPrice)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {!order.isCancelled && !order.isDelivered && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full btn-danger"
                >
                  Cancel Order
                </button>
              )}
              
              <Link 
                href="/" 
                className="w-full btn-secondary text-center block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel order #{order._id.slice(-6)}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Please provide a reason for cancellation"
                required
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="btn-secondary flex-1"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || cancelOrderMutation.isPending}
                className="btn-danger flex-1 disabled:opacity-50"
              >
                {cancelOrderMutation.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
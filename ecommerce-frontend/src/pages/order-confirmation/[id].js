// pages/order-confirmation/[id].js
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getOrderDetails } from '../../services/orderService';
import OrderTracking from '../../components/OrderTracking';
import Link from 'next/link';

export default function OrderConfirmation() {
  const router = useRouter();
  const { id } = router.query;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['orderDetails', id],
    queryFn: () => getOrderDetails(id),
    enabled: !!id && !authLoading && isAuthenticated(),
  });

  if (authLoading || orderLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading order details...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    router.push('/login');
    return null;
  }

  if (orderError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been successfully placed.</p>
        </div>

        {/* Order Tracking */}
        <div className="mb-8">
          <OrderTracking order={order} />
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">Order #{order._id.slice(-6)}</h2>
              <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order)}`}>
              {getStatusText(order)}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {order.orderItems?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shippingAddress?.address}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${order.totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Payment Method: {order.paymentMethod === 'cash_on_delivery' ? 'Cash on Delivery (COD)' : order.paymentMethod}</p>
              <p>Estimated Delivery: {new Date(order.deliveryDate).toLocaleDateString()}</p>
              {order.paymentMethod === 'cash_on_delivery' && (
                <p className="text-green-600 font-medium">💰 Pay when your order is delivered</p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/orders"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 text-center"
          >
            View All Orders
          </Link>
          <Link
            href="/"
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 text-center"
          >
            Continue Shopping
          </Link>
        </div>

        {/* Order Tracking Info */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
          <div className="space-y-2 text-sm">
          <p>• You can track your order status in the &quot;My Orders&quot; section</p>
          <p>• You can cancel your order before the delivery date</p>
          <p>• You&apos;ll receive email updates about your order status</p>
            <p>• For any questions, contact our customer support</p>
          </div>
        </div>
      </div>
    </div>
  );
}

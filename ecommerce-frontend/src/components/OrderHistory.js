// frontend/components/OrderHistory.js
import Link from 'next/link';

export default function OrderHistory({ orders, isLoading, error }) {
  if (isLoading) return <div>Loading orders...</div>;
  if (error) return <div>Error loading orders: {error.message}</div>;
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Order History</h2>
      
      {orders && orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{order._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.isDelivered ? 'bg-green-100 text-green-800' :
                      order.isCancelled ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.isDelivered ? 'Delivered' : 
                       order.isCancelled ? 'Cancelled' : 
                       'Processing'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/order/${order._id}`}>
                      <a className="text-blue-600 hover:text-blue-900">Details</a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>You haven&apos;t placed any orders yet.</p>
      )}
    </div>
  );
}
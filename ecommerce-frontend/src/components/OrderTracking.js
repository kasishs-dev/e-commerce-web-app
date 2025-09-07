// components/OrderTracking.js
import { useState, useEffect } from 'react';

export default function OrderTracking({ order }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'ordered', label: 'Order Placed', description: 'Your order has been placed successfully' },
    { id: 'paid', label: 'Payment Confirmed', description: 'Payment has been processed' },
    { id: 'processing', label: 'Processing', description: 'Your order is being prepared' },
    { id: 'shipped', label: 'Shipped', description: 'Your order is on its way' },
    { id: 'delivered', label: 'Delivered', description: 'Your order has been delivered' }
  ];

  useEffect(() => {
    if (order.isCancelled) {
      setCurrentStep(-1); // Special case for cancelled orders
    } else if (order.isDelivered) {
      setCurrentStep(4); // Delivered
    } else if (order.isPaid) {
      setCurrentStep(2); // Processing (assuming paid means processing)
    } else {
      setCurrentStep(0); // Ordered
    }
  }, [order]);

  if (order.isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="text-red-600 text-2xl mr-3">❌</div>
          <div>
            <h3 className="text-lg font-semibold text-red-800">Order Cancelled</h3>
            <p className="text-red-600">
              This order was cancelled on {new Date(order.cancelledAt).toLocaleDateString()}
            </p>
            {order.cancellationReason && (
              <p className="text-sm text-red-600 mt-1">
                Reason: {order.cancellationReason}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-6">Order Tracking</h3>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;
          
          return (
            <div key={step.id} className="flex items-start">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-300 text-gray-600'
              }`}>
                {isCompleted ? '✓' : index + 1}
              </div>
              
              <div className="ml-4 flex-1">
                <h4 className={`font-medium ${
                  isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.label}
                </h4>
                <p className={`text-sm ${
                  isCompleted || isCurrent ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
                
                {isCurrent && !isCompleted && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">In progress...</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Estimated Delivery</h4>
        <p className="text-blue-800">
          {new Date(order.deliveryDate).toLocaleDateString()} 
          <span className="text-sm text-blue-600 ml-2">
            ({Math.ceil((new Date(order.deliveryDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining)
          </span>
        </p>
        {order.paymentMethod === 'cash_on_delivery' && (
          <div className="mt-2 p-2 bg-green-100 rounded border border-green-200">
            <p className="text-sm text-green-800">
              💰 <strong>Cash on Delivery:</strong> Pay ${order.totalPrice?.toFixed(2) || '0.00'} when your order arrives
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

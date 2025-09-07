// components/CartDebug.js
import { useSelector } from 'react-redux';

export default function CartDebug() {
  const cart = useSelector((state) => state.cart);
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <div>Cart Debug:</div>
      <div>Total Items: {cart.totalItems}</div>
      <div>Total Price: ₹{cart.totalPrice}</div>
      <div>Items Count: {cart.items?.length || 0}</div>
      <div>Loading: {cart.isLoading ? 'Yes' : 'No'}</div>
      <div>Error: {cart.error || 'None'}</div>
    </div>
  );
}
// components/ProductReviews.js
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createReview } from '../services/productService';

export default function ProductReviews({ product }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { user } = useSelector((state) => state.auth);
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: () => createReview(product._id, { rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product', product._id] });
      setRating(0);
      setComment('');
    }
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }
    mutation.mutate();
  };
  
  const hasReviewed = user && product.reviews.some(review => 
    review.user._id === user._id
  );
  
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
      
      {user && !hasReviewed && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <h4 className="text-lg font-medium mb-2">Write a Review</h4>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-2xl focus:outline-none"
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}
      
      {product.reviews && product.reviews.length > 0 ? (
        <div className="space-y-4">
          {product.reviews.map((review) => (
            <div key={review._id} className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="font-semibold">{review.name}</div>
                <div className="ml-4 flex">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-500">
                      {i < review.rating ? '★' : '☆'}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
              <div className="text-sm text-gray-500 mt-2">
                {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
}
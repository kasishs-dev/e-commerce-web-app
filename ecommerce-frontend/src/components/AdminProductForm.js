// frontend/components/AdminProductForm.js
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProduct, updateProduct } from '../services/productService';

export default function AdminProductForm({ product, onCancel }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      countInStock: 0,
    }
  });
  
  const queryClient = useQueryClient();
  
  const mutation = useMutation(
    product ? updateProduct : createProduct, 
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        onCancel();
      }
    }
  );
  
  const onSubmit = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key][0]) {
        formData.append('image', data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    });
    
    if (product) {
      mutation.mutate({ id: product._id, productData: formData });
    } else {
      mutation.mutate(formData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          {...register('name', { required: 'Product name is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Price</label>
        <input
          type="number"
          step="0.01"
          {...register('price', { 
            required: 'Price is required',
            min: { value: 0, message: 'Price must be positive' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Image</label>
        <input
          type="file"
          {...register('image', { required: !product })}
          className="mt-1 block w-full"
        />
        {errors.image && <p className="text-red-500 text-xs">{errors.image.message}</p>}
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
        >
          {mutation.isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
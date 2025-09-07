// components/admin/ProductForm.js
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getFilterOptions } from '../../services/productService';

export default function ProductForm({ product, onSubmit, onCancel, isLoading }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: product || {
      name: '',
      description: '',
      price: 0,
      category: '',
      brand: '',
      countInStock: 0,
    }
  });

  const [imagePreview, setImagePreview] = useState(product?.image || '');
  const watchImage = watch('image');

  // Fetch dynamic categories and brands from API
  const { data: filterOptions } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: getFilterOptions,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = (data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key][0]) {
        formData.append('image', data[key][0]);
      } else {
        formData.append(key, data[key]);
      }
    });

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              {...register('name', { required: 'Product name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product name"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter product description"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              {...register('price', { 
                required: 'Price is required',
                min: { value: 0, message: 'Price must be positive' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              {filterOptions?.categories?.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <div className="space-y-2">
              <select
                {...register('brand')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    // Allow custom brand input
                    const customInput = document.getElementById('customBrand');
                    if (customInput) customInput.style.display = 'block';
                  } else {
                    const customInput = document.getElementById('customBrand');
                    if (customInput) customInput.style.display = 'none';
                  }
                }}
              >
                <option value="">Select Brand</option>
                {filterOptions?.brands?.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="custom">Custom Brand</option>
              </select>
              <input
                id="customBrand"
                type="text"
                placeholder="Enter custom brand name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ display: 'none' }}
                onBlur={(e) => {
                  if (e.target.value) {
                    // Set the custom brand value
                    const brandSelect = document.querySelector('select[name="brand"]');
                    if (brandSelect) {
                      brandSelect.value = e.target.value;
                    }
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity *
            </label>
            <input
              type="number"
              {...register('countInStock', { 
                required: 'Stock quantity is required',
                min: { value: 0, message: 'Stock cannot be negative' }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
            {errors.countInStock && <p className="text-red-500 text-xs mt-1">{errors.countInStock.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Image *
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('image', { required: !product })}
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image.message}</p>}
            
            {(imagePreview || watchImage?.[0]) && (
              <div className="mt-2">
                <img
                  src={imagePreview || URL.createObjectURL(watchImage[0])}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded border"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
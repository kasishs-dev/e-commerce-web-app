// pages/admin/products-enhanced.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { 
  getAllProducts, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  restoreProduct, 
  hardDeleteProduct 
} from '../../services/productService';
import ProductForm from '../../components/admin/ProductForm';
import { invalidateProductQueries } from '../../utils/queryUtils';

export default function AdminProductsEnhanced() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);

  // Fetch products (active or all including deleted)
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['adminProducts', showDeleted],
    queryFn: () => getAllProducts(showDeleted),
    enabled: !authLoading && isAuthenticated() && isAdmin(),
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
      setShowForm(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
      setEditingProduct(null);
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
    },
  });

  const hardDeleteMutation = useMutation({
    mutationFn: hardDeleteProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
    },
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated() || !isAdmin())) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleSoftDelete = (productId) => {
    if (confirm('Are you sure you want to soft delete this product?')) {
      deleteMutation.mutate(productId);
    }
  };

  const handleRestore = (productId) => {
    if (confirm('Are you sure you want to restore this product?')) {
      restoreMutation.mutate(productId);
    }
  };

  const handleHardDelete = (productId) => {
    if (confirm('Are you sure you want to permanently delete this product? This action cannot be undone!')) {
      hardDeleteMutation.mutate(productId);
    }
  };

  const handleSubmit = (productData) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setShowForm(false);
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
        <h1 className="text-3xl font-bold text-gray-800">Product Management</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg ${
              showDeleted 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {showDeleted ? 'Show Active Only' : 'Show Deleted Products'}
          </button>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Add New Product
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <ProductForm
            product={editingProduct}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </div>
      )}

      {productsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          Error: {productsError.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">
            {showDeleted ? 'Deleted Products' : 'Active Products'} 
            ({products?.length || 0})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="animate-pulse">Loading products...</div>
                  </td>
                </tr>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={product.image}
                            alt={product.name}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.countInStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Active' : 'Deleted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {product.isActive ? (
                        <>
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleSoftDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleRestore(product._id)}
                            className="text-green-600 hover:text-green-900"
                            disabled={restoreMutation.isPending}
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleHardDelete(product._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={hardDeleteMutation.isPending}
                          >
                            Permanently Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

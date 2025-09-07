// pages/admin/products.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../services/productService';
import ProductForm from '../../components/admin/ProductForm';
import ProductTable from '../../components/admin/ProductTable';
import { invalidateProductQueries } from '../../utils/queryUtils';

export default function AdminProducts() {
  const { user, isAdmin, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Always define hooks at the top level (no conditional hooks)
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: getAdminProducts,
    enabled: !authLoading && isAuthenticated() && isAdmin(), // Only fetch if authenticated admin
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
    onSuccess: (data) => {
      invalidateProductQueries(queryClient);
      setEditingProduct(null);
      setShowForm(false);
    },
    onError: (error) => {
      console.error('Error updating product:', error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidateProductQueries(queryClient);
    },
  });

  useEffect(() => {
    // Only redirect if auth check is complete and user is not admin
    if (!authLoading && (!isAuthenticated() || !isAdmin())) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, isAdmin, router]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(productId);
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading authentication...</div>
      </div>
    );
  }

  // Show access denied if not admin
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Product
          </button>
        )}
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

      <ProductTable
        products={products}
        isLoading={productsLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
// components/admin/ProductTable.js
export default function ProductTable({ products, isLoading, onEdit, onDelete, isDeleting }) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-semibold mb-4">No Products Found</h2>
        <p className="text-gray-600">Start by adding your first product!</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Products ({products.length})</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Image</th>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Category</th>
              <th className="text-left py-2">Price</th>
              <th className="text-left py-2">Stock</th>
              <th className="text-left py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              
              <tr key={product._id} className="border-b hover:bg-gray-50">
                <td className="py-2">
                  <img
                    src={product.image ? (product.image.startsWith('http') ? product.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${product.image}`) : '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="py-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                </td>
                <td className="py-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                    {product.category}
                  </span>
                </td>
                <td className="py-2 font-semibold">${product.price.toFixed(2)}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    product.countInStock > 10 
                      ? 'bg-green-100 text-green-800' 
                      : product.countInStock > 0 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {product.countInStock} in stock
                  </span>
                </td>
                <td className="py-2 space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(product._id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
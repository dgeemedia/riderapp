// admin/components/product/ProductManagement.jsx
import { useState } from 'react';
import { 
  ShoppingCartIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export default function ProductManagement({ products, vendors, loading, onRefresh }) {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const filteredProducts = products.filter(product => {
    // Tab filtering
    if (activeTab === 'in_stock') return product.in_stock === true;
    if (activeTab === 'out_of_stock') return product.in_stock === false;
    
    // Search filtering
    if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !product.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Vendor filtering
    if (selectedVendor !== 'all' && product.vendor_id !== selectedVendor) {
      return false;
    }
    
    return true;
  });

  const formatPrice = (priceBigInt) => {
    return `₦${(priceBigInt / 100).toLocaleString()}`;
  };

  const handleCreateProduct = async (productData) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleUpdateStock = async (productId, inStock) => {
    try {
      const token = localStorage.getItem('admin_token');
      await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ in_stock: inStock })
      });
      onRefresh();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  const getVendorName = (vendorId) => {
    const vendor = vendors.find(v => v.id === vendorId);
    return vendor ? vendor.business_name : 'Unknown Vendor';
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <ShoppingCartIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Product Management</h3>
              <p className="text-sm text-slate-400">
                {products.filter(p => p.in_stock).length} in stock, {products.filter(p => !p.in_stock).length} out of stock
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRefresh}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowPathIcon className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Filters and Search */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
            >
              <option value="all">All Vendors</option>
              {vendors.filter(v => v.is_approved).map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.business_name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-2">
            {['all', 'in_stock', 'out_of_stock'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'in_stock' ? 'In Stock' : 
                 tab === 'out_of_stock' ? 'Out of Stock' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-800/30 animate-pulse">
                <div className="h-4 bg-slate-700 rounded w-1/4 mb-4"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No products found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchTerm ? 'Try a different search term' : 
               selectedVendor !== 'all' ? 'No products for this vendor' : 
               activeTab !== 'all' ? 'No products in this category' : 'Add your first product'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
            >
              Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
                {product.image_url ? (
                  <div className="h-40 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 rounded-lg mb-4 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                    <ShoppingCartIcon className="w-12 h-12 text-slate-600" />
                  </div>
                )}
                
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-white truncate">{product.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      product.in_stock ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                    }`}>
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-2 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">{formatPrice(product.price_bigint)}</span>
                    <span className="text-sm text-slate-400">{product.category}</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">Vendor</p>
                  <p className="text-sm text-slate-300">{getVendorName(product.vendor_id)}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateStock(product.id, !product.in_stock)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      product.in_stock 
                        ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                    } transition-colors`}
                  >
                    {product.in_stock ? 'Mark Out of Stock' : 'Mark In Stock'}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowEditModal(true);
                    }}
                    className="p-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      {showCreateModal && (
        <CreateProductModal 
          vendors={vendors.filter(v => v.is_approved)}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProduct}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <EditProductModal 
          product={selectedProduct}
          vendors={vendors.filter(v => v.is_approved)}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleCreateProduct}
        />
      )}
    </div>
  );
}

// Create Product Modal Component
function CreateProductModal({ vendors, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    vendor_id: '',
    name: '',
    description: '',
    price: '',
    category: '',
    image_url: '',
    in_stock: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) * 100 // Convert to bigint
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const categories = ['Food', 'Groceries', 'Beverages', 'Snacks', 'Meals', 'Ingredients', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Add New Product</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <XCircleIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Vendor *
              </label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.business_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter product description"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="in_stock"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="in_stock" className="text-sm text-slate-300">
                Product is in stock
              </label>
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-700/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            Create Product
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Product Modal (similar but pre-filled)
function EditProductModal({ product, vendors, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    vendor_id: product.vendor_id,
    name: product.name,
    description: product.description || '',
    price: (product.price_bigint / 100).toString(),
    category: product.category || '',
    image_url: product.image_url || '',
    in_stock: product.in_stock
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      id: product.id,
      price: parseFloat(formData.price) * 100
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const categories = ['Food', 'Groceries', 'Beverages', 'Snacks', 'Meals', 'Ingredients', 'Other'];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Edit Product</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <XCircleIcon className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Same form fields as CreateProductModal but pre-filled */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Vendor *
              </label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.business_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter product name"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Enter product description"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Price (₦) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="in_stock"
                name="in_stock"
                checked={formData.in_stock}
                onChange={handleChange}
                className="w-4 h-4 text-purple-600 bg-slate-800 border-slate-700 rounded focus:ring-purple-500 focus:ring-2"
              />
              <label htmlFor="in_stock" className="text-sm text-slate-300">
                Product is in stock
              </label>
            </div>
          </div>
        </form>
        
        <div className="p-6 border-t border-slate-700/50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-shadow"
          >
            Update Product
          </button>
        </div>
      </div>
    </div>
  );
}
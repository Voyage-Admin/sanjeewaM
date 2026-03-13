import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Package, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  AlertTriangle,
  ArrowUpDown,
  Edit,
  Trash2,
  RefreshCw,
  Warehouse as WarehouseIcon,
  X,
  Loader2
} from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock_quantity: number;
  low_stock_threshold: number;
  warehouse_id: string;
  Warehouse: {
    name: string;
  };
}

const Inventory = () => {
  const location = useLocation();
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterWarehouse, setFilterWarehouse] = useState(location.state?.filterWarehouse || 'all');
  
  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    price: '',
    stock_quantity: '0',
    low_stock_threshold: '5',
    warehouse_id: ''
  });

  const [adjustmentValue, setAdjustmentValue] = useState('0');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [productsRes, warehousesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/products`, { headers }),
        axios.get(`${apiUrl}/api/warehouses`, { headers })
      ]);

      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/products`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        low_stock_threshold: parseInt(newProduct.low_stock_threshold),
        warehouse_id: newProduct.warehouse_id || warehouses[0]?.id
      }, { headers });

      setIsAddModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/products/${selectedProduct.id}`, {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        low_stock_threshold: parseInt(newProduct.low_stock_threshold),
      }, { headers });

      setIsEditModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${apiUrl}/api/products/${selectedProduct.id}`, { headers });

      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/products/${selectedProduct.id}/adjust-stock`, {
        adjustment: parseInt(adjustmentValue)
      }, { headers });

      setIsAdjustModalOpen(false);
      setAdjustmentValue('0');
      setSelectedProduct(null);
      fetchData();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('Error adjusting stock.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      sku: '',
      name: '',
      price: '',
      stock_quantity: '0',
      low_stock_threshold: '5',
      warehouse_id: ''
    });
    setSelectedProduct(null);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setNewProduct({
      sku: product.sku,
      name: product.name,
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      low_stock_threshold: product.low_stock_threshold.toString(),
      warehouse_id: warehouses.find(w => w.name === product.Warehouse?.name)?.id || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openAdjustModal = (product: Product) => {
    setSelectedProduct(product);
    setAdjustmentValue('0');
    setIsAdjustModalOpen(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWarehouse = filterWarehouse === 'all' || product.Warehouse?.name === filterWarehouse;
    return matchesSearch && matchesWarehouse;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-brand-600" />
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your products across all warehouses and shops.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by SKU or Product name..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select 
              className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none cursor-pointer"
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Warehouse</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading products...</td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No products found.</td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 font-bold">
                          {product.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-mono">{product.sku}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <WarehouseIcon className="w-4 h-4 text-gray-400" />
                        {product.Warehouse?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">Rs. {product.price.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${
                          product.stock_quantity <= product.low_stock_threshold ? 'bg-red-500' : 'bg-green-500'
                        }`}></span>
                        <span className={`text-sm font-semibold ${
                          product.stock_quantity <= product.low_stock_threshold ? 'text-red-600' : 'text-green-700'
                        }`}>
                          {product.stock_quantity} in stock
                        </span>
                        {product.stock_quantity <= product.low_stock_threshold && (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openAdjustModal(product)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="Adjust Stock"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openEditModal(product)}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteModal(product)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {isEditModalOpen ? <Edit className="w-5 h-5 text-brand-600" /> : <Plus className="w-5 h-5 text-brand-600" />}
                {isEditModalOpen ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateProduct : handleAddProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Product Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. Engine Oil 5L"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                    value={newProduct.name}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">SKU / Code</label>
                  <input 
                    required
                    type="text"
                    placeholder="e.g. OIL-5L-ENG"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-mono"
                    value={newProduct.sku}
                    onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Price (Rs.)</label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-semibold"
                    value={newProduct.price}
                    onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Warehouse / Shop</label>
                  <select 
                    required
                    disabled={isEditModalOpen}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none bg-white font-medium shadow-sm disabled:bg-gray-100"
                    value={newProduct.warehouse_id}
                    onChange={e => setNewProduct({...newProduct, warehouse_id: e.target.value})}
                  >
                    <option value="">Select Location</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Current Stock</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={newProduct.stock_quantity}
                    onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Low Stock Threshold</label>
                  <input 
                    required
                    type="number"
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={newProduct.low_stock_threshold}
                    onChange={e => setNewProduct({...newProduct, low_stock_threshold: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {isEditModalOpen ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditModalOpen ? 'Update Product' : 'Add Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Product</h2>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedProduct.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setSelectedProduct(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteProduct}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-brand-600" />
                Adjust Stock
              </h2>
              <button 
                onClick={() => { setIsAdjustModalOpen(false); setSelectedProduct(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-500">Adjusting stock for</p>
                <p className="text-lg font-bold text-gray-900">{selectedProduct.name}</p>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-700">
                  Current: {selectedProduct.stock_quantity}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Adjustment Amount</label>
                <div className="relative">
                  <input 
                    required
                    type="number"
                    placeholder="e.g. 10 or -5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-center text-2xl font-bold"
                    value={adjustmentValue}
                    onChange={e => setAdjustmentValue(e.target.value)}
                  />
                  <p className="text-xs text-center text-gray-400 mt-2">
                    Use positive numbers to add stock, and negative numbers to subtract.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => { setIsAdjustModalOpen(false); setSelectedProduct(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

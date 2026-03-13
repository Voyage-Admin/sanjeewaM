import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Warehouse as WarehouseIcon, 
  Plus, 
  MapPin, 
  Package, 
  MoreHorizontal,
  RefreshCw,
  Building2,
  Trash2,
  Edit,
  X,
  Loader2
} from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  location: string;
  description: string;
  Products?: any[];
}

const Warehouses = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    description: ''
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get('http://localhost:5000/api/warehouses', { headers });
      setWarehouses(response.data);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/warehouses`, newWarehouse, { headers });

      setIsAddModalOpen(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error adding warehouse:', error);
      alert('Error adding warehouse. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarehouse) return;

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/warehouses/${selectedWarehouse.id}`, newWarehouse, { headers });

      setIsEditModalOpen(false);
      resetForm();
      fetchWarehouses();
    } catch (error) {
      console.error('Error updating warehouse:', error);
      alert('Error updating warehouse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!selectedWarehouse) return;

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${apiUrl}/api/warehouses/${selectedWarehouse.id}`, { headers });

      setIsDeleteModalOpen(false);
      setSelectedWarehouse(null);
      fetchWarehouses();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      alert('Error deleting warehouse. Make sure it has no products associated.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewWarehouse({ name: '', location: '', description: '' });
    setSelectedWarehouse(null);
  };

  const openEditModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setNewWarehouse({
      name: warehouse.name,
      location: warehouse.location,
      description: warehouse.description
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-brand-600" />
            Warehouses & Shops
          </h1>
          <p className="text-gray-500 mt-1">Manage physical locations and monitor stock distribution.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={fetchWarehouses}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors shadow-sm"
            >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
            >
            <Plus className="w-5 h-5" />
            Add Location
            </button>
        </div>
      </div>

      {/* Stats Cards for Warehouses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
             [1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl"></div>
             ))
        ) : warehouses.length === 0 ? (
            <div className="col-span-full py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-center text-gray-400">
                No warehouses or shops configured yet.
            </div>
        ) : (
            warehouses.map((warehouse) => (
                <div key={warehouse.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group relative overflow-hidden">
                    <div className="flex items-start justify-between relative z-10">
                        <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => openEditModal(warehouse)}
                                className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => openDeleteModal(warehouse)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 relative z-10">
                        <h3 className="text-lg font-bold text-gray-900">{warehouse.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4" />
                            {warehouse.location}
                        </div>
                        <p className="text-sm text-gray-400 mt-3 line-clamp-2">{warehouse.description}</p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-50 flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-700">
                            <Package className="w-4 h-4" />
                            {warehouse.Products?.length || 0} Products
                        </div>
                        <button 
                            onClick={() => navigate('/inventory', { state: { filterWarehouse: warehouse.name } })}
                            className="text-xs font-bold text-gray-400 hover:text-brand-600 uppercase tracking-wider"
                        >
                            Manage Stock
                        </button>
                    </div>

                    {/* Accents */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50/50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform"></div>
                </div>
            ))
        )}
      </div>

      {/* Add/Edit Warehouse Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {isEditModalOpen ? <Edit className="w-5 h-5 text-brand-600" /> : <Plus className="w-5 h-5 text-brand-600" />}
                {isEditModalOpen ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button 
                onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); resetForm(); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={isEditModalOpen ? handleUpdateWarehouse : handleAddWarehouse} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Location Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Main Warehouse or Kandy Shop"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all font-medium"
                  value={newWarehouse.name}
                  onChange={e => setNewWarehouse({...newWarehouse, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Location / Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    type="text"
                    placeholder="City or Full Address"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                    value={newWarehouse.location}
                    onChange={e => setNewWarehouse({...newWarehouse, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Description (Optional)</label>
                <textarea 
                  placeholder="Brief description of the location..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                  value={newWarehouse.description}
                  onChange={e => setNewWarehouse({...newWarehouse, description: e.target.value})}
                />
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
                      Processing...
                    </>
                  ) : (
                    isEditModalOpen ? 'Update Location' : 'Add Location'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Location</h2>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedWarehouse.name}</span>? All products in this location will become unassigned.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => { setIsDeleteModalOpen(false); setSelectedWarehouse(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteWarehouse}
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
    </div>
  );
};

export default Warehouses;

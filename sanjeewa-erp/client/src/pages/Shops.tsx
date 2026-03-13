import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Store, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  Phone,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface Shop {
  id: string;
  name: string;
  phone: string;
  address: string;
  note: string;
}

const Shops = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    note: ''
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/shops`, { headers });
      setShops(res.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (shop?: Shop) => {
    if (shop) {
      setSelectedShop(shop);
      setFormData({
        name: shop.name,
        phone: shop.phone || '',
        address: shop.address || '',
        note: shop.note || ''
      });
    } else {
      setSelectedShop(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
        note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (selectedShop) {
        await axios.put(`${apiUrl}/api/shops/${selectedShop.id}`, formData, { headers });
      } else {
        await axios.post(`${apiUrl}/api/shops`, formData, { headers });
      }

      setIsModalOpen(false);
      fetchShops();
    } catch (error: any) {
      console.error('Error saving shop:', error);
      alert(error.response?.data?.message || 'Error saving shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedShop) return;
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.delete(`${apiUrl}/api/shops/${selectedShop.id}`, { headers });
      setIsDeleteModalOpen(false);
      fetchShops();
    } catch (error: any) {
      console.error('Error deleting shop:', error);
      alert(error.response?.data?.message || 'Error deleting shop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredShops = shops.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.address && s.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-6 h-6 text-brand-600" />
            Shop Management
          </h1>
          <p className="text-gray-500 mt-1">Manage your storefronts, locations, and retail notes.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New Shop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or address..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchShops}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Shop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-4" />
            <p>Loading shop records...</p>
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
            No shops found matching your search.
          </div>
        ) : (
          filteredShops.map((shop) => (
            <div key={shop.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group">
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-brand-50 rounded-xl text-brand-600">
                          <Store className="w-6 h-6" />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenModal(shop)}
                            className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => { setSelectedShop(shop); setIsDeleteModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>

                   <h3 className="text-lg font-bold text-gray-900 truncate">{shop.name}</h3>
                   <div className="space-y-2 mt-4">
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                         <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                         <span>{shop.phone || 'No phone number'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-500">
                         <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                         <span className="line-clamp-2">{shop.address || 'No address provided'}</span>
                      </div>
                   </div>
                </div>

                {shop.note && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                            <ClipboardList className="w-3.5 h-3.5" />
                            Internal Note
                        </div>
                        <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                            "{shop.note}"
                        </p>
                    </div>
                )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {selectedShop ? <Edit className="w-5 h-5 text-brand-600" /> : <Plus className="w-5 h-5 text-brand-600" />}
                {selectedShop ? 'Edit Shop' : 'Add New Shop'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Shop Name</label>
                <input 
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                  placeholder="e.g. Kandy Retail Front"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="General contact phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Physical Address</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
                  placeholder="Street address, City"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Additional Notes</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white resize-none"
                  placeholder="Any internal info about this location..."
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    selectedShop ? 'Update Shop' : 'Create Shop'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Remove Shop?</h2>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedShop.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Shop'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shops;

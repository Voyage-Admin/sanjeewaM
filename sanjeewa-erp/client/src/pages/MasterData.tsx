import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Settings2, 
  Layers, 
  ChevronRight, 
  Map, 
  Box, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Loader2, 
  LayoutGrid,
  Database,
  Tag,
  Warehouse,
  X
} from 'lucide-react';

type EntityType = 'categories' | 'sub-categories' | 'departments' | 'sub-departments' | 'bins' | 'racks';

interface MasterItem {
  id: string;
  name: string;
  description?: string;
  category_id?: string;
  department_id?: string;
  warehouse_id?: string;
  Category?: { name: string };
  Department?: { name: string };
  Warehouse?: { name: string };
}

const MasterData = () => {
  const [activeTab, setActiveTab] = useState<EntityType>('categories');
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Auxiliary data for dropdowns
  const [parents, setParents] = useState<MasterItem[]>([]);
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MasterItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    department_id: '',
    warehouse_id: ''
  });

  const tabs: {id: EntityType, label: string, icon: any}[] = [
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'sub-categories', label: 'Sub Categories', icon: Layers },
    { id: 'departments', label: 'Departments', icon: LayoutGrid },
    { id: 'sub-departments', label: 'Sub Departments', icon: Settings2 },
    { id: 'bins', label: 'Bins', icon: Box },
    { id: 'racks', label: 'Racks', icon: Map },
  ];

  useEffect(() => {
    fetchItems();
    if (['sub-categories', 'sub-departments', 'bins', 'racks'].includes(activeTab)) {
        fetchAuxiliaryData();
    }
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/master/${activeTab}`, { headers });
      setItems(res.data);
    } catch (error) {
      console.error('Error fetching master data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliaryData = async () => {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (activeTab === 'sub-categories') {
          const res = await axios.get(`${apiUrl}/api/master/categories`, { headers });
          setParents(res.data);
      } else if (activeTab === 'sub-departments') {
          const res = await axios.get(`${apiUrl}/api/master/departments`, { headers });
          setParents(res.data);
      } else if (activeTab === 'bins' || activeTab === 'racks') {
          const res = await axios.get(`${apiUrl}/api/warehouses`, { headers });
          setWarehouses(res.data);
      }
  };

  const handleOpenModal = (item?: MasterItem) => {
    if (item) {
        setSelectedItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            category_id: item.category_id || '',
            department_id: item.department_id || '',
            warehouse_id: item.warehouse_id || ''
        });
    } else {
        setSelectedItem(null);
        setFormData({
            name: '',
            description: '',
            category_id: '',
            department_id: '',
            warehouse_id: ''
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

          if (selectedItem) {
              await axios.put(`${apiUrl}/api/master/${activeTab}/${selectedItem.id}`, formData, { headers });
          } else {
              await axios.post(`${apiUrl}/api/master/${activeTab}`, formData, { headers });
          }

          setIsModalOpen(false);
          fetchItems();
      } catch (error: any) {
          alert(error.response?.data?.message || 'Error saving master data');
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this item?')) return;
      try {
          const token = JSON.parse(localStorage.getItem('user') || '{}').token;
          const headers = { Authorization: `Bearer ${token}` };
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

          await axios.delete(`${apiUrl}/api/master/${activeTab}/${id}`, { headers });
          fetchItems();
      } catch (error: any) {
          alert(error.response?.data?.message || 'Error deleting item');
      }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-6 h-6 text-brand-600" />
            Master Data Configuration
          </h1>
          <p className="text-gray-500 mt-1">Configure your system's core organizational hierarchies.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Add {activeTab.replace('-', ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchTerm(''); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-brand-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab.replace('-', ' ')}...`}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                {['sub-categories', 'sub-departments', 'bins', 'racks'].includes(activeTab) && (
                    <th className="px-6 py-4">Parent / Warehouse</th>
                )}
                {['categories', 'departments', 'bins', 'racks'].includes(activeTab) && (
                    <th className="px-6 py-4">Description</th>
                )}
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No records found in this section.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{item.name}</td>
                    {activeTab === 'sub-categories' && (
                        <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg font-medium">{item.Category?.name || 'N/A'}</span>
                        </td>
                    )}
                    {activeTab === 'sub-departments' && (
                        <td className="px-6 py-4 text-sm text-gray-600">
                            <span className="bg-purple-50 text-purple-600 px-2.5 py-1 rounded-lg font-medium">{item.Department?.name || 'N/A'}</span>
                        </td>
                    )}
                    {(activeTab === 'bins' || activeTab === 'racks') && (
                        <td className="px-6 py-4 text-sm text-gray-600">
                             <div className="flex items-center gap-1.5 text-orange-600">
                                <Warehouse className="w-3.5 h-3.5" />
                                <span className="font-medium">{item.Warehouse?.name || 'N/A'}</span>
                             </div>
                        </td>
                    )}
                    {['categories', 'departments', 'bins', 'racks'].includes(activeTab) && (
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{item.description || '-'}</td>
                    )}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Common Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {selectedItem ? 'Edit ' : 'Add '} {activeTab.replace('-', ' ').slice(0, -1)}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Name</label>
                <input 
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              {activeTab === 'sub-categories' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Parent Category</label>
                    <select 
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.category_id}
                        onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    >
                        <option value="">Select Category</option>
                        {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
              )}

              {activeTab === 'sub-departments' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Parent Department</label>
                    <select 
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.department_id}
                        onChange={(e) => setFormData({...formData, department_id: e.target.value})}
                    >
                        <option value="">Select Department</option>
                        {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
              )}

              {(activeTab === 'bins' || activeTab === 'racks') && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Warehouse Location</label>
                    <select 
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({...formData, warehouse_id: e.target.value})}
                    >
                        <option value="">Select Warehouse</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                  </div>
              )}

              {['categories', 'departments', 'bins', 'racks'].includes(activeTab) && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700">Description</label>
                    <textarea 
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {selectedItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;

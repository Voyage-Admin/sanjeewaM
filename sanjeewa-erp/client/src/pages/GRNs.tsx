import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Truck, 
  Search, 
  Plus, 
  RefreshCw, 
  Trash2, 
  X, 
  Loader2, 
  Calendar,
  User as UserIcon,
  Package,
  ArrowRight,
  Eye,
  FileText,
  Warehouse as WarehouseIcon,
  AlertCircle
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
}

interface Warehouse {
  id: string;
  name: string;
}

interface GRNItem {
  id?: string;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  Product?: { name: string, sku: string };
  Warehouse?: { name: string };
}

interface GRN {
  id: string;
  grn_number: string;
  receive_date: string;
  total_amount: number;
  status: string;
  note: string;
  Supplier: { name: string };
  GRNItems?: GRNItem[];
}

const GRNs = () => {
  const [grns, setGrns] = useState<GRN[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data for creation
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  // New GRN form state
  const [formData, setFormData] = useState({
    grn_number: `GRN-${Date.now().toString().slice(-6)}`,
    supplier_id: '',
    receive_date: new Date().toISOString().split('T')[0],
    note: '',
    items: [] as GRNItem[]
  });

  useEffect(() => {
    fetchGRNs();
    fetchInitialData();
  }, []);

  const fetchGRNs = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/grns`, { headers });
      setGrns(res.data);
    } catch (error) {
      console.error('Error fetching GRNs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInitialData = async () => {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      try {
          const [sRes, pRes, wRes] = await Promise.all([
              axios.get(`${apiUrl}/api/suppliers`, { headers }),
              axios.get(`${apiUrl}/api/inventory`, { headers }),
              axios.get(`${apiUrl}/api/warehouses`, { headers })
          ]);
          setSuppliers(sRes.data);
          setProducts(pRes.data);
          setWarehouses(wRes.data);
      } catch (error) {
          console.error('Error fetching creation data:', error);
      }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { product_id: '', warehouse_id: '', quantity: 1, unit_price: 0, total_price: 0 }
      ]
    });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index: number, field: keyof GRNItem, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };
    
    // Auto-calculate total price
    if (field === 'quantity' || field === 'unit_price') {
      item.total_price = (item.quantity || 0) * (item.unit_price || 0);
    }
    
    // Auto-fill price if product changes
    if (field === 'product_id') {
        const prod = products.find(p => p.id === value);
        if (prod) item.unit_price = prod.price;
        item.total_price = (item.quantity || 0) * (item.unit_price || 0);
    }

    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.items.length === 0) return alert('Please add at least one item');
    
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.post(`${apiUrl}/api/grns`, formData, { headers });
      setIsModalOpen(false);
      fetchGRNs();
      // Reset form
      setFormData({
          grn_number: `GRN-${Date.now().toString().slice(-6)}`,
          supplier_id: '',
          receive_date: new Date().toISOString().split('T')[0],
          note: '',
          items: []
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating GRN');
    } finally {
      setIsSubmitting(false);
    }
  };

  const viewDetail = async (grn: GRN) => {
      try {
          const token = JSON.parse(localStorage.getItem('user') || '{}').token;
          const headers = { Authorization: `Bearer ${token}` };
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await axios.get(`${apiUrl}/api/grns/${grn.id}`, { headers });
          setSelectedGRN(res.data);
          setIsDetailModalOpen(true);
      } catch (error) {
          console.error('Error details:', error);
      }
  };

  const filteredGRNs = grns.filter(g => 
    g.grn_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.Supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-600" />
            Goods Receive Notes (GRN)
          </h1>
          <p className="text-gray-500 mt-1">Accept and record new stock deliveries from suppliers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New GRN
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by GRN # or supplier..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchGRNs}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">GRN Number</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading GRN logs...
                  </td>
                </tr>
              ) : filteredGRNs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No receive records found.
                  </td>
                </tr>
              ) : (
                filteredGRNs.map((grn) => (
                  <tr key={grn.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-brand-700">{grn.grn_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{grn.Supplier?.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(grn.receive_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">Rs. {Number(grn.total_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-xs font-bold">
                        {grn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => viewDetail(grn)}
                        className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row h-[90vh]">
            {/* Left: Metadata */}
            <div className="md:w-1/3 bg-gray-50/50 border-r border-gray-100 p-8 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-brand-100 text-brand-600 rounded-2xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">New GRN</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Supplier</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select 
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all appearance-none bg-white"
                        value={formData.supplier_id}
                        onChange={(e) => setFormData({...formData, supplier_id: e.target.value})}
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Receive Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="date"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-white"
                        value={formData.receive_date}
                        onChange={(e) => setFormData({...formData, receive_date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">GRN Number</label>
                    <input 
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-100 text-gray-600 font-mono outline-none"
                      value={formData.grn_number}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-200 mt-8">
                  <p className="text-xs text-gray-400 italic flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Stock levels will be updated upon submission.
                  </p>
              </div>
            </div>

            {/* Right: Items Table */}
            <div className="flex-1 flex flex-col p-8 overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-gray-900 flex items-center gap-2">
                   <Package className="w-5 h-5 text-brand-600" />
                   Delivery Items
                 </h3>
                 <button 
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-bold bg-brand-50 px-4 py-2 rounded-xl transition-all"
                 >
                   <Plus className="w-4 h-4" />
                   Add Product
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group">
                       <div className="col-span-4 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Product</label>
                          <select 
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                            value={item.product_id}
                            onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          >
                            <option value="">Choose...</option>
                            {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                          </select>
                       </div>
                       <div className="col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">To Warehouse</label>
                          <select 
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                            value={item.warehouse_id}
                            onChange={(e) => handleItemChange(index, 'warehouse_id', e.target.value)}
                          >
                            <option value="">Location...</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                       </div>
                       <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Qty</label>
                          <input 
                            type="number"
                            min="1"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          />
                       </div>
                       <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Price</label>
                          <input 
                            type="number"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl outline-none text-sm font-bold"
                            value={item.unit_price}
                            onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                          />
                       </div>
                       <div className="col-span-1 flex items-end justify-center pb-1">
                          <button 
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </div>
                  ))}
                  {formData.items.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl py-12">
                      <Package className="w-12 h-12 mb-4 opacity-20" />
                      <p>Start by adding items from the delivery.</p>
                    </div>
                  )}
               </div>

               <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-500">Total Purchase Value</span>
                    <h3 className="text-2xl font-black text-gray-900">
                      Rs. {formData.items.reduce((sum, i) => sum + (i.total_price || 0), 0).toLocaleString()}
                    </h3>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 rounded-2xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-all"
                    >
                      Discard
                    </button>
                    <button 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-10 py-3 rounded-2xl bg-brand-600 text-white font-black hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all flex items-center gap-2 disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Receipt'}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedGRN && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <span className="text-xs font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full">Receive Note</span>
                        <h2 className="text-3xl font-black text-gray-900 mt-2">{selectedGRN.grn_number}</h2>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <Calendar className="w-4 h-4" />
                                {new Date(selectedGRN.receive_date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                <UserIcon className="w-4 h-4" />
                                {selectedGRN.Supplier?.name}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => setIsDetailModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-gray-50 rounded-3xl border border-gray-100 p-6 mb-8">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Stock Breakdown</h4>
                    <div className="space-y-4">
                        {selectedGRN.GRNItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 font-bold">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.Product?.name}</p>
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <WarehouseIcon className="w-3 h-3" />
                                            Store in {item.Warehouse?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900">{item.quantity} Units</p>
                                    <p className="text-xs text-brand-600 font-bold">@ Rs. {Number(item.unit_price).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase">Total Bill Amount</p>
                        <p className="text-3xl font-black text-gray-900">Rs. {Number(selectedGRN.total_amount).toLocaleString()}</p>
                    </div>
                    <button 
                        onClick={() => setIsDetailModalOpen(false)}
                        className="px-10 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all"
                    >
                        Done
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default GRNs;

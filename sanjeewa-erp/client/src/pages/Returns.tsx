import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  RotateCcw, 
  Search, 
  Plus, 
  RefreshCw, 
  X, 
  Loader2, 
  Calendar,
  Package,
  ArrowRight,
  Eye,
  FileText,
  Truck,
  User as UserIcon,
  AlertCircle,
  Undo2,
  CheckCircle2
} from 'lucide-react';

interface ReturnItem {
  id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  Product?: { name: string, sku: string };
}

interface SalesReturn {
  id: string;
  return_number: string;
  invoice_id: string;
  return_date: string;
  total_refund_amount: number;
  reason: string;
  status: string;
  Invoice: { invoice_number: string };
  SalesReturnItems?: ReturnItem[];
}

interface SupplierReturn {
  id: string;
  return_number: string;
  grn_id: string;
  return_date: string;
  total_credit_amount: number;
  reason: string;
  status: string;
  GRN: { grn_number: string };
  SupplierReturnItems?: ReturnItem[];
}

const Returns = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'supplier'>('sales');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [supplierReturns, setSupplierReturns] = useState<SupplierReturn[]>([]);
  
  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoices, setInvoices] = useState<{id: string, invoice_number: string, items: any[]}[]>([]);
  const [grns, setGrns] = useState<{id: string, grn_number: string, GRNItems: any[]}[]>([]);

  const [formData, setFormData] = useState({
    parent_id: '', // invoice_id or grn_id
    reason: '',
    items: [] as any[]
  });

  useEffect(() => {
    fetchReturns();
    fetchSelectionData();
  }, [activeTab]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/returns/${activeTab}`, { headers });
      if (activeTab === 'sales') setSalesReturns(res.data);
      else setSupplierReturns(res.data);
    } catch (error) {
      console.error('Error fetching returns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSelectionData = async () => {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      try {
          if (activeTab === 'sales') {
              const res = await axios.get(`${apiUrl}/api/invoices`, { headers });
              setInvoices(res.data);
          } else {
              const res = await axios.get(`${apiUrl}/api/grns`, { headers });
              setGrns(res.data);
          }
      } catch (error) {
          console.error('Error fetching selection data:', error);
      }
  };

  const handleParentChange = (id: string) => {
      setFormData({ ...formData, parent_id: id, items: [] });
      if (activeTab === 'sales') {
          const inv = invoices.find(i => i.id === id);
          if (inv) {
              setFormData(prev => ({
                  ...prev,
                  parent_id: id,
                  items: inv.items.map(item => ({
                      product_id: item.product_id,
                      name: item.Product.name,
                      sku: item.Product.sku,
                      max_qty: item.quantity,
                      quantity: 0,
                      unit_price: item.unit_price
                  }))
              }));
          }
      } else {
          const grn = grns.find(g => g.id === id);
          if (grn) {
              setFormData(prev => ({
                  ...prev,
                  parent_id: id,
                  items: grn.GRNItems.map(item => ({
                      product_id: item.product_id,
                      name: item.Product.name,
                      sku: item.Product.sku,
                      max_qty: item.quantity,
                      quantity: 0,
                      unit_price: item.unit_price
                  }))
              }));
          }
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const returnItems = formData.items.filter(i => i.quantity > 0);
      if (returnItems.length === 0) return alert('Please specify quantity for at least one item');

      try {
          setIsSubmitting(true);
          const token = JSON.parse(localStorage.getItem('user') || '{}').token;
          const headers = { Authorization: `Bearer ${token}` };
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

          const payload = {
              [activeTab === 'sales' ? 'invoice_id' : 'grn_id']: formData.parent_id,
              return_number: `${activeTab.toUpperCase()}-RET-${Date.now().toString().slice(-6)}`,
              reason: formData.reason,
              items: returnItems
          };

          await axios.post(`${apiUrl}/api/returns/${activeTab}`, payload, { headers });
          setIsModalOpen(false);
          fetchReturns();
          setFormData({ parent_id: '', reason: '', items: [] });
      } catch (error: any) {
          alert(error.response?.data?.message || 'Error processing return');
      } finally {
          setIsSubmitting(false);
      }
  };

  const currentList = activeTab === 'sales' ? salesReturns : supplierReturns;
  const filteredList = currentList.filter(r => 
    r.return_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (activeTab === 'sales' ? (r as SalesReturn).Invoice?.invoice_number : (r as SupplierReturn).GRN?.grn_number).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-brand-600" />
            Returns & Exchanges
          </h1>
          <p className="text-gray-500 mt-1">Manage product returns and supplier credits.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Process New Return
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('sales')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'sales' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Undo2 className="w-4 h-4" />
          Sales Returns
        </button>
        <button
          onClick={() => setActiveTab('supplier')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'supplier' ? 'bg-white text-brand-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Truck className="w-4 h-4" />
          Supplier Returns
        </button>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder={`Search ${activeTab} returns...`}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={fetchReturns}
            className="p-2 hover:bg-white rounded-lg text-gray-400 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Return #</th>
                <th className="px-6 py-4">{activeTab === 'sales' ? 'Invoice #' : 'GRN #'}</th>
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
                    Loading records...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No return records found.
                  </td>
                </tr>
              ) : (
                filteredList.map((ret) => (
                  <tr key={ret.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{ret.return_number}</td>
                    <td className="px-6 py-4 text-sm text-brand-600 font-medium">
                        {activeTab === 'sales' ? (ret as SalesReturn).Invoice?.invoice_number : (ret as SupplierReturn).GRN?.grn_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(ret.return_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                        Rs. {(activeTab === 'sales' ? (ret as SalesReturn).total_refund_amount : (ret as SupplierReturn).total_credit_amount).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all">
                          <Eye className="w-5 h-5"/>
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh]">
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h2 className="text-xl font-black text-gray-900">Process {activeTab === 'sales' ? 'Sales' : 'Supplier'} Return</h2>
                  <p className="text-xs text-gray-500 mt-1 font-medium">Stock will be automatically reconciled upon completion.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-2xl text-gray-400">
                 <X className="w-6 h-6" />
               </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
               {/* Selection Side */}
               <div className="md:w-1/3 p-8 border-r border-gray-100 bg-gray-50/30 space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select {activeTab === 'sales' ? 'Invoice' : 'GRN'}</label>
                    <select 
                        required
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white"
                        value={formData.parent_id}
                        onChange={e => handleParentChange(e.target.value)}
                    >
                        <option value="">Choose Reference...</option>
                        {activeTab === 'sales' 
                            ? invoices.map(i => <option key={i.id} value={i.id}>{i.invoice_number}</option>)
                            : grns.map(g => <option key={g.id} value={g.id}>{g.grn_number}</option>)
                        }
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Reason for Return</label>
                    <textarea 
                        rows={3}
                        placeholder="E.g., Damaged, Incorrect item, Excess stock..."
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none text-sm bg-white resize-none"
                        value={formData.reason}
                        onChange={e => setFormData({...formData, reason: e.target.value})}
                    />
                  </div>

                  {formData.parent_id && (
                      <div className="p-4 bg-brand-50 rounded-2xl border border-brand-100 mt-auto">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-brand-700 leading-relaxed font-medium">
                                Specify the quantity being returned for each item. Items with 0 quantity will be ignored.
                            </p>
                        </div>
                      </div>
                  )}
               </div>

               {/* Items Side */}
               <div className="flex-1 p-8 flex flex-col overflow-hidden">
                  <h3 className="font-black text-gray-900 flex items-center gap-2 mb-6">
                    <Package className="w-5 h-5 text-brand-600" />
                    Eligible Items
                  </h3>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                    {formData.items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                             <Undo2 className="w-12 h-12 mb-4 opacity-20" />
                             <p className="font-bold">Select a reference to load items</p>
                        </div>
                    ) : (
                        formData.items.map((item, idx) => (
                            <div key={idx} className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between group hover:border-brand-200 transition-all shadow-sm">
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">{item.sku}</p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase">Return Qty</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <input 
                                                type="number"
                                                min="0"
                                                max={item.max_qty}
                                                className="w-16 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-center font-black text-brand-600 outline-none focus:ring-2 focus:ring-brand-500"
                                                value={item.quantity}
                                                onChange={e => {
                                                    const val = Math.min(item.max_qty, Math.max(0, parseInt(e.target.value) || 0));
                                                    const newItems = [...formData.items];
                                                    newItems[idx].quantity = val;
                                                    setFormData({...formData, items: newItems});
                                                }}
                                            />
                                            <span className="text-xs text-gray-400 font-bold">/ {item.max_qty}</span>
                                        </div>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                         <p className="text-[10px] font-black text-gray-400 uppercase">Refund/Credit</p>
                                         <p className="text-sm font-black text-gray-900 mt-1">Rs. {(item.quantity * item.unit_price).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Transaction Value</p>
                        <p className="text-3xl font-black text-gray-900">
                            Rs. {formData.items.reduce((sum, i) => sum + (i.quantity * i.unit_price), 0).toLocaleString()}
                        </p>
                     </div>
                     <div className="flex gap-4">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            className="px-8 py-3.5 rounded-2xl border border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.parent_id}
                            className="px-10 py-3.5 rounded-2xl bg-brand-600 text-white font-black hover:bg-brand-700 shadow-xl shadow-brand-100 disabled:opacity-50 transition-all flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Complete Return
                        </button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Returns;

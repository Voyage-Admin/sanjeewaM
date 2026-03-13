import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  Search, 
  Plus, 
  Filter, 
  RefreshCw,
  X,
  Loader2,
  Calendar,
  User as UserIcon,
  Warehouse as WarehouseIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Printer,
  Trash2
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  Product: {
    name: string;
    sku: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  discount_percentage: number;
  status: 'PENDING' | 'PARTIAL' | 'APPROVED' | 'CANCELLED';
  due_date: string;
  createdAt: string;
  User: {
    name: string;
  };
  Warehouse: {
    name: string;
  };
  items: InvoiceItem[];
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock_quantity: number;
  warehouse_id: string;
}

interface Warehouse {
  id: string;
  name: string;
}

const Invoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [productSearchTerm, setProductSearchTerm] = useState('');
  
  // Create Invoice State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    shop_id: '',
    items: [] as { product_id: string; quantity: number; price: number; name: string }[],
    discount_percentage: 0,
    paid_amount: 0,
    due_date: new Date().toISOString().split('T')[0]
  });

  // Details Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const [invoicesRes, productsRes, warehousesRes] = await Promise.all([
        axios.get(`${apiUrl}/api/invoices`, { headers }),
        axios.get(`${apiUrl}/api/products`, { headers }),
        axios.get(`${apiUrl}/api/warehouses`, { headers })
      ]);

      setInvoices(invoicesRes.data);
      setProducts(productsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error('Error fetching invoice data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newInvoice.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.post(`${apiUrl}/api/invoices`, newInvoice, { headers });

      setIsCreateModalOpen(false);
      resetNewInvoice();
      fetchData();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      alert(error.response?.data?.message || 'Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!window.confirm('Are you sure? This will restore stock levels.')) return;

    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.delete(`${apiUrl}/api/invoices/${id}`, { headers });
      fetchData();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      alert('Error deleting invoice');
    }
  };

  const resetNewInvoice = () => {
    setNewInvoice({
      shop_id: '',
      items: [],
      discount_percentage: 0,
      paid_amount: 0,
      due_date: new Date().toISOString().split('T')[0]
    });
  };

  const addItemToInvoice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    if (product.stock_quantity <= 0) {
        alert('Product out of stock');
        return;
    }

    const existingItem = newInvoice.items.find(item => item.product_id === productId);
    if (existingItem) {
      setNewInvoice({
        ...newInvoice,
        items: newInvoice.items.map(item => 
          item.product_id === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      });
    } else {
      setNewInvoice({
        ...newInvoice,
        items: [...newInvoice.items, { 
          product_id: productId, 
          quantity: 1, 
          price: product.price,
          name: product.name
        }]
      });
    }
  };

  const removeItemFromInvoice = (productId: string) => {
    setNewInvoice({
      ...newInvoice,
      items: newInvoice.items.filter(item => item.product_id !== productId)
    });
  };

  const calculateSubtotal = () => {
    return newInvoice.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal * (1 - newInvoice.discount_percentage / 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Paid</span>;
      case 'PENDING':
        return <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> Pending</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 bg-gray-50 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.User.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-brand-600" />
            Invoices & Sales
          </h1>
          <p className="text-gray-500 mt-1">Generate and track sales invoices across all locations.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Create New Invoice
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by invoice number or customer..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchData}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading invoices...</td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No invoices found.</td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{invoice.invoice_number}</span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3"/> {new Date(invoice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <UserIcon className="w-4 h-4 text-gray-400" />
                        {invoice.User.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <WarehouseIcon className="w-4 h-4 text-gray-400" />
                        {invoice.Warehouse.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">Rs. {Number(invoice.total_amount).toLocaleString()}</span>
                        {invoice.discount_percentage > 0 && (
                          <span className="text-[10px] text-green-600 font-bold">-{invoice.discount_percentage}% OFF</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 outline-none">
                        <button 
                          onClick={() => { setSelectedInvoice(invoice); setIsDetailsModalOpen(true); }}
                          className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteInvoice(invoice.id)}
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

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-brand-600" />
                Create New Invoice
              </h2>
              <button 
                onClick={() => { setIsCreateModalOpen(false); resetNewInvoice(); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
              {/* Left Side: Product Selection */}
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Select Location</label>
                  <select 
                    required
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newInvoice.shop_id}
                    onChange={e => setNewInvoice({...newInvoice, shop_id: e.target.value})}
                  >
                    <option value="">Select Location</option>
                    {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5 flex-1 flex flex-col">
                  <label className="text-sm font-semibold text-gray-700">Add Products</label>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-brand-500"
                        value={productSearchTerm}
                        onChange={e => setProductSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto pr-2 flex-1">
                    {!newInvoice.shop_id ? (
                        <div className="col-span-full py-10 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-xl">
                            Please select a location first
                        </div>
                    ) : products
                        .filter(p => p.warehouse_id === newInvoice.shop_id) // Assuming Product model has warehouse_id
                        .filter(p => p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) || p.sku.toLowerCase().includes(productSearchTerm.toLowerCase()))
                        .filter(p => !newInvoice.items.find(i => i.product_id === p.id))
                        .map(product => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addItemToInvoice(product.id)}
                        className="p-3 bg-gray-50 border border-gray-100 rounded-xl hover:bg-brand-50 hover:border-brand-100 text-left transition-all group"
                      >
                        <p className="text-sm font-bold text-gray-900 group-hover:text-brand-700">{product.name}</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">{product.sku}</span>
                          <span className="text-xs font-bold text-brand-600">Rs. {product.price.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Invoice Items & Summary */}
              <div className="w-full md:w-80 space-y-6 flex flex-col">
                <div className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-100 overflow-y-auto min-h-[300px]">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center justify-between">
                    Invoice Items
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full text-[10px]">{newInvoice.items.length}</span>
                  </h3>
                  
                  <div className="space-y-3">
                    {newInvoice.items.length === 0 ? (
                      <p className="text-xs text-center text-gray-400 py-10">No items added yet</p>
                    ) : (
                      newInvoice.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start">
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{item.name}</p>
                            <button 
                              onClick={() => removeItemFromInvoice(item.product_id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X className="w-3 h-3"/>
                            </button>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    setNewInvoice({
                                      ...newInvoice,
                                      items: newInvoice.items.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity - 1 } : i)
                                    });
                                  }
                                }}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200"
                              >-</button>
                              <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => {
                                    const prod = products.find(p => p.id === item.product_id);
                                    if (prod && item.quantity < prod.stock_quantity) {
                                        setNewInvoice({
                                            ...newInvoice,
                                            items: newInvoice.items.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i)
                                        });
                                    } else {
                                        alert('No more stock available');
                                    }
                                }}
                                className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-md text-gray-600 hover:bg-gray-200"
                              >+</button>
                            </div>
                            <span className="text-xs font-bold text-gray-900 italic">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3 bg-brand-600 p-6 rounded-2xl text-white">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Subtotal</span>
                    <span>Rs. {calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-80">Discount (%)</span>
                    <input 
                      type="number"
                      className="w-16 bg-white/10 border border-white/20 rounded px-2 py-0.5 text-right outline-none focus:bg-white/20"
                      value={newInvoice.discount_percentage}
                      onChange={e => setNewInvoice({...newInvoice, discount_percentage: Number(e.target.value)})}
                    />
                  </div>
                  <div className="pt-3 border-t border-white/20 flex justify-between items-end">
                    <span className="text-sm font-semibold">Grand Total</span>
                    <span className="text-xl font-bold">Rs. {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-between gap-4">
               <div className="flex-1 flex gap-3">
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Paid Amount (Rs.)</label>
                        <input 
                            type="number"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                            placeholder="0.00"
                            value={newInvoice.paid_amount}
                            onChange={e => setNewInvoice({...newInvoice, paid_amount: Number(e.target.value)})}
                        />
                    </div>
                    <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Due Date</label>
                        <input 
                            type="date"
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                            value={newInvoice.due_date}
                            onChange={e => setNewInvoice({...newInvoice, due_date: e.target.value})}
                        />
                    </div>
               </div>
               <div className="flex items-end">
                    <button 
                        onClick={handleCreateInvoice}
                        disabled={isSubmitting || !newInvoice.shop_id || newInvoice.items.length === 0}
                        className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        Finalize Invoice
                    </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {isDetailsModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Invoice {selectedInvoice.invoice_number}</h2>
              <button 
                onClick={() => { setIsDetailsModalOpen(false); setSelectedInvoice(null); }}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[80vh]">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <p className="text-sm font-bold text-brand-600">SANJEEWA MOTORS</p>
                    <p className="text-xs text-gray-500">Automotive Excellence</p>
                </div>
                <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Status</p>
                    {getStatusBadge(selectedInvoice.status)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Customer / Info</p>
                    <p className="font-bold text-gray-900">{selectedInvoice.User.name}</p>
                    <p className="text-gray-500">Issued at: {selectedInvoice.Warehouse.name}</p>
                </div>
                <div className="space-y-2 text-right">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Date / Validity</p>
                    <p className="font-bold text-gray-900">{new Date(selectedInvoice.createdAt).toLocaleDateString()}</p>
                    <p className="text-gray-500 text-xs text-red-600 font-bold">Due: {new Date(selectedInvoice.due_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Summary</p>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 text-gray-400">
                            <th className="py-2 font-normal text-left">Item</th>
                            <th className="py-2 font-normal text-center">Qty</th>
                            <th className="py-2 font-normal text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {selectedInvoice.items.map((item, idx) => (
                            <tr key={idx}>
                                <td className="py-3">
                                    <p className="font-bold text-gray-900">{item.Product.name}</p>
                                    <p className="text-xs text-gray-400">{item.Product.sku}</p>
                                </td>
                                <td className="py-3 text-center text-gray-700">{item.quantity}</td>
                                <td className="py-3 text-right font-bold text-gray-900">Rs. {Number(item.subtotal).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100 max-w-[200px] ml-auto">
                 <div className="flex justify-between text-sm text-gray-500">
                    <span>Discount</span>
                    <span className="text-green-600 font-bold">-{selectedInvoice.discount_percentage}%</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>Rs. {Number(selectedInvoice.total_amount).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-orange-600">
                    <span>Paid</span>
                    <span>Rs. {Number(selectedInvoice.paid_amount).toLocaleString()}</span>
                 </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <button className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all">
                    <Printer className="w-5 h-5"/>
                    Print Invoice
                 </button>
                 <button className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">
                    Share
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

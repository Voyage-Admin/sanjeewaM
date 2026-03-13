import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  Search, 
  RefreshCw, 
  X, 
  Loader2, 
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft,
  Filter,
  Trash2,
  FileText
} from 'lucide-react';

interface FinancialEntry {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  entry_date: string;
  description: string;
  payment_method: string;
  reference_number: string;
  createdAt: string;
}

interface Summary {
  total_income: number;
  total_expense: number;
  net_profit: number;
}

const Financials = () => {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_income: 0, total_expense: 0, net_profit: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEntry, setNewEntry] = useState({
    type: 'EXPENSE',
    category: '',
    amount: '',
    description: '',
    payment_method: 'CASH',
    entry_date: new Date().toISOString().split('T')[0],
    reference_number: ''
  });

  const categories = {
      INCOME: ['Sales', 'Service Fees', 'Direct Income', 'Other'],
      EXPENSE: ['Salaries', 'Rent', 'Utilities', 'Inventory Purchase', 'Marketing', 'Maintenance', 'Taxes', 'Other']
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const [entriesRes, summaryRes] = await Promise.all([
        axios.get(`${apiUrl}/api/financials`, { headers }),
        axios.get(`${apiUrl}/api/financials/summary`, { headers })
      ]);

      setEntries(entriesRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.post(`${apiUrl}/api/financials`, {
          ...newEntry,
          amount: Number(newEntry.amount)
      }, { headers });

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    try {
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.delete(`${apiUrl}/api/financials/${id}`, { headers });
      fetchData();
    } catch (error) {
      alert('Error deleting entry');
    }
  };

  const resetForm = () => {
    setNewEntry({
      type: 'EXPENSE',
      category: '',
      amount: '',
      description: '',
      payment_method: 'CASH',
      entry_date: new Date().toISOString().split('T')[0],
      reference_number: ''
    });
  };

  const filteredEntries = entries.filter(entry => 
    (entry.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
     entry.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterType === '' || entry.type === filterType)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            Financial Management
          </h1>
          <p className="text-gray-500 mt-1">Track income, expenses, and overall business health.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Financial Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Income</p>
              <p className="text-xl font-black text-gray-900">Rs. {Number(summary.total_income).toLocaleString()}</p>
           </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
           <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
              <TrendingDown className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Expense</p>
              <p className="text-xl font-black text-gray-900">Rs. {Number(summary.total_expense).toLocaleString()}</p>
           </div>
        </div>
        <div className="bg-brand-600 p-6 rounded-3xl shadow-xl shadow-brand-100 flex items-center gap-4">
           <div className="p-4 bg-white/20 text-white rounded-2xl backdrop-blur-md">
              <Wallet className="w-6 h-6" />
           </div>
           <div className="text-white">
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Net Profit/Loss</p>
              <p className="text-xl font-black">Rs. {Number(summary.net_profit).toLocaleString()}</p>
           </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row gap-4 bg-gray-50/30">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="Search by category or description..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold text-gray-600"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="INCOME">Income Only</option>
            <option value="EXPENSE">Expense Only</option>
          </select>
          <button onClick={fetchData} className="p-2.5 hover:bg-white rounded-xl text-gray-400 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[10px] font-black uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Entry Date</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">Finding financial records...</td>
                </tr>
              ) : filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">No entries match your search.</td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                        {new Date(entry.entry_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {entry.type === 'INCOME' ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] uppercase tracking-wider bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                          <ArrowUpRight className="w-3 h-3" /> Income
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] uppercase tracking-wider bg-rose-50 px-2 py-1 rounded-lg w-fit">
                          <ArrowDownLeft className="w-3 h-3" /> Expense
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">{entry.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[200px]">{entry.description || '-'}</td>
                    <td className="px-6 py-4">
                        <span className={`text-sm font-black ${entry.type === 'INCOME' ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {entry.type === 'INCOME' ? '+' : '-'} Rs. {Number(entry.amount).toLocaleString()}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-2 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                       >
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div>
                   <h2 className="text-xl font-black text-gray-900">New Financial Entry</h2>
                   <p className="text-xs text-gray-500 mt-1 font-medium italic">Update your ledger with precise transaction details.</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateEntry} className="p-10 space-y-6">
                 {/* Type Selector */}
                 <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-[1.25rem]">
                    <button
                        type="button"
                        onClick={() => setNewEntry({...newEntry, type: 'INCOME', category: ''})}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all ${
                            newEntry.type === 'INCOME' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ArrowUpRight className="w-4 h-4" /> Income
                    </button>
                    <button
                        type="button"
                        onClick={() => setNewEntry({...newEntry, type: 'EXPENSE', category: ''})}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-black text-sm transition-all ${
                            newEntry.type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        <ArrowDownLeft className="w-4 h-4" /> Expense
                    </button>
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1.5 col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Amount</label>
                        <div className="relative">
                           <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">Rs.</span>
                           <input 
                              type="number"
                              required
                              autoFocus
                              placeholder="0.00"
                              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-3xl focus:ring-2 focus:ring-brand-500 outline-none font-black text-lg text-gray-900"
                              value={newEntry.amount}
                              onChange={e => setNewEntry({...newEntry, amount: e.target.value})}
                           />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                       <select 
                          required
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold text-gray-900 appearance-none"
                          value={newEntry.category}
                          onChange={e => setNewEntry({...newEntry, category: e.target.value})}
                       >
                          <option value="">Choose category...</option>
                          {categories[newEntry.type as keyof typeof categories].map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
                       <select 
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-bold text-gray-900 appearance-none"
                          value={newEntry.payment_method}
                          onChange={e => setNewEntry({...newEntry, payment_method: e.target.value})}
                       >
                          {['CASH', 'CARD', 'CHEQUE', 'TRANSFER'].map(m => <option key={m} value={m}>{m}</option>)}
                       </select>
                    </div>

                    <div className="space-y-1.5 col-span-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                       <input 
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium text-gray-900"
                          placeholder="What was this transaction for?"
                          value={newEntry.description}
                          onChange={e => setNewEntry({...newEntry, description: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button 
                       type="button"
                       onClick={() => setIsModalOpen(false)}
                       className="flex-1 py-4 rounded-3xl border border-gray-100 font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                       Discard
                    </button>
                    <button 
                       type="submit"
                       disabled={isSubmitting || !newEntry.amount || !newEntry.category}
                       className={`flex-1 py-4 rounded-3xl text-white font-black shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                           newEntry.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'
                       }`}
                    >
                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
                       Record {newEntry.type}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Financials;

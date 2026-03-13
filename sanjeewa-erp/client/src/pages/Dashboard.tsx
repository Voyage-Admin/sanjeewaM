import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPaid: 0,
    userCount: 0,
    productCount: 0,
    invoiceCount: 0,
    salesByDay: [] as any[],
    recentActivity: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/dashboard/stats`, { headers });
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Sales', value: `Rs. ${Number(stats.totalSales).toLocaleString()}`, icon: TrendingUp, change: '+12.5%', isPositive: true },
    { name: 'Active Users', value: stats.userCount.toString(), icon: Users, change: '+2', isPositive: true },
    { name: 'Total Products', value: stats.productCount.toString(), icon: Package, change: '-4', isPositive: false },
    { name: 'Recent Invoices', value: stats.invoiceCount.toString(), icon: ShoppingCart, change: '+5', isPositive: true },
  ];

  if (loading) {
    return (
        <div className="h-96 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="p-2 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 text-gray-400 transition-colors shadow-sm"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                <stat.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 font-medium">{stat.name}</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Sales Overview</h3>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full">Last 7 Days</div>
          </div>
          <div className="h-[300px] w-full">
            {stats.salesByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesByDay}>
                    <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#9ca3af', fontSize: 12}}
                    />
                    <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="#0ea5e9" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSales)" 
                    />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                    Not enough sales data for chart yet. Create your first invoice!
                </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-brand-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl h-full lg:h-auto">
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold">Quick Actions</h3>
                    <p className="text-brand-300 text-sm mt-1">Shortcuts to manage your system</p>
                </div>
                
                <div className="mt-8 space-y-3">
                    <button 
                        onClick={() => navigate('/invoices')}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" /> New Sale Invoice
                    </button>
                    <button 
                        onClick={() => navigate('/inventory')}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                        <Package className="w-4 h-4" /> Update Inventory
                    </button>
                    <button 
                        onClick={() => navigate('/warehouses')}
                        className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                        <Users className="w-4 h-4" /> Manage Locations
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="flex items-center justify-between text-xs text-brand-400 font-medium">
                        <span>Database Status</span>
                        <span className="flex items-center gap-1 text-green-400">
                            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></span> Connected
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <button 
                onClick={() => navigate('/invoices')}
                className="text-sm text-brand-600 font-semibold hover:text-brand-700"
            >
                View Invoices
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentActivity.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-400 text-sm">
                    No recent activity to show.
                </div>
            ) : stats.recentActivity.map((item: any) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Clock className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-brand-600 font-medium">{item.user}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{item.time}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                    item.type === 'Invoice' ? 'bg-blue-50 text-blue-600' :
                    item.type === 'Inventory' ? 'bg-orange-50 text-orange-600' :
                    'bg-purple-50 text-purple-600'
                  }`}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default Dashboard;

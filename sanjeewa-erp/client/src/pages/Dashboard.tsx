import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

const Dashboard = () => {
  const stats = [
    { name: 'Total Sales', value: 'Rs. 1,280,450', icon: TrendingUp, change: '+12.5%', isPositive: true },
    { name: 'Active Users', value: '24', icon: Users, change: '+2', isPositive: true },
    { name: 'Total Products', value: '456', icon: Package, change: '-4', isPositive: false },
    { name: 'Recent Invoices', value: '18', icon: ShoppingCart, change: '+5', isPositive: true },
  ];

  const recentActivity = [
    { id: 1, type: 'Invoice', desc: 'New invoice #INV-2024-001 created', time: '5 mins ago', user: 'Admin' },
    { id: 2, type: 'Inventory', desc: 'Stock updated for "Engine Oil 5L"', time: '2 hours ago', user: 'Ref-Sanath' },
    { id: 3, type: 'User', desc: 'New user "Kamal" added to system', time: '5 hours ago', user: 'Admin' },
    { id: 4, type: 'Warehouse', desc: 'Transfer from Main to Colombo Branch', time: 'Yesterday', user: 'Ref-Perera' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Activity</h3>
            <button className="text-sm text-brand-600 font-semibold hover:text-brand-700">View All</button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item) => (
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

        {/* System Health / Quick Actions */}
        <div className="bg-brand-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-xl">
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-bold">Quick Actions</h3>
                    <p className="text-brand-300 text-sm mt-1">Shortcuts to manage your system</p>
                </div>
                
                <div className="mt-8 space-y-3">
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> New Sale Invoice
                    </button>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2">
                        <Package className="w-4 h-4" /> Update Inventory
                    </button>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold text-sm transition-all border border-white/10 flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" /> Manage Users
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
    </div>
  );
};

export default Dashboard;

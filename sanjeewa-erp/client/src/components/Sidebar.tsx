import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Warehouse, 
  Users, 
  Settings, 
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';

const Sidebar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { isSidebarOpen, closeSidebar } = useUIStore();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', roles: ['ADMIN', 'REF'] },
    { name: 'Inventory', icon: Package, path: '/inventory', roles: ['ADMIN', 'REF'] },
    { name: 'Invoices', icon: FileText, path: '/invoices', roles: ['ADMIN', 'REF'] },
    { name: 'Warehouses', icon: Warehouse, path: '/warehouses', roles: ['ADMIN'] },
    { name: 'Users', icon: Users, path: '/users', roles: ['ADMIN'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['ADMIN', 'REF'] },
  ];

  return (
    <>
      {/* Sidebar Container */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col h-screen w-64 bg-brand-900 text-white transition-transform duration-300 ease-in-out border-r border-brand-800 lg:translate-x-0 lg:static lg:inset-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-brand-100">Sanjeewa Motors</h1>
            <p className="text-xs text-brand-400 mt-1 uppercase tracking-widest font-semibold">ERP System</p>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-2 text-brand-300 hover:text-white hover:bg-brand-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {menuItems
            .filter((item) => item.roles.includes(user?.role || ''))
            .map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                    if (window.innerWidth < 1024) closeSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'text-brand-300 hover:bg-brand-800 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </>
                )}
              </NavLink>
            ))}
        </nav>

        <div className="p-4 border-t border-brand-800">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-brand-300 hover:bg-red-900/30 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

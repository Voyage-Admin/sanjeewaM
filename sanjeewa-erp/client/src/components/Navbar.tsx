import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Bell, User, Search, Menu } from 'lucide-react';

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const { toggleSidebar } = useUIStore();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 w-1/3">
        {/* Hamburger for mobile */}
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="hidden md:block relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white text-sm transition-all"
            placeholder="Search products..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 lg:gap-6">
        <button className="relative p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-full transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center gap-2 lg:gap-3 lg:pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-tight">{user?.role}</p>
          </div>
          <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 border-2 border-brand-200">
            <User className="h-5 h-5 lg:h-6 lg:w-6" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

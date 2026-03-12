import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Warehouses from './pages/Warehouses';

// Placeholder Pages
const Invoices = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">Invoices Module Coming Soon</div>;
const Users = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">Users Module Coming Soon</div>;
const Settings = () => <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 h-96 flex items-center justify-center text-gray-400">Settings Module Coming Soon</div>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useAuthStore((state) => state.user);
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

function App() {
  const login = useAuthStore((state) => state.login);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        login(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [login]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Dashboard Layout */}
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

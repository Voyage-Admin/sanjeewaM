import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  RefreshCw, 
  Edit, 
  Trash2, 
  X, 
  Loader2, 
  Shield, 
  User as UserIcon,
  Mail,
  CreditCard,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'REF';
  credit_limit: number;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'REF',
    credit_limit: 0
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.get(`${apiUrl}/api/users-manage`, { headers });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '', // Don't show password
        role: user.role,
        credit_limit: user.credit_limit
      });
    } else {
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'REF',
        credit_limit: 0
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

      if (selectedUser) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete (updateData as any).password;
        await axios.put(`${apiUrl}/api/users-manage/${selectedUser.id}`, updateData, { headers });
      } else {
        // Create
        if (!formData.password) {
            alert('Password is required for new users');
            return;
        }
        await axios.post(`${apiUrl}/api/users-manage`, formData, { headers });
      }

      setIsModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      alert(error.response?.data?.message || 'Error saving user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await axios.delete(`${apiUrl}/api/users-manage/${selectedUser.id}`, { headers });
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Error deleting user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-brand-600" />
            User Management
          </h1>
          <p className="text-gray-500 mt-1">Manage system access, roles, and representative credit limits.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={fetchUsers}
          className="p-2 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* User Table/Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin text-brand-600 mb-4" />
            <p>Loading user database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-gray-200 text-center text-gray-400">
            No users found matching your search.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-50/50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
                          {user.role === 'ADMIN' ? <Shield className="w-6 h-6" /> : <UserIcon className="w-6 h-6" />}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => handleOpenModal(user)}
                            className="p-2 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50"
                        >
                            <Edit className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => { setSelectedUser(user); setIsDeleteModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>

                   <h3 className="text-lg font-bold text-gray-900 truncate">{user.name}</h3>
                   <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{user.email}</span>
                   </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-50 space-y-4">
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Role</span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user.role}
                      </span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400 font-medium">Credit Limit</span>
                      <div className="flex items-center gap-1 font-bold text-gray-900">
                          <CreditCard className="w-4 h-4 text-gray-300" />
                          Rs. {Number(user.credit_limit).toLocaleString()}
                      </div>
                   </div>
                </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {selectedUser ? <Edit className="w-5 h-5 text-brand-600" /> : <Plus className="w-5 h-5 text-brand-600" />}
                {selectedUser ? 'Edit User' : 'Add New Professional'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                    placeholder="example@sanjeewa.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 ml-1">
                    {selectedUser ? 'Change Password (optional)' : 'Initial Password'}
                </label>
                <input 
                  type="password"
                  required={!selectedUser}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all bg-gray-50/50 focus:bg-white"
                  placeholder={selectedUser ? "Leave blank to keep current" : "••••••••"}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Assign Role</label>
                    <div className="relative">
                       <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select 
                            required
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none appearance-none bg-gray-50/50"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                        >
                            <option value="REF">Sales Rep</option>
                            <option value="ADMIN">System Admin</option>
                        </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Credit Limit</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs.</span>
                        <input 
                            type="number"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none bg-gray-50/50"
                            value={formData.credit_limit}
                            onChange={(e) => setFormData({...formData, credit_limit: Number(e.target.value)})}
                        />
                    </div>
                  </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold hover:bg-brand-700 transition-all shadow-sm hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    selectedUser ? 'Update User' : 'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                <Trash2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Remove Access?</h2>
                <p className="text-gray-500 mt-2">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedUser.name}</span>? This will permanently revoke their access to the system.
                </p>
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all"
                >
                  Keep User
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;

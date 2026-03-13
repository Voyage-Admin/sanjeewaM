import React, { useState } from 'react';
import axios from 'axios';
import { 
  Settings as SettingsIcon, 
  User as UserIcon, 
  Lock, 
  Globe, 
  Palette, 
  Shield, 
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState('profile');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = JSON.parse(localStorage.getItem('user') || '{}').token;
      const headers = { Authorization: `Bearer ${token}` };
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const res = await axios.put(`${apiUrl}/api/users/profile`, {
        name: profileData.name,
        password: profileData.newPassword
      }, { headers });
      
      // Update local storage name if changed
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.name = res.data.name;
      localStorage.setItem('user', JSON.stringify(userData));
      
      setSuccessMessage('Profile updated successfully!');
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile Settings', icon: UserIcon },
    { id: 'security', name: 'Security', icon: Lock },
    { id: 'system', name: 'System Appearance', icon: Palette },
    { id: 'regions', name: 'Localization', icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-brand-600" />
          General Settings
        </h1>
        <p className="text-gray-500 mt-1">Manage your account preferences and system configurations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                activeTab === tab.id 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-100' 
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{tab.name}</span>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-brand-100 rounded-2xl flex items-center justify-center text-brand-600 text-2xl font-bold">
                        {user?.name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{user?.name}</h3>
                        <p className="text-sm text-gray-500">{user?.role} • {user?.email}</p>
                    </div>
                  </div>

                  {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        {successMessage}
                    </div>
                  )}

                  {errorMessage && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {errorMessage}
                    </div>
                  )}

                  <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Display Name</label>
                      <input 
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                        value={profileData.name}
                        onChange={e => setProfileData({...profileData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Email Address</label>
                      <input 
                        disabled
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 outline-none cursor-not-allowed"
                        value={profileData.email}
                      />
                    </div>
                    <div className="md:col-span-2 pt-4 border-t border-gray-50">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Lock className="w-4 h-4 text-brand-600" />
                            Security Verification
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Current Password</label>
                                <input 
                                    type="password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Verify your current identity"
                                    value={profileData.currentPassword}
                                    onChange={e => setProfileData({...profileData, currentPassword: e.target.value})}
                                />
                            </div>
                            <div></div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">New Password</label>
                                <input 
                                    type="password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Minimum 8 characters"
                                    value={profileData.newPassword}
                                    onChange={e => setProfileData({...profileData, newPassword: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
                                <input 
                                    type="password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-500 outline-none"
                                    placeholder="Repeat new password"
                                    value={profileData.confirmPassword}
                                    onChange={e => setProfileData({...profileData, confirmPassword: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-2 flex justify-end">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="px-8 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-brand-200 disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-600" />
                        System Security
                    </h3>
                    <div className="bg-green-50 p-6 rounded-2xl border border-green-100 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                            <p className="font-bold text-green-800">Account is Secured</p>
                            <p className="text-green-700 text-sm mt-1">Your account is using JWT-based token authentication. Remember to logout when using shared devices.</p>
                        </div>
                    </div>
                </div>
              )}

              {(activeTab === 'system' || activeTab === 'regions') && (
                <div className="py-20 text-center space-y-4 animate-in zoom-in-95 duration-200">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400">
                        <SettingsIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Advanced Customization</h3>
                        <p className="text-sm text-gray-500">System-wide theme and regional settings will be available in the next update.</p>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

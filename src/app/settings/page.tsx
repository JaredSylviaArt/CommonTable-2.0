'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import { UserCircleIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    marketing: false,
  });
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    churchName: user?.churchName || '',
    churchRole: user?.churchRole || '',
    zipCode: user?.zipCode || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleNotificationChange = (type: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    setSaveMessage(''); // Clear any previous save message
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    setSaveMessage('');

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: profileData.name,
        churchName: profileData.churchName,
        churchRole: profileData.churchRole,
        zipCode: profileData.zipCode,
        updatedAt: new Date(),
      });

      // Refresh user data
      await refreshUser();
      setSaveMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>

        <div className="max-w-4xl space-y-6">
              {/* Profile Section */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <UserCircleIcon className="w-6 h-6 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Church Name
                    </label>
                    <input
                      type="text"
                      value={profileData.churchName}
                      onChange={(e) => handleProfileChange('churchName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Church Role
                    </label>
                    <input
                      type="text"
                      value={profileData.churchRole}
                      onChange={(e) => handleProfileChange('churchRole', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
                      style={{ color: '#111827' }}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ZIP Code
                    </label>
                    <input
                      type="text"
                      value={profileData.zipCode}
                      onChange={(e) => handleProfileChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
                      style={{ color: '#111827' }}
                    />
                  </div>
                </div>
                
                {/* Save Button and Status */}
                <div className="mt-6 flex items-center justify-between">
                  <div>
                    {saveMessage && (
                      <p className={`text-sm ${saveMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                        {saveMessage}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <BellIcon className="w-6 h-6 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive email updates about messages and listings</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#665CF0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665CF0]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Push Notifications</p>
                      <p className="text-sm text-gray-500">Receive push notifications on your device</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#665CF0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665CF0]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Marketing Updates</p>
                      <p className="text-sm text-gray-500">Receive updates about new features and tips</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.marketing}
                        onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#665CF0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665CF0]"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <ShieldCheckIcon className="w-6 h-6 text-gray-500" />
                  <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
                </div>
                
                <div className="space-y-4">
                  <button
                    onClick={logout}
                    className="w-full md:w-auto bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
        </ResponsiveLayout>
    </ProtectedRoute>
  );
}

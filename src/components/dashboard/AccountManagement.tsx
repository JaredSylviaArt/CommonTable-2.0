'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LocationDetector from '@/components/LocationDetector';
import SimplifiedSellerOnboarding from '@/components/SimplifiedSellerOnboarding';
import { 
  UserCircleIcon, 
  Cog6ToothIcon,
  ShieldCheckIcon,
  BellIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function AccountManagement() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showLocationDetector, setShowLocationDetector] = useState(false);
  
  // Check if user was redirected here for payment setup
  const needsPaymentSetup = searchParams?.get('setup') === 'payments';
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    newListings: true,
    priceDrops: true,
    messages: true,
    weeklyDigest: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showActivity: false,
    allowDirectMessages: true,
  });

  // Calculate profile completion
  const profileFields = [
    { field: 'name', label: 'Name', value: user?.name },
    { field: 'email', label: 'Email', value: user?.email },
    { field: 'churchName', label: 'Church Name', value: user?.churchName },
    { field: 'churchRole', label: 'Church Role', value: user?.churchRole },
    { field: 'zipCode', label: 'ZIP Code', value: user?.zipCode },
  ];

  const completedFields = profileFields.filter(field => field.value && field.value.trim() !== '').length;
  const completionPercentage = Math.round((completedFields / profileFields.length) * 100);

  const handleNotificationChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePrivacyChange = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleLocationDetected = async (zipCode: string) => {
    // Here you would update the user's ZIP code in Firebase
    // For now, we'll just refresh the user data
    console.log('New ZIP code detected:', zipCode);
    setShowLocationDetector(false);
    // TODO: Update user profile in Firebase with new ZIP code
    await refreshUser();
  };

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
      <label className="relative inline-flex items-center cursor-pointer ml-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#665CF0]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#665CF0]"></div>
      </label>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <UserCircleIcon className="w-6 h-6 text-[#665CF0]" />
        <h2 className="text-lg font-semibold text-gray-900">Account Management</h2>
      </div>

      {/* Payment Setup Alert - Shows when redirected from create listing */}
      {needsPaymentSetup && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <ExclamationTriangleIcon className="w-6 h-6 text-blue-600 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Payment Account Required
              </h3>
              <p className="text-blue-800 mb-4">
                To sell items on CommonTable, you need to set up a payment account to receive payments. 
                This is quick and secure through Stripe.
              </p>
              <div className="bg-white rounded-lg border border-blue-200 p-4">
                <SimplifiedSellerOnboarding />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller Onboarding - Always show for payment status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Selling Account</h3>
                      <SimplifiedSellerOnboarding />
      </div>

      {/* Profile Completion */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Profile Completion</h3>
          <div className="flex items-center space-x-2">
            {completionPercentage === 100 ? (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
            )}
            <span className={`text-sm font-medium ${completionPercentage === 100 ? 'text-green-600' : 'text-yellow-600'}`}>
              {completionPercentage}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-[#665CF0] h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        {/* Profile Fields */}
        <div className="space-y-3">
          {profileFields.map((field) => (
            <div key={field.field} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700">{field.label}</span>
              <div className="flex items-center space-x-2">
                {field.value && field.value.trim() !== '' ? (
                  <>
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-900 max-w-32 truncate">{field.value}</span>
                  </>
                ) : (
                  <span className="text-sm text-red-500">Missing</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {completionPercentage < 100 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button 
              onClick={() => router.push('/complete-profile')}
              className="text-sm text-[#665CF0] hover:text-[#5A52E8] font-medium transition-colors"
            >
              Complete your profile →
            </button>
          </div>
        )}
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <BellIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            checked={notificationSettings.emailNotifications}
            onChange={(value) => handleNotificationChange('emailNotifications', value)}
            label="Email Notifications"
            description="Receive updates via email"
          />
          
          <ToggleSwitch
            checked={notificationSettings.pushNotifications}
            onChange={(value) => handleNotificationChange('pushNotifications', value)}
            label="Push Notifications"
            description="Browser notifications for immediate updates"
          />
          
          <ToggleSwitch
            checked={notificationSettings.newListings}
            onChange={(value) => handleNotificationChange('newListings', value)}
            label="New Listings in Your Area"
            description="Get notified when items are posted nearby"
          />
          
          <ToggleSwitch
            checked={notificationSettings.priceDrops}
            onChange={(value) => handleNotificationChange('priceDrops', value)}
            label="Price Drop Alerts"
            description="When saved items have price reductions"
          />
          
          <ToggleSwitch
            checked={notificationSettings.messages}
            onChange={(value) => handleNotificationChange('messages', value)}
            label="New Messages"
            description="When someone messages you about listings"
          />
          
          <ToggleSwitch
            checked={notificationSettings.weeklyDigest}
            onChange={(value) => handleNotificationChange('weeklyDigest', value)}
            label="Weekly Digest"
            description="Summary of activity in your area"
          />
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <ShieldCheckIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
        </div>

        <div className="space-y-1">
          <ToggleSwitch
            checked={privacySettings.showProfile}
            onChange={(value) => handlePrivacyChange('showProfile', value)}
            label="Show Profile to Other Users"
            description="Allow others to see your church and role"
          />
          
          <ToggleSwitch
            checked={privacySettings.showActivity}
            onChange={(value) => handlePrivacyChange('showActivity', value)}
            label="Show Recent Activity"
            description="Let others see your recent listings and activity"
          />
          
          <ToggleSwitch
            checked={privacySettings.allowDirectMessages}
            onChange={(value) => handlePrivacyChange('allowDirectMessages', value)}
            label="Allow Direct Messages"
            description="Let users message you about listings"
          />
        </div>
      </div>

      {/* Location Settings */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <MapPinIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Location Preferences</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Radius
            </label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
              defaultValue="25"
            >
              <option value="5">5 miles</option>
              <option value="10">10 miles</option>
              <option value="25">25 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              How far to search for listings from your ZIP code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current ZIP Code
            </label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={user?.zipCode || ''}
                  disabled
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                />
                <button 
                  onClick={() => setShowLocationDetector(!showLocationDetector)}
                  className="px-4 py-2 text-sm text-[#665CF0] border border-[#665CF0] rounded-lg hover:bg-[#665CF0] hover:text-white transition-colors"
                >
                  {showLocationDetector ? 'Cancel' : 'Update'}
                </button>
              </div>
              
              {showLocationDetector && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <LocationDetector 
                    onLocationDetected={handleLocationDetected}
                    currentZip={user?.zipCode}
                    showNearbyLocations={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Cog6ToothIcon className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Account Actions</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Export My Data
          </button>
          
          <button className="w-full text-left px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            Download Activity Report
          </button>
          
          <button className="w-full text-left px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
}

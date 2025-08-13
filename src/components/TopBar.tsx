'use client';

import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, BellIcon, UserCircleIcon, Bars3Icon } from '@heroicons/react/24/outline';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const { user, logout } = useAuth();
  const router = useRouter();


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navigate to home page with search term
      router.push(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-4"
        >
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        </button>

        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <form onSubmit={handleSearch} className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for anything..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-dark-force"
              style={{ color: '#111827 !important' }}
            />
          </form>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Create Listing Button */}
          <Link
            href="/create-listing"
            className="hidden sm:inline-flex bg-[#665CF0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A52E8] transition-colors"
          >
            Create Listing
          </Link>

          {/* Notifications */}
          <NotificationBell />

          {/* User Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <UserCircleIcon className="w-8 h-8 text-gray-600" />
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="font-medium text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.churchName}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Dashboard
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

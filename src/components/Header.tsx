'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusIcon, ChatBubbleLeftRightIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-[#665CF0]">CommonTable</h1>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Link
              href="/create-listing"
              className="flex items-center space-x-2 bg-[#665CF0] text-white px-4 py-2 rounded-lg hover:bg-[#5A52E8] transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Create Listing</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-gray-700 hover:text-[#665CF0] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChatBubbleLeftRightIcon className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            {/* User Menu */}
            <div className="relative group">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-[#665CF0] px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <UserCircleIcon className="w-5 h-5" />
                <span>{user?.name}</span>
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
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

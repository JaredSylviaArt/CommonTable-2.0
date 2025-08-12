'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  showFilters?: boolean;
  filterPanel?: React.ReactNode;
}

export default function ResponsiveLayout({ children, showFilters = false, filterPanel }: ResponsiveLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main Content - Always account for sidebar on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Top Bar */}
        <TopBar onMenuClick={toggleSidebar} />
        
        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0">
          {/* Filters - Hidden on mobile, collapsible on tablet */}
          {showFilters && filterPanel && (
            <div className="hidden lg:block w-80 p-6 border-r border-gray-200 bg-white overflow-y-auto flex-shrink-0">
              {filterPanel}
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

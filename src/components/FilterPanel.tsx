'use client';

import { ListingType, ListingCategory } from '@/types';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface FilterPanelProps {
  filters: {
    type: ListingType | '';
    category: ListingCategory | '';
    zipRadius: number;
    searchTerm: string;
  };
  onFiltersChange: (filters: any) => void;
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      type: '',
      category: '',
      zipRadius: 25,
      searchTerm: '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              placeholder="Search listings..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Listing Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="Give Away">Give Away</option>
            <option value="Sell">Sell</option>
            <option value="Share">Share</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="Books & Resources">Books & Resources</option>
            <option value="Equipment & Tech">Equipment & Tech</option>
            <option value="Furniture">Furniture</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Event Items">Event Items</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* ZIP Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance: {filters.zipRadius} miles
          </label>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={filters.zipRadius}
            onChange={(e) => updateFilter('zipRadius', parseInt(e.target.value))}
            className="w-full accent-[#665CF0]"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5 mi</span>
            <span>100 mi</span>
          </div>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="w-full px-4 py-2 text-sm text-[#665CF0] border border-[#665CF0] rounded-lg hover:bg-[#665CF0] hover:text-white transition-colors"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

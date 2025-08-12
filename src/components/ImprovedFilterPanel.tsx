'use client';

import { ListingType, ListingCategory, User } from '@/types';
import { FunnelIcon } from '@heroicons/react/24/outline';
import LocationDetector from './LocationDetector';

interface ImprovedFilterPanelProps {
  filters: {
    type: ListingType | '';
    category: ListingCategory | '';
    zipRadius: number;
    searchTerm: string;
    priceMin: number;
    priceMax: number;
    location: string;
    condition: string;
    datePosted: string;
  };
  onFiltersChange: (filters: any) => void;
  onLocationDetected?: (zipCode: string) => void;
  user?: User | null;
}

export default function ImprovedFilterPanel({ 
  filters, 
  onFiltersChange, 
  onLocationDetected,
  user 
}: ImprovedFilterPanelProps) {
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
      priceMin: 0,
      priceMax: 1000,
      location: '',
      condition: '',
      datePosted: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.type || filters.category || filters.searchTerm || 
    filters.condition || filters.datePosted || filters.location ||
    filters.zipRadius !== 25 || filters.priceMin > 0 || filters.priceMax < 1000;

  // Count active filters
  const activeFilterCount = [
    filters.type,
    filters.category,
    filters.searchTerm,
    filters.condition,
    filters.datePosted,
    filters.location,
    filters.zipRadius !== 25 ? 'zipRadius' : '',
    filters.priceMin > 0 ? 'priceMin' : '',
    filters.priceMax < 1000 ? 'priceMax' : ''
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FunnelIcon className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        {activeFilterCount > 0 && (
          <span className="bg-[#665CF0] text-white text-xs px-2 py-1 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            placeholder="Search listings..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price Range
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => updateFilter('priceMin', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
            />
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => updateFilter('priceMax', parseInt(e.target.value) || 1000)}
              placeholder="1000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              placeholder="Enter ZIP code or city"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm placeholder:text-gray-500"
            />
            {onLocationDetected && (
              <LocationDetector 
                onLocationDetected={onLocationDetected}
                currentZip={user?.zipCode || filters.location}
                showNearbyLocations={true}
              />
            )}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
          >
            <option value="">All</option>
            <option value="Books & Resources">Books & Resources</option>
            <option value="Equipment & Tech">Equipment & Tech</option>
            <option value="Furniture">Furniture</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Event Items">Event Items</option>
            <option value="Creative Assets">Creative Assets</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
          >
            <option value="">All</option>
            <option value="Give Away">Give Away</option>
            <option value="Sell">Sell</option>
            <option value="Share">Share</option>
          </select>
        </div>

        {/* Condition */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condition
          </label>
          <select
            value={filters.condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
          >
            <option value="">All</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
          </select>
        </div>

        {/* Date Posted */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Posted
          </label>
          <select
            value={filters.datePosted}
            onChange={(e) => updateFilter('datePosted', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-sm"
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className={`w-full px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 transition-colors ${
            hasActiveFilters
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              : 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
          }`}
        >
          {hasActiveFilters ? 'Clear All Filters' : 'No Active Filters'}
        </button>
      </div>
    </div>
  );
}

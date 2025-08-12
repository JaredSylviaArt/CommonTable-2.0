'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Listing, ListingType, ListingCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { filterListingsByProximity } from '@/lib/locationService';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ImprovedListingCard from '@/components/ImprovedListingCard';
import ImprovedFilterPanel from '@/components/ImprovedFilterPanel';
import LocationDetector from '@/components/LocationDetector';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const { user } = useAuth();
  const [filters, setFilters] = useState({
    type: '' as ListingType | '',
    category: '' as ListingCategory | '',
    zipRadius: 25,
    searchTerm: '',
    priceMin: 0,
    priceMax: 1000,
    location: '',
    condition: '',
    datePosted: '',
  });

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, listings]);

  const fetchListings = async () => {
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(listingsRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const listingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Listing[];
      
      setListings(listingsData);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
    setLoading(false);
  };

  const applyFilters = async () => {
    let filtered = [...listings];

    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(listing => listing.type === filters.type);
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(listing => listing.category === filters.category);
    }

    // Filter by search term
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(listing =>
        listing.title.toLowerCase().includes(searchLower) ||
        listing.description.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price range
    if (filters.priceMin > 0 || filters.priceMax < 1000) {
      filtered = filtered.filter(listing => {
        const price = listing.price || 0;
        return price >= filters.priceMin && price <= filters.priceMax;
      });
    }

    // Location-based filtering
    if (filters.location && filters.zipRadius > 0) {
      try {
        setLocationLoading(true);
        filtered = await filterListingsByProximity(filtered, filters.location, filters.zipRadius);
      } catch (error) {
        console.error('Error filtering by location:', error);
      }
      setLocationLoading(false);
    }

    setFilteredListings(filtered);
  };

  const handleLocationDetected = (zipCode: string) => {
    setFilters(prev => ({
      ...prev,
      location: zipCode
    }));
  };

  const getTypeColor = (type: ListingType) => {
    switch (type) {
      case 'Give Away':
        return 'bg-green-100 text-green-800';
      case 'Sell':
        return 'bg-blue-100 text-blue-800';
      case 'Share':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filterPanel = (
    <ImprovedFilterPanel 
      filters={filters} 
      onFiltersChange={setFilters}
      onLocationDetected={handleLocationDetected}
      user={user}
    />
  );

  return (
    <ProtectedRoute>
      <ResponsiveLayout showFilters={true} filterPanel={filterPanel}>
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Browse Resources</h1>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent">
              <option>Newest First</option>
              <option>Oldest First</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
          <p className="text-gray-600">Find and share resources with your community</p>
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredListings.length} of {listings.length} listings
          </p>
        </div>

        {/* Mobile Filters Button */}
        <div className="lg:hidden mb-4">
          <button className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
            Filters & Search
          </button>
        </div>

        {/* Results */}
        <div className="mb-4">
          {/* Location Status */}
          {filters.location && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                📍 Showing listings within {filters.zipRadius} miles of {filters.location}
                {locationLoading && <span className="ml-2">• Filtering by location...</span>}
              </p>
            </div>
          )}
          <span className="text-sm text-gray-500">
            {filteredListings.length} listings found
          </span>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No listings found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your filters or create a new listing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredListings.map(listing => (
              <ImprovedListingCard
                key={listing.id}
                listing={listing}
              />
            ))}
          </div>
        )}
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}
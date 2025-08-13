'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, Conversation } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ImprovedListingCard from '@/components/ImprovedListingCard';
import ConversationList from '@/components/ConversationList';
import FavoritesWatchlist from '@/components/dashboard/FavoritesWatchlist';
import AccountManagement from '@/components/dashboard/AccountManagement';
import BannerAd from '@/components/ads/BannerAd';
import NativeAd from '@/components/ads/NativeAd';
import SidebarAd from '@/components/ads/SidebarAd';
import SimplifiedSellerOnboarding from '@/components/SimplifiedSellerOnboarding';
import { 
  Squares2X2Icon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  HeartIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'inbox' | 'favorites' | 'account'>('overview');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    totalShared: 0,
  });
  const { user } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (user) {
      fetchMyListings();
      fetchConversations();
    }
  }, [user]);

  // Handle URL parameters for direct navigation to specific tabs
  useEffect(() => {
    const tab = searchParams?.get('tab');
    const setup = searchParams?.get('setup');
    
    if (tab === 'account' && setup === 'payments') {
      setActiveTab('account');
    }
  }, [searchParams]);

  const fetchMyListings = async () => {
    if (!user) return;
    
    try {
      const listingsRef = collection(db, 'listings');
      const q = query(
        listingsRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const listingsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Listing[];
      
      setMyListings(listingsData);
      
      // Calculate analytics
      const totalViews = listingsData.reduce((sum, listing) => sum + (listing.views || 0), 0);
      const totalShared = listingsData.filter(listing => listing.type === 'Give Away').length;
      
      setAnalytics(prev => ({
        ...prev,
        totalListings: listingsData.length,
        totalViews,
        totalShared,
      }));
    } catch (error) {
      console.error('Error fetching my listings:', error);
    }
  };

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      const conversationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        lastMessageAt: doc.data().lastMessageAt?.toDate(),
      })) as Conversation[];
      
      setConversations(conversationsData);
      
      // Update messages count in analytics
      setAnalytics(prev => ({
        ...prev,
        totalMessages: conversationsData.length,
      }));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Give Away':
        return 'bg-gray-100 text-gray-700';
      case 'Sell':
        return 'bg-gray-100 text-gray-700';
      case 'Share':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        {/* Simple Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your listings and account</p>
        </div>

        {/* Payment Setup - Only show if needed */}
        {activeTab === 'account' && (
          <div className="mb-6">
            <SimplifiedSellerOnboarding />
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'listings', label: 'My Listings', icon: Squares2X2Icon, count: myListings.length },
              { id: 'inbox', label: 'Messages', icon: ChatBubbleLeftRightIcon, count: conversations.length },
              { id: 'favorites', label: 'Saved Items', icon: HeartIcon },
              { id: 'account', label: 'Account', icon: UserCircleIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 sm:space-x-2 py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#665CF0] text-[#665CF0]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden lg:inline">
                  {tab.label} {tab.count !== undefined && `(${tab.count})`}
                </span>
                <span className="lg:hidden">
                  {tab.label.substring(0, 3)} {tab.count !== undefined && `(${tab.count})`}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {loading && (activeTab === 'listings' || activeTab === 'inbox') ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#665CF0]"></div>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Top Banner Ad */}
                <BannerAd location="dashboard-overview-top" />
                
                {/* Simple Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Listings</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalListings}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Messages</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalMessages}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Views</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalViews}</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Shared</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics.totalShared}</p>
                  </div>
                </div>

                {/* Native Ad Between Sections */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <NativeAd location="dashboard-between-sections" />
                  </div>
                  <div className="hidden md:block">
                    <SidebarAd location="dashboard-sidebar" />
                  </div>
                </div>
                
                {/* Recent Listings */}
                {myListings.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Listings</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myListings.slice(0, 3).map((listing) => (
                        <ImprovedListingCard key={listing.id} listing={listing} showUser={false} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'listings' && (
              <div>
                {myListings.length === 0 ? (
                  <div className="text-center py-12">
                    <Squares2X2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No listings yet</p>
                    <p className="text-gray-400">Create your first listing to get started!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {myListings.map(listing => (
                      <ImprovedListingCard
                        key={listing.id}
                        listing={listing}
                        showUser={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'inbox' && (
              <div>
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
                    <p className="text-gray-400">Messages will appear here when people contact you about your listings.</p>
                  </div>
                ) : (
                  <ConversationList conversations={conversations} />
                )}
              </div>
            )}

            {activeTab === 'favorites' && <FavoritesWatchlist />}
            {activeTab === 'account' && <AccountManagement />}
          </>
        )}
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}

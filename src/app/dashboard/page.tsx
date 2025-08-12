'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, Conversation } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import ImprovedListingCard from '@/components/ImprovedListingCard';
import ConversationList from '@/components/ConversationList';
import AnalyticsInsights from '@/components/dashboard/AnalyticsInsights';
import NotificationsAlerts from '@/components/dashboard/NotificationsAlerts';
import FavoritesWatchlist from '@/components/dashboard/FavoritesWatchlist';
import RecentActivity from '@/components/dashboard/RecentActivity';
import AccountManagement from '@/components/dashboard/AccountManagement';
import SellerOnboarding from '@/components/SellerOnboarding';
import { 
  Squares2X2Icon, 
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BellIcon,
  HeartIcon,
  ClockIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'inbox' | 'analytics' | 'notifications' | 'favorites' | 'activity' | 'account'>('overview');
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchMyListings();
      fetchConversations();
    }
  }, [user]);

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
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
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

  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your listings and conversations</p>
        </div>

        {/* Seller Onboarding */}
        <div className="mb-6">
          <SellerOnboarding />
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: ChartBarIcon },
              { id: 'listings', label: 'Listings', icon: Squares2X2Icon, count: myListings.length },
              { id: 'inbox', label: 'Inbox', icon: ChatBubbleLeftRightIcon, count: conversations.length },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon },
              { id: 'notifications', label: 'Alerts', icon: BellIcon },
              { id: 'favorites', label: 'Saved', icon: HeartIcon },
              { id: 'activity', label: 'Activity', icon: ClockIcon },
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
              <div className="space-y-8">
                <AnalyticsInsights />
                <NotificationsAlerts />
                <RecentActivity />
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

            {activeTab === 'analytics' && <AnalyticsInsights />}
            {activeTab === 'notifications' && <NotificationsAlerts />}
            {activeTab === 'favorites' && <FavoritesWatchlist />}
            {activeTab === 'activity' && <RecentActivity />}
            {activeTab === 'account' && <AccountManagement />}
          </>
        )}
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}

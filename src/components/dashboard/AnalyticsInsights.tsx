'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import EnhancedAnalyticsCard from '@/components/EnhancedAnalyticsCard';
import { 
  ChartBarIcon,
  EyeIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  totalShared: number;
  mostPopularCategory: string;
  responseRate: number;
  communityImpact: number;
}

export default function AnalyticsInsights() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalListings: 0,
    totalViews: 0,
    totalMessages: 0,
    totalShared: 0,
    mostPopularCategory: 'Loading...',
    responseRate: 0,
    communityImpact: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    if (!user) return;

    try {
      // Get user's listings
      const listingsRef = collection(db, 'listings');
      const userListingsQuery = query(listingsRef, where('userId', '==', user.uid));
      const listingsSnapshot = await getDocs(userListingsQuery);
      
      const userListings = listingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Get conversations for this user
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(conversationsRef, where('participants', 'array-contains', user.uid));
      const conversationsSnapshot = await getDocs(conversationsQuery);

      // Calculate analytics
      const totalListings = userListings.length;
      const totalViews = userListings.reduce((sum, listing: any) => sum + (listing.views || 0), 0);
      const totalMessages = conversationsSnapshot.size;
      
      // Calculate most popular category
      const categoryCount: { [key: string]: number } = {};
      userListings.forEach((listing: any) => {
        categoryCount[listing.category] = (categoryCount[listing.category] || 0) + 1;
      });
      const mostPopularCategory = Object.keys(categoryCount).length > 0 
        ? Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0][0]
        : 'None yet';

      // Mock some additional data for demonstration
      const totalShared = userListings.filter((listing: any) => listing.type === 'Give Away').length;
      const responseRate = totalListings > 0 ? Math.round((totalMessages / totalListings) * 100) : 0;
      const communityImpact = totalShared + Math.floor(totalMessages / 2); // Simple impact calculation

      setAnalytics({
        totalListings,
        totalViews: totalViews,
        totalMessages,
        totalShared,
        mostPopularCategory,
        responseRate,
        communityImpact,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
    setLoading(false);
  };

  const StatCard = ({ icon: Icon, title, value, description, color = 'text-gray-600' }: {
    icon: any;
    title: string;
    value: string | number;
    description: string;
    color?: string;
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg bg-gray-100 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <ChartBarIcon className="w-6 h-6 text-[#665CF0]" />
          <h2 className="text-lg font-semibold text-gray-900">Analytics & Insights</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <ChartBarIcon className="w-6 h-6 text-[#665CF0]" />
        <h2 className="text-lg font-semibold text-gray-900">Analytics & Insights</h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnhancedAnalyticsCard
          icon={ChartBarIcon}
          title="Total Listings"
          value={analytics.totalListings}
          description="Items you've shared"
          color="text-[#665CF0]"
          isEmpty={analytics.totalListings === 0}
          emptyState={{
            message: "No listings yet",
            action: "Create your first listing!"
          }}
          progress={{
            current: analytics.totalListings,
            max: 10,
            label: "Goal: 10 listings"
          }}
        />
        
        <EnhancedAnalyticsCard
          icon={EyeIcon}
          title="Total Views"
          value={analytics.totalViews}
          description="People interested"
          color="text-blue-600"
          isEmpty={analytics.totalViews === 0}
          emptyState={{
            message: "No views yet",
            action: "Share your listings to get views!"
          }}
          trend={analytics.totalViews > 0 ? { value: 12, isPositive: true } : undefined}
        />
        
        <EnhancedAnalyticsCard
          icon={ChatBubbleLeftRightIcon}
          title="Messages"
          value={analytics.totalMessages}
          description="Conversations started"
          color="text-green-600"
          isEmpty={analytics.totalMessages === 0}
          emptyState={{
            message: "No messages yet",
            action: "People will message you about listings!"
          }}
        />
        
        <EnhancedAnalyticsCard
          icon={HeartIcon}
          title="Items Shared"
          value={analytics.totalShared}
          description="Given away freely"
          color="text-red-600"
          isEmpty={analytics.totalShared === 0}
          emptyState={{
            message: "Nothing shared yet",
            action: "Share items to help your community!"
          }}
          progress={{
            current: analytics.totalShared,
            max: 5,
            label: "Community Helper Goal"
          }}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Most Popular Category</h3>
            <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">{analytics.mostPopularCategory}</p>
          <p className="text-sm text-gray-500 mt-1">Your top category</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Response Rate</h3>
            <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#665CF0] rounded-full transition-all duration-300"
                style={{ width: `${Math.min(analytics.responseRate, 100)}%` }}
              />
            </div>
          </div>
          <p className="text-xl font-bold text-gray-900">{analytics.responseRate}%</p>
          <p className="text-sm text-gray-500 mt-1">Messages per listing</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Community Impact</h3>
            <HeartIcon className="w-5 h-5 text-red-400" />
          </div>
          <p className="text-xl font-bold text-gray-900">{analytics.communityImpact}</p>
          <p className="text-sm text-gray-500 mt-1">Ministries helped</p>
        </div>
      </div>

      {/* Encouragement Message */}
      {analytics.totalShared > 0 && (
        <div className="bg-gradient-to-r from-[#665CF0]/10 to-blue-50 rounded-lg p-6 border border-[#665CF0]/20">
          <div className="flex items-center space-x-3">
            <HeartIcon className="w-8 h-8 text-[#665CF0]" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Great Impact!</h3>
              <p className="text-gray-600">
                You've blessed {analytics.communityImpact} ministries through your generosity and stewardship. Keep sharing!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

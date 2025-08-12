'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ClockIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  PlusIcon,
  HeartIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'listing_created' | 'listing_viewed' | 'message_sent' | 'message_received' | 'listing_favorited' | 'conversation_started';
  title: string;
  description: string;
  timestamp: Date;
  relatedId?: string; // listing ID or conversation ID
  actionUrl?: string;
  metadata?: {
    listingTitle?: string;
    otherUserName?: string;
    viewCount?: number;
  };
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    if (!user) return;

    try {
      // Get user's recent listings
      const listingsRef = collection(db, 'listings');
      const userListingsQuery = query(
        listingsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const listingsSnapshot = await getDocs(userListingsQuery);

      // Get recent conversations
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(
        conversationsRef, 
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc'),
        limit(5)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);

      const activityItems: ActivityItem[] = [];

      // Add listing activities
      listingsSnapshot.docs.forEach((doc) => {
        const listing = doc.data();
        activityItems.push({
          id: `listing-${doc.id}`,
          type: 'listing_created',
          title: 'You created a listing',
          description: listing.title,
          timestamp: listing.createdAt.toDate(),
          relatedId: doc.id,
          actionUrl: `/listing/${doc.id}`,
          metadata: {
            listingTitle: listing.title,
            viewCount: listing.views || 0
          }
        });
      });

      // Add conversation activities
      conversationsSnapshot.docs.forEach((doc) => {
        const conversation = doc.data();
        if (conversation.lastMessage && conversation.lastMessageAt) {
          activityItems.push({
            id: `conversation-${doc.id}`,
            type: 'message_received',
            title: 'New message received',
            description: conversation.lastMessage.substring(0, 50) + (conversation.lastMessage.length > 50 ? '...' : ''),
            timestamp: conversation.lastMessageAt.toDate(),
            relatedId: doc.id,
            actionUrl: `/conversation/${doc.id}`
          });
        }
      });

      // Add some mock activity for demonstration
      const now = new Date();
      const mockActivities: ActivityItem[] = [
        {
          id: 'activity-1',
          type: 'listing_viewed',
          title: 'Someone viewed your listing',
          description: '"Office Desks (x3)" got 3 new views',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          actionUrl: '/listing/mock-1',
          metadata: {
            listingTitle: 'Office Desks (x3)',
            viewCount: 3
          }
        },
        {
          id: 'activity-2',
          type: 'listing_favorited',
          title: 'Someone saved your listing',
          description: '"Youth Ministry Games" was added to favorites',
          timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
          actionUrl: '/listing/mock-2',
          metadata: {
            listingTitle: 'Youth Ministry Games'
          }
        },
        {
          id: 'activity-3',
          type: 'conversation_started',
          title: 'New conversation started',
          description: 'Emily from City Light Church messaged about your projector',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
          actionUrl: '/conversation/mock-1',
          metadata: {
            otherUserName: 'Emily White',
            listingTitle: 'Projector for Sanctuary'
          }
        }
      ];

      // Combine and sort all activities
      const allActivities = [...activityItems, ...mockActivities]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10); // Limit to 10 most recent

      setActivities(allActivities);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
    setLoading(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'listing_created':
        return <PlusIcon className="w-5 h-5 text-[#665CF0]" />;
      case 'listing_viewed':
        return <EyeIcon className="w-5 h-5 text-blue-600" />;
      case 'message_sent':
      case 'message_received':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-600" />;
      case 'listing_favorited':
        return <HeartIcon className="w-5 h-5 text-red-600" />;
      case 'conversation_started':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'listing_created':
        return 'bg-[#665CF0]/10 border-[#665CF0]/20';
      case 'listing_viewed':
        return 'bg-blue-50 border-blue-200';
      case 'message_sent':
      case 'message_received':
        return 'bg-green-50 border-green-200';
      case 'listing_favorited':
        return 'bg-red-50 border-red-200';
      case 'conversation_started':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-6 h-6 text-[#665CF0]" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClockIcon className="w-6 h-6 text-[#665CF0]" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        
        <button className="text-sm text-[#665CF0] hover:text-[#5A52E8] font-medium">
          View all activity
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No recent activity</p>
          <p className="text-gray-400">Your activity will appear here as you use CommonTable</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`bg-white rounded-lg border p-4 transition-all duration-200 hover:shadow-sm ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`flex-shrink-0 p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>
                          {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                        <span>
                          {format(activity.timestamp, 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                    
                    {activity.actionUrl && (
                      <Link
                        href={activity.actionUrl}
                        className="ml-3 flex items-center text-sm text-[#665CF0] hover:text-[#5A52E8] font-medium"
                      >
                        View
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/create-listing"
            className="flex items-center justify-center px-4 py-3 bg-[#665CF0] text-white rounded-lg hover:bg-[#5A52E8] transition-colors text-sm font-medium"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Listing
          </Link>
          
          <Link
            href="/"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <EyeIcon className="w-4 h-4 mr-2" />
            Browse Items
          </Link>
          
          <Link
            href="/messages"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
            Check Messages
          </Link>
        </div>
      </div>
    </div>
  );
}

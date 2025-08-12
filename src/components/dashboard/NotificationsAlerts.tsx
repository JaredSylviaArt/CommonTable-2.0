'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BellIcon, 
  ChatBubbleLeftRightIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  HeartIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'message' | 'listing_expiring' | 'new_interest' | 'price_drop' | 'new_listing';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsAlerts() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      // Get recent conversations for message notifications
      const conversationsRef = collection(db, 'conversations');
      const conversationsQuery = query(
        conversationsRef, 
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc'),
        limit(5)
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);

      // Get user's listings for expiration warnings
      const listingsRef = collection(db, 'listings');
      const userListingsQuery = query(listingsRef, where('userId', '==', user.uid));
      const listingsSnapshot = await getDocs(userListingsQuery);

      const mockNotifications: Notification[] = [];

      // Add message notifications
      conversationsSnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        if (data.lastMessage && data.lastMessageAt) {
          mockNotifications.push({
            id: `msg-${doc.id}`,
            type: 'message',
            title: 'New Message',
            message: `"${data.lastMessage.substring(0, 50)}${data.lastMessage.length > 50 ? '...' : ''}"`,
            timestamp: data.lastMessageAt.toDate(),
            read: index > 2, // Mark first few as unread
            actionUrl: `/conversation/${doc.id}`
          });
        }
      });

      // Add some mock notifications for demonstration
      const now = new Date();
      const mockAlerts: Notification[] = [
        {
          id: 'interest-1',
          type: 'new_interest',
          title: 'New Interest in Your Listing',
          message: 'Someone saved your "Office Desks" listing to their favorites',
          timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false
        },
        {
          id: 'expiring-1',
          type: 'listing_expiring',
          title: 'Listing Expiring Soon',
          message: 'Your "Youth Ministry Games" listing expires in 3 days',
          timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000), // 6 hours ago
          read: false
        },
        {
          id: 'new-listing-1',
          type: 'new_listing',
          title: 'New Listing in Your Area',
          message: 'Sound Equipment posted 2 miles away',
          timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000), // 12 hours ago
          read: true
        },
        {
          id: 'price-drop-1',
          type: 'price_drop',
          title: 'Price Drop Alert',
          message: 'Projector price dropped to $150 (was $200)',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true
        }
      ];

      // Combine and sort notifications
      const allNotifications = [...mockNotifications, ...mockAlerts]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10); // Limit to 10 most recent

      setNotifications(allNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
    setLoading(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />;
      case 'listing_expiring':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
      case 'new_interest':
        return <HeartIcon className="w-5 h-5 text-red-600" />;
      case 'price_drop':
        return <ClockIcon className="w-5 h-5 text-green-600" />;
      case 'new_listing':
        return <BellIcon className="w-5 h-5 text-[#665CF0]" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-6 h-6 text-[#665CF0]" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications & Alerts</h2>
          </div>
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
          <div className="relative">
            <BellIcon className="w-6 h-6 text-[#665CF0]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Notifications & Alerts</h2>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
            className="text-sm text-[#665CF0] hover:text-[#5A52E8] font-medium"
          >
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <BellIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No new notifications</p>
          <p className="text-gray-400">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-lg border border-gray-200 p-4 transition-all duration-200 hover:shadow-sm ${
                !notification.read ? 'border-l-4 border-l-[#665CF0] bg-blue-50/30' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className={`text-sm mt-1 ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {format(notification.timestamp, 'MMM d, h:mm a')}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-3">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-[#665CF0] hover:text-[#5A52E8] font-medium"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => dismissNotification(notification.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="text-center">
          <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
}

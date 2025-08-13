'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/contexts/AuthContext';
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, getUnreadNotificationCount } from '@/lib/notifications';
import { Notification } from '@/types';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when user changes or dropdown opens
  useEffect(() => {
    if (user && isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  }, [user, isOpen]);

  // Fetch unread count regularly
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userNotifications = await getUserNotifications(user.uid, 20);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await getUnreadNotificationCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    if (notification.actionUrl) {
      setIsOpen(false);
      // The Link component will handle navigation
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'favorite':
        return '❤️';
      case 'purchase':
        return '🛒';
      case 'sold':
        return '💰';
      case 'conversation':
        return '💬';
      case 'listing_viewed':
        return '👀';
      default:
        return '🔔';
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        {unreadCount > 0 ? (
          <BellIconSolid className="w-6 h-6" />
        ) : (
          <BellIcon className="w-6 h-6" />
        )}
        
        {/* Unread Count Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div key={notification.id}>
                  {notification.actionUrl ? (
                    <Link href={notification.actionUrl} onClick={() => handleNotificationClick(notification)}>
                      <NotificationItem notification={notification} />
                    </Link>
                  ) : (
                    <div onClick={() => handleNotificationClick(notification)}>
                      <NotificationItem notification={notification} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <Link
                href="/dashboard?tab=notifications"
                className="text-sm text-blue-600 hover:text-blue-800"
                onClick={() => setIsOpen(false)}
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <div className={`p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 ${
      !notification.read ? 'bg-blue-50' : ''
    }`}>
      <div className="flex items-start space-x-3">
        {/* Avatar or Icon */}
        <div className="flex-shrink-0">
          {notification.senderAvatar ? (
            <Image
              src={notification.senderAvatar}
              alt={notification.senderName || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">
              {getNotificationIcon(notification.type)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-900 truncate">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 ml-2"></div>
            )}
          </div>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );

  function getNotificationIcon(type: Notification['type']) {
    switch (type) {
      case 'message':
        return '💬';
      case 'favorite':
        return '❤️';
      case 'purchase':
        return '🛒';
      case 'sold':
        return '💰';
      case 'conversation':
        return '💬';
      case 'listing_viewed':
        return '👀';
      default:
        return '🔔';
    }
  }
}

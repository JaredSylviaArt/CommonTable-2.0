'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ResponsiveLayout from '@/components/ResponsiveLayout';
import BannerAd from '@/components/ads/BannerAd';
import NativeAd from '@/components/ads/NativeAd';
import ConversationList from '@/components/ConversationList';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

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

  return (
    <ProtectedRoute>
      <ResponsiveLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
          <p className="text-gray-600">Your conversations about listings</p>
        </div>

        {/* Top Banner Ad */}
        <div className="mb-6">
          <BannerAd location="messages-chat-top" />
        </div>

        {/* Messages Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#665CF0]"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">No conversations yet</p>
            <p className="text-gray-400">Messages will appear here when people contact you about your listings.</p>
          </div>
        ) : (
          <div className="max-w-4xl">
            <ConversationList conversations={conversations} />
          </div>
        )}
      </ResponsiveLayout>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, User, Listing } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

interface ConversationListProps {
  conversations: Conversation[];
}

interface ConversationWithDetails extends Conversation {
  otherUser?: User;
  listing?: Listing;
}

export default function ConversationList({ conversations }: ConversationListProps) {
  const [conversationsWithDetails, setConversationsWithDetails] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchConversationDetails();
  }, [conversations, user]);

  const fetchConversationDetails = async () => {
    if (!user) return;

    const detailedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherUserId = conversation.participants.find(id => id !== user.uid);
        let otherUser: User | undefined;
        let listing: Listing | undefined;

        // Fetch other user details
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            otherUser = { uid: otherUserId, ...userDoc.data() } as User;
          }
        }

        // Fetch listing details
        if (conversation.listingId) {
          const listingDoc = await getDoc(doc(db, 'listings', conversation.listingId));
          if (listingDoc.exists()) {
            listing = { id: conversation.listingId, ...listingDoc.data() } as Listing;
          }
        }

        return {
          ...conversation,
          otherUser,
          listing,
        };
      })
    );

    setConversationsWithDetails(detailedConversations);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conversationsWithDetails.map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversation/${conversation.id}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-[#665CF0] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {conversation.otherUser?.name?.charAt(0) || '?'}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {conversation.otherUser?.name || 'Unknown User'}
                  </h3>
                  <span className="text-xs text-gray-500">
                    {conversation.lastMessageAt && format(conversation.lastMessageAt, 'MMM d, h:mm a')}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 truncate mb-1">
                  Re: {conversation.listing?.title || 'Unknown Listing'}
                </p>
                
                {conversation.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

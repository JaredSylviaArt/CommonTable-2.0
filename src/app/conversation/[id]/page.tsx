'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  onSnapshot,
  updateDoc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notifyNewMessage } from '@/lib/notifications';
import { useAuth } from '@/contexts/AuthContext';
import { Message, Conversation, User, Listing } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import { format } from 'date-fns';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

export default function ConversationPage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (params.id && user) {
      fetchConversationData();
      setupMessagesListener();
    }
  }, [params.id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversationData = async () => {
    try {
      // Fetch conversation
      const conversationDoc = await getDoc(doc(db, 'conversations', params.id as string));
      if (conversationDoc.exists()) {
        const conversationData = {
          id: conversationDoc.id,
          ...conversationDoc.data(),
          createdAt: conversationDoc.data().createdAt?.toDate(),
          lastMessageAt: conversationDoc.data().lastMessageAt?.toDate(),
        } as Conversation;
        setConversation(conversationData);

        // Fetch other user
        const otherUserId = conversationData.participants.find(id => id !== user?.uid);
        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            setOtherUser({ uid: otherUserId, ...userDoc.data() } as User);
          }
        }

        // Fetch listing
        if (conversationData.listingId) {
          const listingDoc = await getDoc(doc(db, 'listings', conversationData.listingId));
          if (listingDoc.exists()) {
            setListing({ id: conversationData.listingId, ...listingDoc.data() } as Listing);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching conversation data:', error);
    }
    setLoading(false);
  };

  const setupMessagesListener = () => {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', params.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      })) as Message[];
      setMessages(messagesData);
    });

    return unsubscribe;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !conversation) return;

    setSending(true);
    try {
      // Add message
      await addDoc(collection(db, 'messages'), {
        conversationId: conversation.id,
        senderId: user.uid,
        text: newMessage.trim(),
        createdAt: new Date(),
      });

      // Update conversation with last message
      await updateDoc(doc(db, 'conversations', conversation.id), {
        lastMessage: newMessage.trim(),
        lastMessageAt: new Date(),
      });

      // Send notification to other participant
      const otherParticipant = conversation.participants.find(p => p !== user.uid);
      if (otherParticipant && conversation.listingId) {
        await notifyNewMessage(
          otherParticipant,
          user.uid,
          conversation.id,
          conversation.listingId
        );
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setSending(false);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-96 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#665CF0]"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!conversation) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Conversation not found</h1>
              <p className="text-gray-600">The conversation you're looking for doesn't exist.</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#665CF0] rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {otherUser?.name?.charAt(0) || '?'}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-gray-900">
                    {otherUser?.name || 'Unknown User'}
                  </h1>
                  {listing && (
                    <p className="text-sm text-gray-600">
                      About: {listing.title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.senderId === user?.uid
                          ? 'bg-[#665CF0] text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.senderId === user?.uid ? 'text-white/70' : 'text-gray-500'
                        }`}
                      >
                        {format(message.createdAt, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:border-transparent text-dark-force"
                  style={{ color: '#111827 !important' }}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="bg-[#665CF0] text-white px-4 py-2 rounded-lg hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing, User } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import BuyButton from '@/components/BuyButton';
import Image from 'next/image';
import { MapPinIcon, CalendarDaysIcon, ChatBubbleLeftRightIcon, UserIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ListingDetailPage() {
  const [listing, setListing] = useState<Listing | null>(null);
  const [listingOwner, setListingOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const fetchListing = async () => {
    try {
      const listingDoc = await getDoc(doc(db, 'listings', params.id as string));
      if (listingDoc.exists()) {
        const listingData = {
          id: listingDoc.id,
          ...listingDoc.data(),
          createdAt: listingDoc.data().createdAt?.toDate(),
        } as Listing;
        setListing(listingData);

        // Fetch listing owner details
        const ownerDoc = await getDoc(doc(db, 'users', listingData.userId));
        if (ownerDoc.exists()) {
          setListingOwner({ uid: listingData.userId, ...ownerDoc.data() } as User);
        }
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    }
    setLoading(false);
  };

  const handleContactSeller = async () => {
    if (!user || !listing) return;

    setContactLoading(true);

    try {
      // Check if conversation already exists
      const conversationsRef = collection(db, 'conversations');
      const q = query(
        conversationsRef,
        where('listingId', '==', listing.id),
        where('participants', 'array-contains', user.uid)
      );
      const existingConversations = await getDocs(q);

      let conversationId;

      if (existingConversations.empty) {
        // Create new conversation
        const newConversation = {
          listingId: listing.id,
          participants: [user.uid, listing.userId],
          createdAt: new Date(),
          lastMessageAt: new Date(),
        };
        const conversationDoc = await addDoc(conversationsRef, newConversation);
        conversationId = conversationDoc.id;
      } else {
        // Use existing conversation
        conversationId = existingConversations.docs[0].id;
      }

      router.push(`/conversation/${conversationId}`);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
    setContactLoading(false);
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

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-64 w-full rounded-lg mb-6"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!listing) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h1>
              <p className="text-gray-600">The listing you're looking for doesn't exist.</p>
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
            {/* Image */}
            <div className="relative h-64 md:h-96 w-full bg-gray-100">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">No image available</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(listing.type)}`}>
                      {listing.type}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {listing.category}
                    </span>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPinIcon className="w-5 h-5" />
                  <span>ZIP: {listing.zipCode}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <CalendarDaysIcon className="w-5 h-5" />
                  <span>Posted {format(listing.createdAt, 'MMM d, yyyy')}</span>
                </div>
                <div className="text-gray-600">
                  <span className="font-medium">Condition:</span> {listing.condition}
                </div>
              </div>

              {/* Owner Info */}
              {listingOwner && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Posted by</h2>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-[#665CF0] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {listingOwner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{listingOwner.name}</p>
                      <p className="text-sm text-gray-600">{listingOwner.churchRole} at {listingOwner.churchName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Price (if selling) */}
              {listing.type === 'Sell' && listing.price && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <div className="text-3xl font-bold text-gray-900">
                    ${listing.price.toFixed(2)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Includes 3% platform fee
                  </p>
                </div>
              )}

              {/* Buy Button */}
              {listing.type === 'Sell' && user && listing.userId !== user.uid && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <BuyButton listing={listing} className="w-full" />
                </div>
              )}

              {/* Contact Button */}
              {user && listing.userId !== user.uid && (
                <div className="border-t border-gray-200 pt-6">
                  <button
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                    className="w-full md:w-auto bg-[#665CF0] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    <span>{contactLoading ? 'Starting conversation...' : 'Contact about this item'}</span>
                  </button>
                </div>
              )}

              {user && listing.userId === user.uid && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 text-sm">
                      <UserIcon className="w-4 h-4 inline mr-1" />
                      This is your listing. Others can contact you about this item.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

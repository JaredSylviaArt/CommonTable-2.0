'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listing, User } from '@/types';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, doc, getDoc, deleteDoc } from 'firebase/firestore';

interface ImprovedListingCardProps {
  listing: Listing;
  showUser?: boolean;
}

export default function ImprovedListingCard({ listing, showUser = true }: ImprovedListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const [listingOwner, setListingOwner] = useState<User | null>(null);
  const [loadingOwner, setLoadingOwner] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (showUser && listing.userId) {
      fetchListingOwner();
    }
  }, [listing.userId, showUser]);

  useEffect(() => {
    if (user) {
      checkIfFavorited();
    }
  }, [user, listing.id]);

  const fetchListingOwner = async () => {
    if (loadingOwner) return;
    setLoadingOwner(true);
    
    try {
      const ownerDoc = await getDoc(doc(db, 'users', listing.userId));
      if (ownerDoc.exists()) {
        setListingOwner({ uid: listing.userId, ...ownerDoc.data() } as User);
      }
    } catch (error) {
      console.error('Error fetching listing owner:', error);
    } finally {
      setLoadingOwner(false);
    }
  };

  const checkIfFavorited = async () => {
    if (!user) return;

    try {
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        where('listingId', '==', listing.id)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        setIsLiked(true);
        setFavoriteId(querySnapshot.docs[0].id);
      } else {
        setIsLiked(false);
        setFavoriteId(null);
      }
    } catch (error) {
      console.error('Error checking if favorited:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) return;

    try {
      if (isLiked && favoriteId) {
        // Remove from favorites
        await deleteDoc(doc(db, 'favorites', favoriteId));
        setIsLiked(false);
        setFavoriteId(null);
      } else {
        // Add to favorites
        const favoriteData = {
          userId: user.uid,
          listingId: listing.id,
          listingTitle: listing.title,
          listingType: listing.type,
          listingCategory: listing.category,
          dateAdded: new Date(),
        };
        const docRef = await addDoc(collection(db, 'favorites'), favoriteData);
        setIsLiked(true);
        setFavoriteId(docRef.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Give Away':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'Sell':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'Share':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'text-gray-600';
      case 'Like New':
        return 'text-gray-600';
      case 'Good':
        return 'text-gray-600';
      case 'Fair':
        return 'text-gray-600';
      case 'Poor':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleContactSeller = async () => {
    if (!user || !listing || user.uid === listing.userId) return;

    setIsMessaging(true);

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
    } finally {
      setIsMessaging(false);
    }
  };



  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <Link href={`/listing/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 w-full">
          {listing.imageUrl ? (
            <Image
              src={listing.imageUrl}
              alt={listing.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
              {listing.type}
            </span>
            
            {/* Payment Setup Badge - Only for sell listings without any payment method */}
            {listing.type === 'Sell' && listingOwner && (
              !listingOwner.canReceivePayments && 
              !listingOwner.debitCardLast4 && 
              !listingOwner.stripeChargesEnabled
            ) && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                Setup Available
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite();
              }}
              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              {isLiked ? (
                <HeartIconSolid className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                // Handle share
              }}
              className="w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
            >
              <ShareIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {listing.category}
              </span>
              {listing.type === 'Sell' && listing.price && (
                <span className="text-lg font-semibold text-gray-900">
                  ${listing.price.toFixed(2)}
                </span>
              )}
            </div>
            <Link href={`/listing/${listing.id}`}>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-gray-700 transition-colors">
                {listing.title}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <span className={`font-medium ${getConditionColor(listing.condition)}`}>
            {listing.condition}
          </span>
          <span>{listing.condition}</span>
        </div>

        {/* User Info */}
        {showUser && (
          <div className="flex items-center space-x-3 pt-3 border-t border-gray-100">
            <div className="w-6 h-6 bg-[#665CF0] rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {listingOwner?.name?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {loadingOwner ? (
                <>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </>
              ) : listingOwner ? (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleContactSeller();
                    }}
                    disabled={isMessaging || (user && user.uid === listing.userId)}
                    className="text-sm font-medium text-gray-900 truncate hover:text-gray-700 transition-colors text-left disabled:hover:text-gray-900"
                  >
                    {listingOwner.name}
                  </button>
                  <p className="text-xs text-gray-500 truncate">
                    {listingOwner.churchRole} at {listingOwner.churchName}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Unknown User
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Community Member
                  </p>
                </>
              )}
            </div>
            {user && user.uid !== listing.userId && (
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleContactSeller();
                }}
                disabled={isMessaging}
                className="text-[#665CF0] hover:text-[#5A52E8] transition-colors disabled:opacity-50 p-1"
                title="Send message"
              >
                {isMessaging ? (
                  <div className="w-4 h-4 border-2 border-[#665CF0] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

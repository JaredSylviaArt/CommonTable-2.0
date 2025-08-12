'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Listing } from '@/types';
import { HeartIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

interface ImprovedListingCardProps {
  listing: Listing;
  showUser?: boolean;
}

export default function ImprovedListingCard({ listing, showUser = true }: ImprovedListingCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Give Away':
        return 'bg-green-500 text-white';
      case 'Sell':
        return 'bg-blue-500 text-white';
      case 'Share':
        return 'bg-purple-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'New':
        return 'text-green-600';
      case 'Like New':
        return 'text-blue-600';
      case 'Good':
        return 'text-yellow-600';
      case 'Fair':
        return 'text-orange-600';
      case 'Poor':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Mock user data - in real app this would come from the listing
  const mockUser = {
    name: 'John Smith',
    church: 'First Baptist',
    avatar: 'J'
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
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(listing.type)}`}>
              {listing.type}
            </span>
          </div>

          {/* Actions */}
          <div className="absolute top-3 right-3 flex space-x-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
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
                <span className="text-lg font-bold text-[#665CF0]">
                  ${listing.price.toFixed(2)}
                </span>
              )}
            </div>
            <Link href={`/listing/${listing.id}`}>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-[#665CF0] transition-colors">
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
                {mockUser.avatar}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {mockUser.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {mockUser.church}
              </p>
            </div>
            <button className="text-[#665CF0] hover:text-[#5A52E8] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

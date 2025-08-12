'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Listing } from '@/types';
import { MapPinIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface ListingCardProps {
  listing: Listing;
  typeColor: string;
}

export default function ListingCard({ listing, typeColor }: ListingCardProps) {
  return (
    <Link href={`/listing/${listing.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-md transition-all duration-200">
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
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColor}`}>
              {listing.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#665CF0] transition-colors">
            {listing.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {listing.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4" />
              <span>{listing.zipCode}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-4 h-4" />
              <span>{format(listing.createdAt, 'MMM d')}</span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {listing.category}
              </span>
              <span className="text-xs text-gray-500">
                {listing.condition}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

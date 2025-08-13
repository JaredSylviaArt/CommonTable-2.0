'use client';

import { useState, useEffect } from 'react';
import { Ad, AdLocation } from '@/types/ads';
import { getAdsForLocation, trackAdImpression, trackAdClick } from '@/lib/ads';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface NativeAdProps {
  location: AdLocation;
  className?: string;
}

export default function NativeAd({ location, className = '' }: NativeAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadAd();
  }, [location, user]);

  useEffect(() => {
    if (ad && isVisible) {
      // Track impression when ad becomes visible
      trackAdImpression(ad.id, location, user?.uid);
    }
  }, [ad, isVisible, location, user]);

  const loadAd = () => {
    const ads = getAdsForLocation(location, 'native', user?.churchRole, 1);
    if (ads.length > 0) {
      setAd(ads[0]);
      setIsVisible(true);
    }
  };

  const handleAdClick = () => {
    if (ad) {
      trackAdClick(ad.id, location, ad.clickUrl, user?.uid);
      window.open(ad.clickUrl, '_blank');
    }
  };

  if (!ad) return null;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${className}`} onClick={handleAdClick}>
      {/* Sponsored Label */}
      <div className="absolute top-2 left-2 z-10">
        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
          Sponsored
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 w-full">
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
            {ad.title}
          </h3>
        </div>

        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
          {ad.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{ad.advertiser}</span>
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

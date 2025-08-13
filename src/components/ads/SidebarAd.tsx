'use client';

import { useState, useEffect } from 'react';
import { Ad, AdLocation } from '@/types/ads';
import { getAdsForLocation, trackAdImpression, trackAdClick } from '@/lib/ads';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface SidebarAdProps {
  location: AdLocation;
  className?: string;
  size?: 'medium' | 'large';
}

export default function SidebarAd({ location, className = '', size = 'medium' }: SidebarAdProps) {
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
    const ads = getAdsForLocation(location, 'sidebar', user?.churchRole, 1);
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

  const adHeight = size === 'large' ? 'h-[600px]' : 'h-[250px]';
  const imageHeight = size === 'large' ? 'h-64' : 'h-32';

  return (
    <div className={`w-full max-w-[300px] ${className}`}>
      <div className="mb-1 text-xs text-gray-500 text-center">
        Advertisement
      </div>
      <div 
        className={`${adHeight} bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
        onClick={handleAdClick}
      >
        {/* Ad Image */}
        <div className={`${imageHeight} relative w-full`}>
          <Image
            src={ad.imageUrl}
            alt={ad.title}
            fill
            className="object-cover"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
              Sponsored
            </span>
          </div>
        </div>
        
        {/* Ad Content */}
        <div className="p-4 h-full flex flex-col">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">
            {ad.title}
          </h4>
          <p className="text-gray-600 text-sm line-clamp-4 mb-4 flex-1">
            {ad.description}
          </p>
          <div className="mt-auto">
            <div className="text-xs text-gray-500 mb-2">{ad.advertiser}</div>
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm font-medium hover:bg-blue-700 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

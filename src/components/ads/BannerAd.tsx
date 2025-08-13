'use client';

import { useState, useEffect } from 'react';
import { Ad, AdLocation } from '@/types/ads';
import { getAdsForLocation, trackAdImpression, trackAdClick } from '@/lib/ads';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface BannerAdProps {
  location: AdLocation;
  className?: string;
  size?: 'leaderboard' | 'mobile-banner';
}

export default function BannerAd({ location, className = '', size = 'leaderboard' }: BannerAdProps) {
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
    const ads = getAdsForLocation(location, 'banner', user?.churchRole, 1);
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

  const bannerHeight = size === 'leaderboard' ? 'h-[90px]' : 'h-[50px]';
  const bannerWidth = size === 'leaderboard' ? 'w-full max-w-[728px]' : 'w-full max-w-[320px]';

  return (
    <div className={`${bannerWidth} mx-auto ${className}`}>
      <div className="mb-1 text-xs text-gray-500 text-center">
        Advertisement
      </div>
      <div 
        className={`${bannerHeight} ${bannerWidth} bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
        onClick={handleAdClick}
      >
        <div className="flex h-full">
          {/* Ad Image */}
          <div className={`${size === 'leaderboard' ? 'w-24' : 'w-12'} flex-shrink-0 relative`}>
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>
          
          {/* Ad Content */}
          <div className="flex-1 p-3 flex flex-col justify-center">
            <h4 className={`font-medium text-gray-900 ${size === 'leaderboard' ? 'text-sm' : 'text-xs'} line-clamp-1`}>
              {ad.title}
            </h4>
            <p className={`text-gray-600 ${size === 'leaderboard' ? 'text-xs' : 'text-xs'} line-clamp-2 mt-1`}>
              {ad.description}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">{ad.advertiser}</span>
              <span className="text-xs text-blue-600 font-medium">Learn More →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

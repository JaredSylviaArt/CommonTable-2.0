'use client';

import { useState, useEffect } from 'react';
import { Ad, AdLocation } from '@/types/ads';
import { getAdsForLocation, trackAdImpression, trackAdClick } from '@/lib/ads';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface InterstitialAdProps {
  location: AdLocation;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export default function InterstitialAd({ location, isOpen, onClose, className = '' }: InterstitialAdProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      loadAd();
    }
  }, [isOpen, location, user]);

  useEffect(() => {
    if (ad && isOpen) {
      // Track impression when ad is shown
      trackAdImpression(ad.id, location, user?.uid);
    }
  }, [ad, isOpen, location, user]);

  const loadAd = () => {
    const ads = getAdsForLocation(location, 'interstitial', user?.churchRole, 1);
    if (ads.length > 0) {
      setAd(ads[0]);
    }
  };

  const handleAdClick = () => {
    if (ad) {
      trackAdClick(ad.id, location, ad.clickUrl, user?.uid);
      window.open(ad.clickUrl, '_blank');
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen || !ad) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleClose} />
      
      {/* Ad Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100 transition-all"
        >
          <XMarkIcon className="h-5 w-5 text-gray-600" />
        </button>

        {/* Sponsored Label */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
            Sponsored
          </span>
        </div>

        {/* Ad Content */}
        <div className="cursor-pointer" onClick={handleAdClick}>
          {/* Image */}
          <div className="relative h-64 w-full">
            <Image
              src={ad.imageUrl}
              alt={ad.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {ad.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 leading-relaxed">
              {ad.description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{ad.advertiser}</span>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Skip Ad Option */}
        <div className="text-center pb-4">
          <button
            onClick={handleClose}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Skip Ad
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getRecommendations, trackEvent } from '@/lib/analytics';
import { Listing } from '@/types';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ImprovedListingCard from './ImprovedListingCard';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface SmartRecommendationsProps {
  className?: string;
  maxItems?: number;
  title?: string;
}

export default function SmartRecommendations({ 
  className = '', 
  maxItems = 6,
  title = 'Recommended for You'
}: SmartRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Array<{
    listing: Listing;
    reason: string;
    score: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get recommendations from analytics service
      const recs = await getRecommendations(user.uid, user.churchRole);
      
      // Fetch full listing data for each recommendation
      const listingsWithReasons = await Promise.all(
        recs.slice(0, maxItems).map(async (rec) => {
          const listingDoc = await getDoc(doc(db, 'listings', rec.listingId));
          if (listingDoc.exists()) {
            const listing = {
              id: listingDoc.id,
              ...listingDoc.data(),
              createdAt: listingDoc.data().createdAt?.toDate(),
            } as Listing;
            
            return {
              listing,
              reason: rec.reason,
              score: rec.score
            };
          }
          return null;
        })
      );

      // Filter out null entries and update state
      const validRecommendations = listingsWithReasons.filter(Boolean) as Array<{
        listing: Listing;
        reason: string;
        score: number;
      }>;
      
      setRecommendations(validRecommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommendationClick = async (listing: Listing, reason: string) => {
    if (user) {
      await trackEvent({
        userId: user.uid,
        eventType: 'view',
        listingId: listing.id,
        category: listing.category,
        userRole: user.churchRole,
        userZip: user.zipCode,
        metadata: {
          source: 'recommendation',
          reason: reason
        }
      });
    }
  };

  if (!user || loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 animate-pulse">
              <div className="w-full h-48 bg-gray-200 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">
            No recommendations yet. Browse and interact with listings to get personalized suggestions!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <SparklesIcon className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-500">
          ({recommendations.length} suggestion{recommendations.length !== 1 ? 's' : ''})
        </span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec, index) => (
          <div key={rec.listing.id} className="relative">
            <div onClick={() => handleRecommendationClick(rec.listing, rec.reason)}>
              <ImprovedListingCard listing={rec.listing} />
            </div>
            
            {/* Recommendation reason badge */}
            <div className="absolute top-2 left-2 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-sm">
              <SparklesIcon className="h-3 w-3" />
              {rec.reason}
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === maxItems && (
        <div className="text-center mt-4">
          <button 
            onClick={loadRecommendations}
            className="text-purple-600 hover:text-purple-700 text-sm font-medium"
          >
            Refresh Recommendations
          </button>
        </div>
      )}
    </div>
  );
}

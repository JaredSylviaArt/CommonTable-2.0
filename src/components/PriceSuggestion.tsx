'use client';

import { useState, useEffect } from 'react';
import { getPriceSuggestion } from '@/lib/analytics';
import { ListingCategory } from '@/types';
import { 
  LightBulbIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon 
} from '@heroicons/react/24/outline';

interface PriceSuggestionProps {
  category: ListingCategory;
  userZip?: string;
  onPriceSelect: (price: number) => void;
  className?: string;
}

export default function PriceSuggestion({ 
  category, 
  userZip, 
  onPriceSelect, 
  className = '' 
}: PriceSuggestionProps) {
  const [suggestion, setSuggestion] = useState<{
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    averagePrice: number;
    totalListings: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (category) {
      loadPriceSuggestion();
    }
  }, [category, userZip]);

  const loadPriceSuggestion = async () => {
    setLoading(true);
    try {
      const data = await getPriceSuggestion(category, userZip);
      setSuggestion(data);
      setIsVisible(true);
    } catch (error) {
      console.error('Error loading price suggestion:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!category || loading) {
    return null;
  }

  if (!suggestion || suggestion.totalListings === 0) {
    return (
      <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <LightBulbIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Price Suggestion</h4>
            <p className="text-sm text-blue-700 mt-1">
              No similar items found in {category}. Consider checking marketplace prices or starting with $25-50.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const isAboveAverage = suggestion.suggestedPrice > suggestion.averagePrice;

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <CurrencyDollarIcon className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-medium text-green-900">Smart Price Suggestion</h4>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
              Based on {suggestion.totalListings} similar items
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            {/* Suggested Price */}
            <div className="text-center p-3 bg-white rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-700">
                {formatPrice(suggestion.suggestedPrice)}
              </div>
              <div className="text-xs text-green-600 font-medium">Suggested</div>
              <button
                onClick={() => onPriceSelect(suggestion.suggestedPrice)}
                className="mt-1 text-xs text-green-700 hover:text-green-800 underline"
              >
                Use this price
              </button>
            </div>

            {/* Average Price */}
            <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-semibold text-gray-700">
                {formatPrice(suggestion.averagePrice)}
              </div>
              <div className="text-xs text-gray-600">Average</div>
              <button
                onClick={() => onPriceSelect(suggestion.averagePrice)}
                className="mt-1 text-xs text-gray-700 hover:text-gray-800 underline"
              >
                Use this price
              </button>
            </div>

            {/* Price Range */}
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-semibold text-blue-700">
                {formatPrice(suggestion.priceRange.min)} - {formatPrice(suggestion.priceRange.max)}
              </div>
              <div className="text-xs text-blue-600">Range</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-green-700">
            {isAboveAverage ? (
              <ArrowTrendingUpIcon className="h-4 w-4" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4" />
            )}
            <span>
              {isAboveAverage 
                ? 'Priced above average - may take longer to sell' 
                : 'Competitively priced - likely to sell quickly'
              }
            </span>
          </div>

          <div className="mt-2 text-xs text-green-600">
            💡 Tip: Price 10-15% below average for faster sales, or match average for fair market value.
          </div>
        </div>
      </div>
    </div>
  );
}

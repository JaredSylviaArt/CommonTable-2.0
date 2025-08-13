'use client';

import { useState, useEffect } from 'react';
import { getDemandInsights } from '@/lib/analytics';
import { DemandInsight } from '@/lib/analytics';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon,
  FireIcon,
  ChartBarIcon,
  CurrencyDollarIcon 
} from '@heroicons/react/24/outline';

interface DemandInsightsProps {
  userZip?: string;
  className?: string;
  showTitle?: boolean;
  maxItems?: number;
}

export default function DemandInsights({ 
  userZip, 
  className = '',
  showTitle = true,
  maxItems = 6
}: DemandInsightsProps) {
  const [insights, setInsights] = useState<DemandInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, [userZip]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const data = await getDemandInsights(userZip);
      setInsights(data.slice(0, maxItems));
    } catch (error) {
      console.error('Error loading demand insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'down':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      default:
        return <MinusIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDemandLevel = (demand: number) => {
    if (demand >= 15) return { label: 'Very High', color: 'text-red-600 bg-red-50 border-red-200' };
    if (demand >= 10) return { label: 'High', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    if (demand >= 5) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
    if (demand >= 2) return { label: 'Low', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { label: 'Very Low', color: 'text-gray-600 bg-gray-50 border-gray-200' };
  };

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Market Demand</h2>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showTitle && (
        <div className="flex items-center gap-2 mb-4">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">Market Demand Insights</h2>
          <span className="text-sm text-gray-500">
            (Last 30 days)
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {insights.map((insight) => {
          const demandLevel = getDemandLevel(insight.demand);
          
          return (
            <div key={insight.category} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {insight.category}
                  </h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(insight.trendDirection)}
                    <span className="text-xs text-gray-600 capitalize">
                      {insight.trendDirection}
                    </span>
                  </div>
                </div>
                
                {insight.popularInArea && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <FireIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Hot</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {/* Demand Level */}
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${demandLevel.color}`}>
                  {demandLevel.label} Demand
                </div>

                {/* Activity Count */}
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{insight.demand}</span> recent interactions
                </div>

                {/* Listings Count */}
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{insight.totalListings}</span> active listings
                </div>

                {/* Average Price */}
                {insight.avgPrice && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CurrencyDollarIcon className="h-4 w-4" />
                    <span>Avg: <span className="font-semibold text-gray-900">${insight.avgPrice}</span></span>
                  </div>
                )}
              </div>

              {/* Opportunity Indicator */}
              {insight.demand > 8 && insight.totalListings < 5 && (
                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                  🎯 <strong>Opportunity:</strong> High demand, low supply
                </div>
              )}
              
              {insight.demand < 3 && insight.totalListings > 10 && (
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  ⚠️ <strong>Note:</strong> Low demand, high competition
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <ChartBarIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 mb-1">How to Use These Insights</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>High demand + Low supply</strong> = Great opportunity to list items</li>
              <li>• <strong>Trending up</strong> = Consider pricing items in this category higher</li>
              <li>• <strong>Hot categories</strong> = Items likely to sell quickly in your area</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

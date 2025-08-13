'use client';

import { useState, useEffect } from 'react';
import { getCommunityImpact } from '@/lib/analytics';
import { CommunityImpact } from '@/lib/analytics';
import { 
  HeartIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';

interface CommunityImpactDashboardProps {
  className?: string;
}

export default function CommunityImpactDashboard({ className = '' }: CommunityImpactDashboardProps) {
  const [impact, setImpact] = useState<CommunityImpact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadImpactData();
  }, []);

  const loadImpactData = async () => {
    try {
      setLoading(true);
      const data = await getCommunityImpact();
      setImpact(data);
    } catch (error) {
      console.error('Error loading community impact:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!impact) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center py-8">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Unable to load community impact data</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <HeartIcon className="h-6 w-6 text-purple-600" />
        <h2 className="text-xl font-semibold text-gray-900">Community Impact</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <HeartIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">Items Shared</p>
              <p className="text-2xl font-bold text-green-800">{impact.totalItemsShared}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-medium">Value Shared</p>
              <p className="text-2xl font-bold text-blue-800">${impact.totalValueShared.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <UsersIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-purple-700 font-medium">Active Members</p>
              <p className="text-2xl font-bold text-purple-800">{impact.activeMembers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <TrophyIcon className="h-5 w-5 text-yellow-600" />
            Most Shared Categories
          </h3>
          
          {impact.topCategories.length > 0 ? (
            <div className="space-y-3">
              {impact.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-900">{category.category}</span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{category.count} items</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No data available yet</p>
          )}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            Recent Community Activity
          </h3>
          
          {impact.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {impact.recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    activity.type === 'purchase' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {activity.type === 'purchase' ? (
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <HeartIcon className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity</p>
          )}
        </div>
      </div>

      {/* Impact Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start gap-3">
          <HeartIcon className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-purple-900 mb-1">Community Impact Summary</h4>
            <p className="text-sm text-purple-700">
              Together, our community has shared <strong>{impact.totalItemsShared} items</strong> worth 
              <strong> ${impact.totalValueShared.toLocaleString()}</strong>, with <strong>{impact.activeMembers} active members</strong> participating 
              in building a more connected and sustainable community. Every shared item makes a difference! 🌟
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

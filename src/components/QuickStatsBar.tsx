'use client';

import { EyeIcon, ChatBubbleLeftRightIcon, Squares2X2Icon, HeartIcon } from '@heroicons/react/24/outline';

interface QuickStatsBarProps {
  totalListings: number;
  totalViews: number;
  totalMessages: number;
  totalShared: number;
}

export default function QuickStatsBar({ totalListings, totalViews, totalMessages, totalShared }: QuickStatsBarProps) {
  const stats = [
    {
      name: 'Listings',
      value: totalListings,
      icon: Squares2X2Icon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      name: 'Views',
      value: totalViews,
      icon: EyeIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      name: 'Messages',
      value: totalMessages,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      name: 'Shared',
      value: totalShared,
      icon: HeartIcon,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

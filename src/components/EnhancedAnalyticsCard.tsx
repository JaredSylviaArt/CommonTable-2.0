'use client';

import { ReactNode } from 'react';

interface EnhancedAnalyticsCardProps {
  icon: React.ComponentType<any>;
  title: string;
  value: string | number;
  description: string;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  progress?: {
    current: number;
    max: number;
    label: string;
  };
  isEmpty?: boolean;
  emptyState?: {
    message: string;
    action?: string;
  };
}

export default function EnhancedAnalyticsCard({
  icon: Icon,
  title,
  value,
  description,
  color = 'text-gray-600',
  trend,
  progress,
  isEmpty = false,
  emptyState
}: EnhancedAnalyticsCardProps) {
  const progressPercentage = progress ? (progress.current / progress.max) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </h3>
          </div>
        </div>
        
        {trend && (
          <div className={`flex items-center text-sm font-medium ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className="mr-1">
              {trend.isPositive ? '↗' : '↘'}
            </span>
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>

      {isEmpty && emptyState ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-2">📭</div>
          <p className="text-gray-500 text-sm mb-2">{emptyState.message}</p>
          {emptyState.action && (
            <p className="text-[#665CF0] text-xs font-medium">{emptyState.action}</p>
          )}
        </div>
      ) : (
        <>
          <div className="mb-2">
            <span className="text-3xl font-bold text-gray-900">{value}</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          
          {progress && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progress.label}</span>
                <span>{progress.current}/{progress.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-[#665CF0] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

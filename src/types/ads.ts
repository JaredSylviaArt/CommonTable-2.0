export interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  clickUrl: string;
  advertiser: string;
  category: AdCategory;
  format: AdFormat;
  targetAudience: string[];
  isActive: boolean;
  priority: number;
  impressions: number;
  clicks: number;
  createdAt: Date;
  expiresAt?: Date;
}

export type AdFormat = 'banner' | 'native' | 'interstitial' | 'sidebar';

export type AdCategory = 
  | 'church-supplies'
  | 'family-products' 
  | 'local-services'
  | 'christian-business'
  | 'books-media'
  | 'home-garden'
  | 'technology'
  | 'community-events';

export interface AdPlacement {
  id: string;
  location: AdLocation;
  format: AdFormat;
  maxAds: number;
  refreshInterval?: number; // in seconds
}

export type AdLocation = 
  | 'browse-top-banner'
  | 'browse-grid-native'
  | 'browse-sidebar'
  | 'listing-detail-below-description'
  | 'listing-detail-sidebar'
  | 'listing-detail-bottom'
  | 'dashboard-overview-top'
  | 'dashboard-between-sections'
  | 'dashboard-sidebar'
  | 'messages-between-conversations'
  | 'messages-chat-top'
  | 'create-listing-sidebar'
  | 'create-listing-after-submit'
  | 'settings-between-sections'
  | 'settings-bottom';

export interface AdImpression {
  id: string;
  adId: string;
  userId?: string;
  location: AdLocation;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
}

export interface AdClick {
  id: string;
  adId: string;
  userId?: string;
  location: AdLocation;
  timestamp: Date;
  clickUrl: string;
}

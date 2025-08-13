import { Ad, AdLocation, AdFormat, AdCategory } from '@/types/ads';

// Mock ad data for demonstration
export const mockAds: Ad[] = [
  // Church Supplies
  {
    id: 'ad-1',
    title: 'Premium Communion Supplies',
    description: 'High-quality communion cups, plates, and linens for your church service.',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/communion-supplies',
    advertiser: 'Sacred Supplies Co.',
    category: 'church-supplies',
    format: 'native',
    targetAudience: ['pastor', 'church-admin'],
    isActive: true,
    priority: 1,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  {
    id: 'ad-2',
    title: 'Worship Sound Systems',
    description: 'Professional audio equipment designed for churches. Free consultation available.',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/sound-systems',
    advertiser: 'ChurchTech Solutions',
    category: 'technology',
    format: 'banner',
    targetAudience: ['pastor', 'worship-leader'],
    isActive: true,
    priority: 2,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Family Products
  {
    id: 'ad-3',
    title: 'Children\'s Bible Study Materials',
    description: 'Engaging curriculum for kids ages 3-12. Download samples free!',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/kids-curriculum',
    advertiser: 'Little Lambs Publishing',
    category: 'books-media',
    format: 'native',
    targetAudience: ['children-ministry', 'parent'],
    isActive: true,
    priority: 1,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  {
    id: 'ad-4',
    title: 'Christian Family Board Games',
    description: 'Fun, faith-based games that bring families together. Ages 6+.',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/christian-games',
    advertiser: 'Kingdom Games',
    category: 'family-products',
    format: 'native',
    targetAudience: ['parent', 'youth-pastor'],
    isActive: true,
    priority: 3,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Local Services
  {
    id: 'ad-5',
    title: 'Church Cleaning Services',
    description: 'Professional cleaning for churches. Special rates for houses of worship.',
    imageUrl: '/api/placeholder/728/90',
    clickUrl: 'https://example.com/church-cleaning',
    advertiser: 'Faithful Clean Co.',
    category: 'local-services',
    format: 'banner',
    targetAudience: ['pastor', 'church-admin'],
    isActive: true,
    priority: 2,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  {
    id: 'ad-6',
    title: 'Event Planning for Churches',
    description: 'We specialize in church events, conferences, and community gatherings.',
    imageUrl: '/api/placeholder/300/250',
    clickUrl: 'https://example.com/church-events',
    advertiser: 'Blessed Events Planning',
    category: 'local-services',
    format: 'sidebar',
    targetAudience: ['pastor', 'event-coordinator'],
    isActive: true,
    priority: 2,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Christian Business
  {
    id: 'ad-7',
    title: 'Christian Business Directory',
    description: 'Find local Christian-owned businesses in your community.',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/christian-directory',
    advertiser: 'Faith Business Network',
    category: 'christian-business',
    format: 'native',
    targetAudience: ['member'],
    isActive: true,
    priority: 3,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Books & Media
  {
    id: 'ad-8',
    title: 'New Release: "Faith in Daily Life"',
    description: 'Bestselling devotional now available. Perfect for small groups.',
    imageUrl: '/api/placeholder/300/200',
    clickUrl: 'https://example.com/faith-devotional',
    advertiser: 'Crossway Books',
    category: 'books-media',
    format: 'native',
    targetAudience: ['pastor', 'small-group-leader'],
    isActive: true,
    priority: 1,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Community Events
  {
    id: 'ad-9',
    title: 'Annual Christian Conference',
    description: 'Join 500+ believers for worship, teaching, and fellowship. Early bird pricing!',
    imageUrl: '/api/placeholder/728/90',
    clickUrl: 'https://example.com/christian-conference',
    advertiser: 'Regional Faith Conference',
    category: 'community-events',
    format: 'banner',
    targetAudience: ['pastor', 'member'],
    isActive: true,
    priority: 1,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  },
  // Home & Garden
  {
    id: 'ad-10',
    title: 'Scripture Wall Art',
    description: 'Beautiful verses for your home. Canvas prints and framed options.',
    imageUrl: '/api/placeholder/300/250',
    clickUrl: 'https://example.com/scripture-art',
    advertiser: 'Blessed Home Decor',
    category: 'home-garden',
    format: 'sidebar',
    targetAudience: ['member', 'parent'],
    isActive: true,
    priority: 3,
    impressions: 0,
    clicks: 0,
    createdAt: new Date(),
  }
];

// Get ads for a specific location and format
export const getAdsForLocation = (
  location: AdLocation, 
  format?: AdFormat,
  userRole?: string,
  maxAds: number = 1
): Ad[] => {
  let filteredAds = mockAds.filter(ad => {
    // Filter by format if specified
    if (format && ad.format !== format) return false;
    
    // Filter by user role if available
    if (userRole && !ad.targetAudience.includes(userRole) && !ad.targetAudience.includes('member')) {
      return false;
    }
    
    // Only show active ads
    return ad.isActive;
  });

  // Sort by priority (lower number = higher priority)
  filteredAds.sort((a, b) => a.priority - b.priority);
  
  // Return max number of ads
  return filteredAds.slice(0, maxAds);
};

// Get ads by format
export const getAdsByFormat = (format: AdFormat, maxAds: number = 3): Ad[] => {
  return mockAds
    .filter(ad => ad.format === format && ad.isActive)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxAds);
};

// Get ads by category
export const getAdsByCategory = (category: AdCategory, maxAds: number = 3): Ad[] => {
  return mockAds
    .filter(ad => ad.category === category && ad.isActive)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxAds);
};

// Track ad impression
export const trackAdImpression = async (adId: string, location: AdLocation, userId?: string) => {
  try {
    // In a real app, this would send to analytics service
    console.log('Ad impression tracked:', { adId, location, userId, timestamp: new Date() });
    
    // Update local ad impression count
    const ad = mockAds.find(a => a.id === adId);
    if (ad) {
      ad.impressions++;
    }
  } catch (error) {
    console.error('Error tracking ad impression:', error);
  }
};

// Track ad click
export const trackAdClick = async (adId: string, location: AdLocation, clickUrl: string, userId?: string) => {
  try {
    // In a real app, this would send to analytics service
    console.log('Ad click tracked:', { adId, location, clickUrl, userId, timestamp: new Date() });
    
    // Update local ad click count
    const ad = mockAds.find(a => a.id === adId);
    if (ad) {
      ad.clicks++;
    }
  } catch (error) {
    console.error('Error tracking ad click:', error);
  }
};

// Get ad performance metrics
export const getAdMetrics = (adId: string) => {
  const ad = mockAds.find(a => a.id === adId);
  if (!ad) return null;
  
  const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;
  
  return {
    impressions: ad.impressions,
    clicks: ad.clicks,
    ctr: Math.round(ctr * 100) / 100 // Round to 2 decimal places
  };
};

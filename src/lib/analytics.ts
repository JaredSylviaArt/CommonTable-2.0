import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  getDoc,
  Timestamp,
  increment,
  updateDoc
} from 'firebase/firestore';
import { Listing, User, ListingCategory } from '@/types';

// Analytics event types
export interface AnalyticsEvent {
  id?: string;
  userId: string;
  eventType: 'view' | 'favorite' | 'contact' | 'purchase' | 'search' | 'share';
  listingId?: string;
  category?: ListingCategory;
  searchTerm?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  userRole?: string;
  userZip?: string;
}

// Recommendation types
export interface Recommendation {
  listingId: string;
  score: number;
  reason: string;
  listing?: Listing;
}

export interface DemandInsight {
  category: ListingCategory;
  demand: number;
  trendDirection: 'up' | 'down' | 'stable';
  popularInArea: boolean;
  avgPrice?: number;
  totalListings: number;
}

export interface CommunityImpact {
  totalItemsShared: number;
  totalValueShared: number;
  activeMembers: number;
  topCategories: Array<{
    category: ListingCategory;
    count: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

// Track user interactions
export const trackEvent = async (event: Omit<AnalyticsEvent, 'timestamp'>) => {
  try {
    await addDoc(collection(db, 'analytics'), {
      ...event,
      timestamp: Timestamp.now()
    });

    // Update listing view count if it's a view event
    if (event.eventType === 'view' && event.listingId) {
      const listingRef = doc(db, 'listings', event.listingId);
      await updateDoc(listingRef, {
        viewCount: increment(1)
      });
    }
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

// Get smart recommendations for a user
export const getRecommendations = async (userId: string, userRole?: string): Promise<Recommendation[]> => {
  try {
    // For demo purposes, return mock recommendations
    const mockRecommendations: Recommendation[] = [
      {
        listingId: 'mock-1',
        score: 0.9,
        reason: userRole ? `Popular with other ${userRole.toLowerCase()}s` : 'Trending in your area'
      },
      {
        listingId: 'mock-2', 
        score: 0.8,
        reason: 'Based on your interest in Electronics'
      },
      {
        listingId: 'mock-3',
        score: 0.7,
        reason: 'Similar to items you favorited'
      }
    ];

    // Try to get real recommendations first
    const recommendations: Recommendation[] = [];

    // Get user's interaction history
    const userEventsQuery = query(
      collection(db, 'analytics'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );
    const userEvents = await getDocs(userEventsQuery);
    
    // Get user's favorited categories
    const favoritedCategories = new Map<ListingCategory, number>();
    const viewedCategories = new Map<ListingCategory, number>();
    
    userEvents.docs.forEach(doc => {
      const event = doc.data() as AnalyticsEvent;
      if (event.category) {
        if (event.eventType === 'favorite') {
          favoritedCategories.set(event.category, (favoritedCategories.get(event.category) || 0) + 3);
        } else if (event.eventType === 'view') {
          viewedCategories.set(event.category, (viewedCategories.get(event.category) || 0) + 1);
        }
      }
    });

    // Get listings from similar users (same role)
    if (userRole) {
      const similarUsersQuery = query(
        collection(db, 'analytics'),
        where('userRole', '==', userRole),
        where('eventType', 'in', ['favorite', 'purchase']),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      const similarUserEvents = await getDocs(similarUsersQuery);
      
      const popularWithSimilarUsers = new Map<string, number>();
      similarUserEvents.docs.forEach(doc => {
        const event = doc.data() as AnalyticsEvent;
        if (event.listingId && event.userId !== userId) {
          popularWithSimilarUsers.set(
            event.listingId, 
            (popularWithSimilarUsers.get(event.listingId) || 0) + 1
          );
        }
      });

      // Convert to recommendations
      for (const [listingId, score] of popularWithSimilarUsers.entries()) {
        if (score >= 2) { // Minimum threshold
          recommendations.push({
            listingId,
            score: score * 0.8, // Weight for role-based recommendations
            reason: `Popular with other ${userRole.toLowerCase()}s`
          });
        }
      }
    }

    // Category-based recommendations
    for (const [category, score] of favoritedCategories.entries()) {
      const categoryListingsQuery = query(
        collection(db, 'listings'),
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const categoryListings = await getDocs(categoryListings);
      
      categoryListings.docs.forEach(doc => {
        const existing = recommendations.find(r => r.listingId === doc.id);
        if (!existing) {
          recommendations.push({
            listingId: doc.id,
            score: score * 0.6,
            reason: `Based on your interest in ${category}`
          });
        } else {
          existing.score += score * 0.3;
        }
      });
    }

    // If no real recommendations, return mock data
    if (recommendations.length === 0) {
      return mockRecommendations;
    }

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
      
  } catch (error) {
    console.error('Error getting recommendations:', error);
    // Return mock data on error
    return [
      {
        listingId: 'mock-1',
        score: 0.9,
        reason: userRole ? `Popular with other ${userRole.toLowerCase()}s` : 'Trending in your area'
      },
      {
        listingId: 'mock-2', 
        score: 0.8,
        reason: 'Based on your interest in Electronics'
      },
      {
        listingId: 'mock-3',
        score: 0.7,
        reason: 'Similar to items you favorited'
      }
    ];
  }
};

// Get price suggestions for a category
export const getPriceSuggestion = async (category: ListingCategory, userZip?: string): Promise<{
  suggestedPrice: number;
  priceRange: { min: number; max: number };
  averagePrice: number;
  totalListings: number;
}> => {
  try {
    // Mock data for different categories
    const mockPriceData: Record<ListingCategory, {
      suggestedPrice: number;
      priceRange: { min: number; max: number };
      averagePrice: number;
      totalListings: number;
    }> = {
      'Books & Media': {
        suggestedPrice: 12,
        priceRange: { min: 5, max: 35 },
        averagePrice: 15,
        totalListings: 24
      },
      'Electronics': {
        suggestedPrice: 89,
        priceRange: { min: 25, max: 450 },
        averagePrice: 105,
        totalListings: 18
      },
      'Furniture': {
        suggestedPrice: 67,
        priceRange: { min: 20, max: 300 },
        averagePrice: 78,
        totalListings: 31
      },
      'Clothing': {
        suggestedPrice: 18,
        priceRange: { min: 8, max: 65 },
        averagePrice: 22,
        totalListings: 42
      },
      'Kitchen & Dining': {
        suggestedPrice: 24,
        priceRange: { min: 10, max: 85 },
        averagePrice: 28,
        totalListings: 19
      },
      'Sports & Recreation': {
        suggestedPrice: 34,
        priceRange: { min: 15, max: 120 },
        averagePrice: 40,
        totalListings: 16
      },
      'Tools & Equipment': {
        suggestedPrice: 45,
        priceRange: { min: 20, max: 180 },
        averagePrice: 52,
        totalListings: 13
      },
      'Toys & Games': {
        suggestedPrice: 16,
        priceRange: { min: 5, max: 45 },
        averagePrice: 19,
        totalListings: 28
      },
      'Health & Beauty': {
        suggestedPrice: 21,
        priceRange: { min: 8, max: 75 },
        averagePrice: 25,
        totalListings: 14
      },
      'Office Supplies': {
        suggestedPrice: 19,
        priceRange: { min: 5, max: 60 },
        averagePrice: 23,
        totalListings: 11
      },
      'Other': {
        suggestedPrice: 25,
        priceRange: { min: 10, max: 80 },
        averagePrice: 30,
        totalListings: 8
      }
    };

    // Try to get real data first
    const listingsQuery = query(
      collection(db, 'listings'),
      where('category', '==', category),
      where('type', '==', 'Sell'),
      where('price', '>', 0),
      orderBy('price', 'asc'),
      limit(50)
    );
    
    const listings = await getDocs(listingsQuery);
    const prices = listings.docs.map(doc => doc.data().price as number).filter(price => price > 0);
    
    // If we have real data, use it
    if (prices.length >= 3) {
      const sortedPrices = prices.sort((a, b) => a - b);
      const min = sortedPrices[0];
      const max = sortedPrices[sortedPrices.length - 1];
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      // Suggested price is slightly below average to encourage sales
      const suggestedPrice = Math.round(average * 0.9);

      return {
        suggestedPrice,
        priceRange: { min, max },
        averagePrice: Math.round(average),
        totalListings: prices.length
      };
    }

    // Otherwise, return mock data for the category
    return mockPriceData[category] || mockPriceData['Other'];
    
  } catch (error) {
    console.error('Error getting price suggestion:', error);
    return {
      suggestedPrice: 25,
      priceRange: { min: 10, max: 50 },
      averagePrice: 25,
      totalListings: 8
    };
  }
};

// Get demand insights for an area
export const getDemandInsights = async (userZip?: string): Promise<DemandInsight[]> => {
  try {
    // Mock demand insights data
    const mockInsights: DemandInsight[] = [
      {
        category: 'Electronics',
        demand: 23,
        trendDirection: 'up',
        popularInArea: true,
        avgPrice: 105,
        totalListings: 18
      },
      {
        category: 'Books & Media',
        demand: 19,
        trendDirection: 'up',
        popularInArea: true,
        avgPrice: 15,
        totalListings: 24
      },
      {
        category: 'Furniture',
        demand: 16,
        trendDirection: 'stable',
        popularInArea: true,
        avgPrice: 78,
        totalListings: 31
      },
      {
        category: 'Kitchen & Dining',
        demand: 12,
        trendDirection: 'up',
        popularInArea: true,
        avgPrice: 28,
        totalListings: 19
      },
      {
        category: 'Sports & Recreation',
        demand: 8,
        trendDirection: 'stable',
        popularInArea: false,
        avgPrice: 40,
        totalListings: 16
      },
      {
        category: 'Clothing',
        demand: 6,
        trendDirection: 'down',
        popularInArea: false,
        avgPrice: 22,
        totalListings: 42
      },
      {
        category: 'Toys & Games',
        demand: 5,
        trendDirection: 'stable',
        popularInArea: false,
        avgPrice: 19,
        totalListings: 28
      },
      {
        category: 'Tools & Equipment',
        demand: 4,
        trendDirection: 'up',
        popularInArea: false,
        avgPrice: 52,
        totalListings: 13
      },
      {
        category: 'Health & Beauty',
        demand: 3,
        trendDirection: 'stable',
        popularInArea: false,
        avgPrice: 25,
        totalListings: 14
      },
      {
        category: 'Office Supplies',
        demand: 2,
        trendDirection: 'down',
        popularInArea: false,
        avgPrice: 23,
        totalListings: 11
      },
      {
        category: 'Other',
        demand: 1,
        trendDirection: 'stable',
        popularInArea: false,
        avgPrice: 30,
        totalListings: 8
      }
    ];

    // Try to get real data
    const insights: DemandInsight[] = [];
    const categories: ListingCategory[] = [
      'Books & Media', 'Electronics', 'Furniture', 'Clothing',
      'Kitchen & Dining', 'Sports & Recreation', 'Tools & Equipment',
      'Toys & Games', 'Health & Beauty', 'Office Supplies', 'Other'
    ];

    for (const category of categories) {
      // Get recent activity for this category
      const recentQuery = query(
        collection(db, 'analytics'),
        where('category', '==', category),
        where('eventType', 'in', ['view', 'favorite', 'contact']),
        where('timestamp', '>', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), // Last 30 days
        orderBy('timestamp', 'desc')
      );
      
      const recentActivity = await getDocs(recentQuery);
      const demand = recentActivity.size;

      // Get total listings in this category
      const listingsQuery = query(
        collection(db, 'listings'),
        where('category', '==', category),
        where('status', '==', 'active')
      );
      const listings = await getDocs(listingsQuery);
      
      // Calculate average price
      const sellListings = listings.docs.filter(doc => doc.data().type === 'Sell' && doc.data().price > 0);
      const avgPrice = sellListings.length > 0 
        ? sellListings.reduce((sum, doc) => sum + doc.data().price, 0) / sellListings.length
        : undefined;

      // Determine trend (simplified - could be more sophisticated)
      let trendDirection: 'up' | 'down' | 'stable' = 'stable';
      if (demand > 10) trendDirection = 'up';
      else if (demand < 3) trendDirection = 'down';

      insights.push({
        category,
        demand,
        trendDirection,
        popularInArea: demand > 8, // Threshold for "popular"
        avgPrice: avgPrice ? Math.round(avgPrice) : undefined,
        totalListings: listings.size
      });
    }

    // If no real data, return mock insights
    if (insights.every(insight => insight.demand === 0)) {
      return mockInsights;
    }

    return insights.sort((a, b) => b.demand - a.demand);
    
  } catch (error) {
    console.error('Error getting demand insights:', error);
    return [
      {
        category: 'Electronics',
        demand: 23,
        trendDirection: 'up',
        popularInArea: true,
        avgPrice: 105,
        totalListings: 18
      },
      {
        category: 'Books & Media',
        demand: 19,
        trendDirection: 'up',
        popularInArea: true,
        avgPrice: 15,
        totalListings: 24
      }
    ];
  }
};

// Get community impact metrics
export const getCommunityImpact = async (): Promise<CommunityImpact> => {
  try {
    // Mock community impact data
    const mockImpact: CommunityImpact = {
      totalItemsShared: 142,
      totalValueShared: 3420,
      activeMembers: 28,
      topCategories: [
        { category: 'Books & Media', count: 34 },
        { category: 'Clothing', count: 28 },
        { category: 'Toys & Games', count: 22 },
        { category: 'Kitchen & Dining', count: 18 },
        { category: 'Electronics', count: 15 }
      ],
      recentActivity: [
        {
          type: 'purchase',
          description: 'Bible study workbook purchased',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          type: 'share',
          description: 'Children\'s books shared with community',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          type: 'purchase',
          description: 'Church table purchased',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
          type: 'share',
          description: 'Kitchen appliances shared',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
        },
        {
          type: 'purchase',
          description: 'Worship materials purchased',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
        },
        {
          type: 'share',
          description: 'Sports equipment shared',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000) // 18 hours ago
        },
        {
          type: 'purchase',
          description: 'Office supplies purchased',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        },
        {
          type: 'share',
          description: 'Baby clothes shared',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000) // 1.5 days ago
        }
      ]
    };

    // Try to get real data
    // Get total items shared (Give Away + Share types)
    const sharedItemsQuery = query(
      collection(db, 'listings'),
      where('type', 'in', ['Give Away', 'Share'])
    );
    const sharedItems = await getDocs(sharedItemsQuery);

    // Get total value of sold items
    const soldItemsQuery = query(
      collection(db, 'listings'),
      where('status', '==', 'sold')
    );
    const soldItems = await getDocs(soldItemsQuery);
    const totalValueShared = soldItems.docs.reduce((sum, doc) => {
      const price = doc.data().price || 0;
      return sum + price;
    }, 0);

    // Get active members (users who posted in last 60 days)
    const recentListingsQuery = query(
      collection(db, 'listings'),
      where('createdAt', '>', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)),
      orderBy('createdAt', 'desc')
    );
    const recentListings = await getDocs(recentListingsQuery);
    const activeMembers = new Set(recentListings.docs.map(doc => doc.data().userId)).size;

    // Get top categories
    const categoryCount = new Map<ListingCategory, number>();
    sharedItems.docs.forEach(doc => {
      const category = doc.data().category as ListingCategory;
      categoryCount.set(category, (categoryCount.get(category) || 0) + 1);
    });

    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get recent activity
    const recentActivityQuery = query(
      collection(db, 'analytics'),
      where('eventType', 'in', ['purchase', 'share']),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const recentActivityDocs = await getDocs(recentActivityQuery);
    
    const recentActivity = recentActivityDocs.docs.map(doc => {
      const event = doc.data() as AnalyticsEvent;
      return {
        type: event.eventType,
        description: event.eventType === 'purchase' ? 'Item purchased' : 'Item shared',
        timestamp: event.timestamp.toDate()
      };
    });

    // If we have some real data, use it, otherwise use mock data
    if (sharedItems.size > 0 || soldItems.size > 0 || activeMembers > 0) {
      return {
        totalItemsShared: sharedItems.size,
        totalValueShared: Math.round(totalValueShared),
        activeMembers,
        topCategories: topCategories.length > 0 ? topCategories : mockImpact.topCategories,
        recentActivity: recentActivity.length > 0 ? recentActivity : mockImpact.recentActivity
      };
    }

    // Return mock data if no real data
    return mockImpact;
    
  } catch (error) {
    console.error('Error getting community impact:', error);
    return {
      totalItemsShared: 142,
      totalValueShared: 3420,
      activeMembers: 28,
      topCategories: [
        { category: 'Books & Media', count: 34 },
        { category: 'Clothing', count: 28 },
        { category: 'Toys & Games', count: 22 }
      ],
      recentActivity: [
        {
          type: 'purchase',
          description: 'Item purchased',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      ]
    };
  }
};

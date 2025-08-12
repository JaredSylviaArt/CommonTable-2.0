'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Listing } from '@/types';
import { 
  HeartIcon, 
  EyeIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface FavoriteItem extends Listing {
  dateAdded: Date;
  priceHistory?: { price: number; date: Date; }[];
}

interface WantedItem {
  id: string;
  title: string;
  category: string;
  maxPrice?: number;
  description: string;
  createdAt: Date;
  matchCount: number;
}

export default function FavoritesWatchlist() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [wantedItems, setWantedItems] = useState<WantedItem[]>([]);
  const [activeTab, setActiveTab] = useState<'favorites' | 'wanted'>('favorites');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavoritesAndWanted();
    }
  }, [user]);

  const fetchFavoritesAndWanted = async () => {
    if (!user) return;

    try {
      // Fetch real favorites from database
      const favoritesRef = collection(db, 'favorites');
      const favoritesQuery = query(
        favoritesRef,
        where('userId', '==', user.uid)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      
      const favoritesData: FavoriteItem[] = [];
      
      // For each favorite, fetch the actual listing data
      for (const favoriteDoc of favoritesSnapshot.docs) {
        const favoriteData = favoriteDoc.data();
        
        try {
          const listingDoc = await getDoc(doc(db, 'listings', favoriteData.listingId));
          if (listingDoc.exists()) {
            const listingData = {
              id: listingDoc.id,
              ...listingDoc.data(),
              createdAt: listingDoc.data().createdAt?.toDate(),
            } as Listing;
            
            favoritesData.push({
              ...listingData,
              dateAdded: favoriteData.dateAdded?.toDate() || new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching listing for favorite:', error);
        }
      }

      setFavorites(favoritesData);
      
      // Mock favorites data for demo purposes if no real favorites exist
      if (favoritesData.length === 0) {
        const mockFavorites: FavoriteItem[] = [
        {
          id: 'fav-1',
          title: 'Professional Sound System',
          description: 'Complete audio setup for contemporary worship',
          category: 'Equipment & Tech',
          condition: 'Good',
          type: 'Sell',
          zipCode: '75201',
          imageUrl: '/api/placeholder/300/200',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          userId: 'other-user-1',
          userRef: 'users/other-user-1',
          dateAdded: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          priceHistory: [
            { price: 200, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
            { price: 150, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
          ]
        },
        {
          id: 'fav-2',
          title: 'Youth Ministry Curriculum Set',
          description: 'Complete 12-week study program for teenagers',
          category: 'Books & Resources',
          condition: 'Like New',
          type: 'Share',
          zipCode: '75203',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          userId: 'other-user-2',
          userRef: 'users/other-user-2',
          dateAdded: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        {
          id: 'fav-3',
          title: 'Church Office Furniture',
          description: 'Desk, chairs, and filing cabinets in excellent condition',
          category: 'Furniture',
          condition: 'Good',
          type: 'Give Away',
          zipCode: '75202',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          userId: 'other-user-3',
          userRef: 'users/other-user-3',
          dateAdded: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)
        }
      ];

      // Mock wanted items
      const mockWantedItems: WantedItem[] = [
        {
          id: 'want-1',
          title: 'Projector for Sanctuary',
          category: 'Equipment & Tech',
          maxPrice: 300,
          description: 'Looking for a reliable projector for our sanctuary, 3000+ lumens preferred',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          matchCount: 2
        },
        {
          id: 'want-2',
          title: 'Children\'s Ministry Books',
          category: 'Books & Resources',
          description: 'Age-appropriate Bible stories and activity books for kids 5-10',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          matchCount: 0
        },
        {
          id: 'want-3',
          title: 'Folding Tables',
          category: 'Furniture',
          maxPrice: 50,
          description: 'Need 4-6 folding tables for church events and potlucks',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          matchCount: 1
        }
      ];

        setFavorites(mockFavorites);
      }
      
      // Mock wanted items
      const mockWantedItems: WantedItem[] = [
        {
          id: 'want-1',
          title: 'Projector for Sanctuary',
          category: 'Equipment & Tech',
          maxPrice: 300,
          description: 'Looking for a reliable projector for our sanctuary, 3000+ lumens preferred',
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          matchCount: 2
        },
        {
          id: 'want-2',
          title: 'Children\'s Ministry Books',
          category: 'Books & Resources',
          description: 'Age-appropriate Bible stories and activity books for kids 5-10',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          matchCount: 0
        },
        {
          id: 'want-3',
          title: 'Folding Tables',
          category: 'Furniture',
          maxPrice: 50,
          description: 'Need 4-6 folding tables for church events and potlucks',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          matchCount: 1
        }
      ];
      
      setWantedItems(mockWantedItems);
    } catch (error) {
      console.error('Error fetching favorites and wanted items:', error);
    }
    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Give Away':
        return 'bg-green-100 text-green-800';
      case 'Sell':
        return 'bg-blue-100 text-blue-800';
      case 'Share':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const removeFavorite = async (listingId: string) => {
    if (!user) return;

    try {
      // Find and delete the favorite from database
      const favoritesRef = collection(db, 'favorites');
      const q = query(
        favoritesRef,
        where('userId', '==', user.uid),
        where('listingId', '==', listingId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        await deleteDoc(doc(db, 'favorites', querySnapshot.docs[0].id));
      }

      // Remove from local state
      setFavorites(prev => prev.filter(fav => fav.id !== listingId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const removeWantedItem = (wantedId: string) => {
    setWantedItems(prev => prev.filter(item => item.id !== wantedId));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-3">
          <HeartIcon className="w-6 h-6 text-[#665CF0]" />
          <h2 className="text-lg font-semibold text-gray-900">Favorites & Watchlist</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <HeartIcon className="w-6 h-6 text-[#665CF0]" />
        <h2 className="text-lg font-semibold text-gray-900">Favorites & Watchlist</h2>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'favorites'
                ? 'border-[#665CF0] text-[#665CF0]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <HeartIconSolid className="w-4 h-4" />
            <span>Saved Items ({favorites.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('wanted')}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'wanted'
                ? 'border-[#665CF0] text-[#665CF0]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span>Wanted ({wantedItems.length})</span>
          </button>
        </nav>
      </div>

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div>
          {favorites.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <HeartIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No saved items yet</p>
              <p className="text-gray-400">Heart items while browsing to save them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="flex">
                    {/* Image */}
                    <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Link href={`/listing/${item.id}`} className="flex-1">
                          <h3 className="font-medium text-gray-900 hover:text-[#665CF0] transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                        </Link>
                        <button
                          onClick={() => removeFavorite(item.id)}
                          className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          <HeartIconSolid className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">{item.category}</span>
                      </div>
                      
                      {item.priceHistory && item.priceHistory.length > 1 && (
                        <div className="flex items-center space-x-1 text-xs text-green-600 mb-2">
                          <ClockIcon className="w-3 h-3" />
                          <span>Price dropped to ${item.priceHistory[item.priceHistory.length - 1].price}</span>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400">
                        Saved {format(item.dateAdded, 'MMM d')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wanted Tab */}
      {activeTab === 'wanted' && (
        <div>
          <div className="mb-4">
            <button className="bg-[#665CF0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#5A52E8] transition-colors text-sm">
              + Add Wanted Item
            </button>
          </div>
          
          {wantedItems.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No wanted items yet</p>
              <p className="text-gray-400">Add items you're looking for to get notified when they're posted</p>
            </div>
          ) : (
            <div className="space-y-4">
              {wantedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Category: {item.category}</span>
                        {item.maxPrice && (
                          <span>Max: ${item.maxPrice}</span>
                        )}
                        <span>Added {format(item.createdAt, 'MMM d')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {item.matchCount > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          <BellIcon className="w-3 h-3" />
                          <span>{item.matchCount} matches</span>
                        </div>
                      )}
                      <button
                        onClick={() => removeWantedItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

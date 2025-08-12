'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Listing } from '@/types';

interface BuyButtonProps {
  listing: Listing;
  className?: string;
}

export default function BuyButton({ listing, className = '' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handlePurchase = async () => {
    if (!user) {
      alert('Please log in to purchase items');
      return;
    }

    if (listing.userId === user.uid) {
      alert('You cannot purchase your own listing');
      return;
    }

    if (listing.type !== 'Sell') {
      alert('This item is not for sale');
      return;
    }

    if (listing.status === 'sold') {
      alert('This item has already been sold');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        throw new Error('Please log in to purchase items');
      }
      
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          listingId: listing.id,
          idToken,
          buyerId: user.uid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Purchase error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Don't show buy button for non-sell items or sold items
  if (listing.type !== 'Sell' || listing.status === 'sold') {
    return null;
  }

  // Don't show buy button for own listings
  if (user && listing.userId === user.uid) {
    return null;
  }

  return (
    <div>
      {error && (
        <div className="mb-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`flex items-center justify-center gap-2 bg-[#665CF0] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <ShoppingCartIcon className="h-5 w-5" />
        {loading ? 'Processing...' : `Buy for $${listing.price?.toFixed(2) || '0.00'}`}
      </button>
    </div>
  );
}

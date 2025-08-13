'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingCartIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Listing, User } from '@/types';

interface BuyButtonProps {
  listing: Listing;
  className?: string;
}

export default function BuyButton({ listing, className = '' }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentSetupModal, setShowPaymentSetupModal] = useState(false);
  const [sellerNeedsSetup, setSellerNeedsSetup] = useState(false);
  const { user } = useAuth();

  const checkSellerPaymentSetup = async (): Promise<boolean> => {
    try {
      const sellerDoc = await getDoc(doc(db, 'users', listing.userId));
      if (sellerDoc.exists()) {
        const seller = sellerDoc.data() as User;
        const canReceivePayments = seller.canReceivePayments || 
                                 seller.debitCardLast4 || 
                                 (seller.stripeAccountId && seller.stripeChargesEnabled && seller.stripeDetailsSubmitted);
        return canReceivePayments;
      }
      return false;
    } catch (error) {
      console.error('Error checking seller payment setup:', error);
      return false;
    }
  };

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

    // Check if seller has payment setup
    const sellerCanReceivePayments = await checkSellerPaymentSetup();
    if (!sellerCanReceivePayments) {
      setSellerNeedsSetup(true);
      setShowPaymentSetupModal(true);
      setLoading(false);
      return;
    }

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

      {/* Payment Setup Required Modal */}
      {showPaymentSetupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start space-x-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-amber-500 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Seller Payment Setup Required
                </h3>
                <p className="text-gray-600 mb-4">
                  The seller just needs to add a debit card to receive payments (takes 30 seconds!). 
                  We've notified them about this quick setup.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  You can bookmark this item and try again later, or contact the seller directly about setting up payments.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentSetupModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Got it
                  </button>
                  <button
                    onClick={() => {
                      // Add to favorites/bookmark
                      setShowPaymentSetupModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-[#665CF0] text-white rounded-lg hover:bg-[#5A52E8] transition-colors"
                  >
                    Bookmark Item
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

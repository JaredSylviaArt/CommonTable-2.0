'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/firebase';
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SellerOnboardingProps {
  onComplete?: () => void;
}

export default function SellerOnboarding({ onComplete }: SellerOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const canSell = user?.stripeChargesEnabled && user?.stripeDetailsSubmitted;
  const hasStripeAccount = user?.stripeAccountId;
  const needsOnboarding = !user?.stripeDetailsSubmitted;

  const handleSetupPayments = async () => {
    if (!user || !auth.currentUser) return;

    setLoading(true);
    setError('');

    try {
      const idToken = await auth.currentUser.getIdToken();
      
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken, userId: user.uid }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Stripe account');
      }

      const { onboardingUrl } = await response.json();
      
      // Redirect to Stripe onboarding
      window.location.href = onboardingUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (canSell) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Ready to Sell!
            </h3>
            <p className="text-green-700">
              Your payment account is set up and ready to receive payments.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-start">
        <CreditCardIcon className="h-8 w-8 text-blue-500 mr-3 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Set Up Payments to Start Selling
          </h3>
          <p className="text-gray-600 mb-4">
            To sell items on CommonTable, you need to set up a payment account. 
            We use Stripe to securely process payments and transfer funds to your bank account.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Platform Fee: 3%</p>
                <p>
                  CommonTable charges a 3% fee on all sales to help maintain and improve the platform.
                  For example, if you sell an item for $100, you'll receive $97.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleSetupPayments}
            disabled={loading}
            className="bg-[#665CF0] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#5A52E8] focus:outline-none focus:ring-2 focus:ring-[#665CF0] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting up...' : 'Set Up Payment Account'}
          </button>

          {hasStripeAccount && needsOnboarding && (
            <p className="text-sm text-gray-500 mt-2">
              Complete your Stripe account setup to start selling.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

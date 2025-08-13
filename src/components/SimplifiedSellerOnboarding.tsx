'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CreditCardIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface SimplifiedSellerOnboardingProps {
  onComplete?: () => void;
}

export default function SimplifiedSellerOnboarding({ onComplete }: SimplifiedSellerOnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const { user, refreshUser } = useAuth();

  const canSell = user?.canReceivePayments || user?.debitCardLast4;
  const needsFullVerification = user?.needsFullVerification;
  const totalSales = user?.totalSales || 0;

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date MM/YY
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  // Get card brand from number
  const getCardBrand = (number: string) => {
    const num = number.replace(/\s/g, '');
    if (num.match(/^4/)) return 'Visa';
    if (num.match(/^5[1-5]/)) return 'Mastercard';
    if (num.match(/^3[47]/)) return 'American Express';
    if (num.match(/^6/)) return 'Discover';
    return 'Unknown';
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.length <= 19) { // 16 digits + 3 spaces
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Basic validation
      const cleanCardNumber = cardNumber.replace(/\s/g, '');
      if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
        throw new Error('Please enter a valid card number');
      }
      if (!expiryDate.includes('/') || expiryDate.length !== 5) {
        throw new Error('Please enter a valid expiry date (MM/YY)');
      }
      if (cvv.length < 3) {
        throw new Error('Please enter a valid CVV');
      }
      if (!name.trim()) {
        throw new Error('Please enter the cardholder name');
      }

      // Call API to set up debit card
      const response = await fetch('/api/payment/setup-debit-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          cardData: {
            cardNumber: cleanCardNumber,
            expiryDate,
            cvv,
            name,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set up debit card');
      }

      // Refresh user data
      await refreshUser();
      
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // If user can already sell
  if (canSell && !needsFullVerification) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center">
          <CheckCircleIcon className="h-8 w-8 text-green-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-900">
              Ready to Sell!
            </h3>
            <p className="text-green-700">
              Your debit card is connected and ready to receive payments.
            </p>
            {user?.debitCardLast4 && (
              <p className="text-sm text-green-600 mt-2">
                {user.debitCardBrand} ending in {user.debitCardLast4}
              </p>
            )}
            <p className="text-xs text-green-600 mt-1">
              Total sales: ${totalSales.toFixed(2)} • No verification needed until $600
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If user needs full verification
  if (needsFullVerification) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-amber-500 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-amber-900">
              Verification Required
            </h3>
            <p className="text-amber-700">
              You've reached $600 in sales and need to complete full verification.
            </p>
            <p className="text-sm text-amber-600 mt-2">
              This includes providing your SSN and bank account for tax reporting.
            </p>
            <button
              onClick={() => {/* Redirect to full Stripe onboarding */}}
              className="mt-3 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Complete Verification
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Simplified debit card setup form
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-6">
        <CreditCardIcon className="h-8 w-8 text-blue-500 mr-3" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Quick Payment Setup
          </h3>
          <p className="text-gray-600 text-sm">
            Just add a debit card to start selling. No SSN or bank account required!
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cardholder Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
            style={{ color: '#111827' }}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Debit Card Number
          </label>
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
            style={{ color: '#111827' }}
            required
          />
          {cardNumber && (
            <p className="text-xs text-gray-500 mt-1">
              {getCardBrand(cardNumber)} card detected
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="text"
              value={expiryDate}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
              style={{ color: '#111827' }}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CVV
            </label>
            <input
              type="text"
              value={cvv}
              onChange={handleCvvChange}
              placeholder="123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-dark-force"
              style={{ color: '#111827' }}
              required
            />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                Why this is simple and secure:
              </h4>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Start selling immediately with just a debit card</li>
                <li>• No SSN required until you reach $600 in sales</li>
                <li>• Payments go directly to your card (no bank account needed)</li>
                <li>• Your card info is encrypted and secure</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !cardNumber || !expiryDate || !cvv || !name}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connecting Card...
            </div>
          ) : (
            'Connect Debit Card & Start Selling'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By connecting your card, you agree to our Terms of Service and Privacy Policy.
          Your payment information is encrypted and secure.
        </p>
      </form>
    </div>
  );
}

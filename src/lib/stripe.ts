import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Platform fee percentage (3%)
export const PLATFORM_FEE_PERCENTAGE = 0.03;

// Calculate platform fee from amount
export const calculatePlatformFee = (amount: number): number => {
  return Math.round(amount * PLATFORM_FEE_PERCENTAGE);
};

// Stripe Connect configuration
export const STRIPE_CONNECT_CONFIG = {
  country: 'US',
  type: 'express' as const,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
};

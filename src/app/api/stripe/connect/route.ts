import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_CONNECT_CONFIG } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { idToken, userId } = await request.json();
    
    if (!idToken || !userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // For now, we'll trust the client-side userId
    // In production, you should verify the Firebase token server-side

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: STRIPE_CONNECT_CONFIG.country,
      capabilities: STRIPE_CONNECT_CONFIG.capabilities,
      metadata: {
        firebase_uid: userId,
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      accountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get('accountId');
    
    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    const account = await stripe.accounts.retrieve(accountId);
    
    return NextResponse.json({
      accountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });
  } catch (error) {
    console.error('Stripe account retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve account status' },
      { status: 500 }
    );
  }
}

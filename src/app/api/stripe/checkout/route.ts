import { NextRequest, NextResponse } from 'next/server';
import { stripe, calculatePlatformFee } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { listingId, idToken, buyerId } = await request.json();
    
    if (!idToken || !buyerId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // For now, we'll trust the client-side buyerId
    // In production, you should verify the Firebase token server-side

    // Get listing details
    const listingDoc = await getDoc(doc(db, 'listings', listingId));
    if (!listingDoc.exists()) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const listing = listingDoc.data();
    
    if (listing.type !== 'Sell') {
      return NextResponse.json({ error: 'This listing is not for sale' }, { status: 400 });
    }

    if (!listing.price || listing.price <= 0) {
      return NextResponse.json({ error: 'Invalid listing price' }, { status: 400 });
    }

    // Get seller's Stripe account
    const sellerDoc = await getDoc(doc(db, 'users', listing.userId));
    if (!sellerDoc.exists()) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const seller = sellerDoc.data();
    if (!seller.stripeAccountId) {
      return NextResponse.json({ error: 'Seller has not set up payments' }, { status: 400 });
    }

    // Calculate amounts (convert to cents)
    const totalAmount = Math.round(listing.price * 100);
    const platformFee = calculatePlatformFee(totalAmount);
    const sellerAmount = totalAmount - platformFee;

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: listing.title,
              description: listing.description,
              images: listing.imageUrl ? [listing.imageUrl] : [],
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listingId}?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/listing/${listingId}?canceled=true`,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: seller.stripeAccountId,
        },
        metadata: {
          listingId,
          buyerId,
          sellerId: listing.userId,
          platformFee: platformFee.toString(),
        },
      },
      metadata: {
        listingId,
        buyerId,
        sellerId: listing.userId,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

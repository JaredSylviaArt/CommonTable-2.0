import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebase';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!endpointSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature provided' }, { status: 400 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const { listingId, buyerId, sellerId } = session.metadata || {};

        if (listingId && buyerId && sellerId) {
          // Mark listing as sold
          await updateDoc(doc(db, 'listings', listingId), {
            status: 'sold',
            soldAt: new Date(),
            buyerId,
          });

          // Create transaction record
          await addDoc(collection(db, 'transactions'), {
            listingId,
            buyerId,
            sellerId,
            amount: session.amount_total,
            platformFee: session.payment_intent?.application_fee_amount || 0,
            stripeSessionId: session.id,
            status: 'completed',
            createdAt: new Date(),
          });

          console.log(`Sale completed for listing ${listingId}`);
        }
        break;
      }

      case 'account.updated': {
        const account = event.data.object;
        const firebaseUid = account.metadata?.firebase_uid;

        if (firebaseUid) {
          // Update user's Stripe account status
          await updateDoc(doc(db, 'users', firebaseUid), {
            stripeAccountId: account.id,
            stripeChargesEnabled: account.charges_enabled,
            stripePayoutsEnabled: account.payouts_enabled,
            stripeDetailsSubmitted: account.details_submitted,
          });

          console.log(`Stripe account updated for user ${firebaseUid}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

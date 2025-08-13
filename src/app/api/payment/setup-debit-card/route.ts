import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: NextRequest) {
  try {
    const { userId, cardData } = await request.json();
    
    if (!userId || !cardData) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Validate the card with Stripe
    // 2. Create a payment method token
    // 3. Verify the card can receive payouts
    // 4. Store the token securely
    
    // For demo purposes, we'll simulate this process
    const { cardNumber, expiryDate, cvv, name } = cardData;
    
    // Basic validation
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 13 || cleanCardNumber.length > 19) {
      return NextResponse.json({ error: 'Invalid card number' }, { status: 400 });
    }

    // Get card brand
    const getCardBrand = (number: string) => {
      const num = number.replace(/\s/g, '');
      if (num.match(/^4/)) return 'Visa';
      if (num.match(/^5[1-5]/)) return 'Mastercard';
      if (num.match(/^3[47]/)) return 'American Express';
      if (num.match(/^6/)) return 'Discover';
      return 'Unknown';
    };

    const cardBrand = getCardBrand(cleanCardNumber);
    const last4 = cleanCardNumber.slice(-4);

    // In production, you would tokenize with Stripe:
    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: cleanCardNumber,
    //     exp_month: parseInt(expiryDate.split('/')[0]),
    //     exp_year: parseInt('20' + expiryDate.split('/')[1]),
    //     cvc: cvv,
    //   },
    //   billing_details: {
    //     name: name,
    //   },
    // });

    // Update user document with simplified payment info
    await updateDoc(doc(db, 'users', userId), {
      debitCardLast4: last4,
      debitCardBrand: cardBrand,
      canReceivePayments: true,
      needsFullVerification: false,
      totalSales: 0,
      // In production, store the Stripe payment method token:
      // debitCardToken: paymentMethod.id,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      cardInfo: {
        last4,
        brand: cardBrand,
      },
    });
  } catch (error) {
    console.error('Error setting up debit card:', error);
    return NextResponse.json(
      { error: 'Failed to set up debit card' },
      { status: 500 }
    );
  }
}

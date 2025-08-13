export interface User {
  uid: string;
  email: string;
  name: string;
  churchName: string;
  churchRole: string;
  zipCode: string;
  createdAt: Date;
  stripeAccountId?: string;
  stripeChargesEnabled?: boolean;
  stripePayoutsEnabled?: boolean;
  stripeDetailsSubmitted?: boolean;
  // Simplified payment setup
  debitCardLast4?: string;
  debitCardBrand?: string;
  debitCardToken?: string;
  totalSales?: number;
  canReceivePayments?: boolean;
  needsFullVerification?: boolean; // Triggers at $600
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  type: 'Give Away' | 'Sell' | 'Share';
  zipCode: string;
  imageUrl?: string;
  imagePath?: string; // Firebase Storage path for deletion
  price?: number;
  status?: 'active' | 'sold' | 'removed';
  soldAt?: Date;
  buyerId?: string;
  createdAt: Date;
  userId: string;
  userRef: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  listingId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  platformFee: number;
  stripeSessionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Date;
}

export type ListingType = 'Give Away' | 'Sell' | 'Share';
export type ListingCategory = 'Books & Resources' | 'Equipment & Tech' | 'Furniture' | 'Office Supplies' | 'Event Items' | 'Creative Assets' | 'Other';
export type ListingCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

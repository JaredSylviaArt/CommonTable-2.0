import { collection, addDoc, query, where, orderBy, limit, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Notification, User, Listing } from '@/types';

export interface CreateNotificationParams {
  userId: string; // Recipient
  type: Notification['type'];
  title: string;
  message: string;
  actionUrl?: string;
  relatedId?: string;
  senderId?: string;
}

/**
 * Create a new notification for a user
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  actionUrl,
  relatedId,
  senderId
}: CreateNotificationParams): Promise<void> {
  try {
    // Get sender information if provided
    let senderName = '';
    let senderAvatar = '';
    
    if (senderId) {
      const senderDoc = await getDoc(doc(db, 'users', senderId));
      if (senderDoc.exists()) {
        const senderData = senderDoc.data() as User;
        senderName = senderData.name || 'Unknown User';
        senderAvatar = senderData.avatarUrl || '';
      }
    }

    // Create notification document
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      read: false,
      actionUrl,
      relatedId,
      senderName,
      senderAvatar,
      createdAt: new Date(),
    });

    console.log(`Notification created for user ${userId}: ${title}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()
    })) as Notification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: new Date(),
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true, readAt: new Date() })
    );

    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}

// Predefined notification templates
export const NotificationTemplates = {
  newMessage: (senderName: string, listingTitle: string) => ({
    title: 'New Message',
    message: `${senderName} sent you a message about "${listingTitle}"`
  }),

  listingFavorited: (userName: string, listingTitle: string) => ({
    title: 'Item Favorited',
    message: `${userName} favorited your listing "${listingTitle}"`
  }),

  listingSold: (listingTitle: string, buyerName: string) => ({
    title: 'Item Sold!',
    message: `Your "${listingTitle}" was purchased by ${buyerName}`
  }),

  purchaseComplete: (listingTitle: string, sellerName: string) => ({
    title: 'Purchase Complete',
    message: `You successfully purchased "${listingTitle}" from ${sellerName}`
  }),

  newConversation: (userName: string, listingTitle: string) => ({
    title: 'New Conversation',
    message: `${userName} started a conversation about your listing "${listingTitle}"`
  }),

  listingViewed: (viewCount: number, listingTitle: string) => ({
    title: 'Listing Activity',
    message: `Your listing "${listingTitle}" has been viewed ${viewCount} times today`
  })
};

/**
 * Helper function to create notification when someone messages about a listing
 */
export async function notifyNewMessage(
  recipientId: string,
  senderId: string,
  conversationId: string,
  listingId: string
): Promise<void> {
  // Get listing info
  const listingDoc = await getDoc(doc(db, 'listings', listingId));
  if (!listingDoc.exists()) return;

  const listing = listingDoc.data() as Listing;
  const senderDoc = await getDoc(doc(db, 'users', senderId));
  const senderName = senderDoc.exists() ? senderDoc.data().name : 'Someone';

  const template = NotificationTemplates.newMessage(senderName, listing.title);
  
  await createNotification({
    userId: recipientId,
    type: 'message',
    title: template.title,
    message: template.message,
    actionUrl: `/conversation/${conversationId}`,
    relatedId: conversationId,
    senderId,
  });
}

/**
 * Helper function to create notification when someone favorites a listing
 */
export async function notifyListingFavorited(
  listingOwnerId: string,
  favoriterId: string,
  listingId: string
): Promise<void> {
  const listingDoc = await getDoc(doc(db, 'listings', listingId));
  if (!listingDoc.exists()) return;

  const listing = listingDoc.data() as Listing;
  const favoriterDoc = await getDoc(doc(db, 'users', favoriterId));
  const favoriterName = favoriterDoc.exists() ? favoriterDoc.data().name : 'Someone';

  const template = NotificationTemplates.listingFavorited(favoriterName, listing.title);
  
  await createNotification({
    userId: listingOwnerId,
    type: 'favorite',
    title: template.title,
    message: template.message,
    actionUrl: `/listing/${listingId}`,
    relatedId: listingId,
    senderId: favoriterId,
  });
}

/**
 * Helper function to create notification when a listing is sold
 */
export async function notifyListingSold(
  sellerId: string,
  buyerId: string,
  listingId: string
): Promise<void> {
  const [listingDoc, buyerDoc] = await Promise.all([
    getDoc(doc(db, 'listings', listingId)),
    getDoc(doc(db, 'users', buyerId))
  ]);

  if (!listingDoc.exists()) return;

  const listing = listingDoc.data() as Listing;
  const buyerName = buyerDoc.exists() ? buyerDoc.data().name : 'Someone';

  const template = NotificationTemplates.listingSold(listing.title, buyerName);
  
  await createNotification({
    userId: sellerId,
    type: 'sold',
    title: template.title,
    message: template.message,
    actionUrl: `/dashboard`,
    relatedId: listingId,
    senderId: buyerId,
  });
}

/**
 * Helper function to create notification for successful purchase
 */
export async function notifyPurchaseComplete(
  buyerId: string,
  sellerId: string,
  listingId: string
): Promise<void> {
  const [listingDoc, sellerDoc] = await Promise.all([
    getDoc(doc(db, 'listings', listingId)),
    getDoc(doc(db, 'users', sellerId))
  ]);

  if (!listingDoc.exists()) return;

  const listing = listingDoc.data() as Listing;
  const sellerName = sellerDoc.exists() ? sellerDoc.data().name : 'the seller';

  const template = NotificationTemplates.purchaseComplete(listing.title, sellerName);
  
  await createNotification({
    userId: buyerId,
    type: 'purchase',
    title: template.title,
    message: template.message,
    actionUrl: `/dashboard`,
    relatedId: listingId,
    senderId: sellerId,
  });
}

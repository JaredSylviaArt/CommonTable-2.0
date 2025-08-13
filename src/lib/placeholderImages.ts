// Placeholder image service for listings
export interface PlaceholderImageOptions {
  category: string;
  type: 'Give Away' | 'Sell' | 'Share';
  title?: string;
  width?: number;
  height?: number;
}

// Generate appropriate placeholder images based on category and context
export function getPlaceholderImage({ 
  category, 
  type, 
  title = '', 
  width = 400, 
  height = 300 
}: PlaceholderImageOptions): string {
  
  // Normalize category for URL-safe usage
  const normalizeForUrl = (text: string) => 
    text.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  // Church-appropriate, professional placeholder images
  const categoryImages = {
    'books-resources': [
      `https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=${width}&h=${height}&fit=crop&q=80`, // Books on shelf
      `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=${width}&h=${height}&fit=crop&q=80`, // Study books
      `https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=${width}&h=${height}&fit=crop&q=80`, // Bible/religious book
      `https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=${width}&h=${height}&fit=crop&q=80`, // Open book
    ],
    'equipment-tech': [
      `https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=${width}&h=${height}&fit=crop&q=80`, // Tech equipment
      `https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=${width}&h=${height}&fit=crop&q=80`, // Computer setup
      `https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=${width}&h=${height}&fit=crop&q=80`, // Audio equipment
      `https://images.unsplash.com/photo-1593642532842-98d0fd5ebc1a?w=${width}&h=${height}&fit=crop&q=80`, // Tech devices
    ],
    'furniture': [
      `https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=${width}&h=${height}&fit=crop&q=80`, // Church chairs
      `https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=${width}&h=${height}&fit=crop&q=80`, // Office furniture
      `https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=${width}&h=${height}&fit=crop&q=80`, // Tables
      `https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=${width}&h=${height}&fit=crop&q=80`, // Wooden furniture
    ],
    'office-supplies': [
      `https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=${width}&h=${height}&fit=crop&q=80`, // Office supplies
      `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=${width}&h=${height}&fit=crop&q=80`, // Stationery
      `https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=${width}&h=${height}&fit=crop&q=80`, // Paper supplies
      `https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=${width}&h=${height}&fit=crop&q=80`, // Office desk items
    ],
    'event-items': [
      `https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=${width}&h=${height}&fit=crop&q=80`, // Event setup
      `https://images.unsplash.com/photo-1511578314322-379afb476865?w=${width}&h=${height}&fit=crop&q=80`, // Party decorations
      `https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=${width}&h=${height}&fit=crop&q=80`, // Event tables
      `https://images.unsplash.com/photo-1519167758481-83f29c853cb9?w=${width}&h=${height}&fit=crop&q=80`, // Conference setup
    ],
    'creative-assets': [
      `https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=${width}&h=${height}&fit=crop&q=80`, // Art supplies
      `https://images.unsplash.com/photo-1572177812156-58036aae439c?w=${width}&h=${height}&fit=crop&q=80`, // Creative workspace
      `https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?w=${width}&h=${height}&fit=crop&q=80`, // Graphics/design
      `https://images.unsplash.com/photo-1541911087797-f89237bd95d0?w=${width}&h=${height}&fit=crop&q=80`, // Creative tools
    ],
    'other': [
      `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=${width}&h=${height}&fit=crop&q=80`, // Generic items
      `https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=${width}&h=${height}&fit=crop&q=80`, // Household items
      `https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=${width}&h=${height}&fit=crop&q=80`, // Miscellaneous
      `https://images.unsplash.com/photo-1527797263125-1d4b9ca297fe?w=${width}&h=${height}&fit=crop&q=80`, // General objects
    ]
  };

  // Fallback solid colors for categories (if images fail to load)
  const categoryColors = {
    'books-resources': '#8B5A3C', // Brown for books
    'equipment-tech': '#4A90E2', // Blue for tech
    'furniture': '#7B68EE', // Purple for furniture
    'office-supplies': '#32CD32', // Green for supplies
    'event-items': '#FF6B6B', // Red for events
    'creative-assets': '#FFD700', // Gold for creative
    'other': '#808080' // Gray for other
  };

  const normalizedCategory = normalizeForUrl(category);
  const images = categoryImages[normalizedCategory as keyof typeof categoryImages];
  const fallbackColor = categoryColors[normalizedCategory as keyof typeof categoryColors] || '#808080';

  if (images && images.length > 0) {
    // Use title to create some variety - different items get different images
    const titleHash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const imageIndex = Math.abs(titleHash) % images.length;
    return images[imageIndex];
  }

  // Fallback to solid color image
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${fallbackColor}"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16" font-family="Arial, sans-serif">
        ${category}
      </text>
    </svg>
  `)}`;
}

// Quick helper function for common listing card usage
export function getListingPlaceholder(listing: { category: string; type: 'Give Away' | 'Sell' | 'Share'; title?: string }): string {
  return getPlaceholderImage({
    category: listing.category,
    type: listing.type,
    title: listing.title || '',
    width: 400,
    height: 300
  });
}

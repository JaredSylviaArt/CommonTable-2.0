# CommonTable

A church-only marketplace and sharing platform for ministry staff to give away, sell, or share resources with each other.

## Features

- 🔐 **Authentication**: Email/password or Google sign-in with church role verification
- 📦 **Listings**: Create listings to give away, sell, or share ministry resources
- 🗂️ **Feed & Filters**: Browse all listings with filtering by type, category, and location
- 💬 **Messaging**: Direct messaging between users about specific listings
- 🧑‍💼 **Dashboard**: Manage your listings and conversations

## Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with Geist font
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Icons**: Heroicons

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Firebase Configuration**:
   The Firebase configuration is already set up in `src/lib/firebase.ts`. The project is connected to the `commontable7` Firebase project.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## User Flow

1. **Sign Up**: New users provide name, email, church name, church role, and ZIP code
2. **Browse**: View the home feed with all available listings
3. **Filter**: Use the sidebar to filter by type (Give/Sell/Share), category, and distance
4. **Create**: Add new listings with photos and descriptions
5. **Message**: Contact listing owners through the built-in messaging system
6. **Manage**: Use the dashboard to view your listings and conversations

## Design System

- **Primary Color**: `#665CF0` (purple)
- **Accent Color**: `#E6FF02` (lime green)
- **Font**: Geist Sans
- **Theme**: Warm and friendly, emphasizing stewardship, generosity, and simplicity

## Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  name: string;
  churchName: string;
  churchRole: string;
  zipCode: string;
  createdAt: Date;
}
```

### Listings Collection
```typescript
{
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  type: 'Give Away' | 'Sell' | 'Share';
  zipCode: string;
  imageUrl?: string;
  createdAt: Date;
  userId: string;
}
```

### Conversations Collection
```typescript
{
  id: string;
  listingId: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}
```

### Messages Collection
```typescript
{
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}
```

## Future Enhancements

- ZIP code radius filtering with Google Maps API
- Push notifications for new messages
- Listing categories management
- User ratings and reviews
- Advanced search functionality
- Mobile app development
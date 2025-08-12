import { collection, addDoc } from 'firebase/firestore';
import { db } from './firebase';

export const mockListings = [
  // Give Away Items
  {
    title: "Office Desks (x3)",
    description: "Three gently used office desks from our recent renovation. Perfect for church offices or volunteer workspaces. Good condition with minor wear on surfaces.",
    category: "Furniture",
    condition: "Good",
    type: "Give Away",
    zipCode: "75201",
    imageUrl: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop",
    userId: "mock-user-1",
    userRef: "users/mock-user-1",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    title: "12 Folding Chairs",
    description: "Set of 12 metal folding chairs, great for events or small group meetings. Some scratches but structurally sound.",
    category: "Furniture",
    condition: "Fair",
    type: "Give Away",
    zipCode: "75202",
    imageUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    userId: "mock-user-2",
    userRef: "users/mock-user-2",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
  {
    title: "Youth Ministry Board Games Collection",
    description: "Large collection of board games used in our youth ministry. Includes classics like Monopoly, Scrabble, and newer games. Some boxes show wear but all pieces included.",
    category: "Event Items",
    condition: "Good",
    type: "Give Away",
    zipCode: "75203",
    userId: "mock-user-3",
    userRef: "users/mock-user-3",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
  },
  {
    title: "Office Supplies Bundle",
    description: "Miscellaneous office supplies including binders, paper, pens, staplers, and folders. Perfect for getting a new ministry office started.",
    category: "Office Supplies",
    condition: "Good",
    type: "Give Away",
    zipCode: "75204",
    userId: "mock-user-4",
    userRef: "users/mock-user-4",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },

  // Sell Items
  {
    title: "Projector for Sanctuary",
    description: "Professional-grade Epson projector, 4000 lumens. Used in our main sanctuary for 2 years. Excellent condition, includes ceiling mount and cables. Perfect for worship services.",
    category: "Equipment & Tech",
    condition: "Like New",
    type: "Sell",
    zipCode: "75205",
    imageUrl: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=300&fit=crop",
    userId: "mock-user-5",
    userRef: "users/mock-user-5",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
  },
  {
    title: "Sound System Components",
    description: "Complete sound system including mixer, speakers, microphones, and cables. Used for our contemporary service. Great starter system for smaller churches.",
    category: "Equipment & Tech",
    condition: "Good",
    type: "Sell",
    zipCode: "75206",
    imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    userId: "mock-user-6",
    userRef: "users/mock-user-6",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
  },
  {
    title: "Kids Ministry VBS Curriculum (Unused)",
    description: "Brand new VBS curriculum for ages 3-12. Never used due to program changes. Includes leader guides, crafts, decorations, and music CD. Retail value $150.",
    category: "Books & Resources",
    condition: "New",
    type: "Sell",
    zipCode: "75207",
    userId: "mock-user-7",
    userRef: "users/mock-user-7",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
  },
  {
    title: "Church Pews (Set of 8)",
    description: "Traditional wooden church pews, each seats 6-8 people. Beautiful craftsmanship from 1960s renovation. Minor wear but very sturdy. Perfect for chapel or smaller sanctuary.",
    category: "Furniture",
    condition: "Good",
    type: "Sell",
    zipCode: "75208",
    userId: "mock-user-8",
    userRef: "users/mock-user-8",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  },

  // Share Items
  {
    title: "Sermon Series Graphics Package",
    description: "Professional sermon series graphics for 'Faith in Action' - 6 weeks of sermon slides, social media graphics, and bulletin inserts. Adobe files included.",
    category: "Creative Assets",
    condition: "New",
    type: "Share",
    zipCode: "75209",
    userId: "mock-user-9",
    userRef: "users/mock-user-9",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    title: "Small Group Study Materials",
    description: "Digital copies of small group curriculum on Christian leadership. 12-week study with discussion guides and video links. Great for men's or leadership groups.",
    category: "Books & Resources",
    condition: "New",
    type: "Share",
    zipCode: "75210",
    userId: "mock-user-10",
    userRef: "users/mock-user-10",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
  },
  {
    title: "Event Planning Templates",
    description: "Complete set of event planning templates including budget spreadsheets, volunteer schedules, setup checklists. Used for our successful fall festival.",
    category: "Other",
    condition: "New",
    type: "Share",
    zipCode: "75211",
    userId: "mock-user-11",
    userRef: "users/mock-user-11",
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
  },
  {
    title: "Worship Slide Templates",
    description: "Beautiful ProPresenter templates for worship services. Modern designs with scripture backgrounds and announcement slides. 50+ templates included.",
    category: "Creative Assets",
    condition: "New",
    type: "Share",
    zipCode: "75212",
    userId: "mock-user-12",
    userRef: "users/mock-user-12",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
  },
];

export const mockUsers = [
  {
    uid: "mock-user-1",
    email: "jessica.brown@riverwoodchapel.org",
    name: "Jessica Brown",
    churchName: "Riverwood Chapel",
    churchRole: "Admin Staff",
    zipCode: "75201",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-2",
    email: "emily.white@citylightchurch.com",
    name: "Emily White",
    churchName: "City Light Church",
    churchRole: "Events Coordinator",
    zipCode: "75202",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-3",
    email: "maria.rodriguez@elcamino.org",
    name: "Maria Rodriguez",
    churchRole: "Youth Pastor",
    churchName: "El Camino",
    zipCode: "75203",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-4",
    email: "jane.doe@communitychurch.net",
    name: "Jane Doe",
    churchName: "Community Church",
    churchRole: "Office Manager",
    zipCode: "75204",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-5",
    email: "john.smith@firstbaptist.org",
    name: "John Smith",
    churchName: "First Baptist",
    churchRole: "Worship Leader",
    zipCode: "75205",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-6",
    email: "jane.doe@communitychurch.net",
    name: "Jane Doe",
    churchName: "Community Church",
    churchRole: "Audio Tech",
    zipCode: "75206",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-7",
    email: "sarah.lee@gracefellowship.com",
    name: "Sarah Lee",
    churchName: "Grace Fellowship",
    churchRole: "Children's Pastor",
    zipCode: "75207",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-8",
    email: "david.kim@newlifechurch.org",
    name: "David Kim",
    churchName: "New Life Church",
    churchRole: "Facilities Manager",
    zipCode: "75208",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-9",
    email: "rachel.adams@hopecc.com",
    name: "Rachel Adams",
    churchName: "Hope Community Church",
    churchRole: "Creative Director",
    zipCode: "75209",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-10",
    email: "mike.wilson@crossroads.org",
    name: "Mike Wilson",
    churchName: "Crossroads Church",
    churchRole: "Small Groups Pastor",
    zipCode: "75210",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-11",
    email: "lisa.taylor@faithpoint.net",
    name: "Lisa Taylor",
    churchName: "Faith Point Church",
    churchRole: "Event Coordinator",
    zipCode: "75211",
    createdAt: new Date(),
  },
  {
    uid: "mock-user-12",
    email: "alex.johnson@cornerstonechurch.com",
    name: "Alex Johnson",
    churchName: "Cornerstone Church",
    churchRole: "Worship Pastor",
    zipCode: "75212",
    createdAt: new Date(),
  },
];

export async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Add mock users
    for (const user of mockUsers) {
      try {
        // Note: In a real app, users would be created through Firebase Auth
        // This is just for demo purposes
        console.log(`Adding user: ${user.name}`);
      } catch (error) {
        console.error(`Error adding user ${user.name}:`, error);
      }
    }

    // Add mock listings
    for (const listing of mockListings) {
      try {
        await addDoc(collection(db, 'listings'), listing);
        console.log(`Added listing: ${listing.title}`);
      } catch (error) {
        console.error(`Error adding listing ${listing.title}:`, error);
      }
    }

    console.log('Database seeding completed!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

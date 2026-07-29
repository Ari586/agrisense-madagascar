import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { 
  User, Post, Product, Order, Message, TradeDocument, 
  ForumThread, ForumReply, Webinar, ChatContact 
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;

// Setup Express to parse JSON and urlencoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Google GenAI client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini API initialized successfully.');
  } catch (err) {
    console.error('Error initializing Gemini API Client:', err);
  }
} else {
  console.log('Gemini API Key missing or default placeholder. AI Copilot will use smart fallback simulations.');
}

// -----------------------------------------------------------------------------
// Database state management (File persistent + in-memory fallback)
// -----------------------------------------------------------------------------
const DB_FILE_PATH = path.join(process.cwd(), 'db_state.json');

interface DbState {
  users: User[];
  posts: Post[];
  products: Product[];
  orders: Order[];
  messages: Message[];
  documents: TradeDocument[];
  threads: ForumThread[];
  replies: ForumReply[];
  webinars: Webinar[];
}

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Mock Users
const defaultUsers: User[] = [
  {
    id: 'user1',
    name: 'Juan Valdez',
    email: 'juan@colombiafarms.com',
    role: 'farmer',
    location: 'Medellín, Colombia',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    certifications: ['Organic Certified', 'Fair Trade Certified'],
    rating: 4.9,
    followersCount: 1420,
    followingCount: 310
  },
  {
    id: 'user2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@agritrade-europe.com',
    role: 'trader',
    location: 'Rotterdam, Netherlands',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    certifications: ['GlobalG.A.P. Broker', 'Import License A-1'],
    rating: 4.8,
    followersCount: 890,
    followingCount: 420
  },
  {
    id: 'user3',
    name: 'Amara Diop',
    email: 'amara@senegalagri.sn',
    role: 'exporter',
    location: 'Dakar, Senegal',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    certifications: ['Ecocert Organic', 'Phytosanitary Clearance'],
    rating: 4.7,
    followersCount: 650,
    followingCount: 180
  },
  {
    id: 'user4',
    name: 'Chen Wei',
    email: 'chen.wei@shanghai-import.cn',
    role: 'importer',
    location: 'Shanghai, China',
    isVerified: true,
    profilePicture: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    certifications: ['China Customs Importer Bond', 'CIQ Licensed'],
    rating: 4.6,
    followersCount: 1105,
    followingCount: 520
  }
];

// Mock Products
const defaultProducts: Product[] = [
  {
    id: 'prod1',
    userId: 'user1',
    userName: 'Juan Valdez',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'farmer',
    userRating: 4.9,
    title: 'Premium Organic Arabica Coffee Beans',
    description: 'High-altitude micro-lot Arabica coffee beans. Hand-harvested, washed processing, dried on raised beds. Fair Trade certified and organic. Ready for export in 60kg jute bags.',
    price: 6.2,
    unit: 'kg',
    category: 'crops',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587918842454-870dbd18261a?auto=format&fit=crop&w=600&q=80'
    ],
    isAvailable: true,
    moq: 500,
    location: 'Medellín, Colombia',
    certification: ['Organic', 'Fair Trade'],
    urgency: 'medium'
  },
  {
    id: 'prod2',
    userId: 'user3',
    userName: 'Amara Diop',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'exporter',
    userRating: 4.7,
    title: 'Whole Dried Ginger (Premium Grade A)',
    description: 'High-grade whole dried ginger rhizomes. Cleaned, thoroughly sun-dried, and graded. Excellent heat and aroma profile. Packaged in 50kg PP bags, phytosanitary certified.',
    price: 2.8,
    unit: 'kg',
    category: 'crops',
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
    ],
    isAvailable: true,
    moq: 1000,
    location: 'Dakar, Senegal',
    certification: ['Phytosanitary Approved'],
    urgency: 'low'
  },
  {
    id: 'prod3',
    userId: 'user2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'trader',
    userRating: 4.8,
    title: 'High-Capacity Irrigation Water Pump',
    description: 'Diesel-powered 4-inch agricultural centrifugal irrigation water pump. Capable of delivering 1200L/min. Sturdy steel roll cage frame, electric start, highly reliable for field cropping.',
    price: 450,
    unit: 'unit',
    category: 'machinery',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
    ],
    isAvailable: true,
    moq: 1,
    location: 'Rotterdam, Netherlands',
    certification: ['CE Certified'],
    urgency: 'low'
  },
  {
    id: 'prod4',
    userId: 'user2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'trader',
    userRating: 4.8,
    title: 'Agri-Logistics Port Cold Storage Logistics',
    description: 'End-to-end cold-chain logistics from port Rotterdam to any destination in Europe. We provide customs brokerage, phytosanitary inspection scheduling, and temperature-tracked cargo trucks.',
    price: 1500,
    unit: 'container',
    category: 'services',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    ],
    isAvailable: true,
    moq: 1,
    location: 'Rotterdam, Netherlands',
    certification: ['HACCP Certified'],
    urgency: 'high'
  }
];

// Mock Posts
const defaultPosts: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    userName: 'Juan Valdez',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'farmer',
    caption: 'Cherry beans are absolutely glowing this week! 🍒 High altitudes in Antioquia coupled with optimal seasonal rain have produced perfect sugar counts. Looking forward to our premium specialty wash batches! #OrganicCoffee #SustainableFarming #ColombiaHarvest',
    images: [
      'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    hashtags: ['OrganicCoffee', 'SustainableFarming', 'ColombiaHarvest'],
    likesCount: 245,
    commentsCount: 18,
    savedCount: 42,
    likedByMe: false,
    savedByMe: false,
    taggedProductId: 'prod1',
    taggedProductTitle: 'Premium Organic Arabica Coffee Beans',
    taggedProductPrice: 6.2
  },
  {
    id: 'post2',
    userId: 'user2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'trader',
    caption: 'With European port congestions clearing, cold-chain space is opening up in Rotterdam. We are seeing a spike in wholesale inquiries for imported tropical crops. Contact us to coordinate phytosanitary documentation and customs clearance. #WheatExport #AgriLogistics #GlobalTrade',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    hashtags: ['WheatExport', 'AgriLogistics', 'GlobalTrade'],
    likesCount: 112,
    commentsCount: 9,
    savedCount: 15,
    likedByMe: false,
    savedByMe: false,
    taggedProductId: 'prod4',
    taggedProductTitle: 'Agri-Logistics Port Cold Storage Logistics',
    taggedProductPrice: 1500
  },
  {
    id: 'post3',
    userId: 'user3',
    userName: 'Amara Diop',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    userRole: 'exporter',
    caption: 'Our premium grade dried ginger is packed and phytosanitary certified, ready for global shipping from Dakar port. We have strictly optimized the sun-drying process to maintain a moisture level under 12%. #GingerExport #OrganicGinger #SenegalAgri',
    images: [
      'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
    ],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    hashtags: ['GingerExport', 'OrganicGinger', 'SenegalAgri'],
    likesCount: 88,
    commentsCount: 4,
    savedCount: 22,
    likedByMe: false,
    savedByMe: false,
    taggedProductId: 'prod2',
    taggedProductTitle: 'Whole Dried Ginger (Premium Grade A)',
    taggedProductPrice: 2.8
  }
];

// Mock Orders
const defaultOrders: Order[] = [
  {
    id: 'ord1',
    buyerId: 'user4',
    buyerName: 'Chen Wei',
    sellerId: 'user1',
    sellerName: 'Juan Valdez',
    productId: 'prod1',
    productTitle: 'Premium Organic Arabica Coffee Beans',
    quantity: 1000,
    price: 6.2,
    totalAmount: 6200,
    status: 'escrow_deposited',
    escrowDetails: 'US $6,200 held in AgriRED Trade Escrow. Awaiting seller shipment and phytosanitary upload.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

// Mock Messages
const defaultMessages: Message[] = [
  {
    id: 'msg1',
    senderId: 'user4',
    receiverId: 'user1',
    content: 'Hi Juan, I am very interested in your Premium Organic Arabica Coffee Beans. What is the total export lead time to Shanghai port?',
    createdAt: new Date(Date.now() - 3600000 * 73).toISOString(),
    type: 'text'
  },
  {
    id: 'msg2',
    senderId: 'user1',
    receiverId: 'user4',
    content: 'Hello Chen! Once escrow is established, we can mill and pack in jute bags within 10 days, and dispatch from port Buenaventura. Total sea transit is around 25 days.',
    createdAt: new Date(Date.now() - 3600000 * 72.8).toISOString(),
    type: 'text'
  },
  {
    id: 'msg3',
    senderId: 'user4',
    receiverId: 'user1',
    content: 'Sounds excellent. I have submitted a purchase request for 1,000 kg and initiated the escrow transaction of $6,200. Please check your order panel.',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    type: 'text'
  }
];

// Mock Trade Documents
const defaultDocuments: TradeDocument[] = [
  {
    id: 'doc1',
    userId: 'user1',
    title: 'Colombia Organic Agriculture Certificate 2026',
    docType: 'Organic Certificate',
    status: 'verified',
    verifiedAt: new Date(Date.now() - 3600000 * 500).toISOString(),
    fileUrl: 'https://example.com/certs/colombia_organic_2026.pdf'
  },
  {
    id: 'doc2',
    userId: 'user3',
    title: 'Senegal Phytosanitary Export Permit (Ginger)',
    docType: 'Phytosanitary Certificate',
    status: 'pending',
    fileUrl: 'https://example.com/certs/dakar_phyto_ginger_draft.pdf'
  }
];

// Mock Threads
const defaultThreads: ForumThread[] = [
  {
    id: 'th1',
    userId: 'user1',
    userName: 'Juan Valdez',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    title: 'Coping with late seasonal rains in high-altitude coffee cultivation',
    content: 'Has anyone else in South America noticed a delayed rainfall cycle this season? We are adjusting our wet mill schedule and utilizing covered solar dryers rather than open beds to safeguard bean moisture levels. Let\'s share techniques.',
    tags: ['CoffeeFarming', 'ClimateAdaptation', 'PostHarvest'],
    createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
    repliesCount: 2
  },
  {
    id: 'th2',
    userId: 'user2',
    userName: 'Sarah Jenkins',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    title: 'EU Import Regulations Updates (2026 Deforestation Due Diligence)',
    content: 'Important briefing for all coffee, soy, and cocoa exporters to the EU. EU Deforestation Regulation (EUDR) checks are stepping up. Importers are requiring exact polygon GPS coordinates of farm plots. Let\'s discuss standard mapping tools that are compliant.',
    tags: ['EUTreasury', 'Deforestation', 'TradeCompliance'],
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    repliesCount: 1
  }
];

// Mock Replies
const defaultReplies: ForumReply[] = [
  {
    id: 'rep1',
    threadId: 'th1',
    userId: 'user3',
    userName: 'Amara Diop',
    userAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Yes Juan, we faced a similar situation with our root crops in Senegal. We shifted completely to raised solar hoop houses. It creates a microclimate that dries crops 40% faster while protecting from sudden showers.',
    createdAt: new Date(Date.now() - 3600000 * 70).toISOString()
  },
  {
    id: 'rep2',
    threadId: 'th2',
    userId: 'user1',
    userName: 'Juan Valdez',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    content: 'Thanks for bringing this up, Sarah. In Colombia, we are partnering with local federations to map farm plots with mobile GIS apps. This enables us to provide the required geo-location data directly with the export invoice.',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Mock Webinars
const defaultWebinars: Webinar[] = [
  {
    id: 'web1',
    title: 'GPS Farm Mapping for Global Trade Compliance',
    host: 'Dr. Marcus Vance (Agri-Tech Lead)',
    description: 'Learn how to generate and verify GPS polygon shapefiles for farm plots. This session covers free mobile tools and how to package data for EU and US trade portals.',
    date: '2026-08-04',
    time: '14:00 UTC',
    attendeesCount: 184,
    registeredByMe: false
  },
  {
    id: 'web2',
    title: 'Advanced Sun-Drying & Moisture Control in Spices',
    host: 'Amina Belghazi (Senior Post-Harvest Engineer)',
    description: 'A deep dive into moisture sensors, solar dryers, and sanitary handling of high-value crops like vanilla, cardamom, and ginger to avoid fungal contaminations.',
    date: '2026-08-11',
    time: '09:30 UTC',
    attendeesCount: 95,
    registeredByMe: false
  }
];

// Load / Initialize database state
let dbState: DbState = {
  users: [...defaultUsers],
  posts: [...defaultPosts],
  products: [...defaultProducts],
  orders: [...defaultOrders],
  messages: [...defaultMessages],
  documents: [...defaultDocuments],
  threads: [...defaultThreads],
  replies: [...defaultReplies],
  webinars: [...defaultWebinars]
};

const loadDb = () => {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const data = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      dbState = JSON.parse(data);
      console.log('Database state loaded from file successfully.');
    } else {
      saveDb();
    }
  } catch (err) {
    console.error('Failed to load database state, using defaults.', err);
  }
};

const saveDb = () => {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dbState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database state:', err);
  }
};

loadDb();

// -----------------------------------------------------------------------------
// API Endpoints
// -----------------------------------------------------------------------------

// Active user session (simulated login)
let activeUserId = 'user4'; // Chen Wei (Importer) by default, user can switch roles in UI!

app.get('/api/auth/me', (req, res) => {
  const user = dbState.users.find(u => u.id === activeUserId);
  res.json({ user, allUsers: dbState.users });
});

app.post('/api/auth/switch', (req, res) => {
  const { userId } = req.body;
  const user = dbState.users.find(u => u.id === userId);
  if (user) {
    activeUserId = userId;
    res.json({ success: true, user });
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, role, location, certifications } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  
  const newUser: User = {
    id: 'user_' + generateId(),
    name: name || 'New Agri Member',
    email: email || 'member@agrired.com',
    role: role || 'farmer',
    location: location || 'Global',
    isVerified: false, // Must be false initially
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    certifications: certifications || [],
    rating: 5.0,
    followersCount: 0,
    followingCount: 0,
    otpCode: otpCode
  };
  
  dbState.users.push(newUser);
  activeUserId = newUser.id;
  saveDb();
  
  console.log(`\n\n=== ✉️ EMAIL SIMULATION ===\nTo: ${newUser.email}\nSubject: Your Agrisense Verification Code\nCode: ${otpCode}\n==========================\n\n`);
  
  res.json({ success: true, user: newUser });
});

app.post('/api/auth/verify', (req, res) => {
  const { email, otp } = req.body;
  const user = dbState.users.find(u => u.email === email);
  
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  
  if (user.otpCode === otp) {
    user.isVerified = true;
    user.otpCode = undefined; // Clear OTP after success
    saveDb();
    return res.json({ success: true, user });
  } else {
    return res.status(400).json({ success: false, error: 'Invalid OTP code' });
  }
});

// Users
app.get('/api/users/:id', (req, res) => {
  const user = dbState.users.find(u => u.id === req.params.id);
  if (user) res.json(user);
  else res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/:id/follow', (req, res) => {
  const targetUser = dbState.users.find(u => u.id === req.params.id);
  const me = dbState.users.find(u => u.id === activeUserId);
  if (!targetUser || !me) {
    return res.status(404).json({ error: 'User not found' });
  }
  // Simply toggle follow count for demo
  targetUser.followersCount += 1;
  me.followingCount += 1;
  saveDb();
  res.json({ success: true, targetUser });
});

// Posts
app.get('/api/posts', (req, res) => {
  const sortedPosts = [...dbState.posts].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sortedPosts);
});

app.post('/api/posts', (req, res) => {
  const { caption, images, hashtags, taggedProductId } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;
  
  let taggedProductTitle = undefined;
  let taggedProductPrice = undefined;
  if (taggedProductId) {
    const prod = dbState.products.find(p => p.id === taggedProductId);
    if (prod) {
      taggedProductTitle = prod.title;
      taggedProductPrice = prod.price;
    }
  }

  const newPost: Post = {
    id: 'post_' + generateId(),
    userId: me.id,
    userName: me.name,
    userAvatar: me.profilePicture,
    userRole: me.role,
    caption: caption || '',
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80'],
    createdAt: new Date().toISOString(),
    hashtags: hashtags || [],
    likesCount: 0,
    commentsCount: 0,
    savedCount: 0,
    likedByMe: false,
    savedByMe: false,
    taggedProductId,
    taggedProductTitle,
    taggedProductPrice
  };

  dbState.posts.unshift(newPost);
  saveDb();
  res.json(newPost);
});

app.post('/api/posts/:id/like', (req, res) => {
  const post = dbState.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  
  post.likedByMe = !post.likedByMe;
  post.likesCount += post.likedByMe ? 1 : -1;
  saveDb();
  res.json(post);
});

app.post('/api/posts/:id/save', (req, res) => {
  const post = dbState.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  post.savedByMe = !post.savedByMe;
  post.savedCount += post.savedByMe ? 1 : -1;
  saveDb();
  res.json(post);
});

// Comments
app.get('/api/posts/:postId/comments', (req, res) => {
  const comments = dbState.replies
    .filter(r => r.threadId === req.params.postId) // we can reuse comments in separate storage or replies
    .map(c => ({
      id: c.id,
      postId: c.threadId,
      userId: c.userId,
      userName: c.userName,
      userAvatar: c.userAvatar,
      content: c.content,
      createdAt: c.createdAt
    }));
  res.json(comments);
});

app.post('/api/posts/:postId/comments', (req, res) => {
  const { content } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;
  const post = dbState.posts.find(p => p.id === req.params.postId);

  if (!post) return res.status(404).json({ error: 'Post not found' });

  const newComment = {
    id: 'comm_' + generateId(),
    threadId: post.id, // storing in replies storage
    userId: me.id,
    userName: me.name,
    userAvatar: me.profilePicture,
    content: content,
    createdAt: new Date().toISOString()
  };

  dbState.replies.push(newComment);
  post.commentsCount += 1;
  saveDb();
  res.json(newComment);
});

// Products
app.get('/api/products', (req, res) => {
  res.json(dbState.products);
});

app.post('/api/products', (req, res) => {
  const { title, description, price, unit, category, images, moq, location, certification, urgency } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;

  const newProd: Product = {
    id: 'prod_' + generateId(),
    userId: me.id,
    userName: me.name,
    userAvatar: me.profilePicture,
    userRole: me.role,
    userRating: me.rating,
    title,
    description,
    price: Number(price) || 0,
    unit: unit || 'kg',
    category: category || 'crops',
    images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=600&q=80'],
    isAvailable: true,
    moq: Number(moq) || 1,
    location: location || me.location,
    certification: certification || [],
    urgency: urgency || 'low'
  };

  dbState.products.unshift(newProd);
  saveDb();
  res.json(newProd);
});

// Orders & Escrow
app.get('/api/orders', (req, res) => {
  // Show orders where user is buyer or seller
  const myOrders = dbState.orders.filter(o => o.buyerId === activeUserId || o.sellerId === activeUserId);
  res.json(myOrders);
});

app.post('/api/orders', (req, res) => {
  const { productId, quantity } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;
  const prod = dbState.products.find(p => p.id === productId);

  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const totalAmount = prod.price * Number(quantity);
  const newOrder: Order = {
    id: 'ord_' + generateId(),
    buyerId: me.id,
    buyerName: me.name,
    sellerId: prod.userId,
    sellerName: prod.userName,
    productId: prod.id,
    productTitle: prod.title,
    quantity: Number(quantity),
    price: prod.price,
    totalAmount,
    status: 'pending',
    escrowDetails: 'Order initialized. Awaiting buyer escrow deposit to secure transaction funds.',
    createdAt: new Date().toISOString()
  };

  dbState.orders.unshift(newOrder);
  saveDb();
  res.json(newOrder);
});

app.post('/api/orders/:id/action', (req, res) => {
  const { action } = req.body; // 'deposit', 'ship', 'release', 'cancel'
  const order = dbState.orders.find(o => o.id === req.params.id);

  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (action === 'deposit') {
    order.status = 'escrow_deposited';
    order.escrowDetails = `US $${order.totalAmount.toLocaleString()} deposited in secured Escrow account. Funds locked securely. Seller is instructed to ship items and upload documents.`;
  } else if (action === 'ship') {
    order.status = 'shipped';
    order.escrowDetails = `Goods dispatched by seller. Phytosanitary permit and Bill of Lading filed. Awaiting buyer cargo receipt verification to release funds.`;
  } else if (action === 'release') {
    order.status = 'escrow_released';
    order.escrowDetails = `Buyer confirmed receipt. Trade complete! US $${order.totalAmount.toLocaleString()} released from Escrow directly to seller's payout account.`;
  } else if (action === 'cancel') {
    order.status = 'cancelled';
    order.escrowDetails = `Order cancelled. Funds (if deposited) are fully refunded to the buyer's balance.`;
  }

  saveDb();
  res.json(order);
});

// Chat system
app.get('/api/chat/contacts', (req, res) => {
  const me = dbState.users.find(u => u.id === activeUserId)!;
  
  // Contacts are all users other than active user
  const contacts: ChatContact[] = dbState.users
    .filter(u => u.id !== activeUserId)
    .map(u => {
      // Find last message
      const lastMsg = dbState.messages
        .filter(m => (m.senderId === activeUserId && m.receiverId === u.id) || (m.senderId === u.id && m.receiverId === activeUserId))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return {
        id: u.id,
        name: u.name,
        role: u.role,
        profilePicture: u.profilePicture,
        lastMessage: lastMsg ? (lastMsg.type === 'negotiation' ? '💰 Price Negotiation Offer' : lastMsg.content) : 'Start a trade discussion',
        lastMessageTime: lastMsg ? lastMsg.createdAt : undefined
      };
    });

  res.json(contacts);
});

app.get('/api/chat/messages/:contactId', (req, res) => {
  const myMsgs = dbState.messages.filter(m => 
    (m.senderId === activeUserId && m.receiverId === req.params.contactId) ||
    (m.senderId === req.params.contactId && m.receiverId === activeUserId)
  ).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  res.json(myMsgs);
});

app.post('/api/chat/messages', (req, res) => {
  const { receiverId, content, type, proposalPrice, proposalQuantity } = req.body;
  
  const newMsg: Message = {
    id: 'msg_' + generateId(),
    senderId: activeUserId,
    receiverId,
    content,
    createdAt: new Date().toISOString(),
    type: type || 'text',
    proposalPrice: proposalPrice ? Number(proposalPrice) : undefined,
    proposalQuantity: proposalQuantity ? Number(proposalQuantity) : undefined,
    proposalStatus: type === 'negotiation' ? 'pending' : undefined
  };

  dbState.messages.push(newMsg);
  saveDb();
  res.json(newMsg);
});

app.post('/api/chat/messages/:id/negotiate', (req, res) => {
  const { status } = req.body; // 'accepted' | 'declined'
  const msg = dbState.messages.find(m => m.id === req.params.id);

  if (!msg) return res.status(404).json({ error: 'Message not found' });
  msg.proposalStatus = status;

  if (status === 'accepted') {
    // If accepted, let's auto-generate a secure Order from this negotiation!
    const buyerId = activeUserId;
    const sellerId = msg.senderId;
    const buyer = dbState.users.find(u => u.id === buyerId)!;
    const seller = dbState.users.find(u => u.id === sellerId)!;
    
    // Find a crop product by seller
    const prod = dbState.products.find(p => p.userId === sellerId) || dbState.products[0];

    const quantity = msg.proposalQuantity || 1000;
    const price = msg.proposalPrice || prod.price;
    const totalAmount = quantity * price;

    const newOrder: Order = {
      id: 'ord_' + generateId(),
      buyerId,
      buyerName: buyer.name,
      sellerId,
      sellerName: seller.name,
      productId: prod.id,
      productTitle: `${prod.title} (Negotiated Offer)`,
      quantity,
      price,
      totalAmount,
      status: 'pending',
      escrowDetails: 'Negotiated offer accepted! Awaiting secure trade escrow deposit.',
      createdAt: new Date().toISOString()
    };
    dbState.orders.unshift(newOrder);
  }

  saveDb();
  res.json(msg);
});

// Document hub
app.get('/api/documents', (req, res) => {
  const myDocs = dbState.documents.filter(d => d.userId === activeUserId);
  res.json(myDocs);
});

app.post('/api/documents', (req, res) => {
  const { title, docType, fileUrl } = req.body;
  const newDoc: TradeDocument = {
    id: 'doc_' + generateId(),
    userId: activeUserId,
    title: title || 'Agricultural Export Permit',
    docType: docType || 'Other',
    status: 'pending',
    fileUrl: fileUrl || 'https://example.com/certs/custom_file.pdf'
  };

  dbState.documents.push(newDoc);
  saveDb();
  res.json(newDoc);
});

// Q&A Forum
app.get('/api/forum', (req, res) => {
  res.json(dbState.threads);
});

app.get('/api/forum/:id', (req, res) => {
  const thread = dbState.threads.find(t => t.id === req.params.id);
  const replies = dbState.replies.filter(r => r.threadId === req.params.id);
  if (thread) {
    res.json({ thread, replies });
  } else {
    res.status(404).json({ error: 'Thread not found' });
  }
});

app.post('/api/forum', (req, res) => {
  const { title, content, tags } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;

  const newThread: ForumThread = {
    id: 'th_' + generateId(),
    userId: me.id,
    userName: me.name,
    userAvatar: me.profilePicture,
    title,
    content,
    tags: tags || [],
    createdAt: new Date().toISOString(),
    repliesCount: 0
  };

  dbState.threads.unshift(newThread);
  saveDb();
  res.json(newThread);
});

app.post('/api/forum/:id/reply', (req, res) => {
  const { content } = req.body;
  const me = dbState.users.find(u => u.id === activeUserId)!;
  const thread = dbState.threads.find(t => t.id === req.params.id);

  if (!thread) return res.status(404).json({ error: 'Thread not found' });

  const newReply: ForumReply = {
    id: 'rep_' + generateId(),
    threadId: thread.id,
    userId: me.id,
    userName: me.name,
    userAvatar: me.profilePicture,
    content,
    createdAt: new Date().toISOString()
  };

  dbState.replies.push(newReply);
  thread.repliesCount += 1;
  saveDb();
  res.json(newReply);
});

// Webinars & Events
app.get('/api/webinars', (req, res) => {
  res.json(dbState.webinars);
});

app.post('/api/webinars/:id/register', (req, res) => {
  const webinar = dbState.webinars.find(w => w.id === req.params.id);
  if (!webinar) return res.status(404).json({ error: 'Webinar not found' });

  webinar.registeredByMe = !webinar.registeredByMe;
  webinar.attendeesCount += webinar.registeredByMe ? 1 : -1;
  saveDb();
  res.json(webinar);
});

// Shipping / Logistics Cost Calculator
app.post('/api/logistics/calculate', (req, res) => {
  const { origin, destination, weight, transportType } = req.body; // 'ocean' | 'air' | 'land'
  
  // Simple realistic math base calculation
  let baseRate = 1.2; // Ocean
  if (transportType === 'air') baseRate = 5.8;
  if (transportType === 'land') baseRate = 2.1;

  const distanceFactor = Math.abs(origin.charCodeAt(0) - destination.charCodeAt(0)) || 10;
  const cost = baseRate * Number(weight) * (distanceFactor * 0.1) + 150; // base loading charge
  const deliveryDays = Math.max(3, Math.round(distanceFactor * 0.5));

  res.json({
    origin,
    destination,
    weight,
    cost: Number(cost.toFixed(2)),
    deliveryDays,
    partnerCarrier: transportType === 'ocean' ? 'Maersk Agri-Freight' : transportType === 'air' ? 'DHL Express Agri-Cargo' : 'Schenker Farm Logistics',
    trackingAvailable: true
  });
});

// -----------------------------------------------------------------------------
// AI Smart Features powered by Gemini API
// -----------------------------------------------------------------------------

// Post AI generation/enhancement helper
app.post('/api/ai/enhance-post', async (req, res) => {
  const { caption, hashtags } = req.body;
  if (!caption) {
    return res.status(400).json({ error: 'Caption is required' });
  }

  const prompt = `You are a social media copywriter for AgriRED, an agricultural social network like Xiaohongshu/RED. 
Enhance the following caption to make it highly engaging, informative, and visual. Write it in an elegant, modern tone, incorporating rich details, emojis, and styling suitable for agri-trade. Also suggest 3-5 relevant global trading/crop hashtags if not present.
Original Caption: "${caption}"
Current hashtags: "${hashtags ? hashtags.join(', ') : ''}"

Respond strictly in JSON format matching this schema:
{
  "enhancedCaption": "the enhanced caption string here",
  "hashtags": ["list", "of", "suggested", "hashtags"]
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (err) {
      console.error('Gemini error during post enhancement:', err);
      res.json({
        enhancedCaption: `🌱 [AI Enhanced] ${caption} \n\nOur agricultural community benefits from optimized sun drying & premium trade certifications. Ready for inquiries!`,
        hashtags: ['AgriTrade', 'SustainableCrop', 'GlobalMarkets']
      });
    }
  } else {
    // Elegant simulation fallback
    res.json({
      enhancedCaption: `🌱 [Simulated AI Upgrade] ${caption} \n\nPerfect harvest parameters met! Clean sun-drying maintains moisture under 12%. Direct export quotes available on inquiry.`,
      hashtags: ['AgriTrade', 'PremiumCrop', 'GlobalCommerce']
    });
  }
});

// AI Copilot Trade Advisor & Country Regulations Consultant
app.post('/api/ai/copilot', async (req, res) => {
  const { query, contextCrop, contextCountry } = req.body;
  if (!query) return res.status(400).json({ error: 'Query is required' });

  const systemInstruction = `You are the AgriRED AI Trade Advisor & Crop Analyst, a high-level specialist on international agricultural commodity trade, logistics, and country regulations.
You provide precise, professional, and practical advice on phytosanitary certificates, tariff rates, export/import laws, customs procedures, and pricing suggestions.
Always provide structure, use bolding for keys, and keep answers realistic. If the user asks about crop trends, suggest standard market expectations.`;

  const prompt = `Query: "${query}"
Context Crop of interest: "${contextCrop || 'Any'}"
Target Country for import/export regulations check: "${contextCountry || 'Any'}"`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { systemInstruction }
      });
      res.json({ answer: response.text });
    } catch (err) {
      console.error('Gemini error in Copilot:', err);
      res.json({ answer: `**Trade Advisor Offline Fallback:**\n\nFor **${contextCrop}** trade to **${contextCountry}**, the following standards generally apply:\n\n1. **Phytosanitary Certification**: A pre-shipment clearance certificate is required by customs authorities to verify freedom from weed seeds, insects, and fungal spores.\n2. **Import Licensing**: You will need to file custom declarations (like Form C-28) to clear ports safely.\n3. **Tariffs**: Under typical agricultural trade agreements, tariffs range from 3.5% to 8.2% depending on organic status.` });
    }
  } else {
    res.json({
      answer: `### 🌾 AgriRED AI Trade Report & Recommendation

Concerning **${contextCrop || 'Specialty Crops'}** trade in **${contextCountry || 'Global Ports'}**:

1. **Phytosanitary Standards**: High-priority check required. Standard moisture level must be strictly under **12.5%** to prevent aflatoxin and mold during shipping across sea lanes.
2. **Import Regulations**: Exporters must register with the destination customs portal. For EU, complete the **EUDR Deforestation Compliance Statement** using farm GPS polygon logs.
3. **Price Valuation Advisory**: Current international bulk demand is robust. Recommended target minimum order quantity (MOQ) is **500 kg** to offset ocean-freight baseline overheads. 

*AI Tip: Secure transaction security by utilizing the fully integrated **AgriRED Trade Escrow** panel to log payments.*`
    });
  }
});

// AI Document Pre-Verification
app.post('/api/ai/verify-document', async (req, res) => {
  const { docTitle, docType } = req.body;
  
  const prompt = `Analyze the draft agricultural trade document with Title: "${docTitle}" and Type: "${docType}". 
Based on standard international import/export laws, identify what required fields, stamps, or compliance declarations (like USDA Organic, EUDR GPS, Phytosanitary clean statement) MUST be present. Rate the readiness percentage from 0 to 100%. 
Respond strictly in JSON format matching this schema:
{
  "readinessScore": 85,
  "status": "passed_with_warnings",
  "missingClaus": ["Specific GPS coordinate polygons for EUDR", "Verified signature of the regional inspector"],
  "analysisText": "A professional analysis paragraph explaining what to check next."
}`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      const data = JSON.parse(response.text || '{}');
      res.json(data);
    } catch (err) {
      console.error('Gemini error during document verification:', err);
      res.json({
        readinessScore: 75,
        status: 'passed_with_warnings',
        missingClaus: ['Authorized inspector wet-ink stamp', 'Container seal number verification'],
        analysisText: 'The document contains standard cargo volume declarations but lacks explicit phytosanitary clearance references for the selected cargo categories.'
      });
    }
  } else {
    res.json({
      readinessScore: 80,
      status: 'passed_with_warnings',
      missingClaus: ['Producer organic certificate number', 'Import agent customs registration ID'],
      analysisText: 'This is a simulation pre-check: Your document contains valid volume and origin declarations. Please ensure the official government phytosanitary stamp is added before locking the Escrow shipment.'
    });
  }
});

// AI Translation tool
app.post('/api/ai/translate', async (req, res) => {
  const { text, targetLang } = req.body; // 'English' | 'French' | 'Spanish' | 'Mandarin'
  if (!text) return res.status(400).json({ error: 'Text is required' });

  const prompt = `Translate the following text into ${targetLang || 'English'} accurately. Preserve the context of agricultural trading, crops, and social RED/Xiaohongshu style where appropriate.
Text to translate:
"${text}"

Provide only the translated string in your response, with no introductory text or quotes.`;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });
      res.json({ translatedText: response.text?.trim() });
    } catch (err) {
      console.error('Gemini translation error:', err);
      res.json({ translatedText: `[Translated to ${targetLang}] ${text}` });
    }
  } else {
    res.json({ translatedText: `[Simulated Translation to ${targetLang}] ${text}` });
  }
});

// Market Price Analytics and Demand Forecast
app.get('/api/analytics/prices', (req, res) => {
  // Return realistic mock data representing 6 months of historical wholesale prices
  const priceData = {
    Coffee: [5.80, 5.95, 6.10, 6.05, 6.20, 6.35],
    Ginger: [2.50, 2.55, 2.70, 2.65, 2.80, 2.85],
    Wheat: [0.32, 0.35, 0.38, 0.36, 0.39, 0.41],
    Vanilla: [210.0, 215.0, 222.0, 218.0, 228.0, 235.0]
  };
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  res.json({ months, priceData });
});

// -----------------------------------------------------------------------------
// Vite Dev Server Integration
// -----------------------------------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
};

startServer();

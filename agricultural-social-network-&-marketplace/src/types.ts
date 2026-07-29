export type UserRole = 'farmer' | 'trader' | 'exporter' | 'importer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  location: string;
  isVerified: boolean;
  profilePicture: string;
  certifications: string[];
  rating: number;
  followersCount: number;
  followingCount: number;
  otpCode?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  caption: string;
  images: string[];
  createdAt: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  savedCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  taggedProductId?: string;
  taggedProductTitle?: string;
  taggedProductPrice?: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Product {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userRole: UserRole;
  userRating: number;
  title: string;
  description: string;
  price: number;
  unit: string;
  category: 'crops' | 'machinery' | 'services';
  images: string[];
  isAvailable: boolean;
  moq: number;
  location: string;
  certification: string[];
  urgency: 'low' | 'medium' | 'high';
}

export type OrderStatus = 'pending' | 'escrow_deposited' | 'shipped' | 'escrow_released' | 'cancelled';

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
  totalAmount: number;
  status: OrderStatus;
  escrowDetails?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  type: 'text' | 'negotiation';
  proposalPrice?: number;
  proposalQuantity?: number;
  proposalStatus?: 'pending' | 'accepted' | 'declined';
}

export interface TradeDocument {
  id: string;
  userId: string;
  title: string;
  docType: 'Invoice' | 'Organic Certificate' | 'Import License' | 'Phytosanitary Certificate' | 'Other';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string;
  fileUrl: string;
}

export interface ForumThread {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  repliesCount: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
}

export interface Webinar {
  id: string;
  title: string;
  host: string;
  description: string;
  date: string;
  time: string;
  attendeesCount: number;
  registeredByMe: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  role: UserRole;
  profilePicture: string;
  lastMessage?: string;
  lastMessageTime?: string;
}

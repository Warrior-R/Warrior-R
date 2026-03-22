export type UserRole = "BUYER" | "SELLER" | "ADMIN";
export type VerificationStatus =
  | "PENDING"
  | "DOCUMENT_VERIFIED"
  | "BIOMETRIC_VERIFIED"
  | "FULLY_VERIFIED"
  | "REJECTED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "SOLD" | "EXPIRED" | "SUSPENDED";
export type ListingType = "FIXED_PRICE" | "AUCTION" | "BOTH";
export type AuctionStatus = "UPCOMING" | "ACTIVE" | "ENDED" | "CANCELLED";
export type OrderStatus = "PENDING" | "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type PaymentMethod = "CARD" | "BANK_TRANSFER" | "CASH_ON_DELIVERY" | "PAGOMOVIL";

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  cedula?: string;
  verificationStatus: VerificationStatus;
  role: UserRole;
  isActive: boolean;
  address?: string;
  city?: string;
  province?: string;
  country: string;
  avatarUrl?: string;
  rating: number;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string;
  status: ProductStatus;
  listingType: ListingType;
  images: string[];
  aiCategory?: string;
  aiTags: string[];
  aiDescription?: string;
  views: number;
  stock: number;
  location?: string;
  province?: string;
  sellerId: string;
  categoryId: string;
  seller?: User;
  category?: Category;
  auction?: Auction;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Auction {
  id: string;
  productId: string;
  startPrice: number;
  currentPrice: number;
  buyNowPrice?: number;
  minBidStep: number;
  status: AuctionStatus;
  startTime: Date;
  endTime: Date;
  winnerId?: string;
  product?: Product;
  bids?: Bid[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  isWinning: boolean;
  createdAt: Date;
  bidder?: User;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  shippingAddr?: string;
  notes?: string;
  buyer?: User;
  seller?: User;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface Review {
  id: string;
  authorId: string;
  targetId: string;
  productId?: string;
  rating: number;
  comment?: string;
  author?: User;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  avatarUrl?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

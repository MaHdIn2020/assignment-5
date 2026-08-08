// Shared TypeScript types derived from the Prisma schema and API responses.
// Keep these in sync with the backend's Prisma models.

export type Role = "ADMIN" | "LANDLORD" | "TENANT";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type ContactStatus = "NEW" | "REPLIED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  profilePhoto?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: { properties: number };
}

export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: string;
  averageRating?: number;
  reviewCount?: number;
  landlord: Pick<User, "id" | "name" | "email" | "phone">;
  category?: Category;
  _count?: { reviews: number };
  reviews?: Review[];
}

export interface RentalRequest {
  id: string;
  message?: string;
  moveInDate: string;
  status: RequestStatus;
  createdAt: string;
  tenantId: string;
  tenant?: Pick<User, "id" | "name" | "email" | "phone">;
  propertyId: string;
  property?: Pick<
    Property,
    "id" | "title" | "city" | "rentAmount" | "images"
  > & {
    landlord?: Pick<User, "id" | "name" | "email">;
  };
  payment?: Payment;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  stripePaymentIntentId?: string;
  status: PaymentStatus;
  createdAt: string;
  rentalRequestId: string;
  rentalRequest?: {
    property?: Pick<Property, "id" | "title" | "city" | "rentAmount">;
  };
  tenantId: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  tenantId: string;
  tenant?: Pick<User, "id" | "name">;
  propertyId: string;
  property?: Pick<Property, "id" | "title" | "city">;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  coverImage?: string;
  tags: string[];
  isPublished?: boolean;
  publishedAt: string;
  createdAt?: string;
  author?: Pick<User, "id" | "name" | "email">;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

export interface NewsletterSubscription {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

// Standard API envelope returned by every backend endpoint
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface AdminStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalProperties: number;
    availableProperties: number;
    totalRentalRequests: number;
    pendingRequests: number;
    totalPayments: number;
    successfulPayments: number;
    totalReviews: number;
    totalRevenue: number;
  };
  usersByRole: { role: string; count: number }[];
}

export interface AdminAnalytics {
  revenueByMonth: { month: string; revenue: number }[];
  requestsByStatus: { status: string; count: number }[];
  propertiesByCity: { city: string; count: number }[];
  propertiesByCategory: { name: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  avgRentByCity: { city: string; avgRent: number }[];
  recentUsers: Pick<User, "id" | "name" | "email" | "role" | "createdAt">[];
  recentProperties: Pick<
    Property,
    "id" | "title" | "city" | "rentAmount" | "isAvailable" | "createdAt"
  >[];
}

export interface PublicStats {
  totalUsers: number;
  totalProperties: number;
  availableProperties: number;
  totalCities: number;
  totalReviews: number;
  totalBlogPosts: number;
  averageRating: number;
  categories: Category[];
  topReviews: Review[];
}

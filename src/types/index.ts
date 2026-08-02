// Shared TypeScript types derived from the Prisma schema and API responses.
// Keep these in sync with the backend's Prisma models.

export type Role = "ADMIN" | "LANDLORD" | "TENANT";
export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";

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
  };
}

export interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalRentalRequests: number;
  totalPayments: number;
  totalRevenue: number;
  activeListings: number;
}

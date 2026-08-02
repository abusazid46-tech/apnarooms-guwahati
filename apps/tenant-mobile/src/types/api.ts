export type BackendImage = {
  id: string;
  url: string;
  path?: string | null;
  alt?: string | null;
  sortOrder: number;
};

export type BackendProperty = {
  id: string;
  title: string;
  slug?: string | null;
  description?: string | null;
  category: "PG" | "GIRLS_PG" | "BOYS_PG" | "ROOM" | "FLAT" | "HOMESTAY" | "HOSTEL";
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  rentMonthly: number;
  depositAmount?: number | null;
  tokenAmount: number;
  locality: string;
  city: string;
  address?: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  amenities: string[];
  images: BackendImage[];
  createdAt: string;
};

export type BackendBooking = {
  id: string;
  tokenAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  moveInDate?: string | null;
  property: BackendProperty;
  createdAt: string;
};

export type BackendLead = {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  message?: string | null;
  source?: string | null;
  status: "NEW" | "CONTACTED" | "VISIT_SCHEDULED" | "VISIT_COMPLETED" | "NEGOTIATION" | "TOKEN_PAID" | "MOVED_IN" | "LOST";
  property?: Pick<BackendProperty, "id" | "title" | "locality" | "rentMonthly"> | null;
  createdAt: string;
};

export type BackendReview = {
  id: string;
  propertyId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  rating: number;
  body: string;
  source?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  property?: Pick<BackendProperty, "id" | "title" | "locality" | "rentMonthly"> | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendCoupon = {
  id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  maxDiscount?: number | null;
  isActive: boolean;
  expiresAt?: string | null;
};

export type PropertyCategory = "all" | "PG" | "GIRLS_PG" | "BOYS_PG" | "ROOM" | "FLAT" | "HOMESTAY" | "HOSTEL";

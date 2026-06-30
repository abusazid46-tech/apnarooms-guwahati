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
  category: "PG" | "HOMESTAY" | "FLAT" | "ROOM";
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED";
  rentMonthly: number;
  depositAmount?: number | null;
  tokenAmount: number;
  locality: string;
  city: string;
  address?: string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  amenities: string[];
  images: BackendImage[];
  createdAt: string;
};

export type BackendUser = {
  id: string;
  firebaseUid: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  role: "USER" | "ADMIN" | "SALES" | "SUPPORT" | "LANDLORD";
};

export type BackendBooking = {
  id: string;
  tokenAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  moveInDate?: string | null;
  property: BackendProperty;
  createdAt: string;
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

export type PropertyCategory = "all" | "PG" | "HOMESTAY" | "FLAT" | "ROOM";

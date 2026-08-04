export type BackendImage = {
  id: string;
  url: string;
  path?: string | null;
  alt?: string | null;
  sortOrder: number;
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
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  isVerified: boolean;
  isAvailable: boolean;
  amenities: string[];
  images: BackendImage[];
  landlord?: Pick<BackendUser, "id" | "name" | "phone" | "email"> | null;
  createdAt: string;
};

export type BackendBooking = {
  id: string;
  tokenAmount: number;
  status: "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "REFUNDED";
  moveInDate?: string | null;
  property: BackendProperty;
  tenant?: BackendUser;
  payment?: BackendPayment | null;
  createdAt: string;
};

export type BackendPayment = {
  id: string;
  providerOrderId: string;
  providerPaymentId?: string | null;
  amount: number;
  currency: string;
  status: "ORDER_CREATED" | "PAID" | "FAILED" | "REFUNDED";
  booking?: BackendBooking;
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
  assignedTo?: Pick<BackendUser, "id" | "name" | "email" | "phone"> | null;
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
  createdAt: string;
  updatedAt: string;
};

export type BackendBlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  body: string;
  category?: string | null;
  coverImage?: string | null;
  authorName?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BackendNotification = {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  href?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export type Paginated<TName extends string, T> = Record<TName, T[]> & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

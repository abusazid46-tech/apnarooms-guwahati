export type UserRole = "USER" | "ADMIN" | "SALES" | "SUPPORT" | "LANDLORD";

export type PropertyCategory = "PG" | "GIRLS_PG" | "BOYS_PG" | "ROOM" | "FLAT" | "HOMESTAY" | "HOSTEL";

export type BookingStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELLED" | "REFUNDED";

export type PaymentStatus = "ORDER_CREATED" | "PAID" | "FAILED" | "REFUNDED";

export type CrmLeadStatus =
  | "NEW"
  | "CONTACTED"
  | "VISIT_SCHEDULED"
  | "VISIT_COMPLETED"
  | "NEGOTIATION"
  | "TOKEN_PAID"
  | "MOVED_IN"
  | "LOST";

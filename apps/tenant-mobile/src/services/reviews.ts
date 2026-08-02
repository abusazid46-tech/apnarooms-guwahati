import { apiFetch, apiPost } from "@/lib/api";
import type { BackendReview } from "@/types/api";

export type ReviewInput = {
  propertyId?: string;
  name: string;
  phone?: string;
  email?: string;
  rating: number;
  body: string;
};

export function listReviews(propertyId?: string) {
  const params = new URLSearchParams({ limit: "12" });
  if (propertyId) params.set("propertyId", propertyId);
  return apiFetch<{ reviews: BackendReview[] }>(`/reviews?${params.toString()}`);
}

export function createReview(input: ReviewInput) {
  return apiPost<{ review: BackendReview }>("/reviews", {
    ...input,
    source: "tenant-mobile"
  });
}

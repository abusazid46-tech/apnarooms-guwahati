import { apiFetch, apiPatch, apiPost } from "@/lib/api";
import type { BackendProperty } from "@/types/api";

export type OwnerPropertyPayload = {
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  title: string;
  description?: string;
  category: BackendProperty["category"];
  rentMonthly: number;
  depositAmount?: number;
  tokenAmount: number;
  locality: string;
  city: string;
  address?: string;
  amenities: string[];
  images?: { url: string; alt?: string; sortOrder?: number }[];
  isAvailable: boolean;
};

export function listOwnerProperties(token: string) {
  return apiFetch<{ properties: BackendProperty[] }>("/properties/owner", { token });
}

export function createOwnerProperty(token: string, payload: OwnerPropertyPayload) {
  return apiPost<{ property: BackendProperty }>("/properties/owner", payload, { token });
}

export function updateOwnerAvailability(token: string, propertyId: string, isAvailable: boolean) {
  return apiPatch<{ property: BackendProperty }>(`/properties/owner/${propertyId}/availability`, { isAvailable }, { token });
}

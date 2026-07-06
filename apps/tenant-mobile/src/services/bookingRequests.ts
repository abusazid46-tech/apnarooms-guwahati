import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiPost } from "@/lib/api";
import type { BackendLead, BackendProperty } from "@/types/api";

const storageKey = "apnarooms.nativeBookingRequests";

export type BookingRequest = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  locality: string;
  tokenAmount: number;
  name?: string;
  phone?: string;
  email?: string;
  status: BackendLead["status"];
  createdAt: string;
};

export type BookingRequestInput = {
  name: string;
  phone: string;
  email: string;
  message?: string;
};

async function readRequests() {
  const raw = await AsyncStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as BookingRequest[]) : [];
  } catch {
    return [];
  }
}

async function saveRequests(requests: BookingRequest[]) {
  await AsyncStorage.setItem(storageKey, JSON.stringify(requests));
}

export async function listBookingRequests() {
  return readRequests();
}

export async function createBookingRequest(property: BackendProperty, input: BookingRequestInput) {
  const message = [
    input.message?.trim(),
    `Native app booking request for ${property.title}`,
    `Property ID: ${property.id}`,
    `Token amount: INR ${property.tokenAmount}`
  ].filter(Boolean).join("\n");

  const result = await apiPost<{ lead: BackendLead }>("/leads", {
    name: input.name.trim() || undefined,
    phone: input.phone.trim() || undefined,
    email: input.email.trim() || undefined,
    message,
    source: "tenant_mobile_native",
    propertyId: property.id
  });

  const request: BookingRequest = {
    id: result.lead.id,
    propertyId: property.id,
    propertyTitle: property.title,
    locality: property.locality,
    tokenAmount: property.tokenAmount,
    name: input.name.trim() || undefined,
    phone: input.phone.trim() || undefined,
    email: input.email.trim() || undefined,
    status: result.lead.status,
    createdAt: result.lead.createdAt
  };

  const existing = await readRequests();
  await saveRequests([request, ...existing.filter((item) => item.id !== request.id)].slice(0, 50));
  return request;
}

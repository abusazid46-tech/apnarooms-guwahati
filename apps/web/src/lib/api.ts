import type { User } from "firebase/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://apnarooms-api.onrender.com/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type ApiInit = RequestInit & {
  user?: User | null;
};

async function authHeaders(user?: User | null) {
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { user, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  const tokenHeaders = await authHeaders(user);
  Object.entries(tokenHeaders).forEach(([key, value]) => requestHeaders.set(key, value));

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: requestHeaders
  });

  const text = await response.text();
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new ApiError(body?.message ?? `API request failed: ${response.status}`, response.status);
  }

  return body as T;
}

export function apiPost<T>(path: string, body: unknown, init: ApiInit = {}) {
  return apiFetch<T>(path, {
    ...init,
    method: "POST",
    body: JSON.stringify(body)
  });
}

export function apiPatch<T>(path: string, body: unknown, init: ApiInit = {}) {
  return apiFetch<T>(path, {
    ...init,
    method: "PATCH",
    body: JSON.stringify(body)
  });
}

export function apiDelete<T>(path: string, init: ApiInit = {}) {
  return apiFetch<T>(path, {
    ...init,
    method: "DELETE"
  });
}

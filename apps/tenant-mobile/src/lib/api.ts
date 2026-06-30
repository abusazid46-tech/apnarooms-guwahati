import { env } from "@/config/env";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

type ApiInit = RequestInit & {
  token?: string | null;
};

export async function apiFetch<T>(path: string, init: ApiInit = {}): Promise<T> {
  const { token, headers, ...rest } = init;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: requestHeaders
  });

  const text = await response.text();
  let body: unknown = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      throw new ApiError("Server returned an invalid response. Please try again.", response.status);
    }
  }

  if (!response.ok) {
    const message = typeof body === "object" && body && "message" in body ? String(body.message) : `API request failed: ${response.status}`;
    throw new ApiError(message, response.status);
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

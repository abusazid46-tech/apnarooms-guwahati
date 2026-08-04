import type { User } from "firebase/auth";

const DEFAULT_API_BASE_URL = "https://apnarooms.com/api";
const SAME_ORIGIN_API_BASE_URL = "/api";
const FALLBACK_API_BASE_URL = "https://darkred-coyote-647666.hostingersite.com/api";

function normalizeApiBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return DEFAULT_API_BASE_URL;
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const API_BASE_URL = normalizeApiBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL);
const API_FALLBACK_BASE_URL = FALLBACK_API_BASE_URL;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);
const PROXY_AUTH_HEADER_ERROR = "Missing auth token";

function canRetryFallback(path: string, method: string) {
  if (method !== "GET") return false;
  if (path.includes("/admin") || path.includes("/owner") || path.includes("/me")) return false;
  return true;
}

function parseApiBody(text: string, status: number, path: string) {
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const preview = text.replace(/\s+/g, " ").trim().slice(0, 120);
    throw new ApiError(`API returned non-JSON response for ${path}: ${status}${preview ? ` - ${preview}` : ""}`, status);
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public issues: { path: string; message: string }[] = []
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
  const method = rest.method?.toUpperCase() ?? "GET";
  const primaryApiBaseUrl = user ? SAME_ORIGIN_API_BASE_URL : API_BASE_URL;
  const requestHeaders = new Headers(headers);
  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }
  const tokenHeaders = await authHeaders(user);
  Object.entries(tokenHeaders).forEach(([key, value]) => requestHeaders.set(key, value));

  const fetchFromBase = (baseUrl: string) =>
    fetch(`${baseUrl}${path}`, {
      ...rest,
      headers: new Headers(requestHeaders)
    });

  let response: Response;
  try {
    response = await fetchFromBase(primaryApiBaseUrl);
  } catch (error) {
    if (primaryApiBaseUrl === API_FALLBACK_BASE_URL || !canRetryFallback(path, method)) {
      throw error;
    }
    response = await fetchFromBase(API_FALLBACK_BASE_URL);
  }

  let text = await response.text();
  let body = parseApiBody(text, response.status, path);

  const shouldRetryFallback =
    primaryApiBaseUrl !== API_FALLBACK_BASE_URL &&
    canRetryFallback(path, method) &&
    (RETRYABLE_STATUSES.has(response.status) || (response.status === 401 && body?.message === PROXY_AUTH_HEADER_ERROR));

  if (shouldRetryFallback) {
    response = await fetchFromBase(API_FALLBACK_BASE_URL);
    text = await response.text();
    body = parseApiBody(text, response.status, path);
  }

  if (!response.ok) {
    const issues = Array.isArray(body?.issues) ? body.issues : [];
    const issueText = issues
      .map((issue: { path?: string; message?: string }) => [issue.path, issue.message].filter(Boolean).join(": "))
      .filter(Boolean)
      .join(", ");
    const message = issueText || body?.message || `API request failed: ${response.status}`;
    throw new ApiError(message, response.status, issues);
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

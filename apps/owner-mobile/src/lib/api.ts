import { env } from "@/config/env";

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
  const body = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const issues = Array.isArray(body?.issues) ? body.issues : [];
    const issueText = issues
      .map((issue: { path?: string; message?: string }) => [issue.path, issue.message].filter(Boolean).join(": "))
      .filter(Boolean)
      .join(", ");
    throw new ApiError(issueText || body?.message || `API request failed: ${response.status}`, response.status, issues);
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

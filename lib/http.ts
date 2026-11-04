export interface ApiResponse<T> {
  items: T;
  message: string;
  errors: Record<string, string[]> | null;
  token?: string;
}

export class ApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.errors = errors;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function errorText(caught: unknown, fallback = "خطایی رخ داد.") {
  if (caught instanceof ApiError) return caught.message;
  if (caught instanceof Error && caught.message) return caught.message;
  return fallback;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = getToken();
  const response = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = (await response.json().catch(() => ({
    items: {} as T,
    message: "پاسخ سرور قابل خواندن نیست.",
    errors: null,
  }))) as ApiResponse<T>;

  if (!response.ok) {
    const first = data.errors ? Object.values(data.errors).flat()[0] : undefined;
    throw new ApiError(first || data.message || "خطایی رخ داد", data.errors ?? undefined);
  }

  return data;
}

function send<T>(path: string, method: string, body?: unknown) {
  return api<T>(path, {
    method,
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

export const http = {
  get: <T>(path: string) => api<T>(path),
  post: <T>(path: string, body?: unknown) => send<T>(path, "POST", body),
  put: <T>(path: string, body?: unknown) => send<T>(path, "PUT", body),
  patch: <T>(path: string, body?: unknown) => send<T>(path, "PATCH", body),
  delete: <T>(path: string) => send<T>(path, "DELETE"),
};

export type ApiErrorBody = Record<string, string[]> | null;

export interface ApiResponse<T> {
  items: T;
  message: string;
  errors: ApiErrorBody;
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

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("admin_token", token);
  else localStorage.removeItem("admin_token");
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

export interface AdminUser {
  id: number;
  first_name: string | null;
  last_name: string | null;
  mobile: string;
  email: string | null;
  created_at?: string | null;
  roles?: Role[];
  permissions?: string[];
}

export interface Role {
  id: number;
  name: string;
  label: string | null;
  users_count?: number;
  permissions_count?: number;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  label: string | null;
  group: string | null;
}

export interface WalletSnapshot {
  wallet: { id: number; balance: number; available_balance: number } | null;
  transactions: {
    id: number;
    type: number;
    amount: number;
    balance_after: number;
    description: string | null;
    created_at: string | null;
  }[];
}

export function fullName(user: { first_name: string | null; last_name: string | null }) {
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "بدون نام";
}

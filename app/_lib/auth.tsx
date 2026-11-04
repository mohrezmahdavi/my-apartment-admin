"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminUser, api, getToken, setToken } from "./api";

interface AuthState {
  user: AdminUser | null;
  ready: boolean;
  can: (permission: string) => boolean;
  login: (mobile: string, password: string) => Promise<void>;
  sendOtp: (mobile: string) => Promise<number>;
  verifyOtp: (mobile: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [ready, setReady] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      setReady(true);
      return;
    }

    api<{ user: AdminUser }>("/account-service/v1/me")
      .then((response) => setUser(response.items.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user && pathname !== "/login") router.replace("/login");
    if (user && pathname === "/login") router.replace("/");
  }, [ready, user, pathname, router]);

  async function login(mobile: string, password: string) {
    const response = await api<{ user: AdminUser }>("/account-service/v1/login", {
      method: "POST",
      body: JSON.stringify({ mobile, password }),
    });
    setToken(response.token ?? null);
    setUser(response.items.user);
  }

  async function sendOtp(mobile: string) {
    const response = await api<{ expires_in: number }>("/account-service/v1/otp/send", {
      method: "POST",
      body: JSON.stringify({ mobile }),
    });
    return response.items.expires_in ?? 120;
  }

  async function verifyOtp(mobile: string, code: string) {
    const response = await api<{ user: AdminUser }>("/account-service/v1/otp/verify", {
      method: "POST",
      body: JSON.stringify({ mobile, code }),
    });
    setToken(response.token ?? null);
    setUser(response.items.user);
  }

  async function logout() {
    try {
      await api("/account-service/v1/logout", { method: "POST" });
    } finally {
      setToken(null);
      setUser(null);
      router.replace("/login");
    }
  }

  const can = useCallback(
    (permission: string) => Boolean(user?.permissions?.includes(permission)),
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        ready,
        can,
        login,
        sendOtp,
        verifyOtp,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

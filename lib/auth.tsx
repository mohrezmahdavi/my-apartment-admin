"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiPaths } from "@/lib/endpoints";
import { toLatinDigits } from "@/lib/format";
import { getToken, http, setToken } from "@/lib/http";
import type { AdminUser } from "@/lib/types";

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

function storeSession(token: string | undefined, user: AdminUser, setUser: (user: AdminUser) => void) {
  setToken(token ?? null);
  setUser(user);
}

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

    http.get<{ user: AdminUser }>(apiPaths.me)
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
    const response = await http.post<{ user: AdminUser }>(apiPaths.login, {
      mobile: toLatinDigits(mobile),
      password,
    });
    storeSession(response.token, response.items.user, setUser);
  }

  async function sendOtp(mobile: string) {
    const response = await http.post<{ expires_in: number }>(apiPaths.otpSend, {
      mobile: toLatinDigits(mobile),
    });
    return response.items.expires_in ?? 120;
  }

  async function verifyOtp(mobile: string, code: string) {
    const response = await http.post<{ user: AdminUser }>(apiPaths.otpVerify, {
      mobile: toLatinDigits(mobile),
      code: toLatinDigits(code),
    });
    storeSession(response.token, response.items.user, setUser);
  }

  async function logout() {
    try {
      await http.post(apiPaths.logout);
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

  return <AuthContext.Provider value={{ user, ready, can, login, sendOtp, verifyOtp, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

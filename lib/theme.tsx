"use client";

import { createContext, useContext, useLayoutEffect, useState } from "react";
import { MoonIcon, SunIcon } from "@/components/icons";

export type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void } | null>(null);

function apply(theme: Theme, persist: boolean) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
  if (!persist) return;
  document.cookie = `admin_theme=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeProvider({ initial, children }: { initial: Theme | null; children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(initial ?? "light");

  useLayoutEffect(() => {
    const resolved = initial ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(resolved);
    apply(resolved, initial === null);
  }, [initial]);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    apply(next, true);
  }

  return <ThemeContext.Provider value={{ theme, toggle }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" className="theme-toggle grid" onClick={toggle} aria-label={dark ? "حالت روشن" : "حالت تیره"}>
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

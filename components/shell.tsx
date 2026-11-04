"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CloseIcon, LogoutIcon, MenuIcon } from "@/components/icons";
import { isNavActive, navItems } from "@/components/nav";
import { fullName } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/lib/theme";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, ready, can, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready || !user) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="spinner spinner-lg" />
      </main>
    );
  }

  const visible = navItems.filter((item) => !item.permission || can(item.permission));
  const current = visible.find((item) => isNavActive(item.href, pathname));

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17.5rem_1fr]">
      {open ? <button className="fixed inset-0 z-30 bg-black/50 lg:hidden" type="button" aria-label="بستن منو" onClick={() => setOpen(false)} /> : null}
      <aside
        data-open={open ? "true" : "false"}
        className={`fixed inset-y-0 start-0 z-40 flex w-72 flex-col border-e border-line bg-surface transition-transform duration-200 max-lg:data-[open=false]:invisible lg:static lg:visible lg:w-auto ${open ? "translate-x-0" : "pointer-events-none translate-x-full lg:pointer-events-auto lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between px-5 py-6">
          <div>
            <p className="text-xs font-bold text-primary">پاگرد</p>
            <h1 className="mt-1 text-xl font-black">پنل مدیریت</h1>
          </div>
          <button className="theme-toggle grid lg:hidden" type="button" aria-label="بستن منو" onClick={() => setOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {visible.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-bold ${active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-ink"}`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl bg-surface-2 p-3">
          <p className="truncate text-sm font-bold">{fullName(user)}</p>
          <p className="mt-1 text-xs text-muted" dir="ltr">
            {user.mobile}
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-canvas/85 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button className="theme-toggle grid lg:hidden" type="button" aria-label="باز کردن منو" onClick={() => setOpen(true)}>
              <MenuIcon />
            </button>
            <div className="min-w-0">
              <p className="truncate font-black">{current?.label ?? "پنل مدیریت"}</p>
              <p className="truncate text-xs text-muted">{fullName(user)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden size-10 place-items-center rounded-full bg-primary-soft text-sm font-black text-primary sm:grid">{fullName(user).slice(0, 1)}</span>
            <button className="btn btn-ghost px-3 py-2" onClick={() => void logout()} type="button">
              <LogoutIcon className="size-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../_lib/auth";
import { fullName } from "../_lib/api";

const links = [
  { href: "/", label: "داشبورد", permission: null },
  { href: "/users", label: "کاربران", permission: "users.view" },
  { href: "/roles", label: "نقش‌ها", permission: "roles.view" },
  { href: "/bills", label: "قبض‌ها", permission: "bills.view" },
  { href: "/payments", label: "درگاه پرداخت", permission: "payments.view" },
  { href: "/settings", label: "تنظیمات", permission: "settings.manage" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, ready, can, logout } = useAuth();
  const pathname = usePathname();

  if (!ready || !user) {
    return <main className="grid min-h-screen place-items-center text-slate-500">در حال بارگذاری...</main>;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-slate-200 bg-slate-950 text-slate-100 lg:border-b-0 lg:border-l">
        <div className="px-5 py-6">
          <p className="text-sm text-teal-300">پاگرد</p>
          <h1 className="mt-1 text-xl font-bold">پنل مدیریت</h1>
        </div>
        <nav className="flex gap-2 overflow-auto px-3 pb-4 lg:block lg:space-y-1">
          {links
            .filter((link) => !link.permission || can(link.permission))
            .map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-3 py-2 text-sm whitespace-nowrap ${active ? "bg-white text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              );
            })}
        </nav>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="font-bold">{fullName(user)}</p>
            <p className="text-sm text-slate-500">{user.mobile}</p>
          </div>
          <button className="btn btn-ghost" onClick={() => void logout()} type="button">
            خروج
          </button>
        </header>
        <main className="mx-auto max-w-6xl p-5">{children}</main>
      </div>
    </div>
  );
}

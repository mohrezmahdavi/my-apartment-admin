"use client";

import Link from "next/link";
import { apiPaths } from "@/lib/endpoints";
import { faNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/use-query";
import type { DashboardStats } from "@/lib/types";
import { navItems } from "@/components/nav";
import { Alert, PageHeader, Screen } from "@/components/ui";

export default function DashboardPage() {
  const { can, user } = useAuth();
  const stats = useQuery<DashboardStats>(apiPaths.dashboard);
  const shortcuts = navItems.filter((item) => item.href !== "/" && item.description && (!item.permission || can(item.permission)));

  return (
    <Screen>
      <PageHeader title="داشبورد" description={user?.first_name ? `خوش آمدید ${user.first_name}.` : "خوش آمدید."} />
      <Alert kind="error">{stats.error}</Alert>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="card relative overflow-hidden p-5 sm:col-span-2 xl:col-span-1">
          <p className="text-sm text-muted">کاربران ثبت‌شده</p>
          <p className="mt-3 text-5xl font-black tracking-tight">{stats.data ? faNumber(stats.data.users_count) : "—"}</p>
          <div className="pointer-events-none absolute -bottom-10 -left-8 size-36 rounded-full bg-primary/15" />
        </article>
        {shortcuts.map((item) => (
          <Link key={item.href} href={item.href} className="card block p-5 transition hover:-translate-y-0.5">
            <p className="font-black">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
          </Link>
        ))}
      </div>
    </Screen>
  );
}

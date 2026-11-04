"use client";

import Link from "next/link";
import { apiPaths } from "@/lib/endpoints";
import { faNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/use-query";
import type { Role } from "@/lib/types";
import { Alert, Empty, Loading, PageHeader, Screen } from "@/components/ui";

export default function RolesPage() {
  const { can } = useAuth();
  const list = useQuery<{ roles: Role[] }>(apiPaths.roles);
  const roles = list.data?.roles ?? [];

  return (
    <Screen>
      <PageHeader
        title="نقش‌ها"
        description="دسترسی هر نقش را جداگانه تنظیم کنید"
        action={can("roles.manage") ? <Link className="btn btn-primary" href="/roles/new">نقش جدید</Link> : null}
      />
      <Alert kind="error">{list.error}</Alert>
      {list.loading ? <Loading /> : null}
      {!list.loading && !list.error && roles.length === 0 ? <Empty>نقشی ثبت نشده است.</Empty> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <Link key={role.id} href={`/roles/${role.id}`} className="card block p-5 transition hover:-translate-y-0.5">
            <p className="font-black">{role.label || role.name}</p>
            <p className="mt-2 text-sm text-muted" dir="ltr">{role.name}</p>
            <p className="mt-3 text-sm text-muted">
              {faNumber(role.users_count ?? 0)} کاربر · {faNumber(role.permissions_count ?? 0)} دسترسی
            </p>
          </Link>
        ))}
      </div>
    </Screen>
  );
}

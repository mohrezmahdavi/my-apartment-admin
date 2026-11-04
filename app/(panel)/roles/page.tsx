"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Role, api } from "../../_lib/api";
import { useAuth } from "../../_lib/auth";

export default function RolesPage() {
  const { can } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ roles: Role[] }>("/acl-service/v1/roles")
      .then((response) => setRoles(response.items.roles))
      .catch((caught: Error) => setError(caught.message));
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">نقش‌ها</h2>
        {can("roles.manage") ? <Link className="btn btn-primary" href="/roles/new">نقش جدید</Link> : null}
      </div>
      {error ? <p className="text-rose-700">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {roles.map((role) => (
          <Link key={role.id} href={`/roles/${role.id}`} className="card block p-4">
            <p className="font-bold">{role.label || role.name}</p>
            <p className="mt-1 text-sm text-slate-500">{role.name} · {role.users_count ?? 0} کاربر · {role.permissions_count ?? 0} دسترسی</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

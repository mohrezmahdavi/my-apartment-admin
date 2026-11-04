"use client";

import { useEffect, useState } from "react";
import { api } from "../_lib/api";

export default function DashboardPage() {
  const [count, setCount] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ users_count: number }>("/account-service/v1/dashboard")
      .then((response) => setCount(response.items.users_count))
      .catch((caught: Error) => setError(caught.message));
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">داشبورد</h2>
      {error ? <p className="text-rose-700">{error}</p> : null}
      <article className="card max-w-sm p-5">
        <p className="text-sm text-slate-500">تعداد کاربران</p>
        <p className="mt-2 text-4xl font-bold">{count ?? "…"}</p>
      </article>
    </section>
  );
}

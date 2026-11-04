"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { AdminUser, api, fullName } from "../../_lib/api";
import { useAuth } from "../../_lib/auth";

export default function UsersPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [lastPage, setLastPage] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (query) params.set("search", query);
    api<{ users: AdminUser[]; pagination: { last_page: number } }>(`/account-service/v1/users?${params}`)
      .then((response) => {
        setUsers(response.items.users);
        setLastPage(response.items.pagination.last_page);
      })
      .catch((caught: Error) => setError(caught.message));
  }, [page, query]);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold">کاربران</h2>
        {can("users.create") ? (
          <Link className="btn btn-primary" href="/users/new">
            کاربر جدید
          </Link>
        ) : null}
      </div>
      <form className="flex gap-2" onSubmit={onSearch}>
        <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام، موبایل یا ایمیل" />
        <button className="btn btn-ghost" type="submit">جستجو</button>
      </form>
      {error ? <p className="text-rose-700">{error}</p> : null}
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 text-right">نام</th>
              <th className="px-4 py-3 text-right">موبایل</th>
              <th className="px-4 py-3 text-right">ایمیل</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-100">
                <td className="px-4 py-3">
                  <Link className="font-bold text-teal-800" href={`/users/${user.id}`}>{fullName(user)}</Link>
                </td>
                <td className="px-4 py-3">{user.mobile}</td>
                <td className="px-4 py-3">{user.email || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2">
        <button className="btn btn-ghost" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</button>
        <span className="text-sm text-slate-500">صفحه {page} از {lastPage}</span>
        <button className="btn btn-ghost" type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>بعدی</button>
      </div>
    </section>
  );
}

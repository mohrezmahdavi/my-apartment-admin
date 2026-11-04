"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiPaths } from "@/lib/endpoints";
import { faNumber, fullName } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@/lib/use-query";
import type { UserList } from "@/lib/types";
import { Alert, Empty, Loading, PageHeader, Screen } from "@/components/ui";

export default function UsersPage() {
  const { can } = useAuth();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("search", query);
  const list = useQuery<UserList>(apiPaths.users(params.toString()));
  const users = list.data?.users ?? [];
  const lastPage = list.data?.pagination.last_page ?? 1;

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <Screen>
      <PageHeader
        title="کاربران"
        description="جستجو و مدیریت حساب‌ها"
        action={can("users.create") ? <Link className="btn btn-primary" href="/users/new">کاربر جدید</Link> : null}
      />
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
        <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام، موبایل یا ایمیل" />
        <button className="btn btn-ghost sm:w-32" type="submit">جستجو</button>
      </form>
      <Alert kind="error">{list.error}</Alert>
      {list.loading ? <Loading /> : null}
      {!list.loading && !list.error && users.length === 0 ? <Empty>کاربری پیدا نشد.</Empty> : null}
      {users.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {users.map((user) => (
              <Link key={user.id} href={`/users/${user.id}`} className="card block p-4">
                <p className="font-black">{fullName(user)}</p>
                <p className="mt-2 text-sm text-muted" dir="ltr">{user.mobile}</p>
                <p className="mt-1 text-sm text-muted">{user.email || "بدون ایمیل"}</p>
              </Link>
            ))}
          </div>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">نام</th>
                  <th className="px-4 py-3 text-right font-medium">موبایل</th>
                  <th className="px-4 py-3 text-right font-medium">ایمیل</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link className="font-bold text-primary" href={`/users/${user.id}`}>{fullName(user)}</Link>
                    </td>
                    <td className="px-4 py-3" dir="ltr">{user.mobile}</td>
                    <td className="px-4 py-3 text-muted">{user.email || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-ghost" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</button>
        <span className="text-sm text-muted">صفحه {faNumber(page)} از {faNumber(lastPage)}</span>
        <button className="btn btn-ghost" type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>بعدی</button>
      </div>
    </Screen>
  );
}

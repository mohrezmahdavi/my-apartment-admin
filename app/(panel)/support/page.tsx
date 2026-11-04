"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiPaths } from "@/lib/endpoints";
import { faNumber, fullName } from "@/lib/format";
import { useQuery } from "@/lib/use-query";
import type { SupportList } from "@/lib/types";
import { Alert, Empty, Loading, PageHeader, Screen } from "@/components/ui";

export default function SupportQueuePage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("search", query);
  if (status) params.set("status", status);
  if (category) params.set("category", category);
  const list = useQuery<SupportList>(apiPaths.tickets(params.toString()));
  const tickets = list.data?.tickets ?? [];
  const lastPage = list.data?.pagination.last_page ?? 1;

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <Screen>
      <PageHeader title="پشتیبانی" description="درخواست‌های کاربران سایت" />
      <form className="grid gap-2 md:grid-cols-[1fr_10rem_10rem_8rem]" onSubmit={onSearch}>
        <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="موضوع یا موبایل" />
        <select className="field" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
          <option value="">همه وضعیت‌ها</option>
          <option value="open">باز</option>
          <option value="answered">پاسخ‌داده‌شده</option>
          <option value="closed">بسته</option>
        </select>
        <select className="field" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
          <option value="">همه دسته‌ها</option>
          <option value="account">حساب کاربری</option>
          <option value="payment">پرداخت</option>
          <option value="app">اپلیکیشن</option>
          <option value="other">سایر</option>
        </select>
        <button className="btn btn-ghost" type="submit">جستجو</button>
      </form>
      <Alert kind="error">{list.error}</Alert>
      {list.loading ? <Loading /> : null}
      {!list.loading && !list.error && tickets.length === 0 ? <Empty>درخواستی پیدا نشد.</Empty> : null}
      {tickets.length > 0 ? (
        <div className="grid gap-3">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/support/${ticket.id}`} className="card block p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-black">{ticket.subject}</p>
                <span className="text-xs text-muted">{ticket.status_label}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{ticket.preview}</p>
              <p className="mt-3 text-sm">
                {ticket.user ? fullName(ticket.user) : "کاربر"}
                {ticket.user?.mobile ? <span className="mr-2 text-muted" dir="ltr">{ticket.user.mobile}</span> : null}
                <span className="mr-2 text-muted">{ticket.category_label}</span>
              </p>
            </Link>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button className="btn btn-ghost" type="button" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>قبلی</button>
        <span className="text-sm text-muted">صفحه {faNumber(page)} از {faNumber(lastPage)}</span>
        <button className="btn btn-ghost" type="button" disabled={page >= lastPage} onClick={() => setPage((value) => value + 1)}>بعدی</button>
      </div>
    </Screen>
  );
}

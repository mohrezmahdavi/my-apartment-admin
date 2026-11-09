"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { apiPaths } from "@/lib/endpoints";
import { StatusBadge } from "./status";
import { faDate, faNumber, fullName } from "@/lib/format";
import { useQuery } from "@/lib/use-query";
import type { AdminBuildingList } from "@/lib/types";
import { Alert, Empty, Loading, PageHeader, Screen } from "@/components/ui";

export default function BuildingsPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set("search", query);
  const list = useQuery<AdminBuildingList>(apiPaths.buildings(params.toString()));
  const buildings = list.data?.buildings ?? [];
  const lastPage = list.data?.pagination.last_page ?? 1;

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(search);
  }

  return (
    <Screen>
      <PageHeader title="ساختمان‌ها" description="جستجو و مشاهده ساختمان‌های ثبت‌شده" />
      <form className="flex flex-col gap-2 sm:flex-row" onSubmit={onSearch}>
        <input className="field" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="نام یا نشانی" />
        <button className="btn btn-ghost sm:w-32" type="submit">جستجو</button>
      </form>
      <Alert kind="error">{list.error}</Alert>
      {list.loading ? <Loading /> : null}
      {!list.loading && !list.error && buildings.length === 0 ? <Empty>ساختمانی پیدا نشد.</Empty> : null}
      {buildings.length > 0 ? (
        <>
          <div className="grid gap-3 md:hidden">
            {buildings.map((building) => (
              <Link key={building.id} href={`/buildings/${building.id}`} className="card block p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black">{building.name}</p>
                  {building.subscription ? <StatusBadge status={building.subscription.status} label={building.subscription.status_label} /> : null}
                </div>
                <p className="mt-2 text-sm text-muted">{building.address || "بدون نشانی"}</p>
                <p className="mt-1 text-sm">{building.owner ? fullName(building.owner) : "بدون مالک"}</p>
                {building.subscription ? (
                  <p className="mt-1 text-sm text-muted">{building.subscription.plan_name} · تا {faDate(building.subscription.period_ends_at)}</p>
                ) : null}
              </Link>
            ))}
          </div>
          <div className="card hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-2 text-muted">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">نام</th>
                  <th className="px-4 py-3 text-right font-medium">مالک</th>
                  <th className="px-4 py-3 text-right font-medium">واحد</th>
                  <th className="px-4 py-3 text-right font-medium">اعضا</th>
                  <th className="px-4 py-3 text-right font-medium">اشتراک</th>
                </tr>
              </thead>
              <tbody>
                {buildings.map((building) => (
                  <tr key={building.id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <Link className="font-bold text-primary" href={`/buildings/${building.id}`}>{building.name}</Link>
                      <p className="mt-1 text-muted">{building.address || "—"}</p>
                    </td>
                    <td className="px-4 py-3">
                      {building.owner ? (
                        <>
                          <p>{fullName(building.owner)}</p>
                          <p className="text-muted" dir="ltr">{building.owner.mobile}</p>
                        </>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">{faNumber(building.units_count)}</td>
                    <td className="px-4 py-3">{faNumber(building.members_count)}</td>
                    <td className="px-4 py-3">
                      {building.subscription ? (
                        <div className="space-y-1">
                          <StatusBadge status={building.subscription.status} label={building.subscription.status_label} />
                          <p className="text-muted">{building.subscription.plan_name} · تا {faDate(building.subscription.period_ends_at)}</p>
                        </div>
                      ) : "—"}
                    </td>
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

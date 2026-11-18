"use client";

import { useState } from "react";
import { apiPaths } from "@/lib/endpoints";
import { faNumber, fullName } from "@/lib/format";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { WalletSettlementList, WalletSettlementRow } from "@/lib/types";
import { Alert, Empty, Loading, Notices, PageHeader, Screen } from "@/components/ui";

export default function SettlementsPage() {
  const { can } = useAuth();
  const action = useAction();
  const [status, setStatus] = useState("awaiting_payout");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  const list = useQuery<WalletSettlementList>(apiPaths.settlements(params.toString()));
  const rows = list.data?.settlements ?? [];
  const lastPage = list.data?.pagination.last_page ?? 1;

  async function pay(row: WalletSettlementRow) {
    await action.run(async () => {
      const response = await http.post<WalletSettlementRow>(apiPaths.settlementPay(row.id));
      list.reload();
      return response.message;
    }, "واریز ثبت نشد.");
  }

  async function reject(row: WalletSettlementRow) {
    await action.run(async () => {
      const response = await http.post<WalletSettlementRow>(apiPaths.settlementReject(row.id), {
        reason: "درخواست تسویه رد شد.",
      });
      list.reload();
      return response.message;
    }, "رد انجام نشد.");
  }

  return (
    <Screen>
      <PageHeader title="تسویه کیف پول" description="بعد از تطبیق کارت و شبا با کد ملی، واریز را اینجا ثبت کنید." />
      <Notices message={action.message} error={action.error} />
      <select
        className="field max-w-xs"
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setPage(1);
        }}
        aria-label="وضعیت"
      >
        <option value="">همه</option>
        <option value="pending_inquiry">در حال بررسی حساب</option>
        <option value="awaiting_payout">در انتظار واریز</option>
        <option value="paid">واریز شد</option>
        <option value="rejected">رد شد</option>
      </select>
      <Alert kind="error">{list.error}</Alert>
      {list.loading ? <Loading /> : null}
      {!list.loading && !list.error && rows.length === 0 ? <Empty>درخواستی پیدا نشد.</Empty> : null}
      {rows.length > 0 ? (
        <div className="grid gap-3">
          {rows.map((row) => (
            <article key={row.id} className="card space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black">{row.user ? fullName(row.user) : "کاربر"}</p>
                  <p className="mt-1 text-sm text-muted" dir="ltr">{row.user?.mobile}</p>
                </div>
                <span className="text-xs text-muted">{row.status_label}</span>
              </div>
              <p className="text-lg font-black">{faNumber(row.amount)} تومان</p>
              <p className="text-sm" dir="ltr">{row.card_number}</p>
              <p className="text-sm" dir="ltr">{row.iban}</p>
              {row.rejection_reason ? <p className="text-sm text-muted">{row.rejection_reason}</p> : null}
              {can("wallet.adjust") && row.status === "awaiting_payout" ? (
                <div className="flex flex-wrap gap-2">
                  <button className="btn btn-primary" type="button" disabled={action.pending} onClick={() => void pay(row)}>ثبت واریز</button>
                  <button className="btn btn-ghost" type="button" disabled={action.pending} onClick={() => void reject(row)}>رد</button>
                </div>
              ) : null}
            </article>
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

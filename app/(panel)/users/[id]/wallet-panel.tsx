"use client";

import { FormEvent, useState } from "react";
import { applyAmountGrouping, faNumber } from "@/lib/format";
import { field, numberField, optionalField } from "@/lib/form";
import { DEPOSIT, type WalletSnapshot } from "@/lib/types";

export function WalletPanel({ wallet, adjustable, onPage, onSubmit }: { wallet: WalletSnapshot; adjustable: boolean; onPage?: (page: number) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <div className="card space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-black">کیف پول</h3>
        <p className="text-lg font-black">{wallet.wallet ? `${faNumber(wallet.wallet.balance)} ریال` : "کیف پول ندارد"}</p>
      </div>
      {adjustable && wallet.wallet ? (
        <form className="grid gap-2 md:grid-cols-4" onSubmit={onSubmit}>
          <select className="field" name="type" defaultValue="deposit" aria-label="نوع تراکنش">
            <option value="deposit">واریز</option>
            <option value="withdraw">برداشت</option>
          </select>
          <input className="field" name="amount" dir="ltr" inputMode="numeric" placeholder="مبلغ" required onInput={(event) => applyAmountGrouping(event.currentTarget)} />
          <input className="field" name="description" placeholder="توضیح" />
          <button className="btn btn-primary" type="submit">ثبت</button>
        </form>
      ) : null}
      <ul className="space-y-2 text-sm">
        {wallet.transactions.length === 0 ? <li className="text-muted">تراکنشی ثبت نشده است.</li> : null}
        {wallet.transactions.map((transaction) => (
          <li key={transaction.id} className="flex items-center justify-between gap-3 border-t border-line pt-2">
            <span>
              {transaction.type === DEPOSIT ? "واریز" : "برداشت"}
              {transaction.description ? ` · ${transaction.description}` : ""}
            </span>
            <span className="font-bold">{faNumber(transaction.amount)}</span>
          </li>
        ))}
      </ul>
      {wallet.pagination && wallet.pagination.last_page > 1 && onPage ? (
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn btn-ghost" type="button" disabled={wallet.pagination.current_page <= 1} onClick={() => onPage(wallet.pagination!.current_page - 1)}>قبلی</button>
          <span className="text-sm text-muted">صفحه {faNumber(wallet.pagination.current_page)} از {faNumber(wallet.pagination.last_page)}</span>
          <button className="btn btn-ghost" type="button" disabled={wallet.pagination.current_page >= wallet.pagination.last_page} onClick={() => onPage(wallet.pagination!.current_page + 1)}>بعدی</button>
        </div>
      ) : null}
    </div>
  );
}

export function walletPayload(form: FormData) {
  return {
    type: field(form, "type"),
    amount: numberField(form, "amount"),
    description: optionalField(form, "description"),
  };
}

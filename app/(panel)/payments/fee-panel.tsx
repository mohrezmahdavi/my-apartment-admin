"use client";

import type { FormEvent } from "react";
import { Field, SelectField } from "@/components/ui";
import { faNumber } from "@/lib/format";
import { field, isChecked, numberField } from "@/lib/form";
import { DEPOSIT, type GatewayFeeRule, type GatewayFeeSnapshot } from "@/lib/types";

export function FeeSettingsForm({
  scope,
  title,
  description,
  fee,
  manageable,
  onSubmit,
}: {
  scope: "charge" | "wallet" | "bill";
  title: string;
  description: string;
  fee: GatewayFeeRule;
  manageable: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form key={`${scope}-${JSON.stringify(fee)}`} className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={onSubmit}>
      <h3 className="font-black md:col-span-2">{title}</h3>
      <p className="text-sm leading-6 text-muted md:col-span-2">{description}</p>
      <label className="check md:col-span-2">
        <input name={`${scope}_enabled`} type="checkbox" defaultChecked={fee.enabled} disabled={!manageable} />
        فعال
      </label>
      <SelectField label="نوع" name={`${scope}_type`} defaultValue={fee.type} disabled={!manageable}>
        <option value="flat">مبلغ ثابت</option>
        <option value="percent">درصدی</option>
      </SelectField>
      <Field label="مقدار" name={`${scope}_value`} type="number" min={0} defaultValue={fee.value} disabled={!manageable} />
      <Field label="حداقل کارمزد (تومان)" name={`${scope}_min_amount`} type="number" min={0} defaultValue={fee.min_amount} disabled={!manageable} className="md:col-span-2" />
      {manageable ? <button className="btn btn-primary md:w-fit" type="submit">ذخیره کارمزد</button> : null}
    </form>
  );
}

export function feePayload(form: FormData, scope: "charge" | "wallet" | "bill") {
  return {
    [scope]: {
      enabled: isChecked(form, `${scope}_enabled`),
      type: field(form, `${scope}_type`),
      value: numberField(form, `${scope}_value`),
      min_amount: numberField(form, `${scope}_min_amount`),
    },
  };
}

export function PlatformWalletPanel({
  snapshot,
  adjustable,
  onSubmit,
}: {
  snapshot: GatewayFeeSnapshot;
  adjustable: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="card space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-black">کیف کارمزد</h3>
        <p className="text-lg font-black">{faNumber(snapshot.wallet.balance)} تومان</p>
      </div>
      {adjustable ? (
        <form className="grid gap-2 md:grid-cols-4" onSubmit={onSubmit}>
          <select className="field" name="type" defaultValue="withdraw" aria-label="نوع تراکنش">
            <option value="withdraw">برداشت</option>
            <option value="deposit">واریز اصلاحی</option>
          </select>
          <input className="field" name="amount" type="number" min={1} placeholder="مبلغ" required />
          <input className="field" name="description" placeholder="توضیح" required />
          <button className="btn btn-primary" type="submit">ثبت</button>
        </form>
      ) : null}
      <ul className="space-y-2 text-sm">
        {snapshot.transactions.length === 0 ? <li className="text-muted">تراکنشی ثبت نشده است.</li> : null}
        {snapshot.transactions.map((transaction) => (
          <li key={transaction.id} className="flex items-center justify-between gap-3 border-t border-line pt-2">
            <span>
              {transaction.type === DEPOSIT ? "واریز" : "برداشت"}
              {transaction.description ? ` · ${transaction.description}` : ""}
            </span>
            <span className="font-bold">{faNumber(transaction.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function platformWalletPayload(form: FormData) {
  return {
    type: field(form, "type"),
    amount: numberField(form, "amount"),
    description: field(form, "description"),
  };
}

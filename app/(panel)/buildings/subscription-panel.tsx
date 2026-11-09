"use client";

import { FormEvent, useState } from "react";
import { StatusBadge } from "./status";
import { Field, SelectField } from "@/components/ui";
import { faDate, toman } from "@/lib/format";
import type { BuildingSubscriptionRow, SubscriptionPlan } from "@/lib/types";

export function SubscriptionPanel({
  subscription,
  plans,
  manage,
  pending,
  onAssign,
  onExtend,
  onWaive,
}: {
  subscription: BuildingSubscriptionRow;
  plans: SubscriptionPlan[];
  manage: boolean;
  pending: boolean;
  onAssign: (planId: number) => void;
  onExtend: (days: number) => void;
  onWaive: () => void;
}) {
  const [days, setDays] = useState("30");

  function assign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const planId = Number(new FormData(event.currentTarget).get("plan_id"));
    if (planId) onAssign(planId);
  }

  function extend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onExtend(Number(days));
  }

  return (
    <section className="card space-y-5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black">اشتراک</h3>
          <p className="mt-1 text-sm text-muted">تا {faDate(subscription.period_ends_at)}</p>
        </div>
        <StatusBadge status={subscription.status} label={subscription.status_label} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-sm text-muted">پلن</p>
          <p className="mt-1 font-black">{subscription.plan.name}</p>
        </div>
        <div>
          <p className="text-sm text-muted">مبلغ دوره</p>
          <p className="mt-1 font-black">{toman(subscription.plan.monthly_amount)}</p>
        </div>
      </div>
      {manage ? (
        <div className="grid gap-4 border-t border-line pt-4">
          <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={assign}>
            <SelectField label="تغییر پلن" name="plan_id" defaultValue={String(subscription.plan.id)}>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </SelectField>
            <button className="btn btn-primary" type="submit" disabled={pending}>اعمال پلن</button>
          </form>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end" onSubmit={extend}>
            <Field label="تمدید (روز)" value={days} onChange={(event) => setDays(event.target.value)} />
            <button className="btn btn-ghost" type="submit" disabled={pending}>تمدید دوره</button>
          </form>
          <button
            className="btn btn-ghost w-fit"
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("این دوره بدون پرداخت فعال شود؟")) onWaive();
            }}
          >
            بخشش دوره جاری
          </button>
        </div>
      ) : null}
    </section>
  );
}

import { FormEvent } from "react";
import { Field, MoneyField } from "@/components/ui";
import { faNumber, periodLabel, toman } from "@/lib/format";
import { numberField, field, isChecked } from "@/lib/form";
import type { SubscriptionPlan } from "@/lib/types";

export function planPayload(form: FormData) {
  return {
    name: field(form, "name"),
    monthly_amount: numberField(form, "monthly_amount"),
    period_days: numberField(form, "period_days"),
    grace_days: numberField(form, "grace_days"),
    is_default: isChecked(form, "is_default"),
    is_active: isChecked(form, "is_active"),
  };
}

export function PlanCard({
  plan,
  manage,
  pending,
  onSave,
  onRemove,
}: {
  plan: SubscriptionPlan;
  manage: boolean;
  pending: boolean;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <form key={`${plan.id}-${plan.name}-${plan.is_default}-${plan.is_active}`} className="card space-y-4 p-5" onSubmit={onSave}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted">
            {toman(plan.monthly_amount)} · {periodLabel(plan.period_days)} · مهلت {faNumber(plan.grace_days)} روز
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {plan.is_default ? <span className="rounded-full bg-primary-soft px-2.5 py-1 text-xs font-bold text-primary">پیش‌فرض ساختمان جدید</span> : null}
          {plan.is_active ? null : <span className="rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">غیرفعال</span>}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="نام" name="name" defaultValue={plan.name} required disabled={!manage} />
        <MoneyField label="مبلغ دوره (تومان)" name="monthly_amount" defaultValue={plan.monthly_amount} required disabled={!manage} />
        <Field label="مدت دوره (روز)" name="period_days" defaultValue={String(plan.period_days)} required disabled={!manage} />
        <Field label="مهلت بعد از سررسید (روز)" name="grace_days" defaultValue={String(plan.grace_days)} required disabled={!manage} />
        <label className="check">
          <input type="checkbox" name="is_default" defaultChecked={plan.is_default} disabled={!manage} />
          به ساختمان‌های جدید داده شود
        </label>
        <label className="check">
          <input type="checkbox" name="is_active" defaultChecked={plan.is_active} disabled={!manage} />
          قابل انتخاب
        </label>
      </div>
      <p className="text-sm leading-6 text-muted">مدت صفر یعنی یک ماه شمسی. مبلغ صفر یعنی دوره رایگان.</p>
      {manage ? (
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" type="submit" disabled={pending}>ذخیره پلن</button>
          {!plan.is_default ? (
            <button className="btn btn-danger" type="button" disabled={pending} onClick={() => onRemove(plan.id)}>حذف</button>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

export function NewPlanForm({ pending, onSave }: { pending: boolean; onSave: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={onSave}>
      <h3 className="font-black md:col-span-2">پلن جدید</h3>
      <Field label="نام" name="name" required />
      <MoneyField label="مبلغ دوره (تومان)" name="monthly_amount" defaultValue={50000} required />
      <Field label="مدت دوره (روز)" name="period_days" defaultValue="0" required />
      <Field label="مهلت بعد از سررسید (روز)" name="grace_days" defaultValue="7" required />
      <label className="check">
        <input type="checkbox" name="is_default" />
        به ساختمان‌های جدید داده شود
      </label>
      <label className="check">
        <input type="checkbox" name="is_active" defaultChecked />
        قابل انتخاب
      </label>
      <button className="btn btn-primary md:w-fit" type="submit" disabled={pending}>افزودن پلن</button>
    </form>
  );
}

"use client";

import { FormEvent } from "react";
import { Empty, Field, Loading, MoneyField, Notices, PageHeader, Screen } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { faNumber, toman } from "@/lib/format";
import { field, isChecked, numberField } from "@/lib/form";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { SmsPackage } from "@/lib/types";

function payload(form: FormData) {
  return {
    code: field(form, "code"),
    label: field(form, "label"),
    credits: numberField(form, "credits"),
    amount: numberField(form, "amount"),
    sort: numberField(form, "sort"),
    is_active: isChecked(form, "is_active"),
  };
}

export default function SmsPackagesPage() {
  const { can } = useAuth();
  const manage = can("sms_packages.manage");
  const packages = useQuery<{ packages: SmsPackage[] }>(can("sms_packages.view") ? apiPaths.smsPackages : null);
  const action = useAction();
  const rows = packages.data?.packages ?? [];

  async function save(event: FormEvent<HTMLFormElement>, pack?: SmsPackage) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = payload(new FormData(form));
    await action.run(async () => {
      const response = pack
        ? await http.put(apiPaths.smsPackage(pack.id), body)
        : await http.post(apiPaths.smsPackages, body);
      packages.reload();
      if (!pack) form.reset();
      return response.message;
    }, "ذخیره بسته انجام نشد.");
  }

  async function remove(id: number) {
    if (!confirm("این بسته حذف شود؟")) return;
    await action.run(async () => {
      const response = await http.delete(apiPaths.smsPackage(id));
      packages.reload();
      return response.message;
    }, "حذف بسته انجام نشد.");
  }

  return (
    <Screen>
      <PageHeader title="بسته‌های پیامک" description="بسته‌های فعال در صفحهٔ صورتحساب ساختمان برای خرید مدیر نشان داده می‌شوند. قیمت به تومان است." />
      <Notices message={action.message} error={action.error || packages.error} />
      {packages.loading && rows.length === 0 ? <Loading /> : null}
      {!packages.loading && rows.length === 0 ? <Empty>بسته‌ای تعریف نشده است.</Empty> : null}
      {rows.map((pack) => (
        <form key={`${pack.id}-${pack.code}-${pack.is_active}`} className="card space-y-4 p-5" onSubmit={(event) => void save(event, pack)}>
          <div>
            <h3 className="text-lg font-black">{pack.label}</h3>
            <p className="mt-1 text-sm text-muted">{faNumber(pack.credits)} پیامک · {toman(pack.amount)}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="شناسه" name="code" defaultValue={pack.code} required disabled={!manage} />
            <Field label="عنوان" name="label" defaultValue={pack.label} required disabled={!manage} />
            <Field label="تعداد پیامک" name="credits" defaultValue={String(pack.credits)} required disabled={!manage} />
            <MoneyField label="قیمت (تومان)" name="amount" defaultValue={pack.amount} required disabled={!manage} />
            <Field label="ترتیب نمایش" name="sort" defaultValue={String(pack.sort)} required disabled={!manage} />
            <label className="check">
              <input type="checkbox" name="is_active" defaultChecked={pack.is_active} disabled={!manage} />
              قابل خرید
            </label>
          </div>
          {manage ? (
            <div className="flex flex-wrap gap-2">
              <button className="btn btn-primary" type="submit" disabled={action.pending}>ذخیره بسته</button>
              <button className="btn btn-danger" type="button" disabled={action.pending} onClick={() => void remove(pack.id)}>حذف</button>
            </div>
          ) : null}
        </form>
      ))}
      {manage ? (
        <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={(event) => void save(event)}>
          <h3 className="font-black md:col-span-2">بسته جدید</h3>
          <Field label="شناسه" name="code" required />
          <Field label="عنوان" name="label" required />
          <Field label="تعداد پیامک" name="credits" defaultValue="100" required />
          <MoneyField label="قیمت (تومان)" name="amount" defaultValue={35000} required />
          <Field label="ترتیب نمایش" name="sort" defaultValue="10" required />
          <label className="check">
            <input type="checkbox" name="is_active" defaultChecked />
            قابل خرید
          </label>
          <button className="btn btn-primary md:w-fit" type="submit" disabled={action.pending}>افزودن بسته</button>
        </form>
      ) : null}
    </Screen>
  );
}

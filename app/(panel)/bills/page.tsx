"use client";

import { FormEvent } from "react";
import { SelectField, Notices, PageHeader, Screen } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { field, isChecked, numberField } from "@/lib/form";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { BillProviders, FinnotechStatus } from "@/lib/types";

export default function BillsPage() {
  const { can } = useAuth();
  const providers = useQuery<BillProviders>(apiPaths.billProviders);
  const action = useAction();
  const manageable = can("bills.manage");
  const finnotech = providers.data?.finnotech;

  async function save(event: FormEvent<HTMLFormElement>, billType: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.put(apiPaths.billProvider(billType), {
        driver: field(form, "driver"),
        is_active: isChecked(form, "is_active"),
        fee_enabled: isChecked(form, "fee_enabled"),
        fee_type: field(form, "fee_type"),
        fee_value: numberField(form, "fee_value"),
        min_fee_amount: numberField(form, "min_fee_amount"),
      });
      providers.reload();
      return response.message;
    }, "ذخیره انجام نشد.");
  }

  async function refreshCache() {
    await action.run(async () => (await http.post(apiPaths.billCache)).message, "بازسازی کش انجام نشد.");
  }

  async function generateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.post<{ finnotech: FinnotechStatus }>(apiPaths.finnotechToken, {
        client_secret: field(form, "client_secret") || null,
        nid: field(form, "nid") || null,
      });
      if (providers.data) providers.setData({ ...providers.data, finnotech: response.items.finnotech });
      return response.message;
    }, "ساخت توکن انجام نشد.");
  }

  return (
    <Screen>
      <PageHeader
        title="سرویس استعلام قبض"
        description="سرویس‌دهنده، کارمزد و توکن فینوتک"
        action={manageable ? <button className="btn btn-ghost" type="button" onClick={() => void refreshCache()}>بازسازی کش</button> : null}
      />
      <Notices message={action.message} error={action.error || providers.error} />
      {(providers.data?.rows ?? []).map((row) => (
        <form key={`${row.bill_type}-${JSON.stringify(row.current)}`} className="card grid gap-3 p-5 md:grid-cols-3" onSubmit={(event) => void save(event, row.bill_type)}>
          <h3 className="font-black md:col-span-3">{row.label}</h3>
          <SelectField label="سرویس‌دهنده" name="driver" defaultValue={row.current?.driver} disabled={!manageable}>
            {row.available_drivers.map((driver) => (
              <option key={driver.key} value={driver.key}>{driver.label}</option>
            ))}
          </SelectField>
          <SelectField label="نوع کارمزد" name="fee_type" defaultValue={row.current?.fee_type ?? "flat"} disabled={!manageable}>
            <option value="flat">مبلغ ثابت</option>
            <option value="percent">درصدی</option>
          </SelectField>
          <label className="space-y-1.5 text-sm font-medium">
            <span>مقدار کارمزد</span>
            <input className="field" name="fee_value" type="number" defaultValue={row.current?.fee_value ?? 0} disabled={!manageable} />
          </label>
          <label className="space-y-1.5 text-sm font-medium">
            <span>حداقل کارمزد</span>
            <input className="field" name="min_fee_amount" type="number" defaultValue={row.current?.min_fee_amount ?? 0} disabled={!manageable} />
          </label>
          <label className="check"><input name="is_active" type="checkbox" defaultChecked={row.current?.is_active} disabled={!manageable} /> فعال</label>
          <label className="check"><input name="fee_enabled" type="checkbox" defaultChecked={row.current?.fee_enabled} disabled={!manageable} /> کارمزد</label>
          {manageable ? <button className="btn btn-primary md:col-span-3 md:w-fit" type="submit">ذخیره</button> : null}
        </form>
      ))}
      {manageable ? (
        <form className="card space-y-3 p-5" onSubmit={generateToken}>
          <h3 className="font-black">توکن فینوتک</h3>
          <p className="text-sm text-muted">{finnotechStatus(finnotech)}</p>
          <input className="field" name="client_secret" dir="ltr" placeholder="client secret" />
          <input className="field" name="nid" dir="ltr" placeholder="کد ملی" />
          <button className="btn btn-primary" type="submit">ساخت توکن</button>
        </form>
      ) : null}
    </Screen>
  );
}

function finnotechStatus(finnotech: FinnotechStatus | undefined) {
  if (!finnotech?.has_access_token) return "توکن فعالی ذخیره نشده است.";
  return `توکن موجود است${finnotech.expires_label ? ` تا ${finnotech.expires_label}` : ""}`;
}

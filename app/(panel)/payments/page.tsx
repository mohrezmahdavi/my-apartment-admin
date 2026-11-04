"use client";

import { FormEvent } from "react";
import { Alert, Loading, Notices, PageHeader, Screen, SelectField } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { field, isChecked } from "@/lib/form";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { GatewaySettings } from "@/lib/types";

export default function PaymentsPage() {
  const { can } = useAuth();
  const gateway = useQuery<GatewaySettings>(apiPaths.gateway);
  const action = useAction();
  const payload = gateway.data;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.put<GatewaySettings>(apiPaths.gateway, {
        driver: field(form, "driver"),
        is_active: isChecked(form, "is_active"),
      });
      gateway.setData(response.items);
      return response.message;
    }, "ذخیره انجام نشد.");
  }

  async function refreshCache() {
    await action.run(async () => (await http.post(apiPaths.gatewayCache)).message, "بازسازی کش انجام نشد.");
  }

  if (!payload) return gateway.error ? <Alert kind="error">{gateway.error}</Alert> : <Loading />;

  return (
    <Screen narrow>
      <PageHeader title="درگاه پرداخت" description="سرویس‌دهنده فعال پرداخت را انتخاب کنید" />
      <Notices message={action.message} error={action.error} />
      <form key={`${payload.current?.driver}-${payload.current?.is_active}`} className="card space-y-3 p-5" onSubmit={onSubmit}>
        <SelectField label="سرویس‌دهنده" name="driver" defaultValue={payload.current?.driver} disabled={!can("payments.manage")}>
          {payload.drivers.map((driver) => (
            <option key={driver.key} value={driver.key}>{driver.label}</option>
          ))}
        </SelectField>
        <label className="check">
          <input name="is_active" type="checkbox" defaultChecked={payload.current?.is_active ?? true} disabled={!can("payments.manage")} />
          فعال
        </label>
        {can("payments.manage") ? (
          <div className="flex flex-wrap gap-2">
            <button className="btn btn-primary" type="submit">ذخیره</button>
            <button className="btn btn-ghost" type="button" onClick={() => void refreshCache()}>بازسازی کش</button>
          </div>
        ) : null}
      </form>
    </Screen>
  );
}

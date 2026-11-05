"use client";

import { FormEvent } from "react";
import { FeeSettingsForm, PlatformWalletPanel, feePayload, platformWalletPayload } from "./fee-panel";
import { Alert, Loading, Notices, PageHeader, Screen, SelectField } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { field, isChecked } from "@/lib/form";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { GatewayFeeSnapshot, GatewaySettings } from "@/lib/types";

export default function PaymentsPage() {
  const { can } = useAuth();
  const gateway = useQuery<GatewaySettings>(apiPaths.gateway);
  const fee = useQuery<GatewayFeeSnapshot>(apiPaths.paymentFee);
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

  async function saveFee(event: FormEvent<HTMLFormElement>, scope: "charge" | "wallet" | "bill") {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.put<GatewayFeeSnapshot>(apiPaths.paymentFee, feePayload(form, scope));
      fee.setData(response.items);
      return response.message;
    }, "ذخیره کارمزد انجام نشد.");
  }

  async function adjustWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = platformWalletPayload(new FormData(form));
    await action.run(async () => {
      const response = await http.post<GatewayFeeSnapshot>(apiPaths.paymentFeeAdjust, body);
      fee.setData(response.items);
      form.reset();
      return response.message;
    }, "تغییر موجودی انجام نشد.");
  }

  async function refreshCache() {
    await action.run(async () => (await http.post(apiPaths.gatewayCache)).message, "بازسازی کش انجام نشد.");
  }

  if (!payload) return gateway.error ? <Alert kind="error">{gateway.error}</Alert> : <Loading />;

  return (
    <Screen>
      <PageHeader title="درگاه پرداخت" description="سرویس‌دهنده فعال و سه کارمزد جدا" />
      <Notices message={action.message} error={action.error || fee.error} />
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
      {fee.data ? (
        <>
          <FeeSettingsForm
            scope="bill"
            title="کارمزد پرداخت قبض"
            description="چون مبلغ قبض در درگاه باید با شناسه پرداخت یکی باشد، این کارمزد بعد از پرداخت موفق از کیف پول ساکن برداشته می‌شود."
            fee={fee.data.fees.bill}
            manageable={can("payments.manage")}
            onSubmit={(event) => void saveFee(event, "bill")}
          />
          <FeeSettingsForm
            scope="wallet"
            title="کارمزد شارژ کیف پول"
            description="فقط وقتی ساکن از درگاه موجودی کیف پول را زیاد کند."
            fee={fee.data.fees.wallet}
            manageable={can("payments.manage")}
            onSubmit={(event) => void saveFee(event, "wallet")}
          />
          <FeeSettingsForm
            scope="charge"
            title="کارمزد پرداخت شارژ ساختمان"
            description="فقط وقتی ساکن سهم صورتحساب ساختمان را از درگاه پرداخت کند. پرداخت همان سهم با کیف پول این کارمزد را ندارد."
            fee={fee.data.fees.charge}
            manageable={can("payments.manage")}
            onSubmit={(event) => void saveFee(event, "charge")}
          />
          <PlatformWalletPanel snapshot={fee.data} adjustable={can("payments.manage")} onSubmit={adjustWallet} />
        </>
      ) : null}
    </Screen>
  );
}

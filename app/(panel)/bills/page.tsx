"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "../../_lib/api";
import { useAuth } from "../../_lib/auth";

interface BillRow {
  bill_type: string;
  label: string;
  current: {
    driver: string;
    is_active: boolean;
    fee_enabled: boolean;
    fee_type: string;
    fee_value: number;
    min_fee_amount: number;
  } | null;
  available_drivers: { key: string; label: string }[];
}

interface Finnotech {
  client_id?: string;
  has_access_token?: boolean;
  has_refresh_token?: boolean;
  has_secret?: boolean;
  has_nid?: boolean;
  expires_label?: string | null;
}

export default function BillsPage() {
  const { can } = useAuth();
  const [rows, setRows] = useState<BillRow[]>([]);
  const [finnotech, setFinnotech] = useState<Finnotech | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function load() {
    api<{ rows: BillRow[]; finnotech: Finnotech }>("/bill-service/v1/providers")
      .then((response) => {
        setRows(response.items.rows);
        setFinnotech(response.items.finnotech);
      })
      .catch((caught: Error) => setError(caught.message));
  }

  useEffect(load, []);

  async function save(event: FormEvent<HTMLFormElement>, billType: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      const response = await api(`/bill-service/v1/providers/${billType}`, {
        method: "PUT",
        body: JSON.stringify({
          driver: form.get("driver"),
          is_active: form.get("is_active") === "on",
          fee_enabled: form.get("fee_enabled") === "on",
          fee_type: form.get("fee_type"),
          fee_value: Number(form.get("fee_value") || 0),
          min_fee_amount: Number(form.get("min_fee_amount") || 0),
        }),
      });
      setMessage(response.message);
      load();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره انجام نشد.");
    }
  }

  async function refreshCache() {
    const response = await api("/bill-service/v1/providers/refresh-cache", { method: "POST" });
    setMessage(response.message);
  }

  async function generateToken(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<{ finnotech: Finnotech }>("/bill-service/v1/finnotech-token", {
        method: "POST",
        body: JSON.stringify({
          client_secret: form.get("client_secret") || null,
          nid: form.get("nid") || null,
        }),
      });
      setFinnotech(response.items.finnotech);
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ساخت توکن انجام نشد.");
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">سرویس استعلام قبض</h2>
        {can("bills.manage") ? <button className="btn btn-ghost" type="button" onClick={() => void refreshCache()}>بازسازی کش</button> : null}
      </div>
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {rows.map((row) => (
        <form key={row.bill_type} className="card grid gap-3 p-5 md:grid-cols-3" onSubmit={(event) => void save(event, row.bill_type)}>
          <h3 className="font-bold md:col-span-3">{row.label}</h3>
          <select className="field" name="driver" defaultValue={row.current?.driver} disabled={!can("bills.manage")}>
            {row.available_drivers.map((driver) => (
              <option key={driver.key} value={driver.key}>{driver.label}</option>
            ))}
          </select>
          <select className="field" name="fee_type" defaultValue={row.current?.fee_type ?? "flat"} disabled={!can("bills.manage")}>
            <option value="flat">مبلغ ثابت</option>
            <option value="percent">درصدی</option>
          </select>
          <input className="field" name="fee_value" type="number" defaultValue={row.current?.fee_value ?? 0} disabled={!can("bills.manage")} />
          <input className="field" name="min_fee_amount" type="number" defaultValue={row.current?.min_fee_amount ?? 0} disabled={!can("bills.manage")} />
          <label className="flex items-center gap-2 text-sm"><input name="is_active" type="checkbox" defaultChecked={row.current?.is_active} disabled={!can("bills.manage")} /> فعال</label>
          <label className="flex items-center gap-2 text-sm"><input name="fee_enabled" type="checkbox" defaultChecked={row.current?.fee_enabled} disabled={!can("bills.manage")} /> کارمزد</label>
          {can("bills.manage") ? <button className="btn btn-primary" type="submit">ذخیره</button> : null}
        </form>
      ))}
      {can("bills.manage") ? (
        <form className="card space-y-3 p-5" onSubmit={generateToken}>
          <h3 className="font-bold">توکن فینوتک</h3>
          <p className="text-sm text-slate-500">
            {finnotech?.has_access_token ? `توکن موجود است${finnotech.expires_label ? ` تا ${finnotech.expires_label}` : ""}` : "توکن فعالی ذخیره نشده است."}
          </p>
          <input className="field" name="client_secret" placeholder="client secret" />
          <input className="field" name="nid" placeholder="کد ملی" />
          <button className="btn btn-primary" type="submit">ساخت توکن</button>
        </form>
      ) : null}
    </section>
  );
}

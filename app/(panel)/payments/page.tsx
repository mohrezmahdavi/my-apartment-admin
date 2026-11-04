"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "../../_lib/api";
import { useAuth } from "../../_lib/auth";

interface GatewayPayload {
  drivers: { key: string; label: string }[];
  current: { driver: string; is_active: boolean } | null;
}

export default function PaymentsPage() {
  const { can } = useAuth();
  const [payload, setPayload] = useState<GatewayPayload | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function load() {
    api<GatewayPayload>("/payment-service/v1/gateway")
      .then((response) => setPayload(response.items))
      .catch((caught: Error) => setError(caught.message));
  }

  useEffect(load, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<GatewayPayload>("/payment-service/v1/gateway", {
        method: "PUT",
        body: JSON.stringify({
          driver: form.get("driver"),
          is_active: form.get("is_active") === "on",
        }),
      });
      setPayload(response.items);
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره انجام نشد.");
    }
  }

  async function refreshCache() {
    const response = await api("/payment-service/v1/gateway/refresh-cache", { method: "POST" });
    setMessage(response.message);
  }

  if (!payload) return <p className="text-slate-500">{error || "در حال بارگذاری..."}</p>;

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">درگاه پرداخت</h2>
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <form className="card space-y-3 p-5" onSubmit={onSubmit}>
        <select className="field" name="driver" defaultValue={payload.current?.driver} disabled={!can("payments.manage")}>
          {payload.drivers.map((driver) => (
            <option key={driver.key} value={driver.key}>{driver.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input name="is_active" type="checkbox" defaultChecked={payload.current?.is_active ?? true} disabled={!can("payments.manage")} />
          فعال
        </label>
        {can("payments.manage") ? (
          <div className="flex gap-2">
            <button className="btn btn-primary" type="submit">ذخیره</button>
            <button className="btn btn-ghost" type="button" onClick={() => void refreshCache()}>بازسازی کش</button>
          </div>
        ) : null}
      </form>
    </section>
  );
}

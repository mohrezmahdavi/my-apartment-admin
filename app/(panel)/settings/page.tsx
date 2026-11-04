"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError, api } from "../../_lib/api";

const methods = [
  { value: "password", label: "فقط رمز عبور" },
  { value: "otp", label: "فقط کد یکبارمصرف" },
  { value: "both", label: "هر دو روش" },
];

export default function SettingsPage() {
  const [method, setMethod] = useState("both");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ auth_method: string }>("/setting-service/v1/settings")
      .then((response) => setMethod(response.items.auth_method))
      .catch((caught: Error) => setError(caught.message));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const response = await api("/setting-service/v1/settings", {
        method: "PATCH",
        body: JSON.stringify({ auth_method: method }),
      });
      setMessage(response.message);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره انجام نشد.");
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">تنظیمات ورود</h2>
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <form className="card space-y-3 p-5" onSubmit={onSubmit}>
        {methods.map((item) => (
          <label key={item.value} className="flex items-center gap-2">
            <input type="radio" name="auth_method" checked={method === item.value} onChange={() => setMethod(item.value)} />
            {item.label}
          </label>
        ))}
        <button className="btn btn-primary" type="submit">ذخیره</button>
      </form>
    </section>
  );
}

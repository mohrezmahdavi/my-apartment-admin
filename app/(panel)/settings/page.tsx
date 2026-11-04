"use client";

import { FormEvent, useState } from "react";
import { Notices, PageHeader, Screen } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { http } from "@/lib/http";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { AuthSettings } from "@/lib/types";

const methods = [
  { value: "password", label: "فقط رمز عبور", text: "ورود اپلیکیشن فقط با رمز عبور انجام می‌شود." },
  { value: "otp", label: "فقط کد یکبارمصرف", text: "ورود اپلیکیشن فقط با کد پیامکی انجام می‌شود." },
  { value: "both", label: "هر دو روش", text: "کاربر می‌تواند رمز عبور یا کد پیامکی را انتخاب کند." },
];

export default function SettingsPage() {
  const settings = useQuery<AuthSettings>(apiPaths.settings);
  const action = useAction();
  const [method, setMethod] = useState<string | null>(null);
  const current = method ?? settings.data?.auth_method ?? "both";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await action.run(async () => (await http.patch(apiPaths.settings, { auth_method: current })).message, "ذخیره انجام نشد.");
  }

  return (
    <Screen narrow>
      <PageHeader title="تنظیمات ورود" description="این انتخاب فقط روش ورود اپلیکیشن ساکنان را عوض می‌کند." />
      <Notices message={action.message} error={action.error || settings.error} />
      <form className="card space-y-3 p-5" onSubmit={onSubmit}>
        {methods.map((item) => (
          <label key={item.value} className="check items-start">
            <input className="mt-1" type="radio" name="auth_method" checked={current === item.value} onChange={() => setMethod(item.value)} />
            <span>
              <span className="block font-bold">{item.label}</span>
              <span className="mt-1 block text-muted">{item.text}</span>
            </span>
          </label>
        ))}
        <button className="btn btn-primary" type="submit">ذخیره</button>
      </form>
    </Screen>
  );
}

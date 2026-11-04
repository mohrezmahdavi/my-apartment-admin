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

const drivers = [
  { value: "log", label: "فقط لاگ", text: "ارسال ثبت می‌شود و به گوشی یا نجوا وصل نمی‌شود." },
  { value: "fcm", label: "فایربیس", text: "پوش اپ اندروید و iOS. توکن دستگاه از خود اپ می‌آید." },
  { value: "najva", label: "نجوا", text: "پوش اعضای سایت. توکن از اسکریپت نجوا می‌آید، نه از فایربیس." },
];

export default function SettingsPage() {
  const settings = useQuery<AuthSettings>(apiPaths.settings);
  const action = useAction();
  const [method, setMethod] = useState<string | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [driver, setDriver] = useState<string | null>(null);
  const currentMethod = method ?? settings.data?.auth_method ?? "both";
  const pushEnabled = enabled ?? settings.data?.push_enabled ?? false;
  const pushDriver = driver ?? settings.data?.push_provider ?? "log";

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await action.run(
      async () =>
        (
          await http.patch(apiPaths.settings, {
            auth_method: currentMethod,
            push_enabled: pushEnabled,
            push_provider: pushDriver,
          })
        ).message,
      "ذخیره انجام نشد.",
    );
  }

  return (
    <Screen narrow>
      <PageHeader title="تنظیمات" description="روش ورود ساکنان، و روشن یا خاموش بودن پوش." />
      <Notices message={action.message} error={action.error || settings.error} />
      <form className="space-y-4" onSubmit={onSubmit}>
        <section className="card space-y-3 p-5">
          <h2 className="font-bold">ورود اپلیکیشن</h2>
          {methods.map((item) => (
            <label key={item.value} className="check items-start">
              <input className="mt-1" type="radio" name="auth_method" checked={currentMethod === item.value} onChange={() => setMethod(item.value)} />
              <span>
                <span className="block font-bold">{item.label}</span>
                <span className="mt-1 block text-muted">{item.text}</span>
              </span>
            </label>
          ))}
        </section>
        <section className="card space-y-3 p-5">
          <h2 className="font-bold">پوش نوتیفیکیشن</h2>
          <label className="check items-start">
            <input className="mt-1" type="checkbox" checked={pushEnabled} onChange={(event) => setEnabled(event.target.checked)} />
            <span>
              <span className="block font-bold">فعال</span>
              <span className="mt-1 block text-muted">اگر خاموش باشد هیچ درایوری صدا زده نمی‌شود. صندوق داخل برنامه سر جایش می‌ماند.</span>
            </span>
          </label>
          {drivers.map((item) => (
            <label key={item.value} className="check items-start">
              <input className="mt-1" type="radio" name="push_provider" checked={pushDriver === item.value} onChange={() => setDriver(item.value)} />
              <span>
                <span className="block font-bold">{item.label}</span>
                <span className="mt-1 block text-muted">{item.text}</span>
              </span>
            </label>
          ))}
          <p className="text-muted">کلید نجوا و شناسهٔ سایت در محیط سرور است. IP سرور باید در پنل نجوا مجاز باشد.</p>
        </section>
        <button className="btn btn-primary" type="submit">ذخیره</button>
      </form>
    </Screen>
  );
}

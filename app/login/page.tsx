"use client";

import { FormEvent, useEffect, useState } from "react";
import { ApiError } from "../_lib/api";
import { useAuth } from "../_lib/auth";

type Method = "password" | "otp";

export default function LoginPage() {
  const { login, sendOtp, verifyOtp, ready, user } = useAuth();
  const [method, setMethod] = useState<Method>("password");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await login(mobile, password);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function onSendCode(event?: FormEvent) {
    event?.preventDefault();
    setPending(true);
    setError("");
    try {
      const expiresIn = await sendOtp(mobile);
      setCodeSent(true);
      setCountdown(expiresIn);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ارسال کد انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await verifyOtp(mobile, code);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ورود انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  if (!ready || user) {
    return <main className="grid min-h-screen place-items-center text-slate-500">در حال بارگذاری...</main>;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <section className="card w-full max-w-md space-y-4 p-6">
        <h1 className="text-2xl font-bold">ورود به پنل مدیریت</h1>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 text-sm">
          <button className={`rounded-lg px-3 py-2 ${method === "password" ? "bg-white font-bold" : ""}`} type="button" onClick={() => setMethod("password")}>
            رمز عبور
          </button>
          <button className={`rounded-lg px-3 py-2 ${method === "otp" ? "bg-white font-bold" : ""}`} type="button" onClick={() => setMethod("otp")}>
            کد پیامکی
          </button>
        </div>

        {method === "password" ? (
          <form className="space-y-3" onSubmit={onPassword}>
            <label className="block space-y-1 text-sm">
              <span>موبایل</span>
              <input className="field" inputMode="numeric" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="0912..." />
            </label>
            <label className="block space-y-1 text-sm">
              <span>رمز عبور</span>
              <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            <button className="btn btn-primary w-full" disabled={pending} type="submit">
              {pending ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={codeSent ? onVerify : onSendCode}>
            <label className="block space-y-1 text-sm">
              <span>موبایل</span>
              <input className="field" inputMode="numeric" value={mobile} onChange={(event) => setMobile(event.target.value)} placeholder="0912..." />
            </label>
            {codeSent ? (
              <label className="block space-y-1 text-sm">
                <span>کد ۵ رقمی</span>
                <input className="field tracking-[0.4em]" inputMode="numeric" maxLength={5} value={code} onChange={(event) => setCode(event.target.value)} />
              </label>
            ) : null}
            {error ? <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
            <button className="btn btn-primary w-full" disabled={pending} type="submit">
              {pending ? "لطفاً صبر کنید..." : codeSent ? "تأیید و ورود" : "ارسال کد"}
            </button>
            {codeSent ? (
              <button className="btn btn-ghost w-full" disabled={pending || countdown > 0} type="button" onClick={() => void onSendCode()}>
                {countdown > 0 ? `ارسال مجدد تا ${countdown} ثانیه` : "ارسال مجدد کد"}
              </button>
            ) : null}
          </form>
        )}
      </section>
    </main>
  );
}

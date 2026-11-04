"use client";

import { FormEvent, useEffect, useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/icons";
import { isIranMobile, isOtpCode } from "@/lib/format";
import { useAction } from "@/lib/use-action";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "@/lib/theme";

type Method = "password" | "otp";

export default function LoginPage() {
  const { login, sendOtp, verifyOtp, ready, user } = useAuth();
  const [method, setMethod] = useState<Method>("password");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [mobileTouched, setMobileTouched] = useState(false);
  const { pending, error, run } = useAction();

  const mobileValid = isIranMobile(mobile);
  const passwordReady = mobileValid && password.trim().length > 0;
  const sendReady = mobileValid;
  const verifyReady = mobileValid && isOtpCode(code);
  const mobileInvalid = mobileTouched && mobile.trim().length > 0 && !mobileValid;

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function onPassword(event: FormEvent) {
    event.preventDefault();
    if (!passwordReady || pending) return;
    await run(() => login(mobile, password), "ورود انجام نشد.");
  }

  async function onSendCode(event?: FormEvent) {
    event?.preventDefault();
    if (!sendReady || pending) return;
    await run(async () => {
      setCountdown(await sendOtp(mobile));
      setCodeSent(true);
    }, "ارسال کد انجام نشد.");
  }

  async function onVerify(event: FormEvent) {
    event.preventDefault();
    if (!verifyReady || pending) return;
    await run(() => verifyOtp(mobile, code), "ورود انجام نشد.");
  }

  if (!ready || user) {
    return (
      <main className="grid min-h-screen place-items-center">
        <div className="spinner spinner-lg" />
      </main>
    );
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="login-hero relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgb(255_255_255/18%)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/18%)_1px,transparent_1px)] [background-size:42px_42px]" />
        <p className="relative text-sm font-bold tracking-wide text-white/80">پنل مدیریت</p>
        <div className="relative max-w-md">
          <h1 className="text-4xl leading-snug font-black xl:text-5xl">همه‌چیز ساختمان، در یک نمای روشن.</h1>
          <p className="mt-4 text-base leading-8 text-white/80">کاربران، نقش‌ها، کیف پول، قبض و تنظیمات ورود را از همین‌جا مدیریت کنید.</p>
        </div>
        <div className="relative grid grid-cols-3 gap-3 text-sm">
          {[
            ["۰۹", "شروع شماره"],
            ["۱۱", "رقم موبایل"],
            ["۵", "رقم کد ورود"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-2xl font-black">{value}</p>
              <p className="mt-1 text-white/75">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-5 flex items-center justify-between lg:hidden">
            <p className="text-sm font-bold text-muted">پنل مدیریت</p>
            <ThemeToggle />
          </div>
          <div className="card space-y-5 p-5 shadow-[var(--shadow)] sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">ورود</h2>
                <p className="mt-1 text-sm leading-6 text-muted">با رمز عبور یا کد پیامکی وارد شوید.</p>
              </div>
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            </div>

            <div className="segment" role="tablist" aria-label="روش ورود">
              <button type="button" role="tab" aria-selected={method === "password"} onClick={() => setMethod("password")}>
                رمز عبور
              </button>
              <button type="button" role="tab" aria-selected={method === "otp"} onClick={() => setMethod("otp")}>
                کد پیامکی
              </button>
            </div>

            {method === "password" ? (
              <form className="space-y-4" onSubmit={onPassword}>
                <MobileField value={mobile} invalid={mobileInvalid} onBlur={() => setMobileTouched(true)} onChange={setMobile} />
                <label className="block space-y-1.5 text-sm font-medium">
                  <span>رمز عبور</span>
                  <span className="relative block">
                    <input
                      className="field pr-12"
                      dir="ltr"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 grid w-10 place-items-center text-muted"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </span>
                </label>
                {error ? <p className="alert alert-error">{error}</p> : null}
                <SubmitButton
                  pending={pending}
                  ready={passwordReady}
                  idle="ورود"
                  busy="در حال ورود..."
                  hint="شماره باید ۱۱ رقم و با ۰۹ شروع شود و رمز عبور خالی نباشد."
                />
              </form>
            ) : (
              <form className="space-y-4" onSubmit={codeSent ? onVerify : onSendCode}>
                <MobileField value={mobile} invalid={mobileInvalid} onBlur={() => setMobileTouched(true)} onChange={setMobile} />
                {codeSent ? (
                  <label className="block space-y-1.5 text-sm font-medium">
                    <span>کد ۵ رقمی</span>
                    <input
                      className={`field text-center text-lg tracking-[0.45em] ${code.length > 0 && !isOtpCode(code) ? "field-invalid" : ""}`}
                      dir="ltr"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={5}
                      value={code}
                      onChange={(event) => setCode(event.target.value)}
                    />
                  </label>
                ) : null}
                {error ? <p className="alert alert-error">{error}</p> : null}
                <SubmitButton
                  pending={pending}
                  ready={codeSent ? verifyReady : sendReady}
                  idle={codeSent ? "تأیید و ورود" : "ارسال کد"}
                  busy="لطفاً صبر کنید..."
                  hint={codeSent ? "کد باید دقیقاً ۵ رقم باشد." : "شماره باید ۱۱ رقم و با ۰۹ شروع شود."}
                />
                {codeSent ? (
                  <div className="btn-wrap">
                    <button className="btn btn-ghost w-full" disabled={pending || countdown > 0 || !sendReady} type="button" onClick={() => void onSendCode()}>
                      {countdown > 0 ? `ارسال مجدد تا ${countdown.toLocaleString("fa-IR")} ثانیه` : "ارسال مجدد کد"}
                    </button>
                  </div>
                ) : null}
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function MobileField({
  value,
  invalid,
  onBlur,
  onChange,
}: {
  value: string;
  invalid: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>موبایل</span>
      <input
        className={`field ${invalid ? "field-invalid" : ""}`}
        dir="ltr"
        inputMode="numeric"
        autoComplete="username"
        placeholder="0912..."
        value={value}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
      />
      {invalid ? <span className="block text-xs font-normal text-danger">شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.</span> : null}
    </label>
  );
}

function SubmitButton({
  pending,
  ready,
  idle,
  busy,
  hint,
}: {
  pending: boolean;
  ready: boolean;
  idle: string;
  busy: string;
  hint: string;
}) {
  const enabled = ready && !pending;
  return (
    <div className="space-y-2">
      <div className="btn-wrap">
        <button className="btn btn-primary w-full" disabled={!enabled} type="submit" aria-disabled={!enabled}>
          {pending ? <span className="spinner" /> : null}
          {pending ? busy : idle}
        </button>
      </div>
      {!ready && !pending ? <p className="text-center text-xs leading-6 text-muted">{hint}</p> : null}
    </div>
  );
}

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, api } from "../../../_lib/api";

export default function NewUserPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const response = await api<{ user: { id: number } }>("/account-service/v1/users", {
        method: "POST",
        body: JSON.stringify({
          first_name: form.get("first_name"),
          last_name: form.get("last_name"),
          mobile: form.get("mobile"),
          email: form.get("email") || null,
          password: form.get("password"),
          password_confirmation: form.get("password_confirmation"),
        }),
      });
      router.push(`/users/${response.items.user.id}`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ایجاد کاربر انجام نشد.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h2 className="text-2xl font-bold">کاربر جدید</h2>
      <form className="card space-y-3 p-5" onSubmit={onSubmit}>
        <input className="field" name="first_name" placeholder="نام" required />
        <input className="field" name="last_name" placeholder="نام خانوادگی" required />
        <input className="field" name="mobile" placeholder="موبایل" required />
        <input className="field" name="email" placeholder="ایمیل" type="email" />
        <input className="field" name="password" placeholder="رمز عبور" type="password" required />
        <input className="field" name="password_confirmation" placeholder="تکرار رمز عبور" type="password" required />
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <button className="btn btn-primary" disabled={pending} type="submit">ذخیره</button>
      </form>
    </section>
  );
}

"use client";

import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPaths } from "@/lib/endpoints";
import { field, optionalField } from "@/lib/form";
import { http } from "@/lib/http";
import { useAction } from "@/lib/use-action";
import { Field, Notices, PageHeader, Screen } from "@/components/ui";

export default function NewUserPage() {
  const router = useRouter();
  const action = useAction();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.post<{ user: { id: number } }>(apiPaths.users(), {
        first_name: field(form, "first_name"),
        last_name: field(form, "last_name"),
        mobile: field(form, "mobile"),
        email: optionalField(form, "email"),
        password: field(form, "password"),
        password_confirmation: field(form, "password_confirmation"),
      });
      router.push(`/users/${response.items.user.id}`);
    }, "ایجاد کاربر انجام نشد.");
  }

  return (
    <Screen narrow>
      <PageHeader title="کاربر جدید" description="حساب تازه با نام، موبایل و رمز عبور" />
      <form className="card grid gap-3 p-5 sm:grid-cols-2" onSubmit={onSubmit}>
        <Field label="نام" name="first_name" required />
        <Field label="نام خانوادگی" name="last_name" required />
        <Field className="sm:col-span-2" label="موبایل" name="mobile" dir="ltr" inputMode="numeric" required />
        <Field className="sm:col-span-2" label="ایمیل" name="email" type="email" dir="ltr" />
        <Field label="رمز عبور" name="password" type="password" required />
        <Field label="تکرار رمز عبور" name="password_confirmation" type="password" required />
        <div className="sm:col-span-2">
          <Notices error={action.error} />
        </div>
        <div className="btn-wrap sm:col-span-2">
          <button className="btn btn-primary w-full sm:w-auto" disabled={action.pending} type="submit">
            {action.pending ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </div>
      </form>
    </Screen>
  );
}

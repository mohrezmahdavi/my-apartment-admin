"use client";

import type { FormEvent } from "react";
import { CheckList } from "@/components/ui";
import { field, optionalField } from "@/lib/form";
import type { AdminUser, Role } from "@/lib/types";

export function ProfileForm({ user, editable, onSubmit }: { user: AdminUser; editable: boolean; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return (
    <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={onSubmit}>
      <h3 className="font-black md:col-span-2">اطلاعات حساب</h3>
      <input className="field" name="first_name" defaultValue={user.first_name ?? ""} disabled={!editable} aria-label="نام" />
      <input className="field" name="last_name" defaultValue={user.last_name ?? ""} disabled={!editable} aria-label="نام خانوادگی" />
      <input className="field" name="mobile" dir="ltr" defaultValue={user.mobile} disabled={!editable} aria-label="موبایل" />
      <input className="field" name="email" dir="ltr" defaultValue={user.email ?? ""} disabled={!editable} aria-label="ایمیل" />
      {editable ? (
        <>
          <input className="field" name="password" type="password" placeholder="رمز جدید" />
          <input className="field" name="password_confirmation" type="password" placeholder="تکرار رمز جدید" />
          <button className="btn btn-primary md:col-span-2 md:w-fit" type="submit">ذخیره اطلاعات</button>
        </>
      ) : null}
    </form>
  );
}

export function profilePayload(form: FormData) {
  return {
    first_name: field(form, "first_name"),
    last_name: field(form, "last_name"),
    mobile: field(form, "mobile"),
    email: optionalField(form, "email"),
    password: optionalField(form, "password"),
    password_confirmation: optionalField(form, "password_confirmation"),
  };
}

export function RolesEditor({ roles, selected, onChange, onSubmit }: { roles: Role[]; selected: number[]; onChange: (ids: number[]) => void; onSubmit: (event: FormEvent) => void }) {
  return (
    <form className="card space-y-3 p-5" onSubmit={onSubmit}>
      <h3 className="font-black">نقش‌ها</h3>
      <CheckList
        columns="md:grid-cols-3"
        items={roles.map((role) => ({ id: role.id, label: role.label || role.name }))}
        selected={selected}
        onChange={onChange}
      />
      <button className="btn btn-primary" type="submit">ذخیره نقش‌ها</button>
    </form>
  );
}

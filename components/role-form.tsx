"use client";

import type { FormEvent } from "react";
import { CheckList, Field, Notices, PageHeader } from "@/components/ui";
import type { Permission } from "@/lib/types";

export function RoleForm({
  title,
  name,
  label,
  nameEditable,
  permissions,
  groups,
  selected,
  onChange,
  error,
  onSubmit,
  onDelete,
}: {
  title: string;
  name: string;
  label: string;
  nameEditable?: boolean;
  permissions: Permission[];
  groups: Record<string, string>;
  selected: number[];
  onChange: (ids: number[]) => void;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((groupsByName, permission) => {
    const key = permission.group || "other";
    groupsByName[key] = [...(groupsByName[key] ?? []), permission];
    return groupsByName;
  }, {});

  return (
    <section className="space-y-5">
      <PageHeader title={title} description="عنوان نقش و دسترسی‌های آن" />
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="card grid gap-3 p-5 sm:grid-cols-2">
          <Field label="عنوان" name="label" defaultValue={label} required />
          <Field label="شناسه" name="name" dir="ltr" defaultValue={name} required disabled={!nameEditable} />
        </div>
        {Object.entries(grouped).map(([group, items]) => (
          <fieldset key={group} className="card p-5">
            <legend className="px-1 font-black">{groups[group] || group}</legend>
            <div className="mt-3">
              <CheckList
                items={items.map((permission) => ({ id: permission.id, label: permission.label || permission.name }))}
                selected={selected}
                onChange={onChange}
              />
            </div>
          </fieldset>
        ))}
        <Notices error={error} />
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary" type="submit">
            ذخیره
          </button>
          {onDelete ? (
            <button className="btn btn-danger" type="button" onClick={onDelete}>
              حذف
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
}

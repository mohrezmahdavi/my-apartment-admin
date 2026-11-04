"use client";

import { FormEvent } from "react";
import { Permission } from "../_lib/api";

export function RoleForm({
  title,
  name,
  label,
  nameEditable,
  permissions,
  groups,
  selected,
  setSelected,
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
  setSelected: (ids: number[]) => void;
  error: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete?: () => void;
}) {
  const grouped = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    const key = permission.group || "other";
    acc[key] = [...(acc[key] ?? []), permission];
    return acc;
  }, {});

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <form className="card space-y-4 p-5" onSubmit={onSubmit}>
        <input className="field" name="label" defaultValue={label} placeholder="عنوان" required />
        <input className="field" name="name" defaultValue={name} placeholder="name" required disabled={!nameEditable} />
        {Object.entries(grouped).map(([group, items]) => (
          <fieldset key={group}>
            <legend className="mb-2 font-bold">{groups[group] || group}</legend>
            <div className="grid gap-2 md:grid-cols-2">
              {items.map((permission) => (
                <label key={permission.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(permission.id)}
                    onChange={(event) => {
                      setSelected(
                        event.target.checked ? [...selected, permission.id] : selected.filter((id) => id !== permission.id),
                      );
                    }}
                  />
                  {permission.label || permission.name}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <div className="flex gap-2">
          <button className="btn btn-primary" type="submit">ذخیره</button>
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

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, Permission, api } from "../../../_lib/api";
import { RoleForm } from "../../../_components/role-form";

export default function NewRolePage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ permissions: Permission[]; groups: Record<string, string> }>("/acl-service/v1/permissions")
      .then((response) => {
        setPermissions(response.items.permissions);
        setGroups(response.items.groups);
      })
      .catch((caught: Error) => setError(caught.message));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<{ role: { id: number } }>("/acl-service/v1/roles", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          label: form.get("label"),
          permissions: selected,
        }),
      });
      router.push(`/roles/${response.items.role.id}`);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ایجاد نقش انجام نشد.");
    }
  }

  return (
    <RoleForm
      title="نقش جدید"
      name=""
      label=""
      nameEditable
      permissions={permissions}
      groups={groups}
      selected={selected}
      setSelected={setSelected}
      error={error}
      onSubmit={onSubmit}
    />
  );
}

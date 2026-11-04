"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleForm } from "@/components/role-form";
import { apiPaths } from "@/lib/endpoints";
import { field } from "@/lib/form";
import { http } from "@/lib/http";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { PermissionCatalog } from "@/lib/types";

export default function NewRolePage() {
  const router = useRouter();
  const catalog = useQuery<PermissionCatalog>(apiPaths.permissions);
  const action = useAction();
  const [selected, setSelected] = useState<number[]>([]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.post<{ role: { id: number } }>(apiPaths.roles, {
        name: field(form, "name"),
        label: field(form, "label"),
        permissions: selected,
      });
      router.push(`/roles/${response.items.role.id}`);
    }, "ایجاد نقش انجام نشد.");
  }

  return (
    <RoleForm
      title="نقش جدید"
      name=""
      label=""
      nameEditable
      permissions={catalog.data?.permissions ?? []}
      groups={catalog.data?.groups ?? {}}
      selected={selected}
      onChange={setSelected}
      error={catalog.error || action.error}
      onSubmit={onSubmit}
    />
  );
}

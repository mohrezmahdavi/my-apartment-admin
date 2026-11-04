"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { RoleForm } from "@/components/role-form";
import { Alert, Loading } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { field } from "@/lib/form";
import { http } from "@/lib/http";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { PermissionCatalog, Role } from "@/lib/types";

export default function EditRolePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const roleQuery = useQuery<{ role: Role }>(apiPaths.role(params.id));
  const catalog = useQuery<PermissionCatalog>(apiPaths.permissions);
  const action = useAction();
  const [selected, setSelected] = useState<number[] | null>(null);
  const role = roleQuery.data?.role ?? null;
  const permissionIds = selected ?? role?.permissions?.map((permission) => permission.id) ?? [];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      await http.put(apiPaths.role(params.id), { label: field(form, "label"), permissions: permissionIds });
      router.push("/roles");
    }, "ذخیره انجام نشد.");
  }

  async function onDelete() {
    if (!confirm("این نقش حذف شود؟")) return;
    await action.run(async () => {
      await http.delete(apiPaths.role(params.id));
      router.push("/roles");
    }, "حذف انجام نشد.");
  }

  if (!role) {
    const error = roleQuery.error || catalog.error;
    return error ? <Alert kind="error">{error}</Alert> : <Loading />;
  }

  return (
    <RoleForm
      title={role.label || role.name}
      name={role.name}
      label={role.label || ""}
      permissions={catalog.data?.permissions ?? []}
      groups={catalog.data?.groups ?? {}}
      selected={permissionIds}
      onChange={setSelected}
      error={action.error}
      onSubmit={onSubmit}
      onDelete={role.name === "super_admin" ? undefined : onDelete}
    />
  );
}

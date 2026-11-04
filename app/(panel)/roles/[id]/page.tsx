"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ApiError, Permission, Role, api } from "../../../_lib/api";
import { RoleForm } from "../../../_components/role-form";

export default function EditRolePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groups, setGroups] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<number[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      api<{ role: Role }>(`/acl-service/v1/roles/${params.id}`),
      api<{ permissions: Permission[]; groups: Record<string, string> }>("/acl-service/v1/permissions"),
    ])
      .then(([roleResponse, permissionResponse]) => {
        setRole(roleResponse.items.role);
        setSelected(roleResponse.items.role.permissions?.map((permission) => permission.id) ?? []);
        setPermissions(permissionResponse.items.permissions);
        setGroups(permissionResponse.items.groups);
      })
      .catch((caught: Error) => setError(caught.message));
  }, [params.id]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await api(`/acl-service/v1/roles/${params.id}`, {
        method: "PUT",
        body: JSON.stringify({ label: form.get("label"), permissions: selected }),
      });
      router.push("/roles");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره انجام نشد.");
    }
  }

  async function onDelete() {
    if (!confirm("این نقش حذف شود؟")) return;
    try {
      await api(`/acl-service/v1/roles/${params.id}`, { method: "DELETE" });
      router.push("/roles");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "حذف انجام نشد.");
    }
  }

  if (!role) return <p className="text-slate-500">{error || "در حال بارگذاری..."}</p>;

  return (
    <RoleForm
      title={role.label || role.name}
      name={role.name}
      label={role.label || ""}
      permissions={permissions}
      groups={groups}
      selected={selected}
      setSelected={setSelected}
      error={error}
      onSubmit={onSubmit}
      onDelete={role.name === "super_admin" ? undefined : onDelete}
    />
  );
}

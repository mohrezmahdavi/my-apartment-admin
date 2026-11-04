"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProfileForm, RolesEditor, profilePayload } from "./sections";
import { WalletPanel, walletPayload } from "./wallet-panel";
import { apiPaths } from "@/lib/endpoints";
import { fullName } from "@/lib/format";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { AdminUser, Role, WalletSnapshot } from "@/lib/types";
import { Alert, Loading, Notices, PageHeader, Screen } from "@/components/ui";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = useAuth();
  const action = useAction();
  const userQuery = useQuery<{ user: AdminUser }>(apiPaths.user(params.id));
  const rolesQuery = useQuery<{ roles: Role[] }>(can("roles.view") ? apiPaths.roles : null);
  const walletQuery = useQuery<WalletSnapshot>(can("wallet.view") ? apiPaths.userWallet(params.id) : null);
  const [selectedRoles, setSelectedRoles] = useState<number[] | null>(null);
  const user = userQuery.data?.user ?? null;
  const roleIds = selectedRoles ?? user?.roles?.map((role) => role.id) ?? [];

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await action.run(async () => {
      const response = await http.put<{ user: AdminUser }>(apiPaths.user(params.id), profilePayload(form));
      userQuery.setData({ user: response.items.user });
      return "اطلاعات ذخیره شد.";
    }, "ذخیره انجام نشد.");
  }

  async function saveRoles(event: FormEvent) {
    event.preventDefault();
    await action.run(async () => {
      await http.put(apiPaths.userRoles(params.id), { roles: roleIds });
      return "نقش‌ها ذخیره شد.";
    }, "ذخیره نقش‌ها انجام نشد.");
  }

  async function adjustWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = walletPayload(new FormData(form));
    await action.run(async () => {
      const response = await http.post<WalletSnapshot>(apiPaths.adjustWallet(params.id), payload);
      walletQuery.setData(response.items);
      form.reset();
      return response.message;
    }, "تغییر موجودی انجام نشد.");
  }

  async function removeUser() {
    if (!confirm("این کاربر حذف شود؟")) return;
    await action.run(async () => {
      await http.delete(apiPaths.user(params.id));
      router.push("/users");
    }, "حذف انجام نشد.");
  }

  if (!user) return userQuery.error ? <Alert kind="error">{userQuery.error}</Alert> : <Loading />;

  return (
    <Screen>
      <PageHeader
        title={fullName(user)}
        description={user.mobile}
        action={can("users.delete") ? <button className="btn btn-danger" type="button" onClick={() => void removeUser()}>حذف</button> : null}
      />
      <Notices message={action.message} error={action.error} />
      <ProfileForm key={user.mobile + (user.email ?? "")} user={user} editable={can("users.edit")} onSubmit={saveProfile} />
      {can("roles.manage") ? (
        <RolesEditor roles={rolesQuery.data?.roles ?? []} selected={roleIds} onChange={setSelectedRoles} onSubmit={saveRoles} />
      ) : null}
      {walletQuery.data ? (
        <WalletPanel wallet={walletQuery.data} adjustable={can("wallet.adjust")} onSubmit={adjustWallet} />
      ) : null}
    </Screen>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminUser, ApiError, Role, WalletSnapshot, api, fullName } from "../../../_lib/api";
import { useAuth } from "../../../_lib/auth";

export default function UserDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { can } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [wallet, setWallet] = useState<WalletSnapshot | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<{ user: AdminUser }>(`/account-service/v1/users/${params.id}`)
      .then((response) => {
        setUser(response.items.user);
        setSelectedRoles(response.items.user.roles?.map((role) => role.id) ?? []);
      })
      .catch((caught: Error) => setError(caught.message));

    if (can("roles.view")) {
      api<{ roles: Role[] }>("/acl-service/v1/roles")
        .then((response) => setRoles(response.items.roles))
        .catch(() => undefined);
    }

    if (can("wallet.view")) {
      api<WalletSnapshot>(`/wallet-service/v1/users/${params.id}/wallet`)
        .then((response) => setWallet(response.items))
        .catch(() => undefined);
    }
  }, [params.id, can]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError("");
    try {
      const response = await api<{ user: AdminUser }>(`/account-service/v1/users/${params.id}`, {
        method: "PUT",
        body: JSON.stringify({
          first_name: form.get("first_name"),
          last_name: form.get("last_name"),
          mobile: form.get("mobile"),
          email: form.get("email") || null,
          password: form.get("password") || null,
          password_confirmation: form.get("password_confirmation") || null,
        }),
      });
      setUser(response.items.user);
      setMessage("اطلاعات ذخیره شد.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره انجام نشد.");
    }
  }

  async function saveRoles(event: FormEvent) {
    event.preventDefault();
    try {
      await api(`/acl-service/v1/users/${params.id}/roles`, {
        method: "PUT",
        body: JSON.stringify({ roles: selectedRoles }),
      });
      setMessage("نقش‌ها ذخیره شد.");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "ذخیره نقش‌ها انجام نشد.");
    }
  }

  async function adjustWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const response = await api<WalletSnapshot>(`/wallet-service/v1/users/${params.id}/wallet/adjust`, {
        method: "POST",
        body: JSON.stringify({
          type: form.get("type"),
          amount: Number(form.get("amount")),
          description: form.get("description") || null,
        }),
      });
      setWallet(response.items);
      setMessage(response.message);
      event.currentTarget.reset();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "تغییر موجودی انجام نشد.");
    }
  }

  async function removeUser() {
    if (!confirm("این کاربر حذف شود؟")) return;
    await api(`/account-service/v1/users/${params.id}`, { method: "DELETE" });
    router.push("/users");
  }

  if (!user) return <p className="text-slate-500">{error || "در حال بارگذاری..."}</p>;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{fullName(user)}</h2>
        {can("users.delete") ? (
          <button className="btn btn-danger" type="button" onClick={() => void removeUser()}>حذف</button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-teal-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <form className="card grid gap-3 p-5 md:grid-cols-2" onSubmit={saveProfile}>
        <input className="field" name="first_name" defaultValue={user.first_name ?? ""} disabled={!can("users.edit")} />
        <input className="field" name="last_name" defaultValue={user.last_name ?? ""} disabled={!can("users.edit")} />
        <input className="field" name="mobile" defaultValue={user.mobile} disabled={!can("users.edit")} />
        <input className="field" name="email" defaultValue={user.email ?? ""} disabled={!can("users.edit")} />
        {can("users.edit") ? (
          <>
            <input className="field" name="password" type="password" placeholder="رمز جدید" />
            <input className="field" name="password_confirmation" type="password" placeholder="تکرار رمز جدید" />
            <button className="btn btn-primary md:col-span-2" type="submit">ذخیره اطلاعات</button>
          </>
        ) : null}
      </form>

      {can("roles.manage") ? (
        <form className="card space-y-3 p-5" onSubmit={saveRoles}>
          <h3 className="font-bold">نقش‌ها</h3>
          <div className="grid gap-2 md:grid-cols-3">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.id)}
                  onChange={(event) => {
                    setSelectedRoles((current) =>
                      event.target.checked ? [...current, role.id] : current.filter((id) => id !== role.id),
                    );
                  }}
                />
                {role.label || role.name}
              </label>
            ))}
          </div>
          <button className="btn btn-primary" type="submit">ذخیره نقش‌ها</button>
        </form>
      ) : null}

      {wallet ? (
        <div className="card space-y-4 p-5">
          <h3 className="font-bold">کیف پول</h3>
          <p>موجودی: {wallet.wallet ? wallet.wallet.balance.toLocaleString("fa-IR") : "ندارد"} ریال</p>
          {can("wallet.adjust") && wallet.wallet ? (
            <form className="grid gap-2 md:grid-cols-4" onSubmit={adjustWallet}>
              <select className="field" name="type" defaultValue="deposit">
                <option value="deposit">واریز</option>
                <option value="withdraw">برداشت</option>
              </select>
              <input className="field" name="amount" type="number" min={1} placeholder="مبلغ" required />
              <input className="field" name="description" placeholder="توضیح" />
              <button className="btn btn-primary" type="submit">ثبت</button>
            </form>
          ) : null}
          <ul className="space-y-2 text-sm">
            {wallet.transactions.map((transaction) => (
              <li key={transaction.id} className="flex justify-between border-t border-slate-100 pt-2">
                <span>{transaction.type === 1 ? "واریز" : "برداشت"} {transaction.description ? `· ${transaction.description}` : ""}</span>
                <span>{transaction.amount.toLocaleString("fa-IR")}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

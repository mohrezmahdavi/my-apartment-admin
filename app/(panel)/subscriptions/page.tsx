"use client";

import { FormEvent } from "react";
import { NewPlanForm, PlanCard, planPayload } from "./plans-panel";
import { Empty, Loading, Notices, PageHeader, Screen } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { SubscriptionPlan } from "@/lib/types";

export default function SubscriptionsPage() {
  const { can } = useAuth();
  const manage = can("subscriptions.manage");
  const settings = useQuery<{ enabled: boolean }>(apiPaths.subscriptionSettings);
  const plans = useQuery<{ plans: SubscriptionPlan[] }>(apiPaths.subscriptionPlans);
  const action = useAction();
  const rows = plans.data?.plans ?? [];

  async function saveSettings(enabled: boolean) {
    await action.run(async () => {
      const response = await http.put<{ enabled: boolean }>(apiPaths.subscriptionSettings, { enabled });
      settings.setData({ enabled: response.items.enabled });
      return response.message;
    }, "ذخیره انجام نشد.");
  }

  async function savePlan(event: FormEvent<HTMLFormElement>, plan?: SubscriptionPlan) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = planPayload(new FormData(form));
    await action.run(async () => {
      const response = plan
        ? await http.put(apiPaths.subscriptionPlan(plan.id), body)
        : await http.post(apiPaths.subscriptionPlans, body);
      plans.reload();
      if (!plan) form.reset();
      return response.message;
    }, "ذخیره پلن انجام نشد.");
  }

  async function removePlan(id: number) {
    if (!confirm("این پلن حذف شود؟")) return;
    await action.run(async () => {
      const response = await http.delete(apiPaths.subscriptionPlan(id));
      plans.reload();
      return response.message;
    }, "حذف پلن انجام نشد.");
  }

  return (
    <Screen>
      <PageHeader title="اشتراک ساختمان" description="پلن آزمایشی را پیش‌فرض بگذارید. قفل فقط امکانات مدیریت ساختمان را می‌بندد." />
      <Notices message={action.message} error={action.error || settings.error || plans.error} />

      <section className="card space-y-3 p-5">
        <h3 className="font-black">قفل اشتراک</h3>
        <label className="check items-start">
          <input
            className="mt-1"
            type="checkbox"
            checked={settings.data?.enabled ?? true}
            disabled={!manage || settings.loading || action.pending}
            onChange={(event) => void saveSettings(event.target.checked)}
          />
          <span>
            <span className="block font-bold">قفل روشن است</span>
            <span className="mt-1 block text-sm leading-6 text-muted">اگر خاموش باشد هیچ ساختمانی برای اعلان، واحد و بقیه امکانات مدیریت قفل نمی‌شود.</span>
          </span>
        </label>
      </section>

      {plans.loading && rows.length === 0 ? <Loading /> : null}
      {!plans.loading && rows.length === 0 ? <Empty>پلنی تعریف نشده است.</Empty> : null}
      {rows.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          manage={manage}
          pending={action.pending}
          onSave={(event) => void savePlan(event, plan)}
          onRemove={(id) => void removePlan(id)}
        />
      ))}
      {manage ? <NewPlanForm pending={action.pending} onSave={(event) => void savePlan(event)} /> : null}
    </Screen>
  );
}

"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { SubscriptionPanel } from "../subscription-panel";
import { Alert, Loading, Notices, PageHeader, Screen } from "@/components/ui";
import { apiPaths } from "@/lib/endpoints";
import { faNumber, fullName } from "@/lib/format";
import { http } from "@/lib/http";
import { useAuth } from "@/lib/auth";
import { useAction } from "@/lib/use-action";
import { useQuery } from "@/lib/use-query";
import type { AdminBuildingDetail, BuildingSubscriptionRow, SubscriptionPlan } from "@/lib/types";

export default function BuildingDetailPage() {
  const params = useParams<{ id: string }>();
  const { can } = useAuth();
  const action = useAction();
  const detail = useQuery<AdminBuildingDetail>(apiPaths.building(params.id));
  const plans = useQuery<{ plans: SubscriptionPlan[] }>(can("subscriptions.view") ? apiPaths.subscriptionPlans : null);
  const building = detail.data?.building ?? null;
  const subscription = detail.data?.subscription ?? null;
  const manage = can("subscriptions.manage");

  async function assign(planId: number) {
    await action.run(async () => {
      const response = await http.put<{ subscription: BuildingSubscriptionRow }>(apiPaths.subscriptionAssignPlan(params.id), { plan_id: planId });
      if (detail.data) detail.setData({ ...detail.data, subscription: response.items.subscription });
      return response.message;
    }, "تغییر پلن انجام نشد.");
  }

  async function extend(days: number) {
    await action.run(async () => {
      const response = await http.post<{ subscription: BuildingSubscriptionRow }>(apiPaths.subscriptionExtend(params.id), { days });
      if (detail.data) detail.setData({ ...detail.data, subscription: response.items.subscription });
      return response.message;
    }, "تمدید انجام نشد.");
  }

  async function waive() {
    await action.run(async () => {
      const response = await http.post<{ subscription: BuildingSubscriptionRow }>(apiPaths.subscriptionWaive(params.id));
      if (detail.data) detail.setData({ ...detail.data, subscription: response.items.subscription });
      return response.message;
    }, "بخشش انجام نشد.");
  }

  if (!building) return detail.error ? <Alert kind="error">{detail.error}</Alert> : <Loading />;

  return (
    <Screen>
      <PageHeader title={building.name} description={building.address || "بدون نشانی"} action={<Link className="btn btn-ghost" href="/buildings">بازگشت</Link>} />
      <Notices message={action.message} error={action.error || detail.error} />
      <section className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="طبقات" value={faNumber(building.floors)} />
        <Stat label="واحد" value={faNumber(building.units_count)} />
        <Stat label="اعضا" value={faNumber(building.members_count)} />
        <div>
          <p className="text-sm text-muted">مالک</p>
          {building.owner ? (
            <Link className="mt-1 block font-black text-primary" href={`/users/${building.owner.id}`}>
              {fullName(building.owner)}
              <span className="mt-1 block text-sm font-medium text-muted" dir="ltr">{building.owner.mobile}</span>
            </Link>
          ) : (
            <p className="mt-1 font-black">—</p>
          )}
        </div>
      </section>
      {subscription ? (
        <SubscriptionPanel
          key={`${subscription.plan.id}-${subscription.period_ends_at}-${subscription.status}`}
          subscription={subscription}
          plans={plans.data?.plans ?? []}
          manage={manage}
          pending={action.pending}
          onAssign={(planId) => void assign(planId)}
          onExtend={(days) => void extend(days)}
          onWaive={() => void waive()}
        />
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

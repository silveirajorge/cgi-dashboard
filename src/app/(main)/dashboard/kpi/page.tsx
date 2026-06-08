import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { KpiDashboardClient } from "./_components/kpi-dashboard-client";

const groupLabel = sidebarItems.find((g) => g.label === "Pedidos e Tendências")?.label ?? "Pedidos e Tendências";
const pageTitle = `Dashboard | ${groupLabel}`;

export default function KpiDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">{pageTitle}</h1>
      </div>
      <KpiDashboardClient />
    </div>
  );
}

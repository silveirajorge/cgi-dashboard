import { sidebarItems } from "@/navigation/sidebar/sidebar-items";

import { AvaliacaoDashboardV2Client } from "./_components/avaliacao-dashboard-v2-client";

const groupLabel = sidebarItems.find((g) => g.label === "Avaliação e Desempenho")?.label ?? "Avaliação e Desempenho";

export default function AvaliacaoDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Dashboard — {groupLabel}</h1>
      </div>
      <AvaliacaoDashboardV2Client />
    </div>
  );
}

"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface CilChartProps {
  data: Array<{ cil: string; count: number }>;
  onCilClick: (cil: string) => void;
}

const chartConfig = {
  count: {
    label: "Chamados",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function CilChart({ data, onCilClick }: CilChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 font-semibold text-sm">Chamados por CIL (Top 20)</h3>
        <p className="py-8 text-center text-muted-foreground text-sm">Nenhum dado de CIL no período</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold text-sm">Chamados por CIL (Top 20)</h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
          <CartesianGrid horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis
            type="category"
            dataKey="cil"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={12}
            width={90}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(entry) => {
              const data = entry as { payload: { cil: string } };
              if (data?.payload?.cil) onCilClick(data.payload.cil);
            }}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}

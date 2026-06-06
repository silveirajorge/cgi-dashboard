"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface DailyChartProps {
  data: Array<{ date: string; count: number }>;
}

const chartConfig = {
  pedidos: {
    label: "Pedidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function DailyChart({ data }: DailyChartProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold text-sm">Evolução Diária</h3>
      <ChartContainer config={chartConfig} className="h-72 w-full">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
          />
          <Line dataKey="count" stroke="var(--color-pedidos)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ChartContainer>
    </div>
  );
}

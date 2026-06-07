"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  perc_produtividade: {
    label: "Produtividade",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface ProdHistChartProps {
  data: Array<{ data_avaliacao: string; perc_produtividade: number | null }>;
}

export function ProdHistChart({ data }: ProdHistChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Produtividade</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey="data_avaliacao"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              tickFormatter={formatDateBR}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <Bar dataKey="perc_produtividade" radius={[4, 4, 0, 0]} fill="var(--color-perc_produtividade)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

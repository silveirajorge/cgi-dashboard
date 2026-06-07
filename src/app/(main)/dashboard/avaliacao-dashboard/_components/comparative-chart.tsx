"use client";

import { useMemo } from "react";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ComparativeChartProps {
  data: Array<{ funcionario_id: number; funcionario_nome: string; media: number }>;
  onBarClick?: (funcionarioId: number) => void;
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ComparativeChart({ data, onBarClick }: ComparativeChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of data) {
      config[String(item.funcionario_id)] = { label: item.funcionario_nome };
    }
    return config;
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 font-semibold text-sm">Comparativo entre Funcionários</h3>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground text-sm">Nenhum funcionário com avaliações no período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold text-sm">Comparativo entre Funcionários</h3>
      <ChartContainer config={chartConfig} className="h-80 w-full">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="funcionario_nome" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
          <Bar
            dataKey="media"
            radius={[4, 4, 0, 0]}
            onClick={(entry) => {
              if (onBarClick && entry) {
                const d = entry as { funcionario_id?: number };
                if (d.funcionario_id) onBarClick(d.funcionario_id);
              }
            }}
          >
            {data.map((entry, idx) => (
              <Cell key={entry.funcionario_id} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}

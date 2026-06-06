"use client";

import { useMemo } from "react";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface ChannelChartProps {
  data: Array<{ canal: string; count: number }>;
}

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

export function ChannelChart({ data }: ChannelChartProps) {
  const chartConfig = useMemo(() => {
    const config: ChartConfig = {};
    for (const item of data) {
      config[item.canal] = { label: item.canal };
    }
    return config;
  }, [data]);

  const total = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Distribuição por Canal (PieChart donut) */}
        <div>
          <h3 className="mb-2 font-semibold text-sm">Distribuição por Canal</h3>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => {
                      const pct = total > 0 ? ((Number(value) / total) * 100).toFixed(1) : "0";
                      return (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{String(name ?? "")}</span>
                          <span className="font-medium font-mono tabular-nums">
                            {String(value)} ({pct}%)
                          </span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Pie data={data} dataKey="count" nameKey="canal" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                {data.map((entry) => (
                  <Cell key={entry.canal} fill={COLORS[data.indexOf(entry) % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>

        {/* Pedidos por Canal (BarChart horizontal) */}
        <div>
          <h3 className="mb-2 font-semibold text-sm">Pedidos por Canal</h3>
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid horizontal={false} />
              <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis
                type="category"
                dataKey="canal"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                width={100}
              />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry) => (
                  <Cell key={entry.canal} fill={COLORS[data.indexOf(entry) % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}

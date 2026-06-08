"use client";

import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailyChartProps {
  data: Array<{ date: string; count: number }>;
}

const chartConfig = {
  pedidos: {
    label: "Pedidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function formatDateBR(dateStr: unknown): string {
  const d = new Date(String(dateStr));
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

function formatDateTooltip(_label: unknown, payload: unknown): string {
  const p = payload as ReadonlyArray<{ payload: { date: string } }> | undefined;
  if (!p?.[0]?.payload?.date) return "";
  const d = new Date(p[0].payload.date);
  if (Number.isNaN(d.getTime())) return p[0].payload.date;
  return d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function DailyChart({ data }: DailyChartProps) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="leading-none">Evolução Diária</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Pedidos registados por dia no período selecionado</span>
          <span className="@[540px]/card:hidden">Período selecionado</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillPedidos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-pedidos)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-pedidos)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={12}
              minTickGap={48}
              tickFormatter={formatDateBR}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip
              content={<ChartTooltipContent labelFormatter={formatDateTooltip} />}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <ChartLegend verticalAlign="top" content={<ChartLegendContent className="mb-5 justify-start" />} />
            <Area
              dataKey="count"
              type="natural"
              fill="url(#fillPedidos)"
              stroke="var(--color-pedidos)"
              strokeWidth={1.25}
              dot={false}
              fillOpacity={1}
            />
            <Line dataKey="count" type="natural" stroke="var(--color-pedidos)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

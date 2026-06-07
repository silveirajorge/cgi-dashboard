"use client";

import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  produtividade: {
    label: "Produtividade",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

interface EvolucaoProdChartProps {
  data: Array<{ week: string; produtividade: number | null }>;
}

export function EvolucaoProdChart({ data }: EvolucaoProdChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Média de Produtividade</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-80 w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillProd" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-produtividade)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-produtividade)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeOpacity={0.5} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            />
            <Area
              dataKey="produtividade"
              type="natural"
              fill="url(#fillProd)"
              stroke="var(--color-produtividade)"
              strokeWidth={1.25}
              dot={false}
            />
            <Line
              dataKey="produtividade"
              type="natural"
              stroke="var(--color-produtividade)"
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

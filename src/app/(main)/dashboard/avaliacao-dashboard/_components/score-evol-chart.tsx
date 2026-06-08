"use client";

import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const chartConfig = {
  score: {
    label: "Score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

interface ScoreEvolChartProps {
  data: Array<{ data_avaliacao: string; score: number }>;
}

export function ScoreEvolChart({ data }: ScoreEvolChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução do Score</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-square w-full">
          <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="fillScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-score)" stopOpacity={0.36} />
                <stop offset="95%" stopColor="var(--color-score)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
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
            <Area
              dataKey="score"
              type="natural"
              fill="url(#fillScore)"
              stroke="var(--color-score)"
              strokeWidth={1.25}
              dot={false}
            />
            <Line dataKey="score" type="natural" stroke="var(--color-score)" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

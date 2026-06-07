"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";

const chartConfig = {
  excelente: { label: "Excelente", color: "#22c55e" },
  bom: { label: "Bom", color: "#3b82f6" },
  atencao: { label: "Atenção", color: "#eab308" },
  critico: { label: "Crítico", color: "#ef4444" },
} satisfies ChartConfig;

interface DistribuicaoDonutProps {
  data: Array<{ name: string; value: number; fill: string }>;
  total: number;
}

export function DistribuicaoDonut({ data, total }: DistribuicaoDonutProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição de Desempenho</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-60 w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            />
            {/* Center label */}
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
              <tspan x="50%" dy="-0.3em" className="font-bold text-2xl">
                {total}
              </tspan>
              <tspan x="50%" dy="1.2em" className="fill-muted-foreground text-xs">
                Total
              </tspan>
            </text>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

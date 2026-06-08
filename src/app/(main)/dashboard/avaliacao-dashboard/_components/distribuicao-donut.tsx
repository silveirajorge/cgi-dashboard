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

const CORES: Record<string, string> = {
  Excelente: "#22c55e",
  Bom: "#3b82f6",
  Atenção: "#eab308",
  Crítico: "#ef4444",
};

interface DistribuicaoDonutProps {
  data: Array<{ name: string; value: number; fill: string }>;
  total: number;
}

export function DistribuicaoDonut({ data, total }: DistribuicaoDonutProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Distribuição de Desempenho</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2 pt-0">
        <ChartContainer config={chartConfig} className="h-36 w-full">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={36}
              outerRadius={56}
              paddingAngle={2}
            />
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
              <tspan x="50%" dy="-0.2em" className="font-bold text-base">
                {total}
              </tspan>
              <tspan x="50%" dy="1.1em" className="fill-muted-foreground text-[10px]">
                total
              </tspan>
            </text>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <div
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: CORES[item.name] ?? item.fill }}
              />
              <span className="text-muted-foreground text-[11px]">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

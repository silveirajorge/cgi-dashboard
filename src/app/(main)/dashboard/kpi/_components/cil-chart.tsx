"use client";

import { useState } from "react";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const TOP_OPTIONS = [
  { value: "10", label: "Top 10" },
  { value: "25", label: "Top 25" },
  { value: "50", label: "Top 50" },
  { value: "100", label: "Top 100" },
  { value: "all", label: "Todos" },
] as const;

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

export function CilChart({ data, onCilClick }: CilChartProps) {
  const [topN, setTopN] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = topN === Infinity ? data.length : Math.min(topN, data.length);
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedData = data.slice(0, totalItems).slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  const topLabel = topN === Infinity ? "Todos" : `Top ${topN}`;

  if (data.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 font-semibold text-sm">Chamados por CIL</h3>
        <p className="py-8 text-center text-muted-foreground text-sm">Nenhum dado de CIL no período</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-sm">Chamados por CIL &mdash; {topLabel}</h3>
        <Select
          value={topN === Infinity ? "all" : String(topN)}
          onValueChange={(v) => {
            setTopN(v === "all" ? Infinity : Number(v));
            setPageIndex(0);
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {TOP_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ChartContainer config={chartConfig} className="h-80 w-full">
        <BarChart data={paginatedData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
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
            interval={0}
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)" }} />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[0, 4, 4, 0]}
            cursor="pointer"
            onClick={(entry) => {
              const d = entry as { payload: { cil: string } };
              if (d?.payload?.cil) onCilClick(d.payload.cil);
            }}
          />
        </BarChart>
      </ChartContainer>

      <div className="mt-4 flex items-center justify-between border-border/70 border-t pt-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Linhas por página</span>
          <Select
            value={`${pageSize}`}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPageIndex(0);
            }}
          >
            <SelectTrigger className="w-20" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {totalItems} CILs &mdash; Página {pageIndex + 1} de {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setPageIndex(0)}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Primeira página</span>
              <ChevronsLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              <span className="sr-only">Página anterior</span>
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => setPageIndex((p) => Math.min(totalPages - 1, p + 1))}
              disabled={pageIndex === totalPages - 1}
            >
              <span className="sr-only">Próxima página</span>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => setPageIndex(totalPages - 1)}
              disabled={pageIndex === totalPages - 1}
            >
              <span className="sr-only">Última página</span>
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

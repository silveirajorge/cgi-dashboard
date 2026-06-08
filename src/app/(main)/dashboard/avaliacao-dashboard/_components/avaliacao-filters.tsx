"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AvaliacaoFiltersProps {
  meses: string[];
  from: string;
  to: string;
  selectedMonth: string | null;
  onMonthChange: (mes: string) => void;
  onPeriodChange: (from: string, to: string) => void;
}

function formatMesLabel(semana: string): string {
  const [year, weekNum] = semana.split("-");
  // Approximate month from week number
  const firstDayOfYear = new Date(Number(year), 0, 1);
  const weekStart = new Date(firstDayOfYear);
  weekStart.setDate(firstDayOfYear.getDate() + (Number(weekNum) - 1) * 7);
  const monthName = weekStart.toLocaleDateString("pt-BR", { month: "short" });
  return `Sem ${weekNum} · ${monthName} ${year}`;
}

export function AvaliacaoFilters({
  meses,
  from,
  to,
  selectedMonth,
  onMonthChange,
  onPeriodChange,
}: AvaliacaoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Period filter (week dropdown + date range) */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Semana:</span>
        <Select
          value={selectedMonth ?? "custom"}
          onValueChange={(value) => {
            if (value !== "custom") onMonthChange(value);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Selecionar semana" />
          </SelectTrigger>
          <SelectContent>
            {meses.map((mes) => (
              <SelectItem key={mes} value={mes}>
                {formatMesLabel(mes)}
              </SelectItem>
            ))}
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">De:</span>
        <input
          type="date"
          value={from}
          onChange={(e) => {
            const newFrom = e.target.value;
            if (newFrom && to) {
              onPeriodChange(newFrom, to);
            }
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        />
        <span className="text-muted-foreground text-sm">Até:</span>
        <input
          type="date"
          value={to}
          onChange={(e) => {
            const newTo = e.target.value;
            if (from && newTo) {
              onPeriodChange(from, newTo);
            }
          }}
          className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
        />
      </div>

      {from && to && (
        <span className="text-muted-foreground text-xs">
          {from} a {to}
        </span>
      )}
    </div>
  );
}

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PeriodFilterProps {
  meses: string[];
  from: string;
  to: string;
  selectedMonth: string | null;
  onMonthChange: (mes: string) => void;
  onPeriodChange: (from: string, to: string) => void;
}

function formatMesLabel(mes: string): string {
  const [year, month] = mes.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function PeriodFilter({ meses, from, to, selectedMonth, onMonthChange, onPeriodChange }: PeriodFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Mês:</span>
        <Select
          value={selectedMonth ?? "custom"}
          onValueChange={(value) => {
            if (value !== "custom") onMonthChange(value);
          }}
        >
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Selecionar mês" />
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

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Funcionario {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

interface AvaliacaoFiltersProps {
  meses: string[];
  from: string;
  to: string;
  selectedMonth: string | null;
  selectedFuncionarioId: string;
  funcionarios: Funcionario[];
  onMonthChange: (mes: string) => void;
  onPeriodChange: (from: string, to: string) => void;
  onFuncionarioChange: (funcionarioId: string) => void;
}

function formatMesLabel(mes: string): string {
  const [year, month] = mes.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export function AvaliacaoFilters({
  meses,
  from,
  to,
  selectedMonth,
  selectedFuncionarioId,
  funcionarios,
  onMonthChange,
  onPeriodChange,
  onFuncionarioChange,
}: AvaliacaoFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Funcionário dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm">Funcionário:</span>
        <Select value={selectedFuncionarioId} onValueChange={onFuncionarioChange}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Selecionar funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {funcionarios.map((f) => (
              <SelectItem key={f.id} value={String(f.id)}>
                {f.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Period filter (month dropdown + date range) */}
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

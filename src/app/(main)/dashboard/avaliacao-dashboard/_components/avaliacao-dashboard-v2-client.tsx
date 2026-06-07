"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { fillCarryForward } from "@/lib/carry-forward";

import { AvaliacaoFilters } from "./avaliacao-filters";

interface Funcionario {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

interface DashboardResponse {
  comparativo_semanal: Array<{
    week: string;
    produtividade: number | null;
    uso_speedops: number | null;
    erros_criticos: number;
    atrasos_faltas: number;
    media_auditor: number | null;
    media_supervisor: number | null;
  }>;
  semana_atual: {
    week: string;
    produtividade: number | null;
    uso_speedops: number | null;
    erros_criticos: number;
    atrasos_faltas: number;
    media_auditor: number | null;
    media_supervisor: number | null;
  } | null;
  semana_anterior: {
    week: string;
    produtividade: number | null;
    uso_speedops: number | null;
    erros_criticos: number;
    atrasos_faltas: number;
    media_auditor: number | null;
    media_supervisor: number | null;
  } | null;
  team: Array<{
    id: number;
    nome: string;
    avg_produtividade: number | null;
    total_atrasos: number;
    total_faltas: number;
    total_erros: number;
    uso_ferramenta: boolean;
    media_auditor: number | null;
    media_supervisor: number | null;
    score_final: number;
    status: string;
  }>;
  distribuicao: Array<{ name: string; value: number; fill: string }>;
  uso_ferramenta: {
    utilizou_pct: number;
    utilizou_count: number;
    nao_utilizou_pct: number;
    nao_utilizou_count: number;
  };
}

interface HistoricoResponse {
  evolution: Array<{
    data_avaliacao: string;
    score: number;
    perc_produtividade: number | null;
    tipo_auditoria: string;
  }>;
  comentarios: Array<{
    data: string;
    tipo: string;
    comentario: string;
  }>;
}

function generateWeekRange(fromVal: string, toVal: string): string[] {
  const weeks: string[] = [];
  const start = new Date(fromVal);
  const end = new Date(toVal);
  const current = new Date(start);
  // Adjust to Monday of the week
  const dayOfWeek = current.getDay();
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  current.setDate(current.getDate() + diffToMonday);

  while (current <= end) {
    const year = current.getFullYear();
    // Calculate ISO week number
    const temp = new Date(current.valueOf());
    const dayNum = (temp.getDay() + 6) % 7;
    temp.setDate(temp.getDate() - dayNum + 3);
    const firstThursday = temp.valueOf();
    temp.setMonth(0, 1);
    if (temp.getDay() !== 4) {
      temp.setMonth(0, 1 + ((4 - temp.getDay() + 7) % 7));
    }
    const weekNum = 1 + Math.ceil((firstThursday - temp.valueOf()) / 604800000);
    const weekStr = `${year}-${String(weekNum).padStart(2, "0")}`;
    weeks.push(weekStr);
    current.setDate(current.getDate() + 7);
  }
  return weeks;
}

export function AvaliacaoDashboardV2Client() {
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [meses, setMeses] = useState<string[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState("all");
  // Biome: unused vars are intentional scaffold — used in Task 3
  const [_selectedFuncionarioDetalhe, setSelectedFuncionarioDetalhe] = useState<number | null>(null);
  const [_detalhe, setDetalhe] = useState<HistoricoResponse | null>(null);
  const [_detalheLoading, setDetalheLoading] = useState(false);

  const initializedRef = useRef(false);

  const fetchDashboard = useCallback(async (fromVal: string, toVal: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ from: fromVal, to: toVal });
      const res = await fetch(`/api/avaliacoes/dashboard?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar dados do dashboard");
      const json: DashboardResponse = await res.json();
      // Apply carry forward to fill week gaps
      const kpis = [
        "produtividade",
        "uso_speedops",
        "erros_criticos",
        "atrasos_faltas",
        "media_auditor",
        "media_supervisor",
      ];
      const weeks = generateWeekRange(fromVal, toVal);
      const filled = fillCarryForward(weeks, json.comparativo_semanal as Array<Record<string, unknown>>, kpis);
      setData({
        ...json,
        comparativo_semanal: filled as DashboardResponse["comparativo_semanal"],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDetalhe = useCallback(
    async (funcionarioId: number) => {
      if (!from || !to) return;
      setDetalheLoading(true);
      try {
        const params = new URLSearchParams({ from, to });
        const res = await fetch(`/api/avaliacoes/funcionario/${funcionarioId}/historico?${params}`);
        if (!res.ok) throw new Error("Erro ao carregar detalhe do funcionário");
        const json: HistoricoResponse = await res.json();
        setDetalhe(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao carregar detalhe");
      } finally {
        setDetalheLoading(false);
      }
    },
    [from, to],
  );

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeData = async () => {
      try {
        const [semanasRes, funcRes] = await Promise.all([
          fetch("/api/avaliacoes/semanas"),
          fetch("/api/funcionarios?ativos=true"),
        ]);

        if (!semanasRes.ok) throw new Error("Erro ao carregar semanas disponíveis");
        if (!funcRes.ok) throw new Error("Erro ao carregar funcionários");

        const semanasJson: { semanas: string[] } = await semanasRes.json();
        const funcJson: Funcionario[] = await funcRes.json();

        setMeses(semanasJson.semanas);
        setFuncionarios(funcJson);

        if (semanasJson.semanas.length === 0) {
          setError("Nenhum dado disponível na base de dados.");
          setLoading(false);
          return;
        }

        // Set from/to to last 30 days or available range
        const lastWeek = semanasJson.semanas[semanasJson.semanas.length - 1];
        const [year, weekNum] = lastWeek.split("-");
        // Calculate date from ISO week
        const firstDayOfYear = new Date(Number(year), 0, 1);
        const daysOffset = (Number(weekNum) - 1) * 7;
        const weekStart = new Date(firstDayOfYear);
        weekStart.setDate(firstDayOfYear.getDate() + daysOffset);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Use last 30 days period
        const periodEnd = weekEnd.toISOString().split("T")[0];
        const periodStart = new Date(weekEnd);
        periodStart.setDate(periodStart.getDate() - 30);
        const fromStr = periodStart.toISOString().split("T")[0];

        setFrom(fromStr);
        setTo(periodEnd);
        setSelectedMonth(lastWeek);

        await fetchDashboard(fromStr, periodEnd);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao inicializar");
      } finally {
        setLoading(false);
      }
    };

    void initializeData();
  }, [fetchDashboard]);

  function handlePeriodChange(fromVal: string, toVal: string) {
    setFrom(fromVal);
    setTo(toVal);
    setSelectedMonth(null);
    void fetchDashboard(fromVal, toVal);
  }

  function handleFuncionarioChange(id: string) {
    setSelectedFuncionarioId(id);
  }

  function noopMonth() {
    // Month-based filtering not needed in v2 — uses period range
  }

  function handleFuncionarioSelect(id: number) {
    setSelectedFuncionarioDetalhe(id);
    void fetchDetalhe(id);
  }

  // Error state
  if (error && !loading && !data) {
    return (
      <div className="flex flex-col gap-4">
        {meses.length > 0 && (
          <AvaliacaoFilters
            meses={meses}
            from={from}
            to={to}
            selectedMonth={selectedMonth}
            selectedFuncionarioId={selectedFuncionarioId}
            funcionarios={funcionarios}
            onMonthChange={noopMonth}
            onPeriodChange={handlePeriodChange}
            onFuncionarioChange={handleFuncionarioChange}
          />
        )}
        <div className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 p-8">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Filters row */}
      {meses.length > 0 && (
        <AvaliacaoFilters
          meses={meses}
          from={from}
          to={to}
          selectedMonth={selectedMonth}
          selectedFuncionarioId={selectedFuncionarioId}
          funcionarios={funcionarios}
          onMonthChange={noopMonth}
          onPeriodChange={handlePeriodChange}
          onFuncionarioChange={handleFuncionarioChange}
        />
      )}

      {/* Loading spinner */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando dados...</span>
        </div>
      ) : data ? (
        /* Two-column layout (65/35) */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-6">
            <p className="text-muted-foreground">Carregando...</p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-center rounded-lg border bg-card p-12">
              <p className="text-muted-foreground">Selecione um funcionário para ver detalhes</p>
            </div>
          </div>
        </div>
      ) : meses.length === 0 && !loading ? (
        /* Empty state - nenhum dado disponível */
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12">
          <p className="font-medium text-lg">Nenhum dado disponível</p>
          <p className="mt-2 text-muted-foreground text-sm">Faça avaliações para ver os KPIs do grupo.</p>
        </div>
      ) : null}
    </div>
  );
}

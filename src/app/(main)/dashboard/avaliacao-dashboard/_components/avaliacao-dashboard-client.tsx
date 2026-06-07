"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { AvaliacaoFilters } from "./avaliacao-filters";
import { ComparativeChart } from "./comparative-chart";
import { HistoricoModal } from "./historico-modal";
import { KpiCards } from "./kpi-cards";

interface StatsResponse {
  media_geral: number | null;
  media_categorias: {
    pontualidade: number | null;
    qualidade: number | null;
    produtividade: number | null;
    trabalho_equipa: number | null;
    iniciativa: number | null;
    comunicacao: number | null;
  };
  total_avaliacoes: number;
  melhor_funcionario: { id: number; nome: string; media: number } | null;
  comparativo: Array<{
    funcionario_id: number;
    funcionario_nome: string;
    media: number;
  }>;
}

interface Funcionario {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export function AvaliacaoDashboardClient() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [meses, setMeses] = useState<string[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedFuncionarioId, setSelectedFuncionarioId] = useState("all");
  const [selectedFuncionario, setSelectedFuncionario] = useState<{
    id: number;
    nome: string;
  } | null>(null);

  const initializedRef = useRef(false);

  const fetchStats = useCallback(async (fromVal: string, toVal: string, funcionarioId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ from: fromVal, to: toVal });
      if (funcionarioId && funcionarioId !== "all") params.set("funcionario_id", funcionarioId);
      const res = await fetch(`/api/avaliacoes/stats?${params}`);
      if (!res.ok) throw new Error("Erro ao carregar dados");
      const json: StatsResponse = await res.json();
      if ("error" in json && json.error) throw new Error(json.error as string);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeData = async () => {
      try {
        // Fetch available months and funcionários in parallel
        const [mesesRes, funcRes] = await Promise.all([
          fetch("/api/avaliacoes/meses"),
          fetch("/api/funcionarios?ativos=true"),
        ]);

        if (!mesesRes.ok) throw new Error("Erro ao carregar meses disponíveis");
        if (!funcRes.ok) throw new Error("Erro ao carregar funcionários");

        const mesesJson: { meses: string[] } = await mesesRes.json();
        const funcJson: Funcionario[] = await funcRes.json();

        setMeses(mesesJson.meses);
        setFuncionarios(funcJson);

        if (mesesJson.meses.length === 0) {
          setError("Nenhum dado disponível na base de dados.");
          setLoading(false);
          return;
        }

        // Set from/to to first available month's full date range
        const firstMes = mesesJson.meses[mesesJson.meses.length - 1];
        const [, m] = firstMes.split("-");
        const newFrom = `${firstMes}-01`;
        const lastDay = new Date(Number(firstMes.substring(0, 4)), Number(m), 0).getDate();
        const newTo = `${firstMes}-${String(lastDay).padStart(2, "0")}`;

        setSelectedMonth(firstMes);
        setFrom(newFrom);
        setTo(newTo);

        // Fetch stats for the first month
        await fetchStats(newFrom, newTo);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao inicializar");
      } finally {
        setLoading(false);
      }
    };

    void initializeData();
  }, [fetchStats]);

  function handleMonthChange(mes: string) {
    const [, month] = mes.split("-");
    const fromVal = `${mes}-01`;
    const lastDay = new Date(Number(mes.substring(0, 4)), Number(month), 0).getDate();
    const toVal = `${mes}-${String(lastDay).padStart(2, "0")}`;
    setFrom(fromVal);
    setTo(toVal);
    setSelectedMonth(mes);
    void fetchStats(fromVal, toVal, selectedFuncionarioId || undefined);
  }

  function handlePeriodChange(fromVal: string, toVal: string) {
    setFrom(fromVal);
    setTo(toVal);
    setSelectedMonth(null);
    void fetchStats(fromVal, toVal, selectedFuncionarioId || undefined);
  }

  function handleFuncionarioChange(id: string) {
    setSelectedFuncionarioId(id);
    void fetchStats(from, to, id || undefined);
  }

  function handleFuncionarioClick(funcionarioId: number) {
    const f = funcionarios.find((f) => f.id === funcionarioId);
    if (f) setSelectedFuncionario({ id: funcionarioId, nome: f.nome });
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
            onMonthChange={handleMonthChange}
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
          onMonthChange={handleMonthChange}
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
        <>
          {/* KPI cards */}
          <KpiCards
            media_geral={data.media_geral}
            total_avaliacoes={data.total_avaliacoes}
            melhor_funcionario={data.melhor_funcionario}
            media_categorias={data.media_categorias}
            onFuncionarioClick={handleFuncionarioClick}
          />

          {/* BarChart comparativo */}
          <ComparativeChart data={data.comparativo} onBarClick={handleFuncionarioClick} />
        </>
      ) : meses.length === 0 && !loading ? (
        /* Empty state - nenhum dado disponível */
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12">
          <p className="font-medium text-lg">Nenhum dado disponível</p>
          <p className="mt-2 text-muted-foreground text-sm">Faça avaliações para ver os KPIs do grupo.</p>
        </div>
      ) : null}

      {selectedFuncionario && (
        <HistoricoModal
          funcionarioId={selectedFuncionario.id}
          funcionarioNome={selectedFuncionario.nome}
          onClose={() => setSelectedFuncionario(null)}
        />
      )}
    </div>
  );
}

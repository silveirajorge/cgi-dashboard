"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { PeriodFilter } from "./period-filter";

interface KpiDataResponse {
  total: number;
  canais: Array<{ canal: string; count: number }>;
  daily: Array<{ date: string; count: number }>;
  meses_disponiveis: Array<{ mes_competencia: string }>;
  crescimento: { value: number | null; label: string | null };
  workdays: number;
  avg_daily: number;
  max_day: { date: string; count: number } | null;
  tipologias_por_canal: Record<string, Array<{ justificacao: string; count: number }>>;
}

export function KpiDashboardClient() {
  const [data, setData] = useState<KpiDataResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const initializedRef = useRef(false);

  const fetchData = useCallback(async (fromVal: string, toVal: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/data?from=${fromVal}&to=${toVal}`);
      if (!res.ok) throw new Error("Erro ao carregar dados");

      const json: KpiDataResponse = await res.json();
      setData(json);

      // Auto-select last available month on first load
      if (!initializedRef.current && json.meses_disponiveis.length > 0) {
        initializedRef.current = true;
        const lastMes = json.meses_disponiveis[json.meses_disponiveis.length - 1].mes_competencia;
        if (lastMes !== fromVal.substring(0, 7)) {
          setSelectedMonth(lastMes);
          const [, month] = lastMes.split("-");
          const newFrom = `${lastMes}-01`;
          const lastDay = new Date(Number(lastMes.substring(0, 4)), Number(month), 0).getDate();
          const newTo = `${lastMes}-${String(lastDay).padStart(2, "0")}`;
          setFrom(newFrom);
          setTo(newTo);
          // Re-fetch with corrected dates
          const res2 = await fetch(`/api/data?from=${newFrom}&to=${newTo}`);
          if (res2.ok) {
            const json2: KpiDataResponse = await res2.json();
            setData(json2);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: use current month as default
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const lastDay = String(new Date(year, now.getMonth() + 1, 0).getDate()).padStart(2, "0");
    const defaultFrom = `${year}-${month}-01`;
    const defaultTo = `${year}-${month}-${lastDay}`;
    setFrom(defaultFrom);
    setTo(defaultTo);
    void fetchData(defaultFrom, defaultTo);
  }, [fetchData]);

  function handlePeriodChangeFromMonth(mes: string) {
    const [, month] = mes.split("-");
    const fromVal = `${mes}-01`;
    const lastDay = new Date(Number(mes.substring(0, 4)), Number(month), 0).getDate();
    const toVal = `${mes}-${String(lastDay).padStart(2, "0")}`;
    setFrom(fromVal);
    setTo(toVal);
    setSelectedMonth(mes);
    void fetchData(fromVal, toVal);
  }

  function handlePeriodChange(fromVal: string, toVal: string) {
    setFrom(fromVal);
    setTo(toVal);
    setSelectedMonth(null);
    void fetchData(fromVal, toVal);
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-destructive/50 bg-destructive/5 p-8">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Period filter */}
      {data?.meses_disponiveis && (
        <PeriodFilter
          meses={data.meses_disponiveis.map((m) => m.mes_competencia)}
          from={from}
          to={to}
          selectedMonth={selectedMonth}
          onMonthChange={handlePeriodChangeFromMonth}
          onPeriodChange={handlePeriodChange}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Carregando dados...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center py-16">
          <p className="text-muted-foreground">
            {data ? `${data.total} pedidos no período` : "Nenhum dado disponível"}
          </p>
        </div>
      )}
    </div>
  );
}

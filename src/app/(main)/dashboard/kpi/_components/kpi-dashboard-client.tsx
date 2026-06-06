"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2 } from "lucide-react";

import { CarteiraModal } from "./carteira-modal";
import { ChannelChart } from "./channel-chart";
import { CilChart } from "./cil-chart";
import { CilModal } from "./cil-modal";
import { DailyChart } from "./daily-chart";
import { KpiCards } from "./kpi-cards";
import { PeriodFilter } from "./period-filter";
import { TipologySection } from "./tipology-section";

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

interface CilResponse {
  cil_aggregates: Array<{ cil: string; count: number }>;
}

function getMonthFromPeriod(_from: string, to: string): string {
  return to.substring(0, 7);
}

export function KpiDashboardClient() {
  const [data, setData] = useState<KpiDataResponse | null>(null);
  const [cilData, setCilData] = useState<CilResponse | null>(null);
  const [carteira, setCarteira] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const [selectedCil, setSelectedCil] = useState<string | null>(null);
  const [carteiraModalOpen, setCarteiraModalOpen] = useState(false);
  const [carteiraMes, setCarteiraMes] = useState<string | null>(null);

  const initializedRef = useRef(false);

  const fetchData = useCallback(async (fromVal: string, toVal: string) => {
    setLoading(true);
    setError(null);

    try {
      const [dataRes, cilRes] = await Promise.all([
        fetch(`/api/data?from=${fromVal}&to=${toVal}`),
        fetch(`/api/cil?from=${fromVal}&to=${toVal}`),
      ]);

      if (!dataRes.ok) throw new Error("Erro ao carregar dados");
      if (!cilRes.ok) throw new Error("Erro ao carregar CILs");

      const dataJson: KpiDataResponse = await dataRes.json();
      const cilJson: CilResponse = await cilRes.json();

      setData(dataJson);
      setCilData(cilJson);

      // Fetch carteira for the end month of the range
      const mes = getMonthFromPeriod(fromVal, toVal);
      const carteiraRes = await fetch(`/api/carteira?mes=${mes}`);
      if (carteiraRes.ok) {
        const carteiraJson = await carteiraRes.json();
        setCarteira(carteiraJson.total_clientes);
      }

      // Auto-select last available month on first load
      if (!initializedRef.current && dataJson.meses_disponiveis.length > 0) {
        initializedRef.current = true;
        const lastMes = dataJson.meses_disponiveis[dataJson.meses_disponiveis.length - 1].mes_competencia;
        if (lastMes !== fromVal.substring(0, 7)) {
          setSelectedMonth(lastMes);
          const [, month] = lastMes.split("-");
          const newFrom = `${lastMes}-01`;
          const lastDay = new Date(Number(lastMes.substring(0, 4)), Number(month), 0).getDate();
          const newTo = `${lastMes}-${String(lastDay).padStart(2, "0")}`;
          setFrom(newFrom);
          setTo(newTo);
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

  function handleCilClick(cil: string) {
    setSelectedCil(cil);
  }

  function handleCilClose() {
    setSelectedCil(null);
  }

  function handleCarteiraClick() {
    const mes = getMonthFromPeriod(from, to);
    setCarteiraMes(mes);
    setCarteiraModalOpen(true);
  }

  function handleCarteiraClose() {
    setCarteiraModalOpen(false);
    setCarteiraMes(null);
  }

  function handleCarteiraSave(value: number) {
    setCarteira(value);
    setCarteiraModalOpen(false);
    setCarteiraMes(null);
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
      ) : data ? (
        <>
          {/* KPI cards */}
          <KpiCards
            total={data.total}
            carteira={carteira}
            crescimento={data.crescimento}
            avg_daily={data.avg_daily}
            max_day={data.max_day}
            workdays={data.workdays}
            onCarteiraClick={handleCarteiraClick}
          />

          {/* Charts grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DailyChart data={data.daily} />
            <ChannelChart data={data.canais} />
          </div>

          {/* CIL Chart */}
          {cilData && cilData.cil_aggregates.length > 0 && (
            <CilChart data={cilData.cil_aggregates} onCilClick={handleCilClick} />
          )}

          {/* Tipology Section */}
          {Object.keys(data.tipologias_por_canal).length > 0 && (
            <TipologySection tipologiasPorCanal={data.tipologias_por_canal} />
          )}
        </>
      ) : null}

      {/* CIL Modal */}
      {selectedCil && <CilModal cil={selectedCil} from={from} to={to} onClose={handleCilClose} />}

      {/* Carteira Modal */}
      {carteiraModalOpen && (
        <CarteiraModal
          open={carteiraModalOpen}
          mes={carteiraMes}
          currentValue={carteira}
          onSave={handleCarteiraSave}
          onClose={handleCarteiraClose}
        />
      )}
    </div>
  );
}

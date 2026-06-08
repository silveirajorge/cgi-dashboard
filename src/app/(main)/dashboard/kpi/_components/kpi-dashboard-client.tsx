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

function getPreviousMonth(mes: string): string {
  const [year, month] = mes.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function KpiDashboardClient() {
  const [data, setData] = useState<KpiDataResponse | null>(null);
  const [cilData, setCilData] = useState<CilResponse | null>(null);
  const [carteira, setCarteira] = useState<number | null>(null);
  const [crescimentoCarteira, setCrescimentoCarteira] = useState<{
    value: number | null;
    label: string | null;
  }>({ value: null, label: null });
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

      // Fetch carteira
      const mes = getMonthFromPeriod(fromVal, toVal);
      const carteiraRes = await fetch(`/api/carteira?mes=${mes}`);
      let currentCarteira: number | null = null;
      if (carteiraRes.ok) {
        const carteiraJson = await carteiraRes.json();
        currentCarteira = carteiraJson.total_clientes;
        setCarteira(currentCarteira);
      }

      // Fetch previous month carteira for growth
      const prevMes = getPreviousMonth(mes);
      const prevCarteiraRes = await fetch(`/api/carteira?mes=${prevMes}`);
      if (prevCarteiraRes.ok && currentCarteira !== null) {
        const prevCarteiraJson = await prevCarteiraRes.json();
        if (prevCarteiraJson.total_clientes !== null && prevCarteiraJson.total_clientes > 0) {
          setCrescimentoCarteira({
            value: ((currentCarteira - prevCarteiraJson.total_clientes) / prevCarteiraJson.total_clientes) * 100,
            label: "vs. Mês Anterior",
          });
        } else {
          setCrescimentoCarteira({ value: null, label: null });
        }
      } else {
        setCrescimentoCarteira({ value: null, label: null });
      }
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
        // First, get the list of available months
        const allRes = await fetch("/api/data");
        if (!allRes.ok) throw new Error("Erro ao carregar meses disponíveis");

        const allJson: KpiDataResponse = await allRes.json();

        if (allJson.meses_disponiveis.length === 0) {
          setError("Nenhum dado disponível na base de dados.");
          setLoading(false);
          return;
        }

        // Load the most recent month with data
        const lastMes = allJson.meses_disponiveis[allJson.meses_disponiveis.length - 1].mes_competencia;
        const [, m] = lastMes.split("-");
        const newFrom = `${lastMes}-01`;
        const lastD = new Date(Number(lastMes.substring(0, 4)), Number(m), 0).getDate();
        const newTo = `${lastMes}-${String(lastD).padStart(2, "0")}`;

        setSelectedMonth(lastMes);
        setFrom(newFrom);
        setTo(newTo);

        // Fetch data for the last available month
        const [dataRes, cilRes] = await Promise.all([
          fetch(`/api/data?from=${newFrom}&to=${newTo}`),
          fetch(`/api/cil?from=${newFrom}&to=${newTo}`),
        ]);

        if (!dataRes.ok || !cilRes.ok) throw new Error("Erro ao carregar dados");

        const dataJson: KpiDataResponse = await dataRes.json();
        const cilJson: CilResponse = await cilRes.json();

        setData(dataJson);
        setCilData(cilJson);

        // Fetch carteira — try the displayed month first, fall back to last record
        const carteiraRes = await fetch(`/api/carteira?mes=${lastMes}`);
        let currentCarteira: number | null = null;
        if (carteiraRes.ok) {
          const carteiraJson = await carteiraRes.json();
          if (carteiraJson.total_clientes !== null) {
            currentCarteira = carteiraJson.total_clientes;
            setCarteira(currentCarteira);
          } else {
            // Try to get the last available carteira record
            const latestRes = await fetch("/api/carteira?mes=latest");
            if (latestRes.ok) {
              const latestJson = await latestRes.json();
              if (latestJson.total_clientes !== null) {
                currentCarteira = latestJson.total_clientes;
                setCarteira(currentCarteira);
              }
            }
          }
        }

        // Fetch previous month carteira for growth
        if (currentCarteira !== null) {
          const prevMes = getPreviousMonth(lastMes);
          const prevCarteiraRes = await fetch(`/api/carteira?mes=${prevMes}`);
          if (prevCarteiraRes.ok) {
            const prevCarteiraJson = await prevCarteiraRes.json();
            if (prevCarteiraJson.total_clientes !== null && prevCarteiraJson.total_clientes > 0) {
              setCrescimentoCarteira({
                value: ((currentCarteira - prevCarteiraJson.total_clientes) / prevCarteiraJson.total_clientes) * 100,
                label: "vs. Mês Anterior",
              });
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido ao inicializar");
      } finally {
        setLoading(false);
      }
    };

    void initializeData();
  }, []);

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

  async function handleCarteiraSave(value: number) {
    setCarteira(value);
    setCarteiraModalOpen(false);
    setCarteiraMes(null);

    // Recalcular crescimento da carteira
    const currentMes = carteiraMes || getMonthFromPeriod(from, to);
    const prevMes = getPreviousMonth(currentMes);
    try {
      const prevRes = await fetch(`/api/carteira?mes=${prevMes}`);
      if (prevRes.ok) {
        const prevJson = await prevRes.json();
        if (prevJson.total_clientes !== null && prevJson.total_clientes > 0) {
          setCrescimentoCarteira({
            value: ((value - prevJson.total_clientes) / prevJson.total_clientes) * 100,
            label: "vs. Mês Anterior",
          });
        } else {
          setCrescimentoCarteira({ value: null, label: null });
        }
      }
    } catch {
      setCrescimentoCarteira({ value: null, label: null });
    }
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
            crescimentoCarteira={crescimentoCarteira}
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

          {/* Tipology Section */}
          {Object.keys(data.tipologias_por_canal).length > 0 && (
            <TipologySection tipologiasPorCanal={data.tipologias_por_canal} />
          )}

          {/* CIL Chart */}
          {cilData && cilData.cil_aggregates.length > 0 && (
            <CilChart data={cilData.cil_aggregates} onCilClick={handleCilClick} />
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

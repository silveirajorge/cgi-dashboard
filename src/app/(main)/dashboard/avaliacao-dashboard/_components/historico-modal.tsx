"use client";

import { useCallback, useEffect, useState } from "react";

import { format, parseISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CATEGORIAS = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "qualidade", label: "Qualidade" },
  { key: "produtividade", label: "Produtividade" },
  { key: "trabalho_equipa", label: "Trabalho em Equipa" },
  { key: "iniciativa", label: "Iniciativa" },
  { key: "comunicacao", label: "Comunicação" },
] as const;

interface AvaliacaoRecord {
  id: number;
  data_avaliacao: string;
  pontualidade: number;
  qualidade: number;
  produtividade: number;
  trabalho_equipa: number;
  iniciativa: number;
  comunicacao: number;
  media: number;
  comentario: string | null;
  funcionario_id: number;
  funcionario_nome: string;
}

interface HistoricoModalProps {
  funcionarioId: number;
  funcionarioNome: string;
  onClose: () => void;
}

export function HistoricoModal({ funcionarioId, funcionarioNome, onClose }: HistoricoModalProps) {
  const [records, setRecords] = useState<AvaliacaoRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchHistorico = useCallback(
    async (fromVal: string, toVal: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ funcionario_id: String(funcionarioId) });
        if (fromVal) params.set("from", fromVal);
        if (toVal) params.set("to", toVal);
        const res = await fetch(`/api/avaliacoes?${params}`);
        if (!res.ok) throw new Error("Erro ao carregar histórico");
        const json: AvaliacaoRecord[] = await res.json();
        setRecords(json);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    },
    [funcionarioId],
  );

  useEffect(() => {
    void fetchHistorico(from, to);
  }, [fetchHistorico, from, to]);

  const chartConfig = {
    media: { label: "Média Geral", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  // Dados ordenados por data ascendente para o gráfico
  const chartData = [...records].sort((a, b) => a.data_avaliacao.localeCompare(b.data_avaliacao));

  return (
    <Dialog
      open={funcionarioId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>
            {funcionarioNome} &mdash; {records.length} avaliações
          </DialogTitle>
        </DialogHeader>

        {/* Filtro de período interno (date range) */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-muted-foreground text-sm">De:</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
          <span className="text-muted-foreground text-sm">Até:</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 rounded-lg border border-input bg-transparent px-2.5 text-sm"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* LineChart — Evolução da Média Geral */}
            <ChartContainer config={chartConfig} className="h-80 w-full">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillMedia" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-media)" stopOpacity={0.36} />
                    <stop offset="95%" stopColor="var(--color-media)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeOpacity={0.5} />
                <XAxis
                  dataKey="data_avaliacao"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  fontSize={12}
                  tickFormatter={(d: string) => format(parseISO(d), "dd/MM")}
                />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(_l, p) => {
                        const payload = (p as unknown as Array<{ payload: AvaliacaoRecord }>)?.[0]?.payload;
                        const d = payload?.data_avaliacao;
                        return d ? format(parseISO(d), "dd 'de' MMMM 'de' yyyy") : "";
                      }}
                    />
                  }
                  cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
                />
                <Area
                  dataKey="media"
                  type="natural"
                  fill="url(#fillMedia)"
                  stroke="var(--color-media)"
                  strokeWidth={1.25}
                  dot={{ r: 3 }}
                />
                <Line dataKey="media" type="natural" stroke="var(--color-media)" strokeWidth={1.5} dot={{ r: 3 }} />
              </LineChart>
            </ChartContainer>

            {/* Tabela de Detalhes */}
            <div className="max-h-[40vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    {CATEGORIAS.map((cat) => (
                      <TableHead key={cat.key} className="text-center">
                        {cat.label}
                      </TableHead>
                    ))}
                    <TableHead className="text-center">Média</TableHead>
                    <TableHead>Comentário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground">
                        Nenhuma avaliação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{format(parseISO(r.data_avaliacao), "dd/MM/yyyy")}</TableCell>
                        {CATEGORIAS.map((cat) => (
                          <TableCell key={cat.key} className="text-center">
                            {r[cat.key]}
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">{r.media.toFixed(2)}</TableCell>
                        <TableCell className="max-w-48 truncate">{r.comentario ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

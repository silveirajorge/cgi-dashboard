"use client";

import { useCallback, useEffect, useState } from "react";

import { Eye, Loader2, Pencil, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { AvaliacaoDetailModal } from "./avaliacao-detail-modal";

interface AvaliacaoResumo {
  id: number;
  data_avaliacao: string;
  media: number;
  funcionario_nome: string;
  funcionario_id: number;
}

interface FuncionarioOption {
  id: number;
  nome: string;
}

interface AvaliacoesTableProps {
  refreshKey: number;
  onNovaAvaliacao: () => void;
  onEditar?: (id: number) => void;
}

export function AvaliacoesTable({ refreshKey, onNovaAvaliacao, onEditar }: AvaliacoesTableProps) {
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [funcionarios, setFuncionarios] = useState<FuncionarioOption[]>([]);
  const [filtroFuncionarioId, setFiltroFuncionarioId] = useState("all");
  const [filtroFrom, setFiltroFrom] = useState("");
  const [filtroTo, setFiltroTo] = useState("");
  const [detailModalId, setDetailModalId] = useState<number | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refreshKey is a state variable intentionally included to trigger refetch
  const fetchAvaliacoes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroFuncionarioId && filtroFuncionarioId !== "all") params.set("funcionario_id", filtroFuncionarioId);
      if (filtroFrom) params.set("from", filtroFrom);
      if (filtroTo) params.set("to", filtroTo);

      const res = await fetch(`/api/avaliacoes?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar avaliações. Tente recarregar a página.");
      const data: AvaliacaoResumo[] = await res.json();
      setAvaliacoes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [filtroFuncionarioId, filtroFrom, filtroTo, refreshKey]);

  const fetchFuncionarios = useCallback(async () => {
    try {
      const res = await fetch("/api/funcionarios?ativos=true");
      if (res.ok) {
        const data: FuncionarioOption[] = await res.json();
        setFuncionarios(data);
      }
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    void fetchAvaliacoes();
  }, [fetchAvaliacoes]);

  useEffect(() => {
    void fetchFuncionarios();
  }, [fetchFuncionarios]);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todas as Avaliações</CardTitle>
            <Button onClick={onNovaAvaliacao}>
              <Plus className="size-4" />
              Nova Avaliação
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter bar: funcionário select + date range */}
          <div className="mb-4 flex flex-wrap items-end gap-3">
            {/* Dropdown funcionário */}
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-xs">Funcionário</span>
              <Select value={filtroFuncionarioId} onValueChange={setFiltroFuncionarioId}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {funcionarios.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filtro-from" className="text-muted-foreground text-xs">
                De
              </label>
              <Input
                id="filtro-from"
                type="date"
                value={filtroFrom}
                onChange={(e) => setFiltroFrom(e.target.value)}
                className="h-9 w-[160px]"
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label htmlFor="filtro-to" className="text-muted-foreground text-xs">
                Até
              </label>
              <Input
                id="filtro-to"
                type="date"
                value={filtroTo}
                onChange={(e) => setFiltroTo(e.target.value)}
                className="h-9 w-[160px]"
              />
            </div>

            {/* Clear filters button (só visível se algum filtro ativo) */}
            {(filtroFuncionarioId !== "all" || filtroFrom.length > 0 || filtroTo.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFiltroFuncionarioId("all");
                  setFiltroFrom("");
                  setFiltroTo("");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <p className="text-destructive text-xs">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void fetchAvaliacoes()} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Média</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {avaliacoes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Nenhuma avaliação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  avaliacoes.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.data_avaliacao}</TableCell>
                      <TableCell className="font-medium">{a.funcionario_nome}</TableCell>
                      <TableCell>
                        <Badge variant="default">{a.media.toFixed(2)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon-sm" onClick={() => onEditar?.(a.id)} title="Editar">
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDetailModalId(a.id)}
                          title="Ver detalhes"
                        >
                          <Eye className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {detailModalId !== null && (
        <AvaliacaoDetailModal
          avaliacaoId={detailModalId}
          open={detailModalId !== null}
          onClose={() => setDetailModalId(null)}
        />
      )}
    </>
  );
}

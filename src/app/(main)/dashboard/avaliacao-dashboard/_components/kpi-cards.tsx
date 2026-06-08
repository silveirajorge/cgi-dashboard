"use client";

import { Award, BarChart3, ClipboardCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CATEGORIAS = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "qualidade", label: "Qualidade" },

  { key: "trabalho_equipa", label: "Trabalho em Equipa" },
  { key: "iniciativa", label: "Iniciativa" },
  { key: "comunicacao", label: "Comunicação" },
] as const;

interface KpiCardsProps {
  media_geral: number | null;
  total_avaliacoes: number;
  melhor_funcionario: { id: number; nome: string; media: number } | null;
  media_categorias: {
    pontualidade: number | null;
    qualidade: number | null;
    produtividade: number | null;
    trabalho_equipa: number | null;
    iniciativa: number | null;
    comunicacao: number | null;
  };
  media_nota_auditoria: number | null;
  total_atrasos: number;
  total_faltas: number;
  total_erros_criticos: number;
  media_produtividade: number | null;
  onFuncionarioClick?: (funcionarioId: number) => void;
}

export function KpiCards({
  media_geral,
  total_avaliacoes,
  melhor_funcionario,
  media_categorias,
  media_nota_auditoria,
  total_atrasos,
  total_faltas,
  total_erros_criticos,
  media_produtividade,
  onFuncionarioClick,
}: KpiCardsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Primary KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Média Geral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <BarChart3 className="size-4" />
              </div>
              Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {media_geral !== null ? media_geral.toFixed(2) : "---"}
            </span>
          </CardContent>
        </Card>

        {/* Total de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <ClipboardCheck className="size-4" />
              </div>
              Total de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">{total_avaliacoes}</span>
          </CardContent>
        </Card>

        {/* Melhor Funcionário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <Award className="size-4" />
              </div>
              Melhor Funcionário
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {melhor_funcionario ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
                    {melhor_funcionario.media.toFixed(2)}
                  </span>
                  <Badge variant="default">Melhor</Badge>
                </div>
                <button
                  type="button"
                  className="text-muted-foreground text-sm hover:text-foreground hover:underline text-left"
                  onClick={() => onFuncionarioClick?.(melhor_funcionario.id)}
                >
                  {melhor_funcionario.nome}
                </button>
              </>
            ) : (
              <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">---</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {CATEGORIAS.map((cat) => (
          <Card key={cat.key}>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-xs font-medium">{cat.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
                {media_categorias[cat.key]?.toFixed(2) ?? "---"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* === KPIs de Auditoria === */}
      <h3 className="font-medium text-sm">Auditoria</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Média Nota Auditoria */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">Média Nota Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
              {media_nota_auditoria !== null ? media_nota_auditoria.toFixed(1) : "---"}
            </span>
          </CardContent>
        </Card>

        {/* Total Atrasos / Faltas */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">Atrasos / Faltas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
              {total_atrasos + total_faltas}
            </span>
            <span className="text-muted-foreground text-xs">
              {total_atrasos} atraso(s) · {total_faltas} falta(s)
            </span>
          </CardContent>
        </Card>

        {/* Erros Críticos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">Erros Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
              {total_erros_criticos}
            </span>
          </CardContent>
        </Card>

        {/* Média Produtividade */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-muted-foreground text-xs font-medium">Média Produtividade</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
              {media_produtividade !== null ? `${media_produtividade.toFixed(0)}%` : "---"}
            </span>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

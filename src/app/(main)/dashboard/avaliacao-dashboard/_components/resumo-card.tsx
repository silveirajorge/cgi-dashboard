"use client";

import { Award } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ScoreBadge } from "./score-badge";

interface ResumoCardProps {
  funcionario: {
    nome: string;
    score_final: number;
    status: string;
    avg_produtividade: number | null;
    media_auditor: number | null;
    media_supervisor: number | null;
    total_atrasos: number;
    total_faltas: number;
    total_erros: number;
  };
}

function medalColor(status: string): string {
  switch (status) {
    case "excelente":
      return "#22c55e";
    case "bom":
      return "#3b82f6";
    case "atencao":
      return "#eab308";
    default:
      return "#ef4444";
  }
}

export function ResumoCard({ funcionario }: ResumoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{funcionario.nome}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Score Final grande com medalha */}
        <div className="flex flex-col items-center gap-2 rounded-lg bg-muted/50 p-4">
          <Award className="size-6" style={{ color: medalColor(funcionario.status) }} />
          <span className="font-bold text-5xl tabular-nums leading-none tracking-tight">{funcionario.score_final}</span>
          <ScoreBadge status={funcionario.status} />
        </div>

        {/* Grid de métricas */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs">Produtividade</span>
            <span className="font-medium tabular-nums">
              {funcionario.avg_produtividade !== null ? `${funcionario.avg_produtividade.toFixed(0)}%` : "---"}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs">Média Auditor</span>
            <span className="font-medium tabular-nums">
              {funcionario.media_auditor !== null ? funcionario.media_auditor.toFixed(1) : "---"}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs">Média Supervisor</span>
            <span className="font-medium tabular-nums">
              {funcionario.media_supervisor !== null ? funcionario.media_supervisor.toFixed(1) : "---"}
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs">Atrasos + Faltas</span>
            <span className="font-medium tabular-nums">{funcionario.total_atrasos + funcionario.total_faltas}</span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg border p-3">
            <span className="text-muted-foreground text-xs">Erros</span>
            <span className="font-medium tabular-nums">{funcionario.total_erros}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

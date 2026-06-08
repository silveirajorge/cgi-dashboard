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

const STATUS_LABEL: Record<string, string> = {
  excelente: "Excelente",
  bom: "Bom",
  atencao: "Atenção",
  critico: "Crítico",
};

function statusBg(status: string): string {
  switch (status) {
    case "excelente":
      return "bg-[#22c55e]";
    case "bom":
      return "bg-[#3b82f6]";
    case "atencao":
      return "bg-[#eab308]";
    default:
      return "bg-[#ef4444]";
  }
}

export function ResumoCard({ funcionario }: ResumoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{funcionario.nome}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Score Final com fundo colorido */}
        <div className={`flex items-center gap-5 rounded-lg ${statusBg(funcionario.status)} py-5 pr-5 pl-5`}>
          <Award className="size-14 shrink-0 text-white/90" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-5xl tabular-nums leading-none tracking-tight text-white">
              {funcionario.score_final}
            </span>
            <span className="font-medium text-base text-white/80">
              {STATUS_LABEL[funcionario.status] ?? funcionario.status}
            </span>
          </div>
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

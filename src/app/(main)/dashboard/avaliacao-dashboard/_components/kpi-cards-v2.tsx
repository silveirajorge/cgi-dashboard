"use client";

import { AlertTriangle, CheckCircle2, Clock, TrendingUp, UserCheck, UserCog } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TendenciaIndicator } from "./tendencia-indicator";

interface Semana {
  week: string;
  produtividade: number | null;
  uso_speedops: number | null;
  erros_criticos: number;
  atrasos_faltas: number;
  media_auditor: number | null;
  media_supervisor: number | null;
}

interface KpiCardsV2Props {
  semanaAtual: Semana | null;
  semanaAnterior: Semana | null;
}

const CARDS = [
  {
    key: "produtividade",
    label: "Produtividade Média",
    icon: TrendingUp,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "uso_speedops",
    label: "Uso de SpeedOps",
    icon: CheckCircle2,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "erros_criticos",
    label: "Erros Críticos",
    icon: AlertTriangle,
    format: (v: number) => String(v),
  },
  {
    key: "atrasos_faltas",
    label: "Atrasos/Faltas",
    icon: Clock,
    format: (v: number) => String(v),
  },
  {
    key: "media_auditor",
    label: "Média Auditor",
    icon: UserCheck,
    format: (v: number) => v.toFixed(1),
  },
  {
    key: "media_supervisor",
    label: "Média Supervisor",
    icon: UserCog,
    format: (v: number) => v.toFixed(1),
  },
] as const;

export function KpiCardsV2({ semanaAtual, semanaAnterior }: KpiCardsV2Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {CARDS.map((card) => {
        const currentVal = semanaAtual ? (semanaAtual[card.key as keyof Semana] as number | null) : null;
        const previousVal = semanaAnterior ? (semanaAnterior[card.key as keyof Semana] as number | null) : null;
        const Icon = card.icon;

        return (
          <Card key={card.key}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                <Icon className="size-3.5" />
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <span className="font-medium text-2xl tabular-nums leading-none tracking-tight">
                {currentVal !== null ? card.format(currentVal) : "---"}
              </span>
              <TendenciaIndicator current={currentVal} previous={previousVal} />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

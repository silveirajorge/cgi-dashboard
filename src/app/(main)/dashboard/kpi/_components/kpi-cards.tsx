"use client";

import { ArrowUpRight, BarChart3, Calendar, TrendingDown, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface KpiCardsProps {
  total: number;
  carteira: number | null;
  crescimento: { value: number | null; label: string | null };
  crescimentoCarteira: { value: number | null; label: string | null };
  avg_daily: number;
  max_day: { date: string; count: number } | null;
  workdays: number;
  onCarteiraClick: () => void;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
}

export function KpiCards({
  total,
  carteira,
  crescimento,
  crescimentoCarteira,
  avg_daily,
  max_day,
  workdays,
  onCarteiraClick,
}: KpiCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {/* Total de Pedidos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <BarChart3 className="size-4" />
            </div>
            Total de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">{formatNumber(total)}</span>
            {crescimento.value !== null && (
              <Badge variant={crescimento.value >= 0 ? "default" : "destructive"}>
                {crescimento.value >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {crescimento.value >= 0 ? "+" : ""}
                {crescimento.value.toFixed(1)}%
              </Badge>
            )}
          </div>
          {crescimento.label && <CardDescription>{crescimento.label}</CardDescription>}
        </CardContent>
      </Card>

      {/* Carteira de Clientes */}
      <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={onCarteiraClick}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Users className="size-4" />
            </div>
            Carteira de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
            {carteira !== null ? formatNumber(carteira) : "---"}
          </span>
          <CardDescription>Clique para editar</CardDescription>
        </CardContent>
      </Card>

      {/* Crescimento Líquido (Carteira) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              {crescimentoCarteira.value !== null && crescimentoCarteira.value >= 0 ? (
                <TrendingUp className="size-4" />
              ) : (
                <TrendingDown className="size-4" />
              )}
            </div>
            Crescimento Líquido
          </CardTitle>
          <CardDescription>Carteira de Clientes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
              {crescimentoCarteira.value !== null
                ? `${crescimentoCarteira.value >= 0 ? "+" : ""}${crescimentoCarteira.value.toFixed(1)}%`
                : "---"}
            </span>
          </div>
          {crescimentoCarteira.label && <CardDescription>{crescimentoCarteira.label}</CardDescription>}
        </CardContent>
      </Card>

      {/* Média Diária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <Calendar className="size-4" />
            </div>
            Média Diária
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
            {workdays > 0 ? formatNumber(avg_daily) : "---"}
          </span>
          <CardDescription>{workdays} dias úteis</CardDescription>
        </CardContent>
      </Card>

      {/* Dia com maior volume */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              <ArrowUpRight className="size-4" />
            </div>
            Dia com maior volume
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          <span className="font-medium text-3xl tabular-nums leading-none tracking-tight">
            {max_day ? formatNumber(max_day.count) : "---"}
          </span>
          {max_day && <CardDescription>{formatDate(max_day.date)}</CardDescription>}
        </CardContent>
      </Card>
    </div>
  );
}

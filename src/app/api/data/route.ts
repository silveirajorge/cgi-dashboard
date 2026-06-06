import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

function countWorkdays(fromStr: string, toStr: string): number {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  let count = 0;
  const current = new Date(from);
  while (current <= to) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

function getPreviousPeriod(from: string, to: string) {
  const duration = new Date(to).getTime() - new Date(from).getTime();
  const prevTo = new Date(new Date(from).getTime() - 86400000).toISOString().split("T")[0];
  const prevFrom = new Date(new Date(prevTo).getTime() - duration).toISOString().split("T")[0];
  return { prevFrom, prevTo };
}

function getPeriodLabel(from: string, to: string): string {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86400000);
  // If period is approximately 1 month (28-31 days)
  if (diffDays >= 28 && diffDays <= 31) {
    return "vs. Mês Anterior";
  }
  return "vs. Período Anterior";
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const db = getDb();

    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'").get();

    if (!tableExists) {
      return NextResponse.json({
        total: 0,
        canais: [],
        daily: [],
        meses_disponiveis: [],
        crescimento: { value: null, label: null },
        workdays: 0,
        avg_daily: 0,
        max_day: null,
        tipologias_por_canal: {},
      });
    }

    const conditions: string[] = [];
    const params: string[] = [];
    if (from && to) {
      conditions.push("dt_registo >= ? AND dt_registo <= ?");
      params.push(from, `${to} 23:59:59`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total
    const totalRow = db.prepare(`SELECT COUNT(*) as total FROM pedidos ${where}`).get(...params) as { total: number };
    const total = totalRow.total;

    // Canais (CASE WHEN normalization — D-21)
    const canais = db
      .prepare(
        `SELECT
          CASE
            WHEN "receção" IN ('Portal', 'Portal da ERSE', 'Portal Queixa', 'Formulário Site Público') THEN 'Portal'
            WHEN "receção" IN ('Back-Office', 'Telefone Back-Office') THEN 'Back-Office'
            WHEN "receção" = 'Email' THEN 'Email'
            WHEN "receção" = 'Telefone Front' THEN 'Telefone Front'
            ELSE 'Outros'
          END as canal,
          COUNT(*) as count
        FROM pedidos
        ${where}
        GROUP BY canal
        ORDER BY count DESC`,
      )
      .all(...params) as { canal: string; count: number }[];

    // Daily evolution (SUBSTR dt_contato — Pitfall 5)
    const daily = db
      .prepare(
        `SELECT SUBSTR(dt_contato, 1, 10) as date, COUNT(*) as count
        FROM pedidos
        ${where}
        GROUP BY date
        ORDER BY date`,
      )
      .all(...params) as { date: string; count: number }[];

    // Meses disponíveis
    const meses_disponiveis = db
      .prepare("SELECT DISTINCT mes_competencia FROM pedidos ORDER BY mes_competencia")
      .all() as { mes_competencia: string }[];

    // Crescimento (D-42 a D-46)
    let crescimento: { value: number | null; label: string | null } = {
      value: null,
      label: null,
    };

    if (from && to && total > 0) {
      const { prevFrom, prevTo } = getPreviousPeriod(from, to);
      const prevRow = db
        .prepare(`SELECT COUNT(*) as total FROM pedidos WHERE dt_registo >= ? AND dt_registo <= ?`)
        .get(prevFrom, `${prevTo} 23:59:59`) as { total: number };

      if (prevRow.total > 0) {
        crescimento = {
          value: ((total - prevRow.total) / prevRow.total) * 100,
          label: getPeriodLabel(from, to),
        };
      }
    }

    // Workdays
    const workdays = from && to ? countWorkdays(from, to) : 0;

    // Avg daily
    const avg_daily = workdays > 0 ? total / workdays : 0;

    // Max day
    const maxDayRow = db
      .prepare(
        `SELECT SUBSTR(dt_contato, 1, 10) as date, COUNT(*) as count
        FROM pedidos
        ${where}
        GROUP BY date
        ORDER BY count DESC
        LIMIT 1`,
      )
      .get(...params) as { date: string; count: number } | undefined;
    const max_day = maxDayRow ? { date: maxDayRow.date, count: maxDayRow.count } : null;

    // Tipologias por canal (D-22)
    const tipologiasRaw = db
      .prepare(
        `SELECT
          CASE
            WHEN "receção" IN ('Portal', 'Portal da ERSE', 'Portal Queixa', 'Formulário Site Público') THEN 'Portal'
            WHEN "receção" IN ('Back-Office', 'Telefone Back-Office') THEN 'Back-Office'
            WHEN "receção" = 'Email' THEN 'Email'
            WHEN "receção" = 'Telefone Front' THEN 'Telefone Front'
            ELSE 'Outros'
          END as canal,
          justificação,
          COUNT(*) as count
        FROM pedidos
        ${where}
        GROUP BY canal, justificação
        ORDER BY canal, count DESC`,
      )
      .all(...params) as { canal: string; justificação: string; count: number }[];

    // Group by canal and take top 5
    const tipologias_por_canal: Record<string, Array<{ justificacao: string; count: number }>> = {};
    for (const row of tipologiasRaw) {
      if (!tipologias_por_canal[row.canal]) {
        tipologias_por_canal[row.canal] = [];
      }
      if (tipologias_por_canal[row.canal].length < 5) {
        tipologias_por_canal[row.canal].push({
          justificacao: row.justificação,
          count: row.count,
        });
      }
    }

    return NextResponse.json({
      total,
      canais,
      daily,
      meses_disponiveis,
      crescimento,
      workdays,
      avg_daily,
      max_day,
      tipologias_por_canal,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

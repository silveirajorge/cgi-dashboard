import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'").get();

    if (!tableExists) {
      return NextResponse.json({
        total_registros: 0,
        colunas_numericas: [],
        colunas_texto: [],
        kpis: {},
      });
    }

    const columns = db.prepare("PRAGMA table_info(pedidos)").all() as {
      name: string;
    }[];
    const colNames = columns.map((c) => c.name).filter((n) => !["id", "mes_competencia", "created_at"].includes(n));

    const numericCols: string[] = [];
    for (const col of colNames) {
      const sample = db.prepare(`SELECT "${col}" FROM pedidos WHERE "${col}" GLOB '[0-9]*' LIMIT 1`).get();
      if (sample) {
        numericCols.push(col);
      }
    }

    const count = db.prepare("SELECT COUNT(*) as total FROM pedidos").get() as {
      total: number;
    };

    const kpis: Record<string, { sum: number; avg: number; min: number; max: number }> = {};

    for (const col of numericCols) {
      const result = db
        .prepare(
          `SELECT
            SUM(CAST("${col}" AS REAL)) as sum,
            AVG(CAST("${col}" AS REAL)) as avg,
            MIN(CAST("${col}" AS REAL)) as min,
            MAX(CAST("${col}" AS REAL)) as max
          FROM pedidos
          WHERE "${col}" GLOB '[0-9]*'`,
        )
        .get() as { sum: number | null; avg: number | null; min: number | null; max: number | null };
      kpis[col] = {
        sum: result.sum ?? 0,
        avg: result.avg ?? 0,
        min: result.min ?? 0,
        max: result.max ?? 0,
      };
    }

    return NextResponse.json({
      total_registros: count.total,
      colunas_numericas: numericCols,
      colunas_texto: colNames.filter((c) => !numericCols.includes(c)),
      kpis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const db = getDb();
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'").get();
    if (!tableExists) {
      return NextResponse.json({ cil_aggregates: [] });
    }

    const conditions: string[] = ["cil IS NOT NULL AND cil != '' AND cil != '—'"];
    const params: string[] = [];
    if (from && to) {
      conditions.push("dt_registo >= ? AND dt_registo <= ?");
      params.push(from, `${to} 23:59:59`);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const cilAggregates = db
      .prepare(
        `SELECT cil, COUNT(*) as count
        FROM pedidos
        ${where}
        GROUP BY cil
        ORDER BY count DESC
        LIMIT 20`,
      )
      .all(...params);

    return NextResponse.json({ cil_aggregates: cilAggregates });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

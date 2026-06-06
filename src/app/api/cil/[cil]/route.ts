import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ cil: string }> }) {
  try {
    const { cil } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const estado = searchParams.get("estado");

    const db = getDb();

    const conditions: string[] = ["cil = ?"];
    const queryParams: string[] = [cil];

    if (from && to) {
      conditions.push("dt_registo >= ? AND dt_registo <= ?");
      queryParams.push(from, `${to} 23:59:59`);
    }
    if (estado) {
      conditions.push("estado = ?");
      queryParams.push(estado);
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    const total = db.prepare(`SELECT COUNT(*) as total FROM pedidos ${where}`).get(...queryParams) as { total: number };

    const records = db
      .prepare(
        `SELECT * FROM pedidos ${where}
        ORDER BY dt_registo DESC
        LIMIT 1000`,
      )
      .all(...queryParams);

    return NextResponse.json({ total: total.total, records });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

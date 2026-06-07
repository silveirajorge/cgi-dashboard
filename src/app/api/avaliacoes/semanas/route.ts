import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT DISTINCT strftime('%Y-%W', data_avaliacao) AS week
        FROM avaliacoes
        ORDER BY week`,
      )
      .all() as Array<{ week: string }>;
    return NextResponse.json({ semanas: rows.map((r) => r.week) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

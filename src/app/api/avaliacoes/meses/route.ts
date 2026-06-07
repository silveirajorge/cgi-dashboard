import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    const rows = db
      .prepare(
        `SELECT DISTINCT substr(a.data_avaliacao, 1, 7) as mes
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         WHERE f.ativo = 1
         ORDER BY mes DESC`,
      )
      .all() as Array<{ mes: string }>;

    const meses = rows.map((r) => r.mes);

    return NextResponse.json({ meses });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

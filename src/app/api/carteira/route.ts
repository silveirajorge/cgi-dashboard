import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mes = searchParams.get("mes");

    if (!mes) {
      return NextResponse.json({ error: "Parâmetro 'mes' é obrigatório (YYYY-MM)" }, { status: 400 });
    }

    const db = getDb();
    const row = db.prepare("SELECT total_clientes FROM carteira_clientes WHERE mes_competencia = ?").get(mes) as
      | { total_clientes: number }
      | undefined;

    return NextResponse.json({ total_clientes: row?.total_clientes ?? null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mes_competencia, total_clientes } = body;

    if (!mes_competencia || total_clientes === undefined) {
      return NextResponse.json(
        {
          error: "Campos obrigatórios: mes_competencia (YYYY-MM), total_clientes (number)",
        },
        { status: 400 },
      );
    }

    if (typeof total_clientes !== "number" || !Number.isInteger(total_clientes) || total_clientes < 0) {
      return NextResponse.json({ error: "total_clientes deve ser um número inteiro positivo" }, { status: 400 });
    }

    const db = getDb();
    db.prepare(
      `INSERT INTO carteira_clientes (mes_competencia, total_clientes)
      VALUES (?, ?)
      ON CONFLICT(mes_competencia) DO UPDATE SET
        total_clientes = excluded.total_clientes,
        updated_at = CURRENT_TIMESTAMP`,
    ).run(mes_competencia, total_clientes);

    return NextResponse.json({
      success: true,
      mes_competencia,
      total_clientes,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

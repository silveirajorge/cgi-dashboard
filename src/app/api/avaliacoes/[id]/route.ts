import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const avaliacaoId = Number(id);
    if (Number.isNaN(avaliacaoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const db = getDb();
    const row = db
      .prepare(
        `SELECT a.*, f.nome as funcionario_nome
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         WHERE a.id = ?`,
      )
      .get(avaliacaoId);

    if (!row) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

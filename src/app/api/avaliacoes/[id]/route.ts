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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const avaliacaoId = Number(id);
    if (Number.isNaN(avaliacaoId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    const existing = db.prepare("SELECT id FROM avaliacoes WHERE id = ?").get(avaliacaoId);
    if (!existing) {
      return NextResponse.json({ error: "Avaliação não encontrada" }, { status: 404 });
    }

    const campos = [
      "funcionario_id",
      "data_avaliacao",
      "pontualidade",
      "qualidade",
      "trabalho_equipa",
      "iniciativa",
      "comunicacao",
      "comentario",
      "atraso",
      "falta",
      "uso_ferramenta",
      "erro_critico",
      "perc_produtividade",
      "nota_auditoria",
      "tipo_auditoria",
    ];

    const sets = campos.map((c) => `${c} = ?`).join(", ");
    const values = campos.map((c) => body[c] ?? null);
    values.push(avaliacaoId);

    db.prepare(`UPDATE avaliacoes SET ${sets} WHERE id = ?`).run(...values);

    const updated = db.prepare("SELECT * FROM avaliacoes WHERE id = ?").get(avaliacaoId);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

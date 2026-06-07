import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const funcionarioId = searchParams.get("funcionario_id");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const db = getDb();

    const conditions: string[] = [];
    const queryParams: (string | number)[] = [];

    if (funcionarioId) {
      conditions.push("a.funcionario_id = ?");
      queryParams.push(Number(funcionarioId));
    }
    if (from) {
      conditions.push("a.data_avaliacao >= ?");
      queryParams.push(from);
    }
    if (to) {
      conditions.push("a.data_avaliacao <= ?");
      queryParams.push(to);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = db
      .prepare(
        `SELECT a.id, a.data_avaliacao, a.media, a.comentario,
                a.funcionario_id, f.nome as funcionario_nome
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         ${where}
         ORDER BY a.data_avaliacao DESC, a.id DESC`,
      )
      .all(...queryParams);

    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      funcionario_id,
      data_avaliacao,
      pontualidade,
      qualidade,
      produtividade,
      trabalho_equipa,
      iniciativa,
      comunicacao,
      comentario,
    } = body;

    if (!funcionario_id || !data_avaliacao) {
      return NextResponse.json({ error: "Funcionário e data são obrigatórios" }, { status: 400 });
    }

    const categorias = [
      ["pontualidade", pontualidade],
      ["qualidade", qualidade],
      ["produtividade", produtividade],
      ["trabalho_equipa", trabalho_equipa],
      ["iniciativa", iniciativa],
      ["comunicacao", comunicacao],
    ] as const;

    for (const [nome, valor] of categorias) {
      if (valor === undefined || valor === null || typeof valor !== "number") {
        return NextResponse.json({ error: `Campo ${nome} é obrigatório (1-10)` }, { status: 400 });
      }
      if (valor < 1 || valor > 10 || !Number.isInteger(valor)) {
        return NextResponse.json({ error: `${nome} deve ser um número inteiro entre 1 e 10` }, { status: 400 });
      }
    }

    const db = getDb();

    // INSERT sem media — GENERATED column calcula automaticamente
    const result = db
      .prepare(
        `INSERT INTO avaliacoes
         (funcionario_id, data_avaliacao, pontualidade, qualidade,
          produtividade, trabalho_equipa, iniciativa, comunicacao, comentario)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        funcionario_id,
        data_avaliacao,
        pontualidade,
        qualidade,
        produtividade,
        trabalho_equipa,
        iniciativa,
        comunicacao,
        comentario ?? null,
      );

    // Buscar o registro inserido (incluindo media calculada)
    const created = db.prepare("SELECT * FROM avaliacoes WHERE id = ?").get(result.lastInsertRowid);

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

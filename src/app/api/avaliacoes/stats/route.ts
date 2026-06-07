import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const funcionarioId = searchParams.get("funcionario_id");

    const db = getDb();
    const conditions: string[] = ["f.ativo = 1"];
    const params: (string | number)[] = [];

    if (from) {
      conditions.push("a.data_avaliacao >= ?");
      params.push(from);
    }
    if (to) {
      conditions.push("a.data_avaliacao <= ?");
      params.push(to);
    }
    if (funcionarioId) {
      conditions.push("a.funcionario_id = ?");
      params.push(Number(funcionarioId));
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    // Média geral
    const mediaGeralRow = db
      .prepare(
        `SELECT AVG(a.media) as media_geral
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         ${where}`,
      )
      .get(...params) as { media_geral: number | null };

    // Médias por categoria
    const mediaCategoriasRow = db
      .prepare(
        `SELECT
          AVG(a.pontualidade) as pontualidade,
          AVG(a.qualidade) as qualidade,
          AVG(a.produtividade) as produtividade,
          AVG(a.trabalho_equipa) as trabalho_equipa,
          AVG(a.iniciativa) as iniciativa,
          AVG(a.comunicacao) as comunicacao
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         ${where}`,
      )
      .get(...params) as Record<string, number | null>;

    // Total de avaliações
    const totalRow = db
      .prepare(
        `SELECT COUNT(*) as total
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         ${where}`,
      )
      .get(...params) as { total: number };

    // Melhor funcionário (apenas quando não filtrado por funcionário)
    let melhorFuncionario: { id: number; nome: string; media: number } | null = null;
    if (!funcionarioId) {
      const row = db
        .prepare(
          `SELECT f.id, f.nome, AVG(a.media) as media
           FROM avaliacoes a
           JOIN funcionarios f ON f.id = a.funcionario_id
           ${where}
           GROUP BY f.id, f.nome
           ORDER BY media DESC
           LIMIT 1`,
        )
        .get(...params) as { id: number; nome: string; media: number } | undefined;
      melhorFuncionario = row ?? null;
    }

    // Comparativo (todos os funcionários com avaliações no período)
    const comparativo = db
      .prepare(
        `SELECT f.id as funcionario_id, f.nome as funcionario_nome, AVG(a.media) as media
         FROM avaliacoes a
         JOIN funcionarios f ON f.id = a.funcionario_id
         ${where}
         GROUP BY f.id, f.nome
         ORDER BY f.nome`,
      )
      .all(...params) as Array<{
      funcionario_id: number;
      funcionario_nome: string;
      media: number;
    }>;

    return NextResponse.json({
      media_geral: mediaGeralRow.media_geral ?? null,
      media_categorias: {
        pontualidade: mediaCategoriasRow.pontualidade ?? null,
        qualidade: mediaCategoriasRow.qualidade ?? null,
        produtividade: mediaCategoriasRow.produtividade ?? null,
        trabalho_equipa: mediaCategoriasRow.trabalho_equipa ?? null,
        iniciativa: mediaCategoriasRow.iniciativa ?? null,
        comunicacao: mediaCategoriasRow.comunicacao ?? null,
      },
      total_avaliacoes: totalRow.total,
      melhor_funcionario: melhorFuncionario,
      comparativo,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

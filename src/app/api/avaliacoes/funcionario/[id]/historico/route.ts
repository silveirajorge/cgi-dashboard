import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const db = getDb();

    const conditions = ["a.funcionario_id = ?"];
    const queryParams: (string | number)[] = [Number(id)];
    if (from) {
      conditions.push("a.data_avaliacao >= ?");
      queryParams.push(from);
    }
    if (to) {
      conditions.push("a.data_avaliacao <= ?");
      queryParams.push(to);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    // Avaliações com score final calculado
    const rows = db
      .prepare(
        `SELECT
          a.id, a.data_avaliacao, a.pontualidade, a.qualidade, a.produtividade,
          a.trabalho_equipa, a.iniciativa, a.comunicacao, a.media, a.comentario,
          a.atraso, a.falta, a.uso_ferramenta, a.erro_critico,
          a.perc_produtividade, a.nota_auditoria, a.tipo_auditoria
        FROM avaliacoes a
        ${where}
        ORDER BY a.data_avaliacao ASC, a.id ASC`,
      )
      .all(...queryParams) as Array<{
      id: number;
      data_avaliacao: string;
      perc_produtividade: number | null;
      nota_auditoria: number | null;
      media: number;
      comentario: string | null;
      atraso: number;
      falta: number;
      uso_ferramenta: number;
      erro_critico: number;
      tipo_auditoria: string;
      [categoria: string]: number | string | null;
    }>;

    // Score evolution por avaliação (para gráfico)
    const evolution = rows.map((row) => {
      const prod = row.perc_produtividade !== null ? Math.min(row.perc_produtividade, 100) : 0;
      const nota = row.nota_auditoria ?? 0;
      const cats = (row.media ?? 5) * 10; // media das 6 categorias (1-10) -> 10-100
      const scoreBase = (prod + nota + cats) / 3;
      const penalidades = row.atraso * 2 + row.falta * 2 + row.erro_critico * 5;
      const bonus = row.uso_ferramenta ? 5 : 0;
      const score = Math.max(0, scoreBase - penalidades + bonus);

      return {
        data_avaliacao: row.data_avaliacao,
        score: Math.round(score),
        perc_produtividade: row.perc_produtividade,
        tipo_auditoria: row.tipo_auditoria,
      };
    });

    return NextResponse.json({
      evolution,
      comentarios: rows
        .filter((r) => r.comentario)
        .map((r) => ({
          data: r.data_avaliacao,
          tipo: r.tipo_auditoria,
          comentario: r.comentario,
        })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

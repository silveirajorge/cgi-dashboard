import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ error: "from e to são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const whereClause = "WHERE f.ativo = 1 AND a.data_avaliacao >= ? AND a.data_avaliacao <= ?";
    const params = [from, to];

    // 1. Comparativo Semanal (agrupado por ISO week)
    const comparativoSemanal = db
      .prepare(
        `SELECT
          strftime('%Y-%W', a.data_avaliacao) AS week,
          CAST(AVG(a.perc_produtividade) AS REAL) AS produtividade,
          CAST(AVG(CASE WHEN a.uso_ferramenta = 1 THEN 100.0 ELSE 0 END) AS REAL) AS uso_speedops,
          SUM(a.erro_critico) AS erros_criticos,
          SUM(a.atraso + a.falta) AS atrasos_faltas,
          CAST(AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS REAL) AS media_auditor,
          CAST(AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS REAL) AS media_supervisor
        FROM avaliacoes a
        JOIN funcionarios f ON f.id = a.funcionario_id
        ${whereClause}
        GROUP BY strftime('%Y-%W', a.data_avaliacao)
        ORDER BY week`,
      )
      .all(...params) as Array<{
      week: string;
      produtividade: number | null;
      uso_speedops: number | null;
      erros_criticos: number;
      atrasos_faltas: number;
      media_auditor: number | null;
      media_supervisor: number | null;
    }>;

    // 2. Última semana e anterior para comparativo dos cards
    const ultimasSemanas = comparativoSemanal.slice(-2);
    const semanaAtual = ultimasSemanas[ultimasSemanas.length - 1] ?? null;
    const semanaAnterior = ultimasSemanas.length >= 2 ? ultimasSemanas[ultimasSemanas.length - 2] : null;

    // 3. Tabela da Equipa (Score Final por funcionário)
    const teamRaw = db
      .prepare(
        `SELECT
          f.id, f.nome,
          CAST(AVG(a.perc_produtividade) AS REAL) AS avg_prod,
          CAST(AVG(a.nota_auditoria) AS REAL) AS avg_nota,
          CAST(AVG((a.pontualidade + a.qualidade + a.trabalho_equipa + a.iniciativa + a.comunicacao) / 5.0) AS REAL) AS avg_categorias,
          SUM(a.atraso) AS total_atrasos,
          SUM(a.falta) AS total_faltas,
          SUM(a.erro_critico) AS total_erros,
          SUM(CASE WHEN a.uso_ferramenta = 1 THEN 1 ELSE 0 END) AS count_uso,
          CAST(AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS REAL) AS media_auditor,
          CAST(AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS REAL) AS media_supervisor
        FROM avaliacoes a
        JOIN funcionarios f ON f.id = a.funcionario_id
        ${whereClause}
        GROUP BY f.id, f.nome
        ORDER BY f.nome`,
      )
      .all(...params) as Array<{
      id: number;
      nome: string;
      avg_prod: number | null;
      avg_nota: number | null;
      avg_categorias: number | null;
      total_atrasos: number;
      total_faltas: number;
      total_erros: number;
      count_uso: number;
      media_auditor: number | null;
      media_supervisor: number | null;
    }>;

    // 4. Score Final calculation + Distribuição de Desempenho
    const team = teamRaw.map((row) => {
      const prod = row.avg_prod !== null ? Math.min(row.avg_prod, 100) : 0;
      const nota = row.avg_nota ?? 0;
      const cats = (row.avg_categorias ?? 5) * 10;
      const scoreBase = (prod + nota + cats) / 3;
      const penalidades = row.total_atrasos * 2 + row.total_faltas * 2 + row.total_erros * 5;
      const bonus = row.count_uso > 0 ? 5 : 0;
      const scoreFinal = Math.max(0, scoreBase - penalidades + bonus);

      let status: string;
      if (scoreFinal >= 95) status = "excelente";
      else if (scoreFinal >= 90) status = "bom";
      else if (scoreFinal >= 85) status = "atencao";
      else status = "critico";

      return {
        id: row.id,
        nome: row.nome,
        avg_produtividade: row.avg_prod,
        total_atrasos: row.total_atrasos,
        total_faltas: row.total_faltas,
        total_erros: row.total_erros,
        uso_ferramenta: row.count_uso > 0,
        media_auditor: row.media_auditor,
        media_supervisor: row.media_supervisor,
        score_final: Math.round(scoreFinal),
        status,
      };
    });

    // Distribuição
    const distribuicao = [
      { name: "Excelente", value: team.filter((t) => t.score_final >= 95).length, fill: "#22c55e" },
      { name: "Bom", value: team.filter((t) => t.score_final >= 90 && t.score_final < 95).length, fill: "#3b82f6" },
      { name: "Atenção", value: team.filter((t) => t.score_final >= 85 && t.score_final < 90).length, fill: "#eab308" },
      { name: "Crítico", value: team.filter((t) => t.score_final < 85).length, fill: "#ef4444" },
    ];

    // 5. Ferramenta uso % — por total de avaliações
    const totalAvaliacoes = db
      .prepare(
        `SELECT COUNT(*) as total FROM avaliacoes a
        JOIN funcionarios f ON f.id = a.funcionario_id ${whereClause}`,
      )
      .get(...params) as { total: number };

    const usoFerramentaCount = db
      .prepare(
        `SELECT COUNT(*) as count FROM avaliacoes a
        JOIN funcionarios f ON f.id = a.funcionario_id
        ${whereClause} AND a.uso_ferramenta = 1`,
      )
      .get(...params) as { count: number };

    return NextResponse.json({
      comparativo_semanal: comparativoSemanal,
      semana_atual: semanaAtual,
      semana_anterior: semanaAnterior,
      team,
      distribuicao,
      uso_ferramenta: {
        utilizou_pct: totalAvaliacoes.total > 0 ? (usoFerramentaCount.count / totalAvaliacoes.total) * 100 : 0,
        utilizou_count: usoFerramentaCount.count,
        nao_utilizou_pct:
          totalAvaliacoes.total > 0
            ? ((totalAvaliacoes.total - usoFerramentaCount.count) / totalAvaliacoes.total) * 100
            : 0,
        nao_utilizou_count: totalAvaliacoes.total - usoFerramentaCount.count,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

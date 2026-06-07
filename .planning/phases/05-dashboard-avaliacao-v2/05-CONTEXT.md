# Phase 5: Dashboard Avaliação v2 — Context

**Gathered:** 2026-06-07
**Status:** Ready for planning

<domain>
## Phase Boundary

Redesign completo do dashboard de avaliação com duas colunas: KPIs da equipa (esquerda) e detalhamento individual (direita). Novos cálculos de Score Final, comparação semana a semana, gráficos de linha com gradiente, donut de distribuição, tabela da equipa com status.

</domain>

<decisions>
## Implementation Decisions

### Score Final
- **D5-01:** **Média composta** de 3 métricas (cada 0-100):
  ```
  score_base = (perc_produtividade(capped 100) + nota_auditoria + (media_categorias × 10)) / 3
  penalidades = atrasos × 2 + faltas × 2 + erros_críticos × 5
  bonus = uso_ferramenta ? 5 : 0
  score_final = max(0, score_base - penalidades + bonus)
  ```
- **D5-02:** Categorias de desempenho:
  - Excelente: ≥ 95
  - Bom: 90-94
  - Atenção: 85-89
  - Crítico: < 85

### Comparativo Semanal
- **D5-03:** Agrupar avaliações por ISO week (data_avaliacao)
- **D5-04:** Para cada KPI, calcular valor da última semana com dados e semana anterior
- **D5-05:** Quando não houver avaliações numa semana, repetir o último valor conhecido (carry forward)
- **D5-06:** Badges: ▲ verde para melhoria, ▼ vermelho para piora, cinza para estável

### Coluna Esquerda — KPIs da Equipa
- **D5-07:** 6 cards KPI com indicador de tendência (vs semana anterior):
  1. Produtividade Média — média de perc_produtividade
  2. Uso Speedops — % de avaliações com uso_ferramenta = true
  3. Erros Críticos — contagem de erro_critico = true
  4. Atrasos/Faltas — soma de atraso + falta
  5. Média Auditor — média de nota_auditoria WHERE tipo_auditoria = 'auditor'
  6. Média Supervisor — média de nota_auditoria WHERE tipo_auditoria = 'supervisor'
- **D5-08:** Donut "Distribuição de Desempenho" — contagem de funcionários por categoria de score (com centro "total")
- **D5-09:** Barra "Uso da Ferramenta" — % utilizou vs não utilizou com legenda
- **D5-10:** Gráfico de linha "Evolução Média de Produtividade" — Recharts LineChart com área gradiente (igual daily-chart dos KPIs)
- **D5-11:** Tabela da Equipa com colunas: Nome, Atrasos/Faltas, Speedops, Erro Crítico, Produtividade (%), Avaliação Auditor (valor + estrelas), Avaliação Supervisor (valor + estrelas), Score Final, Status (badge colorido)

### Coluna Direita — Detalhamento Individual
- **D5-12:** Dropdown para selecionar funcionário
- **D5-13:** Card Resumo: Score Final (grande, com medalha) + status + métricas da semana
- **D5-14:** Gráfico "Evolução do Score" — LineChart com área gradiente (mesmo padrão)
- **D5-15:** Gráfico "Histórico de Produtividade" — BarChart ou LineChart
- **D5-16:** Card de Comentários — lista dos comentários das avaliações

### Cores Consistentes
- **D5-17:** Paleta fixa para todo o dashboard:
  - Verde (#22c55e): Excelente, positivo, Sim, utilizou
  - Vermelho (#ef4444): Crítico, negativo, Não, não utilizou, erros
  - Azul (#3b82f6): Bom, info
  - Amarelo (#eab308): Atenção, estrelas
  - Cinza (#71717a): estável, neutro

### API
- **D5-18:** `GET /api/avaliacoes/dashboard?from=&to=` — todos os KPIs agregados + comparativo semanal + tabela da equipa
- **D5-19:** `GET /api/avaliacoes/funcionario/:id/historico?from=&to=` — score evolution + produtividade + comentários
- **D5-20:** `GET /api/avaliacoes/semanas?from=&to=` — semanas disponíveis

### BD
- **D5-21:** Sem novas tabelas — apenas queries de agregação sobre `avaliacoes` existente

### Score Final — Estrelas
- **D5-22:** Estrelas de 0-5 baseadas na nota_auditoria: cada estrela = 20 pontos (ex: 4.8 = 4 estrelas cheias + 0.8 de fração)

</decisions>

<canonical_refs>
- `src/app/(main)/dashboard/kpi/_components/daily-chart.tsx` — Padrão LineChart com gradiente
- `src/app/(main)/dashboard/avaliacao-dashboard/` — Dashboard atual a modificar
- `src/app/api/avaliacoes/stats/route.ts` — API stats a estender
- `designs/dashboard-avaliacao-v2.pen` — Design de referência
</canonical_refs>


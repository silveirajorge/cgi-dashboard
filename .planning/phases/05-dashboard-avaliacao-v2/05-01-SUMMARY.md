---
phase: 05-dashboard-avaliacao-v2
plan: 01
subsystem: dashboard
tags: [recharts, sqlite, kpi, score-final, dashboard, avaliacao]
requires: []
provides:
  - Dashboard API with weekly aggregation and Score Final calculation
  - Individual funcionário history API
  - 6 KPI cards with trend indicators and week-over-week comparison
  - Donut chart for performance distribution
  - Horizontal bar for tool usage
  - Line chart with gradient for productivity evolution
  - Team table with StarRating and ScoreBadge
  - Individual detail panel with score evolution, productivity history, and comments
affects: []
tech-stack:
  added: []
  patterns:
    - ISO week aggregation with `strftime('%Y-%W')` in SQLite
    - Score Final calculation in JS combining SQL aggregates with business logic
    - Client-side carry forward for week gaps
    - Recharts PieChart donut with SVG center label
    - Recharts LineChart + Area with linearGradient
    - Star rating conversion (nota/20)
key-files:
  created:
    - src/app/api/avaliacoes/dashboard/route.ts
    - src/app/api/avaliacoes/semanas/route.ts
    - src/app/api/avaliacoes/funcionario/[id]/historico/route.ts
    - src/lib/carry-forward.ts
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/avaliacao-dashboard-v2-client.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/tendencia-indicator.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/kpi-cards-v2.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/distribuicao-donut.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/ferramenta-bar.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/evolucao-prod-chart.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/star-rating.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/score-badge.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/equipa-table.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/funcionario-select.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/resumo-card.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/score-evol-chart.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/prod-hist-chart.tsx
    - src/app/(main)/dashboard/avaliacao-dashboard/_components/comentarios-list.tsx
  modified:
    - src/app/(main)/dashboard/avaliacao-dashboard/page.tsx
key-decisions:
  - "Score Final calculado em JS no API route (3 métricas: produtividade capped 100 + nota_auditoria + media_categorias×10) / 3 com penalidades e bónus"
  - "Carry forward implementado client-side via fillCarryForward() — preenche gaps de semanas sem dados"
  - "ISO week grouping via strftime('%Y-%W') no SQLite, LAG não usado porque carry forward é client-side"
  - "6 KPIs semanais com TendenciaIndicator comparando última semana vs anterior"
  - "Paleta D5-17 fixa: verde #22c55e, vermelho #ef4444, azul #3b82f6, amarelo #eab308, cinza #71717a"
  - "StarRating converte nota_auditoria (0-100) para 0-5 estrelas (cada estrela = 20pt)"
  - "Layout 2 colunas grid-cols-[65%_35%] com fallback 1 coluna em mobile"
requirements-completed:
  - D5-01
  - D5-02
  - D5-03
  - D5-04
  - D5-05
  - D5-06
  - D5-07
  - D5-08
  - D5-09
  - D5-10
  - D5-11
  - D5-12
  - D5-13
  - D5-14
  - D5-15
  - D5-16
  - D5-17
  - D5-18
  - D5-19
  - D5-20
  - D5-21
  - D5-22
duration: 5min
completed: 2026-06-07
---

# Phase 5 Plan 1: Dashboard Avaliação v2 — Implementation

**3 new API routes, carry forward utility, 12 new React components, page update — Score Final composto com penalidades/bónus, KPIs semanais, donut, barra ferramenta, linha gradiente, tabela equipa, painel individual**

## Performance

- **Duration:** 5 min
- **Started:** 2026-06-07T12:25:08Z
- **Completed:** 2026-06-07T12:30:29Z
- **Tasks:** 3
- **Files modified:** 19

## Accomplishments

- 3 API routes criadas: `/api/avaliacoes/dashboard`, `/api/avaliacoes/semanas`, `/api/avaliacoes/funcionario/:id/historico`
- Score Final composto calculado em JS (média 3 métricas capped 100 - penalidades + bónus) com categorias Excelente/Bom/Atenção/Crítico
- Comparativo semanal com ISO week grouping + carry forward client-side via `fillCarryForward()`
- 6 cards KPI semanais com indicador de tendência ▲/▼/→ comparando última semana vs anterior
- Gráfico donut Distribuição de Desempenho com label central (PieChart + SVG text)
- Barra horizontal Uso da Ferramenta 2 segmentos (azul utilizou / vermelho não utilizou)
- Gráfico de linha Evolução Média de Produtividade com área gradiente
- Tabela da Equipa com 9 colunas: Nome, Atrasos/Faltas, Speedops, Erro Crítico, Produtividade (%), Avaliação Auditor (valor + StarRating), Avaliação Supervisor (valor + StarRating), Score Final, Status (ScoreBadge colorido)
- Painel individual à direita: dropdown funcionário, resumo com medalha, evolução score (linha gradiente), histórico produtividade (barras), lista comentários
- Layout responsivo 2 colunas (65/35) com fallback 1 coluna em mobile

## Task Commits

Each task was committed atomically:

1. **Task 1: API routes + carry forward + page scaffold** - `814ae5e` (feat)
2. **Task 2: Left column components — KPIs, charts, table** - `d6d49bb` (feat)
3. **Task 3: Right column — individual detail components** - `aae2d4a` (feat)

**Plan metadata:** PENDING

## Files Created/Modified

### API Routes (3 created)
- `src/app/api/avaliacoes/dashboard/route.ts` - Dashboard API: KPIs agregados, comparativo semanal, Score Final, distribuição, uso ferramenta
- `src/app/api/avaliacoes/semanas/route.ts` - Semanas disponíveis (ISO week distinct)
- `src/app/api/avaliacoes/funcionario/[id]/historico/route.ts` - Histórico individual: evolution + comentários

### Utility (1 created)
- `src/lib/carry-forward.ts` - `fillCarryForward()` preenche gaps de semanas sem dados com último valor conhecido

### Components (13 created)
- `tendencia-indicator.tsx` - ▲/▼/→ badges com lucide-react (verde/vermelho/cinza)
- `avaliacao-dashboard-v2-client.tsx` - Client component principal: fetch, estado, layout 2 colunas, coordena todos sub-componentes
- `kpi-cards-v2.tsx` - 6 cards KPI com indicador de tendência
- `distribuicao-donut.tsx` - PieChart donut com label central
- `ferramenta-bar.tsx` - Barra horizontal uso ferramenta (CSS)
- `evolucao-prod-chart.tsx` - LineChart com gradiente
- `star-rating.tsx` - Estrelas 0-5 (nota/20)
- `score-badge.tsx` - Badge colorido por categoria
- `equipa-table.tsx` - Tabela completa com StarRating + ScoreBadge
- `funcionario-select.tsx` - Dropdown com funcionários do team
- `resumo-card.tsx` - Card resumo individual
- `score-evol-chart.tsx` - LineChart score individual
- `prod-hist-chart.tsx` - BarChart produtividade histórica
- `comentarios-list.tsx` - Lista de comentários ordenada

### Page Modified (1)
- `page.tsx` - Import alterado para `AvaliacaoDashboardV2Client`

## Decisions Made

- Score Final calculado em JS no API route (não SQL) — combina AVG SQL com lógica de negócio (condicionais, Math.min/Math.max)
- Carry forward client-side via `fillCarryForward()` em vez de SQL recursive CTE — mais simples e legível para MVP
- Paleta D5-17 aplicada como cores inline (não CSS variables do tema) — cores fixas e específicas do domínio
- FerramentaBar implementada com CSS puro (divs) — mais simples que Recharts para 2 segmentos
- StarRating usa `nota / 20` com meias-estrelas entre 0.25 e 0.75, ajustando para cheia acima de 0.75
- ChartConfig preenchido com entradas nominais para PieChart (evita erro de runtime do shadcn/ui ChartContainer)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- `fillCarryForward()` precisou de `unknown as T` para satisfazer TypeScript strict mode (tipo genérico com constraint `Record<string, unknown>`)
- Biome lint flagou `noNonNullAssertion` em `dataMap.get(week)!` — corrigido para `as T`
- Vars de estado scaffold (detalhe, detalheLoading) flagadas como unused na Task 1 — mantidas com prefixo underscore até ativação na Task 3
- Pre-commit hook (Biome) auto-corrigiu CSS class ordering em 2 arquivos

## Known Stubs

None — todos os componentes estão implementados com dados reais da API.

## Threat Flags

None — nenhuma superfície de segurança nova introduzida (todas queries são read-only, sem inputs de usuário mutáveis).

## Verification Results

- **Build:** ✅ Compiled successfully (Turbopack)
- **TypeScript:** ✅ No errors
- **Lint (Biome):** ✅ No issues in API routes and carry-forward

## Next Phase Readiness

- Dashboard Avaliação v2 completo — pronto para verificação
- Nenhuma dependência para próxima fase

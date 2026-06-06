---
phase: 03-kpi-dashboard
plan: 01
subsystem: api
tags: [sqlite, nextjs-api-routes, sidebar, carteira-clientes, cil, kpi-metrics]
requires:
  - phase: 01-backend-foundation
    provides: SQLite pedidos table, upload API, db.ts migrations
provides:
  - Sidebar restructured with "Pedidos e Tendências" group
  - carteira_clientes table migration (UPSERT by mes_competencia)
  - CIL performance index (idx_pedidos_cil)
  - GET /api/data with period filtering, channel normalization, daily evolution
  - GET /api/cil with top 20 CIL aggregation
  - GET /api/cil/[cil] with estado filtering
  - GET/POST /api/carteira with validation and UPSERT
affects: [03-kpi-dashboard-plan-02-frontend]
tech-stack:
  added: []
  patterns:
    - SQL CASE WHEN for channel normalization (receção → canal)
    - Period calculation helpers (workdays, previous period, growth %)
    - Dynamic WHERE clause building for date-range filtering
key-files:
  created:
    - src/app/api/cil/route.ts
    - src/app/api/cil/[cil]/route.ts
    - src/app/api/carteira/route.ts
  modified:
    - src/navigation/sidebar/sidebar-items.ts
    - src/lib/db.ts
    - src/app/api/data/route.ts
key-decisions:
  - "Novo grupo sidebar 'Pedidos e Tendências' (id=2) entre Dashboards e Pages"
  - "Canais normalizados via SQL CASE WHEN: Portal, Back-Office, Email, Telefone Front, Outros"
  - "Top 5 tipologias por canal usando justificação (não tipo_justificação)"
  - "Evolução diária usa dt_contato (SUBSTR para extrair data) — não dt_registo"
  - "UPSERT via ON CONFLICT...DO UPDATE (preserva created_at original)"
  - "Next.js 16 params assíncrono: Promise<{ cil: string }>"
  - "Mês de 28-31 dias → label 'vs. Mês Anterior'; caso contrário 'vs. Período Anterior'"
patterns-established:
  - "Period filtering: ?from=YYYY-MM-DD&to=YYYY-MM-DD com WHERE dinâmico"
  - "Safe column names: aspas duplas para colunas com caracteres especiais (receção)"
  - "Error handling: try/catch + NextResponse.json(error, { status: 500 })"
requirements-completed: [KPI-01, KPI-02, KPI-03]
duration: 12min
completed: 2026-06-06
---

# Phase 3 Plan 1: Backend Infrastructure for KPI Dashboard

**Sidebar reestruturada, banco SQLite migrado (carteira_clientes + índice CIL) e 5 endpoints de API operacionais com filtro de período, normalização de canais e métricas agregadas via SQL.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-06-06T15:21:03+01:00
- **Completed:** 2026-06-06T15:22:29+01:00
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Sidebar reestruturada: novo grupo "Pedidos e Tendências" com Dashboard (`/dashboard/kpi`) e Upload CSV, removendo Upload CSV do grupo Dashboards, IDs renumados (1–5)
- Banco SQLite migrado: tabela `carteira_clientes` (UPSERT por `mes_competencia`) + índice `idx_pedidos_cil` para performance de queries CIL
- `GET /api/data` aprimorado: aceita `?from=&to=`, retorna total, canais normalizados (CASE WHEN), evolução diária, meses disponíveis, crescimento %, dias úteis, média diária, dia de pico, top 5 tipologias por canal
- `GET /api/cil` — top 20 CILs agregados com filtro de período
- `GET /api/cil/[cil]` — registros de CIL específico com filtro de período + estado
- `GET /api/carteira` — consulta `total_clientes` por mês
- `POST /api/carteira` — UPSERT com validação (inteiro positivo), preserva `created_at`

## Task Commits

Cada task foi commitada atomicamente:

| # | Commit | Description |
|---|--------|-------------|
| 1 | `e593ef1` | feat(03-kpi-dashboard): reestruturar sidebar + migrar banco carteira_clientes |
| 2 | `6c016de` | feat(03-kpi-dashboard): aprimorar GET /api/data com filtro período + métricas agregadas |
| 3 | `638da48` | feat(03-kpi-dashboard): criar APIs CIL e Carteira de Clientes |

## Files Created/Modified

| File | Action | What it does |
|------|--------|-------------|
| `src/navigation/sidebar/sidebar-items.ts` | Modified | Novo grupo "Pedidos e Tendências" (id=2), Upload movido, IDs renumados |
| `src/lib/db.ts` | Modified | Migração carteira_clientes + índice idx_pedidos_cil |
| `src/app/api/data/route.ts` | Rewritten | GET com filtro período, canais, daily, crescimento, workdays, tipologias |
| `src/app/api/cil/route.ts` | Created | GET /api/cil — top 20 CILs agregados |
| `src/app/api/cil/[cil]/route.ts` | Created | GET /api/cil/[cil] — detalhes com filtro período + estado |
| `src/app/api/carteira/route.ts` | Created | GET + POST /api/carteira — consulta e UPSERT |

## Decisions Made

- Seguiu-se o plano exatamente: canais normalizados por SQL CASE WHEN, evolução diária via `SUBSTR(dt_contato, 1, 10)`, coluna `justificação` para tipologias (não `tipo_justificação`), parâmetros assíncronos `Promise<{ cil: string }>` para Next.js 16
- `ON CONFLICT...DO UPDATE` usado em vez de `INSERT OR REPLACE` para preservar `created_at` na primeira inserção (UPSERT)

## Deviations from Plan

Nenhuma — plano executado exatamente como escrito.

## Issues Encountered

- O banco SQLite existente não tinha as novas migrações (tabela `carteira_clientes` + índice CIL) pois as migrations rodam apenas na primeira inicialização. Resolvido executando as migrations diretamente via script Node.js

## User Setup Required

Nenhum — sem configuração externa necessária.

## Next Phase Readiness

- Todas as APIs de backend estão operacionais e prontas para consumo pelo frontend (Plano 02)
- Build compila sem erros, lint passa, endpoints retornam dados corretos com 93k+ registros
- Próximo plano (03-02) pode consumir `GET /api/data`, `GET /api/cil`, `GET /api/cil/[cil]` e `GET/POST /api/carteira` para construir os componentes de UI do dashboard

## Self-Check: PASSED

All artifacts verified:
- ✅ 6 source files present (3 created, 3 modified)
- ✅ 3 commits present (`e593ef1`, `6c016de`, `638da48`)
- ✅ DB: `carteira_clientes` table with 5 columns (id, mes_competencia, total_clientes, created_at, updated_at)
- ✅ DB: `idx_pedidos_cil` index exists
- ✅ DB: carteira_clientes data persisted (UPSERT working — value updated from 500 → 600)
- ✅ Build compiles without errors
- ✅ Biome lint passes (7 files checked)
- ✅ API endpoints return correct data (tested with curl on dev server)

---

*Phase: 03-kpi-dashboard*
*Completed: 2026-06-06*

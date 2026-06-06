---
phase: 03-kpi-dashboard
plan: 02
subsystem: frontend
tags: [recharts, shadcn-ui, kpi-dashboard, cil-modal, carteira-modal]
requires:
  - phase: 03-kpi-dashboard
    plan: 01
    provides: API endpoints, carteira_clientes table, sidebar
provides:
  - Full KPI dashboard page (/dashboard/kpi) with period filtering
  - 5 KPI metric cards with pt-PT formatting
  - 4 Recharts charts (LineChart, PieChart donut, BarChart horizontal x2)
  - CIL modal with @tanstack/react-table, estado filter, CSV export
  - Carteira modal with numeric input and POST persistence
  - Upload toast navigation to dashboard
affects: []
tech-stack:
  added: []
  patterns:
    - Recharts + ChartContainer wrapper for chart styling
    - Modal pattern: Dialog + client-side fetch + lifecycle management
    - CSV export via Blob/URL.createObjectURL
    - Period synchronization: month dropdown ↔ date range
key-files:
  created:
    - src/app/(main)/dashboard/kpi/page.tsx
    - src/app/(main)/dashboard/kpi/_components/kpi-dashboard-client.tsx
    - src/app/(main)/dashboard/kpi/_components/period-filter.tsx
    - src/app/(main)/dashboard/kpi/_components/kpi-cards.tsx
    - src/app/(main)/dashboard/kpi/_components/daily-chart.tsx
    - src/app/(main)/dashboard/kpi/_components/channel-chart.tsx
    - src/app/(main)/dashboard/kpi/_components/cil-chart.tsx
    - src/app/(main)/dashboard/kpi/_components/cil-modal.tsx
    - src/app/(main)/dashboard/kpi/_components/carteira-modal.tsx
    - src/app/(main)/dashboard/kpi/_components/tipology-section.tsx
  modified:
    - src/app/(main)/dashboard/upload/_components/upload-area.tsx
key-decisions:
  - "CIL modal: colunas fixas (id_contacto, estado, dt_registo, dt_contato, justificação, receção, cil) em vez de dinâmicas — garante consistência independente da ordem dos dados"
  - "Filtro estado no CIL modal re-fetch via query param em vez de filtro client-side — dados podem ser grandes e a API já suporta filtragem server-side"
  - "Carteira modal: usa mês final do range (to.substring(0,7)) como mês de referência — consistente com a lógica da API"
  - "Auto-select do último mês disponível: ocorre no primeiro fetch, com um segundo fetch se necessário para corrigir o range"
patterns-established:
  - "Client orchestrator: estado centralizado, callbacks para componentes filhos, fetch em Promise.all"
  - "PeriodFilter: Select do shadcn para dropdown de mês + inputs type='date' para range customizado"
  - "Números formatados com Intl.NumberFormat('pt-PT') em todos os cards e badges"
  - "CSV export: BOM (\uFEFF) para acentos no Excel + escape de aspas duplas"
requirements-completed: [KPI-01, KPI-02, KPI-03]
duration: 18min
completed: 2026-06-06
---

# Phase 3 Plan 2: KPI Dashboard Frontend

**Dashboard de KPIs completo com filtro de período, 5 métricas, 4 gráficos Recharts, modal CIL com exportação CSV e modal de carteira editável — consumindo as APIs do Plano 01.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-06-06T15:40:00+01:00
- **Completed:** 2026-06-06T15:58:00+01:00
- **Tasks:** 3
- **Files created:** 10
- **Files modified:** 2

## Accomplishments

- **Server page** (`/dashboard/kpi`) — Server Component page shell com layout responsivo
- **Dashboard orchestrator** (`kpi-dashboard-client.tsx`) — Client Component que gerencia estado de período, dados, CILs e carteira; fetch em `Promise.all` no mount e ao mudar período
- **Period filter** (`period-filter.tsx`) — Dropdown de meses (Select shadcn) + date range inputs sincronizados; selecionar mês → range reflete o mês; editar range → dropdown "Personalizado"
- **5 KPI cards** (`kpi-cards.tsx`) — Total de Pedidos, Carteira de Clientes, Crescimento Líquido, Média Diária, Dia com maior volume. Todos formatados com `Intl.NumberFormat("pt-PT")`. Crescimento com badge verde/vermelho. Carteira clicável abre modal
- **Evolução Diária** (`daily-chart.tsx`) — LineChart com ChartContainer, tooltip e CartesianGrid
- **Distribuição por Canal** (`channel-chart.tsx`) — PieChart donut + BarChart horizontal lado a lado, cada slice/barra com cor do tema
- **Gráfico CIL** (`cil-chart.tsx`) — BarChart vertical com top 20 CILs, barras clicáveis que abrem modal de detalhes
- **Modal CIL** (`cil-modal.tsx`) — Dialog com tabela (@tanstack/react-table), filtro por Estado (re-fetch server-side), export CSV com BOM para acentos, contagem total/filtrada
- **Modal Carteira** (`carteira-modal.tsx`) — Dialog com input numérico, validação (min=0, inteiro), POST `/api/carteira` com UPSERT, sincronização de estado
- **Tipologias por Canal** (`tipology-section.tsx`) — Top 5 justificações por canal em grid de cards
- **Upload navigation** — Toast de sucesso com botão "Ver Dashboard" navegando para `/dashboard/kpi`

## Task Commits

| # | Commit | Description |
|---|--------|-------------|
| 1 | `ab0d66a` | feat(03-kpi-dashboard): criar página KPI, dashboard client, filtro de período e navegação pós-upload |
| 2 | `1b5229d` | feat(03-kpi-dashboard): criar cards KPI, gráficos e seção de tipologias |
| 3 | `9cc47da` | feat(03-kpi-dashboard): criar gráfico CIL, modal CIL com tabela/filtro/export e modal Carteira |
| — | `ffebbf7` | fix(03-kpi-dashboard): corrigir tipo onClick do CIL chart, chave de tabela e ordenação CSS |

## Files Created/Modified

| File | Action | What it does |
|------|--------|-------------|
| `src/app/(main)/dashboard/kpi/page.tsx` | Created | Server Component page shell |
| `src/app/(main)/dashboard/kpi/_components/kpi-dashboard-client.tsx` | Created | Client orchestrator — fetch, state, callbacks |
| `src/app/(main)/dashboard/kpi/_components/period-filter.tsx` | Created | Month dropdown + date range filter |
| `src/app/(main)/dashboard/kpi/_components/kpi-cards.tsx` | Created | 5 KPI metric cards with pt-PT formatting |
| `src/app/(main)/dashboard/kpi/_components/daily-chart.tsx` | Created | LineChart for daily evolution |
| `src/app/(main)/dashboard/kpi/_components/channel-chart.tsx` | Created | PieChart donut + BarChart for channels |
| `src/app/(main)/dashboard/kpi/_components/cil-chart.tsx` | Created | BarChart with clickable CIL bars |
| `src/app/(main)/dashboard/kpi/_components/cil-modal.tsx` | Created | Dialog with table, filter, export |
| `src/app/(main)/dashboard/kpi/_components/carteira-modal.tsx` | Created | Dialog with numeric input, POST save |
| `src/app/(main)/dashboard/kpi/_components/tipology-section.tsx` | Created | Top 5 tipologias per channel |
| `src/app/(main)/dashboard/upload/_components/upload-area.tsx` | Modified | Toast action "Ver Dashboard" |

## Deviations from Plan

Nenhuma — plano executado exatamente como escrito.

- ✅ Task 1: Server page + dashboard client + period filter + upload navigation
- ✅ Task 2: KPI cards + daily chart + channel charts + tipology section
- ✅ Task 3: CIL chart + CIL modal + Carteira modal + wiring

## Issues Encountered

- **Biome lint rules**: `useExhaustiveDependencies`, `noFloatingPromises`, `useSortedClasses`, `noArrayIndexKey` — resolvidos com `void` prefix, refs de inicialização, chaves baseadas em dados
- **Recharts onClick tipo**: O `onClick` do `Bar` em Recharts recebe `BarRectangleItem`, não o dado original; necessário acessar via `payload` property

## Build Verification

- ✅ Build compila sem erros (TypeScript + Turbopack)
- ✅ `/dashboard/kpi` listado como rota dinâmica
- ✅ Biome lint passa (12 arquivos verificados)

## Known Stubs

Nenhum — todos os componentes consomem dados reais das APIs.

## Threat Flags

Nenhum — todo o threat surface está mapeado no plano e coberto.

- T-03-04 (I — Estado filter): Mitigado — parâmetro mapeado diretamente para query param
- T-03-05 (T — Carteira input): Mitigado — `type="number" min={0}` + `Math.round()`
- T-03-06 (S — CSV Export): Aceito — funcionalidade deliberada, dados já no cliente

## Self-Check: PASSED

- ✅ 10 arquivos criados verificados
- ✅ 1 arquivo modificado verificado
- ✅ 4 commits presentes (`ab0d66a`, `1b5229d`, `9cc47da`, `ffebbf7`)
- ✅ Build compila sem erros
- ✅ Biome lint passa (12 arquivos)

---

*Phase: 03-kpi-dashboard*
*Completed: 2026-06-06*
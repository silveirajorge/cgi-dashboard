# CSV KPI Dashboard

## What This Is

Um dashboard administrativo para upload diário de arquivos CSV, com geração automática de KPIs e armazenamento em banco SQLite local. Construído sobre o template Studio Admin, mantendo todo o sistema de personalização visual (tema, layout, sidebar).

## Core Value

Upload de CSV diário → dados armazenados com dedup → KPIs gerados automaticamente → visualização no dashboard.

## Requirements

### Validated

- ✓ Dashboard layout com sidebar navegável, header com busca e theme switcher — existente
- ✓ 55+ componentes shadcn/ui (cards, tabelas, gráficos, botões, diálogos) — existente
- ✓ Sistema de temas com 3 presets (brutalist, soft-pop, tangerine) + modo claro/escuro — existente
- ✓ Variantes de layout (sidebar inset, floating, collapsible, conteúdo centralizado) — existente
- ✓ Store Zustand para preferências com persistência via cookies — existente
- ✓ React 19 + Next.js 16 App Router com React Compiler — existente
- ✓ Componentes de gráfico Recharts (bar, line, area, pie, radial) — existente
- ✓ Tabelas com @tanstack/react-table, ordenação e formatação — existente
- ✓ Notificações toast com sonner — existente
- ✓ Suporte a date-fns para formatação de datas — existente

### Active

- [ ] Upload de arquivo CSV via interface do dashboard
- [ ] Parse de CSV com detecção de colunas pelo cabeçalho (ordem variável)
- [ ] Armazenamento em banco SQLite local
- [ ] Deduplicação de registros em uploads cumulativos
- [ ] Geração automática de KPIs (totais, médias, contagens de colunas numéricas)
- [ ] Cards de KPI na página inicial do dashboard
- [ ] Visualização de dados em tabela com dados do SQLite

### Out of Scope

- Autenticação/login — v1 é aberto, sem segregação admin/leitor
- KPIs configuráveis pelo usuário — geração automática baseada em colunas numéricas
- Exportação de dados — v1 foca apenas upload e visualização
- CSV com formato variável — o formato é estático, apenas a ordem das colunas muda
- Domínio específico (vendas, finanças, etc.) — flexível para qualquer CSV

## Context

Projeto brownfield usando o template Studio Admin v2.2.0 (Next.js 16, React 19, shadcn/ui, Tailwind CSS 4, TypeScript 5.9). O código existente é um dashboard template com dados estáticos/mock — todo o sistema de personalização visual deve ser preservado.

A stack adicional para o novo sistema:
- **SQLite**: better-sqlite3 (ou similar) para banco local
- **CSV parsing**: papaparse ou csv-parse
- **API Routes**: Next.js API routes para upload e consulta dos dados

## Constraints

- **Tech Stack**: Manter Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4 (stack existente)
- **Database**: SQLite local (sem necessidade de servidor externo)
- **Visual**: Preservar todo o sistema de personalização (temas, layouts, sidebar)
- **Dados**: CSV cumulativo com dedup — mesma chave não pode gerar duplicatas

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SQLite (better-sqlite3) | Banco local, zero config, ideal para single-user / dados diários | — Pending |
| API Routes para upload | Next.js File API + server-side processing | — Pending |
| Detecção automática de KPIs | Colunas numéricas viram métricas automaticamente sem config | — Pending |
| Dedup por linha completa | Evita duplicatas em re-uploads sem schema fixo de chave | — Pending |
| Preservar dashboard existente | Manter sidebar, temas, layout controls como estão | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-06 after initialization*

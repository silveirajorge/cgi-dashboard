# ROADMAP.md — CSV KPI Dashboard

**Created:** 2026-06-06
**Project Mode:** MVP Vertical
**Granularity:** standard

## Core Value

Upload de CSV diário → dados armazenados com dedup → KPIs gerados automaticamente → visualização no dashboard.

## Phases

- [x] **Phase 1: Backend Foundation** — Infraestrutura de backend: SQLite, parser CSV, API routes, arquitetura em camadas (completed 2026-06-06)
- [x] **Phase 2: Upload UI** — Interface de upload: formulário, drag & drop, validação, feedback visual (completed 2026-06-06)
- [x] **Phase 3: KPI Dashboard** — Dashboard de KPIs: cards automáticos, gráficos, atualização pós-upload (completed 2026-06-06)

## Phase Details

### Phase 1: Backend Foundation
**Goal:** Infraestrutura de backend completa — banco SQLite, engine de parsing CSV, API routes, e arquitetura em camadas.
**Mode:** mvp
**Depends on:** Nothing (primeira fase)
**Requirements:** CSV-03, CSV-05, DATA-01, DATA-02, DATA-03, DATA-04, DATA-05, ARCH-01, ARCH-02, ARCH-03, ARCH-04, CUST-01
**Success Criteria** (what must be TRUE):
  1. CSV files podem ser parseados server-side com detecção de cabeçalho (colunas em qualquer ordem) e normalização (trim, lowercase, underscore)
  2. Dados parseados são armazenados em SQLite em `.data/cgi.db` na tabela `pedidos`, com dedup por `id_contacto + data`
  3. Histórico de uploads é registrado (data/hora, número de linhas importadas) no banco
  4. API routes `/api/upload` (POST) e `/api/data` (GET) respondem corretamente
   5. Sistema de temas, layout, sidebar e personalização visual existente continua funcionando sem regressão
**Plans:** 2/2 plans complete

```
Plans:
- [x] 01-01-PLAN.md — Upload CSV → Storage Pipeline (db.ts, csv.ts, services/pedidos.ts, POST /api/upload)
- [x] 01-02-PLAN.md — Data Retrieval APIs (GET /api/data, GET /api/upload/history)
```

### Phase 2: Upload UI
**Goal:** Usuários podem fazer upload de arquivos CSV através da interface do dashboard com feedback visual.
**Mode:** mvp
**Depends on:** Phase 1
**Requirements:** CSV-01, CSV-02, CSV-04
**Success Criteria** (what must be TRUE):
  1. Usuário pode clicar em um botão de upload para selecionar e enviar um arquivo CSV
  2. Usuário pode arrastar e soltar (drag & drop) um arquivo CSV na área de upload
  3. Sistema exibe toast notification (sonner) com resultado da importação — sucesso com número de linhas, ou mensagem de erro
**Plans:** 1/1 plans complete

```
Plans:
- [x] 02-01-PLAN.md — Upload UI: page, drag & drop component, sidebar item
```
**UI hint:** yes

### Phase 3: KPI Dashboard
**Goal:** Usuários podem visualizar KPIs gerados automaticamente a partir dos dados importados, em cards e gráficos.
**Mode:** mvp
**Depends on:** Phase 2 (dados no banco via upload)
**Requirements:** KPI-01, KPI-02, KPI-03
**Success Criteria** (what must be TRUE):
  1. Página `/dashboard/kpi` exibe cards com soma, média, mínimo e máximo das colunas numéricas
  2. Gráfico (Recharts) é gerado automaticamente a partir dos dados numéricos do SQLite
  3. KPIs e gráficos refletem todos os dados cumulativos (incluindo dedup)
  4. KPIs são atualizados automaticamente após cada novo upload — sem refresh manual
**Plans:** 2/2 plans complete

```
Plans:
- [x] 03-01-PLAN.md — Backend infrastructure: sidebar, DB migration, enhanced APIs (data, CIL, carteira)
- [x] 03-02-PLAN.md — KPI frontend: dashboard page, cards, charts, modals, period filter
```

## Dependencies

```
Phase 1 (Backend Foundation)
  └── Phase 2 (Upload UI)
       └── Phase 3 (KPI Dashboard)
```

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1 - Backend Foundation | 2/2 | Complete   | 2026-06-06 |
| 2 - Upload UI | 1/1 | Complete   | 2026-06-06 |
| 3 - KPI Dashboard | 2/2 | Complete   | 2026-06-06 |

---

*Roadmap generated: 2026-06-06*
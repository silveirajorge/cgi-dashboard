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
- [x] **Phase 4.1: Cadastro de Funcionários** — Página de gestão de funcionários com CRUD, soft delete (completed 2026-06-07)
- [x] **Phase 4.2: Formulário de Avaliação** — Formulário de avaliação individual com categorias, nota e comentário (completed 2026-06-07)
- [x] **Phase 4.3: Dashboard do Grupo** — KPIs do grupo de avaliação com filtros e comparativo (completed 2026-06-07)
- [x] **Phase 4.4: Histórico por Funcionário** — Histórico de avaliações com gráfico de evolução e tabela (completed 2026-06-07)
- [x] **Phase 4.5: Extensão da Auditoria** — Novos campos: atrasos/faltas, ferramenta, erro crítico, produtividade %, nota auditoria, tipo supervisor/auditor (completed 2026-06-07)

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

### Phase 4.1: Cadastro de Funcionários
**Goal:** Página de gestão de funcionários com cadastro, edição e soft delete.
**Mode:** mvp
**Depends on:** Phase 3 (infra existente)
**Requirements:** SC-01, SC-02, SC-03, SC-04, SC-05
**Success Criteria** (what must be TRUE):
   1. Página `/dashboard/funcionarios` com tabela de funcionários (nome, ativo/inativo)
   2. Botão "Adicionar Funcionário" com formulário (nome)
   3. Toggle ativar/desativar (soft delete — dados mantidos na BD)
   4. Tabela SQLite `funcionarios` com colunas: id, nome, ativo, created_at
   5. API endpoints: GET /api/funcionarios, POST, PUT /api/funcionarios/[id], DELETE (soft)
**Plans:** 1/1 plans complete

```
Plans:
- [x] 04.1-01-PLAN.md — Full CRUD: DB migration, API routes, page, table, modal
```

### Phase 4.2: Formulário de Avaliação
**Goal:** Formulário de avaliação individual com categorias de desempenho.
**Mode:** mvp
**Depends on:** Phase 4.1 (funcionários cadastrados)
**Requirements:** SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07, SC-08, SC-09
**Success Criteria** (what must be TRUE):
  1. Página `/dashboard/avaliacao` com listagem de avaliações + botão "Nova Avaliação"
  2. Formulário com 6 categorias (Pontualidade, Qualidade, Produtividade, Trabalho em Equipa, Iniciativa, Comunicação) — escala 1-10
  3. Média automática das categorias + campo de comentário opcional
  4. Salva na BD com data específica + id_funcionario
  5. Tabela SQLite `avaliacoes`
  6. API: GET /api/avaliacoes, POST /api/avaliacoes, GET /api/avaliacoes/[id]
**Plans:** 1/1 plans complete

```
Plans:
- [x] 04.2-01-PLAN.md — Full form: DB migration, API routes, page, table + filters, inline form, detail modal
```

### Phase 4.3: Dashboard do Grupo
**Goal:** Dashboard de KPIs do grupo de avaliação com filtros e comparativo entre funcionários.
**Mode:** mvp
**Depends on:** Phase 4.2 (avaliações no banco)
**Requirements:** SC-01, SC-02, SC-03, SC-04, SC-05, SC-06
**Success Criteria** (what must be TRUE):
  1. Página `/dashboard/avaliacao-dashboard` com KPIs do grupo
  2. KPIs: média geral, média por categoria, total de avaliações, funcionário com melhor média
  3. Gráfico comparativo entre funcionários (barras)
  4. Filtro por período (dropdown mês + date range) e dropdown de funcionário (ou "Todos")
  5. Apenas funcionários ativos entram nas métricas
  6. API: GET /api/avaliacoes/stats?from=&to=&funcionario_id=
**Plans:** 1/1 plans complete

```
Plans:
- [x] 04.3-01-PLAN.md — Full dashboard: stats API, cards, BarChart, filters
```

### Phase 4.4: Histórico por Funcionário
**Goal:** Visualização do histórico completo de avaliações de cada funcionário.
**Mode:** mvp
**Depends on:** Phase 4.2 (avaliações no banco)
**Requirements:** SC4.4-01, SC4.4-02, SC4.4-03, SC4.4-04, SC4.4-05
**Success Criteria** (what must be TRUE):
   1. Clique no nome do funcionário no dashboard abre o histórico → SC4.4-01
   2. Gráfico de evolução temporal (linha) + tabela com detalhes das avaliações → SC4.4-02
   3. Filtro por período → SC4.4-03
   4. Apenas leitura (sem editar/apagar avaliações passadas) → SC4.4-04
   5. API: GET /api/avaliacoes?funcionario_id=&from=&to= → SC4.4-05
**Plans:** 1/1 plans pending

```
Plans:
- [x] 04.4-01-PLAN.md — Modal de histórico: API SELECT, HistoricoModal, wiring no dashboard
```

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1 - Backend Foundation | 2/2 | Complete   | 2026-06-06 |
| 2 - Upload UI | 1/1 | Complete   | 2026-06-06 |
| 3 - KPI Dashboard | 2/2 | Complete   | 2026-06-06 |
| 4.1 - Cadastro de Funcionários | 1/1 | Complete   | 2026-06-07 |
| 4.2 - Formulário de Avaliação | 1/1 | Complete   | 2026-06-07 |
| 4.3 - Dashboard do Grupo | 1/1 | Complete   | 2026-06-07 |
| 4.4 - Histórico por Funcionário | 1/1 | Complete   | 2026-06-07 |
| 4.5 - Extensão da Auditoria | 1/1 | Complete   | 2026-06-07 |

---

### Phase 4.5: Extensão da Auditoria
**Goal:** Estender formulário e dashboard com novos campos: atrasos, faltas, uso ferramenta, erro crítico (booleanos), produtividade (%), nota auditoria (0-100) e tipo (supervisor/auditor).
**Mode:** mvp
**Depends on:** Phase 4.2 (formulário existente)
**Success Criteria** (what must be TRUE):
    1. Formulário de avaliação tem novos campos (booleans, %, nota, tipo)
    2. API aceita e retorna os novos campos
    3. Dashboard exibe novos KPIs e gráfico comparativo supervisor vs auditor
**Plans:** 1/1 plans complete

```
Plans:
- [x] 04.5-01-PLAN.md — Migration, API, formulário e dashboard com 7 novos campos de auditoria
```

*Roadmap generated: 2026-06-06*
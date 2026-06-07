# Requirements: CSV KPI Dashboard

**Defined:** 2026-06-06
**Core Value:** Upload de CSV diário → dados armazenados com dedup → KPIs gerados automaticamente → visualização no dashboard

## v1 Requirements

### CSV Upload & Parsing

- [ ] **CSV-01**: Usuário pode fazer upload de arquivo CSV via botão de seleção
- [ ] **CSV-02**: Usuário pode arrastar e soltar (drag & drop) arquivo CSV
- [ ] **CSV-03**: Sistema valida cabeçalho do CSV — colunas esperadas devem estar presentes (independente da ordem)
- [ ] **CSV-04**: Sistema exibe feedback pós-upload (sonner toast) com número de linhas importadas ou erro
- [ ] **CSV-05**: Colunas do CSV são normalizadas (trim, lowercase, replace espaços por underscore)

### Data Storage

- [ ] **DATA-01**: Dados do CSV armazenados em SQLite local (`.data/cgi.db`)
- [ ] **DATA-02**: Uploads são cumulativos — novos dados somam-se aos existentes
- [ ] **DATA-03**: Deduplicação por `id_contacto + data` (coluna virtual de data)
- [ ] **DATA-04**: Tabela no banco chamada `pedidos` (schema definido pelo CSV)
- [ ] **DATA-05**: Histórico de uploads registrado (data/hora, número de linhas)

### KPI Display

- [ ] **KPI-01**: Página `/dashboard/kpi` exibe cards com KPIs (soma, média, min, max) das colunas numéricas
- [ ] **KPI-02**: Gráfico gerado automaticamente a partir dos dados numéricos
- [ ] **KPI-03**: KPIs são atualizados após cada upload

### Architecture & Quality

- [ ] **ARCH-01**: Código organizado em camadas (layers) para modularidade e clean code
- [ ] **ARCH-02**: Banco de dados isolado em `.data/` (gitignored)
- [ ] **ARCH-03**: Arquivos CSV de template/teste em `data/csv/` (versionados)
- [ ] **ARCH-04**: Singleton de conexão SQLite em `src/lib/db.ts`

### Customization

- [ ] **CUST-01**: Sistema de temas e layout existente é preservado (theme switcher, sidebar, layout controls)

## Fase 4 — Avaliação de Desempenho

### Dashboard do Grupo (4.3)

- [x] **SC-1**: Página `/dashboard/avaliacao-dashboard` com KPIs do grupo
- [x] **SC-2**: KPIs: média geral, média por categoria, total avaliações, melhor funcionário
- [x] **SC-3**: Gráfico comparativo entre funcionários (barras)
- [x] **SC-4**: Filtro por período (dropdown mês + date range) e dropdown de funcionário (ou "Todos")
- [x] **SC-5**: Apenas funcionários ativos entram nas métricas
- [x] **SC-6**: API: GET /api/avaliacoes/stats?from=&to=&funcionario_id=

## v2 Requirements

### Data Display

- **DISP-01**: Tabela completa com todos os dados do CSV (usando @tanstack/react-table)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Autenticação/login | v1 é aberto, sem segregação de usuários |
| KPIs configuráveis | Geração automática baseada em colunas numéricas |
| Exportação de dados | Deferido para v2 |
| Schema configurável | Schema definido pelo CSV estático |
| Modo serverless | SQLite é local-only |
| Upload de múltiplos CSVs | v1 aceita um CSV por upload |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CSV-01 | Phase 2 | Pending |
| CSV-02 | Phase 2 | Pending |
| CSV-03 | Phase 1 | Pending |
| CSV-04 | Phase 2 | Pending |
| CSV-05 | Phase 1 | Pending |
| DATA-01 | Phase 1 | Pending |
| DATA-02 | Phase 1 | Pending |
| DATA-03 | Phase 1 | Pending |
| DATA-04 | Phase 1 | Pending |
| DATA-05 | Phase 1 | Pending |
| KPI-01 | Phase 3 | Pending |
| KPI-02 | Phase 3 | Pending |
| KPI-03 | Phase 3 | Pending |
| ARCH-01 | Phase 1 | Pending |
| ARCH-02 | Phase 1 | Pending |
| ARCH-03 | Phase 1 | Pending |
| ARCH-04 | Phase 1 | Pending |
| CUST-01 | Phase 1 | Pending |
| SC-1 | Phase 4.3 | Complete |
| SC-2 | Phase 4.3 | Complete |
| SC-3 | Phase 4.3 | Complete |
| SC-4 | Phase 4.3 | Complete |
| SC-5 | Phase 4.3 | Complete |
| SC-6 | Phase 4.3 | Complete |

**Coverage:**
- Total requirements: 24
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-06-06*
*Last updated: 2026-06-06 after initial definition*
# Phase 4: Avaliação de Desempenho — Context

**Gathered:** 2026-06-07
**Status:** Ready for planning (split into 4 sub-phases)

<domain>
## Phase Boundary

Sistema de avaliação de desempenho individual: cadastro de funcionários com soft delete, formulário de avaliação com categorias, dashboard do grupo com KPIs e comparativo, e histórico por funcionário.

Dividido em 4 sub-fases (4.1 a 4.4) para execução incremental.

</domain>

<decisions>
## Implementation Decisions

### Sub-fases e Dependências
- **D-01:** Fase 4 dividida em 4 sub-fases executadas em sequência:
  1. **4.1 — Cadastro de Funcionários** (sem dependências)
  2. **4.2 — Formulário de Avaliação** (depende de 4.1)
  3. **4.3 — Dashboard do Grupo** (depende de 4.2)
  4. **4.4 — Histórico por Funcionário** (depende de 4.2)

### Sidebar — Grupo "Avaliação e Desempenho"
- **D-02:** Grupo já criado em `src/navigation/sidebar/sidebar-items.ts` com id=2
- **D-03:** Itens do grupo:
  - "Dashboard" → URL `/dashboard/avaliacao-dashboard`, ícone `LineChart` (vem do coming soon)
  - "Avaliação" → URL `/dashboard/avaliacao`, ícone `LineChart` (vem do coming soon)
- **D-04:** Ambos começam como `comingSoon: true` — passar para `false` quando a respetiva sub-fase for implementada

### Estrutura da Avaliação
- **D-05:** Tipo: **Misto** — notas por categoria + média automática + comentário opcional
- **D-06:** **6 categorias** fixas:
  - Pontualidade
  - Qualidade
  - Produtividade
  - Trabalho em Equipa
  - Iniciativa
  - Comunicação
- **D-07:** **Escala 1-10** para cada categoria
- **D-08:** **Média geral automática** — média aritmética simples das 6 notas
- **D-09:** **Comentário opcional** — campo de texto livre
- **D-10:** **Periodicidade livre** — o utilizador decide quando avaliar
- **D-11:** **Data específica (YYYY-MM-DD)** associada a cada avaliação (não usa mes_competencia)
- **D-12:** **Formulário em página dedicada** (`/dashboard/avaliacao`), não modal

### Cadastro de Funcionários
- **D-13:** **Página dedicada** em `/dashboard/funcionarios`
- **D-14:** **Dados guardados:** apenas nome + ativo/inativo
- **D-15:** **Soft delete** — toggle ativo/inativo na própria listagem
- **D-16:** Ações na página: lista com nome + toggle ativo/inativo + botão editar + botão adicionar
- **D-17:** Tabela SQLite `funcionarios`:
  ```sql
  CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    ativo INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **D-18:** API endpoints:
  - `GET /api/funcionarios` — lista todos (aceita `?ativos=true` para filtrar)
  - `POST /api/funcionarios` — body: `{ nome }`
  - `PUT /api/funcionarios/[id]` — body: `{ nome }` ou `{ ativo: 0/1 }`
  - `DELETE /api/funcionarios/[id]` — soft delete (set ativo=0)

### Dashboard do Grupo
- **D-19:** Página em `/dashboard/avaliacao-dashboard`
- **D-20:** **KPIs principais:**
  - Média geral do grupo (período)
  - Média por categoria (período)
  - Total de avaliações no período
  - Funcionário com melhor média
- **D-21:** **Gráfico comparativo** entre funcionários (barras)
- **D-22:** **Filtros:** período (dropdown mês + date range) + dropdown de funcionário (ou "Todos")
- **D-23:** **Apenas funcionários ativos** entram nas métricas
- **D-24:** API:
  - `GET /api/avaliacoes/stats?from=&to=&funcionario_id=` — estatísticas do período

### Histórico por Funcionário
- **D-25:** **Acesso:** clique no nome do funcionário no dashboard
- **D-26:** **Visualização mista:** gráfico de evolução temporal (linha) + tabela com detalhes
- **D-27:** **Filtro por período**
- **D-28:** **Apenas leitura** — sem editar ou apagar avaliações passadas
- **D-29:** API:
  - `GET /api/avaliacoes/[funcionario_id]?from=&to=` — histórico do funcionário

### Tabela SQLite `avaliacoes`
- **D-30:** Schema:
  ```sql
  CREATE TABLE IF NOT EXISTS avaliacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    funcionario_id INTEGER NOT NULL,
    data_avaliacao TEXT NOT NULL,
    pontualidade INTEGER NOT NULL CHECK(pontualidade >= 1 AND pontualidade <= 10),
    qualidade INTEGER NOT NULL CHECK(qualidade >= 1 AND qualidade <= 10),
    produtividade INTEGER NOT NULL CHECK(produtividade >= 1 AND produtividade <= 10),
    trabalho_equipa INTEGER NOT NULL CHECK(trabalho_equipa >= 1 AND trabalho_equipa <= 10),
    iniciativa INTEGER NOT NULL CHECK(iniciativa >= 1 AND iniciativa <= 10),
    comunicacao INTEGER NOT NULL CHECK(comunicacao >= 1 AND comunicacao <= 10),
    media REAL GENERATED ALWAYS AS (
      (pontualidade + qualidade + produtividade + trabalho_equipa + iniciativa + comunicacao) / 6.0
    ) STORED,
    comentario TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id)
  );
  ```

### the Agent's Discretion
- Layout exato das páginas (grid, espaçamento)
- Cores dos gráficos (variáveis CSS `--chart-*`)
- Texto de placeholders e labels
- Ícones específicos para cada item da sidebar

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap e Decisões
- `.planning/ROADMAP.md` — Fase 4.1 a 4.4 com success criteria
- `.planning/phases/04-avaliacao-de-desempenho/04-CONTEXT.md` — Este documento (decisões acima)

### Código Existente (Padrões a Seguir)
- `src/app/(main)/dashboard/kpi/` — Padrão de página dashboard (server component + client children)
- `src/app/(main)/dashboard/kpi/_components/kpi-cards.tsx` — Padrão de cards KPI
- `src/app/(main)/dashboard/kpi/_components/period-filter.tsx` — Padrão de filtro de período
- `src/navigation/sidebar/sidebar-items.ts` — Sidebar (grupo "Avaliação e Desempenho" já criado)
- `src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx` — Sidebar app
- `src/lib/db.ts` — Singleton SQLite + migrações
- `src/components/ui/card.tsx` — Card component
- `src/components/ui/dialog.tsx` — Dialog para modais
- `src/components/ui/table.tsx` — Table para listagens
- `src/components/ui/select.tsx` — Select para dropdowns
- `src/components/ui/chart.tsx` — Chart wrapper Recharts
- `src/components/ui/badge.tsx` — Badge

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Card, Table, Select, Dialog, Button, Input, Badge, Chart — todos disponíveis em `src/components/ui/`
- Server Component page + Client Component children pattern (ex: `kpi/page.tsx` + `kpi-dashboard-client.tsx`)
- Period filter com dropdown de mês (componente em `kpi/_components/period-filter.tsx`)
- Sidebar items em array tipado em `src/navigation/sidebar/sidebar-items.ts`

### Established Patterns
- Páginas em server components, interatividade em client components co-locados em `_components/`
- Fetch client-side em useEffect
- API routes em `src/app/api/`
- Migrations SQLite em `src/lib/db.ts`
- Ícones lucide-react

</code_context>

<deferred>
## Deferred Ideas

Nenhuma — discussão manteve-se dentro do escopo da fase.

</deferred>

---

*Phase: 4 — Avaliação de Desempenho*
*Context gathered: 2026-06-07*

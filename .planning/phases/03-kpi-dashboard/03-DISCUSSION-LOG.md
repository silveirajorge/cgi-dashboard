# Phase 3: KPI Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-06
**Phase:** 3-KPI Dashboard
**Areas discussed:** sideBar, periodFilter, kpis, charts, cilModal, customerPortfolio

---

## Sidebar

| Option | Description | Selected |
|--------|-------------|----------|
| Manter "Upload CSV" no grupo Dashboards | Como está hoje | |
| Criar grupo "Pedidos e Tendências" | Novo grupo com Dashboard + Importar CSV | ✓ |

**User's choice:** Novo grupo "Pedidos e Tendências" com Dashboard e Importar CSV. Remover "Upload CSV" do grupo Dashboards.

---

## Filtro de Período

| Option | Description | Selected |
|--------|-------------|----------|
| Dropdown de mês | Seleciona mês a mês | ✓ |
| Date range picker | Seleciona data início/fim | ✓ |
| Ambos | Seletor de mês + range livre | ✓ |

**User's choice:** Ambos — dropdown de mês + date range picker.

---

## KPIs

| Option | Description | Selected |
|--------|-------------|----------|
| Todos os KPIs do original | Total, Crescimento, Média, Máximo, Canais, Tipologias, CIL | ✓ |
| Só cards principais | Total, Crescimento, Média, Máximo | |
| Versão simplificada | Total e Crescimento apenas | |

**User's choice:** Todos os KPIs do original, reimplementados do zero — usar conceito, não reutilizar regras do código antigo.

---

## Gráficos

| Option | Description | Selected |
|--------|-------------|----------|
| Evolução diária (linha) | Volume de pedidos por dia | ✓ |
| Distribuição por canal (donut) | % de cada canal | ✓ |
| Pedidos por canal (barras) | Volume por canal | ✓ |
| Chamados por CIL (barras) | CILs clicáveis → modal | ✓ |

**User's choice:** Todos os 4 gráficos. CIL com barra clicável → modal com tabela, filtro por estado (dropdown), e export CSV.

---

## Modal CIL

**User's notes:**
- Abrir modal ao clicar em barra de CIL
- Tabela com todos os chamados do CIL no período
- Filtro por Estado (coluna do CSV) — dropdown
- Exportar tickets filtrados para CSV

---

## Carteira de Clientes

| Option | Description | Selected |
|--------|-------------|----------|
| Sim | Modal para editar valor manual por período | ✓ |
| Não | Sem essa funcionalidade | |

**User's choice:** Sim. Tabela SQLite (`carteira_clientes`) associada a `mes_competencia`. Se já existe para o mês, carrega valor; se não, cria ao salvar. Modal de edição igual ao antigo.

---

## the agent's Discretion

- Cores dos gráficos (usar variáveis CSS do tema)
- Layout responsivo dos grids
- Implementação do cálculo de dias úteis
- Números exatos de breakpoints do grid
- Texto de placeholders/labels

## Deferred Ideas

None.
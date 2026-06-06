# Phase 3: KPI Dashboard - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Página `/dashboard/kpi` com dashboard completo de KPIs gerados automaticamente a partir dos dados do SQLite: cards de métricas, gráficos Recharts, seção de canais e tipologias, seção de CIL com modal de detalhes, filtro de período (dropdown de mês + date range picker), e modal para Carteira de Clientes editável manualmente.

Inclui reestruturação da sidebar: novo grupo "Pedidos e Tendências" com itens Dashboard (`/dashboard/kpi`) e Importar CSV (`/dashboard/upload`), movendo o item atual "Upload CSV" do grupo Dashboards para o novo grupo.

</domain>

<decisions>
## Implementation Decisions

### Sidebar — Novo Grupo "Pedidos e Tendências"
- **D-01:** Criar novo grupo na sidebar chamado "Pedidos e Tendências" entre os grupos existentes (ex: após Dashboards)
- **D-02:** O grupo terá dois itens:
  - "Dashboard" → URL `/dashboard/kpi`, ícone `BarChart3` (lucide-react)
  - "Importar CSV" → URL `/dashboard/upload`, ícone `Upload` (lucide-react)
- **D-03:** Remover o item "Upload CSV" do grupo "Dashboards" (src/navigation/sidebar/sidebar-items.ts) — ele foi movido para o novo grupo

### Página /dashboard/kpi
- **D-04:** Server Component page em `src/app/(main)/dashboard/kpi/page.tsx`
- **D-05:** Componentes co-locados em `src/app/(main)/dashboard/kpi/_components/`
- **D-06:** No topo da página: filtro de período (dropdown de mês + date range picker lado a lado)
- **D-07:** Abaixo: cards de KPI em grid, depois gráficos em grid 2-col, depois seções de canal/tipologia/CIL

### Filtro de Período
- **D-08:** Dois modos de seleção:
  - Dropdown de mês (meses disponíveis no banco, extraídos de `mes_competencia`)
  - Date range picker (data de início e fim, estilo calendário)
- **D-09:** Quando um mês é selecionado no dropdown, o range picker reflete o mês inteiro
- **D-10:** KPIs e gráficos sempre refletem o período selecionado (não dados totais)
- **D-11:** Valor padrão: último mês com dados (ou range completo se houver)

### KPIs (reimplementados do zero — sem reutilizar lógica do antigo)
- **D-12:** Cards de KPI em grid (responsivo):
  - **Total de Pedidos** — contagem de registros no período
  - **Carteira de Clientes** — valor manual, editável via modal
  - **Crescimento Líquido** — % vs. período anterior comparável
  - **Média diária (dias úteis)** — total / dias úteis no período
  - **Dia com maior volume** — data + número de pedidos
  - *Nota: dias úteis calculados via biblioteca/business-days, excluindo fins de semana*
- **D-13:** Cards usam `Card`, `CardHeader`, `CardContent` do shadcn/ui
- **D-14:** Valores formatados com `Intl.NumberFormat("pt-PT")`

### Gráficos (Recharts)
- **D-15:** **Evolução diária** — gráfico de linha (`LineChart`): eixo X = data, eixo Y = volume de pedidos
- **D-16:** **Distribuição por canal (%)** — gráfico de rosca (`PieChart` com innerRadius): canais de entrada (Back-Office, Email, Portal, Telefone Front + outros)
- **D-17:** **Pedidos por canal** — gráfico de barras horizontais (`BarChart` layout="vertical"): volume por canal
- **D-18:** **Chamados por CIL** — gráfico de barras horizontais: top N CILs por volume, cada barra clicável
- **D-19:** Todos os gráficos usam `ChartContainer` + `ChartTooltip` do shadcn/ui chart wrapper

### Seção de Canais e Tipologias
- **D-20:** A coluna `receção` do CSV identifica o canal de entrada
- **D-21:** Canais normalizados para: Back-Office, Email, Portal, Telefone Front (mapeamento de variantes)
- **D-22:** Para cada canal, exibir top 5 tipologias (coluna `Justificação` ou similar) em cards lado a lado

### Modal de CIL
- **D-23:** Ao clicar em uma barra de CIL, abrir modal com todos os chamados (linhas) daquele CIL no período selecionado
- **D-24:** Modal deve ter tabela com os chamados (usando @tanstack/react-table)
- **D-25:** **Filtro por Estado** — dropdown para filtrar tickets por `Estado` (coluna do CSV)
- **D-26:** **Exportar CSV** — botão que exporta os tickets filtrados (ou todos) para CSV
- **D-27:** Modal exibe contagem total e contagem filtrada

### Carteira de Clientes (Persistência em SQLite)
- **D-28:** Nova tabela no SQLite: `carteira_clientes`
  ```sql
  CREATE TABLE IF NOT EXISTS carteira_clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mes_competencia TEXT NOT NULL UNIQUE,
    total_clientes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  ```
- **D-29:** Ao acessar um período, verificar se existe carteira cadastrada para o(s) mês(es) — carregar o valor
- **D-30:** Ao salvar via modal:
  - Se não existe registro para o mês → INSERT
  - Se existe → UPDATE com novo valor
  - Se período abrange múltiplos meses → associar ao mês final do range
- **D-31:** Modal de edição: campo numérico, botões Cancelar/Guardar
- **D-32:** API endpoints:
  - `GET /api/carteira?mes=YYYY-MM` — retorna total_clientes ou null
  - `POST /api/carteira` — body: `{ mes_competencia, total_clientes }`

### API Routes — Modificações e Novas
- **D-33:** `GET /api/data` — ACEITAR PARÂMETROS `?from=YYYY-MM-DD&to=YYYY-MM-DD` para filtrar por período. Adicionar ao response: `canais` (distribuição por canal), `daily` (evolução diária), `meses_disponiveis` (lista de meses com dados)
- **D-34:** `GET /api/cil?from=...&to=...` — agregação de chamados por CIL no período: `[{ cil, count }]` ordenado por count DESC
- **D-35:** `GET /api/cil/[cil]?from=...&to=...` — retorna todos os registros de um CIL específico no período, suportando `?estado=...` para filtrar
- **D-36:** `GET /api/carteira?mes=YYYY-MM` — consulta carteira
- **D-37:** `POST /api/carteira` — salva/atualiza carteira
- **D-38:** `POST /api/upload` — (existente) permanece igual; o dashboard pode re-fetch ao receber sucesso

### Auto-Refresh
- **D-39:** Após upload bem-sucedido na página `/dashboard/upload`, exibir link/botão "Ver Dashboard" ou navegação automática (via toast com ação)
- **D-40:** Na página `/dashboard/kpi`, os dados são buscados via fetch client-side ao montar a página ou ao mudar o período — sem SSE/polling em tempo real
- **D-41:** O componente de dashboard é um Client Component que faz fetch do `GET /api/data` (e demais endpoints) com os parâmetros de período

### Crescimento Líquido
- **D-42:** Comparar total do período atual com o período anterior equivalente (mesmo número de dias/meses)
- **D-43:** Se período = mês específico, comparar com o mês anterior
- **D-44:** Se período = range customizado, comparar com range anterior de mesma duração
- **D-45:** Fórmula: `(total_atual - total_anterior) / total_anterior * 100`
- **D-46:** Exibir "vs. Mês Anterior" ou "vs. Período Anterior" como subtítulo

### the agent's Discretion
- Cores exatas dos gráficos (usar variáveis CSS do tema via `--chart-*`)
- Layout responsivo exato dos grids (quantas colunas em cada breakpoint)
- Animação de transição ao mudar período
- Texto exato dos placeholders e labels
- Implementação do cálculo de dias úteis (biblioteca ou função manual excluindo sábado/domingo)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e Roadmap
- `.planning/REQUIREMENTS.md` — KPI-01, KPI-02, KPI-03
- `.planning/ROADMAP.md` — Fase 3: KPI Dashboard com success criteria
- `.planning/PROJECT.md` — Contexto do projeto, constraints

### API Existente (Fase 1)
- `src/app/api/data/route.ts` — GET /api/data (precisa ser modificado para aceitar período)
- `src/app/api/upload/route.ts` — POST /api/upload (existente, sem mudanças)
- `src/app/api/upload/history/route.ts` — GET /api/upload/history (existente)
- `.planning/phases/01-backend-foundation/01-CONTEXT.md` — Decisões de backend (schema pedidos, dedup)

### Código Existente (UI Patterns)
- `src/app/(main)/dashboard/ecommerce/_components/kpi-strip.tsx` — Padrão de KPI cards no projeto
- `src/app/(main)/dashboard/default/_components/metric-cards.tsx` — Outro padrão de metric cards
- `src/components/ui/card.tsx` — Card component do shadcn/ui
- `src/components/ui/chart.tsx` — Wrapper Recharts do shadcn/ui
- `src/components/ui/badge.tsx` — Badge para variações percentuais
- `src/navigation/sidebar/sidebar-items.ts` — Estrutura da sidebar (modificar)
- `src/lib/utils.ts` — cn(), formatCurrency()

### Projeto de Referência (Antigo Dashboard CGI)
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/domain/services/monthly-metrics-service.js` — Lógica de cálculo de métricas (referência de conceito, não reimplementar)
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/domain/services/range-metrics-service.js` — Métricas por range de meses
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/presentation/renderers/kpi-renderer.js` — Renderização de KPIs (formatação, labels)
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/presentation/renderers/chart-renderer.js` — Gráficos (donut, line)
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/domain/services/channel-normalization-service.js` — Normalização de canais (Back-Office, Email, Portal, Telefone Front)
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/domain/services/cil-service.js` — Agregação por CIL
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/index.html` — Estrutura HTML completa do dashboard original
- `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/src/presentation/controllers/dashboard-controller.js` — Controller com lógica de período, refresh, CIL

### Screenshots do Design
- `data/templates/Screenshot *.png` — Screenshots do design desejado (10 imagens)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter — usar para todos os KPI cards
- `src/components/ui/chart.tsx` — ChartContainer, ChartTooltip, ChartTooltipContent — wrapper Recharts já configurado com tema CSS
- `src/components/ui/badge.tsx` — Badge com variant="destructive"/"success" para variações positivas/negativas
- `src/components/ui/dialog.tsx` — Dialog para modais (CIL detail, Carteira de Clientes)
- `src/components/ui/select.tsx` — Select para dropdown de mês e filtro de estado
- `src/components/ui/table.tsx` — Table para listagem de tickets no modal CIL
- `lucide-react` — Ícones: BarChart3, TrendingUp, Users, Calendar, Download, Filter, etc.
- `date-fns` — Formatação de datas (já no projeto)
- `@tanstack/react-table` — Tabela no modal CIL com ordenação/seleção (já no projeto)
- `src/lib/utils.ts` — cn(), formatCurrency()
- `Sonner` — Toast notifications para feedback (já no projeto)

### Established Patterns
- **Server Component page + Client Component children** — Page.tsx como server, componentes interativos como client
- **Co-locação** — Componentes em `_components/` dentro da rota
- **Data fetching client-side** — fetch em useEffect para buscar dados da API
- **shadcn/ui chart wrapper** — ChartContainer + chartConfig + Recharts primitives
- **Sidebar items** — Array de grupos em `src/navigation/sidebar/sidebar-items.ts`

### Integration Points
- `src/navigation/sidebar/sidebar-items.ts` — Adicionar grupo "Pedidos e Tendências" e mover/remover "Upload CSV" do grupo Dashboards
- `src/app/(main)/dashboard/kpi/` — Nova rota (criar diretório)
- `src/app/api/data/route.ts` — Modificar para aceitar ?from=&to= e retornar dados de canais/daily
- `src/app/api/cil/route.ts` — Nova rota para agregação CIL
- `src/app/api/cil/[cil]/route.ts` — Nova rota para detalhes de CIL
- `src/app/api/carteira/route.ts` — Nova rota para carteira de clientes
- `src/lib/db.ts` — Adicionar migração da tabela carteira_clientes

### Creative Options
- **Dias úteis**: Calcular manualmente excluindo sábado/domingo (simples, sem dependência) vs. usar biblioteca como `business-days` ou `date-fns-holiday`
- **Crescimento**: Para ranges customizados, encontrar o range anterior de mesma duração vs. comparar com o mesmo período do ano anterior
- **Chart tipo**: Recharts LineChart vs AreaChart para evolução diária (AreaChart com fill gradient dá efeito visual similar ao antigo canvas)

</code_context>

<specifics>
## Specific Ideas

- O antigo dashboard CGI usa canvas para gráficos (donut + line). O novo deve usar Recharts com os componentes shadcn/ui chart wrapper — visual moderno, responsivo, com tema CSS.
- Canais de entrada normalizados: Back-Office, Email, Portal, Telefone Front (mapeamento dos valores da coluna `receção`)
- CIL é a coluna `CIL` do CSV — contém identificadores de posto/contrato
- Estado dos tickets é a coluna `Estado` do CSV — usar para filtrar no modal CIL
- Tipologias vêm da coluna `Justificação` (ou similar) — top 5 por canal
- Data de contacto para evolução diária: coluna `Dt Contato` do CSV (fallback: `Dt Registo`)
- Screenshots do design disponíveis em `data/templates/`
- O projeto antigo está em `/mnt/c/Documents and Settings/jsilveira/Documents/CGI/` — usar como referência conceitual, não para copiar código
- A coluna `mes_competencia` já existe na tabela `pedidos` (YYYY-MM extraído de Dt Registo) — usar para filtro por mês

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 3-KPI Dashboard*
*Context gathered: 2026-06-06*
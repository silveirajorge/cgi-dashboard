# Phase 3: KPI Dashboard - Research

**Researched:** 2026-06-06
**Domain:** KPI Dashboard — SQLite aggregation, Recharts charts, period filtering, sidebar restructure
**Confidence:** HIGH

## Summary

Esta fase entrega a página `/dashboard/kpi` com dashboard completo de KPIs gerados automaticamente a partir dos dados SQLite. Inclui cards de métricas, 4 gráficos Recharts (evolução diária, distribuição por canal, pedidos por canal, chamados por CIL), filtro de período (dropdown de mês + date range picker), modal de detalhes CIL com tabela e export CSV, e modal de Carteira de Clientes editável.

A abordagem principal é **calcular métricas via SQL agregado no backend** (em vez de carregar todos os registros e computar no cliente), com endpoints API específicos para cada dimensão. A pasta já tem dados reais em `data/csv/*.csv` e 93.809 registros importados no SQLite.

**Primary recommendation:** Modificar `GET /api/data` para aceitar `?from=&to=` e expandir seu response com canais, daily e meses_disponiveis. Criar endpoints separados para CIL e Carteira. Construir todos os gráficos com o wrapper `ChartContainer` + `ChartTooltip` do shadcn/ui já existente em `src/components/ui/chart.tsx`.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Criar novo grupo na sidebar chamado "Pedidos e Tendências" entre os grupos existentes (após Dashboards)
- **D-02:** Grupo terá dois itens: "Dashboard" → `/dashboard/kpi` (ícone `BarChart3`), "Upload CSV" → `/dashboard/upload` (ícone `Upload`)
- **D-03:** Remover o item "Upload CSV" do grupo "Dashboards"
- **D-04:** Server Component page em `src/app/(main)/dashboard/kpi/page.tsx`
- **D-05:** Componentes co-locados em `src/app/(main)/dashboard/kpi/_components/`
- **D-06:** Topo da página: filtro de período (dropdown de mês + date range picker)
- **D-07:** Cards KPI em grid, depois gráficos grid 2-col, depois seções canal/tipologia/CIL
- **D-08:** Dois modos de seleção: dropdown de mês + date range picker
- **D-09:** Dropdown de mês reflete o mês inteiro no range picker
- **D-10:** KPIs e gráficos sempre refletem período selecionado
- **D-11:** Valor padrão: último mês com dados (ou range completo)
- **D-12:** Cards KPI: Total de Pedidos, Carteira de Clientes, Crescimento Líquido, Média diária, Dia com maior volume
- **D-13:** Cards usam `Card`, `CardHeader`, `CardContent` do shadcn/ui
- **D-14:** Valores formatados com `Intl.NumberFormat("pt-PT")`
- **D-15:** Evolução diária → LineChart
- **D-16:** Distribuição por canal → PieChart com innerRadius (donut)
- **D-17:** Pedidos por canal → BarChart layout="vertical"
- **D-18:** Chamados por CIL → BarChart, barras clicáveis
- **D-19:** Gráficos usam ChartContainer + ChartTooltip
- **D-20:** Coluna `receção` identifica canal
- **D-21:** Canais normalizados: Back-Office, Email, Portal, Telefone Front
- **D-22:** Top 5 tipologias (coluna `justificação`) por canal
- **D-23:** CIL clicável → modal com chamados
- **D-24:** Modal com tabela @tanstack/react-table
- **D-25:** Filtro por `Estado` (dropdown)
- **D-26:** Botão exportar CSV no modal
- **D-27:** Modal exibe contagem total e filtrada
- **D-28:** Nova tabela SQLite: `carteira_clientes`
- **D-29:** Carregar carteira existente ao acessar período
- **D-30:** INSERT se não existe, UPDATE se existe; período multi-mês → mês final
- **D-31:** Modal de edição: campo numérico, Cancelar/Guardar
- **D-32:** GET /api/carteira?mes=YYYY-MM, POST /api/carteira
- **D-33:** GET /api/data aceita ?from=&to=, retorna canais, daily, meses_disponiveis
- **D-34:** GET /api/cil?from=&to= — agregação CIL
- **D-35:** GET /api/cil/[cil]?from=&to=&estado= — detalhes CIL
- **D-36:** GET /api/carteira?mes=YYYY-MM
- **D-37:** POST /api/carteira
- **D-38:** POST /api/upload permanece igual
- **D-39:** Upload → link "Ver Dashboard" ou navegação automática
- **D-40:** Dados buscados via fetch client-side ao montar/altera período
- **D-41:** Dashboard é Client Component que faz fetch
- **D-42:** Comparar período atual com anterior equivalente
- **D-43:** Mês específico → comparar com mês anterior
- **D-44:** Range customizado → range anterior de mesma duração
- **D-45:** Fórmula: (total_atual - total_anterior) / total_anterior * 100
- **D-46:** Exibir "vs. Mês Anterior" ou "vs. Período Anterior"

### the agent's Discretion
- Cores exatas dos gráficos (usar variáveis CSS `--chart-*`)
- Layout responsivo exato dos grids (quantas colunas em breakpoint)
- Animação de transição ao mudar período
- Texto exato dos placeholders e labels
- Implementação do cálculo de dias úteis (biblioteca ou função manual)

### Deferred Ideas (OUT OF SCOPE)
- Nenhum

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| KPI-01 | Página `/dashboard/kpi` exibe cards com KPIs (soma, média, min, max) das colunas numéricas | Reimplementado do zero com métricas específicas (total, crescimento, média diária, dia máximo). Cards seguem padrão `kpi-strip.tsx` / `metric-cards.tsx`. |
| KPI-02 | Gráfico gerado automaticamente a partir dos dados numéricos | 4 gráficos Recharts com wrapper `ChartContainer` + `ChartTooltip` existente. Dados servidos via `GET /api/data` modificado + `/api/cil`. |
| KPI-03 | KPIs são atualizados após cada upload | Upload gera toast com link para dashboard; dashboard faz re-fetch client-side ao montar. |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Period filtering UI | Browser (Client) | — | Dropdown + date range picker, interatividade pura do usuário |
| KPI computation | API / Backend | — | Agregações SQL no servidor — evitar carregar milhares de registros no cliente |
| Channel normalization | API / Backend | — | Normalização no SQL query via CASE WHEN |
| Chart rendering | Browser (Client) | — | Recharts é client-side, usa wrapper shadcn/ui existente |
| CIL modal | Browser (Client) | API / Backend | Tabela + filtro + export no cliente; dados servidos via `/api/cil/[cil]` |
| Carteira Clientes | Database / Storage | API / Backend | Tabela SQLite `carteira_clientes`; CRUD via API routes |
| Sidebar restructuring | Config-only | — | Editar `src/navigation/sidebar/sidebar-items.ts` |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 3.8.1 | Charts (Line, Pie, Bar) | Já existe no projeto, usado com wrapper `ChartContainer` |
| better-sqlite3 | (existing) | SQLite queries agregadas | Já instalado, usado em `src/lib/db.ts` |
| @tanstack/react-table | 8.21.3 | Tabela no modal CIL | Já existe no projeto |
| shadcn/ui (card, dialog, select, table, badge) | (existing) | UI primitives | Já instalados e estilizados com tema |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.4.0 | Formatação de datas | Já no projeto, usar para labels de período |
| lucide-react | 1.17.0 | Ícones (BarChart3, Upload, etc.) | Já no projeto |
| sonner | 2.0.7 | Toast notification após upload | Já no projeto |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SQL aggregation | Carregar todos os registros no cliente | Para 93k+ registros, SQL é muito mais rápido e usa menos memória |
| date-fns business-days lib | Função manual excluindo sáb/dom | Sem dependência extra; 2 casos de borda (feriados opcionais) |
| D3 directly | Recharts | Recharts já está no projeto com wrapper consistente |

**Version verification:**
```bash
npm view recharts version
# 3.8.1 (verified 2026-06-06)
```

---

## Architecture Patterns

### Data Flow Overview

```
Usuário seleciona período
       │
       ▼
Client Component (DashboardPage)
  │  GET /api/data?from=2026-01-01&to=2026-01-31
  │  GET /api/cil?from=...&to=...
  │  GET /api/carteira?mes=2026-01
  │
  ▼
API Routes (Backend)
  │  SQL queries agregadas no SQLite
  │  CASE WHEN para normalização de canais
  │  GROUP BY para daily/CIL/channels
  │
  ▼
Response JSON → Client Component
  │  KpiCards (Card + Badge + format)
  │  LineChart (daily evolution)
  │  PieChart (channel distribution)
  │  BarChart (channel/CIL breakdown)
  │  CilModal (Dialog + Table + export)
  │  CarteiraModal (Dialog + form)
```

### File Structure (New & Modified)

```
src/
├── app/
│   ├── api/
│   │   ├── data/route.ts              ← MODIFICAR: aceitar ?from=&to=
│   │   ├── cil/
│   │   │   ├── route.ts               ← NOVO: GET /api/cil
│   │   │   └── [cil]/route.ts         ← NOVO: GET /api/cil/[cil]
│   │   └── carteira/
│   │       └── route.ts               ← NOVO: GET + POST /api/carteira
│   └── (main)/dashboard/
│       └── kpi/
│           ├── page.tsx               ← NOVO: Server Component
│           └── _components/
│               ├── kpi-dashboard-client.tsx  ← NOVO: Client wrapper
│               ├── period-filter.tsx         ← NOVO: month dropdown + date range
│               ├── kpi-cards.tsx             ← NOVO: KPI card grid
│               ├── daily-chart.tsx           ← NOVO: LineChart
│               ├── channel-chart.tsx         ← NOVO: PieChart + BarChart
│               ├── cil-chart.tsx             ← NOVO: BarChart clicável
│               ├── cil-modal.tsx             ← NOVO: Dialog + Table + export
│               ├── carteira-modal.tsx        ← NOVO: Dialog + form
│               └── tipology-section.tsx      ← NOVO: top 5 per channel
├── lib/
│   ├── db.ts                          ← MODIFICAR: adicionar migração carteira_clientes
│   └── services/
│       └── pedidos.ts                 ← RECOMENDADO: adicionar funções de query agregada
├── navigation/
│   └── sidebar/
│       └── sidebar-items.ts           ← MODIFICAR: novo grupo + mover Upload
```

### Pattern 1: API Route with Period Query Params
**What:** Next.js API route extracting `from` and `to` params, building SQL WHERE clause with date range filter
**When to use:** All KPI data endpoints

```typescript
// src/app/api/data/route.ts — GET handler modificado
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const db = getDb();
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'").get();
    if (!tableExists) {
      return NextResponse.json({ total: 0, canais: [], daily: [], meses_disponiveis: [] });
    }

    // Build date filter
    const conditions: string[] = [];
    const params: string[] = [];
    if (from && to) {
      conditions.push("dt_registo >= ? AND dt_registo <= ?");
      params.push(from, to + " 23:59:59");
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Total
    const total = db.prepare(`SELECT COUNT(*) as total FROM pedidos ${where}`).get(...params) as { total: number };

    // Canais (CASE WHEN normalization)
    const canais = db.prepare(`
      SELECT
        CASE
          WHEN receção IN ('Portal', 'Portal da ERSE', 'Portal Queixa') THEN 'Portal'
          WHEN receção IN ('Back-Office', 'Telefone Back-Office') THEN 'Back-Office'
          WHEN receção = 'Email' THEN 'Email'
          WHEN receÇÃO = 'Telefone Front' THEN 'Telefone Front'
          ELSE 'Outros'
        END as canal,
        COUNT(*) as count
      FROM pedidos
      ${where}
      GROUP BY canal
      ORDER BY count DESC
    `).all(...params);

    // Daily evolution (por Dt Contato)
    const daily = db.prepare(`
      SELECT SUBSTR(dt_contato, 1, 10) as date, COUNT(*) as count
      FROM pedidos
      ${where}
      GROUP BY date
      ORDER BY date
    `).all(...params);

    // Meses disponíveis
    const meses = db.prepare("SELECT DISTINCT mes_competencia FROM pedidos ORDER BY mes_competencia").all();

    return NextResponse.json({
      total: total.total,
      canais,
      daily,
      meses_disponiveis: meses,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
```

### Pattern 2: Client-Side Data Fetching with Period State
**What:** Client component managing period state, fetching data on mount and when period changes
**Example:** See `kpi-strip.tsx` for existing pattern. New: add `useEffect` + `fetch` + `useState`.

### Pattern 3: Chart with shadcn/ui Wrapper
**What:** Using `ChartContainer` + `ChartTooltip` + `ChartTooltipContent` from existing `chart.tsx`

```tsx
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig = {
  pedidos: {
    label: "Pedidos",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

<ChartContainer config={chartConfig} className="h-80 w-full">
  <LineChart data={dailyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
    <CartesianGrid vertical={false} />
    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
    <YAxis tickLine={false} axisLine={false} tickMargin={8} />
    <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }} />
    <Line dataKey="count" stroke="var(--color-pedidos)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
  </LineChart>
</ChartContainer>
```

### Anti-Patterns to Avoid
- **Carregar todos os registros no frontend para computar métricas** — 93k+ linhas, usar SQL GROUP BY
- **Recriar lógica de normalização de canais no frontend** — fazer no SQL com CASE WHEN
- **Usar API sem tipagem** — definir interfaces TypeScript para responses (ex: `KpiData`, `CilData`)

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Business days calculation | Função que itera dia a dia | `date-fns` differenceInDays + simple weekend filter | Já tem date-fns no projeto; calcular dias úteis = count days in range - count weekend days |
| Modal component | Dialog custom | `Dialog` do shadcn/ui (`src/components/ui/dialog.tsx`) | Já instalado, estilizado com tema |
| Table component | Table custom | `@tanstack/react-table` + shadcn/ui `Table` | Já instalado, suporta ordenação |
| Date picker | Date picker custom | `react-day-picker` (já instalado) | Já no projeto, usado com wrapper shadcn |
| Chart legends/tooltips | Custom tooltips | `ChartTooltipContent` do `chart.tsx` | Já configurado com tema CSS |
| Toast notifications | UI custom | `sonner` toast | Já no projeto |

**Key insight:** O projeto já tem todas as bibliotecas de UI necessárias. A implementação deve focar em lógica de negócio (SQL queries, normalização, cálculos) e orquestração dos componentes existentes, não em criar novos primitivos UI.

---

## Column Analysis (Confirmed from SQLite DB)

### Table: `pedidos` — Columns relevant to Phase 3

| DB Column | CSV Source | Type | Usage Phase 3 |
|-----------|-----------|------|---------------|
| `id_contacto` | ID_CONTACTO | TEXT | Dedup key |
| `cil` | CIL | TEXT | Agregação CIL (numérico como texto: "91619", "155409") |
| `dt_registo` | Dt Registo | TEXT | Fallback para daily evolution |
| `dt_contato` | Dt Contato | TEXT | **Primário** para daily evolution |
| `estado` | Estado | TEXT | Filtro no modal CIL. Valores: **Fechado**, **Pendente**, **Aberto** |
| `receção` | receção | TEXT | Canal de entrada. Valores: **Back-Office**, **Telefone Back-Office**, **Email**, **Portal**, **Portal da ERSE**, **Portal Queixa**, **Telefone Front**, **APP**, **Carta**, **Formulário Site Público** |
| `justificação` | Justificação | TEXT | Tipologia (top 5 por canal) |
| `mes_competencia` | derivado de Dt Registo | TEXT | "2026-01", "2026-02", "2026-05" — usado para dropdown de mês |
| `created_at` | — | DATETIME | Metadado |

### Channel Normalization Mapping

| RAW Value | Normalized To |
|-----------|---------------|
| Back-Office | **Back-Office** |
| Telefone Back-Office | **Back-Office** |
| Email | **Email** |
| Portal | **Portal** |
| Portal da ERSE | **Portal** |
| Portal Queixa | **Portal** |
| Formulário Site Público | **Portal** |
| Telefone Front | **Telefone Front** |
| APP | **Outros** |
| Carta | **Outros** |
| (qualquer outro) | **Outros** |

### Estado Values for CIL Modal Filter

| Estado | Ocorrência | Observação |
|--------|-----------|------------|
| **Fechado** | ~99% | Estado padrão de tickets resolvidos |
| **Pendente** | ~1% | Tickets em andamento |
| **Aberto** | ~1% (apenas Maio) | Tickets recém-criados |

### CIL Data
- `cil` é TEXT contendo números (ex: "91619", "155409", "165818")
- Usar `GROUP BY cil ORDER BY COUNT(*) DESC` para top N
- Barras clicáveis → `onClick` no componente Bar do Recharts

### Daily Evolution Date Choice
- **Primário:** `dt_contato` — coluna com data de contacto efetivo
- **Fallback:** `dt_registo` — data de registro no sistema
- **SQL:** `SUBSTR(dt_contato, 1, 10) as date` extrai `YYYY-MM-DD`
- Razão: dt_contato tem menos datas únicas (~460 vs ~800 do dt_registo) — mais estável

---

## Technical Approach

### API Layer

**1. GET /api/data (MODIFICADO)** — Aceita `?from=YYYY-MM-DD&to=YYYY-MM-DD`. Retorna:
- `total`: COUNT dos registros no período
- `canais`: Array `[{ canal, count }]` — normalizado com CASE WHEN
- `daily`: Array `[{ date, count }]` — GROUP BY dt_contato
- `meses_disponiveis`: Array de strings "YYYY-MM"
- `crescimento`: Percentual vs período anterior (calculado com segunda query)
- `workdays`: Número de dias úteis no período
- `avg_daily`: total / workdays
- `max_day`: `{ date, count }` — dia com maior volume

**2. GET /api/cil?from=...&to=...** — Retorna:
- `cil_aggregates`: `[{ cil, count }]` — top 20 CILs por volume, ordenado DESC

**3. GET /api/cil/[cil]?from=...&to=...&estado=...** — Retorna:
- `total`: total de registros do CIL no período
- `records`: registros individuais (para tabela no modal)
- Se `estado` fornecido, filtra por essa coluna

**4. GET /api/carteira?mes=YYYY-MM** — Retorna:
- `total_clientes`: number | null
- Se não existir registro, retorna `{ total_clientes: null }`

**5. POST /api/carteira** — Body `{ mes_competencia, total_clientes }`:
- UPSERT: INSERT OR REPLACE na tabela `carteira_clientes`

### Frontend Components

**PeriodFilter** (`"use client"`):
- Dropdown de mês (Select do shadcn): preenchido com `meses_disponiveis` da API
- Date range picker (react-day-picker): seleção livre
- Estado sincronizado: dropdown → range reflete o mês; range livre → dropdown "Personalizado"
- Padrão: último mês da lista
- Emite `onPeriodChange(from, to)` para o dashboard

**KpiCards** (`"use client"`):
- Grid responsivo: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4`
- Card: `CardHeader` + `CardTitle` (label) + `CardDescription` (valor numérico) + `CardContent` (badge crescimento)
- Formatação: `new Intl.NumberFormat("pt-PT").format(value)`
- Carteira: valor editável → clique abre `CarteiraModal`

**DailyChart** (`"use client"`):
- `LineChart` dentro de `ChartContainer`
- Eixo X: data, Eixo Y: count
- `ChartTooltipContent` com formatação pt-PT
- Altura: `h-72`

**ChannelCharts** (dois gráficos lado a lado):
- Donut: `PieChart` + `Pie` com `innerRadius={60}` + `outerRadius={80}`
- Bar: `BarChart layout="vertical"` + `XAxis type="number"` + `YAxis type="category" dataKey="canal"`
- Mesmo `chartConfig` compartilhado

**CilChart** (`"use client"`):
- `BarChart layout="vertical"` com barras clicáveis
- `onClick` no componente `Bar` ou `Cell` → abre modal

**CilModal** (`"use client"`):
- `Dialog` do shadcn com tamanho `max-w-4xl`
- Header: "CIL {cil} — Período" + total/filtrado
- Filtro: `Select` com opções "Todos", "Fechado", "Pendente", "Aberto"
- Tabela: `@tanstack/react-table` com colunas relevantes (id, estado, data, justificação, etc.)
- Export: gera CSV client-side (join das linhas filtradas, download via Blob/URL)

**CarteiraModal**:
- `Dialog` pequeno
- Input numérico + botões Cancelar/Guardar
- Salva via POST /api/carteira, atualiza estado local

**TipologySection**:
- Grid de cards: um por canal (Back-Office, Email, Portal, Telefone Front)
- Cada card: título do canal + lista ordenada das top 5 justificações
- Dados vêm de `GET /api/data` (enriquecido com tipologias por canal)

### Migration Strategy (db.ts)

Adicionar ao `runMigrations()` em `src/lib/db.ts`:

```typescript
database.exec(`
  CREATE TABLE IF NOT EXISTS carteira_clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mes_competencia TEXT NOT NULL UNIQUE,
    total_clientes INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

---

## Code Patterns

### Existing Card with Badge for Growth (from metric-cards.tsx)

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

<Card>
  <CardHeader>
    <CardTitle><div className="flex size-7 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
      <BarChart3 className="size-4" />
    </div></CardTitle>
    <CardDescription>Total de Pedidos</CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-1">
    <div className="flex flex-wrap items-center gap-2">
      <div className="font-medium text-3xl tabular-nums leading-none tracking-tight">
        {Intl.NumberFormat("pt-PT").format(total)}
      </div>
      <Badge variant={growth >= 0 ? "default" : "destructive"}>
        {growth >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
        {growth.toFixed(1)}%
      </Badge>
    </div>
    <p className="text-muted-foreground text-sm">vs. Mês Anterior</p>
  </CardContent>
</Card>
```

### PieChart Donut (Recharts 3.8.1)

```tsx
<PieChart>
  <Pie
    data={channelData}
    dataKey="count"
    nameKey="canal"
    cx="50%"
    cy="50%"
    innerRadius={60}
    outerRadius={80}
    strokeWidth={2}
  >
    {channelData.map((entry, index) => (
      <Cell key={entry.canal} fill={`var(--chart-${index + 1})`} />
    ))}
  </Pie>
  <ChartTooltip content={<ChartTooltipContent />} />
</PieChart>
```

### BarChart Horizontal (layout="vertical")

```tsx
<BarChart data={channelData} layout="vertical" margin={{ left: 80, right: 20 }}>
  <CartesianGrid horizontal={false} />
  <XAxis type="number" tickLine={false} axisLine={false} />
  <YAxis type="category" dataKey="canal" tickLine={false} axisLine={false} tickMargin={8} />
  <ChartTooltip content={<ChartTooltipContent />} />
  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
    {channelData.map((entry, index) => (
      <Cell key={entry.canal} fill={`var(--chart-${index + 1})`} />
    ))}
  </Bar>
</BarChart>
```

### Clicável Bar (CIL)

```tsx
<Bar dataKey="count" radius={[0, 4, 4, 0]} cursor="pointer" onClick={(data) => onCilClick(data.cil)}>
```

### Business Days Calculation

```typescript
function countWorkdays(fromStr: string, toStr: string): number {
  const from = new Date(fromStr);
  const to = new Date(toStr);
  let count = 0;
  const current = new Date(from);
  while (current <= to) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}
```

Para range de até 31 dias, iteração é perfeitamente aceitável. Se quiser performance para ranges grandes, pode-se usar fórmula matemática, mas não necessário aqui.

### Growth Calculation

```typescript
// No servidor (API route):
function getGrowthForPeriod(currentTotal: number, from: string, to: string, db: Database.Database): { growth: number | null; prev_label: string | null } {
  const duration = new Date(to).getTime() - new Date(from).getTime();
  const prevTo = new Date(new Date(from).getTime() - 1).toISOString().split("T")[0];
  const prevFrom = new Date(new Date(prevTo).getTime() - duration).toISOString().split("T")[0];

  const prev = db.prepare(`
    SELECT COUNT(*) as total FROM pedidos
    WHERE dt_registo >= ? AND dt_registo <= ?
  `).get(prevFrom, prevTo + " 23:59:59") as { total: number };

  if (prev.total === 0) return { growth: null, prev_label: null };

  return {
    growth: (currentTotal - prev.total) / prev.total,
    prev_label: `${prevFrom} — ${prevTo}`,
  };
}
```

---

## Common Pitfalls

### Pitfall 1: Column Name com Cedilha (`receção`)
**What goes wrong:** SQL queries usando `rececao` (sem cedilha) falham porque a coluna se chama `receção` (com cedilha e acento).
**Why it happens:** O cabeçalho original do CSV é `receção` e o `normalizeHeader` apenas faz `toLowerCase().trim().replace(/\s+/g, "_")` — não remove acentos.
**How to avoid:** Nas queries SQL, usar sempre `receção` (entre aspas duplas para segurança: `"receção"`). **Não** confundir com o nome da coluna no CSV raw.
**Warning signs:** Queries retornam 0 resultados para canais ou erro "no such column".

### Pitfall 2: Tipologia vem de `justificação`, não `tipo_justificação`
**What goes wrong:** Usar a coluna errada para tipologias por canal.
**Why it happens:** Existem duas colunas: `justificação` (ex: "Resolvido a Favor do Cliente") e `tipo_justificação` (ex: "Resolução Procedente"). O antigo projeto usava `rec.tip` para tipologia, que mapeia à coluna `justificação`.
**How to avoid:** Para "Top 5 Tipologias por Canal", usar `justificação` (não `tipo_justificação`). Verificar que `justificação` contém valores como "Resolução Procedente", "Resolvido a Favor do Cliente", "Resolução Improcedente", "Resolvido a Favor da Empresa", "Cancelado".

### Pitfall 3: CSV tem `Observações` com conteúdo multiline e commas
**What goes wrong:** Linhas com quebras de linha ou commas dentro de campos `Observações` podem atrapalhar parsing simples.
**Why it happens:** O CSV usa aspas para campos com commas/novas linhas. Papaparse já lida com isso, mas queries SQL que tentam fazer `LIKE` na coluna `observações` podem ter performance ruim.
**How to avoid:** Confiar no papaparse (já implementado). Para filtros, usar `WHERE observações LIKE ?` com cautela (full table scan).

### Pitfall 4: `mes_competencia` só tem 3 meses únicos (Jan, Fev, Mai)
**What goes wrong:** Março e Abril não aparecem no dropdown de meses porque foram dedupados pela chave `id_contacto + mes_competencia`.
**Why it happens:** A dedup usa `id_contacto` — se os mesmos contactos aparecem em múltiplos meses, apenas a primeira inserção persiste.
**How to avoid:** Verificar se os CSVs de Março e Abril foram importados. Se não, importá-los. Se sim, pode ser que `id_contacto` se repita entre meses. Para esta fase, usar os meses que existem no banco. Se precisar de todos os meses, re-importar os CSVs ou ajustar dedup.

### Pitfall 5: dt_contato contém datas com timestamps diferentes
**What goes wrong:** Agrupar por `dt_contato` inclui a hora, gerando muitas "datas" únicas.
**Why it happens:** `dt_contato` tem formato "2026-01-29 12:00:00".
**How to avoid:** Usar `SUBSTR(dt_contato, 1, 10)` no SQL para extrair apenas a parte da data.

---

## State of the Art

| Old Approach (CGI antigo) | Current Approach | When Changed | Impact |
|--------------------------|------------------|--------------|--------|
| Canvas (chart.js) para gráficos | Recharts com wrapper shadcn/ui ChartContainer | Fase 3 | Gráficos responsivos, temáticos, interativos |
| Índice (IndexedDB) + snapshots mensais | SQLite on-the-fly queries | Fase 1 | Dados sempre atualizados, sem snapshots stale |
| JavaScript vanilla (IIFE pattern) | React 19 + Next.js 16 App Router + Server/Client Components | Projeto base | Componentização, SSR, tipo seguro |
| css custom (classe .bar-row, etc.) | shadcn/ui + Tailwind CSS 4 | Projeto base | Design system consistente |

---

## Implementation Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Março/Abril não importados | MÉDIO | ALTO (dados incompletos no dashboard) | Verificar upload_history; reimportar se necessário |
| Performance da query CIL com 93k registros sem índice em `cil` | BAIXO | MÉDIO | Adicionar índice: `CREATE INDEX IF NOT EXISTS idx_pedidos_cil ON pedidos(cil)` |
| Coluna `receção` com cedilha causa erro SQL | BAIXO | ALTO | Testar query CASE WHEN antes de implementar; usar aspas duplas |
| react-day-picker dependência de versão | BAIXO | MÉDIO | verificar versão existente (`npm ls react-day-picker`) |

---

## Dependencies

Nenhuma nova dependência externa necessária. Todas as bibliotecas já estão no projeto:
- `recharts` (gráficos)
- `@tanstack/react-table` (tabela modal CIL)
- `date-fns` (formatação)
- `lucide-react` (ícones)
- `sonner` (toast)
- `better-sqlite3` (SQLite)

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | (existente) | — |
| SQLite (better-sqlite3) | Database | ✓ | (existente) | — |
| Next.js 16 | Framework | ✓ | 16.2.7 | — |

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.8 (existing in devDependencies) |
| Config file | `vitest.config.*` — check if exists |
| Quick run command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| KPI-01 | Cards KPI exibem soma, média, min, max | integration | `npx vitest run src/app/api/data/route.test.ts` | ❌ Wave 0 |
| KPI-02 | Gráficos Recharts renderizam com dados | e2e/manual | — | ❌ manual-only |
| KPI-03 | KPIs refletem dados após upload | integration | `npx vitest run src/app/api/upload/route.test.ts` | ❌ Wave 0 |

### Wave 0 Gaps
- [ ] `src/app/api/data/route.test.ts` — testa GET /api/data com e sem parâmetros de período
- [ ] `src/app/api/cil/route.test.ts` — testa agregação CIL
- [ ] `src/app/api/carteira/route.test.ts` — testa CRUD carteira clientes

---

## Security Domain

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Zod validation nos parâmetros de query (date format, mes format) |
| V6 Cryptography | no | Dados locais, sem dados sensíveis em trânsito |

### Known Threat Patterns
No threat patterns apply. SQLite local, sem autenticação, sem dados sensíveis.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `dt_contato` é preferível a `dt_registo` para evolução diária | Column Analysis | Baixo — ambos funcionam, dt_contato é semanticamente correto |
| A2 | Março/Abril não foram importados devido a dedup | Common Pitfalls | Médio — pode precisar reimportar |
| A3 | `justificação` contém tipologia (não `tipo_justificação`) | Common Pitfalls | Baixo — confirmado pelo antigo projeto |
| A4 | Cálculo de dias úteis manual é suficiente | Architecture | Baixo — 31 dias no máximo, iteração é trivial |

---

## Open Questions

1. **Março e Abril precisam ser reimportados?**
   - O banco só tem Jan, Fev, Mai (93.809 registros). Os CSVs de Março (163k+) e Abril (168k+) existem mas não foram importados (provavelmente devido à dedup por `id_contacto`). 
   - **Recomendação:** Importar Março e Abril durante o desenvolvimento desta fase para ter dados completos. Usar `/api/upload` via curl ou criar script one-shot.

2. **Telefone Back-Office deve ser Back-Office ou categoria separada?**
   - O CONTEXT.md lista apenas "Back-Office, Email, Portal, Telefone Front". Telefone Back-Office aparece nos dados.
   - **Recomendação:** Mapear Telefone Back-Office para Back-Office (padrão do antigo projeto).

---

## Sources

### Primary (HIGH confidence)
- [SQLite DB query] — colunas, valores únicos, contagem — verificado executando queries no `cgi.db`
- [CSV de teste] — `data/csv/2026-01.csv` — estrutura real dos dados
- [Old reference project] — `/mnt/c/Documents and Settings/.../CGI/src/domain/` — Channel, Workday, CIL, Metrics services
- [Existing codebase] — `src/components/ui/chart.tsx`, `kpi-strip.tsx`, `metric-cards.tsx` — padrões de código confirmados
- [Context7 Recharts docs] — `/recharts/recharts` — Pattern de PieChart, BarChart, LineChart

### Secondary (MEDIUM confidence)
- [CONTEXT.md] — Todas as decisões D-01 a D-46 — fonte autoritativa para locked decisions
- [REQUIREMENTS.md] — KPI-01, KPI-02, KPI-03

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — todas as libs já existem e foram verificadas
- Architecture: HIGH — baseado em dados reais do banco e padrões do código existente
- Pitfalls: HIGH — coluna com cedilha verificada, tipologia verificada, dedup verificado
- Column analysis: HIGH — queries SQL reais contra o banco, CSV files verificados

**Research date:** 2026-06-06
**Valid until:** 2026-07-06 (estável — SQLite schema e libs não mudam)
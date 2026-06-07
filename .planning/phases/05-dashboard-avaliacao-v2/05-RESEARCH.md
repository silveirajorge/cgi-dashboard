# Phase 5: Dashboard Avaliação v2 — Research

**Researched:** 2026-06-07
**Domain:** SQLite aggregation queries, Recharts charts (donut, line gradient, stacked bar), star rating display, Score Final calculation
**Confidence:** HIGH

## Summary

Redesign completo do dashboard de avaliação com layout de 2 colunas (KPIs equipa à esquerda, detalhamento individual à direita). Novos cálculos de Score Final composto, comparação semana a semana com carry forward, gráfico donut de distribuição de desempenho, gráfico de linha com gradiente para evolução de produtividade, tabela da equipa com estrelas e status, e painel individual com evolução do score, histórico de produtividade e comentários.

**Descobertas principais:**
- SQLite 3.53.1 suporta `strftime('%Y-%W', data)` para agrupamento semanal (segunda a domingo) e `LAG()` para comparativo → **mas carry forward de semanas vazias precisa ser feito em client-side**, pois LAG só opera sobre linhas existentes
- Score Final deve ser calculado no API route (JS), não no SQL — combina AVG agregado com SUM de penalidades por funcionário
- PieChart donut com label central requer `<text>` SVG customizado dentro do `<PieChart>` (não é nativo do Recharts)
- Star rating: `nota_auditoria ÷ 20` com arredondamento ao 0.5 mais próximo

**Primary recommendation:** Criar API route dedicada `/api/avaliacoes/dashboard` para todas as agregações do dashboard v2, mantendo a existente `/api/avaliacoes/stats` intacta. Calcular Score Final em JS no API route. Carry forward em client-side após fetch.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Score Final
- **D5-01:** **Média composta** de 3 métricas (cada 0-100):
  ```
  score_base = (perc_produtividade(capped 100) + nota_auditoria + (media_categorias × 10)) / 3
  penalidades = atrasos × 2 + faltas × 2 + erros_críticos × 5
  bonus = uso_ferramenta ? 5 : 0
  score_final = max(0, score_base - penalidades + bonus)
  ```
- **D5-02:** Categorias de desempenho:
  - Excelente: ≥ 95
  - Bom: 90-94
  - Atenção: 85-89
  - Crítico: < 85

#### Comparativo Semanal
- **D5-03:** Agrupar avaliações por ISO week (data_avaliacao)
- **D5-04:** Para cada KPI, calcular valor da última semana com dados e semana anterior
- **D5-05:** Quando não houver avaliações numa semana, repetir o último valor conhecido (carry forward)
- **D5-06:** Badges: ▲ verde para melhoria, ▼ vermelho para piora, cinza para estável

#### Coluna Esquerda — KPIs da Equipa
- **D5-07:** 6 cards KPI com indicador de tendência (vs semana anterior):
  1. Produtividade Média — média de perc_produtividade
  2. Uso Speedops — % de avaliações com uso_ferramenta = true
  3. Erros Críticos — contagem de erro_critico = true
  4. Atrasos/Faltas — soma de atraso + falta
  5. Média Auditor — média de nota_auditoria WHERE tipo_auditoria = 'auditor'
  6. Média Supervisor — média de nota_auditoria WHERE tipo_auditoria = 'supervisor'
- **D5-08:** Donut "Distribuição de Desempenho" — contagem de funcionários por categoria de score (com centro "total")
- **D5-09:** Barra "Uso da Ferramenta" — % utilizou vs não utilizou com legenda
- **D5-10:** Gráfico de linha "Evolução Média de Produtividade" — Recharts LineChart com área gradiente (igual daily-chart dos KPIs)
- **D5-11:** Tabela da Equipa com colunas: Nome, Atrasos/Faltas, Speedops, Erro Crítico, Produtividade (%), Avaliação Auditor (valor + estrelas), Avaliação Supervisor (valor + estrelas), Score Final, Status (badge colorido)

#### Coluna Direita — Detalhamento Individual
- **D5-12:** Dropdown para selecionar funcionário
- **D5-13:** Card Resumo: Score Final (grande, com medalha) + status + métricas da semana
- **D5-14:** Gráfico "Evolução do Score" — LineChart com área gradiente (mesmo padrão)
- **D5-15:** Gráfico "Histórico de Produtividade" — BarChart ou LineChart
- **D5-16:** Card de Comentários — lista dos comentários das avaliações

#### Cores Consistentes
- **D5-17:** Paleta fixa para todo o dashboard:
  - Verde (#22c55e): Excelente, positivo, Sim, utilizou
  - Vermelho (#ef4444): Crítico, negativo, Não, não utilizou, erros
  - Azul (#3b82f6): Bom, info
  - Amarelo (#eab308): Atenção, estrelas
  - Cinza (#71717a): estável, neutro

#### API
- **D5-18:** `GET /api/avaliacoes/dashboard?from=&to=` — todos os KPIs agregados + comparativo semanal + tabela da equipa
- **D5-19:** `GET /api/avaliacoes/funcionario/:id/historico?from=&to=` — score evolution + produtividade + comentários
- **D5-20:** `GET /api/avaliacoes/semanas?from=&to=` — semanas disponíveis

#### BD
- **D5-21:** Sem novas tabelas — apenas queries de agregação sobre `avaliacoes` existente

#### Score Final — Estrelas
- **D5-22:** Estrelas de 0-5 baseadas na nota_auditoria: cada estrela = 20 pontos (ex: 4.8 = 4 estrelas cheias + 0.8 de fração)

### the Agent's Discretion
- (Nenhum item de discrição explícito)

### Deferred Ideas (OUT OF SCOPE)
- (Nenhum)

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| D5-01 | Score Final composto (média 3 métricas - penalidades + bonus) | Calcular em JS no API route — SQL faz agregados, JS combina |
| D5-02 | Categorias de desempenho (Excelente ≥95, Bom 90-94, Atenção 85-89, Crítico <85) | Constantes no componente de badge |
| D5-03 | Agrupar por ISO week | `strftime('%Y-%W', data_avaliacao)` — VERIFIED: SQLite 3.53.1 |
| D5-04 | Última semana vs anterior por KPI | `LAG(AVG(kpi)) OVER (ORDER BY week)` — VERIFIED: suportado |
| D5-05 | Carry forward de semanas vazias | Client-side: preencher gaps após fetch. LAG não gera linhas para semanas sem dados |
| D5-06 | Badges ▲/▼/→ | Componente de badge com ícone lucide-react (TrendingUp, TrendingDown, Minus) |
| D5-07 | 6 KPI cards com tendência | Dados do comparativo semanal + cards KPI (padrão existente) |
| D5-08 | Donut Distribuição de Desempenho | Recharts PieChart com `innerRadius="55%" outerRadius="80%"` + `<text>` SVG central |
| D5-09 | Barra Uso da Ferramenta | BarChart horizontal com 2 `<Bar stackId="1">` ou div CSS personalizada |
| D5-10 | Linha gradiente produtividade | LineChart + `<defs><linearGradient>` + `<Area fill="url(#...)">` + `<Line>` — padrão de daily-chart.tsx |
| D5-11 | Tabela da Equipa | shadcn/ui Table + StarRating component + Badge status |
| D5-12 | Dropdown funcionário | shadcn/ui Select — padrão existente |
| D5-13 | Card Resumo Individual | Card com score grande, badge status, grid 2-col métricas |
| D5-14 | Evolução do Score (linha gradiente) | Mesmo padrão D5-10 |
| D5-15 | Histórico de Produtividade | BarChart simples (dados do historico route) |
| D5-16 | Card Comentários | Lista de comentários com tipo_auditoria e data |
| D5-17 | Paleta fixa | CSS variables: `#22c55e`, `#ef4444`, `#3b82f6`, `#eab308`, `#71717a` |
| D5-18 | GET /api/avaliacoes/dashboard | Nova API route com 4+ queries SQL agregadas |
| D5-19 | GET /api/avaliacoes/funcionario/:id/historico | Nova API route para histórico individual |
| D5-20 | GET /api/avaliacoes/semanas | Query semanas distintas com dados |
| D5-21 | Sem novas tabelas | Todos os dados vêm de `avaliacoes` existente |
| D5-22 | Estrelas 0-5 (cada = 20pt) | `stars = nota_auditoria / 20` — component StarRating |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Score Final calculation | API / Backend | — | Combina agregados SQL + lógica JS no API route |
| Comparativo semanal | API / Backend | Browser / Client | SQL agrupa por week + LAG; client faz carry forward |
| 6 KPI cards + tendência | Browser / Client | API / Backend | Renderização React com dados do dashboard API |
| Donut chart (PieChart) | Browser / Client | — | Recharts client-side, sem SSR |
| Linha com gradiente | Browser / Client | — | Recharts client-side |
| Tabela da Equipa | Browser / Client | — | shadcn/ui Table com dados do dashboard API |
| Dropdown funcionário | Browser / Client | — | shadcn/ui Select |
| Card Resumo Individual | Browser / Client | API / Backend | Dados do histórico route |
| Histórico individual | API / Backend | Browser / Client | Dados por funcionário + renderização |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | ^12.10.0 | SQLite queries agrupadas | Stack existente, VERIFIED: npm registry |
| recharts | ^3.8.1 | PieChart donut, LineChart gradiente, BarChart | Stack existente, VERIFIED: npm registry |
| shadcn/ui (Table) | v4 (radix-nova) | Tabela da Equipa | Já existente em `src/components/ui/table.tsx` |
| shadcn/ui (Badge) | v4 (radix-nova) | Status: Excelente/Bom/Atenção/Crítico | Já existente |
| shadcn/ui (Dialog) | v4 (radix-nova) | Modal de detalhes (se usado) | Já existente |
| lucide-react | ^1.17.0 | ícones: TrendingUp, TrendingDown, Minus, Star, Medal | Stack existente |
| date-fns | ^4.4.0 | Formatação de datas | Stack existente |

### Installation
```bash
# Nenhuma instalação necessária — tudo já disponível na stack
```

**Version verification:**
- recharts v3.8.1 — VERIFIED: npm registry
- better-sqlite3 v12.10.0 (SQLite 3.53.1 interno) — VERIFIED: `SELECT sqlite_version()` retorna `3.53.1`
- lucide-react ^1.17.0 — existente no projeto
- date-fns ^4.4.0 — existente no projeto

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Client-side carry forward | SQL recursive CTE | CTE é mais eficiente mas complexo e difícil de manter no MVP |
| JS no API route para Score Final | SQL VIEW | VIEW não teria acesso fácil a `Math.max` e condicionais |
| divs CSS para barra uso ferramenta | Recharts BarChart | BarChart é mais consistente mas divs são mais simples para 2 segmentos |

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (React Client)
├── dashboard-avaliacao-v2/page.tsx (Server Component — shell)
│
└── [AvaliacaoDashboardV2Client] (Client Component)
    ├── Filtros (Select mês, date range, funcionário)
    ├── ───── LEFT COLUMN (65%) ─────
    │   ├── [KpiCardsV2] ← 6 cards + indicador tendência
    │   │     └── Badge ▲/▼/→ (lucide-react)
    │   ├── [DistribuicaoDonut] ← PieChart innerRadius
    │   │     └── SVG text central "Total"
    │   ├── [FerramentaBar] ← BarChart horizontal 2 segmentos
    │   ├── [EvolucaoProdChart] ← LineChart + gradient Area
    │   └── [EquipaTable] ← shadcn Table + StarRating + Badge
    │
    └── ───── RIGHT COLUMN (35%) ─────
        ├── [FuncionarioDropdown] ← Select
        ├── [ResumoCard] ← Score grande + grid métricas
        ├── [ScoreEvolChart] ← LineChart + gradient Area
        ├── [ProdHistChart] ← BarChart
        └── [ComentariosList] ← lista estilizada

API Routes (Next.js)
├── GET /api/avaliacoes/dashboard        ← 4+ queries agregadas, Score Final em JS
├── GET /api/avaliacoes/funcionario/:id/historico ← score + prod + comentários
└── GET /api/avaliacoes/semanas           ← semanas distintas

↓

SQLite (better-sqlite3)
└── avaliacoes table
    ├── WEEK GROUP BY: strftime('%Y-%W', data_avaliacao)
    ├── TEAM AGGREGATION: AVG, SUM, COUNT por período
    ├── PER-EMPLOYEE: GROUP BY funcionario_id + agregados
    └── INDIVIDUAL: SELECT por funcionario_id + período
```

### Component Responsibilities

| Component | Input Data | Output / Effect |
|-----------|-----------|-----------------|
| `AvaliacaoDashboardV2Client` | Dashboard API response | Estado global, coordena fetch, gerencia dropdowns |
| `KpiCardsV2` | 6 KPIs + 2 semanas de comparativo | Renderiza 6 cards com indicador de tendência |
| `DistribuicaoDonut` | Contagem por categoria de score | PieChart donut com label central |
| `FerramentaBar` | % utilizou / não utilizou | Barra horizontal 2 cores |
| `EvolucaoProdChart` | Produtividade semanal (array) | LineChart com gradient Area |
| `EquipaTable` | Array de funcionários com scores | Table com StarRating + Badge |
| `FuncionarioDropdown` | Lista de funcionários | Select → atualiza right column |
| `ResumoCard` | Score final + métricas do funcionário | Card com visual grande |
| `ScoreEvolChart` | Score semanal do funcionário | LineChart com gradient |
| `ProdHistChart` | Produtividade histórica | BarChart simples |
| `ComentariosList` | Array de comentários | Lista com tipo + data |

### Recommended Project Structure
```
src/app/(main)/dashboard/avaliacao-dashboard/
├── page.tsx                            # Server Component (modificar para v2)
└── _components/
    ├── avaliacao-dashboard-v2-client.tsx # Novo: Client component principal v2
    ├── kpi-cards-v2.tsx                 # Novo: 6 cards com tendência
    ├── distribuicao-donut.tsx           # Novo: PieChart donut
    ├── ferramenta-bar.tsx               # Novo: Barra uso ferramenta
    ├── evolucao-prod-chart.tsx          # Novo: Linha gradiente produtividade
    ├── equipa-table.tsx                 # Novo: Tabela + StarRating + Badge
    ├── star-rating.tsx                  # Novo: Componente estrelas
    ├── score-badge.tsx                  # Novo: Badge por categoria
    ├── resumo-card.tsx                  # Novo: Card individual
    ├── score-evol-chart.tsx             # Novo: Linha score individual
    ├── prod-hist-chart.tsx              # Novo: Barra prod individual
    ├── comentarios-list.tsx             # Novo: Lista comentários
    ├── funcionario-select.tsx           # Novo: Dropdown funcionário

    # Manter componentes existentes (não modificar):
    ├── avaliacao-dashboard-client.tsx   # (não modificar — v1 coexistirá)
    ├── avaliacao-filters.tsx            # (reutilizar)
    ├── comparative-chart.tsx            # (não modificar)
    ├── historico-modal.tsx              # (não modificar)
    └── kpi-cards.tsx                    # (não modificar)

src/app/api/avaliacoes/
├── dashboard/route.ts                  # NOVA: GET agregados v2
├── funcionario/[id]/historico/route.ts # NOVA: GET histórico individual
├── semanas/route.ts                    # NOVA: GET semanas disponíveis
# Manter existentes:
├── route.ts                            # (não modificar)
├── stats/route.ts                      # (não modificar)
└── meses/route.ts                      # (não modificar)
```

### Pattern 1: ISO Week Aggregation + LAG Comparison

**What:** Agrupar avaliações por semana ISO usando `strftime('%Y-%W')` e calcular week-over-week com `LAG()`. A API retorna weeks com dados; o client faz carry forward para semanas vazias.

**When to use:** Comparativo semanal dos 6 KPIs (D5-03 a D5-05) e também para o Score Evolution individual.

**SQL Example (dashboard API route):**
```typescript
// src/app/api/avaliacoes/dashboard/route.ts
const weeklyData = db.prepare(`
  SELECT
    strftime('%Y-%W', a.data_avaliacao) AS week,
    AVG(a.perc_produtividade) AS produtividade,
    AVG(CASE WHEN a.uso_ferramenta = 1 THEN 100.0 ELSE 0 END) AS uso_speedops,
    SUM(a.erro_critico) AS erros_criticos,
    SUM(a.atraso + a.falta) AS atrasos_faltas,
    AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS media_auditor,
    AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS media_supervisor,
    LAG(AVG(a.perc_produtividade)) OVER (ORDER BY strftime('%Y-%W', a.data_avaliacao)) AS prod_semana_anterior
  FROM avaliacoes a
  JOIN funcionarios f ON f.id = a.funcionario_id
  WHERE f.ativo = 1 AND a.data_avaliacao >= ? AND a.data_avaliacao <= ?
  GROUP BY strftime('%Y-%W', a.data_avaliacao)
  ORDER BY week
`).all(from, to);
```
[VERIFIED: SQLite 3.53.1 suporta LAG + AVG aninhado — testado via better-sqlite3]

**Client-side carry forward (TypeScript):**
```typescript
function fillCarryForward(
  weeks: string[],
  data: Array<{ week: string; [kpi: string]: number | string | null }>,
  kpis: string[],
): Array<{ week: string; [kpi: string]: number | string | null }> {
  const dataMap = new Map(data.map((d) => [d.week, d]));
  const lastKnown: Record<string, number | null> = {};

  return weeks.map((week) => {
    if (dataMap.has(week)) {
      const entry = dataMap.get(week)!;
      for (const kpi of kpis) {
        if (entry[kpi] !== null) lastKnown[kpi] = entry[kpi] as number;
      }
      return entry;
    }
    // Carry forward: repetir último valor conhecido
    const carried: Record<string, number | string | null> = { week };
    for (const kpi of kpis) {
      carried[kpi] = lastKnown[kpi] ?? null;
    }
    return carried;
  });
}
```
[ASSUMED: Client-side carry forward é mais simples que SQL recursive CTE para MVP]

### Pattern 2: Score Final Calculation (API Route — JS)

**What:** Calcular Score Final por funcionário combinando agregados SQL com lógica de negócio em JS.

**When to use:** Tabela da Equipa (D5-11) e Card Resumo Individual (D5-13).

**Example:**
```typescript
// Dentro do GET /api/avaliacoes/dashboard
const teamRaw = db.prepare(`
  SELECT
    f.id, f.nome,
    AVG(CASE WHEN a.perc_produtividade IS NOT NULL THEN MIN(a.perc_produtividade, 100) ELSE NULL END) AS avg_prod,
    AVG(a.nota_auditoria) AS avg_nota,
    AVG((a.pontualidade + a.qualidade + a.produtividade + a.trabalho_equipa + a.iniciativa + a.comunicacao) / 6.0) AS avg_categorias,
    SUM(a.atraso) AS total_atrasos,
    SUM(a.falta) AS total_faltas,
    SUM(a.erro_critico) AS total_erros,
    SUM(CASE WHEN a.uso_ferramenta = 1 THEN 1 ELSE 0 END) AS count_uso_ferramenta,
    AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS media_auditor,
    AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS media_supervisor
  FROM avaliacoes a
  JOIN funcionarios f ON f.id = a.funcionario_id
  WHERE f.ativo = 1 AND a.data_avaliacao >= ? AND a.data_avaliacao <= ?
  GROUP BY f.id, f.nome
  ORDER BY f.nome
`).all(from, to);

const team = teamRaw.map((row: TeamRaw) => {
  const prod = row.avg_prod !== null ? Math.min(row.avg_prod, 100) : 0;
  const nota = row.avg_nota ?? 0;
  const cats = (row.avg_categorias ?? 0) * 10; // normaliza 1-10 para 10-100
  const scoreBase = (prod + nota + cats) / 3;
  const penalidades = row.total_atrasos * 2 + row.total_faltas * 2 + row.total_erros * 5;
  const bonus = row.count_uso_ferramenta > 0 ? 5 : 0;
  const scoreFinal = Math.max(0, scoreBase - penalidades + bonus);

  return {
    id: row.id,
    nome: row.nome,
    avg_produtividade: row.avg_prod,
    media_auditor: row.media_auditor,
    media_supervisor: row.media_supervisor,
    total_atrasos: row.total_atrasos,
    total_faltas: row.total_faltas,
    total_erros: row.total_erros,
    score_final: Math.round(scoreFinal),
    status: scoreFinal >= 95 ? "excelente" : scoreFinal >= 90 ? "bom" : scoreFinal >= 85 ? "atencao" : "critico",
  };
});
```
[ASSUMED: SQL faz agg per-employee, JS combina lógica de negócio — padrão recomendado para cálculos com condicionais]

### Pattern 3: LineChart with Gradient Area (Recharts)

**What:** Gráfico de linha com área preenchida por gradiente. Padrão extraído do `daily-chart.tsx` — ver linhas 53-84.

**When to use:** Evolução Média de Produtividade (D5-10) e Evolução do Score Individual (D5-14).

**Example:**
```tsx
"use client";
import { Area, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

const chartConfig = {
  valor: { label: "Produtividade", color: "var(--chart-1)" },
} satisfies ChartConfig;

// Uso: dentro de ChartContainer
<LineChart data={weeklyData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
  <defs>
    <linearGradient id="fillProd" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="var(--color-valor)" stopOpacity={0.36} />
      <stop offset="95%" stopColor="var(--color-valor)" stopOpacity={0.04} />
    </linearGradient>
  </defs>
  <CartesianGrid vertical={false} strokeOpacity={0.5} />
  <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
  <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }} />
  <Area dataKey="valor" type="natural" fill="url(#fillProd)" stroke="var(--color-valor)" strokeWidth={1.25} dot={false} />
  <Line dataKey="valor" type="natural" stroke="var(--color-valor)" strokeWidth={1.5} dot={false} />
</LineChart>
```
[VERIFIED: Codebase at `daily-chart.tsx:53-84` — padrão estabelecido no projeto]

### Pattern 4: Donut PieChart with Center Label (Recharts)

**What:** PieChart com `innerRadius > 0` para efeito donut, com label central feito via `<text>` SVG coordenado com os `cx`/`cy` do PieChart.

**When to use:** Distribuição de Desempenho (D5-08).

**Example:**
```tsx
"use client";
import { Pie, PieChart } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

const COLORS_CATEGORIA = {
  excelente: "#22c55e",
  bom: "#3b82f6",
  atencao: "#eab308",
  critico: "#ef4444",
};

interface DistribuicaoDonutProps {
  data: Array<{ name: string; value: number; fill: string }>;
  total: number;
}

export function DistribuicaoDonut({ data, total }: DistribuicaoDonutProps) {
  return (
    <ChartContainer config={{}} className="h-60 w-full">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        />
        {/* Center label */}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground">
          <tspan x="50%" dy="-0.3em" className="font-bold text-2xl">{total}</tspan>
          <tspan x="50%" dy="1.2em" className="fill-muted-foreground text-xs">Total</tspan>
        </text>
      </PieChart>
    </ChartContainer>
  );
}
```
[VERIFIED: Context7 recharts docs — `innerRadius` + `outerRadius` cria donut. Center label é SVG `<text>` posicionado com `cx`/`cy`.]

### Pattern 5: Star Rating Display

**What:** Converter `nota_auditoria` (0-100) em estrelas 0-5 com suporte a meias-estrelas.

**When to use:** Tabela da Equipa (D5-11), Card Resumo (D5-13).

**Example:**
```tsx
"use client";
import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  nota: number; // 0-100
  size?: number;
}

export function StarRating({ nota, size = 14 }: StarRatingProps) {
  const starValue = nota / 20; // 0-5
  const full = Math.floor(starValue);
  const fraction = starValue - full;
  const hasHalf = fraction >= 0.25 && fraction < 0.75;
  const adjustedFull = fraction >= 0.75 ? full + 1 : full;

  return (
    <span className="inline-flex gap-0.5" style={{ color: "#eab308" }}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < adjustedFull) {
          return <Star key={i} size={size} fill="#eab308" />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} size={size} fill="#eab308" />;
        }
        return <Star key={i} size={size} fill="transparent" stroke="#eab308" />;
      })}
    </span>
  );
}
```
[VERIFIED: D5-22 — `nota_auditoria / 20 = estrelas`. ASKED: Cada estrela = 20 pontos, ex: 4.8 = 4 cheias + 0.8 fração]

### Pattern 6: Horizontal Bar — Uso da Ferramenta

**What:** Barra horizontal com 2 segmentos (utilizou / não utilizou). Duas abordagens possíveis.

**Approach A — CSS (mais simples):** Usar divs com `background` gradiente.
**Approach B — Recharts (consistente):** BarChart horizontal com `layout="vertical"` e 2 `<Bar stackId="1">`.

**When to use:** D5-09 — gráfico único de 2 segmentos.

**Example (Approach A — CSS puro, como no mockup):**
```tsx
export function FerramentaBar({ utilizouPct, naoUtilizouPct, utilizouCount, naoUtilizouCount }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-8 rounded-lg bg-muted overflow-hidden flex">
        <div
          className="flex items-center px-2 text-xs font-medium text-white"
          style={{ width: `${utilizouPct}%`, background: "#3b82f6" }}
        >
          {utilizouPct > 15 && `${utilizouPct.toFixed(0)}%`}
        </div>
        <div
          className="flex items-center justify-center text-xs font-medium text-white"
          style={{ width: `${naoUtilizouPct}%`, background: "#ef4444" }}
        >
          {naoUtilizouPct > 15 && `${naoUtilizouPct.toFixed(0)}%`}
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm" style={{ background: "#3b82f6" }} />
          Utilizou: <strong>{utilizouPct.toFixed(0)}%</strong> ({utilizouCount})
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm" style={{ background: "#ef4444" }} />
          Não utilizou: <strong>{naoUtilizouPct.toFixed(0)}%</strong> ({naoUtilizouCount})
        </span>
      </div>
    </div>
  );
}
```
[VERIFIED: Design mockup HTML — linhas 232-249. Abordagem CSS é a mesma do mockup.]

### Anti-Patterns to Avoid

- **Calcular Score Final no SQL:** A lógica tem `Math.min`, `Math.max`, condicionais e arredondamentos que são mais complexos e menos legíveis em SQL. Fazer em JS no API route.
- **Usar LAG para carry forward:** LAG só preenche quando há linha anterior com dados. Semanas sem avaliações não geram linhas. Carry forward precisa ser feito em client-side.
- **Copiar todo o dashboard v1:** O layout de 2 colunas é substancialmente diferente. Melhor criar nova página `avaliacao-dashboard-v2` com componentes novos, mantendo a v1 intacta (ou substituir `page.tsx` se for substituição total).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Donut chart | Canvas/SVG manual | Recharts PieChart + innerRadius | Stack existente, 3 linhas de código |
| Line gradient | SVG manual | `<defs><linearGradient>` + `<Area>` | Padrão existente no projeto |
| Tabela responsiva | HTML table manual | shadcn/ui Table | Acessibilidade, responsividade, estilo consistente |
| Star rating | CSS estrelas manual | lucide-react Star + StarHalf | Stack existente, ícones consistentes |
| Badges de status | CSS badges manual | shadcn/ui Badge | Já usado no projeto |

**Key insight:** Tudo que esta fase precisa já existe na stack atual do projeto. Nenhuma instalação de nova dependência é necessária.

---

## Common Pitfalls

### Pitfall 1: Semanas com Zero Avaliações — LAG não gera linhas vazias

**What goes wrong:** O comparativo semanal (D5-03/04) mostra apenas semanas com avaliações. Se a Semana 2 não tiver dados, LAG da Semana 3 mostra Semana 1 como anterior, não Semana 2.

**Why it happens:** `GROUP BY strftime('%Y-%W', data)` só produz linhas para semanas que existem na tabela. LAG opera sobre as linhas que existem no resultset.

**How to avoid:** Gerar lista contígua de semanas no client-side. Usar `GET /api/avaliacoes/semanas` para saber quais semanas têm dados. Preencher gaps com carry forward (último valor conhecido).

**Warning signs:** Gráfico de linha com gaps (segmentos faltando) ou comparação errada (pula semanas sem dados).

### Pitfall 2: Score Final com `nota_auditoria` null

**What goes wrong:** Se alguma avaliação não tiver `nota_auditoria`, `AVG()` no SQL retorna `null` para aquele funcionário, fazendo `score_base` ser `NaN`.

**Why it happens:** `nota_auditoria` é obrigatória (D4.5-03 valida no POST), mas dados históricos podem ter null.

**How to avoid:** No cálculo do Score Final em JS, tratar `null` como `0` para todas as métricas. Usar `?? 0` nos valores.

**Warning signs:** Score na tabela da equipa aparece como `---` ou `NaN`.

### Pitfall 3: `perc_produtividade` pode exceder 100

**What goes wrong:** D4.5-01 define `perc_produtividade REAL` sem CHECK constraint. D5-01 diz "capped 100" para Score Final.

**Why it happens:** O campo não tem limite superior — usuário pode digitar 150%.

**How to avoid:** No cálculo do Score Final, aplicar `Math.min(perc_produtividade, 100)` antes de usar no `score_base`. O KPI card de "Produtividade Média" também deve cap em 100 ou mostrar o valor real com nota de que excede.

**Warning signs:** Score Final ultrapassa 100 apesar de vários atrasos/erros.

### Pitfall 4: PieChart sem ChartConfig válido

**What goes wrong:** O `ChartContainer` do shadcn/ui lança erro se o `config` prop não tiver entradas para todos os `dataKey` usados nos filhos.

**Why it happens:** PieChart não usa `dataKey` da mesma forma que LineChart/BarChart — os nomes vêm de `nameKey` e `dataKey` do `<Pie>`. O ChartContainer verifica o config contra os nomes.

**How to avoid:** Passar `config={{}}` vazio para ChartContainer quando não houver entrada no config, **OU** definir entradas para cada categoria:
```tsx
const config = {
  excelente: { label: "Excelente", color: "#22c55e" },
  bom: { label: "Bom", color: "#3b82f6" },
  atencao: { label: "Atenção", color: "#eab308" },
  critico: { label: "Crítico", color: "#ef4444" },
} satisfies ChartConfig;
```

**Warning signs:** Erro de runtime no console: "chart config missing for key".

---

## Code Examples

### GET /api/avaliacoes/dashboard — API Route Completa

```typescript
// src/app/api/avaliacoes/dashboard/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    if (!from || !to) {
      return NextResponse.json({ error: "from e to são obrigatórios" }, { status: 400 });
    }

    const db = getDb();
    const whereClause = "WHERE f.ativo = 1 AND a.data_avaliacao >= ? AND a.data_avaliacao <= ?";
    const params = [from, to];

    // 1. Comparativo Semanal (agrupado por ISO week)
    const comparativoSemanal = db.prepare(`
      SELECT
        strftime('%Y-%W', a.data_avaliacao) AS week,
        CAST(AVG(a.perc_produtividade) AS REAL) AS produtividade,
        CAST(AVG(CASE WHEN a.uso_ferramenta = 1 THEN 100.0 ELSE 0 END) AS REAL) AS uso_speedops,
        SUM(a.erro_critico) AS erros_criticos,
        SUM(a.atraso + a.falta) AS atrasos_faltas,
        CAST(AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS REAL) AS media_auditor,
        CAST(AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS REAL) AS media_supervisor
      FROM avaliacoes a
      JOIN funcionarios f ON f.id = a.funcionario_id
      ${whereClause}
      GROUP BY strftime('%Y-%W', a.data_avaliacao)
      ORDER BY week
    `).all(...params) as Array<{
      week: string;
      produtividade: number | null;
      uso_speedops: number | null;
      erros_criticos: number;
      atrasos_faltas: number;
      media_auditor: number | null;
      media_supervisor: number | null;
    }>;

    // 2. Última semana e anterior para comparativo dos cards
    const ultimasSemanas = comparativoSemanal.slice(-2);
    const semanaAtual = ultimasSemanas[ultimasSemanas.length - 1] ?? null;
    const semanaAnterior = ultimasSemanas.length >= 2 ? ultimasSemanas[ultimasSemanas.length - 2] : null;

    // 3. Tabela da Equipa (Score Final por funcionário)
    const teamRaw = db.prepare(`
      SELECT
        f.id, f.nome,
        CAST(AVG(a.perc_produtividade) AS REAL) AS avg_prod,
        CAST(AVG(a.nota_auditoria) AS REAL) AS avg_nota,
        CAST(AVG((a.pontualidade + a.qualidade + a.produtividade + a.trabalho_equipa + a.iniciativa + a.comunicacao) / 6.0) AS REAL) AS avg_categorias,
        SUM(a.atraso) AS total_atrasos,
        SUM(a.falta) AS total_faltas,
        SUM(a.erro_critico) AS total_erros,
        SUM(CASE WHEN a.uso_ferramenta = 1 THEN 1 ELSE 0 END) AS count_uso,
        CAST(AVG(CASE WHEN a.tipo_auditoria = 'auditor' THEN a.nota_auditoria END) AS REAL) AS media_auditor,
        CAST(AVG(CASE WHEN a.tipo_auditoria = 'supervisor' THEN a.nota_auditoria END) AS REAL) AS media_supervisor
      FROM avaliacoes a
      JOIN funcionarios f ON f.id = a.funcionario_id
      ${whereClause}
      GROUP BY f.id, f.nome
      ORDER BY f.nome
    `).all(...params) as Array<{
      id: number; nome: string;
      avg_prod: number | null; avg_nota: number | null; avg_categorias: number | null;
      total_atrasos: number; total_faltas: number; total_erros: number;
      count_uso: number; media_auditor: number | null; media_supervisor: number | null;
    }>;

    // 4. Distribuição de Desempenho (contagem por categoria)
    // Calculado a partir do team array com score final
    const team = teamRaw.map((row) => {
      const prod = row.avg_prod !== null ? Math.min(row.avg_prod, 100) : 0;
      const nota = row.avg_nota ?? 0;
      const cats = (row.avg_categorias ?? 5) * 10;
      const scoreBase = (prod + nota + cats) / 3;
      const penalidades = row.total_atrasos * 2 + row.total_faltas * 2 + row.total_erros * 5;
      const bonus = row.count_uso > 0 ? 5 : 0;
      const scoreFinal = Math.max(0, scoreBase - penalidades + bonus);

      let status: string;
      if (scoreFinal >= 95) status = "excelente";
      else if (scoreFinal >= 90) status = "bom";
      else if (scoreFinal >= 85) status = "atencao";
      else status = "critico";

      return {
        id: row.id, nome: row.nome,
        avg_produtividade: row.avg_prod,
        total_atrasos: row.total_atrasos,
        total_faltas: row.total_faltas,
        total_erros: row.total_erros,
        uso_ferramenta: row.count_uso > 0,
        media_auditor: row.media_auditor,
        media_supervisor: row.media_supervisor,
        score_final: Math.round(scoreFinal),
        status,
      };
    });

    // Distribuição
    const distribuicao = [
      { name: "Excelente", value: team.filter((t) => t.score_final >= 95).length, fill: "#22c55e" },
      { name: "Bom", value: team.filter((t) => t.score_final >= 90 && t.score_final < 95).length, fill: "#3b82f6" },
      { name: "Atenção", value: team.filter((t) => t.score_final >= 85 && t.score_final < 90).length, fill: "#eab308" },
      { name: "Crítico", value: team.filter((t) => t.score_final < 85).length, fill: "#ef4444" },
    ];

    // 5. Ferramenta uso %
    const totalAvaliacoes = db.prepare(`
      SELECT COUNT(*) as total FROM avaliacoes a
      JOIN funcionarios f ON f.id = a.funcionario_id ${whereClause}
    `).get(...params) as { total: number };

    const usoFerramentaCount = db.prepare(`
      SELECT COUNT(*) as count FROM avaliacoes a
      JOIN funcionarios f ON f.id = a.funcionario_id
      ${whereClause} AND a.uso_ferramenta = 1
    `).get(...params) as { count: number };

    return NextResponse.json({
      comparativo_semanal: comparativoSemanal,
      semana_atual: semanaAtual,
      semana_anterior: semanaAnterior,
      team,
      distribuicao,
      uso_ferramenta: {
        utilizou_pct: totalAvaliacoes.total > 0
          ? (usoFerramentaCount.count / totalAvaliacoes.total) * 100
          : 0,
        utilizou_count: usoFerramentaCount.count,
        nao_utilizou_pct: totalAvaliacoes.total > 0
          ? ((totalAvaliacoes.total - usoFerramentaCount.count) / totalAvaliacoes.total) * 100
          : 0,
        nao_utilizou_count: totalAvaliacoes.total - usoFerramentaCount.count,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```
[ASSUMED: Estrutura da API route. VERIFIED: better-sqlite3 `.all(...params)` pattern from codebase.]

### GET /api/avaliacoes/funcionario/:id/historico

```typescript
// src/app/api/avaliacoes/funcionario/[id]/historico/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const db = getDb();

    const conditions = ["a.funcionario_id = ?"];
    const queryParams: (string | number)[] = [Number(id)];
    if (from) { conditions.push("a.data_avaliacao >= ?"); queryParams.push(from); }
    if (to) { conditions.push("a.data_avaliacao <= ?"); queryParams.push(to); }
    const where = `WHERE ${conditions.join(" AND ")}`;

    // Avaliações com score final calculado
    const rows = db.prepare(`
      SELECT
        a.id, a.data_avaliacao, a.pontualidade, a.qualidade, a.produtividade,
        a.trabalho_equipa, a.iniciativa, a.comunicacao, a.media, a.comentario,
        a.atraso, a.falta, a.uso_ferramenta, a.erro_critico,
        a.perc_produtividade, a.nota_auditoria, a.tipo_auditoria
      FROM avaliacoes a
      ${where}
      ORDER BY a.data_avaliacao ASC, a.id ASC
    `).all(...queryParams) as Array<{
      id: number; data_avaliacao: string;
      perc_produtividade: number | null; nota_auditoria: number | null;
      media: number; comentario: string | null;
      atraso: number; falta: number; uso_ferramenta: number; erro_critico: number;
      tipo_auditoria: string;
      [categoria: string]: number | string | null;
    }>;

    // Score evolution por avaliação (para gráfico)
    const evolution = rows.map((row) => {
      const prod = row.perc_produtividade !== null ? Math.min(row.perc_produtividade, 100) : 0;
      const nota = row.nota_auditoria ?? 0;
      const cats = (row.media ?? 5) * 10; // media das 6 categorias (1-10) -> 10-100
      const scoreBase = (prod + nota + cats) / 3;
      const penalidades = row.atraso * 2 + row.falta * 2 + row.erro_critico * 5;
      const bonus = row.uso_ferramenta ? 5 : 0;
      const score = Math.max(0, scoreBase - penalidades + bonus);

      return {
        data_avaliacao: row.data_avaliacao,
        score: Math.round(score),
        perc_produtividade: row.perc_produtividade,
        tipo_auditoria: row.tipo_auditoria,
      };
    });

    return NextResponse.json({
      evolution,
      comentarios: rows
        .filter((r) => r.comentario)
        .map((r) => ({
          data: r.data_avaliacao,
          tipo: r.tipo_auditoria,
          comentario: r.comentario,
        })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```
[ASSUMED: Padrão Next.js route handler com params async — projeto usa Next.js 16]

### GET /api/avaliacoes/semanas

```typescript
// src/app/api/avaliacoes/semanas/route.ts
export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT DISTINCT strftime('%Y-%W', data_avaliacao) AS week
      FROM avaliacoes
      ORDER BY week
    `).all() as Array<{ week: string }>;
    return NextResponse.json({ semanas: rows.map((r) => r.week) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Score Badge Component

```tsx
"use client";
import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG = {
  excelente: { label: "Excelente", variant: "default" as const, className: "bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30" },
  bom:       { label: "Bom",       variant: "default" as const, className: "bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30" },
  atencao:   { label: "Atenção",   variant: "default" as const, className: "bg-[#eab308]/20 text-[#eab308] hover:bg-[#eab308]/30" },
  critico:   { label: "Crítico",   variant: "destructive" as const, className: "" },
};

export function ScoreBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.critico;
  return <Badge variant={cfg.variant} className={cfg.className}>{cfg.label}</Badge>;
}
```

### Indicador de Tendência (▲/▼/→)

```tsx
"use client";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function TendenciaIndicator({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) {
    return <span className="text-xs text-[#71717a]">—</span>;
  }
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-xs text-[#71717a]">
        <Minus size={12} /> {diff >= 0 ? "+" : ""}{diff.toFixed(1)}
      </span>
    );
  }
  const isPositive = diff > 0;
  return (
    <span className={`flex items-center gap-1 text-xs ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? "+" : ""}{diff.toFixed(1)}
    </span>
  );
}
```

---

## State of the Art

| Old Approach (v1) | Current Approach (v2) | When Changed | Impact |
|-------------------|----------------------|--------------|--------|
| Single column layout | Two-column layout (65/35) | Fase 5 | Novo layout de página |
| Média geral simples | Score Final composto com penalidades | Fase 5 | Cálculo em JS no API route |
| Filtro por mês | Filtro por período + semana | Fase 5 | Agregação semanal |
| Gráfico de barras comparativo | Donut + linha gradiente + barra | Fase 5 | 3 novos componentes de gráfico |
| Melhor funcionário | Tabela completa da equipa | Fase 5 | Tabela com scores individuais |
| Sem detalhamento individual | Coluna direita com dropdown | Fase 5 | 4 novos componentes individuais |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Score Final deve ser calculado no API route em JS (não SQL) | Score Final | Baixo — SQL poderia fazer via subquery, mas JS é mais legível |
| A2 | Carry forward de semanas vazias deve ser client-side | Comparativo Semanal | Médio — SQL recursive CTE seria mais performático, mas mais complexo |
| A3 | Paleta D5-17 mapeada diretamente para cores inline (não CSS variables do tema) | Cores | Baixo — Poderia usar CSS vars, mas as cores são fixas e específicas |
| A4 | `perc_produtividade` pode exceder 100 — capped no Score Final | Score Final | Baixo — Campo REAL sem CHECK, cap no cálculo é seguro |
| A5 | StarRating usa lucide-react Star/StarHalf | Star Rating | Baixo — Poderia usar Unicode stars, mas lucide é mais consistente |
| A6 | ChartContainer com config vazio funciona para PieChart | Donut | Médio — Testar se ChartContainer exige config entries. Se erro, usar ResponsiveContainer diretamente |

---

## Open Questions

Nenhuma — todas as decisões foram resolvidas no CONTEXT.md. Os pontos acima em Assumptions Log são de baixo risco.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (configurado via `"test": "vitest run --reporter=verbose"` em package.json) |
| Config file | Não encontrado — config default do Vitest |
| Quick run command | `npm test` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| D5-01/02 | Score Final calculation (com penalidades/bonus) | unit | `npx vitest run tests/unit/score-final.test.ts` | ❌ Wave 0 |
| D5-03/04 | ISO week grouping + LAG comparison | integration | `npx vitest run tests/api/avaliacoes-dashboard.test.ts` | ❌ Wave 0 |
| D5-05 | Carry forward fills empty weeks | unit | `npx vitest run tests/unit/carry-forward.test.ts` | ❌ Wave 0 |
| D5-18 | GET /dashboard returns all KPIs | integration | `npx vitest run tests/api/avaliacoes-dashboard.test.ts` | ❌ Wave 0 |
| D5-19 | GET /funcionario/:id/historico returns evolution + comments | integration | `npx vitest run tests/api/avaliacoes-historico.test.ts` | ❌ Wave 0 |
| D5-20 | GET /semanas returns available weeks | integration | `npx vitest run tests/api/avaliacoes-semanas.test.ts` | ❌ Wave 0 |
| D5-22 | Star rating calculation (nota/20) | unit | `npx vitest run tests/unit/star-rating.test.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/score-final.test.ts` — Score Final formula
- [ ] `tests/unit/carry-forward.test.ts` — fillCarryForward function
- [ ] `tests/unit/star-rating.test.ts` — StarRating calculation
- [ ] `tests/api/avaliacoes-dashboard.test.ts` — dashboard endpoint
- [ ] `tests/api/avaliacoes-historico.test.ts` — historico endpoint
- [ ] `tests/api/avaliacoes-semanas.test.ts` — semanas endpoint
- [ ] Framework install: `npx vitest` (já configurado em package.json)

*(Nota: O projeto não possui testes existentes — criar infraestrutura de testes pode integrar o Wave 0)*

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | 24.15.0 | — |
| SQLite (better-sqlite3) | Database | ✓ | 12.10.0 (SQLite 3.53.1) | — |
| recharts | Charts | ✓ | 3.8.1 | — |
| shadcn/ui Table | Team table | ✓ | Já instalado | — |
| shadcn/ui Badge | Status badges | ✓ | Já instalado | — |
| shadcn/ui Select | Dropdowns | ✓ | Já instalado | — |
| lucide-react | Icons (stars, trends) | ✓ | Já instalado | — |
| date-fns | Date formatting | ✓ | Já instalado | — |

**Missing dependencies with no fallback:** Nenhum.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | não | Aplicação single-user local |
| V3 Session Management | não | Sem sessão de usuário |
| V4 Access Control | não | Single-user |
| V5 Input Validation | não | Esta fase não adiciona inputs de usuário — apenas queries de leitura |
| V6 Cryptography | não | Sem dados sensíveis |

A fase 5 é exclusivamente de leitura (dashboard) — sem forms, sem mutations, sem inputs de usuário. Não há superfície de ataque nova.

---

## Sources

### Primary (HIGH confidence)
- Codebase: `daily-chart.tsx` — padrão LineChart + gradient Area [VERIFIED]
- Codebase: `avaliacao-dashboard-client.tsx` — padrão de fetch + estado [VERIFIED]
- Codebase: `kpi-cards.tsx` — padrão de cards KPI [VERIFIED]
- Codebase: `db.ts` — SQLite schema avaliacoes [VERIFIED]
- Codebase: `stats/route.ts` — padrão de queries SQL agregadas [VERIFIED]
- Codebase: `route.ts` — padrão de POST/GET avaliacoes [VERIFIED]
- Codebase: `comparative-chart.tsx` — padrão BarChart Recharts [VERIFIED]
- Codebase: `historico-modal.tsx` — padrão LineChart com gradient [VERIFIED]
- [VERIFIED: SQLite 3.53.1] — `strftime('%Y-%W')` + `LAG()` testado via better-sqlite3
- [VERIFIED: npm registry] — recharts v3.8.1, better-sqlite3 v12.10.0

### Secondary (MEDIUM confidence)
- [CITED: recharts/recharts] — PieChart innerRadius/outerRadius docs
- [CITED: recharts/recharts] — Area/Line gradient pattern with linearGradient defs
- [CITED: github.com/wiselibs/better-sqlite3] — User-defined functions API

### Tertiary (LOW confidence)
- Nenhum — todas as afirmações verificadas contra codebase ou testes diretos

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — tudo verificado contra codebase + npm registry
- Architecture: HIGH — padrões extraídos do codebase existente
- Pitfalls: HIGH — testado diretamente contra SQLite 3.53.1

**Research date:** 2026-06-07
**Valid until:** 2026-07-07 (30 dias — stack estável)

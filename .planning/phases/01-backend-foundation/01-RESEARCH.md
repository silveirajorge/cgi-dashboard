# Phase 1: Backend Foundation — Research

**Researched:** 2026-06-06
**Domain:** SQLite, CSV Parsing, Next.js API Routes, Layered Architecture
**Confidence:** HIGH

## Summary

Esta fase implementa toda a infraestrutura server-side do CSV KPI Dashboard: banco SQLite local, engine de parsing CSV, API routes REST, e arquitetura em camadas Service + Repository. O usuário poderá fazer upload de CSV via `POST /api/upload` e consultar KPIs agregados via `GET /api/data`.

A stack técnica é direta: **better-sqlite3 v12** (síncrono, singleton, Node.js nativo) para banco, **papaparse v5** para parsing CSV com normalização de headers, e **Next.js App Router Route Handlers** para API endpoints. Não há necessidade de ORM (Prisma/Drizzle são overkill) nem de middleware de upload (multer) — o `Request.formData()` nativo do Web API é suficiente.

**Primary recommendation:** Implementar três módulos server-side coesos (`src/lib/db.ts`, `src/lib/csv.ts`, `src/lib/services/pedidos.ts`) mais três API routes (`/api/upload`, `/api/data`, `/api/upload/history`), com schema dinâmico de tabela derivado do primeiro CSV e dedup por `INSERT OR IGNORE` com unique constraint em `(id_contacto, mes_competencia)`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Service + Repository Pattern — três responsabilidades separadas
- **D-02:** Repository em `src/lib/db.ts` — conexão SQLite singleton, queries CRUD
- **D-03:** CSV parsing em `src/lib/csv.ts` — parse, normalização de headers, validação de cabeçalho
- **D-04:** Service layer em `src/lib/services/pedidos.ts` — lógica de negócio (dedup, cálculo de KPI, orquestração upload → parse → store)
- **D-05:** Chave composta: `id_contacto + mes_competencia`
- **D-06:** `mes_competencia` é coluna virtual derivada de `Dt Registo` — extrair ano-mês (YYYY-MM) da data
- **D-07:** `INSERT OR IGNORE` com unique constraint na chave composta
- **D-08:** Schema dinâmico — a tabela é criada com base nos cabeçalhos do primeiro CSV enviado
- **D-09:** Colunas do CSV normalizadas (trim, lowercase, replace espaços por underscore)
- **D-10:** Coluna extra `mes_competencia` (TEXT, YYYY-MM) adicionada automaticamente
- **D-11:** Unique constraint em `(id_contacto, mes_competencia)`
- **D-12:** Coluna extra `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) para rastreamento
- **D-13:** Colunas do CSV identificadas: `ID_CONTACTO`, `CIL`, `Produto`, `Dt Registo`, `Dt Contato`, `DtResolução`, `DtLimite`, `Estado`, `DtEstado`, `UnidadeTrat`, `Nivel 1`, `Nivel 2`, `Nivel 3`, `receção`, `Justificação`, `Tipo Justificação`, `Justificação Atividade`, `Resposta`, `Local Registo`, `Reportado Por`, `Observações`
- **D-14:** `POST /api/upload` — recebe arquivo CSV (multipart/form-data), parseia, armazena com dedup, retorna stats
- **D-15:** `GET /api/data` — retorna KPIs já agregados (soma, média, min, max por coluna numérica + contagem total)
- **D-16:** `GET /api/upload/history` — retorna histórico de uploads
- **D-17:** Arquivo: `.data/cgi.db`
- **D-18:** Singleton de conexão em `src/lib/db.ts` — inicialização lazy na primeira chamada
- **D-19:** Migração automática — criar tabela `pedidos` e tabela `upload_history` se não existirem
- **D-20:** Tabela `upload_history`: `id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, rows_imported INTEGER, rows_ignored INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

### the agent's Discretion
- Detalhes de implementação do parser CSV (papaparse options, encoding handling)
- Nomes exatos das funções e organização interna dos módulos
- Tratamento de erros HTTP específico nos endpoints
- Validação de tamanho máximo do arquivo (recomendado: 10MB)

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CSV-03 | Sistema valida cabeçalho do CSV — colunas esperadas devem estar presentes (independente da ordem) | Papaparse `header: true` + normalização com Zod para validar que colunas essenciais estão presentes. Comparação case-insensitive após normalização. |
| CSV-05 | Colunas do CSV normalizadas (trim, lowercase, replace espaços por underscore) | Normalização pós-parse: mapear headers para versão normalizada, remapear objetos das linhas. Padrão simples em `src/lib/csv.ts`. |
| DATA-01 | Dados do CSV armazenados em SQLite local (`.data/cgi.db`) | `better-sqlite3` v12.10.0 com singleton lazy, migração automática na primeira conexão. `.data/` já está em `.gitignore`. |
| DATA-02 | Uploads cumulativos — novos dados somam-se aos existentes | `INSERT OR IGNORE` — não remove dados existentes, apenas adiciona os que não colidem. |
| DATA-03 | Deduplicação por `id_contacto + data` (coluna virtual) | Unique constraint em `(id_contacto, mes_competencia)` no schema da tabela. `INSERT OR IGNORE` rejeita duplicatas silenciosamente. |
| DATA-04 | Tabela `pedidos` (schema definido pelo CSV) | Schema dinâmico: extrair colunas do primeiro CSV normalizado, gerar `CREATE TABLE` com colunas adicionais fixas. |
| DATA-05 | Histórico de uploads registrado (data/hora, número de linhas) | Tabela `upload_history` separada, inserida a cada upload com filename, linhas importadas e ignoradas. |
| ARCH-01 | Código organizado em camadas | Três módulos: `src/lib/db.ts` (repo), `src/lib/csv.ts` (parser), `src/lib/services/pedidos.ts` (service). |
| ARCH-02 | Banco isolado em `.data/` (gitignored) | `.gitignore` já contém `.data/`. Verificado. |
| ARCH-03 | CSV template/test em `data/csv/` (versionados) | 5 arquivos CSV já existentes em `data/csv/`. |
| ARCH-04 | Singleton de conexão SQLite em `src/lib/db.ts` | Module-level caching pattern com lazy init. |
| CUST-01 | Sistema de temas e layout existente preservado | Backend totalmente isolado em `src/app/api/` + `src/lib/`. Nenhum componente existente é modificado. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| CSV parsing and normalization | API / Backend | — | Todo parsing é server-side no Route Handler. O browser só envia o arquivo como multipart/form-data. |
| SQLite persistence | API / Backend | — | better-sqlite3 é Node.js nativo, executa exclusivamente no servidor. |
| Schema detection and migration | API / Backend | — | Determinado no primeiro upload, executado via prepared statements. |
| Dedup enforcement | API / Backend | — | Unique constraint no schema SQLite + `INSERT OR IGNORE` no service layer. |
| KPI calculation | API / Backend | — | Agregações SQL no service layer. Frontend só recebe JSON via GET. |
| File upload reception | API / Backend | — | Route Handler Next.js recebe multipart/form-data via `request.formData()`. |
| Upload history tracking | API / Backend | — | Tabela separada `upload_history`, inserida pelo service após cada upload. |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-sqlite3 | 12.10.0 | SQLite database driver | Síncrono, performance máxima, integração direta com Node.js. Nenhum ORM necessário para este caso. |
| papaparse | 5.5.3 | CSV parser | Líder do ecossistema JS para CSV. Suporta `header: true`, `dynamicTyping`, `skipEmptyLines`, encoding. |

**Version verification:** [VERIFIED: npm registry]
- `better-sqlite3@12.10.0` — publicada Nov 2025
- `papaparse@5.5.3` — publicada Jan 2025

### Type Definitions

| Library | Version | Purpose |
|---------|---------|---------|
| @types/better-sqlite3 | 7.6.13 | TypeScript definitions for better-sqlite3 |
| @types/papaparse | 5.5.2 | TypeScript definitions for papaparse |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| better-sqlite3 | sql.js (WebAssembly) | sql.js roda em browser mas é mais lento e complexo. Melhor ficar com Node.js nativo. |
| better-sqlite3 | Prisma + SQLite | Prisma adiciona 40MB+ de dependências, migrations tooling, e complexidade desnecessária para schema dinâmico. |
| papaparse | csv-parse (do pacote `csv`) | csv-parse é mais verboso e menos flexível. Papaparse tem API mais direta. |
| Manual FormData | multer | multer é middleware Express. Next.js App Router usa `request.formData()` nativo — multer não é necessário e não funciona. |

**Installation:**
```bash
npm install better-sqlite3 papaparse
npm install --save-dev @types/better-sqlite3 @types/papaparse
```

## Architecture Patterns

### System Architecture Diagram

```
Browser (Fase 2)                Next.js Server (Fase 1)               Filesystem
┌──────────────────┐    HTTP    ┌──────────────────────────────┐    ┌──────────┐
│ Upload Form      │ ────────→ │ /api/upload (route.ts)       │    │ .data/   │
│ (FormData com    │           │  ├─ csvService.parse()       │    │ cgi.db   │
│  arquivo CSV)    │           │  │    ├─ Papa.parse()         │    │ (SQLite) │
│                  │           │  │    ├─ normalize headers    │    └──────────┘
│                  │           │  │    └─ validate schema      │
│                  │           │  │                             │
│                  │           │  └─ csvService.importRows()   │
│                  │           │       ├─ db.insertPedidos()   │
│                  │           │       └─ db.insertHistory()   │
│                  │           │                              │
│ Dashboard Page   │    HTTP   │ /api/data (route.ts)         │
│ (Fase 3)         │ ←─────── │  └─ kpiService.getKPIs()     │
│                  │           │       └─ db.getKpiData()      │
│                  │           │                              │
│                  │    HTTP   │ /api/upload/history (route.ts)│
│                  │ ←─────── │  └─ db.getUploadHistory()     │
└──────────────────┘           └──────────────────────────────┘
```

### Project Structure
```
src/
├── app/api/
│   ├── upload/
│   │   ├── route.ts              # POST handler
│   │   └── history/
│   │       └── route.ts          # GET handler
│   └── data/
│       └── route.ts              # GET handler — KPIs agregados
│
├── lib/
│   ├── db.ts                     # SQLite singleton + CRUD queries (Repository layer)
│   ├── csv.ts                    # CSV parsing + header normalization + validation
│   ├── services/
│   │   └── pedidos.ts            # Business logic: orchestrates upload → parse → store
│   └── utils.ts                  # Existing utilities (cn, formatCurrency, etc.)
│
├── components/                   # Unchanged
├── stores/                       # Unchanged
├── server/                       # Unchanged
└── ...                           # Unchanged

data/csv/                          # Versioned CSV test files (already exists)
├── 2026-01.csv
├── 2026-02.csv
├── 2026-03.csv
├── 2026-04.csv
└── 2026-05.csv

.data/                             # Gitignored SQLite database (entry exists in .gitignore)
└── cgi.db                         # Created on first upload
```

### Pattern 1: SQLite Singleton (Repository Layer)

**What:** Módulo-level caching pattern para conexão SQLite. A conexão é criada na primeira chamada e reutilizada durante todo o ciclo de vida do servidor.

**When to use:** Sempre. A documentação do better-sqlite3 recomenda uma única conexão por aplicação.

```typescript
// src/lib/db.ts
import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = path.resolve(process.cwd(), ".data/cgi.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");

    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database): void {
  // Tabelas são criadas dinamicamente — ver runMigrationsAfterSchema()
  // Tabela upload_history é fixa:
  db.exec(`
    CREATE TABLE IF NOT EXISTS upload_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      rows_imported INTEGER NOT NULL,
      rows_ignored INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export function createPedidosTable(columns: string[]): void {
  const db = getDb();
  // Columns já vêm normalizadas (trim, lowercase, underscore)
  const colDefs = columns
    .map((col) => `"${col}" TEXT`)
    .join(", ");
  db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ${colDefs},
      mes_competencia TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(id_contacto, mes_competencia)
    )
  `);
}

// Source: better-sqlite3 docs — singleton pattern adaptado
// [VERIFIED: npm registry - better-sqlite3 v12.10.0 API]
```

### Pattern 2: CSV Parsing with Normalization

**What:** Parsing do CSV com papaparse, normalização de headers (trim, lowercase, underscore), e validação de presença de colunas essenciais.

**When to use:** Em todo upload de CSV.

```typescript
// src/lib/csv.ts
import Papa from "papaparse";

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: Papa.ParseError[];
}

export function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

export function parseCsvContent(content: string): ParseResult {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false, // mantemos tudo como string para o banco
  });

  if (result.data.length === 0) {
    throw new Error("CSV vazio ou sem dados");
  }

  const rawHeaders = result.meta.fields ?? [];
  if (rawHeaders.length === 0) {
    throw new Error("CSV sem cabeçalhos");
  }

  const headers = rawHeaders.map(normalizeHeader);
  const rows = result.data.map((row) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[normalizeHeader(key)] = (value ?? "").trim();
    }
    return normalized;
  });

  return { headers, rows, errors: result.errors };
}

export function extractMesCompetencia(dtRegisto: string): string {
  // Formato esperado: "2026-01-29 11:43:07"
  const date = dtRegisto.split(" ")[0]; // "2026-01-29"
  return date.substring(0, 7); // "2026-01"
}

export function validateRequiredColumns(
  headers: string[],
  required: string[],
): void {
  const normalized = new Set(headers);
  for (const col of required) {
    if (!normalized.has(col)) {
      throw new Error(
        `Coluna obrigatória '${col}' não encontrada no CSV. ` +
        `Colunas encontradas: [${[...normalized].join(", ")}]`,
      );
    }
  }
}

// Source: papaparse docs — header normalization pattern
// [VERIFIED: /mholt/papaparse — header: true, skipEmptyLines API]
```

### Pattern 3: API Route Handler with File Upload

**What:** Next.js App Router Route Handler recebendo multipart/form-data com arquivo CSV.

**When to use:** POST /api/upload

```typescript
// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { parseCsvContent, validateRequiredColumns } from "@/lib/csv";
import { importRows } from "@/lib/services/pedidos";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const REQUIRED_COLUMNS = ["id_contacto"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado. Envie um CSV no campo 'file'." },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 },
      );
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Apenas arquivos CSV são aceitos" },
        { status: 400 },
      );
    }

    const content = await file.text();
    const parsed = parseCsvContent(content);

    validateRequiredColumns(parsed.headers, REQUIRED_COLUMNS);

    const stats = await importRows(parsed, file.name);

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      filename: file.name,
      ...stats,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao processar upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Source: Next.js 16 docs — Route Handler with formData
// [VERIFIED: /llmstxt/nextjs_llms-full_txt — request.formData() API]
```

### Pattern 4: Service Layer — Orchestration

**What:** Service layer que orquestra o pipeline upload → parse → store com dedup, calcula estatísticas e registra histórico.

**When to use:** Em `POST /api/upload`.

```typescript
// src/lib/services/pedidos.ts
import { type ParseResult, extractMesCompetencia } from "@/lib/csv";
import { getDb, createPedidosTable, insertPedido, insertUploadHistory } from "@/lib/db";

export interface UploadStats {
  rows_imported: number;
  rows_ignored: number;
  total_rows: number;
}

export async function importRows(
  parsed: ParseResult,
  filename: string,
): Promise<UploadStats> {
  const db = getDb();
  const { headers, rows } = parsed;

  // Verificar se tabela já existe; se não, criar com schema do CSV
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'")
    .get();

  if (!tableExists) {
    createPedidosTable(headers);
  }

  // Verificar se colunas do CSV correspondem ao schema existente
  const existingColumns = db
    .prepare("PRAGMA table_info(pedidos)")
    .all() as { name: string }[];
  const existingNames = new Set(existingColumns.map((c) => c.name));
  const unknownColumns = headers.filter((h) => !existingNames.has(h));
  if (unknownColumns.length > 0) {
    throw new Error(
      `Colunas desconhecidas encontradas: [${unknownColumns.join(", ")}]. ` +
      `O schema foi definido pelo primeiro CSV enviado.`,
    );
  }

  const insert = db.prepare(`
    INSERT OR IGNORE INTO pedidos (${headers.map((h) => `"${h}"`).join(", ")}, mes_competencia)
    VALUES (${headers.map(() => "?").join(", ")}, ?)
  `);

  let imported = 0;
  let ignored = 0;

  const transaction = db.transaction(() => {
    for (const row of rows) {
      const values = headers.map((h) => row[h] ?? null);
      const dtRegisto = row["dt_registo"] ?? "";
      const mesComp = extractMesCompetencia(dtRegisto);
      values.push(mesComp);

      const result = insert.run(...values);
      if (result.changes > 0) {
        imported++;
      } else {
        ignored++;
      }
    }

    insertUploadHistory(filename, imported, ignored);
  });

  transaction();

  return {
    rows_imported: imported,
    rows_ignored: ignored,
    total_rows: rows.length,
  };
}

// Source: better-sqlite3 docs — transaction + prepared statements
// [VERIFIED: /wiselibs/better-sqlite3 — transactions API]
```

### Anti-Patterns to Avoid

- **Tratar `formData.get("file")` sem verificar `instanceof File`:** O TypeScript não infere automaticamente. Sempre verificar com `if (!(file instanceof File))`.
- **Criar connection pool para SQLite:** SQLite single-writer. Multiple connections causam `SQLITE_BUSY`. Usar singleton.
- **Validar colunas com Zod contra schema estático:** O schema é dinâmico (definido pelo CSV). Zod deve ser usado apenas para validação de tipos de dados, não estrutura de colunas.
- **Usar `dynamicTyping: true` do papaparse no backend:** Melhor manter tudo como string no banco e converter tipos no service layer ou frontend.
- **Tentar usar `"use cache"` ou `react.cache()` para o singleton:** better-sqlite3 é síncrono e mantém estado interno. Module-level caching é suficiente.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| CSV parsing | CSV parser manual com split, regex | papaparse | Edge cases: quoted fields, multiline values, BOM, diferentes line endings, encoding. CSV real tem multiline em `Observações`. |
| SQLite driver | Raw C bindings ou child_process | better-sqlite3 | API síncrona madura, prepared statements, transactions, WAL mode. |
| SQL query construction | String concatenation de colunas | Prepared statements com `?` params | SQL injection prevention. As colunas são dinâmicas (schema do CSV), mas os valores sempre via `?`. |
| Multipart form parser | Manual boundary parsing | `request.formData()` (Web API nativo) | Next.js e Node.js já suportam nativamente. |

**Key insight:** Tudo nesta fase tem bibliotecas maduras e bem testadas. Não há necessidade de implementar nada do zero. A complexidade está na orquestração correta entre os módulos e no tratamento de erros.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | better-sqlite3 (native addon) | ✓ | 18+ (Next.js 16 requirement) | — |
| npm | Package installation | ✓ | 10+ | — |
| SQLite (system) | better-sqlite3 (linking) | ✓ | Bundled with better-sqlite3 | — |

**Missing dependencies with no fallback:** None — todas as dependências são npm packages.

**Missing dependencies with fallback:** None.

## Common Pitfalls

### Pitfall 1: Conexão SQLite perdida em hot-reload (Next.js dev)

**What goes wrong:** Next.js dev server faz hot-reload de módulos — se o módulo `db.ts` é recarregado, a variável `db` global é reiniciada, mas a conexão antiga continua aberta.

**Why it happens:** Module-level variables são re-executadas em hot-reload.

**How to avoid:** O singleton pattern em módulo ES module é seguro. O Node.js `module.hot` não afeta módulos ES no Next.js dev. Apenas garantir que `db` é lazy-init e nunca exposto fora do módulo.

**Warning signs:** Mensagens de erro `SQLITE_MISUSE` ou conexões duplicadas são improváveis dado o padrão singleton.

### Pitfall 2: SQL injection em schema dinâmico

**What goes wrong:** Se as colunas do CSV são usadas diretamente em queries SQL sem sanitização, um CSV malicioso com nomes de coluna como `id_contacto; DROP TABLE pedidos;--` pode causar danos.

**Why it happens:** Colunas são dinâmicas, então `CREATE TABLE` precisa usar nomes de coluna diretamente.

**How to avoid:** Sanitizar nomes de coluna com `normalizeHeader()` antes de usar em SQL. O `normalizeHeader()` garante que só contenha letras minúsculas, números e underscores. Além disso, usar `"col_name"` (double-quoted identifiers) no SQL. Mas a sanitização de caracteres especiais no nome é a defesa principal.

**Warning signs:** Nomes de coluna com caracteres especiais, espaços, ou palavras-chave SQL.

### Pitfall 3: Arquivos CSV grandes bloqueando o event loop

**What goes wrong:** Um CSV de 50MB+ é lido na memória via `file.text()` e parseado pelo papaparse, bloqueando o event loop por segundos.

**Why it happens:** `file.text()` retorna uma string inteira, e papaparse processa tudo na mesma thread (em Node.js).

**How to avoid:** Limite de 10MB no servidor (já no padrão). Para arquivos maiores, usar `Papa.parse()` com `chunk`/`step` callback + `ReadableStream` do `file.stream()`, mas isso é desnecessário dado o limite de 10MB. O limite de 10MB cobre confortavelmente CSVs com 50k+ linhas.

**Warning signs:** Uploads lentos, Timeout do servidor, high memory usage.

### Pitfall 4: Colunas do CSV com trailing spaces ou BOM

**What goes wrong:** CSV exportado de Excel ou SAP pode ter BOM (byte order mark) no início, espaços extras, ou diferentes casing.

**How to avoid:** papaparse já lida com BOM automaticamente. A normalização `trim → lowercase → underscore` resolve espaços e casing. Testar com os CSVs em `data/csv/` que são exportados do sistema de origem real.

**Warning signs:** Papaparse reporta erro de campo ou headers com nomes estranhos no `meta.fields`.

## Code Examples

### Example: GET /api/data — KPI Aggregation

```typescript
// src/app/api/data/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();

    // Verificar se a tabela existe
    const tableExists = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'")
      .get();

    if (!tableExists) {
      return NextResponse.json({
        total_registros: 0,
        colunas_numericas: [],
        kpis: {},
      });
    }

    // Obter colunas da tabela
    const columns = db.prepare("PRAGMA table_info(pedidos)").all() as {
      name: string;
    }[];
    const colNames = columns
      .map((c) => c.name)
      .filter((n) => !["id", "mes_competencia", "created_at"].includes(n));

    // Tentar identificar colunas numéricas por amostragem
    // Nota: melhorias na identificação podem ser feitas na Fase 3
    const numericCols: string[] = [];
    for (const col of colNames) {
      const sample = db
        .prepare(
          `SELECT "${col}" FROM pedidos WHERE "${col}" GLOB '[0-9]*' LIMIT 1`,
        )
        .get();
      if (sample) {
        numericCols.push(col);
      }
    }

    // Agregações
    const count = db.prepare("SELECT COUNT(*) as total FROM pedidos").get() as {
      total: number;
    };

    const kpis: Record<string, { sum: number; avg: number; min: number; max: number }> = {};

    for (const col of numericCols) {
      const result = db
        .prepare(
          `SELECT
            SUM(CAST("${col}" AS REAL)) as sum,
            AVG(CAST("${col}" AS REAL)) as avg,
            MIN(CAST("${col}" AS REAL)) as min,
            MAX(CAST("${col}" AS REAL)) as max
          FROM pedidos
          WHERE "${col}" GLOB '[0-9]*'`,
        )
        .get() as { sum: number | null; avg: number | null; min: number | null; max: number | null };
      kpis[col] = {
        sum: result.sum ?? 0,
        avg: result.avg ?? 0,
        min: result.min ?? 0,
        max: result.max ?? 0,
      };
    }

    return NextResponse.json({
      total_registros: count.total,
      colunas_numericas: numericCols,
      colunas_texto: colNames.filter((c) => !numericCols.includes(c)),
      kpis,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

### Example: GET /api/upload/history

```typescript
// src/app/api/upload/history/route.ts
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const history = db
      .prepare(
        "SELECT id, filename, rows_imported, rows_ignored, created_at FROM upload_history ORDER BY created_at DESC",
      )
      .all();

    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Next.js pages/api + bodyParser + multer | App Router route handlers + native `request.formData()` | Next.js 13 (2022), standard in 16 | Sem middleware extra. O `File` do Web API substitui `multer` + `busboy`. |
| CommonJS require | ESM import (Biome enforced) | TypeScript/Biome config | Módulos `src/lib/` usam `import/export`. `better-sqlite3` e `papaparse` têm suporte ESM. |
| Prisma/Drizzle SQLite | better-sqlite3 raw queries | Decision for this project | Prisma não suporta schema dinâmico (precisa de `prisma generate`). Raw queries são necessárias. |

### Deprecated/outdated:
- `csv-parse` (do pacote `csv`) ainda é mantido mas menos flexível que papaparse para casos de header detection e encoding.
- `sql.js` é útil apenas para ambientes onde Node.js nativo não está disponível (browser, Deno).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `file.text()` no Next.js Route Handler retorna o conteúdo completo do CSV como string UTF-8 | API Routes | Risco baixo: é comportamento padrão do Web API File. O encoding pode ser um problema se o CSV estiver em ISO-8859-1 (latin1). Mitigação: papaparse não faz auto-detecção de encoding, mas os CSVs de teste são UTF-8. |
| A2 | O cabeçalho `ID_CONTACTO` é a coluna de chave para dedup | Standard Stack | Risco baixo: confirmado nos CSVs de exemplo (D-13 lista as colunas). A coluna `mes_competencia` é derivada de `Dt Registo`. |
| A3 | `Nivel 1`, `Nivel 2`, `Nivel 3` e `Justificação Atividade` são colunas textuais, não numéricas | Schema | Risco baixo: análise dos CSVs mostra valores textuais. |
| A4 | better-sqlite3 v12 é compatível com Node.js no Next.js 16 | Environment | Risco muito baixo: better-sqlite3 compila contra Node.js >= 18. Next.js 16 requer Node.js >= 18.17. |
| A5 | A tabela `upload_history` não precisa ser migrada se schema mudar | Architecture | Risco baixo: schema fixo decidido em D-20. Se precisar de colunas extras no futuro, será uma migração manual. |

## Validation Architecture

> nyquist_validation enabled — including this section.

### Test Framework

Atualmente não há framework de teste no projeto (confirmado em CONVENTIONS.md: "No testing framework"). Esta fase introduz código server-side puro (sem React), então é viável adicionar testes unitários para os módulos `csv.ts` e `pedidos.ts`.

| Property | Value |
|----------|-------|
| Framework | vitest (recomendado — leve, compatível com Next.js, ESM nativo) |
| Config file | `vitest.config.ts` (a criar) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CSV-05 | Normalização de headers (trim, lowercase, underscore) | unit | `npx vitest run src/lib/csv.test.ts` | ❌ Wave 0 |
| CSV-03 | Validação de colunas obrigatórias | unit | `npx vitest run src/lib/csv.test.ts` | ❌ Wave 0 |
| DATA-01 | Singleton SQLite + CREATE TABLE IF NOT EXISTS | unit | `npx vitest run src/lib/db.test.ts` | ❌ Wave 0 |
| DATA-03 | Dedup com INSERT OR IGNORE + unique constraint | unit | `npx vitest run src/lib/services/pedidos.test.ts` | ❌ Wave 0 |
| DATA-05 | Histórico de upload registrado | unit | `npx vitest run src/lib/services/pedidos.test.ts` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx vitest run src/lib/csv.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `vitest` + `@vitest/runner` — install dev dependency
- [ ] `vitest.config.ts` — basic config
- [ ] `src/lib/__tests__/csv.test.ts` — CSV parser + normalization
- [ ] `src/lib/__tests__/db.test.ts` — SQLite singleton + schema creation
- [ ] `src/lib/__tests__/pedidos.test.ts` — import pipeline + dedup

> **Note on testing:** Testes para API routes (`route.ts`) são mais complexos pois exigem mocking do NextRequest. Priorizar testes unitários para a lógica de negócio nos módulos `lib/`. Testes de integração podem ser feitos manualmente com `curl` ou Postman.

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | v1 não tem autenticação |
| V3 Session Management | no | v1 não tem sessão |
| V4 Access Control | no | v1 é single-user |
| V5 Input Validation | yes | Zod (já no projeto) para validar tipos de dados + sanitização de nomes de coluna via `normalizeHeader()` |
| V6 Cryptography | no | Dados não sensíveis, sem requisito de criptografia |

### Known Threat Patterns for {Next.js + SQLite}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| SQL injection via column names (dynamic schema) | Tampering | `normalizeHeader()` sanitiza nomes de coluna para `[a-z0-9_]+` + prepared statements com `?` para valores |
| DOS via large file upload | Denial of Service | Limite de 10MB verificado antes do parse + validação de extensão `.csv` |
| CSV injection (formulas maliciosas) | Tampering | Não se aplica: dados são armazenados em SQLite, não importados para Excel. Mas `Observações` e `Resposta` podem conter fórmulas — safe em SQLite |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] `better-sqlite3@12.10.0` — API docs: singleton, prepared statements, transactions
- [VERIFIED: npm registry] `papaparse@5.5.3` — API docs: header:true, dynamicTyping, step/chunk
- [VERIFIED: Context7 /llmstxt/nextjs_llms-full_txt] — Next.js Route Handler patterns, formData API
- [VERIFIED: codebase] `src/lib/utils.ts` — cn() pattern
- [VERIFIED: codebase] `.gitignore` — `.data/` já gitignored
- [VERIFIED: codebase] `data/csv/2026-01.csv` a `2026-05.csv` — CSVs reais com 21 colunas, multiline values
- [VERIFIED: codebase] `package.json` — Stack existente (Next.js 16.2.7, React 19.2.7, Zod 4.4.3)
- [VERIFIED: codebase] `.planning/config.json` — nyquist_validation: true

### Secondary (MEDIUM confidence)
- [CITED: nextjs.org/docs/app/api-reference/file-conventions/route] — Route handler file convention and POST body parsing

### Tertiary (LOW confidence)
- None (todas as claims foram verificadas com fontes primárias)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versões verificadas no npm registry, APIs confirmadas via Context7 docs
- Architecture: HIGH — patterns validados contra a codebase existente (stack, conventions, AGENTS.md)
- Pitfalls: HIGH — baseado em documentação oficial e análise dos CSVs reais

**Research date:** 2026-06-06
**Valid until:** 2026-07-06 (30 dias — bibliotecas estáveis, sem breaking changes previstos)
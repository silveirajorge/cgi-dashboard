# Phase 1: Backend Foundation - Discussion Log

**Date:** 2026-06-06
**Mode:** Default discuss

## Areas Discussed

### 1. Estrutura de Camadas (ARCH-01)
- **Options presented:** Repository Pattern, Service + Repository, Modular simples
- **User selected:** Service + Repository
- **Outcome:** D-01~D-04 — três camadas separadas: db.ts (repo), csv.ts (parse), services/pedidos.ts (business logic)

### 2. Coluna de Data para Dedup
- **Options presented:** Data do upload, Data do CSV, Coluna virtual/calculada
- **User selected:** Coluna virtual/calculada
- **Follow-up:** User explained it's derived from `Dt Registo` — extrai o mês (YYYY-MM) para compor a chave de dedup com `id_contacto`
- **Rationale:** Sistema de origem duplica pedidos dentro do mesmo mês
- **Outcome:** D-05~D-07 — chave composta `(id_contacto, mes_competencia)` com unique constraint

### 3. API /api/data — Retorno
- **Options presented:** Já agregado (KPIs), Dados brutos, Ambos
- **User selected:** Já agregado (KPIs)
- **Outcome:** D-15 — GET /api/data retorna soma, média, min, max das colunas numéricas

### 4. Schema da Tabela pedidos
- **Options presented:** Schema dinâmico, Schema fixo (definir agora), Schema fixo (hardcoded)
- **User selected:** Schema dinâmico
- **Follow-up:** CSV já disponível em data/csv/2026-01.csv com 21 colunas
- **Outcome:** D-08~D-13 — colunas criadas dinamicamente a partir do CSV, com normalização (trim, lowercase, underscore)

## Decisions per Category

| D | Category | Decision |
|---|----------|----------|
| D-01 | Architecture | Service + Repository pattern |
| D-02 | Architecture | Repository in src/lib/db.ts |
| D-03 | Architecture | CSV parsing in src/lib/csv.ts |
| D-04 | Architecture | Service layer in src/lib/services/pedidos.ts |
| D-05 | Dedup | Composite key: id_contacto + mes_competencia |
| D-06 | Dedup | mes_competencia derived from Dt Registo (YYYY-MM) |
| D-07 | Dedup | INSERT OR IGNORE with unique constraint |
| D-08 | Schema | Dynamic — created from first CSV headers |
| D-09 | Schema | Normalized column names (trim, lowercase, underscore) |
| D-10 | Schema | Extra column: mes_competencia (TEXT, YYYY-MM) |
| D-11 | Schema | Unique constraint on (id_contacto, mes_competencia) |
| D-12 | Schema | Extra column: created_at (DATETIME) |
| D-13 | Schema | 21 CSV columns mapped from data/csv/2026-01.csv |
| D-14 | API | POST /api/upload — receive CSV, parse, dedup, return stats |
| D-15 | API | GET /api/data — return pre-aggregated KPIs |
| D-16 | API | GET /api/upload/history — return upload history |
| D-17 | DB | File: .data/cgi.db |
| D-18 | DB | Singleton connection in src/lib/db.ts (lazy init) |
| D-19 | DB | Auto-migration: create tables if not exist |
| D-20 | DB | upload_history table schema |

## Deferred Ideas

None.
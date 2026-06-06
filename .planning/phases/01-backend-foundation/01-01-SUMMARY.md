# Plan 01-01 Summary: Upload CSV → Storage Pipeline

**Phase:** 01 - Backend Foundation
**Plan:** 01-01
**Status:** Complete

## What Was Built

Pipeline completo de upload de CSV: receber arquivo via `POST /api/upload`, parsear com papaparse, normalizar cabeçalhos, validar colunas obrigatórias, armazenar em SQLite com dedup por `(id_contacto, mes_competencia)`, e registrar histórico.

### Key Files Created
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/db.ts` | 76 | Singleton SQLite + migrations + CRUD |
| `src/lib/csv.ts` | 66 | CSV parsing, header normalization, validation |
| `src/lib/services/pedidos.ts` | 79 | Business logic: import, dedup, KPI calc |
| `src/app/api/upload/route.ts` | 48 | POST /api/upload endpoint |
| `vitest.config.ts` | 16 | Test runner config |

### Dependencies Added
- better-sqlite3@12.10.0, papaparse@5.5.3
- @types/better-sqlite3, @types/papaparse, vitest

## Test Results

| Test | Result |
|------|--------|
| Upload `2026-01.csv` | 36,815 rows imported |
| Duplicate upload | 0 imported, 36,815 ignored (dedup ✓) |
| Upload `2026-02.csv` | 31,572 rows imported (cumulative ✓) |
| CSV without `id_contacto` | Error returned ✓ |
| File size limit | 50MB |
| `.data/cgi.db` created | 45MB |
| Dashboard loads | HTTP 200 ✓ |

## Deviations

- File size limit increased from 10MB to 50MB to accommodate real CSVs (~19MB each)
- vitest version resolved to latest (3.1.6 was not available)

## Files Modified
- `package.json` — added deps + test script
- `.gitignore` — fixed to track `data/csv/` while ignoring rest of `data/`
- `vitest.config.ts` — new
- `src/lib/db.ts` — new
- `src/lib/csv.ts` — new
- `src/lib/services/pedidos.ts` — new
- `src/app/api/upload/route.ts` — new
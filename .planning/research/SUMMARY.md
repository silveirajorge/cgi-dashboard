---
focus: summary
domain: csv-kpi-dashboard
generated: 2026-06-06
---

# SUMMARY.md — Research Synthesis

## Stack
- Add **better-sqlite3** for SQLite + **papaparse** for CSV parsing
- Use **Next.js API Routes** for file upload and data queries
- Keep existing shadcn/ui + Recharts for visualization

## Table Stakes
- CSV upload (drag & drop), parsing with header detection, SQLite storage with dedup
- Auto KPI generation (sum/avg/count of numeric columns)
- Data table + KPI card display on dashboard

## Architecture
- API layer: `/api/upload` (POST) + `/api/data` (GET)
- DB layer: `lib/db.ts` singleton + `lib/csv.ts` parsing
- Frontend: new `/dashboard/kpi` page with upload form + KPI cards + table
- DB file at `.data/dashboard.db`

## Watch Out For
- CSV encoding (strip BOM, normalize headers)
- SQLite persistence in Next.js (use singleton, persist to disk)
- Dedup strategy (hash entire row)
- File size limits (10MB default cap)
- SQLite is local-only (not serverless-compatible)
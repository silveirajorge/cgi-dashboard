---
focus: stack
domain: csv-kpi-dashboard
generated: 2026-06-06
---

# STACK.md — Stack Research for CSV KPI Dashboard

## Recommended Additions to Existing Stack

### CSV Parsing
- **papaparse** — best CSV parser for Node.js/browser, handles headers, quotes, encoding
- **Alternative**: csv-parse (from `csv` package) — more Node.js native

### SQLite
- **better-sqlite3** — synchronous API, fastest, works with Next.js server-side
- **Alternative**: bun:sqlite (if using Bun), sql.js (WebAssembly, runs in browser)

### File Upload
- **Next.js API Routes** (built-in) — handle multipart/form-data file upload
- **multer** not needed — Next.js App Router handles file parsing via native Request API

### Schema Detection
- **Zod** (already in project) — validate parsed CSV rows
- **TypeScript** — typed row interface for the static CSV format

## Versions Recommendation
| Library | Version | Rationale |
|---------|---------|-----------|
| better-sqlite3 | ^11.x | Latest, excellent SQLite bindings |
| @types/better-sqlite3 | ^7.x | TypeScript definitions |
| papaparse | ^5.x | Battle-tested, 30M+ weekly downloads |

## What NOT to Use
- **Prisma/Supabase** — overkill for local SQLite, adds complexity
- **Drizzle ORM** — nice but unnecessary for simple schema
- **Axios** — not needed, native fetch for any future API calls
- **Auth libraries** — out of scope for v1

## Integration Points
- API routes in `src/app/api/upload/route.ts` and `src/app/api/data/route.ts`
- SQLite database file stored at project root (`.data/dashboard.db`)
- Pages use existing dashboard routes (`/dashboard/default` → `/dashboard/kpi`)

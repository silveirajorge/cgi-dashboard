---
focus: architecture
domain: csv-kpi-dashboard
generated: 2026-06-06
---

# ARCHITECTURE.md — Architecture Research

## Component Boundaries

```
Client (Browser)                        Server (Next.js)
┌─────────────────────┐     ┌───────────────────────────┐
│ Upload Form        │ HTTP │ API Route: /api/upload    │
│ (drag & drop +     │ ───→ │ - papaparse CSV           │
│  file picker)      │      │ - validate with Zod       │
│                     │      │ - INSERT into SQLite      │
│ Dashboard Page     │ HTTP │ ← respond with stats      │
│ (KPI cards +       │ ←─── │                           │
│  data table)       │      │ API Route: /api/data      │
│                     │      │ - SELECT from SQLite      │
│                     │      │ - aggregate KPIs          │
│                     │      │ - return JSON             │
└─────────────────────┘      └───────────────────────────┘
                                     │
                            ┌────────┴────────┐
                            │   SQLite File    │
                            │ .data/dashboard  │
                            └─────────────────┘
```

## Data Flow
1. **Upload**: User selects CSV → client sends via FormData → API parses with papaparse → Zod validates each row → better-sqlite3 inserts with dedup
2. **Query**: Dashboard page fetches `/api/data` → API aggregates (SUM, AVG, COUNT per numeric column) → returns JSON → client renders cards + table
3. **Dedup Strategy**: `INSERT OR IGNORE` based on hash of all columns, or a unique constraint on specific columns

## Build Order
1. **Phase 1**: SQLite setup + API route + CSV upload endpoint (backend foundation)
2. **Phase 2**: Upload UI (form + drag & drop)  
3. **Phase 3**: KPI display + data table (frontend visualization)

## Directory Integration
```
src/
├── app/api/
│   ├── upload/route.ts       # POST handler for CSV upload
│   └── data/route.ts         # GET handler for KPI data
├── lib/
│   ├── db.ts                 # SQLite connection singleton
│   └── csv.ts                # CSV parsing + validation logic
├── app/(main)/dashboard/
│   └── kpi/                  # New KPI dashboard page
│       ├── page.tsx          # Server component fetching data
│       └── _components/      # Upload form, KPI cards, data table
.data/
└── dashboard.db              # SQLite database file (gitignored)
```

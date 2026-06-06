---
focus: features
domain: csv-kpi-dashboard
generated: 2026-06-06
---

# FEATURES.md — Features Research for CSV KPI Dashboard

## Table Stakes (Must Have)
| Feature | Complexity | Notes |
|---------|-----------|-------|
| CSV file upload via UI | Medium | Drag & drop or file picker |
| CSV parsing with header detection | Low | papaparse handles this |
| SQLite storage with dedup | Medium | INSERT OR IGNORE on unique rows |
| Auto KPI generation (sum, avg, count) | Medium | Detect numeric columns |
| KPI card display | Low | Reuse existing metric-cards pattern |
| Data table view | Low | Existing @tanstack/react-table |
| Cumulative uploads | Medium | Append mode with dedup check |

## Differentiators
| Feature | Complexity | Notes |
|---------|-----------|-------|
| Automatic chart selection | Medium | Line for trends, bar for comparison, etc. |
| Column-order agnostic parsing | Low | Match by header name, not position |
| Visual customization preserved | Low | Theme/layout controls already work |

## Anti-Features (Deliberately NOT Building)
- Authentication system — open dashboard for v1
- Multi-user data isolation — single-user scope
- CSV schema configuration — auto-detect from headers
- Data export — defer to v2
- Real-time updates — manual refresh or re-upload

## Data Flow
```
User uploads CSV → API route parses → SQLite INSERT (dedup) → 
→ API route returns stats → Dashboard renders KPIs + table
```

## Dependencies Between Features
- Upload → Parse → Store → Query → Display (sequential pipeline)
- Each step depends on the previous
- v1 covers the full pipeline end-to-end

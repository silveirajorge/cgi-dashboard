---
focus: pitfalls
domain: csv-kpi-dashboard
generated: 2026-06-06
---

# PITFALLS.md — Common Mistakes & Prevention

## 1. CSV Encoding Issues
- **Warning**: User uploads CSV with BOM, non-UTF8, or different line endings
- **Prevention**: Use papaparse with encoding detection, strip BOM automatically
- **Phase**: 1 (parsing)

## 2. SQLite File Permissions in Next.js
- **Warning**: better-sqlite3 needs write access to the database file; Next.js dev server may restart and lose in-memory DB
- **Prevention**: Persist DB to `.data/` directory (not `node_modules` or temp), use singleton pattern for connection
- **Phase**: 1 (DB setup)

## 3. Large CSV Files
- **Warning**: 100MB+ CSV will block the event loop in better-sqlite3
- **Prevention**: Set file size limit (10MB default), stream parsing with papaparse `chunk` option
- **Phase**: 1 (upload)

## 4. Dedup Logic Fragility
- **Warning**: If dedup is by entire row, same data re-uploaded drops nothing; if by partial key, valid updates may be lost
- **Prevention**: Use MD5 hash of normalized JSON row as unique key for simple dedup
- **Phase**: 1 (storage)

## 5. Column Name Mismatch
- **Warning**: CSV header names may have trailing spaces, different casing, or special chars
- **Prevention**: Normalize headers (trim, lowercase, replace spaces with underscores) before matching
- **Phase**: 1 (parsing)

## 6. SQLite in Serverless / Production
- **Warning**: better-sqlite3 doesn't work in serverless environments (Vercel, Netlify)
- **Prevention**: Document that this is local-only; optionally abstract DB layer for future migration to PostgreSQL/Supabase
- **Phase**: 1 (architecture)

## 7. No Feedback on Upload
- **Warning**: User uploads and sees nothing — thinks it failed
- **Prevention**: Show upload progress (sonner toast), update KPI cards automatically after upload
- **Phase**: 2 (upload UI)

## 8. Mixed Data Types in Column
- **Warning**: CSV column may have numbers + text + empty values in same column
- **Prevention**: Coerce empty to null, treat non-numeric as 0 or skip in KPI calc, log warnings
- **Phase**: 1 (parsing)

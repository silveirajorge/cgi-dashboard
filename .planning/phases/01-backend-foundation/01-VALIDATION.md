---
phase: 1
slug: backend-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-06
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | none (no test framework installed) |
| **Config file** | none |
| **Quick run command** | `npm run build` (type check + compile) |
| **Full suite command** | `npm run build && npm run check` (Biome lint + build) |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run check`
- **Before `/gsd-verify-work`:** Build must pass, no regressions on existing pages
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | Status |
|---------|------|------|-------------|-----------|-------------------|--------|
| 01-01 | 01 | 1 | DATA-01 | manual | `ls .data/cgi.db` | ⬜ pending |
| 01-02 | 01 | 1 | CSV-03, CSV-05 | manual | `curl POST /api/upload --form file=@data/csv/2026-01.csv` | ⬜ pending |
| 01-03 | 01 | 1 | DATA-02, DATA-03 | manual | `curl GET /api/data` | ⬜ pending |

---

## Wave 0 Requirements

No Wave 0 — existing infrastructure covers type checking and linting.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| CSV parsing and storage | DATA-01~04 | No test framework | Send CSV via curl, verify `.data/cgi.db` created, query data |
| API response | CSV-03, CSV-05 | No test framework | Call `/api/upload` and `/api/data`, verify HTTP 200 + correct JSON |
| Existing UI preserved | CUST-01 | No test framework | Load dashboard pages, verify no 500 errors |

---

## Validation Sign-Off

- [ ] All tasks have verification criteria
- [ ] `.data/cgi.db` created and queryable
- [ ] API routes respond with correct HTTP codes
- [ ] Existing dashboard pages load without errors
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending

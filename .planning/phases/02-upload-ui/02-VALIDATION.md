---
phase: 2
slug: upload-ui
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-06
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (installed Phase 1) |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run check` |

---

## Sampling Rate

- **After every task commit:** `npm run build`
- **After every plan wave:** `npm run build && npm run check`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Upload page loads | CSV-01, CSV-02 | E2E visual | Open `/dashboard/upload` — page renders with upload area |
| Drag & drop works | CSV-02 | E2E interaction | Drag CSV onto area — upload fires automatically |
| Success toast | CSV-04 | Visual feedback | Upload CSV — toast shows imported/ignored counts |
| Error toast on invalid file | CSV-04 | Visual feedback | Try non-CSV file — error toast shown |
| Sidebar navigation | CSV-01 | Navigation | Click "Upload CSV" in sidebar — navigates to page |

---

## Validation Sign-Off

- [ ] Upload page renders without errors
- [ ] Click upload works (CSV-01)
- [ ] Drag & drop works (CSV-02)
- [ ] Success toast with stats (CSV-04)
- [ ] Error toast on invalid file
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
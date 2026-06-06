---
focus: concerns
generated: 2026-06-06
scope: full-repo
---

# CONCERNS.md — Technical Debt, Risks & Improvements

## Critical Issues

### 1. No Test Coverage
**Severity: HIGH**
- Zero test files, no test framework installed
- No quality verification beyond static analysis (Biome) and TypeScript compilation
- Risk of regressions during refactoring, especially in interactive client components

### 2. Large Static Data Files
**Severity: MEDIUM**
- `src/styles/flag-icons/flags.css` — 1068 lines of CSS
- `src/app/(main)/dashboard/logistics/_components/shipment-data.ts` — 1001 lines of mock data
- `src/app/(main)/mail/_components/data.tsx` — 481 lines of mock data
- These files impact loading times and maintainability; no lazy loading mechanism

### 3. No Backend Integration Points Implemented
**Severity: MEDIUM**
- Auth pages (v1, v2) are presentational only — no actual authentication
- Proxy middleware is disabled (`src/proxy.disabled.ts`)
- All data is static/mock — no API routes, database, or external services
- This is acceptable for a starter template, but the codebase cannot be deployed as a real application without significant backend work

## Moderate Concerns

### 4. Large UI Components
- `src/components/ui/sidebar.tsx` — 702 lines (complex component with many variants)
- `src/components/ui/chart.tsx` — 373 lines (Recharts wrapper with many configuration options)
- These could benefit from splitting into smaller sub-components

### 5. Feature Duplication (Legacy Routes)
- Four V1 dashboard variants exist under `(legacy)/` route group
- V1 dashboards appear to be previous versions of current dashboards (Default V1, CRM V1, Finance V1, Analytics V1)
- Adds unnecessary bundle size and maintenance burden if V1 is no longer needed

### 6. No Environment Configuration
- No `.env` files, no `NEXT_PUBLIC_*` variables
- No feature flags, no API URLs configured
- Adding real services will require establishing environment variable conventions

### 7. Minimal Custom Hooks
- Only one custom hook: `src/hooks/use-mobile.ts`
- Client-side logic (localStorage, cookies) is handled via imperative utilities rather than hooks
- Could benefit from `useLocalStorage`, `useCookie`, `usePreferences` hooks

## Minor Concerns

### 8. Dead / Disabled Code
- `src/proxy.disabled.ts` — proxy middleware is disabled (intentional, scaffolded)
- `src/data/users.ts` — only 2 hardcoded users
- Several pages are `coming-soon` placeholders (Chat, Calendar, Kanban, Invoice, Others)

### 9. No Loading States
- No `loading.tsx` files for streaming SSR
- No Suspense boundaries for async components
- Large data files loaded synchronously

### 10. Single process.env Reference
- `src/lib/local-storage.client.ts:7` uses `process.env.NODE_ENV` — needs to be prefixed with `NEXT_PUBLIC_` if used client-side (currently works because it's only in a dev warning check)

## Security Observations
- No secrets exposed in codebase
- No real authentication implemented (cannot comment on auth security)
- No API routes or database access (no injection vectors)
- Biome security: `noImportCycles: "error"` prevents circular dependency chains

## Performance Observations
- React Compiler enabled (automatic memoization)
- No `useMemo`/`useCallback` usage found (compiler handles this)
- All icons from `lucide-react` (tree-shakeable)
- No image optimization strategy — no `next/image` usage found (`noImgElement: "warn"` in Biome)
- Large CSS file (flags.css) loaded globally — consider dynamic import

## Recommendations
1. **Add Vitest** + React Testing Library for component testing
2. **Implement Playwright** for E2E dashboard testing
3. **Remove legacy V1 routes** or extract them to a separate branch
4. **Add Suspense boundaries** for async data loading
5. **Split large files** (sidebar, chart, shipment-data, flags.css)
6. **Establish env var conventions** before adding any backend integration
7. **Add ErrorBoundary** component for graceful error handling in client components
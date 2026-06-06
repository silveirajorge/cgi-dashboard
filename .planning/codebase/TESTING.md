---
focus: quality
generated: 2026-06-06
scope: full-repo
---

# TESTING.md — Test Strategy & Coverage

## Current State
**No test framework is installed or configured.**

The project has zero test files — no `.test.ts`, `.spec.ts`, or `__tests__/` directories found anywhere in the repository.

## Dependencies
- **No testing libraries** in `package.json` (no Vitest, Jest, Playwright, Cypress, Testing Library, etc.)
- **No test scripts** in `package.json` scripts section
- **No test configuration** files (no `vitest.config.ts`, `jest.config.ts`, etc.)

## CI/CD
- **No GitHub Actions workflows** found (`.github/` is in Biome's `ignoreUnknown` list)
- **No CI configuration** of any kind
- Husky + lint-staged is the only pre-commit quality gate (runs `biome check --write`)

## Quality Verification
- **Biome lint** (`npm run lint` / `npm run check`) — static analysis only
- **TypeScript compilation** (`next build` / `tsc`) — type checking
- **Next.js build** (`npm run build`) — compilation + build-time validation
- **lint-staged** — runs Biome on staged `*.{js,ts,jsx,tsx}` files pre-commit

## Recommendations
If tests are needed, the project is well-positioned for:
- **Vitest** — fast, Vite-native test runner (compatible with Next.js)
- **React Testing Library** — component testing for both server and client components
- **Playwright** — E2E testing for dashboard interactions
- **Storybook** — visual component development and testing (especially for 55+ UI primitives)

## Test Opportunities
The following areas would benefit most from testing:
1. **Server actions** (`src/server/server-actions.ts`) — cookie read/write logic
2. **Zustand store** (`src/stores/preferences/`) — preference state management
3. **Utility functions** (`src/lib/utils.ts`) — `cn()`, `formatCurrency()`, `getInitials()`
4. **Zod schemas** — table validation schemas
5. **Theme boot script** (`src/scripts/theme-boot.tsx`) — DOM manipulation
6. **Key interactive components** — sidebar, search dialog, theme switcher
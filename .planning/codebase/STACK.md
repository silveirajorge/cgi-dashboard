---
focus: tech
generated: 2026-06-06
scope: full-repo
---

# STACK.md — Technology Stack

## Languages & Runtime
- **TypeScript 5.9** (strict mode enabled) — all source code
- **Node.js** — runtime (Next.js SSR/SSG)
- **ES2017** target, `bundler` module resolution
- **React JSX** transform (`react-jsx`)

## Framework
- **Next.js 16.2.7** with App Router
  - React Server Components (RSC) enabled via `components.json`
  - React Compiler enabled (`next.config.mjs`)
  - Production console removal via `compiler.removeConsole`
  - Middleware/proxy scaffold available at `src/proxy.disabled.ts` (currently disabled)
- **React 19.2.7** (server + client components)
- **React DOM 19.2.3**

## Styling & UI
- **Tailwind CSS 4.1.5** with `@tailwindcss/postcss`
- **tw-animate-css 1.4.0** — animation utilities
- **shadcn/ui** (style: `radix-nova`) — component library foundation
  - `@base-ui/react 1.5.0` — underlying headless primitives
  - `radix-ui 1.4.3` — additional headless primitives
  - 55+ UI components in `src/components/ui/` (sidebar, chart, dialog, table, etc.)
- **lucide-react 1.17.0** — icon library
- **simple-icons 16.22.0** — brand icons (GitHub icon used in navbar)
- **CSS variables** for theming (`globals.css`), 3 theme presets (brutalist, soft-pop, tangerine)
- **CSS Modules** used for flag icons (`src/styles/flag-icons/flags.css`)

## State Management
- **Zustand 5.0.14** — preferences store (`src/stores/preferences/`)
- **React Server Components** — server state passed via props to client boundaries
- **Cookies** — layout preferences persisted server-side via `next/headers` + `server-actions.ts`

## Forms & Validation
- **react-hook-form 7.77.0** — form management
- **@hookform/resolvers 5.4.0** — schema validation integration
- **Zod 4.4.3** — schema validation

## Data Display & Charts
- **@tanstack/react-table 8.21.3** — table components
- **recharts 3.8.0** — charts (bar, line, area, pie, radial)
- **d3-geo 3.1.1** — geo/map projections
- **topojson-client 3.1.0** — TopoJSON to GeoJSON conversion
- **date-fns 4.4.0** — date formatting

## Drag & Drop
- **@dnd-kit/core 6.3.1** — DnD primitives
- **@dnd-kit/sortable 10.0.0** — sortable lists
- **@dnd-kit/modifiers 9.0.0** — DnD modifiers

## UI Utilities
- **class-variance-authority 0.7.1** — component variant creation
- **clsx 2.1.1** + **tailwind-merge 3.6.0** — class name merging
- **cmdk 1.1.1** — command menu (search dialog)
- **embla-carousel-react 8.6.0** — carousel
- **input-otp 1.4.2** — OTP input
- **react-resizable-panels 4.11.2** — resizable panels
- **react-day-picker 9.14.0** — date picker
- **sonner 2.0.7** — toast notifications
- **vaul 1.1.2** — drawer component
- **geist 1.7.2** — Geist font

## Tooling & Dev Experience
- **Biome 2.4.16** — linter + formatter (replaces ESLint + Prettier)
  - Strict rules: no commonjs, no undeclared variables, sorted classes, self-closing elements
  - Import organization: `react` → `next` → packages → `@/` alias → relative
  - VCS integration: respects `.gitignore`
  - Formatter: 2-space indent, 120 char width, LF line endings
- **TypeScript 5.9** — strict mode, `bundler` resolution
- **Husky 9.1.7** — git hooks
- **lint-staged 16.4.0** — pre-commit linting (Biome on staged `*.ts*` files)
- **ts-node 10.9.2** — running scripts (e.g., theme presets generation)
- **PostCSS 8.5.15** with `@tailwindcss/postcss`

## Scripts
- `src/scripts/generate-theme-presets.ts` — generates CSS theme preset files
- `src/scripts/theme-boot.tsx` — inline script to apply theme/layout on page load (no flicker)

## Path Aliases (`tsconfig.json`)
```
@/* -> ./src/*
```
Aliases in `components.json`: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`
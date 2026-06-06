<!-- GSD:project-start source:PROJECT.md -->
## Project

**CSV KPI Dashboard**

Um dashboard administrativo para upload diário de arquivos CSV, com geração automática de KPIs e armazenamento em banco SQLite local. Construído sobre o template Studio Admin, mantendo todo o sistema de personalização visual (tema, layout, sidebar).

**Core Value:** Upload de CSV diário → dados armazenados com dedup → KPIs gerados automaticamente → visualização no dashboard.

### Constraints

- **Tech Stack**: Manter Next.js 16 + React 19 + shadcn/ui + Tailwind CSS 4 (stack existente)
- **Database**: SQLite local (sem necessidade de servidor externo)
- **Visual**: Preservar todo o sistema de personalização (temas, layouts, sidebar)
- **Dados**: CSV cumulativo com dedup — mesma chave não pode gerar duplicatas
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages & Runtime
- **TypeScript 5.9** (strict mode enabled) — all source code
- **Node.js** — runtime (Next.js SSR/SSG)
- **ES2017** target, `bundler` module resolution
- **React JSX** transform (`react-jsx`)
## Framework
- **Next.js 16.2.7** with App Router
- **React 19.2.7** (server + client components)
- **React DOM 19.2.3**
## Styling & UI
- **Tailwind CSS 4.1.5** with `@tailwindcss/postcss`
- **tw-animate-css 1.4.0** — animation utilities
- **shadcn/ui** (style: `radix-nova`) — component library foundation
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
- **TypeScript 5.9** — strict mode, `bundler` resolution
- **Husky 9.1.7** — git hooks
- **lint-staged 16.4.0** — pre-commit linting (Biome on staged `*.ts*` files)
- **ts-node 10.9.2** — running scripts (e.g., theme presets generation)
- **PostCSS 8.5.15** with `@tailwindcss/postcss`
## Scripts
- `src/scripts/generate-theme-presets.ts` — generates CSS theme preset files
- `src/scripts/theme-boot.tsx` — inline script to apply theme/layout on page load (no flicker)
## Path Aliases (`tsconfig.json`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language & TypeScript Strictness
- **Strict mode** enabled in `tsconfig.json` — full `strict: true`
- **No `any` types** found in the codebase — type safety enforced via Zod schemas, discriminated unions, and explicit interfaces
- **No CommonJS** — Biome rule `noCommonJs: "error"` enforces ESM-only
- **Biome 2** replaces ESLint + Prettier entirely
## Code Formatting (Biome)
- 2-space indentation, 120 character line width
- LF line endings
- Double quotes, semicolons always, trailing commas
- Arrow parentheses always, bracket spacing
- Self-closing JSX elements enforced (`useSelfClosingElements: "error"`)
## Import Organization (Biome)
## Component Patterns
### Server Components (default)
- Used for pages, layouts, and data-fetching containers
- Can `await` cookies, server actions, and promises directly
- File: `src/app/(main)/dashboard/default/page.tsx`
### Client Components (`"use client"`)
- Used for any interactive elements (forms, buttons, charts, tables)
- Must be leaf components in the component tree
- 59 client components in the dashboard section
- File: `src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx`
### Co-located Feature Components
- Each route has a `_components/` directory for private components
- Shared components live in `src/components/`
- Table pattern: `columns.tsx` + `schema.ts` + `table.tsx` + `data.ts` per table
## State Management Pattern
- **Zustand** for global preferences state (`src/stores/preferences/`)
- **Server actions** (`"use server"`) for cookie-based persistence
- **Client-side storage** (`localStorage`, client cookies) as fallback
- Provider pattern via `PreferencesStoreProvider`
- No prop drilling — context + Zustand handles preference propagation
## Styling Patterns
- **Tailwind CSS v4 classes** exclusively — no inline styles except dynamic CSS custom properties
- **`cn()` utility** (`clsx` + `tailwind-merge`) for conditional class merging
- **CSS variables** for theming — `--background`, `--foreground`, `--primary`, etc.
- **Data attributes** for theme/layout state — `data-theme-mode`, `data-theme-preset`, `data-content-layout`, etc.
- **Custom CSS** only in `globals.css`, theme presets, and `flags.css`
## Error Handling
- **Biome rule `noFloatingPromises: "error"`** — all promises must be handled
- **Biome rule `noMisusedPromises: "error"`** — prevents common async mistakes
- **Next.js not-found** via catch-all route `[...not-found]/page.tsx`
- **Unauthorized page** at `src/app/(main)/unauthorized/page.tsx`
- **No try/catch** patterns found — minimal error boundaries
- **No React ErrorBoundary component** implemented
## File & Folder Conventions
| Convention | Example |
|---|---|
| UI primitives | `src/components/ui/button.tsx` |
| Feature components | `src/app/(main)/dashboard/ecommerce/_components/kpi-strip.tsx` |
| Data fixtures | `src/data/users.ts` |
| Config | `src/config/app-config.ts` |
| Server actions | `src/server/server-actions.ts` |
| Stores | `src/stores/preferences/preferences-store.ts` |
| Hooks | `src/hooks/use-mobile.ts` |
| Utilities | `src/lib/utils.ts` |
| Scripts | `src/scripts/generate-theme-presets.ts` |
## Validation Pattern
- **Zod** for runtime validation
- Schemas co-located with table components (e.g., `recent-orders-table/schema.ts`)
- Used with `react-hook-form` via `@hookform/resolvers`
## No Pattern Found
- No CSS Modules (except legacy `flags.css`)
- No styled-components / CSS-in-JS
- No testing framework
- No Storybook stories
- No barrel exports (`index.ts`)
- No custom hooks beyond `use-mobile.ts`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Architectural Pattern
- **Server Components** (default in App Router) handle layout, data fetching, and page shells
- **Client Components** (`"use client"`) handle interactivity, state, and browser APIs
- 59 client components identified in dashboard; all page layouts are server components
## Layers
### 1. App Layer (`src/app/`)
- `(external)/` — public landing page (redirects to `/dashboard/default`)
- `(main)/` — authenticated dashboard + auth pages
### 2. Component Layer (`src/components/`)
- `ui/` — 55 shadcn/ui primitives (button, dialog, table, sidebar, chart, etc.)
- `date-range-picker.tsx`, `simple-icon.tsx` — app-specific components
### 3. Feature Layer (`src/app/(main)/dashboard/*/_components/`)
- Page-specific widgets and cards
- Table sub-directories with `columns.tsx`, `schema.ts`, `table.tsx`, `data.ts`
### 4. Data Layer (`src/data/`, `src/config/`)
- `src/data/users.ts` — static mock data
- `src/config/app-config.ts` — app metadata (name, version, meta tags)
### 5. State Layer (`src/stores/`)
- Zustand store for user preferences (theme, layout, font)
- Initialized via `PreferencesStoreProvider` in root layout
- Preferences persisted server-side via cookies (`src/server/server-actions.ts`)
### 6. Utility Layer (`src/lib/`)
- `utils.ts` — `cn()` class merge, `formatCurrency()`, `getInitials()`
- `preferences/` — layout/theme configuration, cookie/localStorage storage
- `fonts/registry.ts` — font CSS variable registration
- `cookie.client.ts`, `local-storage.client.ts` — client-side storage helpers
### 7. Server Layer (`src/server/`)
- `server-actions.ts` — `"use server"` actions for cookie read/write
- Used by dashboard layout to persist sidebar state and layout preferences
## Data Flow
```
```
## Key Design Decisions
## Routing Structure
```
```
## Entry Points
- **Root layout**: `src/app/layout.tsx` — ThemeBootScript, TooltipProvider, PreferencesStoreProvider, Toaster
- **Dashboard layout**: `src/app/(main)/dashboard/layout.tsx` — Sidebar, header, search, theme switcher, account switcher
- **App config**: `src/config/app-config.ts` — name, version, meta tags
- **Sidebar navigation**: `src/navigation/sidebar/sidebar-items.ts` — 4 nav groups, 20+ items
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

---
focus: arch
generated: 2026-06-06
scope: full-repo
---

# ARCHITECTURE.md — System Design & Patterns

## Architectural Pattern
**Next.js App Router (RSC-first) with Server Components and Client Component islands.**

The project follows a hybrid Server/Client Component architecture:
- **Server Components** (default in App Router) handle layout, data fetching, and page shells
- **Client Components** (`"use client"`) handle interactivity, state, and browser APIs
- 59 client components identified in dashboard; all page layouts are server components

## Layers

### 1. App Layer (`src/app/`)
Route segments defined by directory structure. Two route groups:
- `(external)/` — public landing page (redirects to `/dashboard/default`)
- `(main)/` — authenticated dashboard + auth pages

### 2. Component Layer (`src/components/`)
- `ui/` — 55 shadcn/ui primitives (button, dialog, table, sidebar, chart, etc.)
- `date-range-picker.tsx`, `simple-icon.tsx` — app-specific components

### 3. Feature Layer (`src/app/(main)/dashboard/*/_components/`)
Co-located feature components within each route directory. Each dashboard section (e-commerce, finance, analytics, etc.) has its own `_components/` folder with:
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
Server Component (layout.tsx)
  ├── reads cookies (sidebar_state, preferences)
  ├── calls getPreference() server action
  └── passes props to AppSidebar (client)
       └── user interaction → server action → cookie update

Client Components
  ├── Zustand store (preferences)
  ├── Local storage (client-side fallback)
  └── Cookies (server-side persistence)
```

## Key Design Decisions

1. **CSS variable theming** — 3 theme presets (brutalist, soft-pop, tangerine) override CSS variables via `data-theme-preset` attribute
2. **No SSR for preferences** — `ThemeBootScript` inline script prevents flicker
3. **Content layouts** — `data-content-layout` supports default/centered modes; `data-content-padding="false"` allows full-bleed pages
4. **Sidebar variants** — `inset`, `sidebar`, `floating` variants with `icon`/`full` collapsible modes
5. **React Compiler enabled** — automatic memoization

## Routing Structure
```
/                          → redirect → /dashboard/default
/dashboard/default        → Default dashboard (metric cards, performance, subscribers)
/dashboard/crm            → CRM dashboard (opportunities, pipeline, tasks)
/dashboard/finance        → Finance dashboard (KPIs, wallet, transactions)
/dashboard/analytics      → Analytics dashboard (realtime, traffic, top pages)
/dashboard/ecommerce      → E-commerce dashboard (traffic, orders, products, reviews)
/dashboard/academy        → Academy dashboard (schedule, events, assignments)
/dashboard/logistics      → Logistics dashboard (shipments, routes, details)
/dashboard/productivity   → Productivity dashboard (tasks, calendar, projects)
/dashboard/mail           → Email client UI
/dashboard/users          → Users management table
/dashboard/roles          → Roles management table
/dashboard/[...not-found] → Catch-all 404
/auth/v1/*                → Auth v1 (login/register)
/auth/v2/*                → Auth v2 (login/register with layout)
/unauthorized             → Unauthorized page

Legacy routes (under `(legacy)` group):
/dashboard/default-v1, /dashboard/crm-v1, /dashboard/finance-v1, /dashboard/analytics-v1
```

## Entry Points
- **Root layout**: `src/app/layout.tsx` — ThemeBootScript, TooltipProvider, PreferencesStoreProvider, Toaster
- **Dashboard layout**: `src/app/(main)/dashboard/layout.tsx` — Sidebar, header, search, theme switcher, account switcher
- **App config**: `src/config/app-config.ts` — name, version, meta tags
- **Sidebar navigation**: `src/navigation/sidebar/sidebar-items.ts` — 4 nav groups, 20+ items
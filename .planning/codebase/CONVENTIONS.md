---
focus: quality
generated: 2026-06-06
scope: full-repo
---

# CONVENTIONS.md — Code Style & Patterns

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
```
1. react, react/**
2. (blank line)
3. next/**
4. (blank line)
5. Third-party packages
6. (blank line)
7. @/ alias imports
8. (blank line)
9. Relative imports
```

## Component Patterns

### Server Components (default)
- Used for pages, layouts, and data-fetching containers
- Can `await` cookies, server actions, and promises directly
- File: `src/app/(main)/dashboard/default/page.tsx`

```tsx
export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const cookieStore = await cookies();
  // ... server-side logic
}
```

### Client Components (`"use client"`)
- Used for any interactive elements (forms, buttons, charts, tables)
- Must be leaf components in the component tree
- 59 client components in the dashboard section
- File: `src/app/(main)/dashboard/_components/sidebar/app-sidebar.tsx`

```tsx
"use client";

import { Sidebar, SidebarContent } from "@/components/ui/sidebar";
```

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
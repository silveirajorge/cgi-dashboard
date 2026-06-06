---
focus: arch
generated: 2026-06-06
scope: full-repo
---

# STRUCTURE.md — Directory Layout & Organization

## Top-Level Structure
```
/
├── src/                    # Application source
├── .husky/                 # Git hooks (lint-staged pre-commit)
├── .next/                  # Next.js build output (gitignored)
├── node_modules/           # Dependencies (gitignored)
├── package.json            # v2.2.0, private
├── next.config.mjs         # Next.js config
├── tsconfig.json           # TypeScript strict config
├── biome.json              # Biome linter + formatter (2.4.16)
├── components.json         # shadcn/ui configuration
├── postcss.config.mjs      # PostCSS with @tailwindcss/postcss
└── tsconfig.scripts.json   # Separate TS config for scripts (ts-node)
```

## `src/` Directory
```
src/
├── app/                          # Next.js App Router pages
│   ├── globals.css               # Global styles, Tailwind, theme presets
│   ├── layout.tsx                # Root layout (providers, fonts, meta)
│   ├── not-found.tsx             # Global 404 page
│   ├── (external)/               # Public route group
│   │   └── page.tsx              # Homepage → redirect /dashboard/default
│   └── (main)/                   # Authenticated route group
│       ├── auth/                 # Auth pages (v1, v2 login/register)
│       │   ├── _components/      # Shared auth forms
│       │   ├── v1/               # Auth v1 pages
│       │   └── v2/               # Auth v2 pages (with layout)
│       ├── dashboard/            # Dashboard routes
│       │   ├── layout.tsx        # Dashboard shell (sidebar, header)
│       │   ├── page.tsx          # /dashboard → redirect /dashboard/default
│       │   ├── _components/      # Shared sidebar components
│       │   ├── default/          # Default dashboard
│       │   ├── crm/              # CRM dashboard
│       │   ├── finance/          # Finance dashboard
│       │   ├── analytics/        # Analytics dashboard
│       │   ├── ecommerce/        # E-commerce dashboard
│       │   ├── academy/          # Academy dashboard
│       │   ├── logistics/        # Logistics dashboard
│       │   ├── productivity/     # Productivity dashboard
│       │   ├── mail/             # Email client UI
│       │   ├── users/            # Users CRUD table
│       │   ├── roles/            # Roles CRUD table
│       │   ├── coming-soon/      # Placeholder for future pages
│       │   ├── (legacy)/         # V1 dashboards (default-v1, crm-v1, finance-v1, analytics-v1)
│       │   └── [...not-found]/   # Catch-all 404
│       ├── mail/                 # Mail app (separate from dashboard)
│       └── unauthorized/         # Unauthorized page
├── components/                   # Shared components
│   ├── ui/                       # 55 shadcn/ui primitives
│   ├── date-range-picker.tsx     # Date range picker
│   └── simple-icon.tsx           # Simple-icons wrapper
├── config/
│   └── app-config.ts             # App metadata config
├── data/
│   └── users.ts                  # Static user data (2 users)
├── hooks/
│   └── use-mobile.ts             # Mobile detection hook
├── lib/                          # Utilities
│   ├── utils.ts                  # cn(), formatCurrency(), getInitials()
│   ├── cookie.client.ts          # Client-side cookie helpers
│   ├── local-storage.client.ts   # Client-side storage helpers
│   ├── fonts/
│   │   └── registry.ts           # Geist font CSS variable registration
│   └── preferences/              # Layout & theme configuration
│       ├── preferences-config.ts # Default preference values
│       ├── preferences-storage.ts # Cookie/localStorage abstraction
│       ├── layout.ts             # Layout type definitions
│       ├── layout-utils.ts       # Layout utility functions
│       ├── theme.ts              # Theme type definitions
│       └── theme-utils.ts        # Theme utility functions
├── navigation/
│   └── sidebar/
│       └── sidebar-items.ts      # Sidebar navigation structure
├── scripts/
│   ├── generate-theme-presets.ts # Theme preset CSS generator
│   └── theme-boot.tsx            # Inline theme boot script
├── server/
│   └── server-actions.ts         # Server actions (cookie read/write)
├── stores/
│   └── preferences/
│       ├── preferences-store.ts  # Zustand store
│       └── preferences-provider.tsx # React context provider
├── styles/
│   ├── flag-icons/
│   │   └── flags.css             # Country flag CSS (1068 lines)
│   └── presets/
│       ├── brutalist.css         # Brutalist theme preset
│       ├── soft-pop.css          # Soft pop theme preset
│       └── tangerine.css         # Tangerine theme preset
└── proxy.disabled.ts            # Next.js proxy (disabled)
```

## Naming Conventions
- **Files**: `kebab-case` for most files (`globals.css`, `server-actions.ts`, `date-range-picker.tsx`)
- **Components**: PascalCase for export names, kebab-case for filenames
- **Directories**: kebab-case, with `_components/` prefix for private feature folders
- **Route groups**: Parenthesized `(main)/`, `(external)/`, `(legacy)/`
- **Catch-all routes**: `[...not-found]/`
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `PREFERENCE_DEFAULTS`, `SIDEBAR_VARIANT_VALUES`)
- **Functions**: `camelCase` (e.g., `getPreference`, `formatCurrency`, `getInitials`)

## Key Conventions
- Feature components co-located in `_components/` subdirectory within each route
- Table patterns follow `columns.tsx` + `schema.ts` + `table.tsx` + `data.ts` structure
- All UI primitives in `src/components/ui/` — no custom components mixed in
- Utility functions in `src/lib/utils.ts` — centralized
- Zod schemas co-located with table components, not in a shared schemas directory
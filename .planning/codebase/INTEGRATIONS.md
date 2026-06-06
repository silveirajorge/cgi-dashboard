---
focus: tech
generated: 2026-06-06
scope: full-repo
---

# INTEGRATIONS.md — External Services & APIs

## Current Integrations

### GitHub
- **External link** in dashboard header (`src/app/(main)/dashboard/layout.tsx:71-73`) — opens repository on GitHub
- Uses `simple-icons` `siGithub` icon
- Not an API integration; purely navigational

### Theme Fonts (Geist)
- **geist** npm package provides Geist sans-serif font
- Loaded via `src/lib/fonts/registry.ts`
- No Google Fonts or external font API calls

## No External Backend / API Dependencies
- **No database** — all data is static/fixture-based (e.g., `src/data/users.ts`, `src/navigation/sidebar/sidebar-items.ts`)
- **No authentication provider** — auth pages are presentational (v1 and v2 login/register flows); no actual auth logic
- **No REST/GraphQL API calls** — no `fetch`, `axios`, `SWR`, or `React Query` usage
- **No webhooks**
- **No cloud services** (AWS, Vercel, Supabase, etc.)

## Data Sources
| Source | File | Type |
|--------|------|------|
| Users | `src/data/users.ts` | Static array (2 users) |
| Navigation | `src/navigation/sidebar/sidebar-items.ts` | Static configuration |
| Mail | `src/app/(main)/mail/_components/data.tsx` | Static mock data (481 lines) |
| CRM config | `src/app/(main)/dashboard/(legacy)/crm-v1/_components/crm.config.ts` | Static mock data |
| Shipments | `src/app/(main)/dashboard/logistics/_components/shipment-data.ts` | Static mock data (1001 lines) |
| Roles | `src/app/(main)/dashboard/roles/_components/roles-table/data.ts` | Static mock data |
| Users table | `src/app/(main)/dashboard/users/_components/data.tsx` | Static mock data (332 lines) |

## No Environment Variables
- No `.env` files exist in the repository
- Only `process.env` reference is in `src/lib/local-storage.client.ts:7` — checks `NODE_ENV` for dev-only warnings

## Proxy / Middleware
- `src/proxy.disabled.ts` — Next.js Proxy scaffold, currently disabled (rename to `proxy.ts` to enable)
- Designed for rewrites, redirects, or header manipulation

## Summary
This project is a **fully frontend dashboard starter template** with zero external service integrations. All data is static/mock. Backend integration points (proxy, server actions, auth pages) are scaffolded but not connected to any real services.
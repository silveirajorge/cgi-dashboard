---
phase: 2
slug: upload-ui
status: draft
shadcn_initialized: true
preset: radix-nova
created: 2026-06-06
---

# Phase 2 — UI Design Contract

> Visual and interaction contract for the Upload UI phase. Based on CONTEXT.md decisions, existing shadcn/ui components, and Tailwind CSS v4 theming.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | shadcn/ui (radix-nova style) |
| Preset | CSS variables via globals.css + 3 theme presets |
| Component library | `@/components/ui/` (55+ primitives) |
| Icon library | lucide-react |
| Font | Geist (via geist npm package) |

---

## Spacing Scale

All values from Tailwind CSS v4 theme defaults (multiples of 4):

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Icon gaps, inline padding |
| sm | 8px | Upload area inner padding |
| md | 16px | Default element spacing |
| lg | 24px | Section padding, card padding |
| xl | 32px | Layout gaps between sections |
| 2xl | 48px | Major section breaks |
| 3xl | 64px | Page-level spacing |

Exceptions: none — seguir Tailwind spacing scale existente

---

## Typography

Using Geist font + Tailwind text classes:

| Role | Class | Size | Weight |
|------|-------|------|--------|
| Page title | `text-2xl font-semibold` | 24px | 600 |
| Section heading | `text-lg font-medium` | 18px | 500 |
| Body text | `text-sm` | 14px | 400 |
| Label/info | `text-xs text-muted-foreground` | 12px | 400 |
| Upload area text | `text-base` | 16px | 500 |

---

## Color

Todas as cores via CSS variables do shadcn/ui (globals.css) — respeitam tema selecionado (claro/escuro + presets):

| Role | Variable | Usage |
|------|----------|-------|
| Background | `var(--background)` | Page background |
| Foreground | `var(--foreground)` | Main text |
| Card bg | `var(--card)` | Upload area card |
| Card fg | `var(--card-foreground)` | Upload area text |
| Border | `var(--border)` | Upload area dashed border (default) |
| Primary | `var(--primary)` | Upload area dashed border (drag-over) |
| Primary fg | `var(--primary-foreground)` | Icon color (drag-over) |
| Muted fg | `var(--muted-foreground)` | Helper text, file size info |
| Accent | `var(--accent)` | Hover background |
| Destructive | `var(--destructive)` | Error states only |

Accent reserved for: drag-over state feedback, hover effects na área de upload

---

## Copywriting Contract

| Element | Copy (PT-BR) |
|---------|--------------|
| Page title | "Upload de CSV" |
| Upload area prompt | "Arraste o arquivo CSV aqui" |
| Upload area subtext | "ou clique para selecionar" |
| File size info | "CSV até 50MB" |
| Uploading state | "Enviando..." (com spinner) |
| Success toast | "Upload realizado: {N} linhas importadas, {M} ignoradas" |
| Error toast (.csv) | "Apenas arquivos CSV são aceitos" |
| Error toast (size) | "Arquivo excede o limite de 50MB" |
| Error toast (server) | {mensagem do servidor} |
| Empty state (no uploads yet) | "Nenhum arquivo enviado até o momento" |

---

## Interaction States (Upload Area)

### Default
- Borda tracejada 2px (`border-2 border-dashed border-border`)
- Ícone Upload (lucide, 12x12, `text-muted-foreground`)
- Texto "Arraste o arquivo CSV aqui" + "ou clique para selecionar"
- Input file hidden, acionado por clique na área
- Cursor: pointer

### Hover
- Borda muda para `border-primary`
- Background muda para `bg-accent/50`
- Transição suave (Tailwind `transition-colors`)

### Drag Over
- Borda `border-primary` (mais espessa visualmente)
- Background `bg-accent`
- Ícone Upload muda para `text-primary-foreground`
- Texto muda para "Solte o arquivo aqui"

### Uploading
- Ícone Upload substituído por Loader2 com animação spin
- Texto muda para "Enviando..."
- Área desabilitada (pointer-events-none)
- Opacidade reduzida (opacity-70)

### Success (pós-upload)
- Área volta ao estado Default pronta para novo upload
- Toast sonner com resultado
- Toast usa `toast.success()` com ícone CheckCircle

### Error
- Toast sonner com `toast.error()` com ícone AlertCircle
- Mensagem de erro do servidor ou validação client-side
- Área volta ao estado Default

---

## Component Tree

```
Page: /dashboard/upload (Server Component)
└── _components/upload-area.tsx (Client Component — "use client")
    ├── Label/page title (text-2xl font-semibold)
    └── UploadZone
        ├── hidden <input type="file" accept=".csv">
        ├── DropZone (div com onDragOver/onDrop/onClick)
        │   ├── Upload icon (lucide) ou Loader2 (spinning)
        │   ├── Texto principal
        │   └── Texto secundário + info de tamanho
        └── (feedback via sonner toast — não inline)
```

---

## States Covered

| State | Visual | Toast |
|-------|--------|-------|
| Initial | Upload area default | — |
| Hover | Borda/label primary | — |
| Drag over | Borda/label primary + bg accent | — |
| Validation error (client) | — | `toast.error()` |
| Uploading | Loader2 spinner + "Enviando..." | — |
| Success | Reset to default | `toast.success()` |
| Server error | Reset to default | `toast.error()` |

---

## Files Modified

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(main)/dashboard/upload/page.tsx` | Create | Server component page shell |
| `src/app/(main)/dashboard/upload/_components/upload-area.tsx` | Create | Client component: upload form, drag & drop |
| `src/navigation/sidebar/sidebar-items.ts` | Edit | Add "Upload CSV" as first Dashboards item |

---

## Sidebar Integration

- **Position:** First item in Dashboards group (before Default)
- **Title:** "Upload CSV"
- **Icon:** `Upload` from lucide-react
- **URL:** `/dashboard/upload`

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
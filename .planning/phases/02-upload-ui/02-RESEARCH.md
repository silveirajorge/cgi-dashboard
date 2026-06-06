# Phase 2: Upload UI — Research

**Researched:** 2026-06-06
**Domain:** File Upload UI (React + Next.js Client Component)
**Confidence:** HIGH

## Summary

Esta fase implementa a interface de upload de CSV no dashboard — upload via botão e drag & drop com feedback via sonner toast. Criação da página `/dashboard/upload` com área de upload proeminente e item no menu lateral.

**Descobertas principais:**

1. **Sonner 2.0.7** já está instalado e configurado (Toaster no root layout) — usar `toast.success()` e `toast.error()` diretamente em client components
2. **POST /api/upload** já existe (Fase 1) — aceita `FormData` com campo `file`, retorna `{ rows_imported, rows_ignored }` ou `{ error }`
3. **Drag & drop nativo** (HTML5) — sem biblioteca extra. `onDragOver`/`onDrop`/`onClick` + `<input type="file" hidden>`
4. **Padrão de página** já consolidado — Server Component page + Client Component em `_components/`
5. **Sidebar** — adicionar item ao array `sidebarItems` no grupo "Dashboards"

**Primary recommendation:** Implementar como client component único `upload-area.tsx` com estado interno para drag-over, uploading, e validação client-side. Usar `fetch` com `FormData` para chamar `/api/upload`.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

| ID | Decisão |
|----|---------|
| D-01 | Página dedicada em `/dashboard/upload` — não é modal nem widget fixo |
| D-02 | Adicionar item "Upload CSV" no menu lateral da sidebar como primeiro item do grupo "Dashboards" (antes de Default) |
| D-03 | Usar o padrão de co-locação do projeto — componentes em `_components/` dentro da rota |
| D-04 | Área de upload proeminente — borda tracejada, ícone de upload, texto "Arraste o CSV aqui ou clique para selecionar" |
| D-05 | Upload automático ao selecionar/soltar o arquivo — sem botão "Enviar" separado |
| D-06 | Validação de tipo de arquivo (apenas .csv) antes do envio |
| D-07 | Validação de tamanho (limite de 50MB, mesmo do backend) antes do envio |
| D-08 | Toast da biblioteca sonner para feedback pós-upload |
| D-09 | Toast de sucesso: "Upload realizado: N linhas importadas, M ignoradas" |
| D-10 | Toast de erro em caso de falha (arquivo inválido, coluna obrigatória faltando, erro no servidor) |
| D-11 | Estado visual durante o upload (loading/spinner na área de drop) |
| D-12 | Upload automático via `POST /api/upload` assim que arquivo é selecionado/soltado |
| D-13 | Após upload bem-sucedido, apenas toast — sem redirecionamento (Fase 3 exibirá KPIs) |
| D-14 | Validações client-side: extensão .csv + tamanho < 50MB — antes de enviar ao servidor |
| D-15 | Item "Upload CSV" adicionado como primeiro item do grupo "Dashboards" em `src/navigation/sidebar/sidebar-items.ts` |
| D-16 | Ícone: `Upload` da lucide-react |

### the agent's Discretion

- Cor exata e estilo visual da área de drop (seguir tema do shadcn/ui)
- Animação de drag-over (mudar cor da borda)
- Texto exato do placeholder
- Tipo de spinner/loading

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CSV-01 | Upload via botão de seleção | Hidden `<input type="file">` acionado por `onClick` na área de drop |
| CSV-02 | Drag & drop | Eventos HTML5 `onDragOver`/`onDragEnter`/`onDragLeave`/`onDrop` no elemento da área |
| CSV-04 | Feedback pós-upload (sonner toast) com número de linhas importadas ou erro | `toast.success()` e `toast.error()` da sonner 2.0.7 |

</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| File selection & validation | Browser/Client | — | Validação de tipo/tamanho antes do envio |
| Drag & drop UX | Browser/Client | — | Eventos HTML5 nativos, sem chamada ao servidor |
| File upload (POST) | API/Backend | — | `POST /api/upload` criado na Fase 1 |
| Toast feedback | Browser/Client | — | sonner renderiza toasts no cliente |
| Sidebar navigation | Browser/Client | — | Config de navegação renderizada pelo sidebar existente |
| Page routing | Frontend Server (SSR) | — | Next.js App Router — `/dashboard/upload/page.tsx` |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| sonner | 2.0.7 | Toast notifications (success/error) | Já instalado e configurado no root layout [VERIFIED: npm registry] |
| lucide-react | 1.17.0 | Ícones (Upload, Loader2, File) | Já instalado e usado em todo o projeto [VERIFIED: npm registry] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| tailwind-merge + clsx | via lib | Class merging via `cn()` | Em classes CSS condicionais (estados drag, loading) |
| next/navigation | — | `usePathname()` para active state no sidebar | Já usado no sidebar existente |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| HTML5 drag & drop nativo | react-dropzone | react-dropzone adicionaria 5KB+ e abstrai o que são 4 eventos + 1 input. Para caso simples como este, nativo é suficiente |
| fetch + FormData | axios, react-uploady | fetch já é suficiente para um único POST por vez. Axios adiciona dependência desnecessária |

**Installation:**
```bash
# Nenhuma instalação necessária — sonner e lucide-react já estão no projeto
```

**Version verification:**
```bash
npm view sonner version  # → 2.0.7 (confirmed)
npm view lucide-react version  # → 1.17.0 (confirmed)
```

## Architecture Patterns

### System Architecture Diagram

```
Browser (Client Component — upload-area.tsx)
│
├── User drags/clicks file
│   └── Client-side validation
│       ├── ❌ Not .csv → toast.error("Apenas arquivos CSV são aceitos")
│       ├── ❌ > 50MB → toast.error("Arquivo excede o limite de 50MB")
│       └── ✅ Passou → Envia para servidor
│
├── fetch POST /api/upload (FormData com campo "file")
│   └── Estado: spinner + "Enviando..." na área de drop
│
├── Resposta do servidor
│   ├── ✅ 200 → toast.success("Upload realizado: {N} linhas importadas, {M} ignoradas")
│   │            → Reset área de drop para estado Default
│   └── ❌ 4xx/5xx → toast.error({mensagem do erro})
│                    → Reset área de drop para estado Default
│
└── Página permanece em /dashboard/upload (sem redirect)
```

### Recommended Project Structure
```
src/app/(main)/dashboard/upload/
├── page.tsx                          # Server Component (Page shell)
└── _components/
    └── upload-area.tsx               # Client Component (toda a lógica)
```

### Pattern 1: Server Component Page Shell
**What:** A page.tsx file that is a thin server component shell that renders client sub-components. This is the established project pattern.

**When to use:** Toda nova rota no dashboard.

**Example:**
```tsx
// src/app/(main)/dashboard/upload/page.tsx
import { UploadArea } from "./_components/upload-area";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <UploadArea />
    </div>
  );
}
```

### Pattern 2: Client-Side File Validation + Upload
**What:** Validate file type and size before sending, then send via fetch FormData.

**When to use:** Upload de arquivo com feedback imediato.

**Example pattern:**
```typescript
const handleFile = async (file: File) => {
  // Client-side validation
  if (!file.name.endsWith(".csv")) {
    toast.error("Apenas arquivos CSV são aceitos");
    return;
  }
  if (file.size > 50 * 1024 * 1024) {
    toast.error("Arquivo excede o limite de 50MB");
    return;
  }

  // Upload state
  setIsUploading(true);

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao enviar arquivo");
    }

    toast.success(
      `Upload realizado: ${data.rows_imported} linhas importadas, ${data.rows_ignored} ignoradas`
    );
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Erro ao enviar arquivo");
  } finally {
    setIsUploading(false);
  }
};
```

### Pattern 3: Sidebar Item Addition
**What:** Add a navigation item to the sidebar by modifying the `sidebarItems` array.

**When to use:** Toda nova rota que precisa aparecer na navegação.

**Example:**
```typescript
// Em src/navigation/sidebar/sidebar-items.ts — grupo "Dashboards"
{
  title: "Upload CSV",
  url: "/dashboard/upload",
  icon: Upload,
},
// Inserir antes do item "Default"
```

### Anti-Patterns to Avoid

- **Estado global no Zustand para upload**: Upload é episódico (só ocorre quando usuário age). Estado local (`useState`) é suficiente. Não poluir store global com estado de upload.
- **react-hook-form para upload**: O formulário é um único campo (arquivo). react-hook-form adiciona complexidade desnecessária. Usar `fetch` direto com `FormData`.
- **Múltiplos uploads simultâneos**: Desabilitar a área durante upload (`pointer-events-none` + `opacity-70`) previne race conditions e feedback confuso.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Toast notifications | CSS toast custom | sonner (`toast.success()`, `toast.error()`) | Já instalado, configurado, com tema integrado e animações nativas |
| Ícones | SVG inline ou PNG | lucide-react (Upload, Loader2, etc.) | Já instalado, tree-shakeable, consistente com o design system |
| Drag & drop | react-dropzone library | HTML5 nativo (onDragOver/onDrop) | Caso simples (1 arquivo, 1 formato). 4 eventos + 1 input é suficiente — lib adicionaria 5KB+ sem benefício |

## Common Pitfalls

### Pitfall 1: FormData field name mismatch
**What goes wrong:** O backend espera o campo `"file"` no FormData, mas o frontend envia com nome diferente (ex: `"csv"`).
**Why it happens:** O `formData.append("file", file)` é um contrato explícito com o backend.
**How to avoid:** Sempre usar `formData.append("file", file)` — é o nome que o backend (`route.ts` linha 12) espera: `formData.get("file")`.
**Warning signs:** Backend retorna "Nenhum arquivo enviado. Envie um CSV no campo 'file'."

### Pitfall 2: Não resetar o input file entre uploads
**What goes wrong:** Usuário faz upload → tenta fazer outro upload do mesmo arquivo → nada acontece (event `onChange` não dispara pois o valor do input não mudou).
**Why it happens:** `<input type="file">` mantém o valor mesmo após upload.
**How to avoid:** Após cada upload (sucesso ou erro), resetar o input: `e.currentTarget.value = ""`.
**Warning signs:** Clicar para selecionar o mesmo arquivo não dispara o upload novamente.

### Pitfall 3: Esquecer de prevenir default no onDrop
**What goes wrong:** O navegador abre o arquivo em vez de processá-lo no app.
**Why it happens:** O evento `onDrop` tem comportamento default de abrir o arquivo.
**How to avoid:** Sempre chamar `e.preventDefault()` em BOTH `onDragOver` e `onDrop`.
**Warning signs:** Arquivo abre em nova aba ao soltar na área de drop.

### Pitfall 4: Validação duplicada confunde o usuário
**What goes wrong:** Mensagens de erro diferentes entre client e server para a mesma validação (ex: extensão .csv).
**Why it happens:** O backend também valida extensão e tamanho (`route.ts` linhas 18-27).
**How to avoid:** A validação client-side previne o erro antes de chegar ao servidor. Se chegar ao servidor e falhar, a mensagem do servidor ainda aparece como fallback — mas como a validação client-side já bloqueou, o usuário não vê erro do servidor.

## Code Examples

### Client Component: Upload Area with Drag & Drop

```tsx
"use client";

import { useState, useRef, type DragEvent, type ChangeEvent } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function UploadArea() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    // Client-side validation
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Apenas arquivos CSV são aceitos");
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (file.size > MAX_SIZE) {
      toast.error("Arquivo excede o limite de 50MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao processar upload");
      }

      toast.success(
        `Upload realizado: ${data.rows_imported} linhas importadas, ${data.rows_ignored} ignoradas`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro interno";
      toast.error(message);
    } finally {
      setIsUploading(false);
      // Reset input value to allow re-upload of same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Upload de CSV</h1>

      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2",
          "rounded-lg border-2 border-dashed p-12",
          "transition-colors duration-200",
          isUploading && "pointer-events-none opacity-70",
          isDragOver
            ? "border-primary bg-accent"
            : "border-border hover:border-primary hover:bg-accent/50",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />

        {isUploading ? (
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
        ) : (
          <Upload
            className={cn(
              "size-12",
              isDragOver ? "text-primary-foreground" : "text-muted-foreground",
            )}
          />
        )}

        <p className="text-base font-medium">
          {isUploading
            ? "Enviando..."
            : isDragOver
              ? "Solte o arquivo aqui"
              : "Arraste o arquivo CSV aqui"}
        </p>

        {!isUploading && (
          <p className="text-xs text-muted-foreground">
            ou clique para selecionar &middot; CSV até 50MB
          </p>
        )}
      </div>
    </div>
  );
}
```

*[ASSUMED] — Padrão estabelecido de drag & drop nativo + sonner + fetch. Nenhum desvio do design system ou das APIs existentes.*

### POST /api/upload — API Contract

```typescript
// Request
const formData = new FormData();
formData.append("file", csvFile); // Nome do campo: "file"

// Response (success — 200)
{
  message: "Upload realizado com sucesso",
  filename: "vendas-2026-01.csv",
  rows_imported: 31572,
  rows_ignored: 0,
  total_rows: 31572
}

// Response (validation error — 400)
{
  error: "Apenas arquivos CSV são aceitos"
}

// Response (validation error — 413)
{
  error: "Arquivo excede o limite de 50MB"  // [ASSUMED] formato exato
}

// Response (server error — 500)
{
  error: "Erro interno ao processar upload"
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| react-dropzone library | HTML5 drag & drop nativo | Sempre (projeto novo) | Menos 5KB+ de dependência, controle total sobre eventos |

**Deprecated/outdated:**
- N/A — todas as libs envolvidas estão nas versões mais recentes

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | A propriedade `isNew` no `NavMainItem` da sidebar está definida na interface mas não é renderizada em `nav-main.tsx` | Code Examples / Sidebar | Se decidirmos mostrar badge "Novo" no item "Upload CSV", precisaremos modificar o componente de renderização do sidebar — não apenas adicionar `isNew: true`. Por segurança, a recomendação é NÃO usar `isNew` (seguir o padrão existente onde mesmo "Academy" com `isNew: true` não mostra badge) |
| A2 | Formato exato da mensagem de erro no retorno 413 do backend | Code Examples / API | O backend retorna `message` com template string. A UI deve exibir a mensagem do servidor (`data.error`) em vez de hardcoded |

## Open Questions

1. **A sidebar já renderiza o badge `isNew`?**
   - What we know: A propriedade existe em `NavMainItem`, está setada como `true` no item "Academy", mas NÃO é renderizada em `nav-main.tsx`.
   - What's unclear: Se o plan deve incluir modificar `nav-main.tsx` para renderizar o badge, ou se não é necessário.
   - Recommendation: Não adicionar badge `isNew` para "Upload CSV". Se desejado, será uma tarefa separada. Usar apenas `icon: Upload`, `title: "Upload CSV"`, `url: "/dashboard/upload"`.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js runtime | ✓ | (via projeto) | — |
| sonner | Toast notifications | ✓ | 2.0.7 | — |
| lucide-react | Ícones | ✓ | 1.17.0 | — |

**Missing dependencies with no fallback:**
— Nenhuma — todas as dependências já estão no projeto

**Missing dependencies with fallback:**
— Nenhuma

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Nenhum framework de testes encontrado no projeto |
| Config file | N/A |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CSV-01 | Upload via botão de seleção | manual | — | ❌ Sem framework |
| CSV-02 | Drag & drop | manual | — | ❌ Sem framework |
| CSV-04 | Toast feedback | manual | — | ❌ Sem framework |

### Sampling Rate
- **Per task commit:** N/A
- **Per wave merge:** N/A
- **Phase gate:** Validação manual (verificar via browser)

### Wave 0 Gaps
- ❌ Nenhum framework de testes configurado no projeto
- ❌ Nenhum arquivo de teste existente para referência
- Recomendação: Fase puramente UI — validação manual via navegador é suficiente para este escopo

> *Nota: O projeto não possui framework de testes (`workflow.nyquist_validation: true` mas sem Jest/Vitest/Playwright instalados). Não será implementado testing nesta fase pois seria uma tarefa de infraestrutura cross-cutting. O planner deve incluir verificação manual (abrir browser, testar upload) como critério de aceite.*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | yes | Validação client-side (tipo .csv + tamanho) + validação server-side (já implementada no backend) |
| V9 File Uploads | partial | Upload de único arquivo CSV, validação de tipo MIME no servidor (indireta via extensão), limite de 50MB |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Upload de arquivo malicioso | Tampering | Validação de extensão .csv no client (proteção UX) + servidor valida extensão e parse seguro (Fase 1) |
| Arquivo muito grande (DoS) | Denial of Service | Limite de 50MB no client (bloqueia antes de enviar) + servidor também valida |
| Upload simultâneo | — | UI desabilita área durante upload (`pointer-events-none`), prevenindo race conditions |

## Sources

### Primary (HIGH confidence)
- [VERIFIED: npm registry] — sonner@2.0.7, lucide-react@1.17.0 instalados no projeto
- [VERIFIED: codebase] — `src/app/api/upload/route.ts` — contrato POST /api/upload
- [VERIFIED: codebase] — `src/components/ui/sonner.tsx` — Toaster configurado
- [VERIFIED: codebase] — `src/app/(main)/auth/_components/login-form.tsx` — padrão de uso do sonner
- [VERIFIED: codebase] — `src/navigation/sidebar/sidebar-items.ts` — estrutura do menu
- [VERIFIED: codebase] — `src/app/(main)/dashboard/_components/sidebar/nav-main.tsx` — renderização do sidebar
- [CITED: context7.com/emilkowalski/sonner] — `toast.success()`, `toast.error()`, `toast.promise()` API

### Secondary (MEDIUM confidence)

### Tertiary (LOW confidence)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — sonner e lucide-react confirmados via npm registry e código existente
- Architecture: HIGH — padrão de server/client component já estabelecido em múltiplas páginas
- Pitfalls: HIGH — baseado em experiência comum com upload de arquivos + análise do contrato da API

**Research date:** 2026-06-06
**Valid until:** 2026-07-06 (30 dias — stack estável, sem mudanças esperadas)

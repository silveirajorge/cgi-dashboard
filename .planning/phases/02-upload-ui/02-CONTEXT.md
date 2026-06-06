# Phase 2: Upload UI - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Interface de upload de CSV no dashboard — upload via botão e drag & drop com feedback visual (sonner toast). Criação da página `/dashboard/upload` com área de upload proeminente e item no menu lateral.

</domain>

<decisions>
## Implementation Decisions

### Rota e Localização
- **D-01:** Página dedicada em `/dashboard/upload` — não é modal nem widget fixo
- **D-02:** Adicionar item "Upload CSV" no menu lateral da sidebar como primeiro item do grupo "Dashboards" (antes de Default)
- **D-03:** Usar o padrão de co-locação do projeto — componentes em `_components/` dentro da rota

### Interface de Upload
- **D-04:** Área de upload proeminente — borda tracejada, ícone de upload, texto "Arraste o CSV aqui ou clique para selecionar"
- **D-05:** Upload automático ao selecionar/soltar o arquivo — sem botão "Enviar" separado
- **D-06:** Validação de tipo de arquivo (apenas .csv) antes do envio
- **D-07:** Validação de tamanho (limite de 50MB, mesmo do backend) antes do envio

### Feedback Visual
- **D-08:** Toast da biblioteca sonner para feedback pós-upload
- **D-09:** Toast de sucesso: "Upload realizado: N linhas importadas, M ignoradas"
- **D-10:** Toast de erro em caso de falha (arquivo inválido, coluna obrigatória faltando, erro no servidor)
- **D-11:** Estado visual durante o upload (loading/spinner na área de drop)

### Comportamento
- **D-12:** Upload automático via `POST /api/upload` assim que arquivo é selecionado/soltado
- **D-13:** Após upload bem-sucedido, apenas toast — sem redirecionamento (Fase 3 exibirá KPIs)
- **D-14:** Validações client-side: extensão .csv + tamanho < 50MB — antes de enviar ao servidor

### Sidebar Navigation
- **D-15:** Item "Upload CSV" adicionado como primeiro item do grupo "Dashboards" em `src/navigation/sidebar/sidebar-items.ts`
- **D-16:** Ícone: `Upload` da lucide-react

### the agent's Discretion
- Cor exata e estilo visual da área de drop (seguir tema do shadcn/ui)
- Animação de drag-over (mudar cor da borda)
- Texto exato do placeholder
- Tipo de spinner/loading

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos
- `.planning/REQUIREMENTS.md` — CSV-01, CSV-02, CSV-04
- `.planning/PROJECT.md` — Contexto do projeto

### API já existente
- `src/app/api/upload/route.ts` — POST /api/upload (endpoint que a UI vai consumir)
- `.planning/phases/01-backend-foundation/01-01-SUMMARY.md` — Resumo do que foi construído na Fase 1

### Código Existente (UI Patterns)
- `src/components/ui/sonner.tsx` — Componente de toast (já usado no projeto)
- `src/components/ui/button.tsx` — Botão shadcn/ui
- `src/navigation/sidebar/sidebar-items.ts` — Estrutura do menu lateral
- `.planning/codebase/CONVENTIONS.md` — Padrões de componentes (client/server)
- `.planning/codebase/STRUCTURE.md` — Estrutura de diretórios

### Exemplos Existentes no Dashboard
- Páginas existentes em `src/app/(main)/dashboard/*/page.tsx` — Padrão de Server Component page
- Componentes em `src/app/(main)/dashboard/*/_components/` — Padrão de co-locação

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/sonner.tsx` — Toast notifications (usar para feedback pós-upload)
- `src/components/ui/button.tsx` — Botão primário (caso necessário)
- `src/lib/utils.ts` — `cn()` para classes condicionais
- `lucide-react` — Ícones (Upload, File, CheckCircle, AlertCircle, Loader2)

### Established Patterns
- **Client Component**: Upload precisa de interatividade → `"use client"`
- **Co-locação**: Componentes em `_components/` dentro da rota
- **Server/Client**: Page.tsx como server component, componente de upload como client
- **Sidebar nav**: Itens em `src/navigation/sidebar/sidebar-items.ts`

### Integration Points
- **POST /api/upload** — Endpoint já existente da Fase 1 para enviar o CSV
- **Sidebar**: `src/navigation/sidebar/sidebar-items.ts` — adicionar item "Upload CSV"
- **Nova rota**: `src/app/(main)/dashboard/upload/page.tsx` — nova página
- **Componentes**: `src/app/(main)/dashboard/upload/_components/upload-area.tsx`

</code_context>

<specifics>
## Specific Ideas

- Upload automático: usuário arrasta ou clica → arquivo enviado imediatamente → toast de resultado
- Área com borda dashed + ícone Upload (lucide) + texto centralizado
- Estado hover/drag-over com mudança de cor (ex: borda primary)
- Spinner durante o upload substituindo o ícone
- Validações client-side antes de enviar: extensão .csv, tamanho < 50MB
- Erros mostrados via toast (sonner) com ícone de erro
- Página limpa, seguindo o layout padrão do dashboard

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 2-Upload UI*
*Context gathered: 2026-06-06*
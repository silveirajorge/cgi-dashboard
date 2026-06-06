# Phase 2: Upload UI - Discussion Log

**Date:** 2026-06-06
**Mode:** Default discuss

## Areas Discussed

### 1. Rota da página de upload
- **Options:** /dashboard/upload, Widget fixo na sidebar, Junto com KPIs
- **Selected:** /dashboard/upload (página dedicada)

### 2. Formato da interface
- **Options:** Área proeminente, Botão + modal, Card inline
- **Selected:** Área de upload proeminente com borda tracejada, ícone, drag & drop

### 3. Item na sidebar
- **Options:** Adicionar na sidebar, Sem item na sidebar
- **Selected:** Adicionar na sidebar

### 4. Comportamento pós-upload
- **Options:** Só toast, Toast com link para KPIs, Resultado inline
- **Selected:** Só toast (sonner) com stats

### 5. Envio automático vs botão
- **Options:** Automático ao selecionar, Botão de envio separado
- **Selected:** Automático ao selecionar/soltar o arquivo

### 6. Posição na sidebar
- **Options:** Topo do grupo Dashboards, Grupo novo
- **Selected:** Primeiro item do grupo "Dashboards" (antes de Default)

## Decisions per Category

| D | Category | Decision |
|---|----------|----------|
| D-01 | Route | /dashboard/upload dedicated page |
| D-02 | Sidebar | First item in Dashboards group |
| D-03 | Pattern | Co-located components in _components/ |
| D-04 | UI | Dashed border, upload icon, drag & drop text |
| D-05 | Behavior | Auto-submit on file select/drop |
| D-06 | Validation | .csv extension check client-side |
| D-07 | Validation | 50MB file size check client-side |
| D-08 | Feedback | sonner toast for post-upload |
| D-09 | Feedback | Success toast: rows imported/ignored |
| D-10 | Feedback | Error toast on failure |
| D-11 | UI | Loading spinner during upload |
| D-12 | Behavior | POST /api/upload on file select |
| D-13 | Behavior | No redirect after upload |
| D-14 | Validation | Client-side: .csv + size before send |
| D-15 | Sidebar | Add "Upload CSV" to sidebar-items.ts |
| D-16 | Icon | Upload icon from lucide-react |

## Deferred Ideas
None.
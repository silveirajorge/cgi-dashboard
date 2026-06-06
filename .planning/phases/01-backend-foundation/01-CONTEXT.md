# Phase 1: Backend Foundation - Context

**Gathered:** 2026-06-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Infraestrutura de backend completa — banco SQLite, engine de parsing CSV, API routes para upload e consulta, e arquitetura em camadas (Service + Repository). A Fase 1 entrega todo o pipeline server-side: o usuário pode fazer upload de um CSV via API e consultar KPIs agregados via API. A interface de upload (Fase 2) e o dashboard visual (Fase 3) são construídos sobre esta base.

</domain>

<decisions>
## Implementation Decisions

### Arquitetura de Camadas
- **D-01:** Service + Repository Pattern — três responsabilidades separadas
- **D-02:** Repository em `src/lib/db.ts` — conexão SQLite singleton, queries CRUD
- **D-03:** CSV parsing em `src/lib/csv.ts` — parse, normalização de headers, validação de cabeçalho
- **D-04:** Service layer em `src/lib/services/pedidos.ts` — lógica de negócio (dedup, cálculo de KPI, orquestração upload → parse → store)

### Estratégia de Dedup
- **D-05:** Chave composta: `id_contacto + mes_competencia`
- **D-06:** `mes_competencia` é coluna virtual derivada de `Dt Registo` — extrair ano-mês (YYYY-MM) da data
- **D-07:** `INSERT OR IGNORE` com unique constraint na chave composta

### Schema da Tabela `pedidos`
- **D-08:** Schema dinâmico — a tabela é criada com base nos cabeçalhos do primeiro CSV enviado
- **D-09:** Colunas do CSV normalizadas (trim, lowercase, replace espaços por underscore)
- **D-10:** Coluna extra `mes_competencia` (TEXT, YYYY-MM) adicionada automaticamente
- **D-11:** Unique constraint em `(id_contacto, mes_competencia)`
- **D-12:** Coluna extra `created_at` (DATETIME, DEFAULT CURRENT_TIMESTAMP) para rastreamento
- **D-13:** Colunas do CSV identificadas: `ID_CONTACTO`, `CIL`, `Produto`, `Dt Registo`, `Dt Contato`, `DtResolução`, `DtLimite`, `Estado`, `DtEstado`, `UnidadeTrat`, `Nivel 1`, `Nivel 2`, `Nivel 3`, `receção`, `Justificação`, `Tipo Justificação`, `Justificação Atividade`, `Resposta`, `Local Registo`, `Reportado Por`, `Observações`

### API Routes
- **D-14:** `POST /api/upload` — recebe arquivo CSV (multipart/form-data), parseia, armazena com dedup, retorna stats (linhas importadas, ignoradas, erros)
- **D-15:** `GET /api/data` — retorna KPIs já agregados (não dados brutos): soma, média, min, max por coluna numérica + contagem total de registros
- **D-16:** `GET /api/upload/history` — retorna histórico de uploads (data/hora, número de linhas)

### Banco de Dados
- **D-17:** Arquivo: `.data/cgi.db`
- **D-18:** Singleton de conexão em `src/lib/db.ts` — inicialização lazy na primeira chamada
- **D-19:** Migração automática — criar tabela `pedidos` e tabela `upload_history` se não existirem
- **D-20:** Tabela `upload_history`: `id INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT, rows_imported INTEGER, rows_ignored INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP`

### the agent's Discretion
- Detalhes de implementação do parser CSV (papaparse options, encoding handling)
- Nomes exatos das funções e organização interna dos módulos
- Tratamento de erros HTTP específico nos endpoints
- Validação de tamanho máximo do arquivo (recomendado: 10MB)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos
- `.planning/REQUIREMENTS.md` — Requisitos v1 com IDs (CSV-03, CSV-05, DATA-01~05, ARCH-01~04, CUST-01)
- `.planning/PROJECT.md` — Contexto do projeto, decisões chave, constraints

### Roadmap
- `.planning/ROADMAP.md` — Fase 1: Backend Foundation com success criteria

### Pesquisa
- `.planning/research/STACK.md` — Recomendações de stack (better-sqlite3, papaparse)
- `.planning/research/ARCHITECTURE.md` — Diagrama de componentes e fluxo de dados
- `.planning/research/PITFALLS.md` — Pitfalls conhecidos (encoding, permissões, tamanho de arquivo)

### Código Existente
- `.planning/codebase/STACK.md` — Stack atual do projeto
- `.planning/codebase/ARCHITECTURE.md` — Padrões arquiteturais existentes
- `.planning/codebase/INTEGRATIONS.md` — Integrações existentes (todas estáticas/mock)

### CSVs de Referência
- `data/csv/2026-01.csv` — CSV real com 21 colunas, usado para validar schema
- `data/csv/2026-02.csv` a `2026-05.csv` — Dados adicionais para testes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/utils.ts` — `cn()`, `formatCurrency()`, `getInitials()` — utilidades para formatação
- `src/server/server-actions.ts` — Padrão de server action com cookie read/write (não usado diretamente, mas referência de padrão server-side)
- `src/components/ui/sonner.tsx` — Toast notifications (usado na Fase 2 para feedback de upload)

### Established Patterns
- **Co-locação**: Componentes de feature em `_components/` dentro da rota
- **Server/Client boundary**: Server Components para dados, Client Components para interatividade
- **Zod + react-hook-form**: Validação de schemas (não usado no backend, mas padrão do projeto)

### Integration Points
- **Nova rota de API**: `src/app/api/upload/route.ts` + `src/app/api/data/route.ts` — criar diretórios seguindo convenção Next.js App Router
- **Sem integração com código existente**: Backend é totalmente novo, não modifica componentes existentes
- **DB isolado**: `.data/cgi.db` — não interfere com nada do template Studio Admin

### Creative Options
- **better-sqlite3** (síncrono, Node.js nativo) — mais simples, ideal para este caso
- **sql.js** (WebAssembly) — alternativa se precisar de compatibilidade browser, mas sem necessidade aqui
- **papaparse** (stream vs completo) — para arquivos grandes, usar chunked parsing

</code_context>

<specifics>
## Specific Ideas

- CSV real com 21 colunas (data/csv/2026-01.csv) já disponível para testes
- Coluna `ID_CONTACTO` é o identificador principal (equivalente a `id_contacto`)
- Coluna `Dt Registo` contém a data de abertura do pedido — usada para extrair `mes_competencia` (YYYY-MM)
- Colunas numéricas a identificar: aparentemente não há colunas explicitamente numéricas além de `CIL` — o agente deve detectar automaticamente no primeiro upload
- Sistema de origem pode gerar duplicatas do mesmo pedido dentro do mesmo mês — daí o dedup por `id_contacto + mes_competencia`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 1-Backend Foundation*
*Context gathered: 2026-06-06*

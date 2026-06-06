import type { ParseResult } from "@/lib/csv";
import { extractMesCompetencia } from "@/lib/csv";
import { createPedidosTable, getDb, insertUploadHistory } from "@/lib/db";

export interface UploadStats {
  rows_imported: number;
  rows_ignored: number;
  total_rows: number;
}

function getTableColumns(): string[] {
  const database = getDb();
  const rows = database.prepare("SELECT name FROM pragma_table_info('pedidos')").all() as { name: string }[];
  return rows.map((r) => r.name);
}

export function importRows(parsed: ParseResult, filename: string): UploadStats {
  const database = getDb();

  const tableExists = database.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='pedidos'").get();

  if (!tableExists) {
    createPedidosTable(parsed.headers);
  } else {
    const existingColumns = new Set(getTableColumns());
    for (const header of parsed.headers) {
      if (!existingColumns.has(header)) {
        throw new Error(
          `Coluna '${header}' do CSV não existe na tabela pedidos. Colunas existentes: [${Array.from(existingColumns).join(", ")}]`,
        );
      }
    }
  }

  const allColumns = [...parsed.headers, "mes_competencia"];
  const quoted = allColumns.map((c) => `"${c}"`).join(", ");
  const placeholders = allColumns.map(() => "?").join(", ");

  const insertStmt = database.prepare(`INSERT OR IGNORE INTO pedidos (${quoted}) VALUES (${placeholders})`);

  let imported = 0;
  let ignored = 0;

  const insertAll = database.transaction(() => {
    for (const row of parsed.rows) {
      const values = parsed.headers.map((h) => row[h] ?? "");
      values.push(extractMesCompetencia(row["dt_registo"] ?? ""));
      const result = insertStmt.run(...values);
      if (result.changes > 0) {
        imported++;
      } else {
        ignored++;
      }
    }
  });

  insertAll();

  insertUploadHistory(filename, imported, ignored);

  return {
    rows_imported: imported,
    rows_ignored: ignored,
    total_rows: parsed.rows.length,
  };
}

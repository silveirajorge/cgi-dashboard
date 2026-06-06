import Papa from "papaparse";

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  errors: Papa.ParseError[];
}

export function normalizeHeader(header: string): string {
  return header.toLowerCase().trim().replace(/\s+/g, "_");
}

export function extractMesCompetencia(dtRegisto: string): string {
  const datePart = dtRegisto.split(" ")[0];
  return datePart.substring(0, 7);
}

export function validateRequiredColumns(headers: string[], required: string[]): void {
  const headerSet = new Set(headers);
  for (const col of required) {
    if (!headerSet.has(col)) {
      throw new Error(
        `Coluna obrigatória '${col}' não encontrada no CSV. Colunas encontradas: [${headers.join(", ")}]`,
      );
    }
  }
}

export function parseCsvContent(content: string): ParseResult {
  const result = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const rawHeaders = result.meta.fields ?? [];

  if (result.data.length === 0) {
    throw new Error("CSV vazio — nenhuma linha de dados encontrada");
  }

  const normalizedHeaders = rawHeaders.map(normalizeHeader);

  const rows = (result.data as Record<string, string>[]).map((row) => {
    const normalizedRow: Record<string, string> = {};
    for (const [key, value] of Object.entries(row)) {
      const normalizedKey = normalizeHeader(key);
      normalizedRow[normalizedKey] = value.trim();
    }
    return normalizedRow;
  });

  return {
    headers: normalizedHeaders,
    rows,
    errors: result.errors,
  };
}

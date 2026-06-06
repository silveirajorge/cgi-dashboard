import { type NextRequest, NextResponse } from "next/server";

import { parseCsvContent, validateRequiredColumns } from "@/lib/csv";
import { importRows } from "@/lib/services/pedidos";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const REQUIRED_COLUMNS = ["id_contacto"];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado. Envie um CSV no campo 'file'." }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Apenas arquivos CSV são aceitos" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 413 },
      );
    }

    const content = await file.text();
    const parsed = parseCsvContent(content);

    validateRequiredColumns(parsed.headers, REQUIRED_COLUMNS);

    const stats = importRows(parsed, file.name);

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      filename: file.name,
      rows_imported: stats.rows_imported,
      rows_ignored: stats.rows_ignored,
      total_rows: stats.total_rows,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao processar upload";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

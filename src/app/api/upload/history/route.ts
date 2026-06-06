import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = getDb();
    const history = db
      .prepare(
        "SELECT id, filename, rows_imported, rows_ignored, created_at FROM upload_history ORDER BY created_at DESC",
      )
      .all();

    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

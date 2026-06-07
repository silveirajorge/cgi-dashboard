import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apenasAtivos = searchParams.get("ativos") === "true";

    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, nome, ativo, created_at, updated_at
         FROM funcionarios
         ${apenasAtivos ? "WHERE ativo = 1" : ""}
         ORDER BY nome COLLATE NOCASE`,
      )
      .all();

    return NextResponse.json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome } = body;

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    }

    const nomeTrimmed = nome.trim();
    const db = getDb();

    // Check duplicate (case-insensitive)
    const duplicate = db
      .prepare("SELECT id FROM funcionarios WHERE LOWER(nome) = LOWER(?) AND ativo = 1")
      .get(nomeTrimmed) as { id: number } | undefined;

    if (duplicate) {
      return NextResponse.json({ error: "Já existe um funcionário com este nome" }, { status: 409 });
    }

    const result = db.prepare("INSERT INTO funcionarios (nome) VALUES (?)").run(nomeTrimmed);

    return NextResponse.json({ id: result.lastInsertRowid, nome: nomeTrimmed, ativo: 1 }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

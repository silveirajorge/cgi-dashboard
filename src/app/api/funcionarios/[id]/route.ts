import { type NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const funcionarioId = Number(id);
    if (Number.isNaN(funcionarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const body = await request.json();
    const db = getDb();

    // Support partial update: { nome } or { ativo: boolean } or both
    if (body.nome !== undefined) {
      const nome = String(body.nome).trim();
      if (!nome) {
        return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
      }

      // Check duplicate excluindo próprio ID
      const duplicate = db
        .prepare("SELECT id FROM funcionarios WHERE LOWER(nome) = LOWER(?) AND id != ? AND ativo = 1")
        .get(nome, funcionarioId) as { id: number } | undefined;

      if (duplicate) {
        return NextResponse.json({ error: "Já existe um funcionário com este nome" }, { status: 409 });
      }

      db.prepare("UPDATE funcionarios SET nome = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        nome,
        funcionarioId,
      );
    }

    if (body.ativo !== undefined) {
      const ativo = body.ativo ? 1 : 0;
      db.prepare("UPDATE funcionarios SET ativo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(
        ativo,
        funcionarioId,
      );
    }

    const updated = db
      .prepare("SELECT id, nome, ativo, created_at, updated_at FROM funcionarios WHERE id = ?")
      .get(funcionarioId);

    if (!updated) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const funcionarioId = Number(id);
    if (Number.isNaN(funcionarioId)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 });
    }

    const db = getDb();
    const result = db
      .prepare("UPDATE funcionarios SET ativo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .run(funcionarioId);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Funcionário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

"use client";

import { useState } from "react";

import { AvaliacaoForm } from "./avaliacao-form";
import { AvaliacoesTable } from "./avaliacoes-table";

type PageMode = "list" | "form";

export function AvaliacoesPageClient() {
  const [mode, setMode] = useState<PageMode>("list");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editId, setEditId] = useState<number | null>(null);

  function handleNovaAvaliacao() {
    setEditId(null);
    setMode("form");
  }

  function handleEditar(id: number) {
    setEditId(id);
    setMode("form");
  }

  function handleFormCancel() {
    setMode("list");
    setEditId(null);
  }

  function handleFormSuccess() {
    setMode("list");
    setEditId(null);
    setRefreshKey((k) => k + 1);
  }

  if (mode === "form") {
    return (
      <AvaliacaoForm key={editId ?? "new"} editId={editId} onCancel={handleFormCancel} onSuccess={handleFormSuccess} />
    );
  }

  return <AvaliacoesTable refreshKey={refreshKey} onNovaAvaliacao={handleNovaAvaliacao} onEditar={handleEditar} />;
}

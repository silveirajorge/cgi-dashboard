"use client";

import { useState } from "react";

import { AvaliacaoForm } from "./avaliacao-form";
import { AvaliacoesTable } from "./avaliacoes-table";

type PageMode = "list" | "form";

export function AvaliacoesPageClient() {
  const [mode, setMode] = useState<PageMode>("list");
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNovaAvaliacao() {
    setMode("form");
  }

  function handleFormCancel() {
    setMode("list");
  }

  function handleFormSuccess() {
    setMode("list");
    setRefreshKey((k) => k + 1);
  }

  if (mode === "form") {
    return <AvaliacaoForm key={Date.now()} onCancel={handleFormCancel} onSuccess={handleFormSuccess} />;
  }

  return <AvaliacoesTable refreshKey={refreshKey} onNovaAvaliacao={handleNovaAvaliacao} />;
}

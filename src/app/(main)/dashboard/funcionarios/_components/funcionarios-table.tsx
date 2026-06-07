"use client";

import { useCallback, useEffect, useState } from "react";

import { Loader2, Pencil, Plus, Search, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { FuncionarioModal } from "./funcionario-modal";

interface Funcionario {
  id: number;
  nome: string;
  ativo: number;
  created_at: string;
  updated_at: string;
}

export function FuncionariosTable() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [apenasAtivos, setApenasAtivos] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFuncionario, setEditingFuncionario] = useState<Funcionario | undefined>(undefined);

  const fetchFuncionarios = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/funcionarios");
      if (!res.ok) throw new Error("Erro ao carregar funcionários. Tente recarregar a página.");
      const data: Funcionario[] = await res.json();
      setFuncionarios(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchFuncionarios();
  }, [fetchFuncionarios]);

  const filtered = funcionarios.filter((f) => {
    const matchesSearch = f.nome.toLowerCase().includes(search.toLowerCase());
    const matchesAtivo = !apenasAtivos || f.ativo === 1;
    return matchesSearch && matchesAtivo;
  });

  async function handleToggleAtivo(funcionario: Funcionario) {
    const novoAtivo = funcionario.ativo === 1 ? 0 : 1;

    // Optimistic update
    setFuncionarios((prev) => prev.map((f) => (f.id === funcionario.id ? { ...f, ativo: novoAtivo } : f)));

    try {
      const res = await fetch(`/api/funcionarios/${funcionario.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ativo: novoAtivo === 1 }),
      });
      if (!res.ok) throw new Error("Erro ao atualizar");
    } catch {
      // Revert on error
      setFuncionarios((prev) => prev.map((f) => (f.id === funcionario.id ? { ...f, ativo: funcionario.ativo } : f)));
    }
  }

  function handleAdd() {
    setEditingFuncionario(undefined);
    setModalOpen(true);
  }

  function handleEdit(funcionario: Funcionario) {
    setEditingFuncionario(funcionario);
    setModalOpen(true);
  }

  function handleModalClose() {
    setModalOpen(false);
    setEditingFuncionario(undefined);
  }

  async function handleModalSave(nome: string) {
    const isEdit = editingFuncionario !== undefined;
    const url = isEdit ? `/api/funcionarios/${editingFuncionario.id}` : "/api/funcionarios";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome }),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Erro ao salvar");
    }

    void fetchFuncionarios();
    handleModalClose();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Todos os Funcionários</CardTitle>
            <Button onClick={handleAdd}>
              <Plus className="size-4" />
              Adicionar Funcionário
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter bar */}
          <div className="mb-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={apenasAtivos}
                onChange={(e) => setApenasAtivos(e.target.checked)}
                className="size-4"
              />
              Só ativos
            </label>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
              <p className="text-destructive text-xs">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchFuncionarios} className="mt-2">
                Tentar novamente
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum funcionário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{f.nome}</TableCell>
                      <TableCell>
                        <Badge variant={f.ativo === 1 ? "default" : "secondary"}>
                          {f.ativo === 1 ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(f)} title="Editar">
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="outline" size="xs" onClick={() => handleToggleAtivo(f)}>
                            {f.ativo === 1 ? "Desativar" : "Ativar"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {modalOpen && (
        <FuncionarioModal
          open={modalOpen}
          funcionario={editingFuncionario}
          onSave={handleModalSave}
          onClose={handleModalClose}
        />
      )}
    </>
  );
}

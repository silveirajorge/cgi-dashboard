"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface FuncionarioModalProps {
  open: boolean;
  funcionario?: { id: number; nome: string };
  onSave: (nome: string) => Promise<void>;
  onClose: () => void;
}

export function FuncionarioModal({ open, funcionario, onSave, onClose }: FuncionarioModalProps) {
  const [nome, setNome] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = funcionario !== undefined;

  useEffect(() => {
    if (open) {
      setNome(funcionario?.nome ?? "");
      setError(null);
    }
  }, [open, funcionario]);

  async function handleSave() {
    if (!nome.trim()) {
      setError("O nome é obrigatório");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(nome.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Funcionário" : "Adicionar Funcionário"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Altere o nome do funcionário" : "Insira o nome do novo funcionário"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm" htmlFor="nome-input">
              Nome
            </label>
            <Input
              id="nome-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do funcionário"
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleSave();
              }}
            />
          </div>

          {error && <p className="text-destructive text-xs">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving || !nome.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

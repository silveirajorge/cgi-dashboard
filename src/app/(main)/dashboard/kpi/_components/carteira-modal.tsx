"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface CarteiraModalProps {
  open: boolean;
  mes: string | null;
  currentValue: number | null;
  onSave: (value: number) => void;
  onClose: () => void;
}

export function CarteiraModal({ open, mes, currentValue, onSave, onClose }: CarteiraModalProps) {
  const [valor, setValor] = useState(currentValue ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!mes) return;

    setSaving(true);
    try {
      const res = await fetch("/api/carteira", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes_competencia: mes, total_clientes: Math.round(valor) }),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      onSave(Math.round(valor));
    } catch {
      /* error handled silently */
    } finally {
      setSaving(false);
    }
  }

  function formatMes(mesStr: string): string {
    const [year, month] = mesStr.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
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
          <DialogTitle>Carteira de Clientes &mdash; {mes ? formatMes(mes) : "---"}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1">
            <label className="text-muted-foreground text-sm" htmlFor="carteira-input">
              Total de Clientes
            </label>
            <Input
              id="carteira-input"
              type="number"
              min={0}
              step={1}
              value={valor}
              onChange={(e) => setValor(Number(e.target.value))}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FuncionarioSelectProps {
  funcionarios: Array<{ id: number; nome: string }>;
  selectedId: number | null;
  onChange: (id: number) => void;
  onClear: () => void;
}

export function FuncionarioSelect({ funcionarios, selectedId, onChange, onClear }: FuncionarioSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-sm">Funcionário:</span>
      <Select value={selectedId !== null ? String(selectedId) : ""} onValueChange={(v) => onChange(Number(v))}>
        <SelectTrigger className="w-52">
          <SelectValue placeholder="Selecionar funcionário" />
        </SelectTrigger>
        <SelectContent>
          {funcionarios.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              {f.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedId !== null && (
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground text-xs hover:text-foreground hover:underline"
        >
          Limpar
        </button>
      )}
    </div>
  );
}

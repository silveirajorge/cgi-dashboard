"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FuncionarioOption {
  id: number;
  nome: string;
}

interface AvaliacaoFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const CATEGORIAS = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "qualidade", label: "Qualidade" },

  { key: "trabalho_equipa", label: "Trabalho em Equipa" },
  { key: "iniciativa", label: "Iniciativa" },
  { key: "comunicacao", label: "Comunicação" },
] as const;

type NotasState = Record<(typeof CATEGORIAS)[number]["key"], number>;

function getDefaultNotas(): NotasState {
  return {
    pontualidade: 0,
    qualidade: 0,

    trabalho_equipa: 0,
    iniciativa: 0,
    comunicacao: 0,
  };
}

export function AvaliacaoForm({ onCancel, onSuccess }: AvaliacaoFormProps) {
  const [funcionarios, setFuncionarios] = useState<FuncionarioOption[]>([]);
  const [funcionario, setFuncionario] = useState<FuncionarioOption | null>(null);
  const [dataAvaliacao, setDataAvaliacao] = useState(() => new Date().toISOString().split("T")[0]);
  const [notas, setNotas] = useState<NotasState>(getDefaultNotas);
  const [comentario, setComentario] = useState("");
  const [atraso, setAtraso] = useState(false);
  const [falta, setFalta] = useState(false);
  const [usoFerramenta, setUsoFerramenta] = useState(false);
  const [erroCritico, setErroCritico] = useState(false);
  const [percProdutividade, setPercProdutividade] = useState<number | null>(null);
  const [notaAuditoria, setNotaAuditoria] = useState<number | null>(null);
  const [tipoAuditoria, setTipoAuditoria] = useState("supervisor");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/funcionarios?ativos=true");
        if (res.ok) {
          const data: FuncionarioOption[] = await res.json();
          setFuncionarios(data);
        }
      } catch {
        // non-critical
      }
    })();
  }, []);

  const todasPreenchidas = Object.values(notas).every((n) => n >= 1 && n <= 10);
  const catCount = Object.keys(getDefaultNotas()).length;
  const mediaPreview = todasPreenchidas ? Object.values(notas).reduce((a, b) => a + b, 0) / catCount : null;

  async function handleSubmit() {
    if (!funcionario) {
      setError("Selecione um funcionário");
      return;
    }
    if (!dataAvaliacao) {
      setError("Selecione uma data");
      return;
    }
    for (const cat of CATEGORIAS) {
      const val = notas[cat.key];
      if (val < 1 || val > 10) {
        setError(`A nota de ${cat.label} deve estar entre 1 e 10`);
        return;
      }
    }

    if (notaAuditoria === null || notaAuditoria === undefined) {
      setError("Nota da auditoria é obrigatória");
      return;
    }
    if (notaAuditoria < 0 || notaAuditoria > 100) {
      setError("Nota da auditoria deve estar entre 0 e 100");
      return;
    }
    if (!tipoAuditoria) {
      setError("Selecione o tipo de auditoria (Supervisor ou Auditor)");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          funcionario_id: funcionario.id,
          data_avaliacao: dataAvaliacao,
          ...notas,
          comentario: comentario.trim() || null,
          atraso,
          falta,
          uso_ferramenta: usoFerramenta,
          erro_critico: erroCritico,
          perc_produtividade: percProdutividade,
          nota_auditoria: notaAuditoria,
          tipo_auditoria: tipoAuditoria,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao salvar avaliação");
      }

      toast.success("Avaliação registrada com sucesso");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Avaliação</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-5">
          {/* Select funcionário */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="funcionario">
              Funcionário <span className="text-destructive">*</span>
            </Label>
            <Select
              value={funcionario ? String(funcionario.id) : ""}
              onValueChange={(v) => {
                const found = funcionarios.find((f) => String(f.id) === v);
                setFuncionario(found ?? null);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Selecionar funcionário..." />
              </SelectTrigger>
              <SelectContent>
                {funcionarios.map((func) => (
                  <SelectItem key={func.id} value={String(func.id)}>
                    {func.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date input */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="data-avaliacao">Data da Avaliação</Label>
            <Input
              id="data-avaliacao"
              type="date"
              value={dataAvaliacao}
              onChange={(e) => setDataAvaliacao(e.target.value)}
              className="w-44"
            />
          </div>

          {/* Divisória Notas */}
          <h3 className="font-medium text-sm">Notas por Categoria</h3>

          {/* Grid 2-col de 6 inputs numéricos */}
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIAS.map((cat) => (
              <div key={cat.key} className="flex flex-col gap-1">
                <Label htmlFor={cat.key}>{cat.label}</Label>
                <Input
                  id={cat.key}
                  type="number"
                  min={1}
                  max={10}
                  step={1}
                  value={notas[cat.key] || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 0 && val <= 10) {
                      setNotas((prev) => ({ ...prev, [cat.key]: val }));
                    }
                  }}
                  placeholder="1-10"
                />
              </div>
            ))}

            {/* Produtividade (%) — no lugar da antiga produtividade 1-10 */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="perc-produtividade">Produtividade (%)</Label>
              <Input
                id="perc-produtividade"
                type="number"
                min={0}
                step={1}
                value={percProdutividade ?? ""}
                onChange={(e) => setPercProdutividade(e.target.value ? Number(e.target.value) : null)}
                placeholder="Ex: 110"
              />
            </div>
          </div>

          {/* Média preview */}
          {mediaPreview !== null && (
            <p className="text-muted-foreground text-sm">
              Média: <strong>{mediaPreview.toFixed(2)}</strong>
            </p>
          )}

          {/* === Ocorrências === */}
          <h3 className="font-medium text-sm">Ocorrências</h3>

          {/* Grid 2-col de checkboxes */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "atraso", label: "Atraso", checked: atraso, setter: setAtraso },
              { key: "falta", label: "Falta", checked: falta, setter: setFalta },
              { key: "uso_ferramenta", label: "Uso de Ferramenta", checked: usoFerramenta, setter: setUsoFerramenta },
              { key: "erro_critico", label: "Erro Crítico", checked: erroCritico, setter: setErroCritico },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={item.key}
                  checked={item.checked}
                  onCheckedChange={(checked) => item.setter(checked === true)}
                />
                <Label htmlFor={item.key}>{item.label}</Label>
              </div>
            ))}
          </div>

          {/* === Auditoria === */}
          <h3 className="font-medium text-sm">Auditoria</h3>

          {/* Grid 2-col inputs numéricos */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="nota-auditoria">Nota da Auditoria (0-100)</Label>
              <Input
                id="nota-auditoria"
                type="number"
                min={0}
                max={100}
                step={1}
                value={notaAuditoria ?? ""}
                onChange={(e) => setNotaAuditoria(e.target.value ? Number(e.target.value) : null)}
                placeholder="0-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Tipo de Auditoria</Label>
              <Select value={tipoAuditoria} onValueChange={setTipoAuditoria}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="auditor">Auditor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Textarea comentário */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="comentario">
              Comentário <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Comentários sobre a avaliação..."
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground"
            />
          </div>

          {/* Error inline */}
          {error && <p className="text-destructive text-xs">{error}</p>}

          {/* Botões */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar Avaliação"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

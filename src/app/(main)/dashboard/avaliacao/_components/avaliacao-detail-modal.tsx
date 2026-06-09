"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AvaliacaoDetalhada {
  id: number;
  funcionario_nome: string;
  data_avaliacao: string;
  pontualidade: number;
  qualidade: number;
  trabalho_equipa: number;
  iniciativa: number;
  comunicacao: number;
  media: number;
  comentario: string | null;
  created_at: string;
}

interface AvaliacaoDetailModalProps {
  avaliacaoId: number;
  open: boolean;
  onClose: () => void;
}

const CATEGORIAS: { key: keyof AvaliacaoDetalhada; label: string }[] = [
  { key: "pontualidade", label: "Pontualidade" },
  { key: "qualidade", label: "Qualidade" },
  { key: "trabalho_equipa", label: "Trabalho em Equipa" },
  { key: "iniciativa", label: "Iniciativa" },
  { key: "comunicacao", label: "Comunicação" },
];

export function AvaliacaoDetailModal({ avaliacaoId, open, onClose }: AvaliacaoDetailModalProps) {
  const [data, setData] = useState<AvaliacaoDetalhada | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && avaliacaoId) {
      setLoading(true);
      setData(null);
      fetch(`/api/avaliacoes/${avaliacaoId}`)
        .then((r) => r.json())
        .then((d: AvaliacaoDetalhada) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [open, avaliacaoId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalhes da Avaliação</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : data ? (
          <div className="flex flex-col gap-4">
            {/* Funcionário + Data */}
            <div className="flex justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Funcionário</p>
                <p className="font-medium">{data.funcionario_nome}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground text-xs">Data</p>
                <p className="font-medium">{data.data_avaliacao}</p>
              </div>
            </div>

            <hr />

            {/* Notas por Categoria */}
            <p className="font-medium text-sm">Notas por Categoria</p>
            <div className="grid grid-cols-2 gap-3">
              {CATEGORIAS.map((cat) => (
                <div key={cat.key} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{cat.label}</span>
                  <Badge variant="outline" className="font-mono">
                    {String(data[cat.key])}
                  </Badge>
                </div>
              ))}
            </div>

            <hr />

            {/* Média Geral */}
            <div className="flex items-center justify-between">
              <p className="font-medium">Média Geral</p>
              <Badge className="px-3 py-1 text-base">{data.media.toFixed(2)}</Badge>
            </div>

            {/* Comentário */}
            {data.comentario && (
              <>
                <hr />
                <div>
                  <p className="text-muted-foreground text-xs">Comentário</p>
                  <p className="whitespace-pre-wrap text-sm">{data.comentario}</p>
                </div>
              </>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

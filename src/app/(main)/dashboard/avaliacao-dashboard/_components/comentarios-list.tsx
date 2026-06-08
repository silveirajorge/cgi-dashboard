"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Comentario {
  data: string;
  tipo: string;
  comentario: string;
}

interface ComentariosListProps {
  comentarios: Comentario[];
}

function formatDateBR(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function tipoBadgeClass(tipo: string): string {
  if (tipo === "supervisor") return "bg-[#3b82f6]/20 text-[#3b82f6]";
  return "bg-[#22c55e]/20 text-[#22c55e]";
}

export function ComentariosList({ comentarios }: ComentariosListProps) {
  const sorted = [...comentarios].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const latest = sorted[0] ?? null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Último Comentário</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {!latest ? (
          <p className="text-muted-foreground text-sm">Nenhum comentário registado.</p>
        ) : (
          <div className="flex flex-col gap-1.5 rounded-lg border p-3">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">{formatDateBR(latest.data)}</span>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${tipoBadgeClass(latest.tipo)}`}
              >
                {latest.tipo === "supervisor" ? "Supervisor" : "Auditor"}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{latest.comentario}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

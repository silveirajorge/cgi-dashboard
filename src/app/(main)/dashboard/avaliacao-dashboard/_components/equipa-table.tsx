"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { ScoreBadge } from "./score-badge";
import { StarRating } from "./star-rating";

interface TeamMember {
  id: number;
  nome: string;
  avg_produtividade: number | null;
  total_atrasos: number;
  total_faltas: number;
  total_erros: number;
  uso_ferramenta: boolean;
  media_auditor: number | null;
  media_supervisor: number | null;
  score_final: number;
  status: string;
}

interface EquipaTableProps {
  team: TeamMember[];
  onFuncionarioClick?: (id: number) => void;
}

export function EquipaTable({ team, onFuncionarioClick }: EquipaTableProps) {
  const sorted = [...team].sort((a, b) => b.score_final - a.score_final);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Atrasos/Faltas</TableHead>
          <TableHead>SpeedOps</TableHead>
          <TableHead>Erro Crítico</TableHead>
          <TableHead>Produtividade (%)</TableHead>
          <TableHead>Avaliação Auditor</TableHead>
          <TableHead>Avaliação Supervisor</TableHead>
          <TableHead>Score Final</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((m) => (
          <TableRow key={m.id} className="cursor-pointer" onClick={() => onFuncionarioClick?.(m.id)}>
            <TableCell className="font-medium">{m.nome}</TableCell>
            <TableCell title={`${m.total_atrasos} atraso(s) · ${m.total_faltas} falta(s)`}>
              {m.total_atrasos + m.total_faltas}
            </TableCell>
            <TableCell>
              <span className={m.uso_ferramenta ? "text-[#22c55e]" : "text-[#ef4444]"}>
                {m.uso_ferramenta ? "✓" : "✗"}
              </span>
            </TableCell>
            <TableCell className={m.total_erros > 0 ? "text-[#ef4444]" : ""}>{m.total_erros}</TableCell>
            <TableCell>{m.avg_produtividade !== null ? `${m.avg_produtividade.toFixed(0)}%` : "---"}</TableCell>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs">{m.media_auditor !== null ? m.media_auditor.toFixed(1) : "---"}</span>
                {m.media_auditor !== null && <StarRating nota={m.media_auditor} />}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs">{m.media_supervisor !== null ? m.media_supervisor.toFixed(1) : "---"}</span>
                {m.media_supervisor !== null && <StarRating nota={m.media_supervisor} />}
              </div>
            </TableCell>
            <TableCell className="font-bold">{m.score_final}</TableCell>
            <TableCell>
              <ScoreBadge status={m.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

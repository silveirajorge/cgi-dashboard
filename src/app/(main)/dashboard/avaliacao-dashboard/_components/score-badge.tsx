"use client";

import { Badge } from "@/components/ui/badge";

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "destructive"; className: string }> = {
  excelente: {
    label: "Excelente",
    variant: "default",
    className: "bg-[#22c55e]/20 text-[#22c55e] hover:bg-[#22c55e]/30",
  },
  bom: {
    label: "Bom",
    variant: "default",
    className: "bg-[#3b82f6]/20 text-[#3b82f6] hover:bg-[#3b82f6]/30",
  },
  atencao: {
    label: "Atenção",
    variant: "default",
    className: "bg-[#eab308]/20 text-[#eab308] hover:bg-[#eab308]/30",
  },
  critico: {
    label: "Crítico",
    variant: "destructive",
    className: "",
  },
};

export function ScoreBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.critico;
  return (
    <Badge variant={cfg.variant} className={cfg.className}>
      {cfg.label}
    </Badge>
  );
}

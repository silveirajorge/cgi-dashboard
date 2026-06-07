"use client";

import { Minus, TrendingDown, TrendingUp } from "lucide-react";

export function TendenciaIndicator({ current, previous }: { current: number | null; previous: number | null }) {
  if (current === null || previous === null) {
    return <span className="text-[#71717a] text-xs">—</span>;
  }
  const diff = current - previous;
  if (Math.abs(diff) < 0.01) {
    return (
      <span className="flex items-center gap-1 text-[#71717a] text-xs">
        <Minus size={12} /> {diff >= 0 ? "+" : ""}
        {diff.toFixed(1)}
      </span>
    );
  }
  const isPositive = diff > 0;
  return (
    <span className={`flex items-center gap-1 text-xs ${isPositive ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {isPositive ? "+" : ""}
      {diff.toFixed(1)}
    </span>
  );
}

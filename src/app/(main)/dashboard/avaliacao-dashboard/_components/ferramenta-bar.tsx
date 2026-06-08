"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FerramentaBarProps {
  utilizouPct: number;
  naoUtilizouPct: number;
  utilizouCount: number;
  naoUtilizouCount: number;
}

export function FerramentaBar({ utilizouPct, naoUtilizouPct, utilizouCount, naoUtilizouCount }: FerramentaBarProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Uso de SpeedOps</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-0">
        <div className="flex flex-1 items-center">
          <div className="flex h-8 w-full overflow-hidden rounded-lg bg-muted">
            <div
              className="flex items-center px-2 text-xs font-medium text-white"
              style={{ width: `${utilizouPct}%`, background: "#3b82f6" }}
            >
              {utilizouPct > 15 && `${utilizouPct.toFixed(0)}%`}
            </div>
            <div
              className="flex items-center justify-center text-xs font-medium text-white"
              style={{ width: `${naoUtilizouPct}%`, background: "#ef4444" }}
            >
              {naoUtilizouPct > 15 && `${naoUtilizouPct.toFixed(0)}%`}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm" style={{ background: "#3b82f6" }} />
            Utilizou: <strong>{utilizouPct.toFixed(0)}%</strong> ({utilizouCount})
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-sm" style={{ background: "#ef4444" }} />
            Não utilizou: <strong>{naoUtilizouPct.toFixed(0)}%</strong> ({naoUtilizouCount})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

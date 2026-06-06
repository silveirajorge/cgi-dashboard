"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TipologySectionProps {
  tipologiasPorCanal: Record<string, Array<{ justificacao: string; count: number }>>;
}

const CHANNEL_ORDER = ["Back-Office", "Email", "Portal", "Telefone Front", "Outros"];

export function TipologySection({ tipologiasPorCanal }: TipologySectionProps) {
  const channels = CHANNEL_ORDER.filter((c) => tipologiasPorCanal[c]);

  if (channels.length === 0) return null;

  return (
    <div className="rounded-xl border bg-card p-4">
      <h3 className="mb-4 font-semibold text-sm">Tipologias por Canal (Top 5)</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {channels.map((canal) => {
          const tipologias = tipologiasPorCanal[canal];
          return (
            <Card key={canal}>
              <CardHeader>
                <CardTitle className="text-sm">{canal}</CardTitle>
              </CardHeader>
              <CardContent>
                {tipologias.length > 0 ? (
                  <ol className="space-y-1">
                    {tipologias.map((t, i) => (
                      <li key={t.justificacao} className="flex items-start gap-1 text-xs">
                        <span className="mt-px flex size-4 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-[10px] text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="text-muted-foreground">{t.justificacao}</span>
                        <span className="ml-auto shrink-0 font-medium tabular-nums">{t.count}</span>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-muted-foreground text-xs">Sem dados</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

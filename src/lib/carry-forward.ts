export function fillCarryForward<T extends Record<string, unknown>>(weeks: string[], data: T[], kpis: string[]): T[] {
  const dataMap = new Map(data.map((d) => [d.week as string, d]));
  const lastKnown: Record<string, unknown> = {};
  return weeks.map((week) => {
    if (dataMap.has(week)) {
      const entry = dataMap.get(week) as T;
      for (const kpi of kpis) {
        if (entry[kpi] !== null && entry[kpi] !== undefined) lastKnown[kpi] = entry[kpi];
      }
      return entry;
    }
    const carried = { ...({ week } as unknown as T) };
    for (const kpi of kpis) {
      (carried as Record<string, unknown>)[kpi] = lastKnown[kpi] ?? null;
    }
    return carried;
  });
}

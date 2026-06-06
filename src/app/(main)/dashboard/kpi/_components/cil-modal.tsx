"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CilModalProps {
  cil: string | null;
  from: string;
  to: string;
  onClose: () => void;
}

interface CilRecord {
  [key: string]: string;
}

interface CilDetailResponse {
  total: number;
  records: CilRecord[];
}

const ESTADOS = ["Todos", "Fechado", "Pendente", "Aberto"];
const FIXED_COLUMNS = ["id_contacto", "estado", "dt_registo", "dt_contato", "justificação", "receção", "cil"];

export function CilModal({ cil, from, to, onClose }: CilModalProps) {
  const [records, setRecords] = useState<CilRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState("Todos");

  useEffect(() => {
    if (!cil) return;

    setLoading(true);
    const params = new URLSearchParams({ from, to });
    if (estadoFilter !== "Todos") {
      params.set("estado", estadoFilter);
    }

    fetch(`/api/cil/${cil}?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Erro ao carregar registros");
        const json: CilDetailResponse = await res.json();
        setRecords(json.records);
        setTotal(json.total);
      })
      .catch(() => {
        setRecords([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [cil, from, to, estadoFilter]);

  function exportCsv() {
    if (records.length === 0) return;

    const headers = Object.keys(records[0]);
    const csvContent = [
      headers.join(","),
      ...records.map((r) => headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cil-${cil}-${from}-${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog
      open={cil !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            CIL {cil} &mdash; {total} registros
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Estado:</span>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs">
              Exibindo {records.length} de {total} registros
            </span>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              Exportar CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {FIXED_COLUMNS.map((col) => (
                    <TableHead key={col}>{col}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={FIXED_COLUMNS.length} className="text-center text-muted-foreground">
                      Nenhum registro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record) => (
                    <TableRow key={`${record.id_contacto ?? ""}-${record.dt_registo ?? ""}`}>
                      {FIXED_COLUMNS.map((col) => (
                        <TableCell key={col}>{record[col] ?? ""}</TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

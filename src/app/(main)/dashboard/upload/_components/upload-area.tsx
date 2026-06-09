"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { splitCsvIntoChunks } from "@/lib/csv-split";
import { cn } from "@/lib/utils";

const CHUNK_UPLOAD_LIMIT = 48 * 1024 * 1024;

export function UploadArea() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Apenas arquivos CSV são aceitos");
      return;
    }

    setIsUploading(true);

    try {
      if (file.size > CHUNK_UPLOAD_LIMIT) {
        await handleChunkedUpload(file);
      } else {
        await handleSingleUpload(file);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Erro ao processar upload";
      toast.error(message);
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleSingleUpload(file: File): Promise<void> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao processar upload");
    }

    toast.success(`Upload realizado: ${data.rows_imported} linhas importadas, ${data.rows_ignored} ignoradas`, {
      action: {
        label: "Ver Dashboard",
        onClick: () => router.push("/dashboard/kpi"),
      },
    });
  }

  async function handleChunkedUpload(file: File): Promise<void> {
    setUploadProgress("Preparando arquivo...");

    const { chunks, totalChunks } = await splitCsvIntoChunks(file);

    let totalImported = 0;
    let totalIgnored = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      setUploadProgress(`Enviando parte ${i + 1} de ${totalChunks}...`);

      const formData = new FormData();
      formData.append("file", chunk.blob, chunk.name);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Parte ${i + 1}/${totalChunks} falhou: ${data.error || "Erro ao processar upload"}`);
      }

      totalImported += data.rows_imported;
      totalIgnored += data.rows_ignored;
    }

    toast.success(
      `Upload concluído: ${totalImported} linhas importadas, ${totalIgnored} ignoradas (${totalChunks} partes)`,
      {
        action: {
          label: "Ver Dashboard",
          onClick: () => router.push("/dashboard/kpi"),
        },
      },
    );
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      void handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleClick() {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      void handleFile(e.target.files[0]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-semibold text-2xl">Upload de CSV</h1>

      {/* biome-ignore lint/a11y/useSemanticElements: drag & drop requires div for proper HTML5 DnD */}
      <div
        role="button"
        tabIndex={0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2",
          "rounded-lg border-2 border-dashed p-12",
          "transition-colors duration-200",
          isUploading && "pointer-events-none opacity-70",
          isDragOver ? "border-primary bg-accent" : "border-border hover:border-primary hover:bg-accent/50",
        )}
      >
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleInputChange} />

        {isUploading ? (
          <Loader2 className="size-12 animate-spin text-muted-foreground" />
        ) : (
          <Upload className={cn("size-12", isDragOver ? "text-primary-foreground" : "text-muted-foreground")} />
        )}

        <p className="font-medium text-base">
          {isUploading
            ? uploadProgress || "Enviando..."
            : isDragOver
              ? "Solte o arquivo aqui"
              : "Arraste o arquivo CSV aqui"}
        </p>

        {!isUploading && (
          <p className="text-muted-foreground text-xs">ou clique para selecionar &middot; CSV sem limite de tamanho</p>
        )}
      </div>
    </div>
  );
}

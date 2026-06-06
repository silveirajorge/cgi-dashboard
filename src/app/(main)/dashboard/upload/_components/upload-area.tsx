"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function UploadArea() {
  const router = useRouter();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Apenas arquivos CSV são aceitos");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Arquivo excede o limite de 50MB");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    fetch("/api/upload", { method: "POST", body: formData })
      .then(async (res) => {
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
      })
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      });
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
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleClick() {
    if (!isUploading) {
      inputRef.current?.click();
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
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
          {isUploading ? "Enviando..." : isDragOver ? "Solte o arquivo aqui" : "Arraste o arquivo CSV aqui"}
        </p>

        {!isUploading && (
          <p className="text-muted-foreground text-xs">ou clique para selecionar &middot; CSV até 50MB</p>
        )}
      </div>
    </div>
  );
}

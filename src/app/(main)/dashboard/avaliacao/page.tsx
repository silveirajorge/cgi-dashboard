import { AvaliacoesPageClient } from "./_components/avaliacoes-page-client";

export default function AvaliacaoPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-2xl">Avaliação</h1>
      </div>
      <AvaliacoesPageClient />
    </div>
  );
}

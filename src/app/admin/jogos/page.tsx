"use client";

import { Gamepad2 } from "lucide-react";

export default function AdminJogosPage() {
  return (
    <div>
      <h2 className="text-base font-bold text-text-primary mb-4">Gerenciar Jogos</h2>
      <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
        <Gamepad2 className="h-10 w-10 text-text-muted mx-auto mb-3" />
        <p className="text-text-muted text-sm">
          Gerenciamento de jogos manuais sera migrado em uma proxima versao.
        </p>
        <p className="text-text-muted text-xs mt-2">
          Os jogos sao gerenciados automaticamente via AllSportsApi e CBF.
        </p>
      </div>
    </div>
  );
}

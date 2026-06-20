"use client";

import { useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

// Confirmação segura: "Cancelar" é o botão padrão (autofocus) -> Enter NÃO apaga.
// Excluir exige clicar explicitamente em "Sim, excluir".
export function useConfirm() {
  const [state, setState] = useState<{ message: string; resolve: (v: boolean) => void } | null>(null);

  const confirm = useCallback(
    (message: string) => new Promise<boolean>((resolve) => setState({ message, resolve })),
    []
  );

  function close(v: boolean) {
    state?.resolve(v);
    setState(null);
  }

  const dialog = state ? (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={() => close(false)}>
      <div className="bg-surface rounded-xl border border-border-custom shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 flex items-start gap-3">
          <div className="shrink-0 mt-0.5 rounded-full bg-red-light p-2"><AlertTriangle className="h-5 w-5 text-red" /></div>
          <p className="text-sm text-text-primary leading-relaxed">{state.message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button autoFocus onClick={() => close(false)}
            className="flex-1 py-2.5 border border-border-custom text-text-secondary rounded-lg text-sm font-semibold hover:bg-body">
            Cancelar
          </button>
          <button onClick={() => close(true)}
            className="flex-1 py-2.5 bg-red text-white rounded-lg text-sm font-semibold hover:opacity-90">
            Sim, excluir
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, dialog };
}

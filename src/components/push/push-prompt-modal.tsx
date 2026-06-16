"use client";

import { useEffect, useState } from "react";
import { Bell, X, Loader2 } from "lucide-react";
import { pushSupported, getSubscription, enablePush } from "@/lib/push-client";

const DISMISS_KEY = "pdb_push_prompt_dismissed";
const DELAY_MS = 9000; // espera ~9s pra não competir com o banner de cookies

export function PushPromptModal() {
  const [open, setOpen] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!pushSupported()) return;
    if (Notification.permission !== "default") return; // já permitiu ou bloqueou
    if (localStorage.getItem(DISMISS_KEY)) return; // já fechou antes

    let cancelled = false;
    const t = setTimeout(async () => {
      const sub = await getSubscription();
      if (!cancelled && !sub) setOpen(true);
    }, DELAY_MS);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
  }

  async function accept() {
    setWorking(true);
    const result = await enablePush();
    setWorking(false);
    // Em qualquer desfecho (ativou ou bloqueou no prompt nativo), não mostra de novo.
    localStorage.setItem(DISMISS_KEY, "1");
    setOpen(false);
    void result;
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* backdrop */}
      <button
        aria-label="Fechar"
        onClick={dismiss}
        className="absolute inset-0 bg-black/50"
      />

      {/* card */}
      <div className="animate-modal-pop relative w-full max-w-[360px] rounded-2xl bg-surface p-6 text-center shadow-2xl">
        <button
          aria-label="Fechar"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-full p-1 text-text-muted transition-colors hover:bg-body hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {/* sino animado */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-light">
          <Bell className="animate-bell-swing h-8 w-8 text-green" />
        </div>

        <h2 className="mb-2 text-lg font-bold text-text-primary">
          Não perca nenhum gol!
        </h2>
        <p className="mb-5 text-sm text-text-muted">
          Receba alertas de gols, resultados e as principais notícias da Copa do Mundo
          direto no seu aparelho.
        </p>

        <button
          onClick={accept}
          disabled={working}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-green px-6 py-3 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
        >
          {working ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Aguarde…
            </>
          ) : (
            "Eu quero"
          )}
        </button>
      </div>
    </div>
  );
}

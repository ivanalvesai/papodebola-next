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

      {/* card retangular (horizontal): sino | texto | botão */}
      <div className="animate-modal-pop relative flex w-full max-w-[560px] items-center gap-4 rounded-xl bg-surface py-4 pl-4 pr-10 shadow-2xl sm:gap-5 sm:pr-12">
        <button
          aria-label="Fechar"
          onClick={dismiss}
          className="absolute right-2 top-2 rounded-full p-1 text-text-muted transition-colors hover:bg-body hover:text-text-primary"
        >
          <X className="h-5 w-5" />
        </button>

        {/* sino animado */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-light sm:h-14 sm:w-14">
          <Bell className="animate-bell-swing h-6 w-6 text-green sm:h-7 sm:w-7" />
        </div>

        {/* texto */}
        <div className="min-w-0 flex-1 text-left">
          <h2 className="text-sm font-bold text-text-primary sm:text-base">
            Não perca nenhum gol!
          </h2>
          <p className="text-xs text-text-muted sm:text-sm">
            Receba alertas de gols e as principais notícias da Copa.
          </p>
        </div>

        {/* botão */}
        <button
          onClick={accept}
          disabled={working}
          className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-green px-5 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:text-base"
        >
          {working ? <Loader2 className="h-5 w-5 animate-spin" /> : "Eu quero"}
        </button>
      </div>
    </div>
  );
}

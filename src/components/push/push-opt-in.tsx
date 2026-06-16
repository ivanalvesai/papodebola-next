"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { pushSupported, getSubscription, enablePush, disablePush } from "@/lib/push-client";
import { track } from "@/lib/analytics";

type State = "loading" | "unsupported" | "default" | "denied" | "subscribed" | "working";

export function PushOptIn({ className = "" }: { className?: string }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (!pushSupported()) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    getSubscription().then((sub) => setState(sub ? "subscribed" : "default"));
  }, []);

  async function enable() {
    setState("working");
    const result = await enablePush();
    setState(result === "subscribed" ? "subscribed" : result === "denied" ? "denied" : "default");
    if (result === "subscribed") track("push_subscribed", { source: "menu" });
    else if (result === "denied") track("push_blocked", { source: "menu" });
  }

  async function disable() {
    setState("working");
    await disablePush();
    setState("default");
    track("push_unsubscribed", { source: "menu" });
  }

  if (state === "loading" || state === "unsupported") return null;

  const base = `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${className}`;

  if (state === "denied") {
    return (
      <div className={`${base} cursor-default text-text-muted`} title="Você bloqueou as notificações no navegador">
        <BellOff className="h-4 w-4 shrink-0" />
        Alertas bloqueados
      </div>
    );
  }

  if (state === "working") {
    return (
      <div className={`${base} text-text-muted`}>
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        Aguarde…
      </div>
    );
  }

  if (state === "subscribed") {
    return (
      <button onClick={disable} className={`${base} text-green hover:bg-green-light w-full`}>
        <BellRing className="h-4 w-4 shrink-0" />
        Alertas ativados · desativar
      </button>
    );
  }

  return (
    <button onClick={enable} className={`${base} bg-green text-white hover:opacity-90 w-full justify-center`}>
      <Bell className="h-4 w-4 shrink-0" />
      Ativar alertas de gols
    </button>
  );
}

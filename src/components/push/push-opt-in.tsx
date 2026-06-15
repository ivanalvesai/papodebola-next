"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

// Converte a chave pública VAPID (base64url) pro formato que o PushManager espera.
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type State = "loading" | "unsupported" | "default" | "denied" | "subscribed" | "working";

export function PushOptIn({ className = "" }: { className?: string }) {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window) ||
      !VAPID_PUBLIC_KEY
    ) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    // Já inscrito?
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => setState(sub ? "subscribed" : "default"))
      .catch(() => setState("default"));
  }, []);

  async function enable() {
    setState("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "default");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub.toJSON() }),
      });
      setState(res.ok ? "subscribed" : "default");
    } catch {
      setState("default");
    }
  }

  async function disable() {
    setState("working");
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {});
        await sub.unsubscribe().catch(() => {});
      }
      setState("default");
    } catch {
      setState("subscribed");
    }
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

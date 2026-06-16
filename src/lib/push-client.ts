// Utilitários de web push no lado do cliente (compartilhados pelo botão do menu
// e pelo modal de opt-in). Só roda no navegador.

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export type PushState = "subscribed" | "denied" | "default" | "error";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window &&
    !!VAPID_PUBLIC_KEY
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export async function getSubscription(): Promise<PushSubscription | null> {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    return (await reg?.pushManager.getSubscription()) ?? null;
  } catch {
    return null;
  }
}

// Dispara o prompt nativo, registra o SW, assina e salva no servidor.
export async function enablePush(): Promise<PushState> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return permission === "denied" ? "denied" : "default";
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
    return res.ok ? "subscribed" : "error";
  } catch {
    return "error";
  }
}

export async function disablePush(): Promise<boolean> {
  try {
    const sub = await getSubscription();
    if (sub) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => {});
      await sub.unsubscribe().catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

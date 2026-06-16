import webpush from "web-push";
import { getSubs, removeSub } from "@/lib/data/push-store";

// Configura o web-push com as chaves VAPID (uma vez por processo).
let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:contato@papodebola.com.br";
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

// Envia pra todas as assinaturas. Remove as que o provedor diz estarem mortas
// (404/410). Retorna contagem de enviadas e removidas.
export async function sendToAll(payload: PushPayload): Promise<{
  sent: number;
  failed: number;
  removed: number;
  total: number;
}> {
  if (!configure()) throw new Error("VAPID keys ausentes (VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY)");

  const subs = await getSubs();
  let sent = 0;
  let failed = 0;
  let removed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify(payload)
        );
        sent++;
      } catch (e: unknown) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) {
          await removeSub(s.endpoint);
          removed++;
        } else {
          failed++;
        }
      }
    })
  );

  return { sent, failed, removed, total: subs.length };
}

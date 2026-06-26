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

export interface PushOptions {
  // Validade em SEGUNDOS. O serviço de push DESCARTA a mensagem se não conseguir
  // entregar dentro do TTL (device offline). Sem isto, o web-push usa o padrão de
  // ~4 SEMANAS → notificações velhas chegam acumuladas quando o device volta online.
  ttl?: number;
  // "high" entrega na hora; pushes de placar/jogo querem isto.
  urgency?: "very-low" | "low" | "normal" | "high";
  // Colapsa: um push novo com o MESMO topic substitui o anterior ainda não
  // entregue (ex: vários "GOL" do mesmo jogo viram só o último placar).
  topic?: string;
}

// Envia pra todas as assinaturas. Remove as que o provedor diz estarem mortas
// (404/410). Retorna contagem de enviadas e removidas.
export async function sendToAll(
  payload: PushPayload,
  options: PushOptions = {}
): Promise<{
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

  // TTL padrão 4h (não as ~4 semanas do web-push). Caller pode encurtar (gol/jogo).
  const sendOpts: webpush.RequestOptions = { TTL: options.ttl ?? 4 * 3600 };
  if (options.urgency) sendOpts.urgency = options.urgency;
  if (options.topic) sendOpts.topic = options.topic;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          JSON.stringify(payload),
          sendOpts
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

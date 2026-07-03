import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// AO VIVO dos "Jogos do municipal" (só teste). Regra pedida pelo Ivan pra economizar
// consulta ao YouTube:
//  - antes do apito: não vivo.
//  - do apito até +90min: considera AO VIVO (sem bater no YouTube).
//  - de +90min até +3h: consulta o YouTube a cada ~5min só pra ver se ACABOU; quando
//    detecta que não está mais ao vivo, marca "encerrado" e PARA de consultar.
//  - depois de +3h: encerrado.
// O client (card na lista + página do jogo) faz polling leve deste endpoint.
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const MIN = 60_000;
const CHECK_EVERY = 5 * MIN;
const WINDOW_ASSUME_LIVE = 90 * MIN;
const WINDOW_MAX = 3 * 60 * MIN;

// cache em memória (persiste no processo do next start): throttle + lembra "encerrado".
const cache = new Map<string, { live: boolean; ended: boolean; checkedAt: number }>();

function ytId(url: string): string {
  const m = String(url || "").match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/))([\w-]{11})/
  );
  return m ? m[1] : "";
}
function parseStart(date: string, time: string): number {
  const d = String(date || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
  const t = String(time || "").match(/(\d{1,2})[h:](\d{2})/);
  if (!d) return 0;
  return Date.UTC(+d[3], +d[2] - 1, +d[1], +(t ? t[1] : 0) + 3, +(t ? t[2] : 0));
}

// true = ao vivo agora, false = não está ao vivo, null = não deu pra checar (erro de rede).
// Marcador correto: liveBroadcastDetails."isLiveNow":true. NÃO usar "isLive" (é só "é
// transmissão", true também em agendado/encerrado → falso-positivo).
async function isLiveNow(videoId: string): Promise<boolean | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9",
        Cookie: "CONSENT=YES+1",
      },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const html = await res.text();
    return /"isLiveNow"\s*:\s*true/.test(html);
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  const out: Record<string, { live: boolean; state: string }> = {};
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "municipalGames", limit: 100, depth: 0, pagination: false });
    for (const d of res.docs as any[]) {
      const start = parseStart(d.date, d.time);
      const vid = ytId(d.youtubeUrl);
      if (!start || !vid) {
        out[d.slug] = { live: false, state: "unknown" };
        continue;
      }
      if (now < start) {
        out[d.slug] = { live: false, state: "upcoming" };
      } else if (now < start + WINDOW_ASSUME_LIVE) {
        out[d.slug] = { live: true, state: "live" };
      } else if (now < start + WINDOW_MAX) {
        const c = cache.get(vid);
        if (c?.ended) {
          out[d.slug] = { live: false, state: "ended" };
        } else if (c && now - c.checkedAt < CHECK_EVERY) {
          out[d.slug] = { live: c.live, state: c.live ? "live" : "ended" };
        } else {
          const res2 = await isLiveNow(vid);
          if (res2 === false) {
            // confirmadamente fora do ar após 90min = acabou → marca e PARA de consultar.
            cache.set(vid, { live: false, ended: true, checkedAt: now });
            out[d.slug] = { live: false, state: "ended" };
          } else {
            // true OU erro de rede (null) → mantém ao vivo (não encerra por um erro).
            cache.set(vid, { live: true, ended: false, checkedAt: now });
            out[d.slug] = { live: true, state: "live" };
          }
        }
      } else {
        out[d.slug] = { live: false, state: "ended" };
      }
    }
  } catch {
    /* devolve o que tiver */
  }
  return NextResponse.json(out, { headers: { "Cache-Control": "no-store" } });
}

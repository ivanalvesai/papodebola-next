import { NextResponse } from "next/server";
import {
  getWorldCupLiveMatches,
  getTodayMatches,
  getTomorrowMatches,
  WORLD_CUP_LEAGUE_ID,
} from "@/lib/data/matches";
import { getNotifiedSet, markNotified } from "@/lib/data/push-kickoff-store";
import { sendToAll } from "@/lib/services/push";

export const dynamic = "force-dynamic";

// "Porteira": janela em torno do HORÁRIO MARCADO em que vale a pena consultar o
// feed ao vivo. Abre um pouco antes e fica aberta bastante depois pra cobrir
// atraso no apito (jogo raramente começa cravado no horário).
const GATE_BEFORE_S = 5 * 60; // abre 5min antes do horário marcado
const GATE_AFTER_S = 30 * 60; // fecha 30min depois (cobre atraso)

// Disparo: só notifica se o apito REAL (timestamp do feed ao vivo) foi nos
// últimos 20min — evita avisar jogo já rolando no 1º run / após cron fora do ar.
const SEND_RECENT_S = 20 * 60;

// Há algum jogo da Copa perto do horário? Usa a agenda em cache (reusada da home,
// custo ~zero), pra só consultar o feed AO VIVO quando vale a pena.
async function hasWorldCupMatchNear(now: number): Promise<boolean> {
  const [today, tomorrow] = await Promise.all([
    getTodayMatches().catch(() => []),
    getTomorrowMatches().catch(() => []),
  ]);
  return [...today, ...tomorrow].some((m) => {
    if (m.leagueId !== WORLD_CUP_LEAGUE_ID || !m.timestamp) return false;
    const delta = now - m.timestamp; // <0 ainda vai começar, >0 já passou do horário
    return delta >= -GATE_BEFORE_S && delta <= GATE_AFTER_S;
  });
}

// Cron de "começou o jogo da Copa". Chamado a cada ~1min por um cron no servidor
// (no dev, que é quem consulta a API). Protegido por secret (?secret=).
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now() / 1000;

  // Porteira: fora da janela de qualquer jogo, nem consulta o feed ao vivo.
  if (!(await hasWorldCupMatchNear(now))) {
    return NextResponse.json({ ok: true, skipped: "nenhum jogo perto do horario" });
  }

  const live = await getWorldCupLiveMatches().catch(() => []);
  const notified = await getNotifiedSet();

  let sent = 0;
  let skippedOld = 0;
  const toMark: number[] = [];

  for (const m of live) {
    // só jogos em andamento (kickoff/1ºT/2ºT/intervalo), nunca encerrados
    if (m.status !== "live" && m.status !== "halftime") continue;
    if (notified.has(m.apiId)) continue;

    const recent = m.timestamp > 0 && now - m.timestamp <= SEND_RECENT_S;
    if (recent) {
      try {
        await sendToAll({
          title: "🟢 Começou o jogo!",
          body: `${m.homeTeam} x ${m.awayTeam} — Copa do Mundo. Acompanhe ao vivo!`,
          url: m.href || "/futebol/copa-do-mundo",
          tag: `copa-kickoff-${m.apiId}`,
        });
        sent++;
      } catch {
        // não marca em caso de erro de envio → tenta de novo no próximo tick
        continue;
      }
    } else {
      skippedOld++;
    }
    toMark.push(m.apiId);
  }

  await markNotified(toMark);

  return NextResponse.json({
    ok: true,
    liveWorldCup: live.length,
    notified: sent,
    skippedOld,
  });
}

import { NextResponse } from "next/server";
import { getWorldCupLiveMatches } from "@/lib/data/matches";
import { getNotifiedSet, markNotified } from "@/lib/data/push-kickoff-store";
import { sendToAll } from "@/lib/services/push";

export const dynamic = "force-dynamic";

// Só notifica jogos que começaram há pouco (evita avisar jogo já rolando no
// primeiro run / após o cron ficar fora do ar).
const KICKOFF_WINDOW_S = 20 * 60;

// Cron de "começou o jogo da Copa". Chamado a cada ~1min por um cron no servidor
// (no dev, que é quem consulta a API). Protegido por secret (?secret=).
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const live = await getWorldCupLiveMatches().catch(() => []);
  const notified = await getNotifiedSet();
  const now = Date.now() / 1000;

  let sent = 0;
  let skippedOld = 0;
  const toMark: number[] = [];

  for (const m of live) {
    // só jogos em andamento (kickoff/1ºT/2ºT/intervalo), nunca encerrados
    if (m.status !== "live" && m.status !== "halftime") continue;
    if (notified.has(m.apiId)) continue;

    const recent = m.timestamp > 0 && now - m.timestamp <= KICKOFF_WINDOW_S;
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

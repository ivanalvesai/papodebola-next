import { NextResponse } from "next/server";
import {
  getWorldCupLiveMatches,
  getTodayMatches,
  getTomorrowMatches,
  WORLD_CUP_LEAGUE_ID,
} from "@/lib/data/matches";
import { getNotifiedSet, markNotified } from "@/lib/data/push-kickoff-store";
import { getMaxTotals, saveMaxTotals } from "@/lib/data/push-goal-store";
import { sendToAll } from "@/lib/services/push";

export const dynamic = "force-dynamic";

// "Porteira": janela em torno do HORÁRIO MARCADO em que vale a pena consultar o
// feed ao vivo. Abre um pouco antes do apito e fica aberta o JOGO TODO (gol
// acontece a qualquer momento) — knockout com prorrogação+pênaltis chega a ~160min,
// + folga pra atraso no início.
const GATE_BEFORE_S = 5 * 60; // abre 5min antes do horário marcado
const GATE_AFTER_S = 200 * 60; // fica aberta ~3h20 depois (cobre jogo inteiro + atraso)

// "Começou": só notifica se o apito REAL (timestamp do feed) foi nos últimos 20min
// — evita avisar jogo já rolando no 1º run / após cron fora do ar.
const SEND_RECENT_S = 20 * 60;

// Há algum jogo da Copa na janela? Usa a agenda em cache (reusada da home, custo
// ~zero), pra só consultar o feed AO VIVO quando há jogo em andamento.
async function hasWorldCupMatchInWindow(now: number): Promise<boolean> {
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

// Cron de push da Copa: "começou o jogo" + "GOL!" (placar na hora). Chamado a cada
// ~1min por um cron no servidor (no dev, que consulta a API). Secret em ?secret=.
export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!secret || secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = Date.now() / 1000;

  // Porteira: fora das janelas de jogo, nem consulta o feed ao vivo.
  if (!(await hasWorldCupMatchInWindow(now))) {
    return NextResponse.json({ ok: true, skipped: "nenhum jogo na janela" });
  }

  const live = await getWorldCupLiveMatches().catch(() => []);
  const notified = await getNotifiedSet();
  const maxTotals = await getMaxTotals();

  let kickoffs = 0;
  let goals = 0;
  let skippedOld = 0;
  const toMark: number[] = [];
  let scoresChanged = false;

  for (const m of live) {
    // só jogos em andamento (kickoff/1ºT/2ºT/intervalo), nunca encerrados
    if (m.status !== "live" && m.status !== "halftime") continue;

    // ---- "Começou o jogo" (1x por jogo) ----
    if (!notified.has(m.apiId)) {
      const recent = m.timestamp > 0 && now - m.timestamp <= SEND_RECENT_S;
      if (recent) {
        try {
          await sendToAll(
            {
              title: "🟢 Começou o jogo!",
              body: `${m.homeTeam} x ${m.awayTeam} — Copa do Mundo. Acompanhe ao vivo!`,
              url: m.href || "/futebol/copa-do-mundo",
              tag: `copa-kickoff-${m.apiId}`,
            },
            // expira em 30min: quem ligar o device depois não recebe "começou" de jogo já no fim
            { ttl: 1800, urgency: "high", topic: `k${m.apiId}` }
          );
          kickoffs++;
          toMark.push(m.apiId);
        } catch {
          // não marca → tenta de novo no próximo tick
        }
      } else {
        skippedOld++;
        toMark.push(m.apiId);
      }
    }

    // ---- "GOL!" (placar na hora, via highwater pra não re-disparar) ----
    const h = m.homeScore ?? 0;
    const a = m.awayScore ?? 0;
    const total = h + a;
    const key = String(m.apiId);
    const prevMax = maxTotals[key];

    if (prevMax === undefined) {
      // 1ª vez que vemos o jogo → semeia o placar atual (não anuncia gols passados)
      maxTotals[key] = total;
      scoresChanged = true;
    } else if (total > prevMax) {
      try {
        await sendToAll(
          {
            title: "⚽ GOL!",
            body: `${m.homeTeam} ${h} x ${a} ${m.awayTeam} — Copa do Mundo`,
            url: m.href || "/futebol/copa-do-mundo",
            tag: `copa-goal-${m.apiId}`, // mesma tag por jogo → mostra sempre o placar atual
          },
          // expira em 15min e colapsa por jogo: offline durante o jogo = recebe só o
          // último placar (não um gol de 1h atrás), e nada se o jogo já acabou faz tempo
          { ttl: 900, urgency: "high", topic: `g${m.apiId}` }
        );
        goals++;
        maxTotals[key] = total;
        scoresChanged = true;
      } catch {
        // não atualiza o highwater → tenta de novo no próximo tick
      }
    }
  }

  await markNotified(toMark);
  if (scoresChanged) await saveMaxTotals(maxTotals);

  return NextResponse.json({
    ok: true,
    liveWorldCup: live.length,
    kickoffs,
    goals,
    skippedOld,
  });
}

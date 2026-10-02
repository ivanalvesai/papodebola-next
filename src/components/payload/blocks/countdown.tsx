/* eslint-disable @typescript-eslint/no-explicit-any */
import { getTeamPageDataFor } from "@/lib/data/team";
import { teamInfoFromDoc } from "@/lib/data/payload-teams";
import { getMatchDetail } from "@/lib/data/match-detail";
import { nextMatchFor } from "@/lib/countdown";
import { resolveTeam } from "../data-blocks";
import { CountdownClient, type CountdownMatch } from "./countdown-client";

// SERVER-ONLY. Contagem regressiva até o próximo jogo: `matchId` (se informado) tem prioridade;
// senão, o próximo jogo do `team`. Orçamento de 4 s por busca (a página nunca pendura esperando
// a API). Sem jogo, jogo encerrado ou qualquer erro → null.

const BUDGET_MS = 4000;
function withBudget<T>(p: Promise<T>): Promise<T | null> {
  return Promise.race([p, new Promise<null>((res) => setTimeout(() => res(null), BUDGET_MS))]);
}

const FINISHED = new Set(["finished", "canceled", "cancelled", "postponed"]);

function formatWhen(timestamp: number): string {
  try {
    const d = new Date(timestamp * 1000);
    const date = d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "short", day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
    return `${date} · ${time}`;
  } catch {
    return "";
  }
}

async function resolveMatch(block: any): Promise<CountdownMatch | null> {
  const team = block.team ? await resolveTeam(block.team) : null;
  const teamHref = team?.slug ? `/futebol/times/${team.slug}/jogo-hoje` : null;

  const matchId = Number(block.matchId);
  if (matchId > 0) {
    const detail = await withBudget(getMatchDetail(matchId));
    const e = detail?.event;
    if (!e?.startTimestamp || FINISHED.has(e.statusType)) return null;
    return { home: e.home, away: e.away, homeId: e.homeId, awayId: e.awayId, timestamp: e.startTimestamp, league: null, href: teamHref };
  }

  if (!team) return null;
  const data = await withBudget(getTeamPageDataFor(teamInfoFromDoc(team)));
  const m = nextMatchFor(data);
  if (!m?.timestamp) return null;
  return { home: m.home, away: m.away, homeId: m.homeId, awayId: m.awayId, timestamp: m.timestamp, league: m.league, href: teamHref };
}

export async function CountdownBlock({ block }: { block: any }) {
  let match: CountdownMatch | null = null;
  try {
    match = await resolveMatch(block);
  } catch {
    return null;
  }
  if (!match || !match.home || !match.away) return null;
  match.when = formatWhen(match.timestamp);
  return <CountdownClient title={block.title || "Próximo jogo"} match={match} showInfo={block.showBroadcast !== false} />;
}

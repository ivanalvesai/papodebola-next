import { TOURNAMENTS, TOURNAMENT_BY_SLUG, type Tournament } from "@/lib/config";
import { getAmistosoFixtures, AMISTOSOS_LEAGUE } from "@/lib/data/amistosos";
import type { ChampionshipMatch } from "@/types/match";
import { dayFromChampionships } from "./map-match.ts";
import type { DiaCampeonatoV1 } from "./dto.ts";
import { getChampionshipData } from "@/lib/data/championship";
import { readSnapshot } from "@/lib/data/snapshot-store";
import type { ChampionshipData } from "@/types/tournament";
import type { AgendaLeagueGroup } from "@/lib/data/agenda";
import { V1ErrorLike } from "./v1-error.ts";

import { ownGet } from "./validate.ts";
export { parseId, parseDay, isStale } from "./validate.ts";

export async function championship(slug: string): Promise<{ t: Tournament; d: ChampionshipData }> {
  const t = ownGet(TOURNAMENT_BY_SLUG, slug);
  if (!t || !t.seasonId) throw new V1ErrorLike(404, "nao_encontrado", "Campeonato não encontrado.");
  const d = await getChampionshipData(slug);
  if (!d) throw new V1ErrorLike(503, "indisponivel", "Dados do campeonato ainda não coletados.");
  return { t, d };
}

const brToday = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export async function todayStore(): Promise<{ leagues: AgendaLeagueGroup[]; updatedAt: string | null }> {
  const s = await readSnapshot<{ date: string; updatedAt: string; leagues: AgendaLeagueGroup[] }>("agenda", "football-today");
  if (!s || s.date !== brToday()) return { leagues: [], updatedAt: null };
  return { leagues: s.leagues || [], updatedAt: s.updatedAt };
}

// Jogos de um dia (que não seja hoje) a partir dos snapshots de campeonato no disco: cobre todas
// as rodadas das temporadas configuradas sem consultar o fornecedor. Amistosos vêm do índice
// durável (getAmistosoFixtures). [start, end) = o dia em BRT.
export async function dayFromSnapshots(day: Date): Promise<DiaCampeonatoV1[]> {
  const start = Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 3) / 1000;
  const end = start + 86400;
  const champs = await Promise.all(
    Object.values(TOURNAMENTS)
      .filter((t) => t.seasonId)
      .map(async (t) => {
        const d = await readSnapshot<ChampionshipData>("championships", t.slug);
        const seen = new Map<number, ChampionshipMatch>();
        for (const list of Object.values(d?.matchesByRound || {})) for (const m of list) seen.set(m.id, m);
        return { nome: t.name, jogos: [...seen.values()] };
      })
  );
  const amistosos = await getAmistosoFixtures().catch(() => []);
  champs.push({
    nome: AMISTOSOS_LEAGUE,
    jogos: amistosos.map((f) => ({
      id: f.id, home: f.home, away: f.away, homeId: f.homeId, awayId: f.awayId,
      homeScore: f.homeScore, awayScore: f.awayScore, status: f.status || "notstarted",
      statusDesc: f.statusDesc || "", timestamp: f.timestamp, round: 0,
    })),
  });
  return dayFromChampionships(champs, start, end);
}

export const isTodayBrt = (day: Date) => day.toISOString().slice(0, 10) === brToday();

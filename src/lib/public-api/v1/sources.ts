import { TOURNAMENT_BY_SLUG, type Tournament } from "@/lib/config";
import { getChampionshipData } from "@/lib/data/championship";
import { readSnapshot } from "@/lib/data/snapshot-store";
import type { ChampionshipData } from "@/types/tournament";
import type { AgendaLeagueGroup } from "@/lib/data/agenda";
import { V1ErrorLike } from "./v1-error.ts";

export { parseId, parseDay, isStale } from "./validate.ts";

export async function championship(slug: string): Promise<{ t: Tournament; d: ChampionshipData }> {
  const t = TOURNAMENT_BY_SLUG[slug];
  if (!t) throw new V1ErrorLike(404, "nao_encontrado", "Campeonato não encontrado.");
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

import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENTS } from "@/lib/config";
import { translateCountry } from "@/lib/i18n/countries";
import { withSnapshot } from "./snapshot-store";
import type { StandingsGroup, StandingRow } from "@/types/standings";

/* eslint-disable @typescript-eslint/no-explicit-any */

function normalizeStandingRow(row: any): StandingRow {
  return {
    pos: row.position ?? 0,
    team: row.team?.name || "",
    teamId: row.team?.id || 0,
    pts: row.points ?? 0,
    matches: row.matches ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0,
    gf: row.scoresFor ?? 0,
    ga: row.scoresAgainst ?? 0,
    gd: (row.scoresFor ?? 0) - (row.scoresAgainst ?? 0),
    promo: row.promotion?.text || "",
    posChange: 0,
    recentForm: [],
  };
}

// Only 1 API request — just the standings table
export async function getStandings(
  tournamentId: number,
  seasonId: number,
  revalidate: number = 3600
): Promise<StandingsGroup[]> {
  const data = await fetchAllSports<any>(
    `tournament/${tournamentId}/season/${seasonId}/standings/total`,
    revalidate
  );

  if (!data?.standings) return [];

  return data.standings.map((group: any) => ({
    name: group.name || "",
    rows: (group.rows || []).map(normalizeStandingRow),
  }));
}

export async function getBrasileiraoStandings(): Promise<StandingsGroup[]> {
  const t = TOURNAMENTS.BRASILEIRAO_A;
  if (!t.seasonId) return [];
  return getStandings(t.id, t.seasonId);
}

// Copa do Mundo 2026 (Sofascore tournament 16 / season 58210).
// Mantido fora de TOURNAMENTS de propósito: é temporário (sai da home quando a
// Copa acabar) e a página /futebol/[slug] só renderiza 1 grupo, então não vale
// expor /futebol/copa-do-mundo. A home mostra todos os grupos via widget próprio.
const WORLD_CUP = { id: 16, seasonId: 58210 } as const;

// Retorna só os 12 grupos (A–L), traduzidos pra PT-BR. A API também devolve um
// grupo "Third-placed teams" (ranking dos 3os colocados) que filtramos fora.
export async function getWorldCupStandings(): Promise<StandingsGroup[]> {
  return (
    (await withSnapshot<StandingsGroup[]>(
      "worldcup",
      "standings",
      () => fetchWorldCupStandingsLive(),
      (d) => Array.isArray(d) && d.length > 0
    )) || []
  );
}

async function fetchWorldCupStandingsLive(): Promise<StandingsGroup[]> {
  // TTL curto (5 min) durante a Copa: os pontos precisam refletir o fim do jogo
  // rapido — senao a tabela mostra placar provisorio de jogo ao vivo por muito
  // tempo (ex: Portugal 3pts num jogo que terminou empatado). A bolinha de forma
  // ja atualiza em ~30 min via jogos; isso alinha os pontos. O TTL e propagado ao
  // proxy via _pdbttl, entao vale ponta-a-ponta (inclusive na prod).
  const groups = await getStandings(WORLD_CUP.id, WORLD_CUP.seasonId, 300);
  return groups
    .filter((g) => /^group\s/i.test(g.name))
    .map((g) => ({
      name: g.name.replace(/^group/i, "Grupo"),
      rows: g.rows.map((r) => ({ ...r, team: translateCountry(r.team) })),
    }));
}

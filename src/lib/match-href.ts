// Página do jogo a partir do torneio: campeonato com página → /futebol/{camp}/jogo/…,
// Copa → /futebol/copa-do-mundo/jogo/…; sem página (amistoso, estadual fora do config)
// → null (o card fica sem link). Puro: as dependências vêm por parâmetro (testável).
export type MatchHrefInput = {
  uniqueTournamentId: number;
  tournamentName: string;
  timestamp: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
};

export type MatchHrefDeps = {
  champSlugById: Record<number, string>;
  isWorldCup: (m: MatchHrefInput) => boolean;
  worldCupHref: (ts: number, homeId: number, awayId: number, home: string, away: string) => string;
  champHref: (slug: string, ts: number, homeId: number, awayId: number, home: string, away: string) => string;
};

export function matchHref(m: MatchHrefInput, d: MatchHrefDeps): string | null {
  if (!m.timestamp || !m.homeId || !m.awayId) return null;
  if (d.isWorldCup(m)) return d.worldCupHref(m.timestamp, m.homeId, m.awayId, m.home, m.away);
  const slug = d.champSlugById[m.uniqueTournamentId];
  return slug ? d.champHref(slug, m.timestamp, m.homeId, m.awayId, m.home, m.away) : null;
}

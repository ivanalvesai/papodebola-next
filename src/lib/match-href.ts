// Página do jogo a partir do torneio: campeonato com página → /futebol/{camp}/jogo/…,
// Copa → /futebol/copa-do-mundo/jogo/…; sem página (amistoso, estadual fora do config)
// → null (o card fica sem link). Puro: as dependências vêm por parâmetro (testável).
// A URL do campeonato (sem -id) só resolve se o jogo está na tabela carregada (rodadas até
// a atual+1, temporada do config): por isso só linka jogo da temporada configurada que já
// aconteceu ou acontece em até maxAheadSec — senão o link daria 404.
export type MatchHrefInput = {
  uniqueTournamentId: number;
  tournamentName: string;
  timestamp: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  seasonId?: number; // season.id do evento (0/ausente = não checa)
};

export type MatchHrefDeps = {
  champSlugById: Record<number, string>;
  champSeasonById: Record<number, number>;
  nowSec: number;
  maxAheadSec: number;
  isWorldCup: (m: MatchHrefInput) => boolean;
  worldCupHref: (ts: number, homeId: number, awayId: number, home: string, away: string) => string;
  champHref: (slug: string, ts: number, homeId: number, awayId: number, home: string, away: string) => string;
};

export function matchHref(m: MatchHrefInput, d: MatchHrefDeps): string | null {
  if (!m.timestamp || !m.homeId || !m.awayId) return null;
  if (d.isWorldCup(m)) return d.worldCupHref(m.timestamp, m.homeId, m.awayId, m.home, m.away);
  const slug = d.champSlugById[m.uniqueTournamentId];
  if (!slug) return null;
  if (m.seasonId && d.champSeasonById[m.uniqueTournamentId] !== m.seasonId) return null;
  if (m.timestamp - d.nowSec > d.maxAheadSec) return null;
  return d.champHref(slug, m.timestamp, m.homeId, m.awayId, m.home, m.away);
}

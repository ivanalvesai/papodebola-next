// Predicado PURO (sem imports de servidor) pra saber se um jogo é da Copa do Mundo.
// Esses jogos já têm página canônica em /futebol/copa-do-mundo/jogo/{data}/{par}
// (worldCupMatchHref, em ./world-cup-match-url.ts). Usado por:
// (1) selecaoMatchHref — hub da Seleção linka pra lá em vez de duplicar em
//     /futebol/selecao-brasileira/{data}/{par};
// (2) a página de jogo da Seleção — redireciona (permanentRedirect) pra lá;
// (3) o sitemap — não lista a versão duplicada (o bloco da Copa já lista).
//
// uniqueTournament.id 16 = Copa do Mundo (mesmo id de WORLD_CUP_LEAGUE_ID em
// src/lib/data/matches.ts — não importado aqui pra manter este módulo client-safe).
const WORLD_CUP_TOURNAMENT_ID = 16;

// Nomes EXATOS (case-insensitive) — não usar "contém", senão "World Cup Qual. CONMEBOL"
// (Eliminatórias) e afins também bateriam.
const WORLD_CUP_NAMES = new Set(["fifa world cup", "world cup", "copa do mundo"]);

export interface WorldCupFixtureLike {
  tournamentName?: string | null;
  uniqueTournamentId?: number | null;
}

export function isWorldCupFixture(f: WorldCupFixtureLike): boolean {
  if (f.uniqueTournamentId === WORLD_CUP_TOURNAMENT_ID) return true;
  const name = (f.tournamentName || "").trim().toLowerCase();
  return WORLD_CUP_NAMES.has(name);
}

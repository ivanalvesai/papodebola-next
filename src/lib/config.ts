export interface Tournament {
  id: number;
  name: string;
  seasonId: number | null;
  slug: string;
}

export const TOURNAMENTS: Record<string, Tournament> = {
  // Brasil - Nacionais
  BRASILEIRAO_A:  { id: 325,   name: 'Brasileirão Série A',  seasonId: 87678, slug: 'brasileirao-serie-a' },
  BRASILEIRAO_B:  { id: 390,   name: 'Brasileirão Série B',  seasonId: 89840, slug: 'brasileirao-serie-b' },
  BRASILEIRAO_C:  { id: 1281,  name: 'Brasileirão Série C',  seasonId: null,  slug: 'brasileirao-serie-c' },
  BRASILEIRAO_D:  { id: 10326, name: 'Brasileirão Série D',  seasonId: null,  slug: 'brasileirao-serie-d' },
  COPA_DO_BRASIL: { id: 373,   name: 'Copa do Brasil',       seasonId: 89353, slug: 'copa-do-brasil' },
  COPA_NORDESTE:  { id: 1596,  name: 'Copa do Nordeste',     seasonId: 91324, slug: 'copa-do-nordeste' },

  // Brasil - Estaduais
  PAULISTA:       { id: 372,   name: 'Paulista Série A1',    seasonId: 86993, slug: 'paulista' },
  CARIOCA:        { id: 92,    name: 'Carioca',              seasonId: 86674, slug: 'carioca' },
  MINEIRO:        { id: 379,   name: 'Mineiro',              seasonId: 87236, slug: 'mineiro' },
  GAUCHO:         { id: 377,   name: 'Gaúcho',               seasonId: 86736, slug: 'gaucho' },
  PARANAENSE:     { id: 382,   name: 'Paranaense',           seasonId: 86658, slug: 'paranaense' },
  PERNAMBUCANO:   { id: 380,   name: 'Pernambucano',         seasonId: 87395, slug: 'pernambucano' },

  // Sul-Americano
  LIBERTADORES:   { id: 384,   name: 'Copa Libertadores',    seasonId: 87760, slug: 'libertadores' },
  SUDAMERICANA:   { id: 480,   name: 'Copa Sudamericana',    seasonId: 87770, slug: 'sudamericana' },

  // Europa - UEFA
  CHAMPIONS:      { id: 7,     name: 'Champions League',     seasonId: 76953, slug: 'champions-league' },
  EUROPA_LEAGUE:  { id: 679,   name: 'Europa League',        seasonId: 76984, slug: 'europa-league' },

  // Europa - Ligas
  PREMIER:        { id: 17,    name: 'Premier League',       seasonId: 76986, slug: 'premier-league' },
  LA_LIGA:        { id: 8,     name: 'La Liga',              seasonId: 77559, slug: 'la-liga' },
  SERIE_A_IT:     { id: 23,    name: 'Serie A (Itália)',      seasonId: 76457, slug: 'serie-a-italia' },
  BUNDESLIGA:     { id: 35,    name: 'Bundesliga',           seasonId: 77333, slug: 'bundesliga' },
  LIGUE_1:        { id: 34,    name: 'Ligue 1',              seasonId: 77356, slug: 'ligue-1' },
} as const;

export interface TeamInfo {
  name: string;
  id: number;
  slug: string;
}

export const TEAMS: TeamInfo[] = [
  // Brasileirão Série A 2026 (20 clubes - IDs verificados via API standings)
  { name: 'Palmeiras',      id: 1963,  slug: 'palmeiras' },
  { name: 'Flamengo',       id: 5981,  slug: 'flamengo' },
  { name: 'São Paulo',      id: 1981,  slug: 'sao-paulo' },
  { name: 'Fluminense',     id: 1961,  slug: 'fluminense' },
  { name: 'Bahia',          id: 1955,  slug: 'bahia' },
  { name: 'Athletico-PR',   id: 1967,  slug: 'athletico-pr' },
  { name: 'Coritiba',       id: 1982,  slug: 'coritiba' },
  { name: 'Atlético-MG',    id: 1977,  slug: 'atletico-mg' },
  { name: 'Bragantino',     id: 1999,  slug: 'bragantino' },
  { name: 'Vitória',        id: 1962,  slug: 'vitoria' },
  { name: 'Botafogo',       id: 1958,  slug: 'botafogo' },
  { name: 'Grêmio',         id: 5926,  slug: 'gremio' },
  { name: 'Vasco',          id: 1974,  slug: 'vasco' },
  { name: 'Internacional',  id: 1966,  slug: 'internacional' },
  { name: 'Santos',         id: 1968,  slug: 'santos' },
  { name: 'Corinthians',    id: 1957,  slug: 'corinthians' },
  { name: 'Cruzeiro',       id: 1954,  slug: 'cruzeiro' },
  { name: 'Remo',           id: 2012,  slug: 'remo' },
  { name: 'Chapecoense',    id: 21845, slug: 'chapecoense' },
  { name: 'Mirassol',       id: 21982, slug: 'mirassol' },

  // Europa
  { name: 'Real Madrid',     id: 2829, slug: 'real-madrid' },
  { name: 'Barcelona',       id: 2817, slug: 'barcelona' },
  { name: 'Liverpool',       id: 44,   slug: 'liverpool' },
  { name: 'Manchester City', id: 17,   slug: 'manchester-city' },
  { name: 'Manchester United', id: 35, slug: 'manchester-united' },
  { name: 'Chelsea',         id: 38,   slug: 'chelsea' },
  { name: 'Tottenham',       id: 33,   slug: 'tottenham' },
  { name: 'Arsenal',         id: 42,   slug: 'arsenal' },
  { name: 'Juventus',        id: 2687, slug: 'juventus' },
  { name: 'Milan',           id: 2692, slug: 'milan' },
  { name: 'Inter Milan',     id: 2697, slug: 'inter-milan' },
  { name: 'Bayern',          id: 2672, slug: 'bayern' },
  { name: 'PSG',             id: 1644, slug: 'psg' },
  { name: 'Porto',           id: 3002, slug: 'porto' },
  { name: 'Nott. Forest',    id: 174,  slug: 'nottingham-forest' },
  { name: 'Aston Villa',     id: 40,   slug: 'aston-villa' },
  { name: 'Dortmund',        id: 2673, slug: 'dortmund' },
];

export const TEAM_BY_SLUG: Record<string, TeamInfo> = Object.fromEntries(
  TEAMS.map(t => [t.slug, t])
);

export const TEAM_BY_ID: Record<number, TeamInfo> = Object.fromEntries(
  TEAMS.map(t => [t.id, t])
);

export const CATEGORIES = {
  brasil: [325, 390, 1281, 10326, 373, 1596, 372, 92, 379, 377, 382, 380],
  europa: [7, 679, 17, 8, 23, 35, 34],
  sulamericano: [384, 480],
} as const;

export const TOURNAMENT_BY_ID: Record<number, Tournament> = Object.fromEntries(
  Object.values(TOURNAMENTS).map(t => [t.id, t])
);

export const TOURNAMENT_BY_SLUG: Record<string, Tournament> = Object.fromEntries(
  Object.values(TOURNAMENTS).map(t => [t.slug, t])
);

export function getLeagueCategory(tournamentId: number): string {
  for (const [cat, ids] of Object.entries(CATEGORIES)) {
    if ((ids as readonly number[]).includes(tournamentId)) return cat;
  }
  return 'all';
}

export function getLeagueName(tournamentId: number): string {
  return TOURNAMENT_BY_ID[tournamentId]?.name || '';
}

// CBF API IDs (2026 season)
export const CBF_IDS = {
  BRASILEIRAO_A: 1260611,
  BRASILEIRAO_B: 1260612,
  COPA_DO_BRASIL: 1260615,
  SUPERCOPA: 1260616,
  COPA_NORDESTE: 1260624,
} as const;

// Sports — cada esporte tem URL top-level. Basquete tem landing + /basquete/nba;
// os outros são single-page diretos. Boxe e Futsal adicionados em 17/04/2026.
export const SPORTS = [
  { slug: 'basquete',           name: 'Basquete',          icon: 'basketball', href: '/basquete' },
  { slug: 'tenis',              name: 'Tênis',             icon: 'tennis',     href: '/tenis' },
  { slug: 'formula-1',          name: 'Fórmula 1',         icon: 'flag',       href: '/formula-1' },
  { slug: 'combate',            name: 'Combate',           icon: 'swords',     href: '/combate' },
  { slug: 'volei',              name: 'Vôlei',             icon: 'volleyball', href: '/volei' },
  { slug: 'esports',            name: 'eSports',           icon: 'gamepad',    href: '/esports' },
  { slug: 'futebol-americano',  name: 'Futebol Americano', icon: 'football',   href: '/futebol-americano' },
  { slug: 'boxe',               name: 'Boxe',              icon: 'swords',     href: '/boxe' },
  { slug: 'futsal',             name: 'Futsal',            icon: 'football',   href: '/futsal' },
] as const;

// WordPress categories for article filters
export const WP_CATEGORIES = [
  'Brasileirão',
  'Copa do Brasil',
  'Copa do Mundo',
  'Seleção Brasileira',
  'Copa Libertadores',
  'Champions League',
  'Premier League',
  'La Liga',
  'Futebol Internacional',
  'Mercado da Bola',
  'Copa Sudamericana',
  'Eliminatórias',
  'Futebol Brasileiro',
] as const;

// Brasileirão Série A: all 20 teams (for nav, side panel, etc.)
const SERIE_A_SLUGS = [
  'palmeiras','flamengo','sao-paulo','fluminense','bahia','athletico-pr',
  'coritiba','atletico-mg','bragantino','vitoria','botafogo','gremio',
  'vasco','internacional','santos','corinthians','cruzeiro','remo',
  'chapecoense','mirassol',
];
export const PANEL_TEAMS_BR: TeamInfo[] = TEAMS.filter(t => SERIE_A_SLUGS.includes(t.slug));

// Side panel: European teams (all 17)
const EU_SLUGS = [
  'real-madrid','barcelona','liverpool','manchester-city','manchester-united',
  'chelsea','tottenham','arsenal','juventus','milan','inter-milan',
  'bayern','psg','porto','nottingham-forest','aston-villa','dortmund',
];
export const PANEL_TEAMS_EU: TeamInfo[] = TEAMS.filter(t => EU_SLUGS.includes(t.slug));

// All teams with cluster pages (BR + EU)
export const ALL_CLUSTER_TEAMS: TeamInfo[] = [...PANEL_TEAMS_BR, ...PANEL_TEAMS_EU];

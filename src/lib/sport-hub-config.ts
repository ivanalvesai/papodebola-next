// Campeonatos acompanhados nas páginas de cada esporte (eSports, tênis, combate, vôlei...).
// A API não lista jogos por data nesses esportes (o feed {esporte}/matches/{d}/{m}/{y} dá 404),
// então cada campeonato entra pelo ID de torneio: tournament/{id}/seasons + season/{s}/matches.
// Mapa dos IDs: docs/knowledge/2026-11-15-guias-terca-mapa-outros-esportes.md §2.
//
// Os dados ficam gravados em data/snapshots/sport-hub/ (cron do DEV, /api/sport-hub/refresh);
// as páginas só leem do disco. Campeonato novo: basta incluir aqui.

export type HubMode = "season" | "events"; // events = cada "season" é um evento (cards do UFC)

export interface HubTournament {
  id: number;
  name: string; // nome exibido (PT-BR)
  mode?: HubMode;
  // Liga com temporada curta de transição (ex.: CBLOL "Promotion 2027"): mostra também a
  // classificação da temporada anterior quando a atual tem pouco jogo.
  prevSeason?: boolean;
  watchKey?: string; // chave do bloco "onde assistir" (sport-hub-watch.ts)
}

export interface HubGroup {
  key: string;
  title: string; // H2 da seção (ex.: "League of Legends")
  intro: string;
  tournaments: HubTournament[];
  watch?: string[]; // "onde assistir" do grupo mesmo sem campeonato com ID (ex.: Valorant)
}

export interface SportHubConfig {
  sportKey: string; // mesma chave do SPORT_CONFIGS (sports.ts) e da página
  scoreLabel?: string; // o que o placar conta: "mapas", "sets"...
  groups: HubGroup[];
}

export const SPORT_HUBS: Record<string, SportHubConfig> = {
  esports: {
    sportKey: "esports",
    scoreLabel: "mapas",
    groups: [
      {
        key: "lol",
        title: "League of Legends",
        intro:
          "O LoL da Riot Games tem o calendário mais longo dos eSports: ligas regionais em dois splits, o MSI no meio do ano e o Mundial (Worlds) no fim da temporada. No Brasil, a liga é o CBLOL.",
        tournaments: [
          { id: 16053, name: "Worlds (Mundial de LoL)", watchKey: "worlds" },
          { id: 16048, name: "CBLOL", prevSeason: true, watchKey: "cblol" },
          { id: 21683, name: "Red Bull League of Its Own" },
          { id: 16050, name: "MSI", watchKey: "msi" },
          { id: 25058, name: "First Stand", watchKey: "first_stand" },
          { id: 16057, name: "LCK (Coreia do Sul)", prevSeason: true, watchKey: "lck" },
          { id: 16056, name: "LPL (China)", prevSeason: true },
          { id: 16021, name: "LEC (Europa)", prevSeason: true },
          { id: 16020, name: "LCS (América do Norte)", prevSeason: true },
          { id: 22725, name: "Esports World Cup" },
          { id: 32711, name: "Americas Cup" },
        ],
      },
      {
        key: "cs2",
        title: "Counter-Strike 2",
        intro:
          "O CS2 tem dois Majors por ano, os torneios mais importantes da Valve, além de IEM, ESL Pro League, BLAST e StarLadder. No Brasil, a Gamers Club Masters reúne os principais times do país.",
        tournaments: [
          { id: 16312, name: "PGL Major", watchKey: "cs_major" },
          { id: 16163, name: "IEM", watchKey: "cs_iem_esl" },
          { id: 16311, name: "StarLadder StarSeries" },
          { id: 16279, name: "Gamers Club Masters", watchKey: "cs_gamers_club" },
        ],
      },
      {
        key: "dota2",
        title: "Dota 2",
        intro:
          "No Dota 2, o The International é o Mundial da modalidade e um dos maiores prêmios dos eSports. No resto do ano, o circuito passa por PGL, ESL One e DreamLeague.",
        tournaments: [
          { id: 16273, name: "The International", watchKey: "dota_ti" },
          { id: 16271, name: "PGL Wallachia", watchKey: "dota_circuito" },
          { id: 16265, name: "ESL One", watchKey: "dota_circuito" },
          { id: 16254, name: "DreamLeague", watchKey: "dota_circuito" },
        ],
      },
      {
        key: "valorant",
        title: "Valorant",
        intro:
          "O VCT, circuito oficial da Riot, tem as ligas regionais (o Brasil joga o VCT Americas), dois Masters por ano e o Champions, o Mundial do Valorant.",
        tournaments: [],
        watch: ["valorant_vct"],
      },
    ],
  },
  tenis: {
    sportKey: "tenis",
    scoreLabel: "sets",
    groups: [
      {
        key: "finals",
        title: "ATP Finals",
        intro:
          "O ATP Finals fecha a temporada em Turim com os oito melhores do ano, divididos em dois grupos; os dois primeiros de cada grupo vão à semifinal. Nas duplas, os brasileiros Orlando Luz e Rafael Matos estão na disputa.",
        tournaments: [
          { id: 2517, name: "ATP Finals (simples)", watchKey: "atp_finals" },
          { id: 2385, name: "ATP Finals (duplas)", watchKey: "atp_finals" },
        ],
      },
      {
        key: "slams",
        title: "Grand Slams",
        intro: "Os quatro torneios mais importantes do tênis, disputados em melhor de cinco sets no masculino.",
        tournaments: [
          { id: 2363, name: "Australian Open", watchKey: "grand_slams" },
          { id: 2480, name: "Roland Garros", watchKey: "grand_slams" },
          { id: 2361, name: "Wimbledon", watchKey: "grand_slams" },
          { id: 2449, name: "US Open", watchKey: "grand_slams" },
        ],
      },
      {
        key: "masters",
        title: "Masters 1000",
        intro: "A segunda prateleira do circuito ATP, com os principais nomes do ranking em quase todas as edições.",
        tournaments: [
          { id: 2487, name: "Indian Wells", watchKey: "atp_wta" },
          { id: 2430, name: "Miami", watchKey: "atp_wta" },
          { id: 2391, name: "Monte Carlo", watchKey: "atp_wta" },
          { id: 2374, name: "Madri", watchKey: "atp_wta" },
          { id: 2488, name: "Roma", watchKey: "atp_wta" },
          { id: 2373, name: "Cincinnati", watchKey: "atp_wta" },
          { id: 2519, name: "Xangai", watchKey: "atp_wta" },
          { id: 2404, name: "Paris", watchKey: "atp_wta" },
        ],
      },
      {
        key: "davis",
        title: "Copa Davis",
        intro: "A competição de seleções do tênis masculino.",
        tournaments: [{ id: 2287, name: "Copa Davis" }],
      },
    ],
  },
  combate: {
    sportKey: "combate",
    groups: [
      {
        key: "ufc",
        title: "UFC",
        intro:
          "Os próximos eventos do UFC, com o card completo de cada noite: lutas, categorias de peso e resultados dos eventos que já aconteceram.",
        tournaments: [{ id: 19906, name: "UFC", mode: "events", watchKey: "ufc" }],
      },
    ],
  },
  volei: {
    sportKey: "volei",
    scoreLabel: "sets",
    groups: [
      {
        key: "superliga",
        title: "Superliga",
        intro:
          "A Superliga é o principal campeonato de clubes do vôlei brasileiro. A temporada 2026/27 começou em outubro, com turno e returno na fase classificatória e playoffs a partir de março.",
        tournaments: [{ id: 1468, name: "Superliga Feminina", watchKey: "superliga_volei" }],
      },
      {
        key: "internacional",
        title: "Vôlei internacional",
        intro: "Os principais torneios de clubes fora do Brasil, com o Mundial de Clubes no fim do ano.",
        tournaments: [
          { id: 860, name: "Mundial de Clubes Feminino" },
          { id: 587, name: "Champions League Feminina" },
        ],
      },
    ],
  },
  futsal: {
    sportKey: "futsal",
    groups: [
      {
        key: "futsal",
        title: "Futsal",
        intro:
          "No Brasil, a Liga Nacional de Futsal (LNF) reúne os principais clubes do país. Na Europa, os destaques são a Champions League de futsal da UEFA e a liga espanhola, a mais forte do mundo.",
        tournaments: [
          { id: 770, name: "Champions League de Futsal (UEFA)" },
          { id: 593, name: "Liga Espanhola de Futsal" },
        ],
        watch: ["lnf"],
      },
    ],
  },
  "basquete-nba": {
    sportKey: "basquete-nba",
    groups: [
      {
        key: "europa",
        title: "Basquete europeu",
        intro: "A Euroliga é a principal competição de clubes da Europa, com os grandes times da Espanha, Turquia, Grécia, Itália e Sérvia.",
        tournaments: [{ id: 138, name: "Euroliga" }],
        watch: ["nba", "nbb"],
      },
    ],
  },
};

export function hubTournamentIds(): number[] {
  const ids = new Set<number>();
  for (const hub of Object.values(SPORT_HUBS)) for (const g of hub.groups) for (const t of g.tournaments) ids.add(t.id);
  return [...ids];
}

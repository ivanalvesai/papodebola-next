import { fetchAllSports } from "@/lib/api/allsports";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Torneios cobertos (chaveamento próprio). uniqueTournament + season da AllSportsApi.
export const TENNIS_TOURNAMENTS = {
  "halle-2026": {
    slug: "halle-2026",
    uniqueTournamentId: 2493,
    seasonId: 81334,
    name: "ATP 500 de Halle",
    fullName: "Terra Wortmann Open (ATP 500 de Halle)",
    city: "Halle, Alemanha",
    surface: "Grama",
    category: "ATP 500",
  },
} as const;

export type TennisTournamentSlug = keyof typeof TENNIS_TOURNAMENTS;

export interface TennisPlayer {
  id: number; // id do "team" no Sofascore — serve pra foto (/img/team/{id})
  name: string;
  shortName: string;
  seed: string | null;
  ranking: number | null;
  country: string | null; // alpha2 (ex: "BR") pra bandeira de fallback
  placeholder: boolean; // slot ainda indefinido (ex: "Vencedor QF1")
}

export interface TennisSet {
  home: number | null;
  away: number | null;
  tieHome: number | null; // games do tiebreak (sobrescrito quando houver)
  tieAway: number | null;
}

export type TennisStatus = "notstarted" | "inprogress" | "finished" | "pending";

export interface TennisMatch {
  eventId: number | null;
  order: number;
  status: TennisStatus;
  statusDesc: string; // PT-BR (ex: "2º set", "Encerrado")
  timestamp: number;
  home: TennisPlayer;
  away: TennisPlayer;
  setsHome: number | null; // sets vencidos
  setsAway: number | null;
  sets: TennisSet[]; // games por set
  pointHome: string | null; // ponto do game atual (0/15/30/40/AD) — só ao vivo
  pointAway: string | null;
  serving: 0 | 1 | 2; // quem saca (1 home, 2 away, 0 desconhecido)
  winner: 0 | 1 | 2;
  live: boolean;
}

export interface TennisRound {
  key: string;
  label: string;
  order: number;
  matches: TennisMatch[];
}

export interface TennisDraw {
  slug: string;
  name: string;
  rounds: TennisRound[];
  updated: string;
}

// Slug a partir do nome do atleta (acentos fora, espaços->-). PURO (client+server).
export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// slug do confronto pela API: "{casa}-{fora}" (ex: "ben-shelton-ethan-quinn").
export function tennisMatchSlug(homeName: string, awayName: string): string {
  return `${slugifyName(homeName)}-${slugifyName(awayName)}`;
}

// href da página do jogo: /tenis/{torneio}/{confronto}
export function tennisMatchHref(tournamentSlug: string, homeName: string, awayName: string): string {
  return `/tenis/${tournamentSlug}/${tennisMatchSlug(homeName, awayName)}`;
}

// Descrição da rodada (EN do provider) -> PT-BR. Default cai no original.
const ROUND_PT: Record<string, string> = {
  Final: "Final",
  Semifinal: "Semifinais",
  Quarterfinal: "Quartas de final",
  "Round of 16": "Oitavas de final",
  "Round of 32": "Primeira rodada",
  "Round of 64": "Fase preliminar",
  "Qualification round 1": "Qualificatório · 1ª rodada",
  "Qualification final": "Qualificatório · final",
};
function roundLabel(desc: string): string {
  return ROUND_PT[desc] || desc;
}

// Teto anti "inprogress" travado (provider às vezes esquece a partida ao vivo).
// Tênis: melhor de 3/5 sets pode passar de 4h em casos extremos → usamos 6h.
const MAX_LIVE_SECS = 6 * 60 * 60;

function mapStatus(type: string, startTimestamp: number): TennisStatus {
  if (
    type === "inprogress" &&
    startTimestamp > 0 &&
    Date.now() / 1000 - startTimestamp > MAX_LIVE_SECS
  ) {
    return "finished";
  }
  if (type === "inprogress") return "inprogress";
  if (type === "finished") return "finished";
  return "notstarted";
}

// "2nd set" -> "2º set", "Ended" -> "Encerrado", etc.
function statusDescPt(desc: string, status: TennisStatus): string {
  if (status === "finished") return "Encerrado";
  if (status === "notstarted") return "A seguir";
  const m = desc.match(/(\d+)(?:st|nd|rd|th)\s+set/i);
  if (m) return `${m[1]}º set`;
  if (/tiebreak/i.test(desc)) return "Tiebreak";
  return desc || "Ao vivo";
}

interface MatchEnrichment {
  status: TennisStatus;
  statusDesc: string;
  timestamp: number;
  setsHome: number | null;
  setsAway: number | null;
  sets: TennisSet[];
  pointHome: string | null;
  pointAway: string | null;
  serving: 0 | 1 | 2;
  countryById: Record<number, string>;
}

function pointStr(v: any): string | null {
  if (v == null) return null;
  const n = Number(v);
  // Sofascore manda 0/15/30/40 no game normal e 50 = vantagem (AD).
  if (n === 50) return "AD";
  return String(v);
}

// Constrói o enrichment a partir de um objeto `event` cru (match/{id} OU live feed).
function eventToEnrichment(e: any): MatchEnrichment {
  const startTimestamp = e.startTimestamp || 0;
  const status = mapStatus(e?.status?.type || "", startTimestamp);
  const hs = e.homeScore || {};
  const as = e.awayScore || {};

  const sets: TennisSet[] = [];
  for (let i = 1; i <= 5; i++) {
    const h = hs[`period${i}`];
    const a = as[`period${i}`];
    if (h == null && a == null) continue;
    sets.push({
      home: h ?? null,
      away: a ?? null,
      tieHome: hs[`period${i}TieBreak`] ?? null,
      tieAway: as[`period${i}TieBreak`] ?? null,
    });
  }

  const countryById: Record<number, string> = {};
  for (const side of ["homeTeam", "awayTeam"] as const) {
    const tm = e[side];
    const a2 = tm?.country?.alpha2;
    if (tm?.id && a2) countryById[tm.id] = String(a2).toLowerCase();
  }

  return {
    status,
    statusDesc: statusDescPt(e?.status?.description || "", status),
    timestamp: startTimestamp,
    setsHome: hs.current ?? null,
    setsAway: as.current ?? null,
    sets,
    pointHome: status === "inprogress" ? pointStr(hs.point) : null,
    pointAway: status === "inprogress" ? pointStr(as.point) : null,
    serving: e?.firstToServe === 1 ? 1 : e?.firstToServe === 2 ? 2 : 0,
    countryById,
  };
}

// Detalhe de um jogo (games por set, ponto, país). TTL conforme o status:
// encerrado cacheia muito (placar não muda), agendado por 30min.
async function enrichMatch(eventId: number, ttl: number): Promise<MatchEnrichment | null> {
  const raw = await fetchAllSports<any>(`match/${eventId}`, ttl);
  if (!raw?.event) return null;
  return eventToEnrichment(raw.event);
}

// Slots ainda indefinidos no chaveamento vêm como tokens "Qf1", "WQF2", "WSF1",
// "Q1"... (combinações das letras W/Q/S/F seguidas de número). Nenhum nome real
// de tenista é só essas letras + dígito.
const PLACEHOLDER_RE = /^[wqsf]+\d+$/i;
function isPlaceholderName(name: string): boolean {
  return PLACEHOLDER_RE.test((name || "").replace(/\s+/g, ""));
}

function buildPlayer(p: any, country: string | null): TennisPlayer {
  const tm = p?.team || {};
  const rawName = tm.name || p?.name || "";
  const placeholder = !tm.id || isPlaceholderName(rawName);
  return {
    id: placeholder ? 0 : tm.id || 0,
    name: placeholder ? "A definir" : rawName,
    shortName: placeholder ? "A definir" : tm.shortName || rawName,
    seed: !placeholder && p?.teamSeed ? String(p.teamSeed) : null,
    ranking: !placeholder && typeof tm.ranking === "number" ? tm.ranking : null,
    country: placeholder ? null : country,
    placeholder,
  };
}

export async function getTennisDraw(slug: TennisTournamentSlug): Promise<TennisDraw | null> {
  const t = TENNIS_TOURNAMENTS[slug];
  if (!t) return null;

  // Chaveamento + feed ao vivo do tênis (pequeno) em paralelo. O cuptree tem TTL
  // curto pra refletir resultados; o feed live é a fonte fresca dos jogos em curso.
  const [data, liveFeed] = await Promise.all([
    fetchAllSports<any>(
      `tournament/${t.uniqueTournamentId}/season/${t.seasonId}/cuptrees`,
      120
    ),
    fetchAllSports<any>(`tennis/events/live`, 15),
  ]);

  // Mapa eventId -> enrichment dos jogos AO VIVO deste torneio (sobrepõe o baseline).
  const liveById: Record<number, MatchEnrichment> = {};
  for (const e of liveFeed?.events || []) {
    if (e?.tournament?.uniqueTournament?.id === t.uniqueTournamentId && e?.id) {
      liveById[e.id] = eventToEnrichment(e);
    }
  }

  // O cupTree principal (single) vem primeiro; o de qualifying vem depois — pegamos
  // o de maior número de rounds que NÃO seja o qualifying.
  const trees: any[] = data?.cupTrees || [];
  const main =
    trees.find((tr) => !/qualif/i.test(tr?.name || "")) || trees[0];
  if (!main) return null;

  // Coleta os blocos e enriquece em paralelo (semáforo do fetchAllSports = 2).
  // TTL por status: encerrado cacheia 24h, agendado 30min. Jogos ao vivo NÃO
  // refazem match/{id} aqui — o overlay do feed live (acima) cobre o placar fresco.
  const blocks: { round: any; block: any }[] = [];
  for (const round of main.rounds || []) {
    for (const block of round.blocks || []) blocks.push({ round, block });
  }
  const enrichments = await Promise.all(
    blocks.map(async ({ block }) => {
      const eventId = block?.events?.[0];
      const hasRealPlayers = (block?.participants || []).some(
        (p: any) => p?.team?.id && !isPlaceholderName(p?.team?.name || "")
      );
      if (!eventId || !hasRealPlayers) return null;
      if (liveById[eventId]) return liveById[eventId]; // ao vivo: usa o feed fresco
      const ttl = block?.finished ? 86400 : 1800;
      return enrichMatch(eventId, ttl);
    })
  );

  const rounds: TennisRound[] = (main.rounds || []).map((round: any) => {
    const matches: TennisMatch[] = (round.blocks || []).map((block: any) => {
      const idx = blocks.findIndex((b) => b.block === block);
      const enr = enrichments[idx] || null;
      const parts: any[] = block?.participants || [];
      const sorted = [...parts].sort((a, b) => (a?.order || 0) - (b?.order || 0));
      const p1 = sorted[0] || {};
      const p2 = sorted[1] || {};
      const cById = enr?.countryById || {};

      const home = buildPlayer(p1, cById[p1?.team?.id] || null);
      const away = buildPlayer(p2, cById[p2?.team?.id] || null);

      const status: TennisStatus = enr
        ? enr.status
        : home.placeholder || away.placeholder
          ? "pending"
          : "notstarted";

      // sets vencidos: prefere o ao vivo (enrich), cai pro result do cuptree
      const setsHome =
        enr?.setsHome ?? (block?.homeTeamScore != null ? Number(block.homeTeamScore) : null);
      const setsAway =
        enr?.setsAway ?? (block?.awayTeamScore != null ? Number(block.awayTeamScore) : null);

      // vencedor: do cuptree (winner) ou derivado dos sets
      let winner: 0 | 1 | 2 = 0;
      if (p1?.winner) winner = 1;
      else if (p2?.winner) winner = 2;
      else if (status === "finished" && setsHome != null && setsAway != null) {
        winner = setsHome > setsAway ? 1 : setsAway > setsHome ? 2 : 0;
      }

      return {
        eventId: block?.events?.[0] ?? null,
        order: block?.order || 0,
        status,
        statusDesc: enr?.statusDesc || (status === "pending" ? "Aguardando" : "A seguir"),
        timestamp: enr?.timestamp || 0,
        home,
        away,
        setsHome,
        setsAway,
        sets: enr?.sets || [],
        pointHome: enr?.pointHome || null,
        pointAway: enr?.pointAway || null,
        serving: enr?.serving || 0,
        winner,
        live: status === "inprogress",
      };
    });

    return {
      key: `r${round.order}`,
      label: roundLabel(round?.description || ""),
      order: round?.order || 0,
      matches,
    };
  });

  // A ordem do provider vai da 1ª rodada -> final; invertemos pra mostrar as fases
  // decisivas no topo (Final primeiro) — padrão de cobertura esportiva.
  rounds.sort((a, b) => b.order - a.order);

  return {
    slug,
    name: t.name,
    rounds,
    updated: new Date().toISOString(),
  };
}

// ---------- Detalhe do jogo (estatísticas por set + enquete) ----------

export interface TennisStatItem {
  name: string;
  home: string;
  away: string;
  homeNum: number; // pra largura da barra
  awayNum: number;
  highlight: 0 | 1 | 2; // quem leva vantagem (compareCode da API)
}
export interface TennisStatGroup {
  name: string;
  items: TennisStatItem[];
}
export interface TennisStatPeriod {
  key: string; // ALL | 1ST | 2ND ...
  label: string; // Geral | 1º set ...
  groups: TennisStatGroup[];
}

export interface TennisMatchDetail {
  match: TennisMatch;
  periods: TennisStatPeriod[];
  vote: { home: number; away: number } | null;
  updated: string;
}

const STAT_GROUP_PT: Record<string, string> = {
  Service: "Saque",
  Points: "Pontos",
  Games: "Games",
  Return: "Devolução",
  Miscellaneous: "Outros",
};
const STAT_PT: Record<string, string> = {
  Aces: "Aces",
  "Double faults": "Duplas faltas",
  "First serve": "1º saque",
  "Second serve": "2º saque",
  "First serve points": "Pontos no 1º saque",
  "Second serve points": "Pontos no 2º saque",
  "Service games played": "Games de saque disputados",
  "Break points saved": "Break points salvos",
  Total: "Total",
  "Service points won": "Pontos ganhos no saque",
  "Receiver points won": "Pontos ganhos na devolução",
  "Max points in a row": "Máx. pontos seguidos",
  "Total won": "Games vencidos",
  "Service games won": "Games de saque vencidos",
  "Max games in a row": "Máx. games seguidos",
  "First serve return points": "Devolução de 1º saque",
  "Second serve return points": "Devolução de 2º saque",
  "Return games played": "Games de devolução",
  "Break points converted": "Break points convertidos",
  Tiebreaks: "Tiebreaks",
};
const PERIOD_PT: Record<string, string> = {
  ALL: "Geral",
  "1ST": "1º set",
  "2ND": "2º set",
  "3RD": "3º set",
  "4TH": "4º set",
  "5TH": "5º set",
};

// Valor comparável pra barra: prefere o "(74%)" quando existe, senão o 1º número.
function statNum(v: string): number {
  const pct = v.match(/\((\d+)%\)/);
  if (pct) return parseInt(pct[1], 10);
  const n = v.match(/-?\d+(\.\d+)?/);
  return n ? parseFloat(n[0]) : 0;
}

function normalizeStatPeriods(raw: any): TennisStatPeriod[] {
  const periods: any[] = raw?.statistics || [];
  return periods.map((p) => ({
    key: p.period || "",
    label: PERIOD_PT[p.period] || p.period || "",
    groups: (p.groups || []).map((g: any) => ({
      name: STAT_GROUP_PT[g.groupName] || g.groupName || "",
      items: (g.statisticsItems || []).map((it: any) => {
        const home = String(it.home ?? "");
        const away = String(it.away ?? "");
        const cc = it.compareCode;
        return {
          name: STAT_PT[it.name] || it.name || "",
          home,
          away,
          homeNum: statNum(home),
          awayNum: statNum(away),
          highlight: cc === 1 ? 1 : cc === 2 ? 2 : 0,
        };
      }),
    })),
  }));
}

// Constrói um TennisMatch a partir de um event cru (match/{id}) — usado no polling
// do detalhe, sem depender do cuptree (não tem seed; o cliente preserva o inicial).
function playerFromTeam(tm: any, country: string | null): TennisPlayer {
  return {
    id: tm?.id || 0,
    name: tm?.name || "A definir",
    shortName: tm?.shortName || tm?.name || "A definir",
    seed: null,
    ranking: typeof tm?.ranking === "number" ? tm.ranking : null,
    country,
    placeholder: !tm?.id,
  };
}
function eventToTennisMatch(e: any): TennisMatch {
  const enr = eventToEnrichment(e);
  const home = playerFromTeam(e.homeTeam, enr.countryById[e.homeTeam?.id] || null);
  const away = playerFromTeam(e.awayTeam, enr.countryById[e.awayTeam?.id] || null);
  let winner: 0 | 1 | 2 = e?.winnerCode === 1 ? 1 : e?.winnerCode === 2 ? 2 : 0;
  if (!winner && enr.status === "finished" && enr.setsHome != null && enr.setsAway != null) {
    winner = enr.setsHome > enr.setsAway ? 1 : enr.setsAway > enr.setsHome ? 2 : 0;
  }
  return {
    eventId: e?.id ?? null,
    order: 0,
    status: enr.status,
    statusDesc: enr.statusDesc,
    timestamp: enr.timestamp,
    home,
    away,
    setsHome: enr.setsHome,
    setsAway: enr.setsAway,
    sets: enr.sets,
    pointHome: enr.pointHome,
    pointAway: enr.pointAway,
    serving: enr.serving,
    winner,
    live: enr.status === "inprogress",
  };
}

async function getStatsAndVote(
  eventId: number,
  ttl: number
): Promise<{ periods: TennisStatPeriod[]; vote: { home: number; away: number } | null }> {
  const [statRaw, voteRaw] = await Promise.all([
    fetchAllSports<any>(`match/${eventId}/statistics`, ttl),
    fetchAllSports<any>(`match/${eventId}/votes`, ttl),
  ]);
  const v = voteRaw?.vote;
  const vote =
    v && (v.vote1 != null || v.vote2 != null)
      ? { home: v.vote1 || 0, away: v.vote2 || 0 }
      : null;
  return { periods: normalizeStatPeriods(statRaw), vote };
}

// Detalhe por eventId (polling). Monta tudo a partir do match/{id}.
export async function getTennisMatchById(eventId: number): Promise<TennisMatchDetail | null> {
  const raw = await fetchAllSports<any>(`match/${eventId}`, 20);
  if (!raw?.event) return null;
  const match = eventToTennisMatch(raw.event);
  const ttl = match.status === "finished" ? 86400 : match.live ? 20 : 1800;
  const { periods, vote } = await getStatsAndVote(eventId, ttl);
  return { match, periods, vote, updated: new Date().toISOString() };
}

// Resolução slug do confronto -> jogo (via chaveamento, cacheado). Só confrontos
// reais (sem placeholder) são clicáveis, então o slug é único no torneio.
export async function getTennisMatchBySlug(
  tournamentSlug: TennisTournamentSlug,
  matchSlug: string
): Promise<{ tournamentName: string; tournamentSlug: string; match: TennisMatch; roundLabel: string } | null> {
  const draw = await getTennisDraw(tournamentSlug);
  if (!draw) return null;
  for (const round of draw.rounds) {
    for (const m of round.matches) {
      if (m.home.placeholder || m.away.placeholder) continue;
      if (tennisMatchSlug(m.home.name, m.away.name) === matchSlug) {
        return {
          tournamentName: draw.name,
          tournamentSlug,
          match: m,
          roundLabel: round.label,
        };
      }
    }
  }
  return null;
}

// Detalhe completo pra render inicial da página (usa o match já enriquecido do
// chaveamento — tem seed — e adiciona estatísticas + enquete).
export async function getTennisMatchDetail(
  tournamentSlug: TennisTournamentSlug,
  matchSlug: string
): Promise<(TennisMatchDetail & { tournamentName: string; roundLabel: string }) | null> {
  const found = await getTennisMatchBySlug(tournamentSlug, matchSlug);
  if (!found || !found.match.eventId) return null;
  const ttl =
    found.match.status === "finished" ? 86400 : found.match.live ? 20 : 1800;
  const { periods, vote } = await getStatsAndVote(found.match.eventId, ttl);
  return {
    match: found.match,
    periods,
    vote,
    updated: new Date().toISOString(),
    tournamentName: found.tournamentName,
    roundLabel: found.roundLabel,
  };
}

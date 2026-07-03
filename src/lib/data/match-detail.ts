import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { translateEnPt } from "@/lib/services/translate";
import { getWorldCupStandings } from "./standings";
import { getChampionshipData } from "./championship";
import { withSnapshot } from "./snapshot-store";
import { getMatchComments } from "./match-comments";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import type { StandingsGroup } from "@/types/standings";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WC = { id: 16, seasonId: 58210 } as const;
const GROUP_ROUNDS = [1, 2, 3] as const;

// ---------- Resolução data+slug -> jogo da Copa ----------

export interface WorldCupFixture {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  timestamp: number;
  round: number;
  winnerId?: number; // time vencedor (quando o confronto já encerrou no cuptrees)
  // Placar/status do confronto, quando o cuptrees já tem (mata-mata). O `matches/round`
  // vem vazio no mata-mata, então o placar do card da fase sai DAQUI (sem chamada extra).
  homeScore?: number | null;
  awayScore?: number | null;
  homePens?: number | null; // disputa de pênaltis (null = não houve)
  awayPens?: number | null;
  status?: string; // notstarted | inprogress | finished
}

// Lista achatada de todos os jogos de grupo (fixtures estáveis -> TTL longo).
export async function getWorldCupFixtures(): Promise<WorldCupFixture[]> {
  return (
    (await withSnapshot<WorldCupFixture[]>(
      "worldcup",
      "fixtures",
      () => fetchWorldCupFixturesLive(),
      (d) => Array.isArray(d) && d.length > 0
    )) || []
  );
}

async function fetchWorldCupFixturesLive(): Promise<WorldCupFixture[]> {
  // Paralelo: o semáforo do fetchAllSports já limita a 2 simultâneas + retry em 429.
  // Tirei as pausas de 250ms (rodavam até com cache quente, somando latência fixa em
  // toda página de jogo). Calendário não muda -> TTL 6h.
  const rounds = await Promise.all(
    GROUP_ROUNDS.map((r) =>
      fetchAllSports<any>(
        `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
        21600
      ).then((data) => ({ r, data }))
    )
  );
  const out: WorldCupFixture[] = [];
  for (const { r, data } of rounds) {
    for (const e of data?.events || []) {
      out.push({
        id: e.id,
        homeId: e.homeTeam?.id || 0,
        awayId: e.awayTeam?.id || 0,
        home: translateCountry(e.homeTeam?.name || ""),
        away: translateCountry(e.awayTeam?.name || ""),
        timestamp: e.startTimestamp || 0,
        round: r,
      });
    }
  }
  // Mata-mata: confrontos já com os 2 times confirmados (cuptrees). Faz as páginas de
  // jogo do mata-mata resolverem desde já — quando a API publicar lance a lance,
  // escalação e estatísticas, a página mostra na hora (mesmo polling dos grupos).
  out.push(...(await getWorldCupKnockoutFixtures().catch(() => [] as WorldCupFixture[])));
  return out;
}

// Fase do cuptrees -> "round" distinto dos grupos (1-3): R32=6, R16=7, QF=8, SF=9, Final=10.
const KNOCKOUT_ROUND_BY_ORDER: Record<number, number> = { 1: 6, 2: 7, 3: 8, 4: 9, 5: 10 };

// Placar de um lado vindo do cuptrees: "1 (3)" -> { score: 1, pen: 3 }; "2" -> { 2, null };
// vazio/"-" -> { null, null } (jogo não começou).
function parseCupSide(s: unknown): { score: number | null; pen: number | null } {
  const nums = String(s ?? "").match(/\d+/g);
  if (!nums || !nums.length) return { score: null, pen: null };
  return { score: parseInt(nums[0], 10), pen: nums[1] != null ? parseInt(nums[1], 10) : null };
}
function parseCupScore(home: unknown, away: unknown) {
  const h = parseCupSide(home);
  const a = parseCupSide(away);
  return { homeScore: h.score, awayScore: a.score, homePens: h.pen, awayPens: a.pen };
}

// Confrontos do mata-mata com os DOIS times confirmados (ambos top-2 de um grupo já
// encerrado, todas as linhas com 3 jogos). Fonte: cuptrees (o bracket). Os slots
// indefinidos vêm como placeholder ("3A/3B/.." ou "2I") sem team -> ficam de fora.
export async function getWorldCupKnockoutFixtures(): Promise<WorldCupFixture[]> {
  return (
    (await withSnapshot<WorldCupFixture[]>(
      "worldcup",
      "knockout",
      () => fetchWorldCupKnockoutFixturesLive(),
      (d) => Array.isArray(d) && d.length > 0
    )) || []
  );
}

async function fetchWorldCupKnockoutFixturesLive(): Promise<WorldCupFixture[]> {
  const [tree, groups] = await Promise.all([
    fetchAllSports<any>(`tournament/${WC.id}/season/${WC.seasonId}/cuptrees`, 900).catch(() => null),
    getWorldCupStandings().catch(() => [] as StandingsGroup[]),
  ]);
  // "confirmado" = time de um grupo JÁ ENCERRADO (todas as linhas com 3 jogos). Inclui
  // os melhores TERCEIROS, não só o top-2: no formato de 48 (12 grupos), 8 dos 3ºs avançam
  // pro mata-mata. O cuptrees só coloca no bloco quem realmente classificou — o filtro
  // abaixo é só a garantia de que o grupo de ambos terminou (evita mostrar antes da hora).
  const confirmed = new Set<number>();
  for (const g of groups) {
    const rows = g.rows || [];
    if (rows.length >= 2 && rows.every((r) => (r.matches || 0) >= 3)) {
      for (const r of rows) if (r.teamId) confirmed.add(r.teamId);
    }
  }
  // O cuptrees demora a "propagar" o vencedor pro slot da próxima fase: o participante
  // fica como placeholder (ex: "W83") mesmo com o confronto de origem já encerrado. Isso
  // segurava a página do jogo seguinte (ex: Portugal x Espanha nas oitavas) em 404. Aqui
  // resolvemos o placeholder pelo VENCEDOR do bloco de origem (participant.sourceBlockId →
  // blockId do confronto anterior), pra a página existir assim que os 2 lados estão decididos.
  const winnerByBlockId = new Map<number, any>();
  for (const rnd of tree?.cupTrees?.[0]?.rounds || []) {
    for (const b of rnd.blocks || []) {
      if (b.finished && b.blockId != null) {
        const w = (b.participants || []).find((x: any) => x?.winner)?.team;
        if (w?.id) winnerByBlockId.set(b.blockId, w);
      }
    }
  }
  const teamOf = (p: any) =>
    p?.team ?? (p?.sourceBlockId != null ? winnerByBlockId.get(p.sourceBlockId) : undefined);

  const out: WorldCupFixture[] = [];
  for (const rnd of tree?.cupTrees?.[0]?.rounds || []) {
    for (const b of rnd.blocks || []) {
      const p = b.participants || [];
      const ht = teamOf(p[0]);
      const at = teamOf(p[1]);
      const evRaw = Array.isArray(b.events) ? b.events[0] : null;
      const ev = typeof evRaw === "object" && evRaw ? evRaw.id : evRaw;
      if (ht?.id && at?.id && typeof ev === "number" && confirmed.has(ht.id) && confirmed.has(at.id)) {
        // Vencedor (quando o confronto já encerrou) → propaga o time pra próxima fase.
        const winnerId = b.finished
          ? p.find((x: any) => x?.winner)?.team?.id ?? undefined
          : undefined;
        // Placar/pênaltis/status do bloco. O cuptrees traz "homeTeamScore": "1 (3)"
        // (base = tempo normal/prorrogação; entre parênteses = pênaltis) e flags
        // finished/eventInProgress. É a fonte do placar no card da fase do mata-mata.
        const cs = parseCupScore(b.homeTeamScore, b.awayTeamScore);
        const status = b.finished ? "finished" : b.eventInProgress ? "inprogress" : "notstarted";
        out.push({
          id: ev,
          homeId: ht.id,
          awayId: at.id,
          home: translateCountry(ht.name || ""),
          away: translateCountry(at.name || ""),
          timestamp: b.seriesStartDateTimestamp || 0,
          round: KNOCKOUT_ROUND_BY_ORDER[rnd.order] || 6,
          winnerId,
          homeScore: cs.homeScore,
          awayScore: cs.awayScore,
          homePens: cs.homePens,
          awayPens: cs.awayPens,
          status,
        });
      }
    }
  }
  return out;
}

export async function resolveWorldCupMatch(
  dateSlug: string,
  pairSlug: string
): Promise<WorldCupFixture | null> {
  const fixtures = await getWorldCupFixtures();
  return (
    fixtures.find(
      (f) =>
        matchDateSlug(f.timestamp) === dateSlug &&
        matchPairSlug(f.homeId, f.awayId, f.home, f.away) === pairSlug
    ) || null
  );
}

// Placares/status ao vivo da rodada atual da Copa — consumido pelo polling da
// tabela (CopaLiveProvider) pra atualizar o placar e mostrar o selo AO VIVO.
export interface WorldCupLiveScore {
  id: number;
  homeScore: number | null;
  awayScore: number | null;
  statusType: string; // notstarted | inprogress | finished
  statusDesc: string;
}

export async function getWorldCupLiveScores(): Promise<WorldCupLiveScore[]> {
  // currentRound PRECISA estar fresco: com TTL longo (era 6h), na virada de rodada
  // o ao vivo ficava preso na rodada anterior e os jogos do dia (ex: rodada 2) nunca
  // recebiam placar/selo AO VIVO na home. 10min mantém atualizado sem martelar.
  const rd = await fetchAllSports<any>(
    `tournament/${WC.id}/season/${WC.seasonId}/rounds`,
    600
  );
  const roundsList: number[] = (rd?.rounds || [])
    .map((r: any) => r?.round)
    .filter((n: any) => typeof n === "number");
  const cr = rd?.currentRound?.round ?? 1;
  // A barra da home mostra hoje+2 dias, que pode cruzar a rodada atual e a seguinte;
  // busca as duas pra cobrir o dia de virada de rodada.
  const idx = roundsList.indexOf(cr);
  const targets = [cr];
  if (idx >= 0 && roundsList[idx + 1] != null) targets.push(roundsList[idx + 1]);

  const results = await Promise.all(
    targets.map((r) =>
      fetchAllSports<any>(`tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`, 15)
    )
  );

  // No MATA-MATA o matches/round/{r} volta VAZIO (a API não popula o knockout por
  // rodada). Sem isso, os jogos eliminatórios nunca recebiam placar/selo AO VIVO na
  // barra da home. matches/live (feed global ao vivo) traz qualquer jogo da Copa em
  // andamento — filtramos pelo torneio 16 e mesclamos.
  const liveFeed = await fetchAllSports<any>("matches/live", 15).catch(() => null);
  const liveWcEvents = ((liveFeed as any)?.events || []).filter(
    (e: any) => e?.tournament?.uniqueTournament?.id === WC.id
  );

  const MAX_LIVE = 4 * 60 * 60; // teto anti "inprogress" travado pelo provedor
  const now = Date.now() / 1000;
  const out: WorldCupLiveScore[] = [];
  const seen = new Set<number>();
  // MATA-MATA primeiro (precedência): no knockout o matches/round volta VAZIO e o
  // matches/live só traz o que está rolando AGORA — um jogo recém-ENCERRADO do mata-mata
  // não apareceria (a barra ficava sem "Encerrado"/placar). match/{id} é autoritativo e
  // nunca tem lag (ao contrário do cuptrees). Placar já vem SEM pênaltis (display).
  for (const s of await getWorldCupKnockoutLiveScores()) {
    if (seen.has(s.id)) continue;
    seen.add(s.id);
    out.push(s);
  }
  for (const data of [...results.map((d) => ({ events: d?.events })), { events: liveWcEvents }]) {
    for (const e of data?.events || []) {
      if (seen.has(e.id)) continue;
      seen.add(e.id);
      let type = e?.status?.type || "";
      const ts = e?.startTimestamp || 0;
      if (isLiveType(type) && ts > 0 && now - ts > MAX_LIVE) type = "finished";
      out.push({
        id: e.id,
        homeScore: e.homeScore?.current ?? null,
        awayScore: e.awayScore?.current ?? null,
        statusType: type,
        statusDesc: translateStatus(e.status?.description) || "",
      });
    }
  }
  return out;
}

// Placares ao vivo/encerrados dos jogos do MATA-MATA, buscados por match/{id} (fonte
// autoritativa). Necessário porque no knockout o matches/round volta vazio e o matches/live
// só traz o que está rolando — sem isto, um jogo recém-encerrado do mata-mata some da barra
// da home / da tabela (fica "scheduled" sem placar até o cuptrees atualizar, com lag).
// Só busca os confrontos na janela "em jogo ou recém-terminado" (início -5h .. +15min),
// então são ~1-4 chamadas match/{id} (cacheadas: 10s ao vivo, 1h encerrado). Vale pra
// QUALQUER fase (16-avos … final) — os fixtures vêm do cuptrees, sem lista fixa.
export async function getWorldCupKnockoutLiveScores(): Promise<WorldCupLiveScore[]> {
  const fixtures = await getWorldCupKnockoutFixtures().catch(() => [] as WorldCupFixture[]);
  const now = Date.now() / 1000;
  const relevant = fixtures.filter(
    (f) => f.timestamp && f.timestamp <= now + 15 * 60 && f.timestamp >= now - 5 * 3600
  );
  const events = await Promise.all(
    relevant.map((f) => getMatchEvent(f.id, f.timestamp).catch(() => null))
  );
  const out: WorldCupLiveScore[] = [];
  for (const ev of events) {
    if (!ev) continue;
    out.push({
      id: ev.id,
      homeScore: ev.homeScore, // display (tempo normal/prorrogação, sem pênaltis)
      awayScore: ev.awayScore,
      statusType: ev.statusType,
      statusDesc: ev.statusDesc,
    });
  }
  return out;
}

// Grupo (classificação) que contém os dois times do jogo.
export async function getMatchGroup(
  homeId: number,
  awayId: number
): Promise<StandingsGroup | null> {
  const groups = await getWorldCupStandings();
  return (
    groups.find((g) => {
      const ids = new Set(g.rows.map((r) => r.teamId));
      return ids.has(homeId) && ids.has(awayId);
    }) || null
  );
}

// ---------- Resolução data+slug -> jogo de um CAMPEONATO (Série B, Série A, etc.) ----------
// Padrão igual ao da Copa, mas pra qualquer torneio cadastrado (TOURNAMENT_BY_SLUG).
// Reusa getChampionshipData (já cacheado pela página do campeonato) pra achar o jogo
// pelo slug da data + slug do confronto. O placar ao vivo vem do getMatchDetail(id).

export interface ChampionshipFixture {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  timestamp: number;
  round: number;
  tournamentName: string;
}

export async function resolveChampionshipMatch(
  champSlug: string,
  dateSlug: string,
  pairSlug: string
): Promise<ChampionshipFixture | null> {
  const tournament = TOURNAMENT_BY_SLUG[champSlug];
  if (!tournament) return null;
  const data = await getChampionshipData(champSlug);
  if (!data) return null;

  for (const matches of Object.values(data.matchesByRound)) {
    for (const m of matches) {
      if (
        matchDateSlug(m.timestamp) === dateSlug &&
        matchPairSlug(m.homeId, m.awayId, m.home, m.away) === pairSlug
      ) {
        return {
          id: m.id,
          homeId: m.homeId,
          awayId: m.awayId,
          home: m.home,
          away: m.away,
          timestamp: m.timestamp,
          round: m.round,
          tournamentName: tournament.name,
        };
      }
    }
  }
  return null;
}

// href da página do jogo de um campeonato: /futebol/{champSlug}/jogo/{data}/{confronto}
export function championshipMatchHref(
  champSlug: string,
  timestamp: number,
  homeId: number,
  awayId: number,
  home?: string,
  away?: string
): string {
  return `/futebol/${champSlug}/jogo/${matchDateSlug(timestamp)}/${matchPairSlug(
    homeId,
    awayId,
    home,
    away
  )}`;
}

// ---------- Detalhe do jogo (event / incidents / lineups / statistics) ----------

export interface MatchEvent {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  homeScore: number | null; // placar do tempo normal/prorrogação (NÃO inclui pênaltis)
  awayScore: number | null;
  // Disputa de pênaltis (quando o jogo foi decidido nas penalidades). null = não houve.
  homePens: number | null;
  awayPens: number | null;
  winnerCode: number | null; // 1 = mandante, 2 = visitante (vencedor do confronto)
  statusType: string; // notstarted | inprogress | finished
  statusDesc: string; // PT-BR
  startTimestamp: number;
  periodStart: number; // currentPeriodStartTimestamp (pra cronômetro)
  live: boolean;
  venue: { stadium: string; city: string; country: string } | null;
}

// Uma cobrança da disputa de pênaltis (na ordem em que foi batida).
export interface ShootoutKick {
  sequence: number;
  player: string;
  isHome: boolean;
  scored: boolean; // true = converteu (⚽); false = perdeu (❌)
  reason: string; // motivo do erro/acerto (goalkeeperSave | offTarget | post | scored ...)
}

export interface MatchIncident {
  type: string; // goal | card | substitution | period | injuryTime
  cls: string; // regular | yellow | red | ...
  minute: number | null;
  addedTime: number | null;
  player: string | null;
  assist: string | null;
  playerIn: string | null;
  playerOut: string | null;
  isHome: boolean | null;
  homeScore: number | null;
  awayScore: number | null;
  text: string | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number | null;
  position: string; // G | D | M | F
  rating: string | null;
  captain: boolean;
}

export interface TeamLineup {
  formation: string | null;
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface MatchStatItem {
  name: string;
  home: string;
  away: string;
  homeNum: number;
  awayNum: number;
}

export interface MatchCommentary {
  id: number;
  type: string;
  text: string;
  textPt: string | null; // texto traduzido pra PT-BR (LibreTranslate)
  isHome: boolean | null;
  player: string | null;
  playerId: number | null;
  playerIn: string | null;
  playerInId: number | null;
  playerOut: string | null;
  reason: string | null; // motivo do cartão (ex: Foul, Violent conduct)
  minute: number | null;
  html?: string | null; // conteúdo rico (comentário editorial do /cms): texto+imagem+link
  minuteLabel?: string | null; // exibido no lugar do minuto (ex: "Pré-jogo", "Intervalo")
}

export interface MatchDetail {
  event: MatchEvent;
  incidents: MatchIncident[];
  commentary: MatchCommentary[];
  home: TeamLineup | null;
  away: TeamLineup | null;
  lineupsConfirmed: boolean;
  stats: MatchStatItem[];
  shootout: ShootoutKick[]; // disputa de pênaltis (vazio quando não houve)
}

// Teto de segurança: nenhum jogo fica "ao vivo" mais que isso depois do apito
// inicial. 90' + intervalo + acréscimos + prorrogação + pênaltis cabe folgado em
// ~3h; usamos 4h. O provedor (Sofascore) às vezes esquece a partida travada em
// "inprogress" por horas após o fim — sem esse guard a página mostra "AO VIVO"
// com o cronômetro correndo (ex: 1500'). Passou do teto = trata como encerrado.
const MAX_LIVE_SECS = 4 * 60 * 60;

// Status que contam como "jogo rolando" (ao vivo). O Sofascore (SportApi7) usa
// "interrupted" pra paralisações (raio, gramado, falta de luz) — o jogo NÃO acabou,
// continua ao vivo. Sem isso, a página cai na visão de pré-jogo e trava no placar.
const LIVE_TYPES = new Set(["inprogress", "interrupted"]);
function isLiveType(type: string): boolean {
  return LIVE_TYPES.has(type);
}

function normalizeEvent(e: any): MatchEvent {
  let type = e?.status?.type || "";
  const startTimestamp = e?.startTimestamp || 0;

  // Guard anti "ao vivo" travado: se o provedor diz que está rolando mas o início
  // foi há mais de MAX_LIVE_SECS, o jogo já acabou (placar atual = final).
  if (
    isLiveType(type) &&
    startTimestamp > 0 &&
    Date.now() / 1000 - startTimestamp > MAX_LIVE_SECS
  ) {
    type = "finished";
  }

  // Placar a exibir: `display` é o placar do tempo normal/prorrogação SEM os pênaltis
  // (o `current` SOMA as penalidades → mostraria "4 x 5" num 1 x 1 decidido nos pênaltis).
  // Cai pro `current` quando não há `display` (jogos sem disputa).
  const hs = e?.homeScore || {};
  const as = e?.awayScore || {};
  const homePens = typeof hs.penalties === "number" ? hs.penalties : null;
  const awayPens = typeof as.penalties === "number" ? as.penalties : null;

  return {
    id: e?.id,
    homeId: e?.homeTeam?.id || 0,
    awayId: e?.awayTeam?.id || 0,
    home: translateCountry(e?.homeTeam?.name || ""),
    away: translateCountry(e?.awayTeam?.name || ""),
    homeScore: hs.display ?? hs.current ?? null,
    awayScore: as.display ?? as.current ?? null,
    homePens,
    awayPens,
    winnerCode: typeof e?.winnerCode === "number" ? e.winnerCode : null,
    statusType: type,
    statusDesc: translateStatus(e?.status?.description) || "",
    startTimestamp,
    periodStart: e?.time?.currentPeriodStartTimestamp || 0,
    live: isLiveType(type),
    venue: e?.venue
      ? {
          stadium: e.venue.name || e.venue.stadium?.name || "",
          city: e.venue.city?.name || "",
          country: e.venue.city?.country?.name || e.venue.country?.name || "",
        }
      : null,
  };
}

function normalizeIncidents(raw: any): MatchIncident[] {
  const list: any[] = raw?.incidents || [];
  return list.map((i) => ({
    type: i?.incidentType || "",
    cls: i?.incidentClass || "",
    minute: typeof i?.time === "number" ? i.time : null,
    addedTime: typeof i?.addedTime === "number" ? i.addedTime : null,
    player: i?.player?.name || null,
    assist: i?.assist1?.name || null,
    playerIn: i?.playerIn?.name || null,
    playerOut: i?.playerOut?.name || null,
    isHome: typeof i?.isHome === "boolean" ? i.isHome : null,
    homeScore: typeof i?.homeScore === "number" ? i.homeScore : null,
    awayScore: typeof i?.awayScore === "number" ? i.awayScore : null,
    text: i?.text || null,
  }));
}

// Extrai a disputa de pênaltis dos incidents (incidentType "penaltyShootout"), na
// ordem das cobranças (sequence). incidentClass "scored" = converteu; "missed" = perdeu.
function normalizeShootout(raw: any): ShootoutKick[] {
  const list: any[] = raw?.incidents || [];
  return list
    .filter((i) => i?.incidentType === "penaltyShootout")
    .map((i) => ({
      sequence: typeof i?.sequence === "number" ? i.sequence : 0,
      player: i?.player?.name || "",
      isHome: !!i?.isHome,
      scored: i?.incidentClass === "scored",
      reason: i?.reason || i?.incidentClass || "",
    }))
    .sort((a, b) => a.sequence - b.sequence);
}

function normalizePlayer(p: any): LineupPlayer {
  return {
    id: p?.player?.id || 0,
    name: p?.player?.name || "",
    number: p?.shirtNumber ?? p?.player?.jerseyNumber ?? null,
    position: p?.position || "",
    rating: p?.statistics?.rating ? String(p.statistics.rating) : null,
    captain: !!p?.captain,
  };
}

function normalizeLineup(side: any): TeamLineup | null {
  if (!side || !Array.isArray(side.players)) return null;
  const players: any[] = side.players;
  return {
    formation: side.formation || null,
    starters: players.filter((p) => !p?.substitute).map(normalizePlayer),
    bench: players.filter((p) => p?.substitute).map(normalizePlayer),
  };
}

function toNum(v: any): number {
  if (typeof v === "number") return v;
  const m = String(v ?? "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

// Nomes de estatística EN -> PT-BR (a AllSportsApi devolve em inglês).
const STAT_PT: Record<string, string> = {
  "Ball possession": "Posse de bola",
  "Expected goals": "Gols esperados (xG)",
  "Total shots": "Finalizações",
  "Shots on target": "Finalizações no alvo",
  "Shots off target": "Finalizações para fora",
  "Blocked shots": "Finalizações bloqueadas",
  "Shots inside box": "Finalizações na área",
  "Shots outside box": "Finalizações fora da área",
  "Big chances": "Grandes chances",
  "Big chances missed": "Grandes chances perdidas",
  "Big chances scored": "Grandes chances convertidas",
  "Corner kicks": "Escanteios",
  Corners: "Escanteios",
  Offsides: "Impedimentos",
  Fouls: "Faltas",
  "Yellow cards": "Cartões amarelos",
  "Red cards": "Cartões vermelhos",
  "Free kicks": "Tiros livres",
  "Throw-ins": "Laterais",
  "Goal kicks": "Tiros de meta",
  Saves: "Defesas",
  "Goalkeeper saves": "Defesas do goleiro",
  "Total saves": "Defesas",
  Passes: "Passes",
  "Accurate passes": "Passes certos",
  "Long balls": "Bolas longas",
  Crosses: "Cruzamentos",
  Dribbles: "Dribles",
  "Total tackles": "Desarmes",
  Tackles: "Desarmes",
  Interceptions: "Interceptações",
  Clearances: "Cortes",
  "Counter attacks": "Contra-ataques",
  "Counterattacks": "Contra-ataques",
  Duels: "Duelos",
  "Duels won": "Duelos vencidos",
  "Aerials won": "Duelos aéreos vencidos",
  "Hit woodwork": "Na trave",
  "Touches in penalty area": "Toques na área",
  "Final third entries": "Entradas no último terço",
  "Final third phase": "Jogo no último terço",
  "Fouled in final third": "Faltas sofridas no ataque",
  "Through balls": "Passes em profundidade",
  "Dispossessed": "Posses perdidas",
  "Ground duels": "Duelos no chão",
  "Aerial duels": "Duelos aéreos",
  "Tackles won": "Desarmes certos",
  "Recoveries": "Recuperações de bola",
  "Goals prevented": "Gols evitados",
  "Big saves": "Defesas difíceis",
  "High claims": "Saídas de cruzamento",
  // extras comuns do Sofascore (pra não vazar inglês em outros jogos)
  "Penalty saves": "Pênaltis defendidos",
  "Punches": "Socos do goleiro",
  "Errors lead to shot": "Erros que viraram finalização",
  "Errors lead to goal": "Erros que viraram gol",
  "Big chances created": "Grandes chances criadas",
  "Key passes": "Passes decisivos",
  "Accurate long balls": "Bolas longas certas",
  "Accurate crosses": "Cruzamentos certos",
  "Goalkeeper punches": "Socos do goleiro",
};
function translateStat(name: string): string {
  if (!name) return "";
  if (STAT_PT[name]) return STAT_PT[name];
  const hit = Object.keys(STAT_PT).find((k) => k.toLowerCase() === name.toLowerCase());
  return hit ? STAT_PT[hit] : name;
}

function normalizeStats(raw: any): MatchStatItem[] {
  const periods: any[] = raw?.statistics || [];
  const all = periods.find((p) => p?.period === "ALL") || periods[0];
  if (!all) return [];
  const out: MatchStatItem[] = [];
  for (const g of all.groups || []) {
    for (const it of g.statisticsItems || []) {
      out.push({
        name: translateStat(it?.name || ""),
        home: String(it?.home ?? ""),
        away: String(it?.away ?? ""),
        homeNum: toNum(it?.home),
        awayNum: toNum(it?.away),
      });
    }
  }
  return out;
}

function normalizeCommentary(raw: any): MatchCommentary[] {
  const list: any[] = raw?.comments || [];
  return list.map((c) => ({
    id: c?.id ?? c?.sequence ?? 0,
    type: c?.type || "",
    text: c?.text || "",
    textPt: null,
    isHome: typeof c?.isHome === "boolean" ? c.isHome : null,
    player: c?.player?.name || null,
    playerId: c?.player?.id || null,
    playerIn: c?.playerIn?.name || null,
    playerInId: c?.playerIn?.id || null,
    playerOut: c?.playerOut?.name || null,
    reason: c?.reason || null,
    minute: typeof c?.time === "number" ? c.time : null,
  }));
}

// Converte um incidente-chave (gol/cartão/sub/VAR) em item de feed.
function incidentToFeedItem(i: any): MatchCommentary {
  const t = i?.incidentType;
  let type = t;
  if (t === "goal") type = "scoreChange";
  else if (t === "card")
    type = i?.incidentClass === "red" || i?.incidentClass === "yellowRed" ? "redCard" : "yellowCard";
  else if (t === "substitution") type = "substitution";
  else if (t === "varDecision") type = "varDecision";
  return {
    id: 1_000_000_000 + (i?.id || 0), // offset pra não colidir com id de commentary
    type,
    text: "",
    textPt: null,
    isHome: typeof i?.isHome === "boolean" ? i.isHome : null,
    player: i?.player?.name || null,
    playerId: i?.player?.id || null,
    playerIn: i?.playerIn?.name || null,
    playerInId: i?.playerIn?.id || null,
    playerOut: i?.playerOut?.name || null,
    reason: i?.reason || null,
    minute: typeof i?.time === "number" ? i.time : null,
  };
}

// Mescla os incidents (gols/cartões/subs SEMPRE completos) no feed de commentary,
// que às vezes não marca todos os gols. Insere por minuto os que faltam, sem duplicar.
function mergeFeed(commentary: MatchCommentary[], incRaw: any): MatchCommentary[] {
  const KEY = ["goal", "card", "substitution", "varDecision"];
  const allInc: any[] = incRaw?.incidents || [];
  const incs: any[] = allInc.filter((i: any) => KEY.includes(i?.incidentType));
  const result = [...commentary];
  const isGoalType = (x: MatchCommentary) =>
    ["scoreChange", "goal", "penaltyGoal"].includes(x.type);

  // motivo do cartão só existe nos incidents → injeta no item de cartão do feed
  const cardReason: Record<string, string> = {};
  for (const i of allInc) {
    if (i?.incidentType === "card" && i?.player?.name && i?.reason)
      cardReason[i.player.name] = i.reason;
  }
  for (const x of result) {
    if ((x.type === "yellowCard" || x.type === "redCard") && !x.reason && x.player && cardReason[x.player])
      x.reason = cardReason[x.player];
  }
  // (a tradução do texto é aplicada depois, em translateFeed)

  for (const raw of incs) {
    const item = incidentToFeedItem(raw);
    const dup = result.some((x) => {
      if (item.type === "scoreChange") return isGoalType(x) && x.player === item.player;
      if (item.type === "yellowCard" || item.type === "redCard")
        return x.type === item.type && x.player === item.player;
      if (item.type === "substitution")
        return (
          x.type === "substitution" &&
          (x.playerIn === item.playerIn || x.playerOut === item.playerOut)
        );
      return x.type === item.type && x.minute === item.minute;
    });
    if (dup) continue;
    const idx = result.findIndex(
      (x) => x.minute != null && item.minute != null && x.minute < item.minute
    );
    if (idx === -1) result.push(item);
    else result.splice(idx, 0, item);
  }
  return result;
}

// Traduz o texto (EN) de cada lance pra PT-BR via LibreTranslate (com cache).
async function translateFeed(feed: MatchCommentary[]): Promise<MatchCommentary[]> {
  const texts = feed.map((f) => f.text).filter((t): t is string => !!t);
  if (!texts.length) return feed;
  const map = await translateEnPt(texts);
  for (const f of feed) if (f.text && map[f.text]) f.textPt = map[f.text];
  return feed;
}

// TTL curto p/ ao vivo, longo p/ encerrado. Recebe o status já conhecido.
function liveTtl(statusType: string, liveSecs = 10, doneSecs = 86400, soonSecs = 600): number {
  if (isLiveType(statusType)) return liveSecs; // inprogress + interrupted = TTL curto
  if (statusType === "finished") return doneSecs;
  return soonSecs; // notstarted
}

// TTL do match/{id} (status/placar) ciente do horário do jogo. O match/{id} é
// buscado ANTES de saber o status, então usamos o timestamp do fixture como dica:
// fora da janela do jogo o status não muda, então cacheia bem mais (não martela).
//  - começou há >4h  -> encerrado -> 1h
//  - começa em >2h   -> pré-jogo distante -> 10min
//  - janela do jogo (-2h a +4h do apito) -> 10s (ao vivo)
function eventTtl(startTimestamp?: number): number {
  if (!startTimestamp) return 10;
  const since = Date.now() / 1000 - startTimestamp;
  if (since > 4 * 3600) return 3600;
  if (since < -2 * 3600) return 600;
  return 10;
}

// Só o evento (status + placar) — 1 chamada leve. Usado no generateMetadata pra
// título/description cientes do status, sem puxar o detalhe inteiro.
export async function getMatchEvent(id: number, startHint?: number): Promise<MatchEvent | null> {
  const raw = await fetchAllSports<any>(`match/${id}`, eventTtl(startHint));
  return raw?.event ? normalizeEvent(raw.event) : null;
}

// Comentários MANUAIS (editorial) por jogo — injetados no lance a lance além do que
// a API traz. Ex: comunicado oficial da FIFA numa paralisação que a API só marca no
// status (sem texto). Chave = id do jogo na API.
const MANUAL_COMMENTARY: Record<number, MatchCommentary[]> = {
  // França x Iraque (22/06) — paralisação por raios na Filadélfia.
  15186769: [
    {
      id: 2_000_000_001,
      type: "fifaNote",
      text:
        'Jogo interrompido entre França e Iraque devido ao mau tempo. A organizadora da ' +
        'Copa do Mundo divulgou: "Devido às condições climáticas adversas na Filadélfia, ' +
        'incluindo o risco de raios nas proximidades do estádio, a partida da Copa do Mundo ' +
        'da FIFA entre França e Iraque foi suspensa. Foi anunciado um intervalo de 30 minutos. ' +
        'No entanto, a situação ainda está sendo monitorada para determinar se novos atrasos ' +
        'são previstos. A FIFA seguirá os protocolos de segurança estabelecidos pelas ' +
        'autoridades locais e a partida será retomada assim que for seguro fazê-lo. A ' +
        'segurança de todos é a prioridade da FIFA. Agradecemos a compreensão e a cooperação ' +
        'de todos os torcedores."',
      textPt: null,
      isHome: null,
      player: null,
      playerId: null,
      playerIn: null,
      playerInId: null,
      playerOut: null,
      reason: null,
      minute: 46, // limite do intervalo: aparece "após o 1º tempo"
    },
  ],
};

// Insere itens no feed (ordenado decrescente por minuto) na posição do minuto de cada um,
// sem duplicar e sem mexer nos lances da API. Usado tanto pro comentário hardcoded (FIFA)
// quanto pros comentários editoriais do /cms (getMatchComments).
export function injectByMinute(feed: MatchCommentary[], items: MatchCommentary[]): MatchCommentary[] {
  if (!items?.length) return feed;
  const result = [...feed];
  for (const item of items) {
    if (result.some((x) => x.id === item.id)) continue;
    const idx = result.findIndex(
      (x) => x.minute != null && item.minute != null && x.minute < item.minute
    );
    if (idx === -1) result.push(item);
    else result.splice(idx, 0, item);
  }
  return result;
}

// Comentário manual hardcoded (ex.: nota oficial da FIFA). Aplicar DEPOIS da tradução.
function injectManualCommentary(id: number, feed: MatchCommentary[]): MatchCommentary[] {
  return injectByMinute(feed, MANUAL_COMMENTARY[id] || []);
}

// Detalhe completo (server render inicial). Busca o event primeiro pra saber o
// status e adaptar o TTL do resto (não martela a API em jogo encerrado).
// Detalhe completo do jogo (placar, escalações, estatísticas e LANCE A LANCE). Salva
// snapshot a cada render com dado real e serve o snapshot quando a API parar de servir
// → o lance a lance do jogo fica preservado pra sempre. Captura "a partir de agora":
// todo jogo renderizado/visto é arquivado, e o encerrado congela no estado final.
export async function getMatchDetail(id: number, startHint?: number): Promise<MatchDetail | null> {
  const detail = await withSnapshot<MatchDetail>(
    "matches",
    id,
    () => fetchMatchDetailLive(id, startHint),
    (d) => !!d.event
  );
  // Comentários editoriais do /cms: injetados FORA do snapshot pra sempre virem frescos
  // (mesmo quando a API cai e serve o snapshot). Encaixados pelo minuto, sem tocar na API.
  if (detail) detail.commentary = injectByMinute(detail.commentary, await getMatchComments(id));
  return detail;
}

async function fetchMatchDetailLive(id: number, startHint?: number): Promise<MatchDetail | null> {
  const eventRaw = await fetchAllSports<any>(`match/${id}`, eventTtl(startHint));
  if (!eventRaw?.event) return null;
  const event = normalizeEvent(eventRaw.event);
  const ttl = liveTtl(event.statusType);

  const [incRaw, lineRaw, statRaw, commRaw] = await Promise.all([
    fetchAllSports<any>(`match/${id}/incidents`, ttl),
    fetchAllSports<any>(`match/${id}/lineups`, event.statusType === "finished" ? 86400 : 3600),
    fetchAllSports<any>(`match/${id}/statistics`, ttl),
    fetchAllSports<any>(`match/${id}/commentary`, ttl),
  ]);

  return {
    event,
    incidents: normalizeIncidents(incRaw),
    commentary: injectManualCommentary(id, await translateFeed(mergeFeed(normalizeCommentary(commRaw), incRaw))),
    home: normalizeLineup(lineRaw?.home),
    away: normalizeLineup(lineRaw?.away),
    lineupsConfirmed: !!lineRaw?.confirmed,
    stats: normalizeStats(statRaw),
    shootout: normalizeShootout(incRaw),
  };
}

// Versão "live" enxuta pro polling do cliente (sem escalação, que muda pouco).
export interface MatchLive {
  event: MatchEvent;
  incidents: MatchIncident[];
  commentary: MatchCommentary[];
  stats: MatchStatItem[];
  shootout: ShootoutKick[];
}

export async function getMatchLive(id: number, startHint?: number): Promise<MatchLive | null> {
  const eventRaw = await fetchAllSports<any>(`match/${id}`, eventTtl(startHint));
  if (!eventRaw?.event) return null;
  const event = normalizeEvent(eventRaw.event);
  const ttl = liveTtl(event.statusType);
  const [incRaw, statRaw, commRaw] = await Promise.all([
    fetchAllSports<any>(`match/${id}/incidents`, ttl),
    fetchAllSports<any>(`match/${id}/statistics`, ttl),
    fetchAllSports<any>(`match/${id}/commentary`, ttl),
  ]);
  return {
    event,
    incidents: normalizeIncidents(incRaw),
    commentary: injectByMinute(
      injectManualCommentary(id, await translateFeed(mergeFeed(normalizeCommentary(commRaw), incRaw))),
      await getMatchComments(id)
    ),
    stats: normalizeStats(statRaw),
    shootout: normalizeShootout(incRaw),
  };
}

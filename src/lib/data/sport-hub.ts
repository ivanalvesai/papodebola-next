import { fetchAllSports } from "@/lib/api/allsports";
import { readSnapshot, saveSnapshot } from "@/lib/data/snapshot-store";
import { SPORT_HUBS, type HubTournament, type SportHubConfig } from "@/lib/sport-hub-config";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Campeonatos dos outros esportes (eSports, tênis, UFC...) gravados no volume:
// data/snapshots/sport-hub/{torneio}.json. Só o DEV atualiza (cron → /api/sport-hub/refresh);
// as páginas e o carrossel ao vivo apenas LEEM do disco (regra de ouro + regra de velocidade).
//
// Cadência (banda é o custo real da API, 10 GB/mês):
//  - jogo ao vivo (ou que já devia ter começado): match/{id} a cada execução (resposta pequena);
//  - lista do torneio (last/0 + next/0): a cada 30 min se tem jogo em ±2 dias, senão a cada 6 h;
//  - temporada + classificação: a cada 6 h. Snapshot bom nunca é trocado por resposta vazia.

const CAT = "sport-hub";
const MIN = 60_000;
const HOUR = 60 * MIN;
const CALL_BUDGET = 45; // chamadas à API por execução do cron

export interface HubSide {
  id: number;
  name: string;
  short: string;
  country: string; // alpha2
}

export interface HubEvent {
  id: number;
  ts: number;
  status: string; // notstarted | inprogress | finished | canceled | postponed ...
  statusDesc: string;
  home: HubSide;
  away: HubSide;
  hs: number | null;
  as: number | null;
  winner: number | null; // 1 casa, 2 fora, 3 empate
  bestOf: number | null;
  round: string; // nome da fase quando a API traz (ex.: "Final")
  weightClass?: string; // UFC
  order?: number; // UFC: ordem no card
}

export interface HubStandingGroup {
  name: string;
  rows: { pos: number; teamId: number; team: string; matches: number; wins: number; losses: number; draws: number | null; points: number | null }[];
}

export interface HubSeasonSnap {
  tid: number;
  seasonId: number;
  seasonName: string;
  events: HubEvent[];
  standings: HubStandingGroup[] | null;
  prev: { seasonName: string; standings: HubStandingGroup[] } | null;
  listAt: number;
  fullAt: number;
}

export interface HubCard {
  seasonId: number;
  name: string;
  ts: number; // 0 = ainda sem lutas carregadas
  venue: string;
  fights: HubEvent[];
  at: number;
}

export interface HubEventsSnap {
  tid: number;
  cards: HubCard[];
  seasonsAt: number;
}

const side = (t: any): HubSide => ({
  id: t?.id || 0,
  name: t?.name || "",
  short: t?.shortName || t?.name || "",
  country: t?.country?.alpha2 || "",
});

const score = (s: any): number | null => {
  const v = s?.display ?? s?.current;
  return typeof v === "number" ? v : null;
};

export function normalizeHubEvent(e: any): HubEvent {
  return {
    id: e.id,
    ts: e.startTimestamp || 0,
    status: e.status?.type || "",
    statusDesc: e.status?.description || "",
    home: side(e.homeTeam),
    away: side(e.awayTeam),
    hs: score(e.homeScore),
    as: score(e.awayScore),
    winner: e.winnerCode ?? null,
    bestOf: e.bestOf ?? null,
    round: e.roundInfo?.name || "",
    ...(e.weightClass ? { weightClass: String(e.weightClass) } : {}),
    ...(typeof e.order === "number" ? { order: e.order } : {}),
  };
}

function normalizeStandings(data: any): HubStandingGroup[] | null {
  const groups = (data?.standings || [])
    .map((g: any) => ({
      name: g.name || "",
      rows: (g.rows || []).map((r: any) => ({
        pos: r.position ?? 0,
        teamId: r.team?.id || 0,
        team: r.team?.shortName || r.team?.name || "",
        matches: r.matches ?? 0,
        wins: r.wins ?? 0,
        losses: r.losses ?? 0,
        draws: typeof r.draws === "number" ? r.draws : null,
        points: typeof r.points === "number" ? r.points : null,
      })),
    }))
    .filter((g: HubStandingGroup) => g.rows.length > 0);
  return groups.length ? groups : null;
}

// ---------- leitura (páginas) ----------

export async function readHubSeason(tid: number): Promise<HubSeasonSnap | null> {
  return readSnapshot<HubSeasonSnap>(CAT, tid);
}
export async function readHubEvents(tid: number): Promise<HubEventsSnap | null> {
  return readSnapshot<HubEventsSnap>(CAT, `${tid}-events`);
}

// ---------- atualização (cron do dev) ----------

class Budget {
  used = 0;
  constructor(private max: number) {}
  ok(n = 1) {
    return this.used + n <= this.max;
  }
  async get<T>(path: string, revalidate: number): Promise<T | null> {
    this.used++;
    return fetchAllSports<T>(path, revalidate).catch(() => null);
  }
}

const shouldBeLive = (e: HubEvent, now: number) =>
  e.status === "inprogress" || (e.status === "notstarted" && e.ts * 1000 <= now + 5 * MIN && e.ts * 1000 >= now - 8 * HOUR);

const nearGame = (events: HubEvent[], now: number) =>
  events.some((e) => Math.abs(e.ts * 1000 - now) < 48 * HOUR);

async function refreshLiveEvents(events: HubEvent[], b: Budget, now: number): Promise<{ events: HubEvent[]; ended: boolean }> {
  let ended = false;
  const out = [...events];
  for (let i = 0; i < out.length; i++) {
    if (!shouldBeLive(out[i], now) || !b.ok()) continue;
    const d = await b.get<any>(`match/${out[i].id}`, 30);
    if (!d?.event) continue;
    const n = normalizeHubEvent(d.event);
    if (out[i].status !== "finished" && n.status === "finished") ended = true;
    out[i] = { ...out[i], ...n, weightClass: out[i].weightClass ?? n.weightClass, order: out[i].order ?? n.order };
  }
  return { events: out, ended };
}

async function refreshSeasonTournament(t: HubTournament, b: Budget, now: number, force: boolean): Promise<string> {
  const snap = await readHubSeason(t.id);
  let next: HubSeasonSnap | null = snap ? { ...snap } : null;

  // 1) ao vivo
  let listDue = false;
  if (next) {
    const r = await refreshLiveEvents(next.events, b, now);
    next.events = r.events;
    listDue = r.ended;
  }

  const fullDue = force || !next || now - next.fullAt > 6 * HOUR;
  if (next && !fullDue) {
    const interval = nearGame(next.events, now) ? 30 * MIN : 6 * HOUR;
    listDue = listDue || now - next.listAt > interval;
  }

  // 2) temporada (+ classificação) / lista de jogos
  if (fullDue || listDue) {
    if (!b.ok(fullDue ? 4 : 2)) {
      if (next) await saveSnapshot(CAT, t.id, next);
      return "sem orçamento";
    }
    let seasonId = next?.seasonId || 0;
    let seasonName = next?.seasonName || "";
    let seasons: any[] = [];
    if (fullDue) {
      const s = await b.get<any>(`tournament/${t.id}/seasons`, 3600);
      seasons = s?.seasons || [];
      if (seasons[0]?.id) {
        seasonId = seasons[0].id;
        seasonName = seasons[0].name || seasons[0].year || "";
      }
    }
    if (!seasonId) return "sem temporada";
    const base = `tournament/${t.id}/season/${seasonId}`;
    const [last, nx] = [await b.get<any>(`${base}/matches/last/0`, 300), await b.get<any>(`${base}/matches/next/0`, 300)];
    const byId = new Map<number, HubEvent>();
    for (const e of [...(last?.events || []), ...(nx?.events || [])]) if (e?.id) byId.set(e.id, normalizeHubEvent(e));
    const fresh = [...byId.values()].sort((a, c) => a.ts - c.ts);
    const seasonChanged = !!next && next.seasonId !== seasonId;
    // Nunca trocar lista boa por vazia (API fora / temporada ainda sem jogos).
    const events = fresh.length ? fresh : seasonChanged ? [] : next?.events || [];

    let standings = next?.standings ?? null;
    let prev = next?.prev ?? null;
    if (fullDue) {
      const st = normalizeStandings(await b.get<any>(`${base}/standings/total`, 3600));
      if (st) standings = st;
      else if (seasonChanged) standings = null;
      if (t.prevSeason && seasons[1]?.id && events.length < 12 && b.ok()) {
        const pst = normalizeStandings(await b.get<any>(`tournament/${t.id}/season/${seasons[1].id}/standings/total`, 21600));
        if (pst) prev = { seasonName: seasons[1].name || "", standings: pst };
      }
    }
    next = {
      tid: t.id,
      seasonId,
      seasonName,
      events,
      standings,
      prev,
      listAt: now,
      fullAt: fullDue ? now : next?.fullAt || now,
    };
  }
  if (next) await saveSnapshot(CAT, t.id, next);
  return fullDue ? "completo" : listDue ? "lista" : "ao vivo";
}

// UFC: cada "season" do torneio é um evento (card). Carrega os cards aos poucos e só
// atualiza os que estão perto (±3 dias) ou ao vivo.
async function refreshEventsTournament(t: HubTournament, b: Budget, now: number, force: boolean): Promise<string> {
  const snap = (await readHubEvents(t.id)) || { tid: t.id, cards: [], seasonsAt: 0 };
  const cards = new Map(snap.cards.map((c) => [c.seasonId, c]));
  let seasonsAt = snap.seasonsAt;
  if ((force || now - seasonsAt > 6 * HOUR) && b.ok()) {
    const s = await b.get<any>(`tournament/${t.id}/seasons`, 3600);
    for (const se of s?.seasons || []) {
      const year = Number(String(se.year || "").slice(0, 4));
      if (!se.id || cards.has(se.id) || year < new Date(now).getFullYear()) continue;
      cards.set(se.id, { seasonId: se.id, name: se.name || "", ts: 0, venue: "", fights: [], at: 0 });
    }
    if (s?.seasons) seasonsAt = now;
  }
  const due = (c: HubCard) => {
    if (!c.at) return true;
    const dt = c.ts * 1000 - now;
    if (c.fights.some((f) => shouldBeLive(f, now))) return now - c.at > 3 * MIN;
    if (Math.abs(dt) < 3 * 24 * HOUR) return now - c.at > 30 * MIN;
    if (dt > 0) return now - c.at > 24 * HOUR;
    return false; // evento passado e já carregado: congelado
  };
  const queue = [...cards.values()].filter(due).sort((a, c) => (a.at ? 1 : 0) - (c.at ? 1 : 0) || a.ts - c.ts);
  for (const c of queue) {
    if (!b.ok(2)) break;
    const base = `tournament/${t.id}/season/${c.seasonId}/matches`;
    const [nx, last] = [await b.get<any>(`${base}/next/0`, 300), await b.get<any>(`${base}/last/0`, 300)];
    const raw = [...(nx?.events || []), ...(last?.events || [])];
    if (!raw.length) {
      cards.set(c.seasonId, { ...c, at: now });
      continue;
    }
    const fights = raw.map(normalizeHubEvent).sort((x, y) => (y.order ?? 0) - (x.order ?? 0) || x.ts - y.ts);
    cards.set(c.seasonId, {
      ...c,
      fights,
      ts: Math.min(...fights.map((f) => f.ts).filter(Boolean)),
      venue: [raw[0]?.venue?.name, raw[0]?.venue?.city?.name].filter(Boolean).join(", "),
      at: now,
    });
  }
  // Guarda só o que interessa: eventos dos últimos 60 dias e futuros (e os ainda não carregados).
  const keep = [...cards.values()].filter((c) => !c.ts || c.ts * 1000 > now - 60 * 24 * HOUR);
  await saveSnapshot(CAT, `${t.id}-events`, { tid: t.id, cards: keep, seasonsAt });
  return `${queue.length} cards na fila`;
}

export async function refreshSportHubs(opts: { force?: boolean; only?: string } = {}): Promise<Record<string, string>> {
  const b = new Budget(CALL_BUDGET);
  const now = Date.now();
  const result: Record<string, string> = {};
  const seen = new Set<number>();
  for (const hub of Object.values(SPORT_HUBS)) {
    if (opts.only && hub.sportKey !== opts.only) continue;
    for (const g of hub.groups)
      for (const t of g.tournaments) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        try {
          result[`${t.id} ${t.name}`] =
            t.mode === "events" ? await refreshEventsTournament(t, b, now, !!opts.force) : await refreshSeasonTournament(t, b, now, !!opts.force);
        } catch (e) {
          result[`${t.id} ${t.name}`] = `erro: ${String(e).slice(0, 80)}`;
        }
      }
  }
  result._chamadas = String(b.used);
  return result;
}

// ---------- modelo da página ----------

export type HubStatus = "live" | "ongoing" | "upcoming" | "finished" | "empty";

export interface HubTournamentView {
  cfg: HubTournament;
  status: HubStatus;
  seasonName: string;
  firstTs: number;
  lastTs: number;
  live: HubEvent[];
  upcoming: HubEvent[];
  results: HubEvent[];
  champion: string | null;
  standings: HubStandingGroup[] | null;
  prev: HubSeasonSnap["prev"];
  cards?: HubCard[]; // modo events (UFC)
}

export interface HubGroupView {
  key: string;
  title: string;
  intro: string;
  tournaments: HubTournamentView[];
}

export interface SportHubView {
  config: SportHubConfig;
  groups: HubGroupView[];
  live: { event: HubEvent; league: string }[];
}

const isFinal = (r: string) => /^(grand )?final$/i.test(r.trim()) || /^finals?$/i.test(r.trim());
const STATUS_ORDER: Record<HubStatus, number> = { live: 0, ongoing: 1, upcoming: 2, finished: 3, empty: 4 };

function viewSeason(cfg: HubTournament, s: HubSeasonSnap | null): HubTournamentView {
  const events = s?.events || [];
  const live = events.filter((e) => e.status === "inprogress");
  const upcoming = events.filter((e) => e.status === "notstarted").sort((a, b) => a.ts - b.ts);
  const results = events.filter((e) => e.status === "finished").sort((a, b) => b.ts - a.ts);
  const final = results.find((e) => isFinal(e.round));
  const champion = final && final.winner ? (final.winner === 1 ? final.home.name : final.winner === 2 ? final.away.name : null) : null;
  const status: HubStatus = !events.length
    ? "empty"
    : live.length
      ? "live"
      : upcoming.length && results.length
        ? "ongoing"
        : upcoming.length
          ? "upcoming"
          : "finished";
  return {
    cfg,
    status,
    seasonName: s?.seasonName || "",
    firstTs: events[0]?.ts || 0,
    lastTs: events[events.length - 1]?.ts || 0,
    live,
    upcoming,
    results,
    champion,
    standings: s?.standings || null,
    prev: s?.prev || null,
  };
}

function viewEvents(cfg: HubTournament, s: HubEventsSnap | null, now: number): HubTournamentView {
  const cards = (s?.cards || []).filter((c) => c.ts && c.fights.length).sort((a, b) => a.ts - b.ts);
  const live = cards.flatMap((c) => c.fights.filter((f) => f.status === "inprogress"));
  const upcomingCards = cards.filter((c) => c.ts * 1000 > now - 12 * HOUR && c.fights.some((f) => f.status !== "finished"));
  const pastCards = cards.filter((c) => !upcomingCards.includes(c)).reverse();
  return {
    cfg,
    status: live.length ? "live" : upcomingCards.length ? "upcoming" : cards.length ? "finished" : "empty",
    seasonName: "",
    firstTs: upcomingCards[0]?.ts || 0,
    lastTs: upcomingCards[upcomingCards.length - 1]?.ts || 0,
    live,
    upcoming: [],
    results: [],
    champion: null,
    standings: null,
    prev: null,
    cards: [...upcomingCards.slice(0, 4), ...pastCards.slice(0, 2)],
  };
}

export async function getSportHub(sportKey: string): Promise<SportHubView | null> {
  const config = SPORT_HUBS[sportKey];
  if (!config) return null;
  const now = Date.now();
  const groups: HubGroupView[] = [];
  const live: SportHubView["live"] = [];
  for (const g of config.groups) {
    const tournaments: HubTournamentView[] = [];
    for (const t of g.tournaments) {
      const v = t.mode === "events" ? viewEvents(t, await readHubEvents(t.id), now) : viewSeason(t, await readHubSeason(t.id));
      for (const e of v.live) live.push({ event: e, league: t.name });
      tournaments.push(v);
    }
    tournaments.sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        (a.status === "upcoming" ? a.firstTs - b.firstTs : 0) ||
        (a.status === "finished" ? b.lastTs - a.lastTs : 0)
    );
    groups.push({ key: g.key, title: g.title, intro: g.intro, tournaments });
  }
  return { config, groups, live };
}

// Só os jogos ao vivo (carrossel com polling). Lê do disco.
export async function getSportHubLive(sportKey: string): Promise<SportHubView["live"]> {
  return (await getSportHub(sportKey))?.live ?? [];
}

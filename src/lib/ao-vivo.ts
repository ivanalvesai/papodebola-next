import { TOURNAMENTS } from "./config.ts";

// /ao-vivo: separa a agenda do dia (store salvo) em "ao vivo agora", "ainda hoje" e
// "encerrados", e diz quais endpoints de placar ao vivo o cliente deve consultar.
// Puro (testado em ao-vivo.test.ts).
type Ev = { id: number; statusType: string; timestamp: number };
type Group<E extends Ev> = { league: string; events: E[] };

const isLive = (t: string) => t === "inprogress" || t === "interrupted";

export function splitByStatus<E extends Ev>(leagues: Group<E>[]) {
  const pick = (f: (e: E) => boolean) =>
    leagues.map((l) => ({ league: l.league, events: l.events.filter(f) })).filter((l) => l.events.length > 0);
  const upcoming = pick((e) => !isLive(e.statusType) && e.statusType !== "finished").sort(
    (a, b) => a.events[0].timestamp - b.events[0].timestamp
  );
  return {
    live: pick((e) => isLive(e.statusType)),
    upcoming,
    finished: pick((e) => e.statusType === "finished"),
  };
}

const slugByName = new Map(Object.values(TOURNAMENTS).map((t) => [t.name, t.slug]));

export function liveEndpointsFor<E extends Ev>(leagues: Group<E>[], nowSec: number = Date.now() / 1000): string[] {
  const out: string[] = [];
  for (const l of leagues) {
    const slug = slugByName.get(l.league);
    if (!slug) continue;
    const hot = l.events.some((e) => isLive(e.statusType) || (e.statusType !== "finished" && e.timestamp - nowSec <= 1800));
    if (hot) out.push(`/api/championship/${slug}/ao-vivo`);
  }
  return out;
}

// Seções por campeonato da /ao-vivo: campeonato com jogo rolando primeiro, depois pelo
// próximo apito, e os que só têm encerrados por último. Dentro de cada um: ao vivo,
// depois os próximos por horário, depois os encerrados.
const rank = (e: Ev) => (isLive(e.statusType) ? 0 : e.statusType === "finished" ? 2 : 1);
export function orderCompetitions<E extends Ev>(leagues: Group<E>[]): (Group<E> & { live: number; next: number })[] {
  return leagues
    .map((l) => {
      const events = [...l.events].sort((a, b) => rank(a) - rank(b) || a.timestamp - b.timestamp);
      const live = events.filter((e) => isLive(e.statusType)).length;
      const pending = events.filter((e) => rank(e) === 1);
      return { ...l, events, live, next: pending.length ? pending[0].timestamp : Infinity };
    })
    .sort((a, b) => Number(b.live > 0) - Number(a.live > 0) || a.next - b.next || a.league.localeCompare(b.league, "pt-BR"));
}

// Texto curto de cada seção (SEO): quantos jogos, quantos ao vivo, quantos encerrados.
export function competitionIntro(league: string, events: Ev[]): string {
  const n = events.length;
  const live = events.filter((e) => isLive(e.statusType)).length;
  const done = events.filter((e) => e.statusType === "finished").length;
  const jogos = (k: number) => `${k} ${k === 1 ? "jogo" : "jogos"}`;
  const parts = [`${jogos(n)} da ${league} hoje`];
  if (live) parts.push(`${live} rolando agora`);
  if (done) parts.push(`${done} ${done === 1 ? "encerrado" : "encerrados"}`);
  return `${parts.join(", ")}. Acompanhe o placar ao vivo e toque no jogo para ver o lance a lance, as escalações e as estatísticas.`;
}

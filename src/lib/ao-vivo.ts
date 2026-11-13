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

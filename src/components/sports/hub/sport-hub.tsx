import { TeamLogo } from "@/components/ui/team-logo";
import { getSportHub, type HubEvent, type HubTournamentView, type HubStandingGroup, type HubCard, type HubStatus } from "@/lib/data/sport-hub";
import { SPORT_WATCH } from "@/lib/sport-hub-watch";
import { HubLiveCarousel } from "./live-carousel";

// Conteúdo das páginas de esporte fora do futebol (eSports, tênis, UFC): ao vivo, seções por
// modalidade (ex.: League of Legends, Counter-Strike 2, Dota 2) com "onde assistir", e um
// card por campeonato (situação, próximos jogos, resultados, classificação). Tudo lido do
// disco (data/snapshots/sport-hub), gravado pelo cron do dev.

const TZ = "America/Sao_Paulo";
const fmtDay = (ts: number) => new Date(ts * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TZ });
const fmtTime = (ts: number) => new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });
const fmtLong = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", timeZone: TZ });

const BADGE: Record<HubStatus, { label: string; cls: string }> = {
  live: { label: "Ao vivo", cls: "bg-red text-white" },
  ongoing: { label: "Em andamento", cls: "bg-green text-white" },
  upcoming: { label: "Em breve", cls: "bg-[#1f5fbf] text-white" },
  finished: { label: "Encerrado", cls: "bg-body text-text-secondary border border-border-custom" },
  empty: { label: "Sem jogos", cls: "bg-body text-text-muted border border-border-custom" },
};

function Badge({ status }: { status: HubStatus }) {
  const b = BADGE[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${b.cls}`}>
      {status === "live" && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />}
      {b.label}
    </span>
  );
}

function SideRow({ team, score, won, live }: { team: HubEvent["home"]; score: number | null; won: boolean; live: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <TeamLogo teamId={team.id || null} alt="" size={20} />
      <span className={`min-w-0 flex-1 truncate text-sm ${won ? "font-bold text-text-primary" : "text-text-primary"}`}>{team.name}</span>
      {score !== null && <span className={`w-6 text-right text-sm font-bold ${live ? "text-red" : won ? "text-text-primary" : "text-text-muted"}`}>{score}</span>}
    </div>
  );
}

function EventRow({ e, showScore = true }: { e: HubEvent; showScore?: boolean }) {
  const live = e.status === "inprogress";
  const fin = e.status === "finished";
  return (
    <li className="flex items-center gap-3 py-2.5">
      <div className="w-14 shrink-0 text-center leading-tight">
        <div className="text-xs text-text-muted">{fmtDay(e.ts)}</div>
        <div className={`text-sm font-semibold ${live ? "text-red" : "text-text-secondary"}`}>{live ? "Ao vivo" : fin ? "Fim" : fmtTime(e.ts)}</div>
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <SideRow team={e.home} score={showScore ? e.hs : null} won={e.winner === 1} live={live} />
        <SideRow team={e.away} score={showScore ? e.as : null} won={e.winner === 2} live={live} />
      </div>
      {(e.bestOf || e.round) && (
        <div className="hidden w-20 shrink-0 text-right text-xs text-text-muted sm:block">
          {e.round || ""}
          {e.round && e.bestOf ? " · " : ""}
          {e.bestOf ? `MD${e.bestOf}` : ""}
        </div>
      )}
    </li>
  );
}

function StandingsTable({ group, max = 16 }: { group: HubStandingGroup; max?: number }) {
  const hasDraws = group.rows.some((r) => r.draws);
  const hasPts = group.rows.some((r) => r.points !== null);
  return (
    <div className="overflow-hidden rounded-md border border-border-light">
      {group.name && <div className="bg-body px-3 py-1.5 text-xs font-bold uppercase text-green">{group.name}</div>}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-text-muted">
            <th className="w-8 py-1.5 text-center font-semibold">#</th>
            <th className="py-1.5 text-left font-semibold">Equipe</th>
            <th className="w-9 py-1.5 text-center font-semibold">J</th>
            <th className="w-9 py-1.5 text-center font-semibold">V</th>
            {hasDraws && <th className="w-9 py-1.5 text-center font-semibold">E</th>}
            <th className="w-9 py-1.5 text-center font-semibold">D</th>
            {hasPts && <th className="w-10 py-1.5 text-center font-semibold">Pts</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-light">
          {group.rows.slice(0, max).map((r) => (
            <tr key={`${r.teamId}-${r.pos}`}>
              <td className="py-1.5 text-center text-text-muted">{r.pos}</td>
              <td className="py-1.5">
                <span className="flex items-center gap-2">
                  <TeamLogo teamId={r.teamId || null} alt="" size={18} />
                  <span className="truncate font-semibold text-text-primary">{r.team}</span>
                </span>
              </td>
              <td className="py-1.5 text-center">{r.matches}</td>
              <td className="py-1.5 text-center">{r.wins}</td>
              {hasDraws && <td className="py-1.5 text-center">{r.draws ?? 0}</td>}
              <td className="py-1.5 text-center">{r.losses}</td>
              {hasPts && <td className="py-1.5 text-center font-bold">{r.points ?? "-"}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Standings({ groups, title }: { groups: HubStandingGroup[]; title: string }) {
  return (
    <div>
      <h4 className="mb-2 text-xs font-bold uppercase text-text-secondary">{title}</h4>
      <div className="space-y-3">
        {groups.slice(0, 4).map((g) => (
          <StandingsTable key={g.name || "geral"} group={g} />
        ))}
      </div>
    </div>
  );
}

function dateRange(t: HubTournamentView): string {
  if (!t.firstTs) return "";
  const a = fmtDay(t.firstTs);
  const b = fmtDay(t.lastTs);
  return a === b ? a : `${a} a ${b}`;
}

function TournamentCard({ t }: { t: HubTournamentView }) {
  const done = t.status === "finished" || t.status === "empty";
  const standings = t.standings?.length ? t.standings : null;
  const prev = !standings && t.prev?.standings?.length ? t.prev : null;
  const games = [...t.live, ...t.upcoming].slice(0, 6);
  return (
    <article id={`torneio-${t.cfg.id}`} className="scroll-mt-24 rounded-lg border border-border-custom bg-card-bg">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border-custom px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary">{t.cfg.name}</h3>
          <p className="text-xs text-text-muted">
            {[t.seasonName, t.status === "upcoming" && t.firstTs ? `começa ${fmtLong(t.firstTs)}` : dateRange(t)].filter(Boolean).join(" · ")}
          </p>
        </div>
        <Badge status={t.status} />
      </header>

      <div className={`grid gap-5 p-4 ${!done && (standings || t.results.length) ? "lg:grid-cols-2" : ""}`}>
        {t.champion && (
          <p className="rounded-md bg-body px-3 py-2 text-sm text-text-primary lg:col-span-2">
            Campeão: <strong>{t.champion}</strong>
          </p>
        )}
        {games.length > 0 && (
          <div>
            <h4 className="mb-1 text-xs font-bold uppercase text-text-secondary">{t.live.length ? "Ao vivo e próximos jogos" : "Próximos jogos"}</h4>
            <ul className="divide-y divide-border-light">
              {games.map((e) => (
                <EventRow key={e.id} e={e} />
              ))}
            </ul>
          </div>
        )}
        {(standings || t.results.length > 0 || prev) && (
          <div className="space-y-4">
            {standings && !done && <Standings groups={standings} title="Classificação" />}
            {t.results.length > 0 && (
              <div>
                <h4 className="mb-1 text-xs font-bold uppercase text-text-secondary">{done ? "Últimos resultados" : "Resultados"}</h4>
                <ul className="divide-y divide-border-light">
                  {t.results.slice(0, done ? 3 : 5).map((e) => (
                    <EventRow key={e.id} e={e} />
                  ))}
                </ul>
              </div>
            )}
            {standings && done && (
              <details className="group">
                <summary className="cursor-pointer text-sm font-semibold text-green">Ver classificação final</summary>
                <div className="mt-3">
                  <Standings groups={standings} title="Classificação" />
                </div>
              </details>
            )}
            {prev && (
              <details className="group" open={t.status !== "finished"}>
                <summary className="cursor-pointer text-sm font-semibold text-green">Classificação de {prev.seasonName}</summary>
                <div className="mt-3">
                  <Standings groups={prev.standings} title={prev.seasonName} />
                </div>
              </details>
            )}
          </div>
        )}
        {t.status === "empty" && <p className="text-sm text-text-muted">A tabela e os jogos aparecem aqui assim que o campeonato for divulgado.</p>}
      </div>
    </article>
  );
}

function FightCard({ c }: { c: HubCard }) {
  const fights = c.fights.slice(0, 14);
  const live = fights.some((f) => f.status === "inprogress");
  const done = fights.every((f) => f.status === "finished");
  return (
    <article className="rounded-lg border border-border-custom bg-card-bg">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-border-custom px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-text-primary">{c.name}</h3>
          <p className="text-xs text-text-muted">{[fmtLong(c.ts), c.venue].filter(Boolean).join(" · ")}</p>
        </div>
        <Badge status={live ? "live" : done ? "finished" : "upcoming"} />
      </header>
      <ul className="divide-y divide-border-light px-4">
        {fights.map((f) => (
          <li key={f.id} className="py-2.5">
            {f.weightClass && <div className="mb-1 text-xs font-semibold uppercase text-text-muted">{weightPt(f.weightClass)}</div>}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-sm">
              <span className={`truncate ${f.winner === 1 ? "font-bold text-text-primary" : "text-text-primary"}`}>
                {f.home.name}
                {f.winner === 1 && <span className="ml-1 text-xs font-bold text-green">venceu</span>}
              </span>
              <span className="text-xs font-bold text-text-muted">x</span>
              <span className={`truncate text-right ${f.winner === 2 ? "font-bold text-text-primary" : "text-text-primary"}`}>
                {f.winner === 2 && <span className="mr-1 text-xs font-bold text-green">venceu</span>}
                {f.away.name}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

const WEIGHT: Record<string, string> = {
  heavy: "Peso-pesado", lightheavy: "Meio-pesado", middle: "Médio", welter: "Meio-médio", light: "Leve",
  feather: "Pena", bantam: "Galo", fly: "Mosca", strawweight: "Palha", straw: "Palha",
  wflyweight: "Mosca feminino", wbantam: "Galo feminino", wstraw: "Palha feminino", wfeather: "Pena feminino",
};
function weightPt(w: string): string {
  const k = w.toLowerCase().replace(/weight|[\s_-]/g, "");
  return WEIGHT[k] || WEIGHT[k.replace(/^women/, "w")] || w;
}

export function WatchBox({ keys }: { keys: string[] }) {
  const items = [...new Set(keys)].map((k) => SPORT_WATCH[k]).filter(Boolean);
  if (!items.length) return null;
  return (
    <div className="rounded-lg border border-green/30 bg-green/5 p-4">
      <h3 className="mb-3 text-sm font-bold uppercase text-green">Onde assistir</h3>
      <ul className="space-y-3">
        {items.map((w) => (
          <li key={w.nome}>
            <div className="text-sm font-bold text-text-primary">{w.nome}</div>
            <p className="text-sm leading-relaxed text-text-secondary">{w.resumo}</p>
            {w.canais.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {w.canais.map((c) => (
                  <span key={c.nome} className="rounded-full border border-border-custom bg-card-bg px-2.5 py-0.5 text-xs font-semibold text-text-primary">
                    {c.nome}
                    {c.tipo ? <span className="font-normal text-text-muted"> · {c.tipo}</span> : null}
                  </span>
                ))}
              </div>
            )}
            {!w.confirmado && <p className="mt-1 text-xs text-text-muted">Transmissão ainda não confirmada por mais de uma fonte: confirme perto do evento.</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function SportHub({ sportKey, extraWatch = [] }: { sportKey: string; extraWatch?: string[] }) {
  const hub = await getSportHub(sportKey);
  if (!hub) return null;
  const isFights = hub.groups.every((g) => g.tournaments.every((t) => t.cfg.mode === "events"));
  return (
    <div className="space-y-6">
      <HubLiveCarousel sport={sportKey} initial={hub.live} hideScore={isFights} />

      {hub.groups.length > 1 && (
        <nav aria-label="Modalidades" className="flex flex-wrap gap-2">
          {hub.groups.map((g) => (
            <a key={g.key} href={`#${g.key}`} className="rounded-full border border-border-custom bg-card-bg px-3 py-1 text-sm font-semibold text-text-primary transition-colors hover:border-green hover:text-green">
              {g.title}
            </a>
          ))}
        </nav>
      )}

      {hub.groups.map((g) => {
        const active = g.tournaments.filter((t) => t.status !== "finished" && t.status !== "empty");
        const past = g.tournaments.filter((t) => t.status === "finished");
        const watch = [...g.tournaments.map((t) => t.cfg.watchKey).filter((k): k is string => !!k), ...(hub.config.groups.find((x) => x.key === g.key)?.watch || []), ...extraWatch];
        return (
          <section key={g.key} id={g.key} className="scroll-mt-24 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-text-primary">{g.title}</h2>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{g.intro}</p>
            </div>
            <WatchBox keys={watch} />
            {g.tournaments.some((t) => t.cards) ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {g.tournaments.flatMap((t) => t.cards || []).map((c) => (
                  <FightCard key={c.seasonId} c={c} />
                ))}
              </div>
            ) : (
              <>
                {active.map((t) => (
                  <TournamentCard key={t.cfg.id} t={t} />
                ))}
                {past.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-bold uppercase text-text-secondary">Já disputados nesta temporada</h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {past.map((t) => (
                        <TournamentCard key={t.cfg.id} t={t} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        );
      })}
    </div>
  );
}

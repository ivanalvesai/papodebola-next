"use client";

import { useEffect, useState, useCallback } from "react";
import type { ComponentType, ReactNode } from "react";
import { TeamLogo } from "@/components/ui/team-logo";
import { ArrowDown, ArrowUp, Repeat, Activity, Users, BarChart3, Trophy } from "lucide-react";
import type {
  MatchDetail,
  MatchEvent,
  MatchIncident,
  MatchStatItem,
  TeamLineup,
  LineupPlayer,
} from "@/lib/data/match-detail";
import type { StandingsGroup, StandingRow } from "@/types/standings";

// ---- cronômetro ao vivo (minuto do jogo) ----
function useTicker(active: boolean) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

function liveMinute(event: MatchEvent): string | null {
  if (event.statusType !== "inprogress") return null;
  const desc = event.statusDesc || "";
  let base: number | null = null;
  if (desc.includes("2º")) base = 45;
  else if (desc.includes("1º")) base = 0;
  else if (desc.toLowerCase().includes("prorrog")) base = 90;
  if (base === null || !event.periodStart) return null;
  const elapsed = Math.floor(Date.now() / 1000 - event.periodStart);
  return `${base + Math.floor(elapsed / 60) + 1}'`;
}

function countdown(target: number): string | null {
  const diff = target - Math.floor(Date.now() / 1000);
  if (diff <= 0) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(diff / 3600))}:${p(Math.floor((diff % 3600) / 60))}:${p(diff % 60)}`;
}

// ---- cabeçalho (placar / status / cronômetro) ----
function Header({ event, mounted }: { event: MatchEvent; mounted: boolean }) {
  useTicker(mounted && event.statusType !== "finished");
  const minute = liveMinute(event);
  const cd = mounted && event.statusType === "notstarted" ? countdown(event.startTimestamp) : null;
  const showScore = event.statusType !== "notstarted";

  return (
    <div className="rounded-lg border border-border-custom bg-card-bg p-5">
      <div className="mb-4 flex justify-center">
        {event.live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            AO VIVO {minute ? <span className="tabular-nums">{minute}</span> : event.statusDesc}
          </span>
        ) : event.statusType === "finished" ? (
          <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
            Encerrado
          </span>
        ) : (
          <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
            Pré-jogo {cd && <span className="ml-1 tabular-nums text-text-primary">{cd}</span>}
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.homeId} size={64} />
          <span className="text-sm font-semibold text-text-primary sm:text-base">{event.home}</span>
        </div>
        <div className="px-3 text-center">
          {showScore ? (
            <div className="text-4xl font-extrabold tabular-nums text-text-primary">
              {event.homeScore ?? 0}
              <span className="px-2 text-text-muted">×</span>
              {event.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-2xl font-bold text-text-muted">×</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.awayId} size={64} />
          <span className="text-sm font-semibold text-text-primary sm:text-base">{event.away}</span>
        </div>
      </div>
    </div>
  );
}

// ---- card de seção ----
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-custom bg-card-bg">
      <h2 className="flex h-10 items-center gap-2 bg-green px-4 text-sm font-bold text-white">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ---- lance a lance ----
function IncidentIcon({ inc }: { inc: MatchIncident }) {
  if (inc.type === "goal") return <span className="text-base leading-none">⚽</span>;
  if (inc.type === "card")
    return (
      <span
        className={`inline-block h-4 w-3 rounded-[2px] ${
          inc.cls === "red" ? "bg-red" : "bg-yellow-400"
        }`}
      />
    );
  if (inc.type === "substitution") return <Repeat className="h-4 w-4 text-text-muted" />;
  return null;
}

function IncidentRow({ inc }: { inc: MatchIncident }) {
  if (inc.type === "period" || inc.type === "injuryTime") {
    const label =
      inc.text === "HT" ? "Intervalo" : inc.text === "FT" ? "Fim de jogo" : inc.text || "—";
    return (
      <div className="my-1 flex items-center gap-2 py-1">
        <div className="h-px flex-1 bg-border-light" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </span>
        <div className="h-px flex-1 bg-border-light" />
      </div>
    );
  }

  const min = inc.minute != null ? `${inc.minute}${inc.addedTime ? `+${inc.addedTime}` : ""}'` : "";
  const body = (
    <div className="min-w-0 flex-1">
      {inc.type === "goal" && (
        <p className="text-sm font-semibold text-text-primary">
          ⚽ {inc.player || "Gol"}{" "}
          {inc.homeScore != null && (
            <span className="font-bold text-green">
              {inc.homeScore}-{inc.awayScore}
            </span>
          )}
          {inc.assist && (
            <span className="block text-[11px] font-normal text-text-muted">
              assistência: {inc.assist}
            </span>
          )}
        </p>
      )}
      {inc.type === "card" && (
        <p className="text-sm text-text-primary">
          {inc.cls === "red" ? "Cartão vermelho" : "Cartão amarelo"} — {inc.player || ""}
        </p>
      )}
      {inc.type === "substitution" && (
        <p className="text-sm text-text-primary">
          {inc.playerIn && (
            <span className="inline-flex items-center gap-1 text-green">
              <ArrowUp className="h-3 w-3" />
              {inc.playerIn}
            </span>
          )}{" "}
          {inc.playerOut && (
            <span className="inline-flex items-center gap-1 text-text-muted">
              <ArrowDown className="h-3 w-3" />
              {inc.playerOut}
            </span>
          )}
        </p>
      )}
      {!["goal", "card", "substitution"].includes(inc.type) && inc.player && (
        <p className="text-sm text-text-primary">{inc.player}</p>
      )}
    </div>
  );

  const alignRight = inc.isHome === false;
  return (
    <div
      className={`flex items-center gap-3 border-b border-border-light py-2.5 last:border-0 ${
        alignRight ? "flex-row-reverse text-right" : ""
      }`}
    >
      <span className="w-9 shrink-0 text-center text-xs font-bold tabular-nums text-text-muted">
        {min}
      </span>
      <span className="shrink-0">
        <IncidentIcon inc={inc} />
      </span>
      {body}
    </div>
  );
}

function Timeline({ incidents, live }: { incidents: MatchIncident[]; live: boolean }) {
  const hasReal = incidents.some((i) => i.type !== "period");
  if (!hasReal)
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        {live
          ? "Sem lances ainda. Gols, cartões e substituições aparecem aqui em tempo real."
          : "O lance a lance começa quando a bola rolar. Gols, cartões e substituições em tempo real."}
      </p>
    );
  return (
    <div>
      {incidents.map((inc, i) => (
        <IncidentRow key={i} inc={inc} />
      ))}
    </div>
  );
}

// ---- estatísticas ----
function StatsBars({ stats }: { stats: MatchStatItem[] }) {
  if (stats.length === 0)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        As estatísticas aparecem quando o jogo começa.
      </p>
    );
  return (
    <div className="space-y-3">
      {stats.map((s, i) => {
        const total = s.homeNum + s.awayNum;
        const homePct = total > 0 ? (s.homeNum / total) * 100 : 50;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text-primary">
              <span className="tabular-nums">{s.home}</span>
              <span className="text-center text-text-muted">{s.name}</span>
              <span className="tabular-nums">{s.away}</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-border-light">
              <div className="bg-green" style={{ width: `${homePct}%` }} />
              <div className="bg-text-muted/40" style={{ width: `${100 - homePct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- campo + escalação ----
const LINE_ORDER: Record<string, number> = { G: 0, D: 1, M: 2, F: 3 };
function Dot({ p }: { p: LineupPlayer }) {
  return (
    <div className="flex w-12 flex-col items-center gap-1">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-bold text-green shadow">
        {p.number ?? ""}
      </div>
      <span className="max-w-[56px] truncate text-[9px] font-medium text-white">
        {p.name.split(" ").slice(-1)[0]}
      </span>
    </div>
  );
}
function PitchHalf({ team, flip }: { team: TeamLineup; flip: boolean }) {
  const lines: Record<string, LineupPlayer[]> = { G: [], D: [], M: [], F: [] };
  for (const p of team.starters) (lines[p.position] || (lines[p.position] = [])).push(p);
  let keys = Object.keys(lines)
    .filter((k) => lines[k]?.length)
    .sort((a, b) => (LINE_ORDER[a] ?? 9) - (LINE_ORDER[b] ?? 9));
  if (flip) keys = keys.reverse();
  return (
    <div className="flex flex-1 flex-col justify-around gap-2 py-2">
      {keys.map((k) => (
        <div key={k} className="flex justify-around">
          {lines[k].map((p) => (
            <Dot key={p.id} p={p} />
          ))}
        </div>
      ))}
    </div>
  );
}
function Lineups({ home, away }: { home: TeamLineup | null; away: TeamLineup | null }) {
  if (!home?.starters.length && !away?.starters.length)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Escalações ainda não confirmadas. Costumam sair ~1h antes do jogo.
      </p>
    );
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold text-text-muted">
        <span>{home?.formation || ""}</span>
        <span>{away?.formation || ""}</span>
      </div>
      <div className="flex flex-col rounded-lg bg-green/90 bg-[linear-gradient(0deg,rgba(0,0,0,0.06)_50%,transparent_50%)] bg-[length:100%_36px]">
        {home && <PitchHalf team={home} flip={false} />}
        <div className="h-px bg-white/40" />
        {away && <PitchHalf team={away} flip={true} />}
      </div>
    </div>
  );
}

// ---- classificação do grupo ----
function GroupTable({ group, homeId, awayId }: { group: StandingsGroup; homeId: number; awayId: number }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-text-muted">
          <th className="py-1.5 pl-1 text-left font-semibold">#</th>
          <th className="py-1.5 text-left font-semibold">Seleção</th>
          <th className="py-1.5 px-1 text-center font-semibold">P</th>
          <th className="py-1.5 px-1 text-center font-semibold">J</th>
          <th className="py-1.5 px-1 text-center font-semibold">SG</th>
        </tr>
      </thead>
      <tbody>
        {group.rows.slice(0, 4).map((r: StandingRow, i) => {
          const here = r.teamId === homeId || r.teamId === awayId;
          return (
            <tr
              key={r.teamId || i}
              className={`border-t border-border-light ${
                (r.pos || i + 1) <= 2 ? "border-l-2 border-l-green" : "border-l-2 border-l-transparent"
              } ${here ? "bg-green/5 font-semibold" : ""}`}
            >
              <td className="py-2 pl-1 text-text-muted">{r.pos || i + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <TeamLogo teamId={r.teamId} size={18} />
                  <span className="truncate text-text-primary">{r.team}</span>
                </div>
              </td>
              <td className="py-2 px-1 text-center font-bold text-text-primary">{r.pts}</td>
              <td className="py-2 px-1 text-center text-text-muted">{r.matches}</td>
              <td className="py-2 px-1 text-center text-text-muted">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---- componente principal ----
export function LiveMatch({
  matchId,
  initial,
  group,
}: {
  matchId: number;
  initial: MatchDetail;
  group: StandingsGroup | null;
}) {
  const [event, setEvent] = useState(initial.event);
  const [incidents, setIncidents] = useState(initial.incidents);
  const [stats, setStats] = useState(initial.stats);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/copa/jogo/${matchId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.event) setEvent(data.event);
      if (Array.isArray(data?.incidents)) setIncidents(data.incidents);
      if (Array.isArray(data?.stats)) setStats(data.stats);
    } catch {
      /* tenta de novo no próximo ciclo */
    }
  }, [matchId]);

  useEffect(() => {
    if (event.statusType === "finished") return;
    const intervalMs = event.statusType === "inprogress" ? 30000 : 60000;
    const t = setInterval(poll, intervalMs);
    return () => clearInterval(t);
  }, [event.statusType, poll]);

  return (
    <div className="space-y-4">
      <Header event={event} mounted={mounted} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* Esquerda: escalação + estatísticas */}
        <div className="order-2 space-y-4 lg:order-1">
          <Section title="Escalação" icon={Users}>
            <Lineups home={initial.home} away={initial.away} />
          </Section>
          <Section title="Estatísticas" icon={BarChart3}>
            <StatsBars stats={stats} />
          </Section>
        </div>

        {/* Meio: lance a lance */}
        <div className="order-1 lg:order-2">
          <Section title="Lance a lance" icon={Activity}>
            <Timeline incidents={incidents} live={event.live} />
          </Section>
        </div>

        {/* Direita: classificação do grupo */}
        <div className="order-3">
          {group && (
            <Section title={group.name} icon={Trophy}>
              <GroupTable group={group} homeId={event.homeId} awayId={event.awayId} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

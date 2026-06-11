"use client";

import { useEffect, useState, useCallback } from "react";
import { TeamLogo } from "@/components/ui/team-logo";
import { ArrowDown, ArrowUp, Repeat } from "lucide-react";
import type {
  MatchDetail,
  MatchEvent,
  MatchIncident,
  MatchStatItem,
  TeamLineup,
  LineupPlayer,
} from "@/lib/data/match-detail";

// ---- cronômetro ao vivo (minuto do jogo) ----
function useLiveMinute(event: MatchEvent): string | null {
  const [, tick] = useState(0);
  useEffect(() => {
    if (event.statusType !== "inprogress") return;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [event.statusType]);

  if (event.statusType !== "inprogress") return null;
  const desc = event.statusDesc || "";
  let base: number | null = null;
  if (desc.includes("2º")) base = 45;
  else if (desc.includes("1º")) base = 0;
  else if (desc.toLowerCase().includes("prorrog")) base = 90;
  if (base === null || !event.periodStart) return null;
  const elapsed = Math.floor(Date.now() / 1000 - event.periodStart / 1);
  const min = base + Math.floor(elapsed / 60) + 1;
  return `${min}'`;
}

function StatusBadge({ event, minute }: { event: MatchEvent; minute: string | null }) {
  if (event.live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-1 text-xs font-bold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        AO VIVO {minute && <span className="tabular-nums">{minute}</span>}
        {!minute && event.statusDesc && <span>· {event.statusDesc}</span>}
      </span>
    );
  }
  return (
    <span className="rounded-full bg-body px-2.5 py-1 text-xs font-semibold text-text-muted">
      {event.statusType === "finished" ? "Encerrado" : event.statusDesc || "Não iniciado"}
    </span>
  );
}

function Header({ event, minute }: { event: MatchEvent; minute: string | null }) {
  const showScore = event.statusType !== "notstarted";
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg p-5">
      <div className="mb-3 flex justify-center">
        <StatusBadge event={event} minute={minute} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.homeId} size={56} />
          <span className="text-sm font-semibold text-text-primary">{event.home}</span>
        </div>
        <div className="px-3 text-center">
          {showScore ? (
            <div className="text-3xl font-extrabold tabular-nums text-text-primary">
              {event.homeScore ?? 0}
              <span className="px-2 text-text-muted">×</span>
              {event.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-lg font-bold text-text-muted">×</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.awayId} size={56} />
          <span className="text-sm font-semibold text-text-primary">{event.away}</span>
        </div>
      </div>
    </div>
  );
}

// ---- lance a lance ----
function IncidentIcon({ inc }: { inc: MatchIncident }) {
  if (inc.type === "goal")
    return <span className="text-base leading-none">⚽</span>;
  if (inc.type === "card")
    return (
      <span
        className={`inline-block h-4 w-3 rounded-[2px] ${
          inc.cls === "red" ? "bg-red" : "bg-yellow-400"
        }`}
      />
    );
  if (inc.type === "substitution")
    return <Repeat className="h-4 w-4 text-text-muted" />;
  return null;
}

function IncidentRow({ inc }: { inc: MatchIncident }) {
  // divisor de período (Intervalo / Fim de jogo)
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
    <div className="min-w-0">
      {inc.type === "goal" && (
        <p className="truncate text-sm font-semibold text-text-primary">
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
        <p className="truncate text-sm text-text-primary">
          {inc.cls === "red" ? "Cartão vermelho" : "Cartão amarelo"} — {inc.player || ""}
        </p>
      )}
      {inc.type === "substitution" && (
        <p className="truncate text-sm text-text-primary">
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
        <p className="truncate text-sm text-text-primary">{inc.player}</p>
      )}
    </div>
  );

  const alignRight = inc.isHome === false;
  return (
    <div
      className={`flex items-center gap-3 border-b border-border-light py-2 last:border-0 ${
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

function Timeline({ incidents }: { incidents: MatchIncident[] }) {
  const shown = incidents.filter((i) => i.type !== "period" || i.text); // mantém HT/FT com label
  if (shown.length === 0)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Sem lances registrados ainda. Os gols, cartões e substituições aparecem aqui em tempo real.
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
    return <p className="py-6 text-center text-sm text-text-muted">Estatísticas indisponíveis.</p>;
  return (
    <div className="space-y-3">
      {stats.map((s, i) => {
        const total = s.homeNum + s.awayNum;
        const homePct = total > 0 ? (s.homeNum / total) * 100 : 50;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text-primary">
              <span className="tabular-nums">{s.home}</span>
              <span className="text-text-muted">{s.name}</span>
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
    <div className="flex w-14 flex-col items-center gap-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-green shadow">
        {p.number ?? ""}
      </div>
      <span className="max-w-[64px] truncate text-[10px] font-medium text-white">
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
    <div className="flex flex-1 flex-col justify-around gap-3 py-3">
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
function Pitch({ home, away }: { home: TeamLineup | null; away: TeamLineup | null }) {
  if (!home?.starters.length && !away?.starters.length)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Escalações ainda não confirmadas. Costumam sair cerca de 1h antes do jogo.
      </p>
    );
  return (
    <div>
      <div className="mb-2 flex justify-between text-xs font-semibold text-text-muted">
        <span>{home?.formation || ""}</span>
        <span>{away?.formation || ""}</span>
      </div>
      <div className="relative flex flex-col rounded-lg bg-green/90 bg-[linear-gradient(0deg,rgba(0,0,0,0.06)_50%,transparent_50%)] bg-[length:100%_40px]">
        {home && <PitchHalf team={home} flip={false} />}
        <div className="h-px bg-white/40" />
        {away && <PitchHalf team={away} flip={true} />}
      </div>
    </div>
  );
}

// ---- tabs ----
type Tab = "lances" | "escalacao" | "estatisticas";

export function LiveMatch({ matchId, initial }: { matchId: number; initial: MatchDetail }) {
  const [event, setEvent] = useState(initial.event);
  const [incidents, setIncidents] = useState(initial.incidents);
  const [stats, setStats] = useState(initial.stats);
  const [tab, setTab] = useState<Tab>(initial.event.live ? "lances" : "escalacao");
  const minute = useLiveMinute(event);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/copa/jogo/${matchId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.event) setEvent(data.event);
      if (Array.isArray(data?.incidents)) setIncidents(data.incidents);
      if (Array.isArray(data?.stats)) setStats(data.stats);
    } catch {
      /* silencioso: tenta de novo no próximo ciclo */
    }
  }, [matchId]);

  useEffect(() => {
    if (event.statusType === "finished") return;
    const intervalMs = event.statusType === "inprogress" ? 30000 : 60000;
    const t = setInterval(poll, intervalMs);
    return () => clearInterval(t);
  }, [event.statusType, poll]);

  const tabs: [Tab, string][] = [
    ["lances", "Lance a lance"],
    ["escalacao", "Escalação"],
    ["estatisticas", "Estatísticas"],
  ];

  return (
    <div className="space-y-4">
      <Header event={event} minute={minute} />

      <div className="flex gap-1 rounded-lg border border-border-custom bg-card-bg p-1">
        {tabs.map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition-colors sm:text-sm ${
              tab === t ? "bg-green text-white" : "text-text-muted hover:bg-body"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-border-custom bg-card-bg p-4">
        {tab === "lances" && <Timeline incidents={incidents} />}
        {tab === "escalacao" && <Pitch home={initial.home} away={initial.away} />}
        {tab === "estatisticas" && <StatsBars stats={stats} />}
      </div>
    </div>
  );
}

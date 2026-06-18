"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Trophy, BarChart3, Users } from "lucide-react";
import type { TennisMatchDetail, TennisPlayer, TennisMatch } from "@/lib/data/tennis";

// ---- foto do atleta (foto -> bandeira -> iniciais) ----
function PlayerPhoto({ player, size = 64 }: { player: TennisPlayer; size?: number }) {
  const [stage, setStage] = useState(player.id ? 0 : player.country ? 1 : 2);
  const dim = { width: size, height: size };
  if (stage === 0 && player.id) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/img/team/${player.id}/image`}
        alt={player.name}
        style={dim}
        onError={() => setStage(player.country ? 1 : 2)}
        className="shrink-0 rounded-full bg-body object-cover"
      />
    );
  }
  if (stage === 1 && player.country) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://flagcdn.com/w80/${player.country}.png`}
        alt={player.country.toUpperCase()}
        style={dim}
        onError={() => setStage(2)}
        className="shrink-0 rounded-full bg-body object-cover ring-1 ring-border-light"
      />
    );
  }
  const initials = player.shortName
    .replace(/[^A-Za-zÀ-ÿ\s.]/g, "")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={dim}
      className="flex shrink-0 items-center justify-center rounded-full bg-body text-base font-bold text-text-muted"
    >
      {initials || "?"}
    </div>
  );
}

function flag(country: string | null) {
  if (!country) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w20/${country}.png`}
      alt={country.toUpperCase()}
      width={16}
      height={11}
      className="inline-block rounded-[2px] align-middle ring-1 ring-border-light"
    />
  );
}

function StatusBadge({ match }: { match: TennisMatch }) {
  if (match.live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1 text-xs font-bold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        AO VIVO · {match.statusDesc}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
        Encerrado
      </span>
    );
  }
  const when = match.timestamp
    ? new Date(match.timestamp * 1000).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : "A definir";
  return (
    <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
      {when}
    </span>
  );
}

// ---- placar (header) ----
function PlayerSide({ player, isWinner, decided }: { player: TennisPlayer; isWinner: boolean; decided: boolean }) {
  const dim = decided && !isWinner;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <PlayerPhoto player={player} />
      <div>
        <div className="flex items-center justify-center gap-1.5">
          {flag(player.country)}
          <span className={`text-sm font-semibold sm:text-base ${dim ? "text-text-muted" : "text-text-primary"}`}>
            {player.name}
          </span>
          {isWinner && decided && <Trophy className="h-4 w-4 text-green" aria-label="Vencedor" />}
        </div>
        {player.ranking != null && (
          <span className="text-[11px] text-text-muted">
            Ranking nº {player.ranking} ATP{player.seed ? ` · cabeça ${player.seed}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}

function Scoreboard({ match }: { match: TennisMatch }) {
  const showScore = match.status !== "notstarted";
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg p-5">
      <div className="mb-4 flex justify-center">
        <StatusBadge match={match} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <PlayerSide player={match.home} isWinner={match.winner === 1} decided={match.status === "finished"} />
        <div className="px-3 text-center">
          {showScore ? (
            <div className="text-4xl font-extrabold tabular-nums text-text-primary">
              {match.setsHome ?? 0}
              <span className="px-2 text-text-muted">×</span>
              {match.setsAway ?? 0}
            </div>
          ) : (
            <div className="text-2xl font-bold text-text-muted">×</div>
          )}
          <div className="mt-1 text-[10px] uppercase tracking-wide text-text-muted">sets</div>
        </div>
        <PlayerSide player={match.away} isWinner={match.winner === 2} decided={match.status === "finished"} />
      </div>

      {/* games por set */}
      {match.sets.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="mx-auto text-center text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-text-muted">
                <th className="px-2 py-1 text-left font-semibold">Set</th>
                {match.sets.map((_, i) => (
                  <th key={i} className="w-8 px-1 py-1 font-semibold">
                    {i + 1}º
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([1, 2] as const).map((side) => {
                const isWinner = match.winner === side;
                return (
                  <tr key={side} className="border-t border-border-light">
                    <td className="max-w-[140px] truncate py-1.5 pr-3 text-left text-xs font-medium text-text-primary">
                      {side === 1 ? match.home.shortName : match.away.shortName}
                    </td>
                    {match.sets.map((s, i) => {
                      const g = side === 1 ? s.home : s.away;
                      const tie = side === 1 ? s.tieHome : s.tieAway;
                      const current = match.live && i === match.sets.length - 1;
                      return (
                        <td
                          key={i}
                          className={`px-1 py-1.5 tabular-nums ${
                            current ? "font-bold text-green" : isWinner ? "font-bold text-text-primary" : "text-text-muted"
                          }`}
                        >
                          {g ?? "-"}
                          {tie != null && <sup className="text-[8px] font-normal text-text-muted">{tie}</sup>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---- enquete (probabilidade da torcida) ----
function VoteBar({ match, vote }: { match: TennisMatch; vote: { home: number; away: number } }) {
  const total = vote.home + vote.away;
  if (total === 0) return null;
  const homePct = Math.round((vote.home / total) * 100);
  const awayPct = 100 - homePct;
  return (
    <section className="rounded-lg border border-border-custom bg-card-bg p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-text-primary">
        <Users className="h-4 w-4 text-green" />
        Quem a torcida acha que vence
      </h2>
      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text-primary">
        <span>{match.home.shortName} · {homePct}%</span>
        <span>{awayPct}% · {match.away.shortName}</span>
      </div>
      <div className="flex h-2.5 overflow-hidden rounded-full bg-border-light">
        <div className="bg-green" style={{ width: `${homePct}%` }} />
        <div className="bg-text-muted/40" style={{ width: `${awayPct}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-text-muted">{total.toLocaleString("pt-BR")} votos</p>
    </section>
  );
}

// ---- estatísticas com abas por set ----
function StatBars({ detail, periodKey }: { detail: TennisMatchDetail; periodKey: string }) {
  const period = detail.periods.find((p) => p.key === periodKey) || detail.periods[0];
  if (!period) return null;
  return (
    <div className="space-y-5">
      {period.groups.map((g) => (
        <div key={g.name}>
          <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-text-muted">{g.name}</h3>
          <div className="space-y-3">
            {g.items.map((s, i) => {
              const total = s.homeNum + s.awayNum;
              const homePct = total > 0 ? (s.homeNum / total) * 100 : 50;
              return (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className={`tabular-nums ${s.highlight === 1 ? "font-bold text-green" : "font-semibold text-text-primary"}`}>
                      {s.home}
                    </span>
                    <span className="px-2 text-center text-text-muted">{s.name}</span>
                    <span className={`tabular-nums ${s.highlight === 2 ? "font-bold text-green" : "font-semibold text-text-primary"}`}>
                      {s.away}
                    </span>
                  </div>
                  <div className="flex h-1.5 overflow-hidden rounded-full bg-border-light">
                    <div className="bg-green" style={{ width: `${homePct}%` }} />
                    <div className="bg-text-muted/40" style={{ width: `${100 - homePct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stats({ detail }: { detail: TennisMatchDetail }) {
  const [tab, setTab] = useState("ALL");
  const available = detail.periods.map((p) => p.key);
  const activeKey = available.includes(tab) ? tab : available[0];

  if (detail.periods.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        As estatísticas aparecem quando o jogo começa.
      </p>
    );
  }

  return (
    <div>
      {detail.periods.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {detail.periods.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setTab(p.key)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                p.key === activeKey
                  ? "bg-green text-white"
                  : "bg-body text-text-muted hover:bg-border-light"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      <StatBars detail={detail} periodKey={activeKey} />
    </div>
  );
}

export function TennisMatchView({
  initial,
  tournamentSlug,
}: {
  initial: TennisMatchDetail;
  tournamentSlug: string;
}) {
  const [detail, setDetail] = useState(initial);
  const seeds = useRef({ home: initial.match.home.seed, away: initial.match.away.seed });

  const eventId = detail.match.eventId;
  const poll = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/tenis/${tournamentSlug}/jogo/${eventId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as TennisMatchDetail;
      if (!data?.match) return;
      // o polling não traz seed (vem só do chaveamento) — preserva o inicial.
      data.match.home.seed = seeds.current.home;
      data.match.away.seed = seeds.current.away;
      setDetail(data);
    } catch {
      /* tenta de novo no próximo ciclo */
    }
  }, [eventId, tournamentSlug]);

  const live = detail.match.live;
  const notStarted = detail.match.status === "notstarted";
  useEffect(() => {
    if (!live && !notStarted) return; // encerrado: nada a atualizar
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      timer = setTimeout(tick, live ? 20000 : 60000);
    };
    timer = setTimeout(tick, live ? 20000 : 60000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [live, notStarted, poll]);

  return (
    <div className="space-y-4">
      <Scoreboard match={detail.match} />
      {detail.vote && <VoteBar match={detail.match} vote={detail.vote} />}
      <section className="rounded-lg border border-border-custom bg-card-bg p-4">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
          <BarChart3 className="h-4 w-4 text-green" />
          Estatísticas
        </h2>
        <Stats detail={detail} />
      </section>
    </div>
  );
}

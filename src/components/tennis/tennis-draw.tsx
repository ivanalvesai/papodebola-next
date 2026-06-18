"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import type { TennisDraw, TennisMatch, TennisPlayer, TennisRound } from "@/lib/data/tennis";

// ---- foto do atleta (com fallback pra bandeira do país e, por fim, iniciais) ----
function PlayerPhoto({ player, size = 36 }: { player: TennisPlayer; size?: number }) {
  // 0 = foto do jogador, 1 = bandeira do país, 2 = iniciais
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
        src={`https://flagcdn.com/w40/${player.country}.png`}
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
      className="flex shrink-0 items-center justify-center rounded-full bg-body text-[10px] font-bold text-text-muted"
    >
      {initials || "?"}
    </div>
  );
}

// ---- linha de um jogador dentro do card ----
function PlayerRow({
  player,
  sets,
  side,
  match,
  isWinner,
  decided,
}: {
  player: TennisPlayer;
  sets: { games: number | null; tie: number | null; current: boolean }[];
  side: 1 | 2;
  match: TennisMatch;
  isWinner: boolean;
  decided: boolean;
}) {
  const point = side === 1 ? match.pointHome : match.pointAway;
  const dim = decided && !isWinner;
  const serving = match.live && match.serving === side;

  return (
    <div className="flex items-center gap-2 py-1.5">
      <PlayerPhoto player={player} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {serving && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-green"
              title="Saque"
              aria-label="Saca"
            />
          )}
          <span
            className={`truncate text-sm ${
              isWinner ? "font-bold text-text-primary" : dim ? "text-text-muted" : "font-medium text-text-primary"
            }`}
          >
            {player.name}
          </span>
          {player.seed && (
            <span className="shrink-0 text-[10px] font-semibold text-text-muted">[{player.seed}]</span>
          )}
        </div>
        {player.ranking != null && (
          <span className="text-[10px] text-text-muted">Ranking nº {player.ranking} ATP</span>
        )}
      </div>

      {/* games por set */}
      <div className="flex items-center gap-1.5">
        {sets.map((s, i) => (
          <span
            key={i}
            className={`relative w-5 text-center text-sm tabular-nums ${
              s.current ? "font-bold text-green" : isWinner ? "font-semibold text-text-primary" : "text-text-muted"
            }`}
          >
            {s.games ?? "-"}
            {s.tie != null && (
              <sup className="text-[8px] font-normal text-text-muted">{s.tie}</sup>
            )}
          </span>
        ))}
        {/* ponto do game atual (ao vivo) */}
        {match.live && point != null && (
          <span className="ml-0.5 w-6 rounded bg-green/10 text-center text-xs font-bold text-green">
            {point}
          </span>
        )}
      </div>
      {isWinner && decided && <Trophy className="h-3.5 w-3.5 shrink-0 text-green" aria-label="Vencedor" />}
    </div>
  );
}

function StatusBadge({ match }: { match: TennisMatch }) {
  if (match.live) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-0.5 text-[11px] font-bold text-white">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
        AO VIVO · {match.statusDesc}
      </span>
    );
  }
  if (match.status === "finished") {
    return (
      <span className="rounded-full bg-body px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
        Encerrado
      </span>
    );
  }
  if (match.status === "pending") {
    return (
      <span className="rounded-full bg-body px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
        Aguardando classificados
      </span>
    );
  }
  // notstarted
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
    <span className="rounded-full bg-body px-2.5 py-0.5 text-[11px] font-semibold text-text-muted">
      {when}
    </span>
  );
}

function MatchCard({ match }: { match: TennisMatch }) {
  const decided = match.status === "finished";
  // alinha colunas: usa o maior nº de sets entre os dois jogadores (ou 1 placeholder)
  const nSets = Math.max(match.sets.length, decided ? 1 : 0);
  const curIdx = match.live ? match.sets.length - 1 : -1;
  const colsFor = (side: 1 | 2) =>
    Array.from({ length: nSets }, (_, i) => {
      const s = match.sets[i];
      return {
        games: s ? (side === 1 ? s.home : s.away) : null,
        tie: s ? (side === 1 ? s.tieHome : s.tieAway) : null,
        current: i === curIdx,
      };
    });

  return (
    <div
      className={`rounded-lg border bg-card-bg p-3 ${
        match.live ? "border-red/40 ring-1 ring-red/20" : "border-border-custom"
      }`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <StatusBadge match={match} />
      </div>
      <PlayerRow
        player={match.home}
        sets={colsFor(1)}
        side={1}
        match={match}
        isWinner={match.winner === 1}
        decided={decided}
      />
      <div className="border-t border-border-light" />
      <PlayerRow
        player={match.away}
        sets={colsFor(2)}
        side={2}
        match={match}
        isWinner={match.winner === 2}
        decided={decided}
      />
    </div>
  );
}

// ---- paginador de fases (estilo Copa do Mundo) ----
function PhaseNav({
  round,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  liveCount,
}: {
  round: TennisRound;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  liveCount: number;
}) {
  const arrowBase =
    "flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors";
  return (
    <nav aria-label="Fases do torneio" className="mb-4">
      <div className="flex h-12 items-center justify-between gap-1 rounded-lg bg-green px-3 text-white">
        {hasPrev ? (
          <button type="button" onClick={onPrev} aria-label="Fase anterior" className={`${arrowBase} hover:bg-white/30`}>
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : (
          <span aria-hidden className={`${arrowBase} cursor-default opacity-30`}>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        <h2 className="flex items-center gap-2 whitespace-nowrap text-sm font-bold uppercase tracking-wide">
          {round.label}
          {liveCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red px-2 py-0.5 text-[10px] font-bold">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              {liveCount} ao vivo
            </span>
          )}
        </h2>

        {hasNext ? (
          <button type="button" onClick={onNext} aria-label="Próxima fase" className={`${arrowBase} hover:bg-white/30`}>
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <span aria-hidden className={`${arrowBase} cursor-default opacity-30`}>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

// Fase "atual": a 1ª rodada (em ordem cronológica) que ainda não terminou; se houver
// jogo ao vivo, prioriza essa rodada; se tudo encerrou, abre na última (Final).
function currentRoundIndex(rounds: TennisRound[]): number {
  const liveIdx = rounds.findIndex((r) => r.matches.some((m) => m.live));
  if (liveIdx !== -1) return liveIdx;
  const openIdx = rounds.findIndex((r) =>
    r.matches.some((m) => m.status !== "finished")
  );
  if (openIdx !== -1) return openIdx;
  return rounds.length - 1;
}

export function TennisDrawView({ initial, slug }: { initial: TennisDraw; slug: string }) {
  const [draw, setDraw] = useState(initial);

  // Rodadas em ordem cronológica (1ª rodada -> Final) pras setas avançarem no tempo.
  const rounds = useMemo(
    () => [...draw.rounds].sort((a, b) => a.order - b.order),
    [draw.rounds]
  );

  const [idx, setIdx] = useState(() => currentRoundIndex(rounds));
  // Se o usuário não navegou ainda, segue a fase atual conforme o torneio avança.
  const touched = useRef(false);
  useEffect(() => {
    if (!touched.current) setIdx(currentRoundIndex(rounds));
  }, [rounds]);

  const clamp = (n: number) => Math.max(0, Math.min(rounds.length - 1, n));
  const goPrev = () => {
    touched.current = true;
    setIdx((i) => clamp(i - 1));
  };
  const goNext = () => {
    touched.current = true;
    setIdx((i) => clamp(i + 1));
  };

  const safeIdx = clamp(idx);
  const round = rounds[safeIdx];

  const hasLive = draw.rounds.some((r) => r.matches.some((m) => m.live));
  const hasUpcoming = draw.rounds.some((r) =>
    r.matches.some((m) => m.status === "notstarted")
  );

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenis/${slug}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as TennisDraw;
      if (data?.rounds) setDraw(data);
    } catch {
      /* tenta de novo no próximo ciclo */
    }
  }, [slug]);

  const liveRef = useRef(hasLive);
  liveRef.current = hasLive;

  useEffect(() => {
    // Só faz polling enquanto houver jogo ao vivo (20s) ou por vir (60s).
    if (!hasLive && !hasUpcoming) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (cancelled) return;
      timer = setTimeout(tick, liveRef.current ? 20000 : 60000);
    };
    timer = setTimeout(tick, liveRef.current ? 20000 : 60000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasLive, hasUpcoming, poll]);

  if (!round) return null;
  const liveCount = round.matches.filter((m) => m.live).length;

  return (
    <div>
      <PhaseNav
        round={round}
        hasPrev={safeIdx > 0}
        hasNext={safeIdx < rounds.length - 1}
        onPrev={goPrev}
        onNext={goNext}
        liveCount={liveCount}
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {round.matches.map((m, i) => (
          <MatchCard key={m.eventId || `${round.key}-${i}`} match={m} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Trophy, ChevronRight, ChevronLeft } from "lucide-react";
import type { TennisDraw, TennisMatch, TennisPlayer } from "@/lib/data/tennis";

// foto do atleta (jogador = "team" no Sofascore) -> bandeira -> iniciais
function Avatar({ player, size = 22 }: { player: TennisPlayer; size?: number }) {
  const [stage, setStage] = useState(player.id ? 0 : player.country ? 1 : 2);
  const dim = { width: size, height: size };
  if (stage === 0 && player.id)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/img/team/${player.id}/image`} alt="" style={dim} onError={() => setStage(player.country ? 1 : 2)} className="shrink-0 rounded-full bg-body object-cover" />;
  if (stage === 1 && player.country)
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`https://flagcdn.com/w20/${player.country}.png`} alt="" style={dim} onError={() => setStage(2)} className="shrink-0 rounded-full bg-body object-cover ring-1 ring-border-light" />;
  const initials = player.shortName.replace(/[^A-Za-zÀ-ÿ\s.]/g, "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  return <div style={dim} className="flex shrink-0 items-center justify-center rounded-full bg-body text-[8px] font-bold text-text-muted">{initials || "?"}</div>;
}

function lastName(name: string): string {
  if (name.length <= 14) return name;
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

// linha de um jogador no card: foto + nome + games por set (+ ponto ao vivo)
function Row({ player, match, side }: { player: TennisPlayer; match: TennisMatch; side: 1 | 2 }) {
  const isWinner = match.winner === side;
  const dim = match.status === "finished" && !isWinner;
  const point = side === 1 ? match.pointHome : match.pointAway;
  const curIdx = match.live ? match.sets.length - 1 : -1;
  return (
    <div className="flex items-center gap-1.5">
      <Avatar player={player} />
      <span className={`flex-1 truncate text-xs ${isWinner ? "font-bold text-text-primary" : dim ? "text-text-muted" : "font-medium text-text-primary"}`}>
        {lastName(player.name)}
      </span>
      <div className="flex items-center gap-1">
        {match.sets.map((s, i) => {
          const g = side === 1 ? s.home : s.away;
          return (
            <span key={i} className={`w-3 text-center text-xs tabular-nums ${i === curIdx ? "font-bold text-green" : isWinner ? "font-semibold text-text-primary" : "text-text-muted"}`}>
              {g ?? "-"}
            </span>
          );
        })}
        {match.live && point != null && (
          <span className="w-5 rounded bg-green/10 text-center text-[10px] font-bold text-green">{point}</span>
        )}
      </div>
    </div>
  );
}

function statusLabel(m: TennisMatch): string {
  if (m.status === "finished") return "Encerrado";
  if (m.status === "notstarted")
    return m.timestamp
      ? new Date(m.timestamp * 1000).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })
      : "A definir";
  return m.statusDesc;
}

function Card({ match, href }: { match: TennisMatch; href: string }) {
  return (
    <Link href={href} className={`block w-[210px] shrink-0 rounded-lg border bg-card-bg p-3 transition-colors hover:border-green ${match.live ? "border-red" : "border-border-custom"}`}>
      <div className="space-y-1.5">
        <Row player={match.home} match={match} side={1} />
        <Row player={match.away} match={match} side={2} />
      </div>
      <div className="mt-2 text-center">
        {match.live ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-red">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />
            ao vivo · {match.statusDesc}
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-text-muted">{statusLabel(match)}</span>
        )}
      </div>
    </Link>
  );
}

// ordena: ao vivo > a seguir (por horário) > encerrado (mais recente primeiro)
function relevance(m: TennisMatch): number {
  if (m.live) return 0;
  if (m.status === "notstarted") return 1;
  if (m.status === "finished") return 2;
  return 3;
}

export function TennisTournamentStrip({
  initial,
  slug,
  category,
  city,
  surface,
}: {
  initial: TennisDraw;
  slug: string;
  category: string;
  city: string;
  surface: string;
}) {
  const [draw, setDraw] = useState(initial);
  const scrollRef = useRef<HTMLDivElement>(null);

  const matches = draw.rounds
    .flatMap((r) => r.matches)
    .filter((m) => m.eventId && !m.home.placeholder && !m.away.placeholder)
    .sort((a, b) => {
      const ra = relevance(a), rb = relevance(b);
      if (ra !== rb) return ra - rb;
      if (a.status === "finished") return b.timestamp - a.timestamp; // recente primeiro
      return a.timestamp - b.timestamp; // a seguir: mais próximo primeiro
    })
    .slice(0, 14);

  const liveCount = matches.filter((m) => m.live).length;
  const hasLive = liveCount > 0;
  const hasUpcoming = matches.some((m) => m.status === "notstarted");
  const tournamentHref = `/tenis/${slug}`;

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/tenis/${slug}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as TennisDraw;
      if (data?.rounds) setDraw(data);
    } catch {
      /* tenta de novo */
    }
  }, [slug]);

  const liveRef = useRef(hasLive);
  liveRef.current = hasLive;
  useEffect(() => {
    if (!hasLive && !hasUpcoming) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (!cancelled) timer = setTimeout(tick, liveRef.current ? 20000 : 60000);
    };
    timer = setTimeout(tick, liveRef.current ? 20000 : 60000);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [hasLive, hasUpcoming, poll]);

  function scroll(dir: number) {
    scrollRef.current?.scrollBy({ left: dir, behavior: "smooth" });
  }

  if (matches.length === 0) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-border-custom bg-card-bg">
      {/* Cabeçalho clicável -> torneio */}
      <Link href={tournamentHref} className="group flex items-center gap-3 bg-green px-4 py-3 text-white transition-colors hover:bg-green/90">
        <Trophy className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold">{draw.name} 2026</span>
            {hasLive && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                {liveCount} ao vivo
              </span>
            )}
          </div>
          <span className="text-[11px] text-white/80">{category} · {surface} · {city}</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold">
          Ver chaveamento
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>

      {/* Faixa horizontal de jogos */}
      <div className="relative">
        <button
          onClick={() => scroll(-320)}
          aria-label="Anterior"
          className="absolute left-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-custom bg-card-bg text-text-secondary shadow-md transition-colors hover:text-green"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-11 py-3">
          {matches.map((m, i) => (
            <Card key={m.eventId || i} match={m} href={tournamentHref} />
          ))}
        </div>
        <button
          onClick={() => scroll(320)}
          aria-label="Próximo"
          className="absolute right-1.5 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border-custom bg-card-bg text-text-secondary shadow-md transition-colors hover:text-green"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

"use client";

import { useState, useRef, useMemo } from "react";
import { CalendarDays, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MatchBarCard } from "./match-bar-card";
import type { NormalizedMatch } from "@/types/match";

interface MatchBarProps {
  todayMatches: NormalizedMatch[];
  // Aba "Próximos": jogos ATUAIS das ligas BR (ao vivo + recém-encerrados + próximos),
  // já ordenados (ao vivo primeiro) e com link pro lance a lance. Mesmo formato de "Hoje".
  upcomingMatches: NormalizedMatch[];
}

// Ordem na barra: ao vivo/intervalo primeiro, depois os que ainda vao comecar,
// e os encerrados (e adiados/cancelados) por ultimo — assim o jogo de agora fica
// logo a vista, sem precisar rolar por cima dos que ja acabaram.
const STATUS_PRIORITY: Record<NormalizedMatch["status"], number> = {
  live: 0,
  halftime: 0,
  scheduled: 1,
  finished: 2,
  postponed: 3,
  cancelled: 3,
};

export function MatchBar({ todayMatches, upcomingMatches }: MatchBarProps) {
  const [tab, setTab] = useState<"today" | "upcoming">("today");
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction, behavior: "smooth" });
    }
  }

  // Ordena por relevancia (status) e, dentro do grupo, por horario REAL (timestamp).
  // Usar timestamp e nao a string "HH:MM" porque a barra pode ter jogos de dias
  // diferentes (madrugada do dia seguinte) — senao 01:00 de amanha viria antes de
  // 19:00 de hoje. Fallback pro horario textual se faltar timestamp.
  const todaySorted = useMemo(
    () =>
      [...todayMatches].sort((a, b) => {
        const pa = STATUS_PRIORITY[a.status] ?? 2;
        const pb = STATUS_PRIORITY[b.status] ?? 2;
        if (pa !== pb) return pa - pb;
        const ta = a.timestamp || 0;
        const tb = b.timestamp || 0;
        if (ta && tb && ta !== tb) return ta - tb;
        return a.time.localeCompare(b.time);
      }),
    [todayMatches]
  );

  const matches = tab === "today" ? todaySorted : [];

  return (
    <div className="bg-surface border-b border-border-custom">
      {/* Tabs */}
      <div className="mx-auto max-w-[1240px] px-4 flex items-center gap-0">
        <button
          onClick={() => setTab("today")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === "today"
              ? "text-green border-green"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          Hoje
          <span className="ml-1 bg-body text-text-muted text-xs px-1.5 py-0.5 rounded-full">
            {todayMatches.length}
          </span>
        </button>
        <button
          onClick={() => setTab("upcoming")}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            tab === "upcoming"
              ? "text-green border-green"
              : "text-text-muted border-transparent hover:text-text-secondary"
          }`}
        >
          <CalendarClock className="h-4 w-4" />
          Próximos
          <span className="ml-1 bg-body text-text-muted text-xs px-1.5 py-0.5 rounded-full">
            {upcomingMatches.length}
          </span>
        </button>
        <div className="flex-1" />
        <Link
          href="/jogos-de-hoje/futebol"
          className="text-xs text-green font-semibold hover:text-green-hover transition-colors"
        >
          Ver todos &rsaquo;
        </Link>
      </div>

      {/* Scrollable match cards */}
      <div className="relative mx-auto max-w-[1240px] px-4">
        <button
          onClick={() => scroll(-300)}
          className="absolute left-4 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-surface to-transparent flex items-center justify-center text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-3"
        >
          {tab === "today" &&
            matches.map((m) => (
              <MatchBarCard
                key={m.id}
                id={m.id}
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeLogo={m.homeLogo}
                awayLogo={m.awayLogo}
                homeScore={m.homeScore}
                awayScore={m.awayScore}
                time={m.time}
                timestamp={m.timestamp}
                status={m.status}
                statusText={m.statusText}
                league={m.league}
                href={m.href}
              />
            ))}

          {tab === "upcoming" &&
            upcomingMatches.map((m) => (
              <MatchBarCard
                key={m.id}
                id={m.id}
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeLogo={m.homeLogo}
                awayLogo={m.awayLogo}
                homeScore={m.homeScore}
                awayScore={m.awayScore}
                time={m.time}
                timestamp={m.timestamp}
                status={m.status}
                statusText={m.statusText}
                league={m.league}
                href={m.href}
              />
            ))}

          {((tab === "today" && matches.length === 0) ||
            (tab === "upcoming" && upcomingMatches.length === 0)) && (
            <div className="flex items-center justify-center w-full py-4 text-text-muted text-sm">
              Nenhum jogo encontrado
            </div>
          )}
        </div>

        <button
          onClick={() => scroll(300)}
          className="absolute right-4 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-surface to-transparent flex items-center justify-center text-text-muted hover:text-text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

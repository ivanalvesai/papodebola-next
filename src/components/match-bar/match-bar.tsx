"use client";

import { useState, useRef } from "react";
import { CalendarDays, CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MatchBarCard } from "./match-bar-card";
import type { NormalizedMatch, CBFMatch } from "@/types/match";

interface MatchBarProps {
  todayMatches: NormalizedMatch[];
  cbfUpcoming: CBFMatch[];
}

export function MatchBar({ todayMatches, cbfUpcoming }: MatchBarProps) {
  const [tab, setTab] = useState<"today" | "upcoming">("today");
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction, behavior: "smooth" });
    }
  }

  const matches = tab === "today" ? todayMatches : [];

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
          Proximos
          <span className="ml-1 bg-body text-text-muted text-xs px-1.5 py-0.5 rounded-full">
            {cbfUpcoming.length}
          </span>
        </button>
        <div className="flex-1" />
        <Link
          href="/agenda"
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
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeLogo={m.homeLogo}
                awayLogo={m.awayLogo}
                homeScore={m.homeScore}
                awayScore={m.awayScore}
                time={m.time}
                status={m.status}
                statusText={m.statusText}
                league={m.league}
              />
            ))}

          {tab === "upcoming" &&
            cbfUpcoming.map((m) => (
              <MatchBarCard
                key={`cbf-${m.id}`}
                homeTeam={m.home}
                awayTeam={m.away}
                homeLogo={m.homeId ? `/img/team/${m.homeId}/image` : null}
                awayLogo={m.awayId ? `/img/team/${m.awayId}/image` : null}
                homeScore={null}
                awayScore={null}
                time={m.time}
                status="scheduled"
                statusText={`${m.date}`}
                league={m.championship || ""}
              />
            ))}

          {((tab === "today" && matches.length === 0) ||
            (tab === "upcoming" && cbfUpcoming.length === 0)) && (
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

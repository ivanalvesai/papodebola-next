"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { MatchBarCard, type MatchBarCardProps } from "./match-bar-card";

interface MatchCarouselProps {
  title: string;
  count?: number;
  href?: string;
  hrefLabel?: string;
  matches: MatchBarCardProps[];
}

// Card de campeonato com carrossel horizontal de jogos, no mesmo estilo da barra
// "Hoje" da home (MatchBarCard) — setas pra rolar pros lados. Reutilizado em
// /futebol (um card por campeonato) e /agenda (um card por campeonato dentro de
// cada esporte).
export function MatchCarousel({
  title,
  count,
  href,
  hrefLabel = "Ver mais",
  matches,
}: MatchCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(direction: number) {
    scrollRef.current?.scrollBy({ left: direction, behavior: "smooth" });
  }

  if (matches.length === 0) return null;

  return (
    <section className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
      {/* Cabeçalho do campeonato */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-custom">
        <h2 className="text-sm font-bold text-text-primary uppercase truncate">
          {title}
          {count != null && (
            <span className="ml-2 text-xs font-normal text-text-muted normal-case">
              {count} {count === 1 ? "jogo" : "jogos"}
            </span>
          )}
        </h2>
        {href && (
          <Link
            href={href}
            className="text-xs text-green font-semibold hover:text-green-hover transition-colors shrink-0 ml-2"
          >
            {hrefLabel} &rsaquo;
          </Link>
        )}
      </div>

      {/* Carrossel */}
      <div className="relative">
        <button
          onClick={() => scroll(-300)}
          aria-label="Jogos anteriores"
          className="absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-card-bg to-transparent flex items-center justify-center text-text-muted hover:text-text-primary"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-10 py-3"
        >
          {matches.map((m) => (
            <MatchBarCard
              key={m.id ?? `${m.homeTeam}-${m.awayTeam}-${m.timestamp ?? ""}`}
              {...m}
            />
          ))}
        </div>

        <button
          onClick={() => scroll(300)}
          aria-label="Próximos jogos"
          className="absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-card-bg to-transparent flex items-center justify-center text-text-muted hover:text-text-primary"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}

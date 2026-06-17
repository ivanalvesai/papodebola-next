"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WC_PHASES } from "@/lib/world-cup-phases";

// Carrossel de fases da Copa (Grupos → 16-avos → Oitavas → ... → Final), estilo
// o das rodadas. São <Link>s reais (navegação crawlável); a fase ativa destacada.
export function PhaseNav({ active }: { active: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <nav aria-label="Fases da Copa do Mundo" className="relative mb-4">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Fases anteriores"
        className="absolute left-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border-custom bg-surface shadow-md transition-colors hover:bg-card-hover"
      >
        <ChevronLeft className="h-4 w-4 text-text-primary" />
      </button>

      <div
        ref={scroller}
        className="flex gap-2 overflow-x-auto px-9 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {WC_PHASES.map((p) => {
          const isActive = p.slug === active;
          return (
            <Link
              key={p.slug}
              href={p.href}
              aria-current={isActive ? "page" : undefined}
              className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold transition-colors ${
                isActive
                  ? "bg-green text-white"
                  : "border border-border-custom bg-card-bg text-text-primary hover:bg-card-hover"
              }`}
            >
              {p.label}
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Próximas fases"
        className="absolute right-0 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-border-custom bg-surface shadow-md transition-colors hover:bg-card-hover"
      >
        <ChevronRight className="h-4 w-4 text-text-primary" />
      </button>
    </nav>
  );
}

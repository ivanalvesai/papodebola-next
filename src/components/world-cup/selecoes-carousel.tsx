"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { SELECOES, selecaoHref } from "@/lib/selecoes";

export function SelecoesCarousel() {
  const scroller = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });

  return (
    <section className="mt-10 pt-6 border-t border-border-custom">
      <h2 className="text-lg font-bold text-text-primary">Seleções</h2>
      <p className="text-xs text-text-muted mb-4">
        Notícias e jogos de cada seleção da Copa do Mundo
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => scroll(-1)}
          aria-label="Ver anteriores"
          className="absolute left-0 top-[34px] -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border-custom shadow-md hover:bg-card-hover transition-colors"
        >
          <ChevronLeft className="h-5 w-5 text-text-primary" />
        </button>

        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto px-10 pb-2 scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SELECOES.map((s) => (
            <Link
              key={s.id}
              href={selecaoHref(s)}
              className="group shrink-0 w-[72px] flex flex-col items-center gap-2"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border border-border-custom bg-body flex items-center justify-center group-hover:border-green group-hover:shadow-md transition-all">
                <TeamLogo teamId={s.id} alt={s.name} size={56} className="object-cover" />
              </div>
              <h3 className="text-xs font-semibold text-text-primary text-center leading-tight group-hover:text-green transition-colors">
                {s.name}
              </h3>
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => scroll(1)}
          aria-label="Ver próximas"
          className="absolute right-0 top-[34px] -translate-y-1/2 z-10 flex items-center justify-center w-8 h-8 rounded-full bg-surface border border-border-custom shadow-md hover:bg-card-hover transition-colors"
        >
          <ChevronRight className="h-5 w-5 text-text-primary" />
        </button>
      </div>
    </section>
  );
}

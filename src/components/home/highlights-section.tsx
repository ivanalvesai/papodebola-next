import { Play } from "lucide-react";
import type { Highlight } from "@/types/team";

interface HighlightsSectionProps {
  highlights: Highlight[];
}

export function HighlightsSection({ highlights }: HighlightsSectionProps) {
  if (highlights.length === 0) {
    return (
      <section className="bg-card-bg rounded-lg border border-border-custom p-6">
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Play className="h-5 w-5 text-green" />
          Destaques e Melhores Momentos
        </h2>
        <p className="text-text-muted text-sm text-center py-6">
          Nenhum destaque disponivel
        </p>
      </section>
    );
  }

  return (
    <section className="bg-card-bg rounded-lg border border-border-custom p-6">
      <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
        <Play className="h-5 w-5 text-green" />
        Destaques e Melhores Momentos
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {highlights.slice(0, 8).map((h, i) => (
          <a
            key={i}
            href={h.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg overflow-hidden border border-border-light hover:shadow-md transition-shadow"
          >
            <div className="relative aspect-video bg-body">
              {h.thumbnail && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={h.thumbnail}
                  alt={h.title}
                  className="w-full h-full object-cover"
                  loading={i < 4 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <Play className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="p-2.5">
              <div className="text-[10px] font-bold text-green uppercase mb-1">
                {h.team}
              </div>
              <div className="text-xs font-semibold text-text-primary leading-tight line-clamp-2">
                {h.title}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WC_PHASES } from "@/lib/world-cup-phases";

// Paginador de fases da Copa, estilo o das rodadas: mostra só a fase atual e
// as setas ◄ ► levam pra fase anterior/seguinte (cada uma tem URL própria). As
// demais fases não aparecem de cara — vão sendo reveladas conforme se avança.
export function PhaseNav({ active }: { active: string }) {
  const idx = Math.max(0, WC_PHASES.findIndex((p) => p.slug === active));
  const current = WC_PHASES[idx];
  const prev = WC_PHASES[idx - 1];
  const next = WC_PHASES[idx + 1];

  const arrowBase =
    "flex h-7 w-7 items-center justify-center rounded-full bg-white/20 transition-colors";

  return (
    <nav aria-label="Fases da Copa do Mundo" className="mb-4">
      <div className="flex h-12 items-center justify-between gap-1 rounded-lg bg-green px-3 text-white">
        {prev ? (
          <Link href={prev.href} aria-label={`Fase anterior: ${prev.longLabel}`} className={`${arrowBase} hover:bg-white/30`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-hidden className={`${arrowBase} cursor-default opacity-30`}>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        <span className="whitespace-nowrap text-sm font-bold">{current.longLabel}</span>

        {next ? (
          <Link href={next.href} aria-label={`Próxima fase: ${next.longLabel}`} className={`${arrowBase} hover:bg-white/30`}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span aria-hidden className={`${arrowBase} cursor-default opacity-30`}>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

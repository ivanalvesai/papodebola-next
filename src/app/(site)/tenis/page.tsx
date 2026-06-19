import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { TennisTournamentStrip } from "@/components/tennis/tennis-tournament-strip";
import { getTennisDraw, TENNIS_TOURNAMENTS } from "@/lib/data/tennis";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/tenis" },
  title: "Tênis - Resultados, Ranking ATP e Calendário",
  description:
    "Acompanhe resultados de tênis, ranking ATP, calendário de torneios e jogos ao vivo. ATP, WTA, Grand Slams.",
};

const T = TENNIS_TOURNAMENTS["halle-2026"];

export default async function TenisPage() {
  const draw = await getTennisDraw("halle-2026").catch(() => null);
  const hasMatches = !!draw && draw.rounds.some((r) => r.matches.length > 0);

  const featured = hasMatches ? (
    <TennisTournamentStrip
      initial={draw!}
      slug={T.slug}
      category={T.category}
      city={T.city}
      surface={T.surface}
    />
  ) : (
    // fallback: torneio sem dados no momento -> link simples
    <Link
      href={`/tenis/${T.slug}`}
      className="group flex items-center gap-3 rounded-lg border border-green/30 bg-green/5 p-4 transition-colors hover:bg-green/10"
    >
      <Trophy className="h-6 w-6 shrink-0 text-green" />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-text-primary">{T.name} 2026</div>
        <div className="text-xs text-text-muted">Chaveamento, jogos e resultados set a set, ao vivo</div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-green transition-transform group-hover:translate-x-0.5" />
    </Link>
  );

  return (
    <SportPageContent
      sportKey="tenis"
      title="Tênis"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Tênis" },
      ]}
      featured={featured}
    />
  );
}

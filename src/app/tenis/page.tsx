import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  alternates: { canonical: "/tenis" },
  title: "Tênis - Resultados, Ranking ATP e Calendário",
  description:
    "Acompanhe resultados de tênis, ranking ATP, calendário de torneios e jogos ao vivo. ATP, WTA, Grand Slams.",
};

export default function TenisPage() {
  return (
    <SportPageContent
      sportKey="tenis"
      title="Tênis"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Tênis" },
      ]}
      featured={
        <Link
          href="/tenis/halle-2026"
          className="group flex items-center gap-3 rounded-lg border border-green/30 bg-green/5 p-4 transition-colors hover:bg-green/10"
        >
          <Trophy className="h-6 w-6 shrink-0 text-green" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-text-primary">ATP 500 de Halle 2026</div>
            <div className="text-xs text-text-muted">
              Chaveamento, jogos e resultados set a set, ao vivo
            </div>
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-green transition-transform group-hover:translate-x-0.5" />
        </Link>
      }
    />
  );
}

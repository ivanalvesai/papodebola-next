import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Basquete - NBA, Resultados e Classificação",
  description:
    "Cobertura de basquete: NBA, campeonatos e jogos ao vivo. Resultados, classificação e calendário completo.",
};

const TOURNAMENTS = [
  {
    slug: "nba",
    name: "NBA",
    description: "Resultados, classificação, calendário e jogos da temporada regular e playoffs da NBA.",
  },
];

export default function BasquetePage() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Basquete" },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-2">Basquete</h1>
      <p className="text-sm text-text-muted mb-6">
        Escolha um torneio para ver resultados, classificação e calendário.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOURNAMENTS.map((t) => (
          <Link
            key={t.slug}
            href={`/basquete/${t.slug}`}
            className="group bg-card-bg rounded-lg border border-border-custom p-6 hover:border-green hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-text-primary group-hover:text-green transition-colors">
                {t.name}
              </h2>
              <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-green transition-colors" />
            </div>
            <p className="text-xs text-text-muted">{t.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

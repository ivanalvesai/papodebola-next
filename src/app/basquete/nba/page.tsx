import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "NBA - Resultados, Classificação e Calendário",
  description:
    "Acompanhe a NBA: resultados, classificação das conferências, calendário de jogos e playoffs da temporada regular.",
};

export default function NbaPage() {
  return (
    <SportPageContent
      sportKey="basquete-nba"
      title="NBA"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Basquete", href: "/basquete" },
        { label: "NBA" },
      ]}
    />
  );
}

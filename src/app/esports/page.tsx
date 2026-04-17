import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "eSports - CS, LoL, Valorant e Mais",
  description:
    "Acompanhe Counter-Strike, League of Legends, Valorant, Dota 2 e outros. Campeonatos, resultados e calendário ao vivo.",
};

export default function EsportsPage() {
  return (
    <SportPageContent
      sportKey="esports"
      title="eSports"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "eSports" },
      ]}
    />
  );
}

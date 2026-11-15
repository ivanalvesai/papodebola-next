import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { buildMetadata } from "@/lib/seo/build-metadata";

// Lê os campeonatos do disco (data/snapshots/sport-hub, gravado pelo cron do dev): barato regenerar.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/esports", {
    alternates: { canonical: "/esports" },
    title: "eSports - CS, LoL, Valorant e Mais",
    description:
      "Acompanhe Counter-Strike, League of Legends, Valorant, Dota 2 e outros. Campeonatos, resultados e calendário ao vivo.",
  });
}

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

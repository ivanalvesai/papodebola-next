import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { buildMetadata } from "@/lib/seo/build-metadata";

// Lê os campeonatos do disco (data/snapshots/sport-hub, gravado pelo cron do dev): barato regenerar.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/combate", {
    alternates: { canonical: "/combate" },
    title: "Combate - UFC, MMA e Lutas ao Vivo",
    description:
      "Acompanhe UFC, MMA e demais lutas de combate. Calendário de eventos, resultados, cards e rankings.",
  });
}

export default function CombatePage() {
  return (
    <SportPageContent
      sportKey="combate"
      title="Combate"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Combate" },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Combate - UFC, MMA e Lutas ao Vivo",
  description:
    "Acompanhe UFC, MMA e demais lutas de combate. Calendário de eventos, resultados, cards e rankings.",
};

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

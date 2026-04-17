import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Boxe - Lutas, Resultados e Cinturões",
  description:
    "Acompanhe o boxe mundial. Lutas, resultados, campeões, cinturões WBA/WBC/IBF/WBO e calendário completo.",
};

export default function BoxePage() {
  return (
    <SportPageContent
      sportKey="boxe"
      title="Boxe"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Boxe" },
      ]}
    />
  );
}

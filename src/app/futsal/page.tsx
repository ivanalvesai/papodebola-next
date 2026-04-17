import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Futsal - Liga Nacional, Jogos e Resultados",
  description:
    "Acompanhe a Liga Nacional de Futsal, Copa do Brasil e torneios mundiais. Jogos ao vivo, resultados e calendário.",
};

export default function FutsalPage() {
  return (
    <SportPageContent
      sportKey="futsal"
      title="Futsal"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Futsal" },
      ]}
    />
  );
}

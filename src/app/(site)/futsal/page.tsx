import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { buildMetadata } from "@/lib/seo/build-metadata";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/futsal", {
    alternates: { canonical: "/futsal" },
    title: "Futsal - Liga Nacional, Jogos e Resultados",
    description:
      "Acompanhe a Liga Nacional de Futsal, Copa do Brasil e torneios mundiais. Jogos ao vivo, resultados e calendário.",
  });
}

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

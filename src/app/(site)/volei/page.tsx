import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { buildMetadata } from "@/lib/seo/build-metadata";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/volei", {
    alternates: { canonical: "/volei" },
    title: "Vôlei - Superliga, Jogos e Resultados",
    description:
      "Acompanhe a Superliga de Vôlei, CEV, Mundial de Clubes. Jogos ao vivo, resultados e calendário completo.",
  });
}

export default function VoleiPage() {
  return (
    <SportPageContent
      sportKey="volei"
      title="Vôlei"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Vôlei" },
      ]}
    />
  );
}

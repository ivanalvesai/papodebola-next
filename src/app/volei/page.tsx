import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Vôlei - Superliga, Jogos e Resultados",
  description:
    "Acompanhe a Superliga de Vôlei, CEV, Mundial de Clubes. Jogos ao vivo, resultados e calendário completo.",
};

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

import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Fórmula 1 - Calendário, Resultados e Classificação",
  description:
    "Fórmula 1: calendário de GPs, resultados das corridas, classificação de pilotos e construtores, horários ao vivo.",
};

export default function Formula1Page() {
  return (
    <SportPageContent
      sportKey="formula-1"
      title="Fórmula 1"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Fórmula 1" },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Tênis - Resultados, Ranking ATP e Calendário",
  description:
    "Acompanhe resultados de tênis, ranking ATP, calendário de torneios e jogos ao vivo. ATP, WTA, Grand Slams.",
};

export default function TenisPage() {
  return (
    <SportPageContent
      sportKey="tenis"
      title="Tênis"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Tênis" },
      ]}
    />
  );
}

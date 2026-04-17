import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Futebol Americano - NFL, Jogos e Super Bowl",
  description:
    "NFL, playoffs, Super Bowl e calendário completo. Jogos ao vivo, resultados e classificação de conferências.",
};

export default function FutebolAmericanoPage() {
  return (
    <SportPageContent
      sportKey="futebol-americano"
      title="Futebol Americano"
      breadcrumbItems={[
        { label: "Início", href: "/" },
        { label: "Futebol Americano" },
      ]}
    />
  );
}

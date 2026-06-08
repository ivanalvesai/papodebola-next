import type { Metadata } from "next";
import { Trophy } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { GroupRow } from "@/components/world-cup/group-row";
import { getWorldCupData } from "@/lib/data/world-cup";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Copa do Mundo 2026: tabela, grupos e jogos | Papo de Bola",
  description:
    "Acompanhe a Copa do Mundo 2026: classificação de todos os grupos e os jogos de cada rodada, com datas e horários (horário de Brasília).",
};

export default async function CopaDoMundoPage() {
  const { groups } = await getWorldCupData();

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Copa do Mundo 2026" }]}
      />

      <h1 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-green" />
        Copa do Mundo 2026
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Classificação de cada grupo e os jogos da rodada ao lado &middot; use a seta para avançar
        as rodadas. Horários de Brasília. Os 2 primeiros de cada grupo avançam (destaque em verde).
      </p>

      {groups.length === 0 ? (
        <p className="text-text-muted text-sm py-6">Classificação indisponível no momento.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => (
            <GroupRow key={g.name} group={g} />
          ))}
        </div>
      )}
    </div>
  );
}

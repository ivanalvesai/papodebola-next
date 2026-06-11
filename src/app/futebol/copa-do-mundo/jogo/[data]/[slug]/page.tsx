import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { resolveWorldCupMatch, getMatchDetail, getMatchGroup } from "@/lib/data/match-detail";

// Curto: a página acompanha jogo ao vivo (o cliente também faz polling).
export const revalidate = 30;

type Params = { data: string; slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { data, slug } = await params;
  const fixture = await resolveWorldCupMatch(data, slug);
  if (!fixture) notFound();
  const title = `${fixture.home} x ${fixture.away} ao vivo - Copa do Mundo 2026`;
  return {
    title,
    description: `${fixture.home} x ${fixture.away} pela Copa do Mundo 2026: placar ao vivo, lance a lance, escalações e estatísticas em tempo real (horário de Brasília).`,
    alternates: { canonical: `/futebol/copa-do-mundo/jogo/${data}/${slug}` },
  };
}

export default async function JogoCopaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { data, slug } = await params;
  const fixture = await resolveWorldCupMatch(data, slug);
  if (!fixture) notFound();

  const [detail, group] = await Promise.all([
    getMatchDetail(fixture.id),
    getMatchGroup(fixture.homeId, fixture.awayId),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
          { label: `${fixture.home} x ${fixture.away}` },
        ]}
      />

      <Link
        href="/futebol/copa-do-mundo"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-green hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para a Copa do Mundo
      </Link>

      <h1 className="mb-4 text-lg font-bold text-text-primary">
        {fixture.home} x {fixture.away}
        <span className="ml-2 text-sm font-normal text-text-muted">
          · {fixture.round}ª rodada · Copa do Mundo 2026
        </span>
      </h1>

      {detail ? (
        <LiveMatch matchId={fixture.id} initial={detail} group={group} />
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">
          Dados do jogo indisponíveis no momento. Atualize em instantes.
        </p>
      )}
    </div>
  );
}

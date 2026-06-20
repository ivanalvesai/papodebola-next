import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import {
  resolveWorldCupMatch,
  getMatchDetail,
  getMatchGroup,
  type WorldCupFixture,
} from "@/lib/data/match-detail";

// force-dynamic + Suspense: o cabeçalho (placar/título) renderiza e streama na hora;
// o detalhe pesado (escalação/stats/lance a lance = ~5 chamadas) chega depois, fora
// do caminho crítico do 1º paint. O cliente segue com polling de 30s.
export const dynamic = "force-dynamic";

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

// Parte pesada (detalhe + grupo) — isolada num Suspense pra streamar depois do shell.
async function MatchBody({
  fixture,
  url,
}: {
  fixture: WorldCupFixture;
  url: string;
}) {
  const [detail, group] = await Promise.all([
    getMatchDetail(fixture.id),
    getMatchGroup(fixture.homeId, fixture.awayId),
  ]);

  return (
    <>
      <SportsEventSchema
        home={fixture.home}
        away={fixture.away}
        homeId={fixture.homeId}
        awayId={fixture.awayId}
        startTimestamp={fixture.timestamp}
        statusType={detail?.event.statusType}
        url={url}
      />
      {detail ? (
        <LiveMatch matchId={fixture.id} initial={detail} group={group} />
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">
          Dados do jogo indisponíveis no momento. Atualize em instantes.
        </p>
      )}
    </>
  );
}

function MatchSkeleton() {
  return (
    <div className="animate-pulse space-y-4 py-6">
      <div className="h-28 rounded-lg bg-card-bg" />
      <div className="h-10 rounded-lg bg-card-bg" />
      <div className="h-64 rounded-lg bg-card-bg" />
    </div>
  );
}

export default async function JogoCopaPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { data, slug } = await params;
  const fixture = await resolveWorldCupMatch(data, slug);
  if (!fixture) notFound();
  const url = `/futebol/copa-do-mundo/jogo/${data}/${slug}`;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
          { label: `${fixture.home} x ${fixture.away}` },
        ]}
      />

      <h1 className="mb-4 text-lg font-bold text-text-primary">
        {fixture.home} x {fixture.away}
        <span className="ml-2 text-sm font-normal text-text-muted">
          · {fixture.round}ª rodada · Copa do Mundo 2026
        </span>
      </h1>

      <Suspense fallback={<MatchSkeleton />}>
        <MatchBody fixture={fixture} url={url} />
      </Suspense>
    </div>
  );
}

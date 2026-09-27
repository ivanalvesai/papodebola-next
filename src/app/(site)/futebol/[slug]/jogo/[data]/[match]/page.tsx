import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import {
  resolveChampionshipMatch,
  resolveFixtureByEventId,
  findRescheduledChampionshipHref,
  getMatchDetail,
} from "@/lib/data/match-detail";

// Lance a lance de QUALQUER campeonato (Série B, Série A, Libertadores...), no mesmo
// padrão da Copa: /futebol/{campeonato}/jogo/{data}/{confronto}. A Copa do Mundo tem rota
// própria (pasta estática copa-do-mundo) porque tem grupos/tradução de seleção.
export const revalidate = 30;

type Params = { slug: string; data: string; match: string };

// Resolve o confronto SEM depender de query string (mantém a rota ISR):
// 1) se o slug termina em "-{id}" (id anexado pela barra), usa esse id PRIMEIRO no
//    getMatchDetail — validando data + confronto. É 1 chamada (e o detalhe é reaproveitado
//    pela página), contra a tabela inteira do campeonato + feeds (primeira carga de até ~28 s);
// 2) senão (ou se o id não bater), pela tabela do campeonato (+ feeds ao vivo).
// Usado tanto no generateMetadata quanto na página — mesmo helper nos dois.
async function resolveFixture(slug: string, data: string, match: string) {
  // id do jogo anexado ao fim do slug pela barra (…-{apiId}); só ids longos (>=6 dígitos)
  // pra não confundir com um número que faça parte do nome do time.
  const m = match.match(/^(.*)-(\d{6,})$/);
  if (m) {
    const pairSlug = m[1];
    const eventId = Number(m[2]);
    const byId = await resolveFixtureByEventId(slug, data, pairSlug, eventId);
    if (byId) return byId;
  }
  return resolveChampionshipMatch(slug, data, match);
}

// Resolve o jogo; se a URL não bate exatamente (jogo remarcado pela API ou time
// renomeado, mudando o slug do par), faz 308 pra URL canônica do jogo compatível;
// senão 404. Mesmo helper no generateMetadata e na página.
async function resolveOrRedirect(slug: string, data: string, match: string) {
  const fixture = await resolveFixture(slug, data, match);
  if (fixture) return fixture;
  const pairSlug = match.replace(/-\d{6,}$/, "");
  const href = await findRescheduledChampionshipHref(slug, data, pairSlug);
  if (href) permanentRedirect(href);
  notFound();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, data, match } = await params;
  const fixture = await resolveOrRedirect(slug, data, match);
  const title = `${fixture.home} x ${fixture.away} ao vivo - ${fixture.tournamentName}`;
  return {
    title,
    description: `${fixture.home} x ${fixture.away} pelo ${fixture.tournamentName}: placar ao vivo, lance a lance, escalações e estatísticas em tempo real (horário de Brasília).`,
    alternates: { canonical: `/futebol/${slug}/jogo/${data}/${match}` },
  };
}

export default async function JogoCampeonatoPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug, data, match } = await params;
  const fixture = await resolveOrRedirect(slug, data, match);

  const detail = await getMatchDetail(fixture.id);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <SportsEventSchema
        home={fixture.home}
        away={fixture.away}
        homeId={fixture.homeId}
        awayId={fixture.awayId}
        startTimestamp={fixture.timestamp}
        statusType={detail?.event.statusType}
        venue={detail?.event.venue}
        url={`/futebol/${slug}/jogo/${data}/${match}`}
        competition={fixture.tournamentName}
      />
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: fixture.tournamentName, href: `/futebol/${slug}` },
          { label: `${fixture.home} x ${fixture.away}` },
        ]}
      />

      <h1 className="mb-4 text-lg font-bold text-text-primary">
        {fixture.home} x {fixture.away}
        <span className="ml-2 text-sm font-normal text-text-muted">
          {fixture.round > 0 ? `· ${fixture.round}ª rodada ` : "· "}
          {fixture.tournamentName}
        </span>
      </h1>

      {detail ? (
        <LiveMatch matchId={fixture.id} initial={detail} group={null} competition={fixture.tournamentName} />
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">
          Dados do jogo indisponíveis no momento. Atualize em instantes.
        </p>
      )}
    </div>
  );
}

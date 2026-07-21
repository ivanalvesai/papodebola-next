import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import { resolveChampionshipMatch, resolveFixtureByEventId, getMatchDetail } from "@/lib/data/match-detail";

// Lance a lance de QUALQUER campeonato (Série B, Série A, Libertadores...), no mesmo
// padrão da Copa: /futebol/{campeonato}/jogo/{data}/{confronto}. A Copa do Mundo tem rota
// própria (pasta estática copa-do-mundo) porque tem grupos/tradução de seleção.
export const revalidate = 30;

type Params = { slug: string; data: string; match: string };

// Resolve o confronto SEM depender de query string (mantém a rota ISR):
// 1) pela tabela do campeonato (+ feeds ao vivo), com o slug limpo;
// 2) fallback: se o slug termina em "-{id}" (ligas sem página própria, ex.: qualifiers da
//    Champions), usa esse id no getMatchDetail — validando data + confronto.
async function resolveFixture(slug: string, data: string, match: string) {
  const byChamp = await resolveChampionshipMatch(slug, data, match);
  if (byChamp) return byChamp;
  // id do jogo anexado ao fim do slug pela barra (…-{apiId}); só ids longos (>=6 dígitos)
  // pra não confundir com um número que faça parte do nome do time.
  const m = match.match(/^(.*)-(\d{6,})$/);
  if (m) {
    const pairSlug = m[1];
    const eventId = Number(m[2]);
    return resolveFixtureByEventId(slug, data, pairSlug, eventId);
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug, data, match } = await params;
  const fixture = await resolveFixture(slug, data, match);
  if (!fixture) notFound();
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
  const fixture = await resolveFixture(slug, data, match);
  if (!fixture) notFound();

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

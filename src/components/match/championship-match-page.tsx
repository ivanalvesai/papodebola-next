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
import { buildMetadata } from "@/lib/seo/build-metadata";
import { champPath } from "@/lib/config";
import { championshipMatchSeo } from "@/lib/match-seo";
import { MatchPreview } from "@/components/match/match-preview";

// Lance a lance de QUALQUER campeonato (Série B, Série A, Libertadores, Liga das Nações...),
// no mesmo padrão da Copa: {champPath(campeonato)}/jogo/{data}/{confronto}. Compartilhado
// pela rota genérica /futebol/[slug]/jogo/... e pelas seções aninhadas (Liga das Nações).

export type ChampionshipMatchParams = { slug: string; data: string; match: string };

// Resolve o confronto SEM depender de query string (mantém a rota ISR):
// 1) se o slug termina em "-{id}" (id anexado pela barra), usa esse id PRIMEIRO no
//    getMatchDetail — validando data + confronto. É 1 chamada (e o detalhe é reaproveitado
//    pela página), contra a tabela inteira do campeonato + feeds (primeira carga de até ~28 s);
// 2) senão (ou se o id não bater), pela tabela do campeonato (+ feeds ao vivo).
// Usado no generateMetadata (só a resolução exata: se falhar devolve {} — sem
// redirect nem notFound, senão a URL remarcada viraria 404 antes da página
// redirecionar) e, via resolveOrRedirect, na página.
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
// senão 404. Só no corpo da página (redirect não acontece no generateMetadata).
async function resolveOrRedirect(slug: string, data: string, match: string) {
  const fixture = await resolveFixture(slug, data, match);
  if (fixture) return fixture;
  const pairSlug = match.replace(/-\d{6,}$/, "");
  const href = await findRescheduledChampionshipHref(slug, data, pairSlug);
  if (href) permanentRedirect(href);
  notFound();
}

async function metadataDefaults({ slug, data, match }: ChampionshipMatchParams): Promise<Metadata> {
  const fixture = await resolveFixture(slug, data, match);
  if (!fixture) return {}; // a página decide: 308 (remarcado/renomeado) ou 404
  // Mesmo getMatchDetail da página (fetch deduplicado no render): título por status.
  const detail = await getMatchDetail(fixture.id).catch(() => null);
  const { title, description } = championshipMatchSeo({
    ...fixture,
    status: detail?.event.statusType || "",
    homeScore: detail?.event.homeScore,
    awayScore: detail?.event.awayScore,
  });
  return {
    title,
    description,
    alternates: { canonical: `${champPath(slug)}/jogo/${data}/${match}` },
  };
}

// SEO editável no /cms (Textos e SEO das páginas) sobre os defaults acima. `route` é o
// padrão cadastrado no /cms (genérico: "/futebol/:slug/jogo/:data/:match").
export async function championshipMatchMetadata(
  p: ChampionshipMatchParams,
  route = "/futebol/:slug/jogo/:data/:match"
): Promise<Metadata> {
  return buildMetadata(route, await metadataDefaults(p));
}

export async function ChampionshipMatchPage({ slug, data, match }: ChampionshipMatchParams) {
  const fixture = await resolveOrRedirect(slug, data, match);

  const detail = await getMatchDetail(fixture.id);
  const status = detail?.event.statusType || "";
  const started = status === "inprogress" || status === "finished";
  const preview = (
    <MatchPreview fixture={fixture} champSlug={slug} venue={detail?.event.venue} finished={status === "finished"} />
  );

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
        url={`${champPath(slug)}/jogo/${data}/${match}`}
        competition={fixture.tournamentName}
      />
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: fixture.tournamentName, href: champPath(slug) },
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

      {/* Antes do apito o pré-jogo vem primeiro; ao vivo/encerrado, o placar vem antes. */}
      {!started && preview}

      {detail ? (
        <LiveMatch matchId={fixture.id} initial={detail} group={null} competition={fixture.tournamentName} />
      ) : (
        <p className="py-10 text-center text-sm text-text-muted">
          Dados do jogo indisponíveis no momento. Atualize em instantes.
        </p>
      )}

      {started && <div className="mt-6">{preview}</div>}
    </div>
  );
}

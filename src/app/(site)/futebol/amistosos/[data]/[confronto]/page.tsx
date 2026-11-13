import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import type { MatchDetail } from "@/lib/data/match-detail";
import {
  resolveAmistosoMatch,
  getAmistosoMatchDetail,
  updateAmistosoFixtureScore,
  amistosoMatchHref,
  AMISTOSOS_PREFIX,
  type AmistosoFixture,
} from "@/lib/data/amistosos";
import { buildMetadata } from "@/lib/seo/build-metadata";

// Lance a lance dos amistosos de seleções acompanhadas (Brasil sub-20, Argentina, Uruguai):
// /futebol/amistosos/{DD-MM-AAAA}/{casa}-{fora}. O Brasil principal tem página própria em
// /futebol/selecao-brasileira (redireciona pra lá). ISR + polling do cliente, nunca
// force-dynamic; o getMatchDetail arquiva o jogo no volume a cada render com dado real.
export const revalidate = 30;

// ISR sob demanda (sem isto a rota vira ƒ e remonta a cada acesso).
export async function generateStaticParams() {
  return [];
}

type Params = { data: string; confronto: string };

async function metadataDefaults({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { data, confronto } = await params;
  const f = await resolveAmistosoMatch(data, confronto);
  if (!f) notFound();
  const url = `${AMISTOSOS_PREFIX}/${data}/${confronto}`;
  const hasScore = f.homeScore != null && f.awayScore != null;

  let title: string;
  let description: string;
  if (f.status === "finished") {
    const placar = hasScore ? `${f.home} ${f.homeScore} x ${f.awayScore} ${f.away}` : `${f.home} x ${f.away}`;
    title = `${placar}: resultado e lance a lance | ${f.tournamentName}`;
    description = `Resultado de ${f.home} x ${f.away} (${f.tournamentName}). Veja o lance a lance, as escalações e as estatísticas do jogo.`;
  } else if (f.status === "notstarted") {
    title = `${f.home} x ${f.away}: horário e escalação | ${f.tournamentName}`;
    description = `${f.home} x ${f.away} (${f.tournamentName}): horário de Brasília, escalações e lance a lance.`;
  } else {
    title = `${f.home} x ${f.away} AO VIVO: lance a lance | ${f.tournamentName}`;
    description = `${f.home} x ${f.away} ao vivo (${f.tournamentName}): placar em tempo real, lance a lance, escalações e estatísticas.`;
  }
  return { title: { absolute: title }, description, alternates: { canonical: url } };
}

export async function generateMetadata(props: Parameters<typeof metadataDefaults>[0]): Promise<Metadata> {
  return buildMetadata("/futebol/amistosos/:data/:confronto", await metadataDefaults(props));
}

function seedDetail(f: AmistosoFixture): MatchDetail {
  const now = Date.now() / 1000;
  return {
    event: {
      id: f.id,
      homeId: f.homeId,
      awayId: f.awayId,
      home: f.home,
      away: f.away,
      homeScore: f.homeScore,
      awayScore: f.awayScore,
      homePens: null,
      awayPens: null,
      winnerCode: null,
      statusType: f.status || (f.timestamp > now ? "notstarted" : "inprogress"),
      statusDesc: "",
      startTimestamp: f.timestamp,
      periodStart: 0,
      live: f.status === "inprogress",
      venue: null,
    },
    incidents: [],
    commentary: [],
    home: null,
    away: null,
    lineupsConfirmed: false,
    stats: [],
    shootout: [],
  };
}

export default async function AmistosoJogoPage({ params }: { params: Promise<Params> }) {
  const { data, confronto } = await params;
  const fixture = await resolveAmistosoMatch(data, confronto);
  if (!fixture) notFound();
  const canonical = amistosoMatchHref(fixture);
  const url = `${AMISTOSOS_PREFIX}/${data}/${confronto}`;
  if (canonical !== url) permanentRedirect(canonical); // jogo do Brasil principal

  const detail = await getAmistosoMatchDetail(fixture).catch(() => null);
  if (detail?.event) {
    await updateAmistosoFixtureScore(fixture.id, {
      homeScore: detail.event.homeScore,
      awayScore: detail.event.awayScore,
      status: detail.event.statusType,
    }).catch(() => {});
  }

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
        url={url}
        competition={fixture.tournamentName}
      />
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Jogos de Hoje", href: "/jogos-de-hoje" },
          { label: `${fixture.home} x ${fixture.away}` },
        ]}
      />

      <h1 className="mb-4 text-lg font-bold text-text-primary">
        {fixture.home} x {fixture.away}
        <span className="ml-2 text-sm font-normal text-text-muted">· {fixture.tournamentName}</span>
      </h1>

      <LiveMatch
        matchId={fixture.id}
        initial={detail ?? seedDetail(fixture)}
        group={null}
        competition={fixture.tournamentName}
      />
    </div>
  );
}

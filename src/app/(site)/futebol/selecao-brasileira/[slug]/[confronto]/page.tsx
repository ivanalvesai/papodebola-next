import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import type { MatchDetail } from "@/lib/data/match-detail";
import {
  resolveSelecaoMatch,
  getSelecaoMatchDetail,
  updateSelecaoFixtureScore,
  SELECAO_PREFIX,
  type SelecaoFixture,
} from "@/lib/data/selecao-jogos";

// Lance a lance dos jogos da Seleção fora da Copa (amistosos, Eliminatórias):
// /futebol/selecao-brasileira/{DD-MM-AAAA}/{casa}-{fora}. O [slug] do nível de cima é a
// DATA aqui (a rota irmã [slug]/page.tsx é a notícia). ISR + polling do cliente, nunca
// force-dynamic. O getMatchDetail arquiva o jogo (snapshot) a cada render com dado real,
// então a página sobrevive à API sair do ar.
export const revalidate = 30;

type Params = { slug: string; confronto: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug, confronto } = await params;
  const f = await resolveSelecaoMatch(slug, confronto);
  if (!f) notFound();
  const url = `${SELECAO_PREFIX}/${slug}/${confronto}`;
  const hasScore = f.homeScore != null && f.awayScore != null;

  let title: string;
  let description: string;
  if (f.status === "finished") {
    const placar = hasScore ? `${f.home} ${f.homeScore} x ${f.awayScore} ${f.away}` : `${f.home} x ${f.away}`;
    title = `${placar}: resultado e lance a lance | ${f.tournamentName}`;
    description = `Resultado de ${f.home} x ${f.away} (${f.tournamentName}). Veja o lance a lance, as escalações e as estatísticas do jogo da Seleção Brasileira.`;
  } else if (f.status === "notstarted") {
    title = `${f.home} x ${f.away}: horário e escalação | Seleção Brasileira`;
    description = `${f.home} x ${f.away} (${f.tournamentName}): horário de Brasília, escalações e lance a lance da Seleção Brasileira.`;
  } else {
    title = `${f.home} x ${f.away} AO VIVO: lance a lance | Seleção Brasileira`;
    description = `${f.home} x ${f.away} ao vivo (${f.tournamentName}): placar em tempo real, lance a lance, escalações e estatísticas da Seleção Brasileira.`;
  }

  return { title: { absolute: title }, description, alternates: { canonical: url } };
}

function seedDetail(f: SelecaoFixture): MatchDetail {
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

export default async function SelecaoJogoPage({ params }: { params: Promise<Params> }) {
  const { slug, confronto } = await params;
  const fixture = await resolveSelecaoMatch(slug, confronto);
  if (!fixture) notFound();
  const url = `${SELECAO_PREFIX}/${slug}/${confronto}`;

  // Encerrado há mais de 6h: serve só o arquivo salvo, sem tocar na API.
  const detail = await getSelecaoMatchDetail(fixture).catch(() => null);
  if (detail?.event) {
    // Mantém o placar/status do índice (usado no hub) em dia com o detalhe fresco.
    await updateSelecaoFixtureScore(fixture.id, {
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
          { label: "Seleção Brasileira", href: SELECAO_PREFIX },
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

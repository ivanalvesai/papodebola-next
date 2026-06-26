import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveMatch } from "@/components/world-cup/live-match";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import {
  resolveWorldCupMatch,
  getMatchDetail,
  getMatchEvent,
  getMatchGroup,
  type WorldCupFixture,
  type MatchDetail,
} from "@/lib/data/match-detail";

// ISR (não force-dynamic): a página cacheia e serve na hora; o cliente faz polling
// pro ao vivo (não precisa renderizar dinâmico a cada hit). force-dynamic sem cache
// martelava a AllSportsApi (4+ calls/render) → 429 em massa → páginas penduravam no
// mobile/tráfego. Com ISR o jogo encerrado cacheia muito e o ao vivo revalida a cada 30s.
export const revalidate = 30;

// Rótulo da fase: grupos (round 1-3) = "Nª rodada"; mata-mata (6+) = nome da fase.
function faseSimples(round: number): string {
  const m: Record<number, string> = { 6: "16-avos de final", 7: "oitavas de final", 8: "quartas de final", 9: "semifinal", 10: "final" };
  return round <= 3 ? `${round}ª rodada` : m[round] || `${round}ª rodada`;
}
function faseComPrep(round: number): string {
  const m: Record<number, string> = { 6: "pelos 16-avos de final", 7: "pelas oitavas de final", 8: "pelas quartas de final", 9: "pela semifinal", 10: "pela final" };
  return round <= 3 ? `pela ${round}ª rodada` : m[round] || `pela ${round}ª rodada`;
}

type Params = { data: string; slug: string };

// Transmissão da Copa 2026 no Brasil (igual pra todos os jogos).
const BROADCAST: { label: string; val: string }[] = [
  { label: "TV aberta", val: "Globo e SBT" },
  { label: "YouTube (grátis)", val: "CazéTV" },
  { label: "Streaming", val: "Globoplay" },
  { label: "TV fechada", val: "SporTV" },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { data, slug } = await params;
  const fixture = await resolveWorldCupMatch(data, slug);
  if (!fixture) notFound();
  const { home, away, round } = fixture;
  const url = `/futebol/copa-do-mundo/jogo/${data}/${slug}`;

  // Status (e placar) pra título/description que casam com a intenção de busca.
  const ev = await getMatchEvent(fixture.id, fixture.timestamp);
  const status = ev?.statusType || (Date.now() / 1000 < fixture.timestamp ? "notstarted" : "finished");
  const hasScore = !!ev && ev.homeScore != null && ev.awayScore != null;

  let title: string;
  let description: string;
  if (status === "finished") {
    const placar = hasScore ? `${home} ${ev!.homeScore} x ${ev!.awayScore} ${away}` : `${home} x ${away}`;
    title = `${placar} — resultado, lances e estatísticas | Copa do Mundo 2026`;
    description = `Resultado de ${home} x ${away} pela Copa do Mundo 2026${
      hasScore ? `: ${home} ${ev!.homeScore} x ${ev!.awayScore} ${away}` : ""
    }. Veja o lance a lance, as escalações e as estatísticas do jogo.`;
  } else if (status === "inprogress") {
    const placar = hasScore ? `${ev!.homeScore} x ${ev!.awayScore}` : "x";
    title = `${home} ${placar} ${away} AO VIVO — lance a lance | Copa do Mundo 2026`;
    description = `${home} x ${away} AO VIVO pela Copa do Mundo 2026: placar em tempo real, lance a lance, escalações e estatísticas.`;
  } else {
    title = `${home} x ${away}: horário, onde assistir e escalação | Copa do Mundo 2026`;
    description = `${home} x ${away} ${faseComPrep(round)} da Copa do Mundo 2026: que horas é o jogo (horário de Brasília), onde assistir ao vivo na TV e online e as prováveis escalações.`;
  }

  return { title, description, alternates: { canonical: url } };
}

// Bloco de pré-jogo (só em jogo futuro): horário + onde assistir + link interno.
// Captura a busca de alta intenção "X x Y onde assistir / que horas / escalação".
function PreGameInfo({ fixture }: { fixture: WorldCupFixture }) {
  const horario = new Date(fixture.timestamp * 1000).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div className="mb-4 rounded-lg border border-border-custom bg-card-bg p-4">
      <h2 className="text-base font-bold text-text-primary">Onde assistir e horário</h2>
      <p className="mt-1 text-sm text-text-secondary">
        <strong className="text-text-primary">
          {fixture.home} x {fixture.away}
        </strong>{" "}
        — {horario} (horário de Brasília), {faseComPrep(fixture.round)} da Copa do Mundo 2026.
      </p>
      <ul className="mt-2 space-y-1 text-sm text-text-secondary">
        {BROADCAST.map((b) => (
          <li key={b.label}>
            <span className="font-semibold text-text-primary">{b.label}:</span> {b.val}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-text-muted">
        Veja{" "}
        <Link href="/artigos/onde-assistir-copa-do-mundo-2026" className="text-green hover:underline">
          onde assistir a todos os jogos da Copa do Mundo 2026
        </Link>
        .
      </p>
    </div>
  );
}

// Parte pesada (detalhe + grupo) — isolada num Suspense pra streamar depois do shell.
async function MatchBody({ fixture, url }: { fixture: WorldCupFixture; url: string }) {
  const [detail, group] = await Promise.all([
    getMatchDetail(fixture.id, fixture.timestamp),
    getMatchGroup(fixture.homeId, fixture.awayId),
  ]);

  // Se o SSR não trouxe o detalhe (ex: API momentaneamente lenta/429), NÃO mostra
  // tela morta: semeia o LiveMatch com os dados do confronto e o cliente preenche
  // tudo via polling. Assim nunca aparece "indisponível".
  const seed: MatchDetail = {
    event: {
      id: fixture.id,
      homeId: fixture.homeId,
      awayId: fixture.awayId,
      home: fixture.home,
      away: fixture.away,
      homeScore: null,
      awayScore: null,
      statusType: fixture.timestamp > Date.now() / 1000 ? "notstarted" : "inprogress",
      statusDesc: "",
      startTimestamp: fixture.timestamp,
      periodStart: 0,
      live: fixture.timestamp <= Date.now() / 1000,
      venue: null,
    },
    incidents: [],
    commentary: [],
    home: null,
    away: null,
    lineupsConfirmed: false,
    stats: [],
  };

  return (
    <>
      <SportsEventSchema
        home={fixture.home}
        away={fixture.away}
        homeId={fixture.homeId}
        awayId={fixture.awayId}
        startTimestamp={fixture.timestamp}
        statusType={detail?.event.statusType}
        venue={detail?.event.venue}
        url={url}
      />
      <LiveMatch matchId={fixture.id} initial={detail ?? seed} group={group} />
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

export default async function JogoCopaPage({ params }: { params: Promise<Params> }) {
  const { data, slug } = await params;
  const fixture = await resolveWorldCupMatch(data, slug);
  if (!fixture) notFound();
  const url = `/futebol/copa-do-mundo/jogo/${data}/${slug}`;
  const upcoming = fixture.timestamp > Date.now() / 1000;

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
          · {faseSimples(fixture.round)} · Copa do Mundo 2026
        </span>
      </h1>

      {upcoming && <PreGameInfo fixture={fixture} />}

      <Suspense fallback={<MatchSkeleton />}>
        <MatchBody fixture={fixture} url={url} />
      </Suspense>
    </div>
  );
}

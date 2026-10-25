import Link from "next/link";
import { BroadcastChannels } from "@/components/team/team-narrative";
import { getArticles } from "@/lib/data/articles";
import { getChampionshipData } from "@/lib/data/championship";
import { teamSlugById } from "@/lib/data/team";
import type { StandingRow } from "@/types/standings";

// Bloco de pré-jogo da página de jogo de campeonato: resposta direta (data/hora/local),
// onde assistir, posição dos dois times, notícias deles e links pras páginas dos times.
// Tudo de fontes já em cache (tabela do campeonato = mesma da resolução da URL; notícias
// = Payload). Nenhuma chamada nova à AllSportsApi.
type Fixture = { home: string; away: string; homeId: number; awayId: number; timestamp: number; tournamentName: string };

const card = "bg-card-bg rounded-lg border border-border-custom";

function when(ts: number): string {
  const d = new Date(ts * 1000);
  const date = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", timeZone: "America/Sao_Paulo" });
  const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  return `${date}, às ${time} (Brasília)`;
}

export async function MatchPreview({
  fixture,
  champSlug,
  venue,
  finished = false,
}: {
  fixture: Fixture;
  champSlug: string;
  venue?: { stadium: string; city: string } | null;
  // Jogo encerrado: sem "quando é/onde assistir"; ficam tabela, times e notícias.
  finished?: boolean;
}) {
  const [champ, homeSlug, awaySlug, homeNews, awayNews] = await Promise.all([
    getChampionshipData(champSlug).catch(() => null),
    teamSlugById(fixture.homeId),
    teamSlugById(fixture.awayId),
    getArticles({ team: { id: fixture.homeId, name: fixture.home }, perPage: 3 }).catch(() => ({ articles: [] })),
    getArticles({ team: { id: fixture.awayId, name: fixture.away }, perPage: 3 }).catch(() => ({ articles: [] })),
  ]);
  const rows: StandingRow[] = (champ?.standings || []).flatMap((g) => g.rows);
  const pos = (id: number) => rows.find((r) => r.teamId === id) || null;
  const homePos = pos(fixture.homeId);
  const awayPos = pos(fixture.awayId);
  const seen = new Set<string>();
  const news = [...homeNews.articles, ...awayNews.articles].filter((a) => !seen.has(a.slug) && seen.add(a.slug)).slice(0, 5);
  const place = venue?.stadium ? ` no ${venue.stadium}${venue.city ? `, em ${venue.city}` : ""}` : "";

  return (
    <div className="mb-6 space-y-4">
      {!finished && (
      <section className={`${card} p-4`}>
        <h2 className="mb-2 text-base font-bold text-text-primary">Quando é e onde assistir</h2>
        <p className="mb-3 text-sm text-text-secondary">
          {fixture.home} x {fixture.away} é {when(fixture.timestamp)}
          {place}, pelo {fixture.tournamentName}.
        </p>
        <BroadcastChannels league={fixture.tournamentName} />
      </section>
      )}

      {(homePos || awayPos) && (
        <section className={`${card} p-4`}>
          <h2 className="mb-2 text-base font-bold text-text-primary">{finished ? "Na tabela" : "Como chegam"}</h2>
          <ul className="space-y-1 text-sm text-text-secondary">
            {[
              { name: fixture.home, p: homePos },
              { name: fixture.away, p: awayPos },
            ].map(({ name, p }) =>
              p ? (
                <li key={name}>
                  <strong className="text-text-primary">{name}</strong>: {p.pos}º lugar, {p.pts} pontos em {p.matches} jogos ({p.wins}V {p.draws}E {p.losses}D)
                </li>
              ) : null
            )}
          </ul>
          <Link href={`/futebol/${champSlug}`} className="mt-2 inline-block text-sm font-semibold text-green hover:text-green-hover">
            Classificação do {fixture.tournamentName} &rarr;
          </Link>
        </section>
      )}

      {(homeSlug || awaySlug) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { name: fixture.home, slug: homeSlug },
            { name: fixture.away, slug: awaySlug },
          ].map(({ name, slug }) =>
            slug ? (
              <Link key={name} href={`/futebol/times/${slug}`} className={`${card} block p-4 text-sm font-semibold text-text-primary hover:border-green`}>
                Tudo sobre o {name}: próximos jogos, escalação e notícias &rarr;
              </Link>
            ) : null
          )}
        </div>
      )}

      {news.length > 0 && (
        <section className={card}>
          <h2 className="border-b border-border-custom px-4 py-3 text-base font-bold text-text-primary">
            Notícias de {fixture.home} e {fixture.away}
          </h2>
          <ul className="divide-y divide-border-light">
            {news.map((a) => (
              <li key={a.slug}>
                <Link href={a.url} className="block px-4 py-3 text-sm font-semibold text-text-primary hover:bg-body">
                  {a.rewrittenTitle}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

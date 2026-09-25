import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getArticles } from "@/lib/data/articles";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { Newspaper, Trophy, CalendarDays } from "lucide-react";
import { getSelecaoFixtures, selecaoMatchHref, type SelecaoFixture } from "@/lib/data/selecao-jogos";

// 60s: o card do jogo ao vivo mostra o placar atualizado (a lista vem do índice
// durável + fetch cacheado, sem martelar a API).
export const revalidate = 60;

const LIVE = new Set(["inprogress", "interrupted"]);

// Ao vivo primeiro; depois o próximo jogo; depois os mais recentes. Máx. 4 cards.
function pickGames(all: SelecaoFixture[]): SelecaoFixture[] {
  const now = Date.now() / 1000;
  const live = all.filter((f) => LIVE.has(f.status));
  const next = all
    .filter((f) => f.status === "notstarted" && f.timestamp > now)
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(0, 1);
  const done = all
    .filter((f) => f.status === "finished")
    .sort((a, b) => b.timestamp - a.timestamp);
  return [...live, ...next, ...done].slice(0, 4);
}

function GameCard({ f }: { f: SelecaoFixture }) {
  const live = LIVE.has(f.status);
  const hasScore = f.homeScore != null && f.awayScore != null;
  const when = new Date(f.timestamp * 1000).toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const label = live ? "Ao vivo" : f.status === "finished" ? "Encerrado" : when;
  return (
    <Link
      href={selecaoMatchHref(f)}
      className={`group block rounded-lg border bg-card-bg p-4 transition-shadow hover:shadow-md ${
        live ? "border-red" : "border-border-custom"
      }`}
    >
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-semibold text-text-muted">{f.tournamentName}</span>
        <span className={live ? "flex items-center gap-1 font-bold uppercase text-red" : "text-text-muted"}>
          {live && <span className="h-2 w-2 animate-pulse rounded-full bg-red" />}
          {label}
        </span>
      </div>
      {[
        { id: f.homeId, name: f.home, score: f.homeScore },
        { id: f.awayId, name: f.away, score: f.awayScore },
      ].map((t) => (
        <div key={t.id} className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Image src={`/api/team-img/${t.id}`} alt={t.name} width={24} height={24} className="h-6 w-6 object-contain" unoptimized />
            {t.name}
          </span>
          <span className="text-lg font-bold text-text-primary">{hasScore ? t.score : ""}</span>
        </div>
      ))}
      <div className="mt-2 text-xs font-semibold text-green group-hover:underline">
        {live ? "Acompanhe o lance a lance" : "Ver lance a lance"} &rarr;
      </div>
    </Link>
  );
}

export const metadata: Metadata = {
  alternates: { canonical: "/futebol/selecao-brasileira" },
  title: "Seleção Brasileira - Notícias, Convocados e Jogos",
  description:
    "Tudo sobre a Seleção Brasileira de futebol: convocações, jogos, Copa do Mundo 2026, Eliminatórias Sul-Americanas e notícias atualizadas.",
};

export default async function SelecaoBrasileiraPage() {
  const [{ articles }, fixtures] = await Promise.all([
    getArticles({
      category: "Seleção Brasileira",
      perPage: 12,
    }).catch(() => ({ articles: [], total: 0 })),
    getSelecaoFixtures().catch(() => [] as SelecaoFixture[]),
  ]);
  const games = pickGames(fixtures);

  const [featured, ...rest] = articles;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Seleção Brasileira" },
        ]}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green to-green-hover rounded-lg p-6 mb-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="h-8 w-8" />
          <h1 className="text-2xl font-bold">Seleção Brasileira</h1>
        </div>
        <p className="text-sm opacity-95">
          Pentacampeã do mundo. Acompanhe convocações, jogos das Eliminatórias, amistosos e a caminhada rumo à Copa do Mundo 2026.
        </p>
      </div>

      {games.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-green" />
            Jogos da Seleção
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {games.map((f) => (
              <GameCard key={f.id} f={f} />
            ))}
          </div>
        </section>
      )}

      <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-green" />
        Últimas notícias
      </h2>

      {articles.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">
            Nenhuma notícia encontrada sobre a Seleção Brasileira no momento.
          </p>
        </div>
      ) : (
        <>
          {featured && (
            <Link
              href={featured.url}
              className="group block bg-card-bg rounded-lg border border-border-custom overflow-hidden mb-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {featured.image && (
                  <div className="aspect-video md:aspect-auto">
                    <Image
                      src={featured.image}
                      alt=""
                      width={620}
                      height={350}
                      className="w-full h-full object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <div className="text-xs font-bold text-green uppercase mb-2">
                    {featured.category}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary leading-tight mb-3 group-hover:text-green transition-colors">
                    {featured.rewrittenTitle}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-3">
                    {featured.rewrittenText.substring(0, 200)}...
                  </p>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={article.url}
                className="group bg-card-bg rounded-lg border border-border-custom overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-video bg-body">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt=""
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Newspaper className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-green transition-colors">
                    {article.rewrittenTitle}
                  </h4>
                  <div className="text-[11px] text-text-muted">
                    {new Date(article.pubDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      timeZone: "America/Sao_Paulo",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-6">
            <Link
              href="/noticias/selecao-brasileira"
              className="inline-block text-sm font-semibold text-green hover:text-green-hover"
            >
              Ver todas as notícias da Seleção &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

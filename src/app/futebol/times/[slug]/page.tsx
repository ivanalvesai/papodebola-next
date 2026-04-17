import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamPageData } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { ArrowRight, Calendar, Trophy, BarChart3, Tv, Users } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  return ALL_CLUSTER_TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `${team.name} - Noticias, Jogos e Classificacao`,
    description: `Tudo sobre o ${team.name}: noticias, jogos de hoje, proximos jogos, escalacao, estatisticas e onde assistir ao vivo.`,
  };
}

export default async function TeamHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const data = await getTeamPageData(slug);
  if (!data) notFound();

  const clusterLinks = [
    { href: `/futebol/times/${slug}/jogo-hoje`, label: "Jogo de Hoje", desc: `Veja se o ${team.name} joga hoje, horario e detalhes`, icon: Calendar },
    { href: `/futebol/times/${slug}/onde-assistir`, label: "Onde Assistir", desc: `Saiba onde assistir ao jogo do ${team.name} ao vivo`, icon: Tv },
    { href: `/futebol/times/${slug}/escalacao`, label: "Escalacao", desc: `Escalacao provavel do ${team.name} para o proximo jogo`, icon: Users },
    { href: `/futebol/times/${slug}/proximos-jogos`, label: "Proximos Jogos", desc: `Calendario completo dos proximos jogos do ${team.name}`, icon: Calendar },
    { href: `/futebol/times/${slug}/estatisticas`, label: "Estatisticas 2026", desc: `Numeros, artilheiros e desempenho do ${team.name} em 2026`, icon: BarChart3 },
  ];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main */}
        <div className="space-y-6">
          {/* Cluster links (pillar pages) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {clusterLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-start gap-3 bg-card-bg rounded-lg border border-border-custom p-4 hover:border-green hover:shadow-sm transition-all"
              >
                <link.icon className="h-5 w-5 text-green shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-text-primary group-hover:text-green transition-colors">
                    {link.label}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {link.desc}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-green shrink-0 mt-0.5" />
              </Link>
            ))}
          </div>

          {/* Today's match */}
          {data.todayMatch && (
            <div className="bg-card-bg rounded-lg border border-green p-4">
              <h2 className="text-sm font-bold text-green uppercase mb-3">
                Jogo de Hoje
              </h2>
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <Image src={`/img/team/${data.todayMatch.homeId}/image`} alt="" width={40} height={40} className="rounded-full" unoptimized />
                  <span className="text-xs font-semibold">{data.todayMatch.home}</span>
                </div>
                <div className="text-center">
                  {data.todayMatch.homeScore !== null ? (
                    <span className="text-2xl font-bold">{data.todayMatch.homeScore} - {data.todayMatch.awayScore}</span>
                  ) : (
                    <span className="text-lg font-bold text-text-muted">{data.todayMatch.time}</span>
                  )}
                  <div className="text-[10px] text-text-muted mt-1">{data.todayMatch.league}</div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Image src={`/img/team/${data.todayMatch.awayId}/image`} alt="" width={40} height={40} className="rounded-full" unoptimized />
                  <span className="text-xs font-semibold">{data.todayMatch.away}</span>
                </div>
              </div>
            </div>
          )}

          {/* News */}
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <h2 className="text-base font-bold text-text-primary mb-4">
              Noticias - {team.name}
            </h2>
            {data.news.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">Nenhuma noticia encontrada</p>
            ) : (
              <div className="space-y-3">
                {data.news.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/artigos/${article.slug}`}
                    className="block py-2 border-b border-border-light last:border-0 hover:text-green transition-colors"
                  >
                    <div className="text-sm font-semibold text-text-primary line-clamp-2">
                      {article.rewrittenTitle}
                    </div>
                    <div className="text-[11px] text-text-muted mt-1">
                      {new Date(article.pubDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Standing position */}
          {data.standingPosition && (
            <div className="bg-card-bg rounded-lg border border-border-custom p-4">
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-green" />
                Brasileirao 2026
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green">{data.standingPosition.pos}o</div>
                  <div className="text-xs text-text-muted">posicao</div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-sm"><span className="font-bold">{data.standingPosition.pts}</span> <span className="text-text-muted text-xs">pts</span></div>
                  <div className="text-sm"><span className="font-bold">{data.standingPosition.wins}</span> <span className="text-text-muted text-xs">V</span> <span className="font-bold">{data.standingPosition.draws}</span> <span className="text-text-muted text-xs">E</span> <span className="font-bold">{data.standingPosition.losses}</span> <span className="text-text-muted text-xs">D</span></div>
                  <div className="text-sm"><span className="font-bold">{data.standingPosition.gf}</span> <span className="text-text-muted text-xs">gols</span></div>
                </div>
              </div>
              <Link href="/futebol/brasileirao-serie-a" className="block text-center text-xs font-semibold text-green mt-3 hover:text-green-hover">
                Ver tabela completa &rarr;
              </Link>
            </div>
          )}

          {/* Upcoming matches */}
          <div className="bg-card-bg rounded-lg border border-border-custom">
            <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
              Proximos Jogos
            </h3>
            {data.upcomingMatches.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">Sem jogos agendados</p>
            ) : (
              <div className="divide-y divide-border-light">
                {data.upcomingMatches.slice(0, 5).map((m) => (
                  <div key={m.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate">{m.home}</span>
                      <span className="text-text-muted mx-1">vs</span>
                      <span className="font-semibold truncate text-right">{m.away}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5 flex justify-between">
                      <span>{m.league}</span>
                      <span>{m.date} {m.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Link href={`/futebol/times/${slug}/proximos-jogos`} className="block text-center text-xs font-semibold text-green py-3 border-t border-border-custom hover:bg-card-hover">
              Ver todos &rarr;
            </Link>
          </div>

          {/* Recent results */}
          <div className="bg-card-bg rounded-lg border border-border-custom">
            <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
              Resultados Recentes
            </h3>
            {data.recentMatches.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">Sem resultados</p>
            ) : (
              <div className="divide-y divide-border-light">
                {data.recentMatches.slice(0, 5).map((m) => (
                  <div key={m.id} className="px-4 py-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold truncate">{m.home}</span>
                      <span className="font-bold mx-1">{m.homeScore} - {m.awayScore}</span>
                      <span className="font-semibold truncate text-right">{m.away}</span>
                    </div>
                    <div className="text-[10px] text-text-muted mt-0.5">{m.league} - {m.date}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

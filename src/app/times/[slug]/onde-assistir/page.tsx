import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, TEAMS } from "@/lib/config";
import { getTeamPageData } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { Tv } from "lucide-react";

export const revalidate = 1800;

export async function generateStaticParams() {
  return TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `Onde Assistir ${team.name} Hoje - Transmissao Ao Vivo`,
    description: `Saiba onde assistir ao jogo do ${team.name} hoje ao vivo. TV, streaming e opcoes de transmissao.`,
  };
}

export default async function OndeAssistirPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const data = await getTeamPageData(slug);
  if (!data) notFound();

  const { todayMatch, upcomingMatches } = data;
  const match = todayMatch || upcomingMatches[0] || null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">
        Onde Assistir {team.name} Hoje
      </h2>

      {match ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <div className="text-center mb-6">
            <div className="text-xs font-bold text-green uppercase mb-3">{match.league}</div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <Image src={`/img/team/${match.homeId}/image`} alt="" width={44} height={44} className="rounded-full" unoptimized />
                <span className="text-sm font-semibold">{match.home}</span>
              </div>
              <div className="text-lg font-bold text-text-muted">
                {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : match.time}
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Image src={`/img/team/${match.awayId}/image`} alt="" width={44} height={44} className="rounded-full" unoptimized />
                <span className="text-sm font-semibold">{match.away}</span>
              </div>
            </div>
            <div className="text-xs text-text-muted mt-2">{match.date}</div>
          </div>

          <div className="border-t border-border-custom pt-4">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <Tv className="h-4 w-4 text-green" />
              Opcoes de Transmissao
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 bg-body rounded-lg">
                <div className="w-10 h-10 rounded bg-green/10 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-green" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Premiere</div>
                  <div className="text-xs text-text-muted">Pay-per-view - Brasileirao</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-body rounded-lg">
                <div className="w-10 h-10 rounded bg-blue/10 flex items-center justify-center">
                  <Tv className="h-5 w-5 text-blue" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-text-primary">Globoplay</div>
                  <div className="text-xs text-text-muted">Streaming</div>
                </div>
              </div>
              <p className="text-[11px] text-text-muted text-center mt-3">
                As informacoes de transmissao podem variar. Consulte o site oficial do campeonato para confirmacao.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum jogo proximo encontrado para o {team.name}.</p>
        </div>
      )}

      <div className="text-center">
        <Link href={`/times/${slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {team.name}
        </Link>
      </div>
    </div>
  );
}

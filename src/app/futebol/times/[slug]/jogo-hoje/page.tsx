import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamPageData } from "@/lib/data/team";
import { notFound } from "next/navigation";

export const revalidate = 1800;

export async function generateStaticParams() {
  return ALL_CLUSTER_TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `Jogo do ${team.name} Hoje - Horario e Placar`,
    description: `Veja se o ${team.name} joga hoje, horario do jogo, placar ao vivo e detalhes da partida.`,
  };
}

export default async function JogoHojePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const data = await getTeamPageData(slug);
  if (!data) notFound();

  const { todayMatch, upcomingMatches } = data;
  const nextMatch = upcomingMatches[0] || null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">
        Jogo do {team.name} Hoje
      </h2>

      {todayMatch ? (
        <div className="bg-card-bg rounded-lg border border-green p-6">
          <div className="text-center">
            <div className="text-xs font-bold text-green uppercase mb-4">{todayMatch.league}</div>
            <div className="flex items-center justify-center gap-8">
              <div className="flex flex-col items-center gap-2">
                <Image src={`/img/team/${todayMatch.homeId}/image`} alt="" width={56} height={56} className="rounded-full" unoptimized />
                <span className="text-sm font-bold">{todayMatch.home}</span>
              </div>
              <div className="text-center">
                {todayMatch.homeScore !== null ? (
                  <div className="text-4xl font-bold">{todayMatch.homeScore} - {todayMatch.awayScore}</div>
                ) : (
                  <div className="text-2xl font-bold text-text-muted">{todayMatch.time}</div>
                )}
                <div className="text-sm text-text-muted mt-1">{todayMatch.statusText}</div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Image src={`/img/team/${todayMatch.awayId}/image`} alt="" width={56} height={56} className="rounded-full" unoptimized />
                <span className="text-sm font-bold">{todayMatch.away}</span>
              </div>
            </div>
            {todayMatch.venue && (
              <div className="text-xs text-text-muted mt-4">{todayMatch.venue}</div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm mb-4">O {team.name} nao joga hoje.</p>
          {nextMatch && (
            <div>
              <p className="text-sm text-text-secondary mb-2">Proximo jogo:</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm font-semibold">{nextMatch.home}</span>
                <span className="text-text-muted">vs</span>
                <span className="text-sm font-semibold">{nextMatch.away}</span>
              </div>
              <p className="text-xs text-text-muted mt-1">{nextMatch.date} as {nextMatch.time} - {nextMatch.league}</p>
            </div>
          )}
        </div>
      )}

      <div className="text-center">
        <Link href={`/futebol/times/${slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {team.name}
        </Link>
      </div>
    </div>
  );
}

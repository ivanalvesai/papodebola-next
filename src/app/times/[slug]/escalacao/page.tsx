import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamPageData } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";

export const revalidate = 1800;

export async function generateStaticParams() {
  return ALL_CLUSTER_TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `Escalacao do ${team.name} Hoje - Provavel Escalacao`,
    description: `Confira a escalacao provavel do ${team.name} para o proximo jogo. Titulares, reservas e desfalques.`,
  };
}

export default async function EscalacaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const data = await getTeamPageData(slug);
  if (!data) notFound();

  const { todayMatch, upcomingMatches, topPlayers } = data;
  const match = todayMatch || upcomingMatches[0] || null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">
        Escalacao do {team.name}
      </h2>

      {match && (
        <div className="bg-card-bg rounded-lg border border-border-custom p-4">
          <div className="text-xs text-text-muted mb-2">Proximo jogo</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="font-semibold">{match.home}</span>
            <span className="text-text-muted">vs</span>
            <span className="font-semibold">{match.away}</span>
            <span className="text-text-muted">- {match.date} {match.time}</span>
          </div>
        </div>
      )}

      {/* Top players from statistics */}
      {topPlayers.length > 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-green" />
            Principais Jogadores - {team.name}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topPlayers.map((p) => (
              <div key={p.player.id} className="flex items-center gap-3 p-3 bg-body rounded-lg">
                <Image
                  src={`/img/player/${p.player.id}/image`}
                  alt={p.player.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                  unoptimized
                />
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">
                    {p.player.shortName || p.player.name}
                  </div>
                  <div className="text-[10px] text-text-muted">
                    {p.goals} gols
                    {p.rating ? ` | ${p.rating.toFixed(1)}` : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-text-muted text-center mt-4">
            A escalacao confirmada sera divulgada proximo ao horario do jogo.
            Os jogadores acima sao os destaques da temporada 2026.
          </p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">
            Escalacao do {team.name} ainda nao disponivel para esta temporada.
          </p>
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

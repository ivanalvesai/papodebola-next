import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamPageData } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { BarChart3, Trophy, Goal } from "lucide-react";

export const revalidate = 86400;

export async function generateStaticParams() {
  return ALL_CLUSTER_TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `Estatisticas do ${team.name} 2026 - Numeros e Desempenho`,
    description: `Estatisticas completas do ${team.name} na temporada 2026. Artilheiros, desempenho, classificacao e mais.`,
  };
}

export default async function EstatisticasPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const data = await getTeamPageData(slug);
  if (!data) notFound();

  const { standingPosition, topPlayers, recentMatches } = data;

  // Calculate stats from recent matches
  const wins = recentMatches.filter((m) => {
    const isHome = m.homeId === team.id;
    if (isHome) return (m.homeScore ?? 0) > (m.awayScore ?? 0);
    return (m.awayScore ?? 0) > (m.homeScore ?? 0);
  }).length;
  const losses = recentMatches.filter((m) => {
    const isHome = m.homeId === team.id;
    if (isHome) return (m.homeScore ?? 0) < (m.awayScore ?? 0);
    return (m.awayScore ?? 0) < (m.homeScore ?? 0);
  }).length;
  const draws = recentMatches.length - wins - losses;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-green" />
        Estatisticas do {team.name} - 2026
      </h2>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card-bg rounded-lg border border-border-custom p-4 text-center">
          <div className="text-2xl font-bold text-green">{standingPosition?.pos || "-"}o</div>
          <div className="text-xs text-text-muted">Posicao</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border-custom p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">{standingPosition?.pts || 0}</div>
          <div className="text-xs text-text-muted">Pontos</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border-custom p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">{standingPosition?.gf || 0}</div>
          <div className="text-xs text-text-muted">Gols Marcados</div>
        </div>
        <div className="bg-card-bg rounded-lg border border-border-custom p-4 text-center">
          <div className="text-2xl font-bold text-text-primary">
            {standingPosition ? (standingPosition.gd > 0 ? `+${standingPosition.gd}` : standingPosition.gd) : "0"}
          </div>
          <div className="text-xs text-text-muted">Saldo de Gols</div>
        </div>
      </div>

      {/* Brasileirão performance */}
      {standingPosition && (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green" />
            Desempenho no Brasileirao 2026
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 text-center">
            <div>
              <div className="text-lg font-bold">{standingPosition.matches}</div>
              <div className="text-[10px] text-text-muted uppercase">Jogos</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green">{standingPosition.wins}</div>
              <div className="text-[10px] text-text-muted uppercase">Vitorias</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange">{standingPosition.draws}</div>
              <div className="text-[10px] text-text-muted uppercase">Empates</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red">{standingPosition.losses}</div>
              <div className="text-[10px] text-text-muted uppercase">Derrotas</div>
            </div>
            <div>
              <div className="text-lg font-bold">{standingPosition.gf}</div>
              <div className="text-[10px] text-text-muted uppercase">Gols Pro</div>
            </div>
            <div>
              <div className="text-lg font-bold">{standingPosition.ga}</div>
              <div className="text-[10px] text-text-muted uppercase">Gols Contra</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent form */}
      {recentMatches.length > 0 && (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4">
            Forma Recente ({recentMatches.length} jogos)
          </h3>
          <div className="flex gap-2 mb-4">
            <span className="bg-green/10 text-green text-xs font-bold px-3 py-1 rounded-full">{wins}V</span>
            <span className="bg-orange/10 text-orange text-xs font-bold px-3 py-1 rounded-full">{draws}E</span>
            <span className="bg-red/10 text-red text-xs font-bold px-3 py-1 rounded-full">{losses}D</span>
          </div>
        </div>
      )}

      {/* Top scorers */}
      {topPlayers.length > 0 && (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Goal className="h-4 w-4 text-green" />
            Artilheiros do {team.name} em 2026
          </h3>
          <div className="space-y-2">
            {topPlayers.map((p, i) => (
              <div key={p.player.id} className="flex items-center gap-3 py-2 border-b border-border-light last:border-0">
                <span className={`w-6 text-center text-sm font-bold ${i < 3 ? "text-yellow-500" : "text-text-muted"}`}>
                  {i + 1}
                </span>
                <Image
                  src={`/img/player/${p.player.id}/image`}
                  alt={p.player.name}
                  width={36}
                  height={36}
                  className="rounded-full"
                  unoptimized
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{p.player.name}</div>
                  {p.rating && <div className="text-[10px] text-text-muted">Nota: {p.rating.toFixed(1)}</div>}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green">{p.goals}</div>
                  <div className="text-[10px] text-text-muted">gols</div>
                </div>
              </div>
            ))}
          </div>
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

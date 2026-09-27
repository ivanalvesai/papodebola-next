import Image from "next/image";
import Link from "next/link";
import { Users } from "lucide-react";
import type { TeamPageData, TeamLastLineup } from "@/lib/data/team";
import { buildTeamNarrative } from "@/lib/team-narrative";
import { TeamNarrativeSection, ProbableLineup } from "@/components/team/team-narrative";

// Página clássica "Escalação" do time. O XI do último jogo (lineup) é buscado por quem
// chama (rota do config ou TeamCmsView). Usada pelos times do config e pelos do CMS com
// a aba vazia.
export function ClassicTeamEscalacao({ data, lineup }: { data: TeamPageData; lineup: TeamLastLineup | null }) {
  const { todayMatch, upcomingMatches, topPlayers } = data;
  const match = todayMatch || upcomingMatches[0] || null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">
        Escalação do {data.name}
      </h2>

      {match && (
        <div className="bg-card-bg rounded-lg border border-border-custom p-4">
          <div className="text-xs text-text-muted mb-2">Próximo jogo</div>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="font-semibold">{match.home}</span>
            <span className="text-text-muted">vs</span>
            <span className="font-semibold">{match.away}</span>
            <span className="text-text-muted">- {match.date} {match.time}</span>
          </div>
        </div>
      )}

      <TeamNarrativeSection narrative={buildTeamNarrative(data, "escalacao", { lineup })} />

      <ProbableLineup lineup={lineup} />

      {/* Top players from statistics */}
      {topPlayers.length > 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
            <Users className="h-4 w-4 text-green" />
            Artilheiros {data.tournament ? `no ${data.tournament.name}` : "da temporada"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {topPlayers.map((p) => (
              <div key={p.player.id} className="flex items-center gap-3 p-3 bg-body rounded-lg">
                <Image
                  src={`/api/player-img/${p.player.id}`}
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
            A escalação oficial sai cerca de uma hora antes do jogo.
          </p>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">
            Ainda sem artilharia do {data.name} nesta temporada.
          </p>
        </div>
      )}

      <div className="text-center">
        <Link href={`/futebol/times/${data.slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {data.name}
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Tv } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { TeamPageData } from "@/lib/data/team";
import { buildTeamNarrative } from "@/lib/team-narrative";
import { TeamNarrativeSection, BroadcastChannels } from "@/components/team/team-narrative";

// Página clássica "Onde assistir" do time. Usada pelos times do config e pelos times do
// CMS com a aba vazia.
export function ClassicTeamOndeAssistir({ data }: { data: TeamPageData }) {
  const { todayMatch, upcomingMatches } = data;
  const match = todayMatch || upcomingMatches[0] || null;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary">
        Onde Assistir {data.name} Hoje
      </h2>

      {match ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-6">
          <div className="text-center mb-6">
            <div className="text-xs font-bold text-green uppercase mb-3">{match.league}</div>
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <TeamLogo teamId={match.homeId} size={44} />
                <span className="text-sm font-semibold">{match.home}</span>
              </div>
              <div className="text-lg font-bold text-text-muted">
                {match.homeScore !== null ? `${match.homeScore} - ${match.awayScore}` : match.time}
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <TeamLogo teamId={match.awayId} size={44} />
                <span className="text-sm font-semibold">{match.away}</span>
              </div>
            </div>
            <div className="text-xs text-text-muted mt-2">{match.date}</div>
          </div>

          <div className="border-t border-border-custom pt-4">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <Tv className="h-4 w-4 text-green" />
              Canais com os direitos
            </h3>
            <BroadcastChannels league={match.league} />
          </div>
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum jogo próximo encontrado para o {data.name}.</p>
        </div>
      )}

      <TeamNarrativeSection narrative={buildTeamNarrative(data, "ondeAssistir")} />

      <div className="text-center">
        <Link href={`/futebol/times/${data.slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {data.name}
        </Link>
      </div>
    </div>
  );
}

import Link from "next/link";
import { MatchHero } from "@/components/team/match-hero";
import { QuickAnswer } from "@/components/seo/quick-answer";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import type { TeamPageData } from "@/lib/data/team";
import { buildTeamNarrative } from "@/lib/team-narrative";
import { TeamNarrativeSection } from "@/components/team/team-narrative";

// Página clássica "Jogo de hoje" do time. Usada pelos times do config e pelos times do
// CMS com a aba vazia.
export function ClassicTeamJogoHoje({ data }: { data: TeamPageData }) {
  const { todayMatch, upcomingMatches } = data;
  const nextMatch = upcomingMatches[0] || null;

  // Frase de resposta direta (featured snippet + AI Overview) pra "{time} joga hoje?".
  const hasScore = todayMatch && todayMatch.homeScore !== null;
  const answer = todayMatch
    ? `Sim, o ${data.name} joga hoje: ${todayMatch.home} x ${todayMatch.away}${
        hasScore ? ` (${todayMatch.homeScore}-${todayMatch.awayScore})` : ""
      }, às ${todayMatch.time}${todayMatch.venue ? `, em ${todayMatch.venue}` : ""}, pela ${todayMatch.league}.`
    : nextMatch
      ? `Não, o ${data.name} não joga hoje. O próximo jogo é ${nextMatch.home} x ${nextMatch.away}, em ${nextMatch.date} às ${nextMatch.time}, pela ${nextMatch.league}.`
      : `O ${data.name} não tem jogo nos próximos dias confirmado.`;
  const schemaMatch = todayMatch || nextMatch;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      {schemaMatch && (
        <SportsEventSchema
          home={schemaMatch.home}
          away={schemaMatch.away}
          homeId={schemaMatch.homeId}
          awayId={schemaMatch.awayId}
          startTimestamp={schemaMatch.timestamp}
          statusType={schemaMatch.status}
          url={`/futebol/times/${data.slug}/jogo-hoje`}
        />
      )}

      <h2 className="text-lg font-bold text-text-primary">
        Jogo do {data.name} Hoje
      </h2>

      <QuickAnswer>{answer}</QuickAnswer>

      {todayMatch ? (
        <MatchHero
          match={todayMatch}
          label={todayMatch.status === "inprogress" ? "Jogo de hoje · ao vivo" : "Jogo de hoje"}
        />
      ) : nextMatch ? (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            O {data.name} não joga hoje. Confira o próximo compromisso:
          </p>
          <MatchHero match={nextMatch} label="Próximo jogo" />
        </div>
      ) : (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Sem jogo hoje e nenhum próximo jogo confirmado.</p>
        </div>
      )}

      <TeamNarrativeSection narrative={buildTeamNarrative(data, "jogoHoje")} />

      <div className="text-center">
        <Link href={`/futebol/times/${data.slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {data.name}
        </Link>
      </div>
    </div>
  );
}

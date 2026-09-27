import Link from "next/link";
import { Calendar } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { QuickAnswer } from "@/components/seo/quick-answer";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import { getTeamNextEvents, type TeamPageData } from "@/lib/data/team";
import { dropStaleUpcoming } from "@/lib/team-match-filters";
import { buildTeamNarrative } from "@/lib/team-narrative";
import { TeamNarrativeSection } from "@/components/team/team-narrative";

// Página clássica "Próximos jogos" do time. Busca a lista completa de próximos jogos
// (mesma chamada em cache usada por getTeamPageData). Usada pelos times do config e
// pelos times do CMS com a aba vazia.
export async function ClassicTeamProximos({ data }: { data: TeamPageData }) {
  const matches = dropStaleUpcoming(await getTeamNextEvents(data.id), Date.now() / 1000);
  const next = matches[0] || null;

  // Resposta direta pra "próximo jogo do {time}" (featured snippet + AI Overview).
  const answer = next
    ? `O próximo jogo do ${data.name} é ${next.home} x ${next.away}, em ${next.date} às ${next.time}${
        next.venue ? `, em ${next.venue}` : ""
      }, pela ${next.league}.`
    : `Ainda não há próximo jogo confirmado para o ${data.name}.`;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      {next && (
        <SportsEventSchema
          home={next.home}
          away={next.away}
          homeId={next.homeId}
          awayId={next.awayId}
          startTimestamp={next.timestamp}
          statusType={next.status}
          url={`/futebol/times/${data.slug}/proximos-jogos`}
        />
      )}

      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green" />
        Próximos Jogos do {data.name}
      </h2>

      <QuickAnswer>{answer}</QuickAnswer>

      {matches.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum jogo agendado encontrado.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {matches.map((m) => (
            <div key={m.id} className="bg-card-bg rounded-lg border border-border-custom p-4 hover:border-green transition-colors">
              <div className="flex items-center gap-4">
                {/* Date */}
                <div className="w-16 text-center shrink-0">
                  <div className="text-xs text-text-muted">{m.date}</div>
                  <div className="text-sm font-bold text-text-primary">{m.time}</div>
                </div>

                {/* Match */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <TeamLogo teamId={m.homeId} size={22} />
                    <span className="text-sm font-semibold text-text-primary truncate">{m.home}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <TeamLogo teamId={m.awayId} size={22} />
                    <span className="text-sm font-semibold text-text-primary truncate">{m.away}</span>
                  </div>
                </div>

                {/* League */}
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-semibold text-green uppercase">{m.league}</div>
                  {m.venue && <div className="text-[10px] text-text-muted mt-0.5">{m.venue}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <TeamNarrativeSection narrative={buildTeamNarrative(data, "proximos")} />

      <div className="text-center">
        <Link href={`/futebol/times/${data.slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {data.name}
        </Link>
      </div>
    </div>
  );
}

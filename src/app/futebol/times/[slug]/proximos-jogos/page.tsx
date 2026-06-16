import type { Metadata } from "next";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamNextEvents } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { QuickAnswer } from "@/components/seo/quick-answer";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";

export const revalidate = 43200;

export async function generateStaticParams() {
  return ALL_CLUSTER_TEAMS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) return {};
  return {
    title: `Proximos Jogos do ${team.name} - Calendario 2026`,
    description: `Calendario completo dos proximos jogos do ${team.name} em 2026. Datas, horarios, adversarios e campeonatos.`,
    alternates: { canonical: `/futebol/times/${slug}/proximos-jogos` },
  };
}

export default async function ProximosJogosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const matches = await getTeamNextEvents(team.id);
  const next = matches[0] || null;

  // Resposta direta pra "próximo jogo do {time}" (featured snippet + AI Overview).
  const answer = next
    ? `O próximo jogo do ${team.name} é ${next.home} x ${next.away}, em ${next.date} às ${next.time}${
        next.venue ? `, em ${next.venue}` : ""
      }, pela ${next.league}.`
    : `Ainda não há próximo jogo confirmado para o ${team.name}.`;

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
          url={`/futebol/times/${slug}/proximos-jogos`}
        />
      )}

      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green" />
        Proximos Jogos do {team.name}
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

      <div className="text-center">
        <Link href={`/futebol/times/${slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {team.name}
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TEAM_BY_SLUG, ALL_CLUSTER_TEAMS } from "@/lib/config";
import { getTeamNextEvents } from "@/lib/data/team";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";

export const revalidate = 3600;

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
  };
}

export default async function ProximosJogosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const team = TEAM_BY_SLUG[slug];
  if (!team) notFound();

  const matches = await getTeamNextEvents(team.id);

  return (
    <div className="mx-auto max-w-[800px] px-4 py-6 space-y-6">
      <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
        <Calendar className="h-5 w-5 text-green" />
        Proximos Jogos do {team.name}
      </h2>

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
                    <Image src={`/img/team/${m.homeId}/image`} alt="" width={22} height={22} className="rounded-full" unoptimized />
                    <span className="text-sm font-semibold text-text-primary truncate">{m.home}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Image src={`/img/team/${m.awayId}/image`} alt="" width={22} height={22} className="rounded-full" unoptimized />
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
        <Link href={`/times/${slug}`} className="text-sm text-green font-semibold hover:text-green-hover">
          &larr; Voltar para {team.name}
        </Link>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { getTodayMatches } from "@/lib/data/matches";
import Image from "next/image";
import { Radio } from "lucide-react";
import type { NormalizedMatch } from "@/types/match";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Jogos Ao Vivo - Placares em Tempo Real",
  description: "Acompanhe jogos de futebol ao vivo com placares em tempo real. Brasileirao, Copa do Brasil, Libertadores, Champions League e mais.",
};

export default async function AoVivoPage() {
  const matches = await getTodayMatches().catch(() => []);

  const live = matches.filter((m) => m.status === "live" || m.status === "halftime");
  const scheduled = matches.filter((m) => m.status === "scheduled");
  const finished = matches.filter((m) => m.status === "finished");

  // Group by league
  function groupByLeague(items: NormalizedMatch[]) {
    const groups: Record<string, NormalizedMatch[]> = {};
    for (const m of items) {
      const key = m.league || "Outros";
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    return Object.entries(groups);
  }

  function MatchCard({ m }: { m: (typeof matches)[0] }) {
    const isLive = m.status === "live" || m.status === "halftime";
    return (
      <div className={`flex items-center gap-3 py-3 px-4 ${isLive ? "bg-red-light" : ""}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm">
            {m.homeLogo && <Image src={m.homeLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />}
            <span className="font-semibold truncate">{m.homeTeam}</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-0.5">
            {m.awayLogo && <Image src={m.awayLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />}
            <span className="font-semibold truncate">{m.awayTeam}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          {m.homeScore !== null ? (
            <div className={`text-lg font-bold ${isLive ? "text-red" : ""}`}>
              {m.homeScore} - {m.awayScore}
            </div>
          ) : (
            <div className="text-sm font-semibold text-text-secondary">{m.time}</div>
          )}
          {isLive && (
            <div className="text-[10px] font-bold text-red flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
              {m.statusText}
            </div>
          )}
          {m.status === "finished" && (
            <div className="text-[10px] text-text-muted">Encerrado</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8">
      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Radio className="h-6 w-6 text-red" />
        Jogos de Hoje
      </h1>

      {matches.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted">Nenhum jogo encontrado para hoje</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Live */}
          {live.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-red overflow-hidden">
              <h2 className="text-sm font-bold text-red uppercase px-4 py-3 bg-red-light border-b border-red/20">
                Ao Vivo ({live.length})
              </h2>
              {groupByLeague(live).map(([league, games]) => (
                <div key={league}>
                  <div className="text-[10px] font-bold text-text-muted uppercase px-4 py-1.5 bg-body">{league}</div>
                  <div className="divide-y divide-border-light">
                    {games.map((m) => <MatchCard key={m.id} m={m} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduled */}
          {scheduled.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
              <h2 className="text-sm font-bold text-text-primary uppercase px-4 py-3 border-b border-border-custom">
                Agendados ({scheduled.length})
              </h2>
              {groupByLeague(scheduled).map(([league, games]) => (
                <div key={league}>
                  <div className="text-[10px] font-bold text-text-muted uppercase px-4 py-1.5 bg-body">{league}</div>
                  <div className="divide-y divide-border-light">
                    {games.map((m) => <MatchCard key={m.id} m={m} />)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Finished */}
          {finished.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
              <h2 className="text-sm font-bold text-text-muted uppercase px-4 py-3 border-b border-border-custom">
                Encerrados ({finished.length})
              </h2>
              {groupByLeague(finished).map(([league, games]) => (
                <div key={league}>
                  <div className="text-[10px] font-bold text-text-muted uppercase px-4 py-1.5 bg-body">{league}</div>
                  <div className="divide-y divide-border-light">
                    {games.map((m) => <MatchCard key={m.id} m={m} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

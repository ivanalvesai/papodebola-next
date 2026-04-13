"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Trophy, Loader2, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

interface Team {
  pos: number; name: string; pts: number; games: number;
  wins: number; draws: number; losses: number;
  gf: number; ga: number; gd: number; badge: string;
}

interface Group {
  name: string;
  teams: Team[];
}

interface Match {
  round: number; home: string; away: string;
  homeScore: number | null; awayScore: number | null;
  date: string; time: string; status: string;
  homeBadgeLocal: string; awayBadgeLocal: string;
}

interface Championship {
  name: string; city: string; state: string; year: string;
  groups: Group[]; matches: Match[];
  matchesByRound: Record<string, Match[]>; totalRounds: number; updatedAt: string;
}

export default function MunicipalPage() {
  const [data, setData] = useState<Championship[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(1);

  useEffect(() => {
    fetch("/api/municipal")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        if (d[0]?.totalRounds) setSelectedRound(Math.max(1, d[0].totalRounds));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-text-muted" /></div>;

  if (data.length === 0) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8 text-center">
        <Trophy className="h-12 w-12 text-text-muted mx-auto mb-3" />
        <h1 className="text-xl font-bold text-text-primary mb-2">Campeonatos Municipais</h1>
        <p className="text-text-muted">Dados ainda nao disponiveis. O scraper roda 2x por dia.</p>
      </div>
    );
  }

  const champ = data[0];
  const rounds = Object.keys(champ.matchesByRound).map(Number).sort((a, b) => a - b);
  const roundMatches = champ.matchesByRound[String(selectedRound)] || [];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-7 w-7 text-green" />
        <div>
          <h1 className="text-xl font-bold text-text-primary">{champ.name}</h1>
          <p className="text-xs text-text-muted flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {champ.city}/{champ.state} | Atualizado: {new Date(champ.updatedAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Groups + Matches grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Groups */}
        <div className="space-y-4">
          {champ.groups.map((group) => (
            <div key={group.name} className="bg-card-bg rounded-lg border border-border-custom">
              <h2 className="text-sm font-bold text-green px-4 py-3 border-b border-border-custom uppercase">
                {group.name}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-text-muted border-b border-border-light">
                      <th className="text-left py-2 px-3 font-semibold">#</th>
                      <th className="text-left py-2 px-2 font-semibold">Time</th>
                      <th className="py-2 px-1 font-semibold">P</th>
                      <th className="py-2 px-1 font-semibold">J</th>
                      <th className="py-2 px-1 font-semibold">V</th>
                      <th className="py-2 px-1 font-semibold">E</th>
                      <th className="py-2 px-1 font-semibold">D</th>
                      <th className="py-2 px-1 font-semibold">GP</th>
                      <th className="py-2 px-1 font-semibold">GC</th>
                      <th className="py-2 px-1 font-semibold">SG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.teams.map((t) => {
                      let border = "";
                      if (t.pos <= 2) border = "border-l-2 border-l-green";
                      else if (t.pos >= group.teams.length) border = "border-l-2 border-l-red";

                      return (
                        <tr key={`${group.name}-${t.pos}`} className={`border-b border-border-light last:border-0 hover:bg-card-hover ${border}`}>
                          <td className="py-2 px-3 font-semibold text-text-muted">{t.pos}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              {t.badge ? (
                                <Image src={t.badge} alt="" width={20} height={20} className="rounded-full" unoptimized />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-body" />
                              )}
                              <span className="font-semibold text-text-primary">{t.name}</span>
                            </div>
                          </td>
                          <td className="py-2 px-1 text-center font-bold">{t.pts}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.games}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.wins}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.draws}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.losses}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.gf}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.ga}</td>
                          <td className="py-2 px-1 text-center text-text-muted">{t.gd > 0 ? `+${t.gd}` : t.gd}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Matches by round */}
        <div className="bg-card-bg rounded-lg border border-border-custom h-fit">
          <div className="px-4 py-3 border-b border-border-custom">
            <div className="flex items-center justify-between bg-body rounded-lg px-3 py-2">
              <button
                onClick={() => setSelectedRound((r) => Math.max(rounds[0] || 0, r - 1))}
                disabled={selectedRound <= (rounds[0] || 0)}
                className="p-1 rounded hover:bg-border-light disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-semibold text-text-primary">
                Rodada {selectedRound}
              </span>
              <button
                onClick={() => setSelectedRound((r) => Math.min(rounds[rounds.length - 1] || 0, r + 1))}
                disabled={selectedRound >= (rounds[rounds.length - 1] || 0)}
                className="p-1 rounded hover:bg-border-light disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {roundMatches.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Nenhum jogo nesta rodada</p>
          ) : (
            <div className="divide-y divide-border-light">
              {roundMatches.map((m, i) => {
                const hasScore = m.homeScore !== null && m.awayScore !== null;
                return (
                  <div key={i} className="px-4 py-3">
                    {(m.date || m.status) && (
                      <div className="text-[10px] text-text-muted text-center mb-2">
                        {m.date && m.date} {m.time && `- ${m.time}`} {m.status && <span className="ml-1 text-green font-semibold">| {m.status}</span>}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <span className="text-xs font-semibold text-text-primary text-right truncate">{m.home}</span>
                        {m.homeBadgeLocal ? (
                          <Image src={m.homeBadgeLocal} alt="" width={24} height={24} className="rounded-full shrink-0" unoptimized />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-body shrink-0" />
                        )}
                      </div>
                      <div className="shrink-0 w-16 text-center">
                        {hasScore ? (
                          <span className="text-base font-bold text-text-primary">{m.homeScore} - {m.awayScore}</span>
                        ) : (
                          <span className="text-xs text-text-muted">{m.time || "vs"}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        {m.awayBadgeLocal ? (
                          <Image src={m.awayBadgeLocal} alt="" width={24} height={24} className="rounded-full shrink-0" unoptimized />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-body shrink-0" />
                        )}
                        <span className="text-xs font-semibold text-text-primary truncate">{m.away}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

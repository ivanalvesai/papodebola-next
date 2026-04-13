"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { RoundNav } from "@/components/championship/round-nav";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";
import type { ChampionshipData } from "@/types/tournament";
import type { StandingRow, FormResult } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";

export default function CampeonatoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const tournament = TOURNAMENT_BY_SLUG[slug];

  const [data, setData] = useState<ChampionshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(1);

  useEffect(() => {
    if (!tournament) return;
    setLoading(true);

    fetch(`/api/championship/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setSelectedRound(d.currentRound || 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, tournament]);

  if (!tournament) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8 text-center">
        <p className="text-text-muted">Campeonato nao encontrado</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8">
        <h1 className="text-xl font-bold text-text-primary mb-6">{tournament.name}</h1>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-8 bg-body rounded" />
              ))}
            </div>
          </div>
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-body rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enrich standings with form from already-loaded matches — zero extra requests
  const enriched = data
    ? enrichStandingsWithForm(data.standings || [], data.matchesByRound || {}, data.currentRound || 1)
    : [];
  const standings = enriched[0]?.rows || [];
  const roundMatches = data?.matchesByRound?.[selectedRound] || [];

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <h1 className="text-xl font-bold text-text-primary mb-6">{tournament.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Standings */}
        <div className="bg-card-bg rounded-lg border border-border-custom">
          <h2 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
            Classificacao
          </h2>
          {standings.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Classificacao indisponivel</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-text-muted border-b border-border-light">
                    <th className="text-left py-2 px-2 font-semibold w-8">#</th>
                    <th className="text-left py-2 px-2 font-semibold">Time</th>
                    <th className="py-2 px-1 font-semibold">P</th>
                    <th className="py-2 px-1 font-semibold">J</th>
                    <th className="py-2 px-1 font-semibold">V</th>
                    <th className="py-2 px-1 font-semibold">E</th>
                    <th className="py-2 px-1 font-semibold">D</th>
                    <th className="py-2 px-1 font-semibold">GP</th>
                    <th className="py-2 px-1 font-semibold">GC</th>
                    <th className="py-2 px-1 font-semibold">SG</th>
                    <th className="py-2 px-1 font-semibold text-center">Resultados</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((r: StandingRow) => {
                    let border = "";
                    if (r.pos <= 4) border = "border-l-2 border-l-green";
                    else if (r.pos <= 6) border = "border-l-2 border-l-orange";
                    else if (r.pos >= standings.length - 3) border = "border-l-2 border-l-red";

                    return (
                      <tr key={r.teamId} className={`border-b border-border-light last:border-0 hover:bg-card-hover ${border}`}>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-0.5">
                            <span className="font-semibold text-text-muted w-4 text-center">{r.pos}</span>
                            {r.posChange > 0 && <ChevronUp className="h-3 w-3 text-green" />}
                            {r.posChange < 0 && <ChevronDown className="h-3 w-3 text-red" />}
                            {r.posChange === 0 && <Minus className="h-2.5 w-2.5 text-text-muted opacity-30" />}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <div className="flex items-center gap-2">
                            <Image src={`/img/team/${r.teamId}/image`} alt="" width={18} height={18} className="rounded-full" unoptimized />
                            <span className="font-semibold text-text-primary">{r.team}</span>
                          </div>
                        </td>
                        <td className="py-2 px-1 text-center font-bold">{r.pts}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.matches}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.wins}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.draws}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.losses}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.gf}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.ga}</td>
                        <td className="py-2 px-1 text-center text-text-muted">{r.gd > 0 ? `+${r.gd}` : r.gd}</td>
                        <td className="py-2 px-1">
                          <div className="flex items-center justify-center gap-0.5">
                            {(r.recentForm || []).length > 0
                              ? (r.recentForm as FormResult[]).map((f: FormResult, i: number) => (
                                  <span key={i} className={`inline-block w-2.5 h-2.5 rounded-full ${f === "W" ? "bg-green" : f === "L" ? "bg-red" : "bg-text-muted"}`} title={f === "W" ? "Vitoria" : f === "L" ? "Derrota" : "Empate"} />
                                ))
                              : <span className="text-[9px] text-text-muted">-</span>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Matches by round */}
        <div className="bg-card-bg rounded-lg border border-border-custom">
          <div className="px-4 py-3 border-b border-border-custom">
            {data && (
              <RoundNav
                rounds={data.rounds}
                currentRound={data.currentRound}
                selectedRound={selectedRound}
                onRoundChange={setSelectedRound}
              />
            )}
          </div>

          {roundMatches.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Nenhum jogo nesta rodada</p>
          ) : (
            <div className="divide-y divide-border-light">
              {roundMatches.map((m: ChampionshipMatch) => {
                const dt = m.timestamp ? new Date(m.timestamp * 1000) : null;
                const hasScore = m.homeScore !== null;

                return (
                  <div key={m.id} className="px-4 py-3">
                    <div className="flex items-center gap-2 text-xs">
                      <Image src={`/img/team/${m.homeId}/image`} alt="" width={20} height={20} className="rounded-full" unoptimized />
                      <span className="font-semibold flex-1 truncate">{m.home}</span>
                      {hasScore ? (
                        <span className="font-bold text-sm">{m.homeScore}</span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <Image src={`/img/team/${m.awayId}/image`} alt="" width={20} height={20} className="rounded-full" unoptimized />
                      <span className="font-semibold flex-1 truncate">{m.away}</span>
                      {hasScore ? (
                        <span className="font-bold text-sm">{m.awayScore}</span>
                      ) : null}
                    </div>
                    <div className="text-[10px] text-text-muted mt-1">
                      {!hasScore && dt
                        ? `${dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })} ${dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}`
                        : translateStatus(m.statusDesc) || ""}
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

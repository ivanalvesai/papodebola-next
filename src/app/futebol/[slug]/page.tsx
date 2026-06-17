"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { TOURNAMENT_BY_SLUG, TEAM_BY_ID } from "@/lib/config";
import { matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { RoundNav } from "@/components/championship/round-nav";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TeamLogo } from "@/components/ui/team-logo";
import { ChevronUp, ChevronDown, Minus, ChevronRight } from "lucide-react";
import type { ChampionshipData } from "@/types/tournament";
import type { StandingRow, FormResult } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";
import type { ChampionshipLiveScore } from "@/lib/data/championship";

export default function CampeonatoPage() {
  const params = useParams();
  const slug = params.slug as string;
  const tournament = TOURNAMENT_BY_SLUG[slug];

  const [data, setData] = useState<ChampionshipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState(1);
  // Placar/status ao vivo da rodada atual (polling 30s) → selo AO VIVO + placar na tabela.
  const [liveScores, setLiveScores] = useState<Record<number, ChampionshipLiveScore>>({});

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

  // Polling do placar ao vivo (igual à Copa). O endpoint cacheia ~20s → N clientes = 1 chamada.
  useEffect(() => {
    if (!tournament) return;
    let active = true;
    const poll = async () => {
      try {
        const r = await fetch(`/api/championship/${slug}/ao-vivo`, { cache: "no-store" });
        if (!r.ok || !active) return;
        const arr: ChampionshipLiveScore[] = await r.json();
        const map: Record<number, ChampionshipLiveScore> = {};
        for (const s of arr) map[s.id] = s;
        if (active) setLiveScores(map);
      } catch {
        /* silencioso: não trava a tabela */
      }
    };
    poll();
    const iv = setInterval(poll, 30000);
    return () => {
      active = false;
      clearInterval(iv);
    };
  }, [slug, tournament]);

  if (!tournament) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8 text-center">
        <p className="text-text-muted">Campeonato não encontrado</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8">
        <PageBreadcrumb
          className="mb-4"
          items={[
            { label: "Início", href: "/" },
            { label: "Futebol", href: "/futebol" },
            { label: tournament.name },
          ]}
        />
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
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: tournament.name },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-6">{tournament.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        {/* Standings */}
        <div className="bg-card-bg rounded-lg border border-border-custom">
          <h2 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">
            Classificacao
          </h2>
          {standings.length === 0 ? (
            <p className="text-text-muted text-sm text-center py-6">Classificação indisponível</p>
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
                          {TEAM_BY_ID[r.teamId] ? (
                            <Link
                              href={`/futebol/times/${TEAM_BY_ID[r.teamId].slug}`}
                              className="flex items-center gap-2 hover:text-green"
                            >
                              <TeamLogo teamId={r.teamId} size={18} />
                              <span className="font-semibold text-text-primary">{r.team}</span>
                            </Link>
                          ) : (
                            <div className="flex items-center gap-2">
                              <TeamLogo teamId={r.teamId} size={18} />
                              <span className="font-semibold text-text-primary">{r.team}</span>
                            </div>
                          )}
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
                              ? ([...(r.recentForm as FormResult[])].reverse()).map((f: FormResult, i: number) => (
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
                // Override ao vivo (placar/status) vindo do polling; cai pro dado estático se ausente.
                const live = liveScores[m.id];
                const statusType = live?.statusType || m.status;
                const isLive = statusType === "inprogress";
                const isFinished = statusType === "finished";
                const homeScore = live?.homeScore ?? m.homeScore;
                const awayScore = live?.awayScore ?? m.awayScore;
                const statusDesc = live?.statusDesc || m.statusDesc;
                const started = homeScore !== null && awayScore !== null;
                const dtStr = m.timestamp
                  ? new Date(m.timestamp * 1000).toLocaleString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "America/Sao_Paulo",
                    })
                  : "";
                const jogoHref = `/futebol/${slug}/jogo/${matchDateSlug(m.timestamp)}/${matchPairSlug(m.homeId, m.awayId, m.home, m.away)}`;

                return (
                  <Link key={m.id} href={jogoHref} className="block px-3 py-2.5 transition-colors hover:bg-card-hover">
                    <div className="mb-1.5 text-center text-[11px] text-text-muted">{dtStr}</div>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                      <div className="flex min-w-0 items-center justify-end gap-1.5">
                        <span className="truncate text-xs font-semibold text-text-primary">{m.home}</span>
                        <TeamLogo teamId={m.homeId} size={24} />
                      </div>
                      <span
                        className={`min-w-[56px] shrink-0 whitespace-nowrap px-2 text-center text-sm font-bold ${
                          isLive ? "text-red" : "text-text-primary"
                        }`}
                      >
                        {started ? `${homeScore} X ${awayScore}` : "X"}
                      </span>
                      <div className="flex min-w-0 items-center gap-1.5">
                        <TeamLogo teamId={m.awayId} size={24} />
                        <span className="truncate text-xs font-semibold text-text-primary">{m.away}</span>
                      </div>
                    </div>

                    {isLive && (
                      <div className="mt-1.5 flex justify-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-1 text-[11px] font-bold text-white">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
                          AO VIVO {statusDesc && <span className="font-semibold">&middot; {statusDesc}</span>}
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                    {isFinished && (
                      <div className="mt-1.5 flex justify-center">
                        <span className="inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/10 px-2.5 py-1 text-[11px] font-bold text-green">
                          Veja como foi
                          <ChevronRight className="h-3 w-3" />
                        </span>
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

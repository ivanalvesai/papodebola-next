"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { worldCupMatchHref } from "@/lib/world-cup-match-url";
import { useLiveScore } from "./copa-live-provider";
import type { WorldCupGroup } from "@/lib/data/world-cup";
import type { ChampionshipMatch } from "@/types/match";
import type { StandingRow, FormResult } from "@/types/standings";

// Brasil nao tem horario de verao desde 2019 -> America/Sao_Paulo = UTC-3 fixo.
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
function br(ts: number) {
  const d = new Date((ts - 3 * 3600) * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}`,
    time: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`,
    wd: WD[d.getUTCDay()],
  };
}

function FormDots({ form }: { form: FormResult[] }) {
  if (!form.length) return <span className="text-[11px] text-text-muted">-</span>;
  return (
    <div className="flex items-center justify-center gap-0.5">
      {[...form].reverse().map((f, i) => (
        <span
          key={i}
          className={`inline-block w-2.5 h-2.5 rounded-full ${
            f === "W" ? "bg-green" : f === "L" ? "bg-red" : "bg-text-muted"
          }`}
          title={f === "W" ? "Vitória" : f === "L" ? "Derrota" : "Empate"}
        />
      ))}
    </div>
  );
}

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-text-muted border-b border-border-light">
            <th className="text-left py-2 px-3 font-semibold">Seleção</th>
            <th className="py-2 px-1.5 font-semibold">P</th>
            <th className="py-2 px-1.5 font-semibold">J</th>
            <th className="py-2 px-1.5 font-semibold">V</th>
            <th className="py-2 px-1.5 font-semibold">E</th>
            <th className="py-2 px-1.5 font-semibold">D</th>
            <th className="py-2 px-1.5 font-semibold">GP</th>
            <th className="py-2 px-1.5 font-semibold">GC</th>
            <th className="py-2 px-1.5 font-semibold">SG</th>
            <th className="py-2 px-1.5 font-semibold">%</th>
            <th className="py-2 px-3 font-semibold text-center whitespace-nowrap">Últ. jogos</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 4).map((r, i) => {
            const aprov = r.matches > 0 ? Math.round((r.pts / (r.matches * 3)) * 100) : null;
            return (
              <tr
                key={r.teamId || i}
                className={`border-b border-border-light last:border-0 ${
                  (r.pos || i + 1) <= 2 ? "border-l-4 border-l-green" : "border-l-4 border-l-transparent"
                }`}
              >
                <td className="py-2.5 px-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-center text-xs font-bold text-text-muted">
                      {r.pos || i + 1}
                    </span>
                    <TeamLogo teamId={r.teamId} size={26} />
                    <span className="font-semibold text-text-primary truncate">{r.team}</span>
                  </div>
                </td>
                <td className="py-2.5 px-1.5 text-center font-bold text-text-primary">{r.pts}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.matches}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.wins}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.draws}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.losses}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.gf}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">{r.ga}</td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">
                  {r.gd > 0 ? `+${r.gd}` : r.gd}
                </td>
                <td className="py-2.5 px-1.5 text-center text-text-muted">
                  {aprov === null ? "-" : `${aprov}%`}
                </td>
                <td className="py-2.5 px-3">
                  <FormDots form={r.recentForm} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function MatchMini({ m }: { m: ChampionshipMatch }) {
  // Override ao vivo (placar/status) vindo do polling; cai pro dado estático se ausente.
  const ls = useLiveScore(m.id);
  const statusType = ls?.statusType || m.status;
  const isLive = statusType === "inprogress" || statusType === "interrupted";
  const isFinished = statusType === "finished";
  const homeScore = ls?.homeScore ?? m.homeScore;
  const awayScore = ls?.awayScore ?? m.awayScore;
  const statusDesc = ls?.statusDesc || m.statusDesc;
  const started = homeScore !== null && awayScore !== null;
  const t = br(m.timestamp);
  const href = worldCupMatchHref(m.timestamp, m.homeId, m.awayId, m.home, m.away);

  return (
    <div className="border-b border-border-light last:border-0">
      {/* Confronto inteiro clicável -> página do jogo */}
      <Link href={href} className="block px-3 py-2.5 transition-colors hover:bg-body/60">
        <div className="mb-1.5 text-center text-[11px] text-text-muted">
          {t.wd}, {t.date} &middot; {t.time}
        </div>
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

        {/* Selo AO VIVO (atualiza placar e linka pra página) */}
        {isLive && (
          <div className="mt-1.5 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-1 text-[11px] font-bold text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              AO VIVO {statusDesc && <span className="font-semibold">&middot; {statusDesc}</span>}
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        )}

        {/* "Veja como foi": assim que o jogo termina, sinaliza que dá pra clicar
            e ver o lance a lance / estatísticas do jogo. */}
        {isFinished && (
          <div className="mt-1.5 flex justify-center">
            <span className="inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/10 px-2.5 py-1 text-[11px] font-bold text-green">
              Veja como foi
              <ChevronRight className="h-3 w-3" />
            </span>
          </div>
        )}
      </Link>
    </div>
  );
}

export function GroupRow({ group }: { group: WorldCupGroup }) {
  const rounds = group.rounds;
  // abre na rodada "atual" do grupo (proximo jogo), nao trava na rodada 1
  const initial = Math.max(
    0,
    rounds.findIndex((r) => r.round === group.defaultRound)
  );
  const [idx, setIdx] = useState(initial);
  const current = rounds[idx] ?? rounds[0];
  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(rounds.length - 1, i + 1));
  const atFirst = idx === 0;
  const atLast = idx === rounds.length - 1;

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden flex flex-col lg:flex-row">
      {/* Classificação do grupo — cabeçalho verde, igual ao da rodada */}
      <div className="flex-1 min-w-0 lg:border-r border-border-custom">
        <h3 className="h-12 flex items-center text-base font-bold text-white px-4 bg-green">
          {group.name}
        </h3>
        <StandingsTable rows={group.rows} />
      </div>

      {/* Rodada do grupo com setas pra voltar/avançar */}
      <div className="w-full lg:w-[300px] shrink-0 flex flex-col border-t lg:border-t-0 border-border-custom">
        <div className="h-12 flex items-center justify-between gap-1 px-3 bg-green text-white">
          <button
            type="button"
            onClick={prev}
            disabled={atFirst}
            aria-label="Rodada anterior"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold whitespace-nowrap">{current.round}ª Rodada</span>
          <button
            type="button"
            onClick={next}
            disabled={atLast}
            aria-label="Próxima rodada"
            className="flex items-center justify-center w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          {current.matches.length === 0 ? (
            <p className="text-text-muted text-xs text-center py-5 px-2">Jogos a definir</p>
          ) : (
            current.matches.map((m) => <MatchMini key={m.id} m={m} />)
          )}
        </div>
      </div>
    </div>
  );
}

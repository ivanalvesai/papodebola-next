"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { WorldCupGroup } from "@/lib/data/world-cup";
import type { ChampionshipMatch } from "@/types/match";
import type { StandingRow } from "@/types/standings";

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

function StandingsTable({ rows }: { rows: StandingRow[] }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-text-muted border-b border-border-light">
          <th className="text-left py-1.5 px-2 font-semibold">Seleção</th>
          <th className="py-1.5 px-1 font-semibold w-6">P</th>
          <th className="py-1.5 px-1 font-semibold w-6">J</th>
          <th className="py-1.5 px-1 font-semibold w-7">SG</th>
        </tr>
      </thead>
      <tbody>
        {rows.slice(0, 4).map((r, i) => (
          <tr
            key={r.teamId || i}
            className={`border-b border-border-light last:border-0 ${
              (r.pos || i + 1) <= 2 ? "border-l-2 border-l-green" : ""
            }`}
          >
            <td className="py-1.5 px-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 text-center text-[10px] font-semibold text-text-muted">
                  {r.pos || i + 1}
                </span>
                <TeamLogo teamId={r.teamId} size={18} />
                <span className="font-semibold text-text-primary truncate">{r.team}</span>
              </div>
            </td>
            <td className="py-1.5 px-1 text-center font-bold text-text-primary">{r.pts}</td>
            <td className="py-1.5 px-1 text-center text-text-muted">{r.matches}</td>
            <td className="py-1.5 px-1 text-center text-text-muted">
              {r.gd > 0 ? `+${r.gd}` : r.gd}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatchMini({ m }: { m: ChampionshipMatch }) {
  const finished = m.homeScore !== null && m.awayScore !== null;
  const t = br(m.timestamp);
  return (
    <div className="py-2 px-2 border-b border-border-light last:border-0">
      <div className="text-[10px] text-text-muted text-center mb-1">
        {t.wd}, {t.date} &middot; {t.time}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1">
        <div className="flex items-center justify-end gap-1 min-w-0">
          <span className="hidden sm:inline text-[11px] font-semibold text-text-primary truncate">
            {m.home}
          </span>
          <TeamLogo teamId={m.homeId} size={18} />
        </div>
        <span className="text-xs font-bold text-text-primary px-1 whitespace-nowrap">
          {finished ? `${m.homeScore} x ${m.awayScore}` : "x"}
        </span>
        <div className="flex items-center gap-1 min-w-0">
          <TeamLogo teamId={m.awayId} size={18} />
          <span className="hidden sm:inline text-[11px] font-semibold text-text-primary truncate">
            {m.away}
          </span>
        </div>
      </div>
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
    <div className="bg-card-bg rounded-lg border border-border-custom overflow-hidden flex">
      {/* Classificação do grupo (esquerda) — cabeçalho verde, igual ao da rodada */}
      <div className="flex-1 min-w-0 border-r border-border-custom">
        <h3 className="text-sm font-bold text-white px-3 py-2.5 bg-green">{group.name}</h3>
        <StandingsTable rows={group.rows} />
      </div>

      {/* Rodada do grupo (direita) com setas pra voltar/avançar */}
      <div className="w-[120px] sm:w-[280px] shrink-0 flex flex-col">
        <div className="flex items-center justify-between gap-1 px-2 py-2 bg-green text-white">
          <button
            type="button"
            onClick={prev}
            disabled={atFirst}
            aria-label="Rodada anterior"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold whitespace-nowrap">{current.round}ª Rodada</span>
          <button
            type="button"
            onClick={next}
            disabled={atLast}
            aria-label="Próxima rodada"
            className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-30 disabled:cursor-default"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex-1">
          {current.matches.length === 0 ? (
            <p className="text-text-muted text-[11px] text-center py-4 px-2">Jogos a definir</p>
          ) : (
            current.matches.map((m) => <MatchMini key={m.id} m={m} />)
          )}
        </div>
      </div>
    </div>
  );
}

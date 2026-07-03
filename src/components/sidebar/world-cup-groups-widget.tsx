import Link from "next/link";
import { Trophy } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { StandingsGroup } from "@/types/standings";
import type { WorldCupPhase } from "@/lib/world-cup-phases";
import type { KnockoutItem } from "@/lib/world-cup-knockout-schedule";
import type { ChampionshipMatch } from "@/types/match";

interface WorldCupGroupsWidgetProps {
  groups: StandingsGroup[];
  /** Fase atual da Copa (por data). Se != grupos e houver confrontos, mostra o mata-mata. */
  phase?: WorldCupPhase;
  knockout?: KnockoutItem[];
}

function GroupTable({ group }: { group: StandingsGroup }) {
  const rows = group.rows.slice(0, 4);
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-text-primary mb-1 px-1">
        {group.name}
      </div>
      <div className="space-y-px">
        {rows.map((r, i) => {
          // 2 primeiros de cada grupo avançam — destaque verde
          const qualifies = (r.pos || i + 1) <= 2;
          return (
            <div
              key={r.teamId || i}
              className={`flex items-center gap-1.5 py-1 pr-1 rounded-sm ${
                qualifies ? "border-l-2 border-l-green pl-1.5" : "pl-2"
              }`}
            >
              <span className="w-3 text-center text-[10px] font-semibold text-text-muted">
                {r.pos || i + 1}
              </span>
              <TeamLogo teamId={r.teamId} size={16} />
              <span className="flex-1 truncate text-[11px] font-semibold text-text-primary">
                {r.team}
              </span>
              <span className="w-4 text-center text-[10px] text-text-muted">{r.matches}</span>
              <span className="w-4 text-center text-[11px] font-bold text-text-primary">{r.pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// horário curto do confronto (Brasília) enquanto não começou; senão o placar.
function kickoff(ts?: number): string {
  if (!ts) return "x";
  try {
    return new Date(ts * 1000)
      .toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", " ·")
      .replace(":", "h");
  } catch {
    return "x";
  }
}

function KnockoutRow({ item }: { item: KnockoutItem }) {
  if (item.kind === "real") {
    const m: ChampionshipMatch = item.match;
    const started = m.homeScore != null && m.awayScore != null;
    const pens = m.homePens != null && m.awayPens != null;
    const middle = started ? (
      <span className="whitespace-nowrap px-1 text-[13px] font-bold tabular-nums text-text-primary">
        {pens && <span className="text-[10px] font-semibold text-text-muted">({m.homePens}) </span>}
        {m.homeScore}-{m.awayScore}
        {pens && <span className="text-[10px] font-semibold text-text-muted"> ({m.awayPens})</span>}
      </span>
    ) : (
      <span className="whitespace-nowrap px-1 text-[11px] font-semibold text-text-muted">{kickoff(m.timestamp)}</span>
    );
    return (
      <div className="flex items-center gap-1.5 py-1.5">
        <TeamLogo teamId={m.homeId} size={18} />
        <span className="flex-1 truncate text-[13px] font-semibold text-text-primary">{m.home}</span>
        {middle}
        <span className="flex-1 truncate text-right text-[13px] font-semibold text-text-primary">{m.away}</span>
        <TeamLogo teamId={m.awayId} size={18} />
      </div>
    );
  }
  // placeholder: times ainda não definidos → mostra os rótulos dos slots
  const s = item.sched;
  return (
    <div className="flex items-center gap-1.5 py-1.5 text-[12px] text-text-muted">
      <span className="flex-1 truncate text-right">{s.homeSlot}</span>
      <span className="px-1">×</span>
      <span className="flex-1 truncate">{s.awaySlot}</span>
    </div>
  );
}

export function WorldCupGroupsWidget({ groups, phase, knockout }: WorldCupGroupsWidgetProps) {
  const isKnockout = !!phase && phase.slug !== "grupos" && !!knockout && knockout.length > 0;

  // Card inteiro é clicável → um único <Link> externo (nada de <a> aninhado).
  const href = isKnockout ? phase!.href : "/futebol/copa-do-mundo";

  if (isKnockout) {
    return (
      <Link
        href={href}
        className="block bg-card-bg rounded-lg border border-border-custom hover:border-green/50 transition-colors"
      >
        <div className="px-4 py-3 border-b border-border-custom">
          <div className="text-sm font-bold text-text-primary flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green" />
            Copa do Mundo 2026
          </div>
          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-green">
            {phase!.longLabel}
          </div>
        </div>

        <div className="px-4 py-2 divide-y divide-border-light lg:max-h-[620px] lg:overflow-y-auto">
          {knockout!.map((it, i) => (
            <KnockoutRow key={it.kind === "real" ? it.match.id : `p${it.sched.game}-${i}`} item={it} />
          ))}
        </div>

        <div className="text-center text-xs font-semibold text-green py-3 border-t border-border-custom">
          Ver {phase!.longLabel} e chaveamento &rarr;
        </div>
      </Link>
    );
  }

  if (groups.length === 0) return null;

  return (
    <Link
      href={href}
      className="block bg-card-bg rounded-lg border border-border-custom hover:border-green/50 transition-colors"
    >
      <div className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom flex items-center gap-2">
        <Trophy className="h-4 w-4 text-green" />
        Copa do Mundo 2026
      </div>

      {/* J = jogos, P = pontos · verde = classificados (2 primeiros) */}
      <div className="px-4 pt-2 text-[10px] text-text-muted flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-green" /> classificam
        </span>
        <span>J = jogos &middot; P = pontos</span>
      </div>

      {/* 2 colunas no celular (full width), 1 coluna no sidebar do desktop. */}
      <div className="p-3 grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3 lg:max-h-[620px] lg:overflow-y-auto">
        {groups.map((g) => (
          <GroupTable key={g.name} group={g} />
        ))}
      </div>

      <div className="text-center text-xs font-semibold text-green py-3 border-t border-border-custom">
        Ver classificacao completa e jogos &rarr;
      </div>
    </Link>
  );
}

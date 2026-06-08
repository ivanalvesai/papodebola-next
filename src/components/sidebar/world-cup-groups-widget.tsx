import Link from "next/link";
import { Trophy } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import type { StandingsGroup } from "@/types/standings";

interface WorldCupGroupsWidgetProps {
  groups: StandingsGroup[];
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
              <span className="w-4 text-center text-[10px] text-text-muted">
                {r.matches}
              </span>
              <span className="w-4 text-center text-[11px] font-bold text-text-primary">
                {r.pts}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function WorldCupGroupsWidget({ groups }: WorldCupGroupsWidgetProps) {
  if (groups.length === 0) return null;

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom">
      <Link
        href="/futebol/copa-do-mundo"
        className="block text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom flex items-center gap-2 hover:bg-card-hover transition-colors"
      >
        <Trophy className="h-4 w-4 text-green" />
        Copa do Mundo 2026 &middot; Grupos
      </Link>

      {/* J = jogos, P = pontos · verde = classificados (2 primeiros) */}
      <div className="px-4 pt-2 text-[10px] text-text-muted flex items-center gap-3">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-sm bg-green" /> classificam
        </span>
        <span>J = jogos &middot; P = pontos</span>
      </div>

      {/* 2 colunas no celular (full width), 1 coluna no sidebar do desktop.
          Cada instância só aparece no seu breakpoint (ver page.tsx). */}
      <div className="p-3 grid grid-cols-2 lg:grid-cols-1 gap-x-4 gap-y-3 lg:max-h-[620px] lg:overflow-y-auto">
        {groups.map((g) => (
          <GroupTable key={g.name} group={g} />
        ))}
      </div>

      <Link
        href="/futebol/copa-do-mundo"
        className="block text-center text-xs font-semibold text-green py-3 border-t border-border-custom hover:bg-card-hover transition-colors"
      >
        Ver classificacao completa e jogos &rarr;
      </Link>
    </div>
  );
}

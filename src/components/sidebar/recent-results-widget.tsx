import { History } from "lucide-react";
import type { NormalizedMatch } from "@/types/match";

interface RecentResultsWidgetProps {
  matches: NormalizedMatch[];
}

export function RecentResultsWidget({ matches }: RecentResultsWidgetProps) {
  const finished = matches.filter((m) => m.status === "finished").slice(0, 6);

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom">
      <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom flex items-center gap-2">
        <History className="h-4 w-4 text-green" />
        Ultimos Resultados
      </h3>

      {finished.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          Nenhum resultado recente
        </p>
      ) : (
        <div className="divide-y divide-border-light">
          {finished.map((g) => (
            <div key={g.id} className="px-4 py-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-primary font-semibold truncate flex-1">
                  {g.homeTeam}
                </span>
                <span className="font-bold text-text-primary mx-2 shrink-0">
                  {g.homeScore} - {g.awayScore}
                </span>
                <span className="text-text-primary font-semibold truncate flex-1 text-right">
                  {g.awayTeam}
                </span>
              </div>
              <div className="text-[10px] text-text-muted text-center mt-0.5">
                {g.league}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

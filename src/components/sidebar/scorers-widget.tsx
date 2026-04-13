import Image from "next/image";
import { Goal } from "lucide-react";
import type { Scorer } from "@/types/team";

interface ScorersWidgetProps {
  scorers: Scorer[];
}

export function ScorersWidget({ scorers }: ScorersWidgetProps) {
  return (
    <div className="bg-card-bg rounded-lg border border-border-custom">
      <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom flex items-center gap-2">
        <Goal className="h-4 w-4 text-green" />
        Artilheiros - Brasileirao
      </h3>

      {scorers.length === 0 ? (
        <p className="text-text-muted text-sm text-center py-6">
          Artilharia indisponivel
        </p>
      ) : (
        <div className="divide-y divide-border-light">
          {scorers.slice(0, 8).map((item, i) => (
            <div
              key={item.player.id}
              className="flex items-center gap-3 px-4 py-2.5"
            >
              <span
                className={`w-5 text-center text-xs font-bold ${
                  i < 3 ? "text-yellow-500" : "text-text-muted"
                }`}
              >
                {i + 1}
              </span>

              <div className="w-9 h-9 rounded-full bg-body overflow-hidden shrink-0">
                <Image
                  src={`/img/player/${item.player.id}/image`}
                  alt={item.player.name}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {item.player.name}
                </div>
                <div className="text-[10px] text-text-muted">
                  {item.team.name}
                </div>
              </div>

              <span className="text-sm font-bold text-green">
                {item.goals}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

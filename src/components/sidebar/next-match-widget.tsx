import Image from "next/image";
import type { ChampionshipMatch } from "@/types/match";

interface NextMatchWidgetProps {
  match: ChampionshipMatch | null;
}

export function NextMatchWidget({ match }: NextMatchWidgetProps) {
  if (!match) return null;

  const dt = new Date(match.timestamp * 1000);
  const dateStr = dt.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const timeStr = dt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
  const diff = match.timestamp * 1000 - Date.now();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const countdown =
    days > 0 ? `Em ${days}d ${hours}h` : hours > 0 ? `Em ${hours}h` : "Hoje";

  return (
    <div className="bg-card-bg rounded-lg border border-border-custom p-4">
      <div className="text-[10px] font-bold text-green uppercase text-center mb-3">
        Brasileirao Serie A
      </div>

      <div className="flex items-center justify-center gap-4">
        {/* Home */}
        <div className="flex flex-col items-center gap-1.5">
          {match.homeId && (
            <Image
              src={`/img/team/${match.homeId}/image`}
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
          )}
          <span className="text-xs font-semibold text-text-primary text-center">
            {match.home}
          </span>
        </div>

        <span className="text-lg font-bold text-text-muted">&times;</span>

        {/* Away */}
        <div className="flex flex-col items-center gap-1.5">
          {match.awayId && (
            <Image
              src={`/img/team/${match.awayId}/image`}
              alt=""
              width={40}
              height={40}
              className="rounded-full"
              unoptimized
            />
          )}
          <span className="text-xs font-semibold text-text-primary text-center">
            {match.away}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <div className="text-xs text-text-secondary">
          {dateStr} as {timeStr}
        </div>
        <div className="text-sm font-bold text-green mt-0.5">{countdown}</div>
      </div>
    </div>
  );
}

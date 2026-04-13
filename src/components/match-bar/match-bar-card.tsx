import Image from "next/image";

interface MatchBarCardProps {
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  status: string;
  statusText: string;
  league: string;
}

export function MatchBarCard({
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  time,
  status,
  statusText,
  league,
}: MatchBarCardProps) {
  const isLive = status === "live";
  const isFinished = status === "finished";
  const hasScore = homeScore !== null && awayScore !== null;

  return (
    <div
      className={`flex-shrink-0 w-[180px] bg-card-bg rounded-lg border p-3 ${
        isLive ? "border-red" : "border-border-custom"
      }`}
    >
      {/* League */}
      <div className="text-[10px] text-text-muted font-semibold truncate mb-2 uppercase">
        {league}
      </div>

      {/* Teams */}
      <div className="space-y-1.5">
        {/* Home */}
        <div className="flex items-center gap-2">
          {homeLogo ? (
            <Image
              src={homeLogo}
              alt=""
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-body" />
          )}
          <span className="text-xs font-semibold text-text-primary truncate flex-1">
            {homeTeam}
          </span>
          {hasScore && (
            <span className={`text-sm font-bold ${isLive ? "text-red" : "text-text-primary"}`}>
              {homeScore}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2">
          {awayLogo ? (
            <Image
              src={awayLogo}
              alt=""
              width={20}
              height={20}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-body" />
          )}
          <span className="text-xs font-semibold text-text-primary truncate flex-1">
            {awayTeam}
          </span>
          {hasScore && (
            <span className={`text-sm font-bold ${isLive ? "text-red" : "text-text-primary"}`}>
              {awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Status / Time */}
      <div className="mt-2 text-center">
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            {statusText}
          </span>
        ) : isFinished ? (
          <span className="text-[10px] font-semibold text-text-muted">
            Encerrado
          </span>
        ) : (
          <span className="text-xs font-semibold text-text-secondary">
            {time || statusText}
          </span>
        )}
      </div>
    </div>
  );
}

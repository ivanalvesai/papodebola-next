"use client";

import Link from "next/link";
import { TeamLogo } from "@/components/ui/team-logo";
import { useLiveScore } from "@/components/world-cup/copa-live-provider";

interface MatchBarCardProps {
  id?: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  homeScore: number | null;
  awayScore: number | null;
  time: string;
  timestamp?: number;
  status: string;
  statusText: string;
  league: string;
  href?: string;
}

// statusType do feed ao vivo (Sofascore) → status que o card entende.
function mapLiveStatus(t: string): string {
  if (t === "inprogress") return "live";
  if (t === "finished") return "finished";
  if (t === "notstarted") return "scheduled";
  return "";
}

export function MatchBarCard({
  id,
  homeTeam,
  awayTeam,
  homeLogo,
  awayLogo,
  homeScore,
  awayScore,
  time,
  timestamp,
  status,
  statusText,
  league,
  href,
}: MatchBarCardProps) {
  // Placar ao vivo do CopaLiveProvider (polling 15s). Sem provider/sem jogo no
  // mapa, `ls` é undefined e o card usa os valores do server render (ISR).
  // O id vem como `api_<eventId>` (normalizeEvent); o mapa ao vivo é por eventId
  // numérico do Sofascore, então tira o prefixo antes de converter.
  const numericId = id ? Number(id.replace(/^api_/, "")) : -1;
  const ls = useLiveScore(Number.isFinite(numericId) ? numericId : -1);
  const homeScoreV = ls?.homeScore ?? homeScore;
  const awayScoreV = ls?.awayScore ?? awayScore;
  const statusV = ls ? mapLiveStatus(ls.statusType) || status : status;
  const statusTextV = ls?.statusDesc || statusText;

  const isLive = statusV === "live";
  const isFinished = statusV === "finished";
  const hasScore = homeScoreV !== null && awayScoreV !== null;

  // Data do jogo (dd/MM em horario de Brasilia). A barra pode ter jogos de dias
  // diferentes (madrugada do dia seguinte), entao mostra a data junto do horario
  // pra deixar claro que tal jogo nao e hoje. timeZone fixo => sem mismatch de hidratacao.
  const dateLabel = timestamp
    ? new Date(timestamp * 1000).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "America/Sao_Paulo",
      })
    : "";

  const card = (
    <div
      className={`flex-shrink-0 w-[180px] bg-card-bg rounded-lg border p-3 ${
        href ? "transition-colors hover:border-green" : ""
      } ${isLive ? "border-red" : "border-border-custom"}`}
    >
      {/* League */}
      <div className="text-[10px] text-text-muted font-semibold truncate mb-2 uppercase">
        {league}
      </div>

      {/* Teams */}
      <div className="space-y-1.5">
        {/* Home */}
        <div className="flex items-center gap-2">
          <TeamLogo src={homeLogo} size={20} />
          <span className="text-xs font-semibold text-text-primary truncate flex-1">
            {homeTeam}
          </span>
          {hasScore && (
            <span className={`text-sm font-bold ${isLive ? "text-red" : "text-text-primary"}`}>
              {homeScoreV}
            </span>
          )}
        </div>

        {/* Away */}
        <div className="flex items-center gap-2">
          <TeamLogo src={awayLogo} size={20} />
          <span className="text-xs font-semibold text-text-primary truncate flex-1">
            {awayTeam}
          </span>
          {hasScore && (
            <span className={`text-sm font-bold ${isLive ? "text-red" : "text-text-primary"}`}>
              {awayScoreV}
            </span>
          )}
        </div>
      </div>

      {/* Status / Time */}
      <div className="mt-2 text-center">
        {isLive ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-red animate-pulse" />
            {statusTextV}
          </span>
        ) : isFinished ? (
          <span className="text-[10px] font-semibold text-text-muted">
            Encerrado
          </span>
        ) : (
          <span className="text-xs font-semibold text-text-secondary">
            {dateLabel && time ? `${dateLabel} · ${time}` : time || statusText}
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}

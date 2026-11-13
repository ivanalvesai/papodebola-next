"use client";

import Link from "next/link";
import type { AgendaEvent } from "@/lib/data/agenda";
import { useLiveScore } from "@/components/world-cup/copa-live-provider";
import { TeamLogo } from "@/components/ui/team-logo";
import { translateStatus } from "@/lib/translations";

// Card de jogo da /ao-vivo: escudos/bandeiras, placar, status por extenso (1º tempo,
// intervalo, 2º tempo, encerrado) ou data e hora, e o link pro lance a lance.
// Placar e status se atualizam pelo LiveScoreProvider (polling compartilhado).
export function LiveMatchCard({ e, fallbackHref }: { e: AgendaEvent; fallbackHref?: string }) {
  const ls = useLiveScore(e.id);
  const statusType = ls?.statusType || e.statusType;
  const home = ls?.homeScore ?? e.homeScore;
  const away = ls?.awayScore ?? e.awayScore;
  const live = statusType === "inprogress" || statusType === "interrupted";
  const finished = statusType === "finished";
  const hasScore = (live || finished) && home != null && away != null;
  const desc = translateStatus(ls?.statusDesc || e.status) || (live ? "Ao vivo" : "");

  const when = new Date(e.timestamp * 1000);
  const day = when.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
  const hour = when.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  const href = e.href || fallbackHref;

  const status = live ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red/10 px-2.5 py-0.5 text-xs font-bold uppercase text-red">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" aria-hidden />
      {desc}
    </span>
  ) : finished ? (
    <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-text-muted">Encerrado</span>
  ) : (
    <span className="rounded-full bg-green-light px-2.5 py-0.5 text-xs font-semibold text-green">Não iniciado</span>
  );

  const row = (name: string, id: number, score: number | null) => (
    <div className="flex items-center gap-3">
      <TeamLogo src={id ? `/api/team-img/${id}` : null} size={28} />
      <span className="flex-1 truncate text-base font-semibold text-text-primary">{name}</span>
      {hasScore && <span className={`text-lg font-bold tabular-nums ${live ? "text-red" : "text-text-primary"}`}>{score}</span>}
    </div>
  );

  return (
    <article className={`flex flex-col rounded-lg border bg-card-bg p-4 ${live ? "border-red" : "border-border-custom"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <time dateTime={when.toISOString()} className="text-sm font-semibold capitalize text-text-secondary">
          {day.replace(".", "")} · {hour}
        </time>
        {status}
      </div>
      <div className="space-y-2">
        {row(e.home, e.homeId, home)}
        {row(e.away, e.awayId, away)}
      </div>
      {href && (
        <Link
          href={href}
          prefetch={false}
          className="mt-4 block rounded-md border border-green py-2 text-center text-sm font-semibold text-green transition-colors hover:bg-green hover:text-white"
        >
          {live ? "Acompanhe o lance a lance" : finished ? "Veja como foi o jogo" : "Lance a lance e escalações"}
          <span className="sr-only">: {e.home} x {e.away}</span>
        </Link>
      )}
    </article>
  );
}

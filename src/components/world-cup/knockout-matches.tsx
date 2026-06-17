"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { TeamLogo } from "@/components/ui/team-logo";
import { worldCupMatchHref } from "@/lib/world-cup-match-url";
import { CopaLiveProvider, useLiveScore } from "./copa-live-provider";
import type { ChampionshipMatch } from "@/types/match";

const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
// Brasil = UTC-3 fixo (sem horário de verão desde 2019).
function br(ts: number) {
  const d = new Date((ts - 3 * 3600) * 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}`,
    time: `${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`,
    wd: WD[d.getUTCDay()],
  };
}

function KnockoutCard({ m }: { m: ChampionshipMatch }) {
  const ls = useLiveScore(m.id);
  const statusType = ls?.statusType || m.status;
  const isLive = statusType === "inprogress";
  const isFinished = statusType === "finished";
  const homeScore = ls?.homeScore ?? m.homeScore;
  const awayScore = ls?.awayScore ?? m.awayScore;
  const statusDesc = ls?.statusDesc || m.statusDesc;
  const started = homeScore !== null && awayScore !== null;
  const t = br(m.timestamp);
  const href = worldCupMatchHref(m.timestamp, m.homeId, m.awayId, m.home, m.away);

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border-custom bg-card-bg px-4 py-3 transition-colors hover:bg-body/60"
    >
      <div className="mb-2 text-center text-[11px] text-text-muted">
        {t.wd}, {t.date} &middot; {t.time}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <span className="truncate text-sm font-semibold text-text-primary">{m.home}</span>
          <TeamLogo teamId={m.homeId} size={26} />
        </div>
        <span
          className={`min-w-[60px] shrink-0 whitespace-nowrap px-2 text-center text-base font-bold ${
            isLive ? "text-red" : "text-text-primary"
          }`}
        >
          {started ? `${homeScore} X ${awayScore}` : "X"}
        </span>
        <div className="flex min-w-0 items-center gap-2">
          <TeamLogo teamId={m.awayId} size={26} />
          <span className="truncate text-sm font-semibold text-text-primary">{m.away}</span>
        </div>
      </div>

      {isLive && (
        <div className="mt-2 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-2.5 py-1 text-[11px] font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            AO VIVO {statusDesc && <span className="font-semibold">&middot; {statusDesc}</span>}
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      )}

      {isFinished && (
        <div className="mt-2 flex justify-center">
          <span className="inline-flex items-center gap-1 rounded-full border border-green/40 bg-green/10 px-2.5 py-1 text-[11px] font-bold text-green">
            Veja como foi
            <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      )}
    </Link>
  );
}

export function KnockoutMatches({ matches }: { matches: ChampionshipMatch[] }) {
  if (matches.length === 0) {
    return (
      <div className="rounded-lg border border-border-custom bg-card-bg px-4 py-8 text-center text-sm text-text-muted">
        Confrontos definidos após a fase de grupos. Volte em breve.
      </div>
    );
  }

  return (
    <CopaLiveProvider>
      <div className="grid gap-3 sm:grid-cols-2">
        {matches.map((m) => (
          <KnockoutCard key={m.id} m={m} />
        ))}
      </div>
    </CopaLiveProvider>
  );
}

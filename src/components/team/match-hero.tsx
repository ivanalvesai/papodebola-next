import Image from "next/image";
import type { TeamMatch } from "@/lib/data/team";

// Card "premium" de um confronto (jogo de hoje ou próximo jogo): faixa com a
// competição, escudo grande de cada time, horário/placar no centro e a data por
// extenso. Usado nas páginas de time (jogo de hoje, próximos jogos) e no bloco
// "Jogo de hoje" do CMS — mesmo visual em todos os times.

const TZ = "America/Sao_Paulo";
const DAY = 86400;

function dayKey(tsSec: number): string {
  return new Date(tsSec * 1000).toLocaleDateString("en-CA", { timeZone: TZ });
}

// "Hoje", "Amanhã", "Em 3 dias" — pelo calendário de Brasília, não por 24 h corridas.
export function relativeDay(tsSec: number, nowSec: number): string {
  const a = Date.parse(dayKey(nowSec));
  const b = Date.parse(dayKey(tsSec));
  const diff = Math.round((b - a) / (DAY * 1000));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Amanhã";
  if (diff === -1) return "Ontem";
  if (diff > 1) return `Em ${diff} dias`;
  return "";
}

function longDate(tsSec: number): string {
  const s = new Date(tsSec * 1000).toLocaleDateString("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Side({ id, name, role }: { id: number; name: string; role: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-3 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-border-custom sm:h-24 sm:w-24">
        <Image src={`/api/team-img/${id}`} alt={`Escudo do ${name}`} width={64} height={64} className="h-14 w-14 object-contain sm:h-16 sm:w-16" unoptimized />
      </div>
      <div className="min-w-0">
        <div className="text-base font-bold leading-tight text-text-primary sm:text-lg">{name}</div>
        <div className="mt-1 text-xs uppercase tracking-wide text-text-muted">{role}</div>
      </div>
    </div>
  );
}

export function MatchHero({
  match,
  label,
  nowSec = Date.now() / 1000,
}: {
  match: TeamMatch;
  label: string;
  nowSec?: number;
}) {
  const live = match.status === "inprogress";
  const finished = match.status === "finished";
  const hasScore = match.homeScore !== null && match.awayScore !== null && (live || finished);
  const rel = match.timestamp ? relativeDay(match.timestamp, nowSec) : "";
  const when = match.timestamp ? longDate(match.timestamp) : match.date;

  return (
    <div className="overflow-hidden rounded-xl border border-border-custom bg-card-bg shadow-sm">
      <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-green to-green-hover px-5 py-3 text-white">
        <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
        <span className="truncate text-xs font-semibold opacity-90">{match.league}</span>
      </div>

      <div className="flex items-start justify-between gap-2 px-4 py-6 sm:px-8 sm:py-8">
        <Side id={match.homeId} name={match.home} role="Mandante" />

        <div className="flex shrink-0 flex-col items-center gap-2 pt-5 sm:pt-7">
          {hasScore ? (
            <div className="text-4xl font-extrabold tabular-nums text-text-primary sm:text-5xl">
              {match.homeScore}
              <span className="mx-2 text-text-muted">×</span>
              {match.awayScore}
            </div>
          ) : (
            <>
              <div className="text-3xl font-extrabold tabular-nums text-text-primary sm:text-4xl">{match.time}</div>
              <div className="text-sm font-bold uppercase tracking-widest text-text-muted">vs</div>
            </>
          )}
          {live && (
            <span className="rounded-full bg-red px-3 py-1 text-xs font-bold uppercase text-white">Ao vivo</span>
          )}
          {finished && (
            <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-secondary">Encerrado</span>
          )}
          {!live && !finished && rel && (
            <span className="rounded-full bg-green-light px-3 py-1 text-xs font-bold text-green">{rel}</span>
          )}
        </div>

        <Side id={match.awayId} name={match.away} role="Visitante" />
      </div>

      <div className="border-t border-border-light bg-body/60 px-5 py-3 text-center text-sm text-text-secondary">
        <span className="font-semibold text-text-primary">{when}</span>
        {!hasScore && match.time ? <span> · {match.time} (Brasília)</span> : null}
        {match.venue ? <span> · {match.venue}</span> : null}
      </div>
    </div>
  );
}

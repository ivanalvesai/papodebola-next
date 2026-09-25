import Image from "next/image";
import { Tv } from "lucide-react";
import type { TeamNarrative } from "@/lib/team-narrative";
import { channelKind } from "@/lib/team-narrative";
import { getBroadcasters } from "@/lib/broadcasters";
import type { TeamLastLineup } from "@/lib/data/team";

const card = "bg-card-bg rounded-lg border border-border-custom";

// Texto de contexto do time (gerado dos dados reais — ver lib/team-narrative.ts).
export function TeamNarrativeSection({ narrative }: { narrative: TeamNarrative | null }) {
  if (!narrative) return null;
  return (
    <section className={`${card} p-6`}>
      <h2 className="mb-3 text-base font-bold text-text-primary">{narrative.title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-text-secondary">
        {narrative.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

// Canais com direitos do campeonato do jogo (mapa em lib/broadcasters.ts).
export function BroadcastChannels({ league }: { league: string }) {
  const channels = getBroadcasters(league);
  if (!channels.length) {
    return (
      <p className="text-sm text-text-muted text-center">
        Canais desta competição ainda não confirmados. Confira a grade das emissoras na semana do jogo.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {channels.map((c) => (
        <div key={c} className="flex items-center gap-3 p-3 bg-body rounded-lg">
          <div className="w-10 h-10 rounded bg-green/10 flex items-center justify-center">
            <Tv className="h-5 w-5 text-green" />
          </div>
          <div>
            <div className="text-sm font-semibold text-text-primary">{c}</div>
            {channelKind(c) && <div className="text-xs text-text-muted">{channelKind(c)}</div>}
          </div>
        </div>
      ))}
      <p className="text-xs text-text-muted text-center mt-3">
        Direitos de transmissão de {league} no Brasil. Cada emissora escolhe os jogos que vai exibir.
      </p>
    </div>
  );
}

// XI do último jogo (base da provável escalação).
export function ProbableLineup({ lineup }: { lineup: TeamLastLineup | null }) {
  if (!lineup) return null;
  return (
    <div className={`${card} p-6`}>
      <h3 className="text-sm font-bold text-text-primary">
        Time que começou o último jogo{lineup.formation ? ` (${lineup.formation})` : ""}
      </h3>
      <p className="mb-4 text-xs text-text-muted">
        Contra {lineup.opponent}, em {lineup.date} · {lineup.league}
      </p>
      <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {lineup.players.map((p) => (
          <li key={`${p.playerId}-${p.name}`} className="flex items-center gap-3 rounded-lg bg-body p-2.5">
            {p.playerId ? (
              <Image
                src={`/api/player-img/${p.playerId}`}
                alt={p.name}
                width={32}
                height={32}
                className="rounded-full"
                unoptimized
              />
            ) : (
              <span className="h-8 w-8 rounded-full bg-border-custom" />
            )}
            <span className="w-6 text-center text-sm font-bold text-green tabular-nums">{p.number}</span>
            <span className="text-sm font-semibold text-text-primary">{p.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

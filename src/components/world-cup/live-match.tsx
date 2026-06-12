"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ComponentType, ReactNode } from "react";
import Image from "next/image";
import { TeamLogo } from "@/components/ui/team-logo";
import {
  Activity,
  Users,
  BarChart3,
  Trophy,
  ArrowUp,
  ArrowDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import type {
  MatchDetail,
  MatchEvent,
  MatchIncident,
  MatchCommentary,
  MatchStatItem,
  TeamLineup,
  LineupPlayer,
} from "@/lib/data/match-detail";
import type { StandingsGroup, StandingRow } from "@/types/standings";

// ---- som de gol (torcida, sintetizado via Web Audio) ----
let sharedCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!sharedCtx) sharedCtx = new AC();
  if (sharedCtx.state === "suspended") sharedCtx.resume().catch(() => {});
  return sharedCtx;
}
// roar de torcida: ruído filtrado com swell (sobe rápido, sustenta, decai)
function playGoalRoar() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const dur = 2.6;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 700;
    bp.Q.value = 0.6;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2200;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.5, now + 0.35);
    gain.gain.setValueAtTime(0.5, now + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    src.connect(bp);
    bp.connect(lp);
    lp.connect(gain);
    gain.connect(ctx.destination);
    src.start(now);
    src.stop(now + dur);
  } catch {
    /* navegador bloqueou o áudio: ignora */
  }
}

// ---- cronômetro ao vivo (minuto do jogo) ----
function useTicker(active: boolean) {
  const [, tick] = useState(0);
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
}

function liveMinute(event: MatchEvent): string | null {
  if (event.statusType !== "inprogress") return null;
  const desc = event.statusDesc || "";
  let base: number | null = null;
  if (desc.includes("2º")) base = 45;
  else if (desc.includes("1º")) base = 0;
  else if (desc.toLowerCase().includes("prorrog")) base = 90;
  if (base === null || !event.periodStart) return null;
  const elapsed = Math.floor(Date.now() / 1000 - event.periodStart);
  return `${base + Math.floor(elapsed / 60) + 1}'`;
}

function countdown(target: number): string | null {
  const diff = target - Math.floor(Date.now() / 1000);
  if (diff <= 0) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(diff / 3600))}:${p(Math.floor((diff % 3600) / 60))}:${p(diff % 60)}`;
}

// ---- cabeçalho (placar / status / cronômetro) ----
function Header({
  event,
  mounted,
  soundOn,
  onToggleSound,
}: {
  event: MatchEvent;
  mounted: boolean;
  soundOn: boolean;
  onToggleSound: () => void;
}) {
  useTicker(mounted && event.statusType !== "finished");
  const minute = liveMinute(event);
  const cd = mounted && event.statusType === "notstarted" ? countdown(event.startTimestamp) : null;
  const showScore = event.statusType !== "notstarted";

  return (
    <div className="relative rounded-lg border border-border-custom bg-card-bg p-5">
      {/* liga/desliga som do gol */}
      <button
        type="button"
        onClick={onToggleSound}
        title={soundOn ? "Som do gol ligado" : "Som do gol desligado"}
        aria-label={soundOn ? "Desligar som do gol" : "Ligar som do gol"}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-body hover:text-text-primary"
      >
        {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <div className="mb-4 flex justify-center">
        {event.live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red px-3 py-1 text-xs font-bold text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            AO VIVO {minute ? <span className="tabular-nums">{minute}</span> : event.statusDesc}
          </span>
        ) : event.statusType === "finished" ? (
          <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
            Encerrado
          </span>
        ) : (
          <span className="rounded-full bg-body px-3 py-1 text-xs font-semibold text-text-muted">
            Pré-jogo {cd && <span className="ml-1 tabular-nums text-text-primary">{cd}</span>}
          </span>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.homeId} size={64} />
          <span className="text-sm font-semibold text-text-primary sm:text-base">{event.home}</span>
        </div>
        <div className="px-3 text-center">
          {showScore ? (
            <div className="text-4xl font-extrabold tabular-nums text-text-primary">
              {event.homeScore ?? 0}
              <span className="px-2 text-text-muted">×</span>
              {event.awayScore ?? 0}
            </div>
          ) : (
            <div className="text-2xl font-bold text-text-muted">×</div>
          )}
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <TeamLogo teamId={event.awayId} size={64} />
          <span className="text-sm font-semibold text-text-primary sm:text-base">{event.away}</span>
        </div>
      </div>
    </div>
  );
}

// ---- card de seção ----
function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-custom bg-card-bg">
      <h2 className="flex h-10 items-center gap-2 bg-green px-4 text-sm font-bold text-white">
        <Icon className="h-4 w-4" />
        {title}
      </h2>
      <div className="p-4">{children}</div>
    </section>
  );
}

// ---- lance a lance (commentary, PT-BR) ----
// tipo do commentary (EN) -> rótulo PT-BR; key = lance importante (com foto do jogador)
const COMM: Record<string, { label: string; key?: boolean }> = {
  goal: { label: "GOL!", key: true },
  scoreChange: { label: "GOL!", key: true },
  penaltyGoal: { label: "GOL de pênalti!", key: true },
  ownGoal: { label: "Gol contra", key: true },
  matchStarted: { label: "Começou o jogo!" },
  firstHalfEnded: { label: "Fim do 1º tempo" },
  halfTime: { label: "Intervalo" },
  secondHalfStarted: { label: "Começa o 2º tempo" },
  matchEnded: { label: "Fim de jogo" },
  penaltyMissed: { label: "Pênalti perdido", key: true },
  penaltySaved: { label: "Pênalti defendido", key: true },
  penaltyAwarded: { label: "Pênalti marcado!", key: true },
  yellowCard: { label: "Cartão amarelo", key: true },
  secondYellowCard: { label: "2º amarelo (vermelho)", key: true },
  redCard: { label: "Cartão vermelho", key: true },
  varDecision: { label: "Revisão do VAR", key: true },
  substitution: { label: "Substituição", key: true },
  freeKickWon: { label: "Falta a favor" },
  freeKickLost: { label: "Falta" },
  foul: { label: "Falta" },
  shotOffTarget: { label: "Finalização para fora" },
  attemptSaved: { label: "Defesa do goleiro" },
  shotSaved: { label: "Defesa do goleiro" },
  shotBlocked: { label: "Finalização bloqueada" },
  attemptBlocked: { label: "Finalização bloqueada" },
  post: { label: "Na trave!" },
  hitWoodwork: { label: "Na trave!" },
  cornerKick: { label: "Escanteio" },
  corner: { label: "Escanteio" },
  offside: { label: "Impedimento" },
  handball: { label: "Mão na bola" },
  throwIn: { label: "Lateral" },
  goalKick: { label: "Tiro de meta" },
  injury: { label: "Atendimento médico" },
  delay: { label: "Jogo paralisado" },
  resumed: { label: "Jogo retomado" },
};

// motivo do cartão (EN da API) -> PT-BR
const REASON_PT: Record<string, string> = {
  Foul: "Falta",
  "Serious foul": "Falta grave",
  "Professional foul": "Falta profissional",
  "Professional foul last man": "Falta profissional (último homem)",
  "Last man": "Último homem",
  "Violent conduct": "Conduta violenta",
  "Unsporting behaviour": "Conduta antidesportiva",
  Handball: "Mão na bola",
  Dissent: "Reclamação",
  Argument: "Discussão",
  "Time wasting": "Perda de tempo",
  "Dangerous play": "Jogo perigoso",
  "Foul and abusive language": "Linguagem ofensiva",
};
function reasonPT(r: string): string {
  return REASON_PT[r] || r;
}

// foto do jogador (lance-chave); cai pra bandeira do time se não houver foto
function PlayerAvatar({
  playerId,
  teamId,
  size = 44,
}: {
  playerId: number | null;
  teamId: number;
  size?: number;
}) {
  // A foto do jogador pode bater no rate limit (6 req/s) da API quando é "fria"
  // (1ª vez). Em vez de cair direto na bandeira, re-tenta algumas vezes (com
  // cache-buster pra furar o 429 cacheado) — quando libera, carrega e fica cacheada.
  const [attempt, setAttempt] = useState(0);
  const [failed, setFailed] = useState(false);
  const usePlayer = !!playerId && !failed;
  const src = usePlayer
    ? `/img/player/${playerId}/image${attempt > 0 ? `?r=${attempt}` : ""}`
    : `/img/team/${teamId}/image`;
  return (
    <Image
      key={src}
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      onError={() => {
        if (usePlayer && attempt < 4) {
          setTimeout(() => setAttempt((a) => a + 1), 2000);
        } else {
          setFailed(true);
        }
      }}
      className="shrink-0 rounded-full bg-body object-cover"
    />
  );
}

function CommentaryRow({ c, event }: { c: MatchCommentary; event: MatchEvent }) {
  const info = COMM[c.type] || { label: "Lance do jogo" };
  const teamId = c.isHome == null ? 0 : c.isHome ? event.homeId : event.awayId;
  const teamName = c.isHome ? event.home : event.away;
  const min = c.minute != null ? `${c.minute}'` : "";
  const isGoal = c.type === "goal" || c.type === "scoreChange" || c.type === "penaltyGoal";

  if (info.key) {
    const isRed = c.type === "redCard" || c.type === "secondYellowCard";
    const isYellow = c.type === "yellowCard";
    const isSub = c.type === "substitution";
    const headline = isGoal ? `⚽ GOL DO ${teamName.toUpperCase()}!` : info.label;
    return (
      <div
        className={`flex items-center gap-3 rounded-lg border p-3 ${
          isGoal
            ? "border-green bg-green/5"
            : isRed
              ? "border-red bg-red/5"
              : isYellow
                ? "border-yellow-400 bg-yellow-400/10"
                : "border-border-light bg-card-bg"
        }`}
      >
        {/* na substituição, a foto é de quem entra */}
        <PlayerAvatar playerId={isSub ? c.playerInId : c.playerId} teamId={teamId} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {min && <span className="text-[11px] font-bold tabular-nums text-text-muted">{min}</span>}
            {teamId > 0 && <TeamLogo teamId={teamId} size={16} />}
          </div>
          <p className="text-sm font-bold text-text-primary">{headline}</p>
          {isSub ? (
            <div className="leading-tight">
              {c.playerIn && (
                <p className="flex items-center gap-1 text-sm font-semibold text-green">
                  <ArrowUp className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Entra: {c.playerIn}</span>
                </p>
              )}
              {c.playerOut && (
                <p className="flex items-center gap-1 text-sm font-semibold text-red">
                  <ArrowDown className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Sai: {c.playerOut}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="leading-tight">
              {c.player && <p className="truncate text-sm text-text-secondary">{c.player}</p>}
              {(isYellow || isRed) && c.reason && (
                <p className="text-[11px] text-text-muted">Motivo: {reasonPT(c.reason)}</p>
              )}
              {c.textPt && <p className="mt-0.5 text-[11px] text-text-muted">{c.textPt}</p>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // lance normal: bandeira do time + rótulo PT
  return (
    <div className="flex items-center gap-3 border-b border-border-light py-2 last:border-0">
      <span className="w-9 shrink-0 text-center text-xs font-bold tabular-nums text-text-muted">
        {min}
      </span>
      {teamId > 0 ? <TeamLogo teamId={teamId} size={18} /> : <span className="w-[18px] shrink-0" />}
      <p className="min-w-0 flex-1 text-sm text-text-primary">
        {c.textPt ? (
          c.textPt
        ) : (
          <>
            {info.label}
            {c.player && <span className="text-text-muted"> — {c.player}</span>}
          </>
        )}
      </p>
    </div>
  );
}

function CommentaryFeed({ items, event }: { items: MatchCommentary[]; event: MatchEvent }) {
  const started = event.statusType === "inprogress" || event.statusType === "finished";
  const hasStart = items.some((c) => c.type === "matchStarted");

  // pré-jogo, sem lances ainda
  if (!items.length && !started)
    return (
      <p className="py-10 text-center text-sm text-text-muted">
        O lance a lance começa quando a bola rolar — gols, cartões e lances importantes em tempo real.
      </p>
    );

  // A API não manda um comentário de "fim do 1º tempo"; mostramos a fase atual
  // (Intervalo / Encerrado) pelo status do evento, no topo (mais recente).
  const phase =
    event.statusType === "finished"
      ? "Fim de jogo"
      : event.statusDesc === "Intervalo"
        ? "Intervalo"
        : null;

  return (
    <div className="space-y-2">
      {phase && (
        <div className="rounded-md bg-body py-2 text-center text-xs font-bold uppercase tracking-wide text-text-muted">
          {phase}
        </div>
      )}
      {items.map((c) => (
        <CommentaryRow key={c.id} c={c} event={event} />
      ))}
      {/* marcador de início garantido (mesmo se o commentary da API travar/atrasar) */}
      {started && !hasStart && (
        <div className="flex items-center gap-3 border-t border-border-light pt-2">
          <span className="w-9 shrink-0 text-center text-xs font-bold tabular-nums text-text-muted">
            1&prime;
          </span>
          <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-green" />
          <p className="text-sm font-semibold text-text-primary">
            Começa o jogo entre {event.home} e {event.away}!
          </p>
        </div>
      )}
    </div>
  );
}

// ---- estatísticas ----
function StatsBars({ stats }: { stats: MatchStatItem[] }) {
  if (stats.length === 0)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        As estatísticas aparecem quando o jogo começa.
      </p>
    );
  return (
    <div className="space-y-3">
      {stats.map((s, i) => {
        const total = s.homeNum + s.awayNum;
        const homePct = total > 0 ? (s.homeNum / total) * 100 : 50;
        return (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-text-primary">
              <span className="tabular-nums">{s.home}</span>
              <span className="text-center text-text-muted">{s.name}</span>
              <span className="tabular-nums">{s.away}</span>
            </div>
            <div className="flex h-1.5 overflow-hidden rounded-full bg-border-light">
              <div className="bg-green" style={{ width: `${homePct}%` }} />
              <div className="bg-text-muted/40" style={{ width: `${100 - homePct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---- escalação em 2 colunas (estilo ge.globo) ----
const POS_PT: Record<string, string> = { G: "GOL", D: "DEF", M: "MEI", F: "ATA" };

// Nome longo não cabe na coluna estreita (e empurra o ícone de gol/cartão) →
// usa só o sobrenome (ex: "Julián Quiñones" → "Quiñones").
function shortPlayerName(name: string): string {
  if (name.length <= 13) return name;
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : name;
}

interface PlayerMark {
  goals: number;
  yellow: boolean;
  red: boolean;
}
function buildMarks(incidents: MatchIncident[]): Record<string, PlayerMark> {
  const map: Record<string, PlayerMark> = {};
  for (const inc of incidents) {
    const name = inc.player;
    if (!name) continue;
    const m = (map[name] ||= { goals: 0, yellow: false, red: false });
    if (inc.type === "goal") m.goals++;
    if (inc.type === "card") {
      if (inc.cls === "red" || inc.cls === "yellowRed") m.red = true;
      else m.yellow = true;
    }
  }
  return map;
}

function Marks({ m }: { m?: PlayerMark }) {
  if (!m) return null;
  return (
    <span className="ml-1 inline-flex items-center gap-1 align-middle">
      {m.goals > 0 && (
        <span className="inline-flex items-center text-[13px] leading-none" title={`${m.goals} gol(s)`}>
          ⚽
          {m.goals > 1 && (
            <span className="ml-0.5 text-[10px] font-bold text-text-primary">{m.goals}</span>
          )}
        </span>
      )}
      {m.yellow && !m.red && (
        <span className="inline-block h-3 w-2 rounded-[1px] bg-yellow-400" title="Cartão amarelo" />
      )}
      {m.red && (
        <span className="inline-block h-3 w-2 rounded-[1px] bg-red" title="Cartão vermelho" />
      )}
    </span>
  );
}

function PlayerRow({
  p,
  marks,
  dim,
}: {
  p: LineupPlayer;
  marks: Record<string, PlayerMark>;
  dim: boolean;
}) {
  return (
    <div className="flex items-start gap-1.5 py-1">
      <span className="w-4 shrink-0 text-right text-[10px] tabular-nums text-text-muted">
        {p.number ?? ""}
      </span>
      <div className="min-w-0 leading-tight">
        <div className="flex items-center gap-1">
          <p
            className={`truncate text-xs font-medium ${
              dim ? "text-text-muted" : "text-text-primary"
            }`}
          >
            {shortPlayerName(p.name)}
          </p>
          {/* ícone fora do nome (shrink-0) → nunca é cortado pelo truncate */}
          <span className="shrink-0">
            <Marks m={marks[p.name]} />
          </span>
        </div>
        <p className="text-[10px] text-text-muted">{POS_PT[p.position] || p.position}</p>
      </div>
    </div>
  );
}

function TeamColumn({
  team,
  teamId,
  name,
  marks,
}: {
  team: TeamLineup;
  teamId: number;
  name: string;
  marks: Record<string, PlayerMark>;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5 border-b border-border-light pb-1.5">
        <TeamLogo teamId={teamId} size={18} />
        <span className="truncate text-xs font-bold text-text-primary">{name}</span>
        {team.formation && (
          <span className="ml-auto shrink-0 text-[10px] text-text-muted">{team.formation}</span>
        )}
      </div>
      {team.starters.map((p) => (
        <PlayerRow key={p.id} p={p} marks={marks} dim={false} />
      ))}
      {team.bench.length > 0 && (
        <>
          <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-wide text-text-muted">
            Reservas
          </p>
          {team.bench.map((p) => (
            <PlayerRow key={p.id} p={p} marks={marks} dim />
          ))}
        </>
      )}
    </div>
  );
}

function Lineups({
  event,
  home,
  away,
  confirmed,
  incidents,
}: {
  event: MatchEvent;
  home: TeamLineup | null;
  away: TeamLineup | null;
  confirmed: boolean;
  incidents: MatchIncident[];
}) {
  if (!home?.starters.length && !away?.starters.length)
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Escalações ainda não confirmadas. Costumam sair ~1h antes do jogo.
      </p>
    );
  const marks = buildMarks(incidents);
  return (
    <div>
      {confirmed && (
        <div className="mb-3 flex items-center gap-1 text-[11px] font-semibold text-green">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
          Escalação confirmada
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {home && <TeamColumn team={home} teamId={event.homeId} name={event.home} marks={marks} />}
        {away && <TeamColumn team={away} teamId={event.awayId} name={event.away} marks={marks} />}
      </div>
    </div>
  );
}

// ---- classificação do grupo ----
function GroupTable({ group, homeId, awayId }: { group: StandingsGroup; homeId: number; awayId: number }) {
  return (
    <table className="w-full text-xs">
      <thead>
        <tr className="text-text-muted">
          <th className="py-1.5 pl-1 text-left font-semibold">#</th>
          <th className="py-1.5 text-left font-semibold">Seleção</th>
          <th className="py-1.5 px-1 text-center font-semibold">P</th>
          <th className="py-1.5 px-1 text-center font-semibold">J</th>
          <th className="py-1.5 px-1 text-center font-semibold">SG</th>
        </tr>
      </thead>
      <tbody>
        {group.rows.slice(0, 4).map((r: StandingRow, i) => {
          const here = r.teamId === homeId || r.teamId === awayId;
          return (
            <tr
              key={r.teamId || i}
              className={`border-t border-border-light ${
                (r.pos || i + 1) <= 2 ? "border-l-2 border-l-green" : "border-l-2 border-l-transparent"
              } ${here ? "bg-green/5 font-semibold" : ""}`}
            >
              <td className="py-2 pl-1 text-text-muted">{r.pos || i + 1}</td>
              <td className="py-2">
                <div className="flex items-center gap-1.5">
                  <TeamLogo teamId={r.teamId} size={18} />
                  <span className="truncate text-text-primary">{r.team}</span>
                </div>
              </td>
              <td className="py-2 px-1 text-center font-bold text-text-primary">{r.pts}</td>
              <td className="py-2 px-1 text-center text-text-muted">{r.matches}</td>
              <td className="py-2 px-1 text-center text-text-muted">
                {r.gd > 0 ? `+${r.gd}` : r.gd}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ---- componente principal ----
export function LiveMatch({
  matchId,
  initial,
  group,
}: {
  matchId: number;
  initial: MatchDetail;
  group: StandingsGroup | null;
}) {
  const [event, setEvent] = useState(initial.event);
  const [incidents, setIncidents] = useState(initial.incidents);
  const [commentary, setCommentary] = useState(initial.commentary);
  const [stats, setStats] = useState(initial.stats);
  const [mounted, setMounted] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);
  soundOnRef.current = soundOn;
  const prevGoals = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  // desbloqueia o áudio no 1º toque/clique do usuário (exigência dos navegadores)
  useEffect(() => {
    const unlock = () => getAudioCtx();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  // toca o som de torcida quando o placar aumenta (gol), exceto no carregamento
  useEffect(() => {
    const total = (event.homeScore ?? 0) + (event.awayScore ?? 0);
    if (prevGoals.current == null) {
      prevGoals.current = total;
      return;
    }
    if (total > prevGoals.current && soundOnRef.current && event.statusType !== "notstarted") {
      playGoalRoar();
    }
    prevGoals.current = total;
  }, [event.homeScore, event.awayScore, event.statusType]);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/copa/jogo/${matchId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.event) setEvent(data.event);
      if (Array.isArray(data?.incidents)) setIncidents(data.incidents);
      if (Array.isArray(data?.commentary)) setCommentary(data.commentary);
      if (Array.isArray(data?.stats)) setStats(data.stats);
    } catch {
      /* tenta de novo no próximo ciclo */
    }
  }, [matchId]);

  useEffect(() => {
    if (event.statusType === "finished") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const nextDelay = () => {
      if (event.statusType === "inprogress") return 12000; // ao vivo: 12s
      // pré-jogo: aperta pra 15s perto do apito (≤5min), senão 45s
      const toKickoff = event.startTimestamp - Date.now() / 1000;
      return toKickoff <= 300 ? 15000 : 45000;
    };
    const tick = async () => {
      if (cancelled) return;
      await poll();
      if (!cancelled) schedule();
    };
    const schedule = () => {
      timer = setTimeout(tick, nextDelay());
    };
    schedule();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [event.statusType, event.startTimestamp, poll]);

  return (
    <div className="space-y-4">
      <Header
        event={event}
        mounted={mounted}
        soundOn={soundOn}
        onToggleSound={() => {
          getAudioCtx(); // gesto do usuário: desbloqueia o áudio
          setSoundOn((s) => !s);
        }}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)_280px]">
        {/* Esquerda: escalação + estatísticas */}
        <div className="order-2 space-y-4 lg:order-1">
          <Section title="Escalação" icon={Users}>
            <Lineups
              event={event}
              home={initial.home}
              away={initial.away}
              confirmed={initial.lineupsConfirmed}
              incidents={incidents}
            />
          </Section>
          <Section title="Estatísticas" icon={BarChart3}>
            <StatsBars stats={stats} />
          </Section>
        </div>

        {/* Meio: lance a lance */}
        <div className="order-1 lg:order-2">
          <Section title="Lance a lance" icon={Activity}>
            <CommentaryFeed items={commentary} event={event} />
          </Section>
        </div>

        {/* Direita: classificação do grupo */}
        <div className="order-3">
          {group && (
            <Section title={group.name} icon={Trophy}>
              <GroupTable group={group} homeId={event.homeId} awayId={event.awayId} />
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

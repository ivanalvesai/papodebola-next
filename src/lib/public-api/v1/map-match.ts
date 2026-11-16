import type { ChampionshipMatch } from "@/types/match";
import type { MatchDetail, MatchLive, MatchEvent, TeamLineup } from "@/lib/data/match-detail";
import type { AgendaEvent, AgendaLeagueGroup } from "@/lib/data/agenda";
import type { TeamMatch } from "@/lib/data/team";
import { toStatusV1 } from "./status.ts";
import { isoBrt } from "../envelope.ts";
import type { TimeRefV1, PlacarV1, JogoResumoV1, JogoV1, JogoCompletoV1, EscalacaoV1, DiaCampeonatoV1 } from "./dto.ts";

const lado = (isHome: boolean | null | undefined) => (isHome == null ? null : isHome ? "mandante" : "visitante") as "mandante" | "visitante" | null;

export function teamRef(id: number, nome: string): TimeRefV1 {
  return { id, nome, escudo: `/v1/imagens/time/${id}` };
}

function placar(h: number | null | undefined, a: number | null | undefined, hp?: number | null, ap?: number | null): PlacarV1 {
  const p: PlacarV1 = { mandante: h ?? null, visitante: a ?? null };
  if (hp != null || ap != null) { p.penaltisMandante = hp ?? null; p.penaltisVisitante = ap ?? null; }
  return p;
}

function resumo(x: { id: number; homeId: number; awayId: number; home: string; away: string; ts: number; raw: string; desc: string; hs: number | null; as: number | null; hp?: number | null; ap?: number | null; campeonato?: string; rodada?: number }): JogoResumoV1 {
  const j: JogoResumoV1 = {
    id: x.id, inicio: isoBrt(x.ts * 1000), inicioTs: x.ts, status: toStatusV1(x.raw, x.desc), statusTexto: x.desc,
    mandante: teamRef(x.homeId, x.home), visitante: teamRef(x.awayId, x.away), placar: placar(x.hs, x.as, x.hp, x.ap),
  };
  if (x.campeonato) j.campeonato = x.campeonato;
  if (x.rodada != null) j.rodada = x.rodada;
  return j;
}

export function fromChampionshipMatch(m: ChampionshipMatch, campeonato?: string): JogoResumoV1 {
  return resumo({ id: m.id, homeId: m.homeId, awayId: m.awayId, home: m.home, away: m.away, ts: m.timestamp, raw: m.status, desc: m.statusDesc, hs: m.homeScore, as: m.awayScore, hp: m.homePens, ap: m.awayPens, campeonato, rodada: m.round });
}

export function fromAgendaEvent(e: AgendaEvent): JogoResumoV1 {
  return resumo({ id: e.id, homeId: e.homeId, awayId: e.awayId, home: e.home, away: e.away, ts: e.timestamp, raw: e.statusType, desc: e.status, hs: e.homeScore, as: e.awayScore, campeonato: e.league });
}

export function fromTeamMatch(m: TeamMatch): JogoResumoV1 {
  return resumo({ id: m.id, homeId: m.homeId, awayId: m.awayId, home: m.home, away: m.away, ts: m.timestamp, raw: m.status, desc: m.statusText, hs: m.homeScore, as: m.awayScore, campeonato: m.league });
}

function eventBase(e: MatchEvent): Omit<JogoV1, "lances" | "narracao" | "estatisticas" | "penaltis"> {
  return {
    ...resumo({ id: e.id, homeId: e.homeId, awayId: e.awayId, home: e.home, away: e.away, ts: e.startTimestamp, raw: e.statusType, desc: e.statusDesc, hs: e.homeScore, as: e.awayScore, hp: e.homePens, ap: e.awayPens }),
    estadio: e.venue ? { nome: e.venue.stadium, cidade: e.venue.city, pais: e.venue.country } : null,
    arbitro: e.referee?.name || null,
    vencedor: e.winnerCode === 1 ? "mandante" : e.winnerCode === 2 ? "visitante" : null,
    inicioPeriodoTs: e.periodStart || 0,
  };
}

export function toJogo(l: MatchLive): JogoV1 {
  return {
    ...eventBase(l.event),
    lances: l.incidents.map((i) => ({ tipo: i.type, detalhe: i.cls, minuto: i.minute, acrescimo: i.addedTime, jogador: i.player, assistencia: i.assist, entrou: i.playerIn, saiu: i.playerOut, lado: lado(i.isHome), placarMandante: i.homeScore, placarVisitante: i.awayScore, texto: i.text })),
    narracao: l.commentary.map((c) => ({ id: c.id, tipo: c.type, texto: c.textPt || c.text, minuto: c.minute, rotuloMinuto: c.minuteLabel ?? null, lado: lado(c.isHome), jogador: c.player, html: c.html ?? null })),
    estatisticas: l.stats.map((s) => ({ nome: s.name, mandante: s.home, visitante: s.away })),
    penaltis: l.shootout.map((k) => ({ ordem: k.sequence, jogador: k.player, lado: k.isHome ? "mandante" : "visitante", converteu: k.scored, motivo: k.reason })),
  };
}

function escalacao(t: TeamLineup | null): EscalacaoV1 | null {
  if (!t) return null;
  const p = (x: TeamLineup["starters"][number]) => ({ id: x.id, nome: x.name, numero: x.number, posicao: x.position, nota: x.rating, capitao: x.captain, foto: `/v1/imagens/jogador/${x.id}` });
  return { formacao: t.formation, titulares: t.starters.map(p), reservas: t.bench.map(p) };
}

export function toJogoCompleto(d: MatchDetail): JogoCompletoV1 {
  return { ...toJogo(d), escalacoes: { confirmadas: d.lineupsConfirmed, mandante: escalacao(d.home), visitante: escalacao(d.away) } };
}

export function toDia(groups: AgendaLeagueGroup[], onlyLive = false): DiaCampeonatoV1[] {
  return groups
    .map((g) => ({ campeonato: g.league, jogos: g.events.filter((e) => !onlyLive || e.statusType === "inprogress").map(fromAgendaEvent) }))
    .filter((g) => g.jogos.length > 0);
}

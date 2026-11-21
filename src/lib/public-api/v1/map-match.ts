import type { ChampionshipMatch } from "@/types/match";
import type { MatchDetail, MatchLive, MatchEvent, TeamLineup } from "@/lib/data/match-detail";
import type { AgendaEvent, AgendaLeagueGroup } from "@/lib/data/agenda";
import type { TeamMatch } from "@/lib/data/team";
import { toStatusV1 } from "./status.ts";
import { isoBrt } from "../envelope.ts";
import type { TimeRefV1, PlacarV1, JogoResumoV1, JogoV1, JogoCompletoV1, EscalacaoV1, DiaCampeonatoV1, LanceV1, GolV1, EventoJogadorV1, FaseV1 } from "./dto.ts";
import { cardReasonPt, periodLabel, translateStat } from "../../match-labels.ts";
import { doDa } from "../../pt-gender.ts";

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

const side = (code: number | null | undefined) => (code === 1 ? "mandante" : code === 2 ? "visitante" : null) as "mandante" | "visitante" | null;

type Base = Omit<JogoV1, "lances" | "narracao" | "estatisticas" | "penaltis" | "gols" | "resumo">;

function eventBase(e: MatchEvent): Base {
  const r = resumo({ id: e.id, homeId: e.homeId, awayId: e.awayId, home: e.home, away: e.away, ts: e.startTimestamp, raw: e.statusType, desc: e.statusDesc, hs: e.homeScore, as: e.awayScore, hp: e.homePens, ap: e.awayPens, campeonato: e.tournament || undefined, rodada: e.round && !e.round.knockout && e.round.number != null ? e.round.number : undefined });
  const fase: FaseV1 | null = e.round ? { nome: e.round.label, mataMata: e.round.knockout, chave: e.round.slug || (e.round.number != null ? String(e.round.number) : null) } : null;
  const pens = e.homePens != null && e.awayPens != null;
  // Quem avançou: pelo agregado (jogo de volta) ou, num jogo decidido nos pênaltis, o vencedor.
  // Sem agregado nem pênaltis (ida ou jogo único) fica null: a API não diferencia os dois.
  const avancou = side(e.aggWinnerCode) ?? (pens ? side(e.winnerCode) : null);
  return {
    ...r,
    estadio: e.venue ? { nome: e.venue.stadium, cidade: e.venue.city, pais: e.venue.country, capacidade: e.venue.capacity ?? null } : null,
    arbitro: e.referee?.name || null,
    vencedor: side(e.winnerCode),
    inicioPeriodoTs: e.periodStart || 0,
    fase,
    agregado: e.aggregate ? { mandante: e.aggregate.home, visitante: e.aggregate.away } : null,
    avancou,
    jogoIdaId: e.previousLegId ?? null,
    tecnicos: e.managers ? { mandante: e.managers.home, visitante: e.managers.away } : null,
  };
}

// Índice nome -> id dos jogadores da escalação (snapshots antigos guardam só o nome no lance).
function playerIndex(home?: TeamLineup | null, away?: TeamLineup | null) {
  const bySide = { mandante: new Map<string, number>(), visitante: new Map<string, number>() };
  const all = new Map<string, number>();
  const add = (t: TeamLineup | null | undefined, k: "mandante" | "visitante") => {
    for (const p of [...(t?.starters || []), ...(t?.bench || [])]) {
      if (!p.id || !p.name) continue;
      bySide[k].set(p.name, p.id);
      if (!all.has(p.name)) all.set(p.name, p.id);
    }
  };
  add(home, "mandante");
  add(away, "visitante");
  return (name: string | null, l: "mandante" | "visitante" | null): number | null => {
    if (!name) return null;
    return (l && bySide[l].get(name)) || all.get(name) || null;
  };
}

const GOL_TIPO: Record<string, GolV1["tipo"]> = { penalty: "penalti", ownGoal: "contra" };
const CARTAO: Record<string, EventoJogadorV1["tipo"]> = { yellow: "amarelo", yellowRed: "segundoAmarelo", red: "vermelho" };

function minutoTxt(m: number | null, a: number | null) {
  return m == null ? "" : `${m}'${a ? `+${a}` : ""}`;
}

const pelaCamp = (c: string) => (doDa(c).startsWith("do ") ? "pelo " : "pela ") + c;

function faseFrase(f: FaseV1 | null, camp: string | undefined): string {
  if (!camp) return "";
  if (!f) return `, ${pelaCamp(camp)}`;
  if (!f.mataMata) return f.chave ? `, pela ${f.chave}ª rodada ${doDa(camp)}` : `, ${pelaCamp(camp)}`;
  const n = f.nome.toLowerCase();
  const art = /^(oitavas|quartas)/.test(n) ? "pelas" : /avos/.test(n) ? "pelos" : "pela";
  return `, ${art} ${n} ${doDa(camp)}`;
}

// Frase de resumo do jogo encerrado (neutra quanto ao gênero do time: "Palmeiras venceu").
function resumoTexto(b: Base, gols: GolV1[]): string | null {
  if (b.status !== "encerrado" || b.placar.mandante == null || b.placar.visitante == null) return null;
  const H = b.mandante.nome, A = b.visitante.nome;
  const out = [`Fim de jogo: ${H} ${b.placar.mandante} x ${b.placar.visitante} ${A}${faseFrase(b.fase, b.campeonato)}.`];
  const pm = b.placar.penaltisMandante, pv = b.placar.penaltisVisitante;
  const quem = (l: "mandante" | "visitante" | null) => (l === "mandante" ? H : l === "visitante" ? A : null);
  if (pm != null && pv != null) {
    const w = pm > pv ? H : A, hi = Math.max(pm, pv), lo = Math.min(pm, pv);
    const agg = b.agregado ? `, depois do empate em ${b.agregado.mandante} a ${b.agregado.visitante} no agregado` : "";
    out.push(`Nos pênaltis, ${w} venceu por ${hi} a ${lo}${agg}${b.avancou ? ", e avançou" : ""}.`);
  } else if (b.agregado) {
    const av = quem(b.avancou);
    out.push(`No agregado, ${H} ${b.agregado.mandante} x ${b.agregado.visitante} ${A}${av ? `; ${av} avançou` : ""}.`);
  }
  if (gols.length) {
    const g = gols.map((x) => `${x.jogador || "?"} (${x.tipo === "contra" ? "contra, " : x.tipo === "penalti" ? "pênalti, " : ""}${minutoTxt(x.minuto, x.acrescimo)}, ${quem(x.lado) || ""})`);
    out.push(`Gols: ${g.join("; ")}.`);
  }
  return out.join(" ");
}

export function toJogo(l: MatchLive, home?: TeamLineup | null, away?: TeamLineup | null): JogoV1 {
  const base = eventBase(l.event);
  const idOf = playerIndex(home, away);
  // Motivo do cartão: o lance novo traz `reason`; nos snapshots antigos ele só está na narração.
  const motivoNarr = new Map<string, string>();
  for (const c of l.commentary) if (c.reason && c.player && /card/i.test(c.type)) motivoNarr.set(c.player, c.reason);
  const lances: LanceV1[] = l.incidents.map((i) => {
    const ld = lado(i.isHome);
    return {
      tipo: i.type, detalhe: i.cls,
      minuto: i.minute === 999 ? null : i.minute,
      acrescimo: i.addedTime === 999 ? null : i.addedTime,
      rotulo: i.type === "period" ? periodLabel(i.text, i.minute) : i.type === "injuryTime" ? "Acréscimos" : null,
      jogador: i.player, jogadorId: i.playerId ?? idOf(i.player, i.cls === "ownGoal" ? null : ld),
      assistencia: i.assist, assistenciaId: i.assistId ?? idOf(i.assist, ld),
      entrou: i.playerIn, entrouId: i.playerInId ?? idOf(i.playerIn, ld),
      saiu: i.playerOut, saiuId: i.playerOutId ?? idOf(i.playerOut, ld),
      motivo: i.type === "card" ? cardReasonPt(i.reason || (i.player ? motivoNarr.get(i.player) : null)) : null,
      lado: ld, placarMandante: i.homeScore, placarVisitante: i.awayScore, texto: i.text,
    };
  });
  const gols: GolV1[] = lances
    .filter((x) => x.tipo === "goal")
    .map((x) => ({ jogador: x.jogador, jogadorId: x.jogadorId, assistencia: x.assistencia, minuto: x.minuto, acrescimo: x.acrescimo, lado: x.lado, tipo: GOL_TIPO[x.detalhe] || "normal" }))
    .sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0) || (a.acrescimo ?? 0) - (b.acrescimo ?? 0));
  return {
    ...base,
    gols,
    resumo: resumoTexto(base, gols),
    lances,
    narracao: l.commentary.map((c) => ({ id: c.id, tipo: c.type, texto: c.textPt || c.text, minuto: c.minute, rotuloMinuto: c.minuteLabel ?? null, lado: lado(c.isHome), jogador: c.player, jogadorId: c.playerId ?? null, motivo: cardReasonPt(c.reason), html: c.html ?? null })),
    estatisticas: l.stats.map((s) => ({ nome: translateStat(s.name), mandante: s.home, visitante: s.away })),
    penaltis: l.shootout.map((k) => ({ ordem: k.sequence, jogador: k.player, jogadorId: idOf(k.player, k.isHome ? "mandante" : "visitante"), lado: k.isHome ? "mandante" : "visitante", converteu: k.scored, motivo: k.reason })),
  };
}

// Eventos de cada jogador (gol, assistência, cartão, entrada/saída) a partir dos lances.
function eventosPorJogador(lances: LanceV1[]): Map<number, EventoJogadorV1[]> {
  const m = new Map<number, EventoJogadorV1[]>();
  const push = (id: number | null, ev: EventoJogadorV1) => {
    if (!id) return;
    const l = m.get(id) || [];
    l.push(ev);
    m.set(id, l);
  };
  for (const x of lances) {
    const t = { minuto: x.minuto, acrescimo: x.acrescimo };
    if (x.tipo === "goal") {
      push(x.jogadorId, { tipo: x.detalhe === "ownGoal" ? "golContra" : x.detalhe === "penalty" ? "golPenalti" : "gol", ...t });
      push(x.assistenciaId, { tipo: "assistencia", ...t });
    } else if (x.tipo === "card" && CARTAO[x.detalhe]) {
      push(x.jogadorId, { tipo: CARTAO[x.detalhe], ...t, motivo: x.motivo });
    } else if (x.tipo === "substitution") {
      push(x.entrouId, { tipo: "entrou", ...t });
      push(x.saiuId, { tipo: "saiu", ...t });
    }
  }
  // Os lances chegam do mais recente pro mais antigo; ao lado do nome vai em ordem de minuto.
  for (const l of m.values()) l.sort((a, b) => (a.minuto ?? 0) - (b.minuto ?? 0) || (a.acrescimo ?? 0) - (b.acrescimo ?? 0));
  return m;
}

function escalacao(t: TeamLineup | null, evs: Map<number, EventoJogadorV1[]>): EscalacaoV1 | null {
  if (!t) return null;
  const p = (x: TeamLineup["starters"][number]) => ({ id: x.id, nome: x.name, numero: x.number, posicao: x.position, nota: x.rating, capitao: x.captain, foto: `/v1/imagens/jogador/${x.id}`, eventos: evs.get(x.id) || [] });
  return { formacao: t.formation, titulares: t.starters.map(p), reservas: t.bench.map(p) };
}

export function toJogoCompleto(d: MatchDetail): JogoCompletoV1 {
  const j = toJogo(d, d.home, d.away);
  const evs = eventosPorJogador(j.lances);
  return { ...j, escalacoes: { confirmadas: d.lineupsConfirmed, mandante: escalacao(d.home, evs), visitante: escalacao(d.away, evs) } };
}

export function toDia(groups: AgendaLeagueGroup[], onlyLive = false): DiaCampeonatoV1[] {
  return groups
    .map((g) => ({ campeonato: g.league, jogos: g.events.filter((e) => !onlyLive || e.statusType === "inprogress").map(fromAgendaEvent) }))
    .filter((g) => g.jogos.length > 0);
}

// Jogos de um dia a partir das tabelas/rodadas salvas (snapshots de campeonato): cobre qualquer
// data das temporadas configuradas sem consultar o fornecedor. [start, end) em segundos Unix.
export function dayFromChampionships(
  champs: { nome: string; jogos: ChampionshipMatch[] }[],
  start: number,
  end: number
): DiaCampeonatoV1[] {
  return champs
    .map((c) => ({
      campeonato: c.nome,
      jogos: c.jogos
        .filter((m) => m.timestamp >= start && m.timestamp < end)
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((m) => fromChampionshipMatch(m, c.nome)),
    }))
    .filter((g) => g.jogos.length > 0);
}

import type { TeamMatch, TeamPageData, TeamLastLineup } from "@/lib/data/team";
import { getBroadcasters } from "@/lib/broadcasters";

// Texto de contexto das páginas do cluster de times, montado a partir dos dados reais
// (tabela, resultados, calendário, artilharia, canais). Cada time e cada subpágina ganha
// um texto próprio, que muda conforme a temporada anda. Antes as subpáginas tinham só
// cards com ~60 palavras de molde (motivo do "conteúdo de baixo valor" do AdSense).

export type TeamNarrativePage =
  | "hub"
  | "jogoHoje"
  | "ondeAssistir"
  | "escalacao"
  | "proximos"
  | "estatisticas";

export interface TeamNarrative {
  title: string;
  paragraphs: string[];
}

// Times tratados no feminino ("a Chapecoense", "a Juventus").
const FEMININE = new Set(["chapecoense", "juventus", "inter-milan", "ponte-preta"]);

function articles(slug: string) {
  const f = FEMININE.has(slug);
  return { o: f ? "a" : "o", O: f ? "A" : "O", do: f ? "da" : "do", no: f ? "na" : "no" };
}

const TZ = "America/Sao_Paulo";

function longDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: TZ,
  });
}

function shortDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", { day: "numeric", month: "long", timeZone: TZ });
}

// "a" / "o" antes do nome do campeonato ("pela Série B", "pelo Campeonato Paulista").
function pelaLeague(league: string): string {
  const l = league.toLowerCase();
  const masc = /^(campeonato|brasileir|mundial|paulist|carioca|gauch|mineir|torneio)/.test(l);
  return `${masc ? "pelo" : "pela"} ${league}`;
}

// "no Allianz Parque" / "na Arena MRV".
function atVenue(venue: string): string {
  return `${/^(arena|neo química|ligga arena)/i.test(venue) ? "na" : "no"} ${venue}`;
}

function listPt(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} e ${items[items.length - 1]}`;
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

// "2 vitórias e 1 empate" — omite os zeros.
function tally(w: number, e: number, l: number): string {
  const parts: string[] = [];
  if (w) parts.push(plural(w, "vitória", "vitórias"));
  if (e) parts.push(plural(e, "empate", "empates"));
  if (l) parts.push(plural(l, "derrota", "derrotas"));
  return listPt(parts);
}

// "21:30" -> "21h30", "16:00" -> "16h"
const hour = (t: string) => t.replace(/:00$/, "h").replace(":", "h");

const finished = (m: TeamMatch) => m.status === "finished" && m.homeScore !== null && m.awayScore !== null;

function teamSide(m: TeamMatch, teamId: number) {
  const home = m.homeId === teamId;
  const gf = (home ? m.homeScore : m.awayScore) ?? 0;
  const ga = (home ? m.awayScore : m.homeScore) ?? 0;
  return { home, gf, ga, opponent: home ? m.away : m.home, outcome: gf > ga ? "V" : gf < ga ? "D" : "E" };
}

function scoreline(m: TeamMatch): string {
  return `${m.home} ${m.homeScore} x ${m.awayScore} ${m.away}`;
}

function recentFinished(d: TeamPageData, n: number): TeamMatch[] {
  return [...d.recentMatches]
    .filter(finished)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, n);
}

function upcoming(d: TeamPageData): TeamMatch[] {
  const now = Date.now() / 1000;
  return [...d.upcomingMatches]
    .filter((m) => !finished(m) && m.timestamp >= now - 3 * 3600)
    .sort((a, b) => a.timestamp - b.timestamp);
}

// ── Frases ────────────────────────────────────────────────────────────────

function standingSentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const s = d.standingPosition;
  if (!s || !d.tournament || !s.matches) return [];
  const pct = Math.round((s.pts / (s.matches * 3)) * 100);
  const out = [
    `${a.O} ${d.name} ocupa a ${s.pos}ª posição ${pelaLeague(d.tournament.name).replace(/^pel/, "d")} com ${plural(
      s.pts,
      "ponto",
      "pontos"
    )} em ${plural(s.matches, "jogo", "jogos")}: ${plural(s.wins, "vitória", "vitórias")}, ${plural(
      s.draws,
      "empate",
      "empates"
    )} e ${plural(s.losses, "derrota", "derrotas")}. O aproveitamento é de ${pct}%, com ${s.gf} gols marcados e ${
      s.ga
    } sofridos (saldo de ${s.gd > 0 ? `+${s.gd}` : s.gd}).`,
  ];

  const table = d.standingsTable;
  if (table.length >= 18) {
    const leader = table[0];
    const serieB = d.tournament.slug.includes("serie-b");
    const relegFirst = table[table.length - 4]; // 1º time dentro do Z-4
    const safeLast = table[table.length - 5]; // último time fora do Z-4
    if (s.pos === 1) {
      const second = table[1];
      out.push(
        `É o líder, ${
          s.pts === second.pts ? "empatado em pontos" : `com ${plural(s.pts - second.pts, "ponto", "pontos")} de vantagem`
        } sobre ${second.team}, o segundo colocado.`
      );
    } else {
      out.push(`Fica a ${plural(leader.pts - s.pts, "ponto", "pontos")} do líder, ${leader.team}.`);
    }
    if (s.pos <= 4) out.push(serieB ? "Neste momento está no G-4, a zona de acesso à Série A." : "Neste momento está no G-4.");
    if (s.pos > table.length - 4) {
      out.push(
        `Está na zona de rebaixamento, a ${plural(safeLast.pts - s.pts, "ponto", "pontos")} de ${safeLast.team}, o primeiro time fora dela.`
      );
    } else if (s.pos > 4) {
      out.push(`Tem ${plural(s.pts - relegFirst.pts, "ponto", "pontos")} de vantagem sobre a zona de rebaixamento.`);
    }
  }
  return out;
}

function formSentences(d: TeamPageData, n = 5): string[] {
  const a = articles(d.slug);
  const games = recentFinished(d, n);
  if (games.length === 0) return [];
  let w = 0, e = 0, l = 0, gf = 0, ga = 0;
  for (const m of games) {
    const t = teamSide(m, d.id);
    gf += t.gf;
    ga += t.ga;
    if (t.outcome === "V") w++;
    else if (t.outcome === "D") l++;
    else e++;
  }
  const last = games[0];
  const lt = teamSide(last, d.id);
  const lastWord = lt.outcome === "V" ? "vitória" : lt.outcome === "D" ? "derrota" : "empate";
  const out = [
    `Nos últimos ${plural(games.length, "jogo", "jogos")}, ${a.o} ${d.name} somou ${tally(w, e, l)}, com ${gf} gols marcados e ${ga} sofridos.`,
    `O resultado mais recente foi ${scoreline(last)}, em ${shortDate(last.timestamp)}, ${pelaLeague(last.league)}: ${lastWord} ${
      lt.home ? "em casa" : "fora de casa"
    }.`,
  ];
  // Sequência atual (3+ jogos com o mesmo tipo de resultado)
  let streak = 0;
  for (const m of games) {
    if (teamSide(m, d.id).outcome === lt.outcome) streak++;
    else break;
  }
  if (streak >= 3) {
    const word = lt.outcome === "V" ? "vitórias" : lt.outcome === "D" ? "derrotas" : "empates";
    out.push(`São ${streak} ${word} ${lt.outcome === "E" ? "seguidos" : "seguidas"}.`);
  }
  return out;
}

function nextMatchSentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const list = upcoming(d);
  const next = list[0];
  if (!next) return [`${a.O} ${d.name} ainda não tem próximo jogo confirmado no calendário.`];
  const home = next.homeId === d.id;
  const out = [
    `O próximo compromisso ${a.do} ${d.name} é ${next.home} x ${next.away}, ${longDate(next.timestamp)}, às ${hour(next.time)}${
      next.venue ? `, ${atVenue(next.venue)}` : ""
    }, ${pelaLeague(next.league)}. ${a.O} ${d.name} joga ${home ? "em casa" : "fora de casa"}.`,
  ];
  const after = list.slice(1, 3);
  if (after.length) {
    out.push(
      `Depois, a sequência tem ${listPt(after.map((m) => `${m.home} x ${m.away} (${shortDate(m.timestamp)})`))}.`
    );
  }
  return out;
}

function scheduleSentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const list = upcoming(d);
  if (list.length < 2) return [];
  const homeCount = list.filter((m) => m.homeId === d.id).length;
  const byLeague = new Map<string, number>();
  for (const m of list) byLeague.set(m.league, (byLeague.get(m.league) || 0) + 1);
  const leagues = [...byLeague.entries()].sort((x, y) => y[1] - x[1]);
  const first = list[0];
  const lastM = list[list.length - 1];
  const out = [
    `${a.O} ${d.name} tem ${plural(list.length, "jogo marcado", "jogos marcados")} entre ${shortDate(first.timestamp)} e ${shortDate(
      lastM.timestamp
    )}: ${homeCount} em casa e ${list.length - homeCount} fora.`,
  ];
  if (leagues.length > 1) {
    out.push(
      `A agenda divide ${listPt(leagues.map(([lg, n]) => `${plural(n, "jogo", "jogos")} ${pelaLeague(lg)}`))}.`
    );
  } else {
    out.push(`Todos são ${pelaLeague(leagues[0][0])}.`);
  }
  // Maior sequência fora de casa
  let run = 0, best = 0;
  for (const m of list) {
    run = m.homeId === d.id ? 0 : run + 1;
    best = Math.max(best, run);
  }
  if (best >= 2) out.push(`O trecho mais longe de casa tem ${best} jogos seguidos como visitante.`);
  return out;
}

function scorerSentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const top = d.topPlayers.filter((p) => p.goals > 0);
  if (!top.length || !d.tournament) return [];
  const [p1, ...rest] = top;
  const others = rest.slice(0, 2).map((p) => `${p.player.name} (${p.goals})`);
  const out = [
    `O artilheiro ${a.do} ${d.name} ${pelaLeague(d.tournament.name).replace(/^pel/, "n")} é ${p1.player.name}, com ${plural(
      p1.goals,
      "gol",
      "gols"
    )}${others.length ? `, seguido por ${listPt(others)}` : ""}.`,
  ];
  const gf = d.standingPosition?.gf || 0;
  const top3 = top.slice(0, 3).reduce((s, p) => s + p.goals, 0);
  if (gf > 0 && top.length >= 3 && top3 <= gf) {
    out.push(`Os três respondem por ${top3} dos ${gf} gols do time no campeonato (${Math.round((top3 / gf) * 100)}%).`);
  }
  return out;
}

const CHANNEL_KIND: Record<string, string> = {
  Globo: "TV aberta",
  SBT: "TV aberta",
  Record: "TV aberta",
  SporTV: "TV fechada",
  ESPN: "TV fechada",
  "TNT Sports": "TV fechada",
  Premiere: "pay-per-view",
  Globoplay: "streaming",
  "Disney+": "streaming",
  "Paramount+": "streaming",
  "HBO Max": "streaming",
  "Amazon Prime Video": "streaming",
  OneFootball: "streaming",
  "FIFA+": "streaming",
  "CazéTV": "YouTube, grátis",
};

export function channelKind(channel: string): string {
  return CHANNEL_KIND[channel] || "";
}

function broadcastSentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const list = upcoming(d).slice(0, 3);
  if (!list.length) return [`Sem jogo confirmado no calendário, ainda não há transmissão anunciada para ${a.o} ${d.name}.`];
  const out: string[] = [];
  const [next, ...rest] = list;
  const ch = getBroadcasters(next.league);
  if (ch.length) {
    out.push(
      `${next.home} x ${next.away}, ${longDate(next.timestamp)}, às ${hour(next.time)}, vale ${pelaLeague(next.league)}. Os direitos dessa competição no Brasil estão com ${listPt(
        ch.map((c) => (channelKind(c) ? `${c} (${channelKind(c)})` : c))
      )}.`,
      `Cada emissora escolhe quais jogos da rodada vai mostrar, então nem toda partida passa em todos os canais da lista. A grade de cada canal costuma sair na semana do jogo.`
    );
  } else {
    out.push(
      `${next.home} x ${next.away}, ${longDate(next.timestamp)}, às ${hour(next.time)}, vale ${pelaLeague(next.league)}. Não temos a lista de canais com direitos dessa competição; confira a grade das emissoras na semana do jogo.`
    );
  }
  const later = rest
    .map((m) => {
      const c = getBroadcasters(m.league);
      return c.length ? `${m.home} x ${m.away} (${shortDate(m.timestamp)}, ${m.league}): ${listPt(c)}` : "";
    })
    .filter(Boolean);
  if (later.length) out.push(`Nos jogos seguintes: ${later.join("; ")}.`);
  return out;
}

function lineupSentences(d: TeamPageData, lineup: TeamLastLineup | null): string[] {
  const a = articles(d.slug);
  if (!lineup) {
    return [
      `A escalação ${a.do} ${d.name} é confirmada cerca de uma hora antes da partida. Enquanto ela não sai, a melhor referência é o time que começou o último jogo.`,
    ];
  }
  const names = lineup.players.map((p) => p.name);
  return [
    `A provável escalação ${a.do} ${d.name} parte do time que começou o último jogo, contra ${lineup.opponent}, em ${lineup.date}, ${pelaLeague(
      lineup.league
    )}${lineup.formation ? `, no ${lineup.formation}` : ""}: ${listPt(names)}.`,
    `A escalação oficial sai cerca de uma hora antes da partida e pode mudar por lesão, suspensão ou escolha do técnico.`,
  ];
}

function todaySentences(d: TeamPageData): string[] {
  const a = articles(d.slug);
  const m = d.todayMatch;
  if (!m) return [];
  const home = m.homeId === d.id;
  if (finished(m)) {
    const t = teamSide(m, d.id);
    const word = t.outcome === "V" ? "venceu" : t.outcome === "D" ? "perdeu" : "empatou";
    return [`${a.O} ${d.name} jogou hoje e ${word}: ${scoreline(m)}, ${pelaLeague(m.league)}.`];
  }
  return [
    `${a.O} ${d.name} joga hoje: ${m.home} x ${m.away}, às ${hour(m.time)}${m.venue ? `, ${atVenue(m.venue)}` : ""}, ${pelaLeague(
      m.league
    )}. ${a.O} ${d.name} joga ${home ? "em casa" : "fora de casa"}.`,
  ];
}

// ── Montagem por página ────────────────────────────────────────────────────

export function buildTeamNarrative(
  d: TeamPageData,
  page: TeamNarrativePage,
  opts: { lineup?: TeamLastLineup | null } = {}
): TeamNarrative | null {
  const a = articles(d.slug);
  const join = (...parts: string[][]) => parts.map((p) => p.join(" ")).filter(Boolean);

  let n: TeamNarrative;
  switch (page) {
    case "hub":
      n = {
        title: `Como está ${a.o} ${d.name} na temporada`,
        paragraphs: join(standingSentences(d), formSentences(d), nextMatchSentences(d), scorerSentences(d)),
      };
      break;
    case "jogoHoje":
      n = {
        title: d.todayMatch ? `${a.O} ${d.name} hoje` : `Quando ${a.o} ${d.name} volta a jogar`,
        paragraphs: join(todaySentences(d), d.todayMatch ? [] : nextMatchSentences(d), formSentences(d, 3)),
      };
      break;
    case "ondeAssistir":
      // cada frase de canal vira um parágrafo próprio
      n = { title: `Transmissão dos jogos ${a.do} ${d.name}`, paragraphs: broadcastSentences(d) };
      break;
    case "escalacao":
      n = {
        title: `Provável escalação ${a.do} ${d.name}`,
        paragraphs: join(lineupSentences(d, opts.lineup ?? null), scorerSentences(d), nextMatchSentences(d).slice(0, 1)),
      };
      break;
    case "proximos":
      n = {
        title: `Calendário ${a.do} ${d.name}`,
        paragraphs: join(scheduleSentences(d), nextMatchSentences(d).slice(0, 1), standingSentences(d).slice(0, 1)),
      };
      break;
    case "estatisticas":
      n = {
        title: `Os números ${a.do} ${d.name} em 2026`,
        paragraphs: join(standingSentences(d), scorerSentences(d), formSentences(d, 10)),
      };
      break;
  }
  n.paragraphs = n.paragraphs.filter((p) => p.trim());
  return n.paragraphs.length ? n : null;
}

import { test } from "node:test";
import assert from "node:assert/strict";
import { toCampeonato, toRodada, toArtilharia, hasLiveMatch } from "./map-championship.ts";
import { fromChampionshipMatch, fromAgendaEvent, toJogoCompleto, toJogo, toDia } from "./map-match.ts";

const T = { slug: "brasileirao-serie-a", name: "Brasileirão Série A", id: 325, seasonId: 87678 };
const cm = (over: Record<string, unknown> = {}) => ({
  id: 1, home: "Cruzeiro", away: "Palmeiras", homeId: 1954, awayId: 1963, homeScore: 2, awayScore: 1,
  status: "finished", statusDesc: "Encerrado", timestamp: 1763496000, round: 34, ...over,
});
const champ = (over: Record<string, unknown> = {}) => ({
  tournament: { id: 325, seasonId: 87678, name: "Brasileirão Série A" },
  rounds: [33, 34], currentRound: 34,
  roundList: [
    { key: "33", round: 33, label: "Rodada 33", knockout: false },
    { key: "34", round: 34, label: "Rodada 34", knockout: false },
  ],
  standings: [{ name: "Brasileirão Série A", rows: [{ pos: 1, team: "Palmeiras", teamId: 1963, pts: 70, matches: 34, wins: 21, draws: 7, losses: 6, gf: 60, ga: 30, gd: 30, promo: "Libertadores", posChange: 0, recentForm: ["W", "D", "L"] }] }],
  matchesByRound: { "34": [cm()] },
  updatedAt: "2026-11-16T18:00:00.000Z",
  ...over,
});

test("campeonato: tabela em português, forma V/E/D, rodadas e escudo", () => {
  const c = toCampeonato(T, champ() as any);
  assert.equal(c.slug, "brasileirao-serie-a");
  assert.equal(c.rodadaAtual, "34");
  assert.deepEqual(c.rodadas.map((r) => r.chave), ["33", "34"]);
  const l = c.tabela[0].linhas[0];
  assert.equal(l.posicao, 1);
  assert.equal(l.pontos, 70);
  assert.deepEqual(l.ultimos, ["V", "E", "D"]);
  assert.deepEqual(l.time, { id: 1963, nome: "Palmeiras", escudo: "/v1/imagens/time/1963" });
  assert.equal(c.temJogoAoVivo, false);
});

test("campeonato sem roundList usa rounds numéricos", () => {
  const c = toCampeonato(T, champ({ roundList: undefined }) as any);
  assert.deepEqual(c.rodadas, [
    { chave: "33", numero: 33, nome: "Rodada 33", mataMata: false },
    { chave: "34", numero: 34, nome: "Rodada 34", mataMata: false },
  ]);
});

test("rodada inexistente devolve null; existente devolve jogos", () => {
  assert.equal(toRodada(champ() as any, "99"), null);
  const jogos = toRodada(champ() as any, "34")!;
  assert.equal(jogos.length, 1);
  assert.equal(jogos[0].status, "encerrado");
  assert.deepEqual(jogos[0].placar, { mandante: 2, visitante: 1 });
});

test("jogo com pênaltis expõe penaltis no placar", () => {
  const j = fromChampionshipMatch(cm({ homeScore: 1, awayScore: 1, homePens: 3, awayPens: 4 }) as any);
  assert.deepEqual(j.placar, { mandante: 1, visitante: 1, penaltisMandante: 3, penaltisVisitante: 4 });
});

test("hasLiveMatch detecta inprogress em qualquer rodada", () => {
  assert.equal(hasLiveMatch(champ({ matchesByRound: { "34": [cm({ status: "inprogress" })] } }) as any), true);
});

test("artilharia numera posição e aponta foto", () => {
  const a = toArtilharia([{ player: { id: 9, name: "Fulano da Silva", shortName: "F. Silva" }, team: { id: 1963, name: "Palmeiras" }, goals: 15, rating: 7.4 }]);
  assert.deepEqual(a[0], { posicao: 1, jogador: { id: 9, nome: "Fulano da Silva", foto: "/v1/imagens/jogador/9" }, time: { id: 1963, nome: "Palmeiras", escudo: "/v1/imagens/time/1963" }, gols: 15, nota: 7.4 });
});

const ev = (over: Record<string, unknown> = {}) => ({
  id: 77, homeId: 1954, awayId: 1963, home: "Cruzeiro", away: "Palmeiras", homeScore: 1, awayScore: 1,
  homePens: 3, awayPens: 4, winnerCode: 2, statusType: "finished", statusDesc: "Encerrado",
  startTimestamp: 1763496000, periodStart: 0, live: false,
  venue: { stadium: "Mineirão", city: "Belo Horizonte", country: "Brasil" }, referee: { name: "Juiz", country: "BR" }, ...over,
});
const detail = () => ({
  event: ev(),
  incidents: [{ type: "goal", cls: "regular", minute: 10, addedTime: null, player: "A", assist: "B", playerIn: null, playerOut: null, isHome: true, homeScore: 1, awayScore: 0, text: null }],
  commentary: [{ id: 5, type: "goal", text: "Goal", textPt: "Gol!", isHome: true, player: "A", playerId: 1, playerIn: null, playerInId: null, playerOut: null, reason: null, minute: 10 }],
  home: { formation: "4-3-3", starters: [{ id: 1, name: "A", number: 9, position: "F", rating: "7.5", captain: true }], bench: [] },
  away: null, lineupsConfirmed: true,
  stats: [{ name: "Posse de bola", home: "55%", away: "45%", homeNum: 55, awayNum: 45 }],
  shootout: [{ sequence: 1, player: "A", isHome: true, scored: true, reason: "scored" }],
});

test("jogo completo: lances, narração em PT, escalação, pênaltis, vencedor", () => {
  const j = toJogoCompleto(detail() as any);
  assert.equal(j.id, 77);
  assert.equal(j.status, "encerrado");
  assert.equal(j.vencedor, "visitante");
  assert.deepEqual(j.estadio, { nome: "Mineirão", cidade: "Belo Horizonte", pais: "Brasil" });
  assert.equal(j.arbitro, "Juiz");
  assert.equal(j.lances[0].lado, "mandante");
  assert.equal(j.narracao[0].texto, "Gol!");
  assert.equal(j.escalacoes.mandante!.titulares[0].foto, "/v1/imagens/jogador/1");
  assert.equal(j.escalacoes.visitante, null);
  assert.deepEqual(j.penaltis[0], { ordem: 1, jogador: "A", lado: "mandante", converteu: true, motivo: "scored" });
  assert.equal(j.inicio, "2025-11-18T17:00:00-03:00");
});

test("jogo ao vivo enxuto não tem escalações", () => {
  const d = detail();
  const j = toJogo({ event: ev({ statusType: "inprogress", statusDesc: "2º tempo" }), incidents: d.incidents, commentary: d.commentary, stats: d.stats, shootout: [] } as any);
  assert.equal(j.status, "ao_vivo");
  assert.equal("escalacoes" in j, false);
});

test("dia agrupa por campeonato e filtra ao vivo", () => {
  const e = (id: number, statusType: string) => ({ id, league: "Série A", home: "X", away: "Y", homeId: 1, awayId: 2, homeScore: 0, awayScore: 0, status: "", statusType, time: "16:00", timestamp: 1763496000 });
  const groups = [{ league: "Série A", events: [e(1, "inprogress"), e(2, "notstarted")] }, { league: "Série B", events: [e(3, "finished")] }];
  assert.equal(toDia(groups as any).length, 2);
  const live = toDia(groups as any, true);
  assert.equal(live.length, 1);
  assert.deepEqual(live[0].jogos.map((j) => j.id), [1]);
  assert.equal(fromAgendaEvent(e(9, "notstarted") as any).campeonato, "Série A");
});

test("dia montado das tabelas: só jogos dentro do dia (BRT), ordenados, por campeonato", async () => {
  const { dayFromChampionships } = await import("./map-match.ts");
  const start = Date.UTC(2026, 10, 18, 3) / 1000; // 18/11 00:00 BRT
  const end = start + 86400;
  const champs = [
    { nome: "Brasileirão Série A", jogos: [cm({ id: 2, timestamp: start + 80000 }), cm({ id: 1, timestamp: start + 3600 }), cm({ id: 3, timestamp: end })] },
    { nome: "Premier League", jogos: [cm({ id: 9, timestamp: start - 1 })] },
  ];
  const dia = dayFromChampionships(champs as any, start, end);
  assert.equal(dia.length, 1);
  assert.equal(dia[0].campeonato, "Brasileirão Série A");
  assert.deepEqual(dia[0].jogos.map((j) => j.id), [1, 2]);
});

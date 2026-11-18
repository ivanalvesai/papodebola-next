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
  assert.deepEqual(j.estadio, { nome: "Mineirão", cidade: "Belo Horizonte", pais: "Brasil", capacidade: null });
  assert.equal(j.arbitro, "Juiz");
  assert.equal(j.lances[0].lado, "mandante");
  assert.equal(j.narracao[0].texto, "Gol!");
  assert.equal(j.escalacoes.mandante!.titulares[0].foto, "/v1/imagens/jogador/1");
  assert.equal(j.escalacoes.visitante, null);
  assert.deepEqual(j.penaltis[0], { ordem: 1, jogador: "A", jogadorId: 1, lado: "mandante", converteu: true, motivo: "scored" });
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

// Caso real (18/11): Palmeiras 0x1 Fluminense, 5x3 nos pênaltis, semifinal da Libertadores (volta).
const palFlu = () => ({
  event: ev({
    id: 17116882, homeId: 1963, awayId: 1961, home: "Palmeiras", away: "Fluminense", homeScore: 0, awayScore: 1,
    homePens: 5, awayPens: 3, winnerCode: 1,
    venue: { stadium: "Nubank Parque", city: "São Paulo", country: "Brasil", capacity: 43713 },
    tournament: "Copa Libertadores", round: { number: 28, label: "Semifinal", slug: "semifinals", knockout: true },
    aggregate: { home: 2, away: 2 }, aggWinnerCode: 1, previousLegId: 17116828,
    managers: { home: "Abel Ferreira", away: "Marcão" },
  }),
  incidents: [
    { type: "period", cls: "", minute: 999, addedTime: 999, player: null, assist: null, playerIn: null, playerOut: null, isHome: null, homeScore: 5, awayScore: 3, text: "PEN" },
    { type: "goal", cls: "regular", minute: 82, addedTime: null, player: "Hércules", assist: "Wesley Natã", playerIn: null, playerOut: null, isHome: false, homeScore: 0, awayScore: 1, text: null },
    { type: "card", cls: "yellow", minute: 76, addedTime: null, player: "Jhon Arias", assist: null, playerIn: null, playerOut: null, isHome: true, homeScore: null, awayScore: null, text: null, reason: "Foul" },
    { type: "substitution", cls: "regular", minute: 60, addedTime: null, player: null, assist: null, playerIn: "Flaco López", playerOut: "Vitor Roque", isHome: true, homeScore: null, awayScore: null, text: null },
  ],
  commentary: [],
  home: { formation: "4-4-2", starters: [{ id: 10, name: "Jhon Arias", number: 11, position: "F", rating: "6.5", captain: false }, { id: 11, name: "Vitor Roque", number: 9, position: "F", rating: "6.1", captain: false }], bench: [{ id: 12, name: "Flaco López", number: 42, position: "F", rating: null, captain: false }] },
  away: { formation: "4-2-3-1", starters: [{ id: 20, name: "Hércules", number: 35, position: "M", rating: "8.0", captain: false }, { id: 21, name: "Wesley Natã", number: 7, position: "M", rating: "7.2", captain: false }], bench: [] },
  lineupsConfirmed: true,
  stats: [{ name: "Distance covered", home: "110 km", away: "112 km", homeNum: 110, awayNum: 112 }],
  shootout: [{ sequence: 1, player: "Jhon Arias", isHome: true, scored: true, reason: "scored" }],
});

test("jogo de volta com pênaltis: fase, agregado, quem avançou, técnicos, capacidade e resumo", () => {
  const j = toJogoCompleto(palFlu() as any);
  assert.equal(j.campeonato, "Copa Libertadores");
  assert.deepEqual(j.fase, { nome: "Semifinal", mataMata: true, chave: "semifinals" });
  assert.deepEqual(j.agregado, { mandante: 2, visitante: 2 });
  assert.equal(j.avancou, "mandante");
  assert.equal(j.jogoIdaId, 17116828);
  assert.deepEqual(j.tecnicos, { mandante: "Abel Ferreira", visitante: "Marcão" });
  assert.equal(j.estadio!.capacidade, 43713);
  assert.equal(j.resumo, "Fim de jogo: Palmeiras 0 x 1 Fluminense, pela semifinal da Copa Libertadores. Nos pênaltis, Palmeiras venceu por 5 a 3, depois do empate em 2 a 2 no agregado, e avançou. Gols: Hércules (82', Fluminense).");
});

test("lances: 999 vira null + rótulo; ids e motivo do cartão; gols no topo", () => {
  const j = toJogoCompleto(palFlu() as any);
  const fim = j.lances[0];
  assert.equal(fim.minuto, null);
  assert.equal(fim.acrescimo, null);
  assert.equal(fim.rotulo, "Fim da disputa de pênaltis");
  const gol = j.lances[1];
  assert.equal(gol.jogadorId, 20);
  assert.equal(gol.assistenciaId, 21);
  assert.equal(j.lances[2].motivo, "Falta");
  assert.equal(j.lances[3].entrouId, 12);
  assert.equal(j.lances[3].saiuId, 11);
  assert.deepEqual(j.gols, [{ jogador: "Hércules", jogadorId: 20, assistencia: "Wesley Natã", minuto: 82, acrescimo: null, lado: "visitante", tipo: "normal" }]);
  assert.equal(j.penaltis[0].jogadorId, 10);
  assert.equal(j.estatisticas[0].nome, "Distância percorrida");
});

test("escalação: eventos de cada jogador", () => {
  const e = toJogoCompleto(palFlu() as any).escalacoes;
  assert.deepEqual(e.visitante!.titulares[0].eventos, [{ tipo: "gol", minuto: 82, acrescimo: null }]);
  assert.deepEqual(e.visitante!.titulares[1].eventos, [{ tipo: "assistencia", minuto: 82, acrescimo: null }]);
  assert.deepEqual(e.mandante!.titulares[0].eventos, [{ tipo: "amarelo", minuto: 76, acrescimo: null, motivo: "Falta" }]);
  assert.deepEqual(e.mandante!.titulares[1].eventos, [{ tipo: "saiu", minuto: 60, acrescimo: null }]);
  assert.deepEqual(e.mandante!.reservas[0].eventos, [{ tipo: "entrou", minuto: 60, acrescimo: null }]);
});

test("resumo por rodada usa o artigo do campeonato", () => {
  const d = palFlu() as any;
  d.event = ev({ tournament: "Brasileirão Série A", round: { number: 34, label: "Rodada 34", slug: null, knockout: false }, homePens: null, awayPens: null, homeScore: 2, awayScore: 1, winnerCode: 1 });
  d.incidents = [];
  assert.equal(toJogoCompleto(d).resumo, "Fim de jogo: Cruzeiro 2 x 1 Palmeiras, pela 34ª rodada do Brasileirão Série A.");
  assert.equal(toJogoCompleto(d).rodada, 34);
});

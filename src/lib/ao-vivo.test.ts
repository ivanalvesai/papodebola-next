import { test } from "node:test";
import assert from "node:assert/strict";
import { splitByStatus, liveEndpointsFor } from "./ao-vivo.ts";

const ev = (id: number, statusType: string, timestamp = 0) => ({ id, statusType, timestamp });
const leagues = [
  { league: "Liga das Nações", events: [ev(1, "inprogress"), ev(2, "notstarted", 200), ev(3, "finished")] },
  { league: "Brasileirão Série B", events: [ev(4, "notstarted", 100)] },
];

test("splitByStatus separa ao vivo / ainda hoje / encerrados mantendo o campeonato", () => {
  const s = splitByStatus(leagues);
  assert.deepEqual(s.live.map((l) => [l.league, l.events.map((e) => e.id)]), [["Liga das Nações", [1]]]);
  assert.deepEqual(s.upcoming.map((l) => [l.league, l.events.map((e) => e.id)]), [
    ["Brasileirão Série B", [4]],
    ["Liga das Nações", [2]],
  ]);
  assert.deepEqual(s.finished.map((l) => l.events.map((e) => e.id)), [[3]]);
});

test("liveEndpointsFor: só campeonatos conhecidos com jogo ao vivo ou começando em até 30 min", () => {
  const now = 1000;
  const ls = [
    { league: "Liga das Nações", events: [ev(1, "notstarted", now + 600)] },
    { league: "Brasileirão Série B", events: [ev(2, "notstarted", now + 7200)] },
    { league: "Campeonato Desconhecido", events: [ev(3, "inprogress")] },
  ];
  assert.deepEqual(liveEndpointsFor(ls, now), ["/api/championship/liga-das-nacoes/ao-vivo"]);
});

import { orderCompetitions, competitionIntro } from "./ao-vivo.ts";
test("orderCompetitions: campeonato com jogo ao vivo primeiro; dentro, ao vivo > próximos > encerrados", () => {
  const ls = [
    { league: "Série B", events: [ev(1, "notstarted", 50)] },
    { league: "Liga das Nações", events: [ev(2, "finished", 10), ev(3, "notstarted", 300), ev(4, "inprogress", 20)] },
    { league: "Copa", events: [ev(5, "finished", 5)] },
  ];
  const o = orderCompetitions(ls);
  assert.deepEqual(o.map((l) => l.league), ["Liga das Nações", "Série B", "Copa"]);
  assert.deepEqual(o[0].events.map((e) => e.id), [4, 3, 2]);
});
test("competitionIntro resume jogos, ao vivo e encerrados", () => {
  assert.match(competitionIntro("Liga das Nações", [ev(1, "inprogress"), ev(2, "finished"), ev(3, "notstarted")]), /^3 jogos da Liga das Nações hoje, 1 rolando agora, 1 encerrado\./);
  assert.match(competitionIntro("Série B", [ev(1, "notstarted")]), /^1 jogo da Série B hoje\./);
});

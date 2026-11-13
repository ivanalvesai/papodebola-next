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

import { test } from "node:test";
import assert from "node:assert/strict";
import { isMatchRegression, isChampionshipRegression, countFinishedMatches } from "./snapshot-guards.ts";

const ev = (statusType: string) => ({ event: { statusType } });

test("jogo: encerrado -> não encerrado é regressão", () => {
  assert.equal(isMatchRegression(ev("finished"), ev("inprogress")), true);
  assert.equal(isMatchRegression(ev("finished"), ev("notstarted")), true);
  assert.equal(isMatchRegression(ev("finished"), { event: null }), true);
  assert.equal(isMatchRegression(ev("finished"), ev("finished")), false);
  assert.equal(isMatchRegression(ev("inprogress"), ev("notstarted")), false);
  assert.equal(isMatchRegression(ev("inprogress"), ev("finished")), false);
  assert.equal(isMatchRegression(null, ev("inprogress")), false);
});

const champ = (seasonId: number, statuses: string[][]) => ({
  tournament: { seasonId },
  matchesByRound: Object.fromEntries(statuses.map((r, i) => [String(i + 1), r.map((status) => ({ status }))])),
});

test("campeonato: conta encerrados em todas as rodadas", () => {
  assert.equal(countFinishedMatches(champ(1, [["finished", "finished"], ["inprogress", "finished", "notstarted"]])), 3);
  assert.equal(countFinishedMatches(null), 0);
  assert.equal(countFinishedMatches({ matchesByRound: { a: null } }), 0);
});

test("campeonato: menos encerrados que o snapshot é regressão (mesma temporada)", () => {
  const prev = champ(10, [["finished", "finished"], ["finished"]]);
  assert.equal(isChampionshipRegression(prev, champ(10, [["finished", "finished"], ["inprogress"]])), true);
  assert.equal(isChampionshipRegression(prev, champ(10, [["finished", "finished"], ["finished"]])), false);
  assert.equal(isChampionshipRegression(prev, champ(10, [["finished", "finished"], ["finished", "finished"]])), false);
  assert.equal(isChampionshipRegression(prev, champ(10, [])), true);
  // Virada de temporada: sempre aceita o dado novo.
  assert.equal(isChampionshipRegression(prev, champ(11, [["notstarted"]])), false);
  assert.equal(isChampionshipRegression(null, champ(10, [])), false);
});

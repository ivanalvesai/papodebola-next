import { test } from "node:test";
import assert from "node:assert/strict";
import { splitCountdown, nextMatchFor } from "./countdown.ts";

test("splitCountdown quebra ms em dias/horas/min/seg (floor)", () => {
  const ms = ((2 * 24 + 3) * 3600 + 4 * 60 + 5) * 1000 + 999;
  assert.deepEqual(splitCountdown(ms), { d: 2, h: 3, m: 4, s: 5 });
});

test("splitCountdown nunca fica negativo", () => {
  assert.deepEqual(splitCountdown(-5000), { d: 0, h: 0, m: 0, s: 0 });
  assert.deepEqual(splitCountdown(Number.NaN), { d: 0, h: 0, m: 0, s: 0 });
});

test("nextMatchFor prefere o jogo de hoje", () => {
  const today = { id: 1, timestamp: 100 };
  const next = { id: 2, timestamp: 200 };
  assert.equal(nextMatchFor({ todayMatch: today, upcomingMatches: [next] }), today);
});

test("nextMatchFor cai no primeiro próximo jogo", () => {
  const next = { id: 2, timestamp: 200 };
  assert.equal(nextMatchFor({ todayMatch: null, upcomingMatches: [next, { id: 3, timestamp: 300 }] }), next);
});

test("nextMatchFor devolve null sem jogos ou sem dados", () => {
  assert.equal(nextMatchFor({ todayMatch: null, upcomingMatches: [] }), null);
  assert.equal(nextMatchFor(null), null);
});

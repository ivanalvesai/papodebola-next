import { test } from "node:test";
import assert from "node:assert/strict";
import { matchHref } from "./match-href.ts";

const deps = {
  champSlugById: { 325: "brasileirao-serie-a" } as Record<number, string>,
  isWorldCup: (m: { uniqueTournamentId: number }) => m.uniqueTournamentId === 16,
  worldCupHref: (ts: number, h: number, a: number) => `/futebol/copa-do-mundo/jogo/${ts}/${h}-${a}`,
  champHref: (s: string, ts: number, h: number, a: number) => `/futebol/${s}/jogo/${ts}/${h}-${a}`,
};
const base = { timestamp: 100, homeId: 1, awayId: 2, home: "A", away: "B", tournamentName: "" };

test("campeonato com página → href do campeonato", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325 }, deps), "/futebol/brasileirao-serie-a/jogo/100/1-2");
});

test("Copa → href da Copa", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 16 }, deps), "/futebol/copa-do-mundo/jogo/100/1-2");
});

test("torneio sem página ou dado faltando → null", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 999 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, timestamp: 0 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, homeId: 0 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 0 }, deps), null);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { matchHref } from "./match-href.ts";

const deps = {
  champSlugById: { 325: "brasileirao-serie-a" } as Record<number, string>,
  champSeasonById: { 325: 87678 } as Record<number, number>,
  nowSec: 1000,
  maxAheadSec: 7 * 86400,
  isWorldCup: (m: { uniqueTournamentId: number }) => m.uniqueTournamentId === 16,
  worldCupHref: (ts: number, h: number, a: number) => `/futebol/copa-do-mundo/jogo/${ts}/${h}-${a}`,
  champHref: (s: string, ts: number, h: number, a: number) => `/futebol/${s}/jogo/${ts}/${h}-${a}`,
};
const base = { timestamp: 100, homeId: 1, awayId: 2, home: "A", away: "B", tournamentName: "", seasonId: 87678 };

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

test("jogo de outra temporada (ex.: europeia anterior) → null", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, seasonId: 72034 }, deps), null);
});

test("jogo além de 7 dias (rodada não carregada pela tabela) → null; dentro → href", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, timestamp: 1000 + 8 * 86400 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, timestamp: 1000 + 6 * 86400 }, deps), "/futebol/brasileirao-serie-a/jogo/" + (1000 + 6 * 86400) + "/1-2");
});

test("sem seasonId no evento não bloqueia", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, seasonId: 0 }, deps), "/futebol/brasileirao-serie-a/jogo/100/1-2");
});

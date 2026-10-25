import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTeamNext } from "./team-next-format.ts";

// seg 26/10/2026 20:00 BRT = 23:00 UTC
const ts = Date.parse("2026-10-26T23:00:00Z") / 1000;
const m = { homeId: 5981, awayId: 1977, home: "Flamengo", away: "Atlético-MG", league: "Brasileirão Série A", timestamp: ts };

test("adversário pelo lado, data curta e hora cheia", () => {
  assert.deepEqual(formatTeamNext(m, 5981), { opponent: "Atlético-MG", date: "seg 26/10", time: "20h", league: "Brasileirão Série A" });
  assert.equal(formatTeamNext(m, 1977)?.opponent, "Flamengo");
});

test("hora quebrada", () => {
  assert.equal(formatTeamNext({ ...m, timestamp: ts + 30 * 60 }, 5981)?.time, "20h30");
});

test("sem jogo ou timestamp inválido → null", () => {
  assert.equal(formatTeamNext(null, 5981), null);
  assert.equal(formatTeamNext({ ...m, timestamp: 0 }, 5981), null);
});

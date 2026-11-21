import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreOf, pensOf } from "./score.ts";

test("scoreOf ignora os pênaltis somados no current (Palmeiras 0x1 Flu, 5x3 nos pênaltis)", () => {
  assert.equal(scoreOf({ current: 5, display: 0, penalties: 5 }), 0);
  assert.equal(scoreOf({ current: 4, display: 1, penalties: 3 }), 1);
  assert.equal(pensOf({ current: 5, display: 0, penalties: 5 }), 5);
});

test("scoreOf cai pro current sem display e devolve null sem placar", () => {
  assert.equal(scoreOf({ current: 2 }), 2);
  assert.equal(scoreOf(null), null);
  assert.equal(pensOf({ current: 2 }), null);
});

test("scoreOf rejeita display negativo da API e usa o current", () => {
  assert.equal(scoreOf({ current: 2, display: -1, penalties: 3 }), 2);
});

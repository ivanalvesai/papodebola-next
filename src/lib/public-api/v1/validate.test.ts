import { test } from "node:test";
import assert from "node:assert/strict";
import { parseId, parseDay, isStale } from "./validate.ts";

test("parseId aceita inteiro positivo e rejeita o resto", () => {
  assert.equal(parseId("15526001"), 15526001);
  for (const bad of ["abc", "0", "-1", "1.5", "", "99999999999"]) assert.throws(() => parseId(bad), /inválid/);
});

test("parseDay só aceita AAAA-MM-DD dentro da janela", () => {
  const now = Date.UTC(2026, 10, 16, 15); // 16/11/2026 12h BRT
  assert.equal(parseDay("2026-11-20", now).toISOString(), "2026-11-20T15:00:00.000Z");
  for (const bad of ["20/11/2026", "2026-13-01", "1999-01-01", "2028-01-01", null]) assert.throws(() => parseDay(bad as any, now));
});

test("isStale compara idade com o limite", () => {
  const now = Date.parse("2026-11-16T18:00:00Z");
  assert.equal(isStale("2026-11-16T17:59:00Z", 300, now), false);
  assert.equal(isStale("2026-11-16T17:00:00Z", 300, now), true);
  assert.equal(isStale(undefined, 300, now), true);
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "./rate-limit.ts";

test("token bucket: estoura na cota e recupera com o tempo", () => {
  let t = 0;
  const rl = createRateLimiter(() => t);
  for (let i = 0; i < 3; i++) assert.equal(rl.take("k", 3).ok, true);
  const r = rl.take("k", 3);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.retryAfter >= 1);
  t += 20_000; // 20 s = 1 ficha (3/min)
  assert.equal(rl.take("k", 3).ok, true);
  assert.equal(rl.take("outra", 3).ok, true);
});

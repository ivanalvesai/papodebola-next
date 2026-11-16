import { test } from "node:test";
import assert from "node:assert/strict";
import { createResponseCache } from "./response-cache.ts";

test("pedidos simultâneos = uma carga; respeita TTL", async () => {
  let t = 0, calls = 0;
  const c = createResponseCache(() => t);
  const load = async () => { calls++; await new Promise((r) => setTimeout(r, 5)); return { value: calls, ttl: 10 }; };
  const all = await Promise.all(Array.from({ length: 50 }, () => c.get("x", load)));
  assert.equal(calls, 1);
  assert.ok(all.every((v) => v === 1));
  t += 9_000; assert.equal(await c.get("x", load), 1);
  t += 2_000; assert.equal(await c.get("x", load), 2);
});

test("erro na carga não fica cacheado", async () => {
  const c = createResponseCache(() => 0);
  await assert.rejects(c.get("y", async () => { throw new Error("boom"); }));
  assert.equal(await c.get("y", async () => ({ value: "ok", ttl: 10 })), "ok");
});

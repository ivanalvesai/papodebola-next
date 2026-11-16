import { test } from "node:test";
import assert from "node:assert/strict";
import { authorize } from "./authorize.ts";
import { newRecord } from "./keys.ts";
import { createRateLimiter } from "./rate-limit.ts";
import { createResponseCache } from "./response-cache.ts";
import { clientIp } from "./client-ip.ts";
import { apiGate } from "./gate.ts";
import { runCached } from "./cached-call.ts";
import { V1ErrorLike } from "./v1/v1-error.ts";
import { ownGet } from "./v1/validate.ts";
import { preferSnapshot } from "./v1/live-source.ts";
import { imageOrigin } from "./v1/image-origin.ts";
import { toRodada } from "./v1/map-championship.ts";

test("gate: /v1 só no container da API; dev só em modo de teste; prod desligado", () => {
  assert.equal(apiGate({ PDB_API_MODE: "1" }), "api");
  assert.equal(apiGate({ PDB_API_DEV: "1" }), "dev");
  assert.equal(apiGate({}), "off");
});

test("modo dev só aceita chave com IP '*' (chave do parceiro vazada não serve no dev)", () => {
  const bound = newRecord("parceiro", ["10.0.0.1"]);
  const open = newRecord("teste", ["*"]);
  const rl = createRateLimiter(() => 0);
  const r = authorize({ key: bound.key, ip: "10.0.0.1", records: [bound.record], mode: "dev" }, rl);
  assert.equal(!r.ok && r.codigo, "ip_nao_autorizado");
  assert.equal(authorize({ key: open.key, ip: "1.1.1.1", records: [open.record], mode: "dev" }, rl).ok, true);
  assert.equal(authorize({ key: bound.key, ip: "10.0.0.1", records: [bound.record], mode: "api" }, rl).ok, true);
});

test("IP de origem só do X-Real-IP (o nginx sobrescreve); ignora cabeçalhos forjáveis", () => {
  assert.equal(clientIp(new Headers({ "x-real-ip": "1.2.3.4", "cf-connecting-ip": "9.9.9.9" })), "1.2.3.4");
  assert.equal(clientIp(new Headers({ "cf-connecting-ip": "9.9.9.9", "x-forwarded-for": "8.8.8.8" })), null);
});

test("404 fica em cache (id inventado em loop não vira consulta ao fornecedor); 500 não", async () => {
  const cache = createResponseCache(() => 0);
  let calls = 0;
  const notFound = async () => { calls++; throw new V1ErrorLike(404, "nao_encontrado", "x"); };
  await assert.rejects(runCached(cache, "a", notFound));
  await assert.rejects(runCached(cache, "a", notFound));
  assert.equal(calls, 1);
  let boom = 0;
  const crash = async () => { boom++; throw new Error("boom"); };
  await assert.rejects(runCached(cache, "b", crash));
  await assert.rejects(runCached(cache, "b", crash));
  assert.equal(boom, 2);
});

test("cache informa se a chave está fresca (para limitar misses por chave)", async () => {
  let t = 0;
  const c = createResponseCache(() => t);
  assert.equal(c.has("x"), false);
  await c.get("x", async () => ({ value: 1, ttl: 10 }));
  assert.equal(c.has("x"), true);
  t += 11_000;
  assert.equal(c.has("x"), false);
});

test("ownGet ignora chaves do protótipo (constructor, __proto__, toString)", () => {
  const m = Object.fromEntries([["a", 1]]);
  assert.equal(ownGet(m, "a"), 1);
  for (const k of ["constructor", "__proto__", "toString", "hasOwnProperty"]) assert.equal(ownGet(m, k), undefined);
});

test("rodada 'constructor' é 404, não exceção", () => {
  const d = { tournament: { id: 1, seasonId: 1, name: "x" }, rounds: [], currentRound: 1, standings: [], matchesByRound: { "1": [] }, updatedAt: "" };
  assert.equal(toRodada(d as any, "constructor"), null);
  assert.equal(toRodada(d as any, "__proto__"), null);
});

test("ao vivo usa o snapshot quando o jogo acabou ou o feed falhou", () => {
  assert.equal(preferSnapshot(null), true);
  assert.equal(preferSnapshot({ event: { statusType: "finished" } } as any), true);
  assert.equal(preferSnapshot({ event: { statusType: "inprogress" } } as any), false);
  assert.equal(preferSnapshot({ event: { statusType: "notstarted" } } as any), false);
});

test("origem das imagens: no modo API exige PDB_IMG_ORIGIN (nunca o próprio container)", () => {
  assert.equal(imageOrigin({ PDB_API_MODE: "1" }), null);
  assert.equal(imageOrigin({ PDB_API_MODE: "1", PDB_IMG_ORIGIN: "http://dev:3001" }), "http://dev:3001");
  assert.equal(imageOrigin({}), "http://127.0.0.1:3000");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, fail, isoBrt } from "./envelope.ts";

test("ok monta envelope data+meta com JSON e sem CORS", async () => {
  const r = ok({ a: 1 }, { atualizadoEm: "x", desatualizado: false, proximaAtualizacaoSugerida: 10 });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(r.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await r.json(), { data: { a: 1 }, meta: { atualizadoEm: "x", desatualizado: false, proximaAtualizacaoSugerida: 10 } });
});

test("fail monta erro com codigo/mensagem e headers extras", async () => {
  const r = fail(429, "limite_excedido", "calma", { "retry-after": "3" });
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "3");
  assert.deepEqual(await r.json(), { erro: { codigo: "limite_excedido", mensagem: "calma" } });
});

test("isoBrt converte para -03:00", () => {
  assert.equal(isoBrt(Date.UTC(2026, 10, 16, 18, 42, 10)), "2026-11-16T15:42:10-03:00");
  assert.equal(isoBrt("2026-11-16T02:00:00.000Z"), "2026-11-15T23:00:00-03:00");
});

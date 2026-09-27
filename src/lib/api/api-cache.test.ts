import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cacheKey,
  shouldFallback,
  shouldWrite,
  __resetWrites,
  recordResult,
  breakerOpen,
  __resetBreaker,
} from "./api-cache.ts";

test("cacheKey é estável e seguro pra nome de arquivo", () => {
  const a = cacheKey("team/1963/matches/next/0");
  assert.equal(a, cacheKey("team/1963/matches/next/0"));
  assert.match(a, /^[a-f0-9]{40}$/);
  assert.notEqual(a, cacheKey("team/1963/matches/previous/0"));
});

test("fallback só quando a API falhou e o endpoint não é ao vivo", () => {
  assert.equal(shouldFallback(true, 1800), false);  // sucesso (inclui 204 com null)
  assert.equal(shouldFallback(false, 1800), true);
  assert.equal(shouldFallback(false, 60), true);
  assert.equal(shouldFallback(false, 59), false);   // ao vivo: nunca dado velho
  assert.equal(shouldFallback(false, 10), false);
});

test("escrita limitada a 1 por endpoint a cada 10 min e até 5 MB", () => {
  __resetWrites();
  const t0 = 1_000_000;
  assert.equal(shouldWrite("k", t0, 100), true);
  assert.equal(shouldWrite("k", t0 + 60_000, 100), false);
  assert.equal(shouldWrite("k", t0 + 600_001, 100), true);
  assert.equal(shouldWrite("big", t0, 5 * 1024 * 1024 + 1), false);
});

test("disjuntor: abre após 5 falhas consecutivas, half-open aos 60s, fecha com sucesso", () => {
  __resetBreaker();
  const t0 = 10_000_000;

  recordResult(false, t0);
  recordResult(false, t0);
  recordResult(false, t0);
  recordResult(false, t0);
  assert.equal(breakerOpen(t0), false); // 4 falhas: ainda fechado

  recordResult(false, t0); // 5ª falha consecutiva
  assert.equal(breakerOpen(t0), true); // abre

  assert.equal(breakerOpen(t0 + 59_999), true); // continua aberto dentro da janela
  assert.equal(breakerOpen(t0 + 60_000), false); // half-open: deixa passar a próxima

  recordResult(false, t0 + 60_000); // falha no half-open
  assert.equal(breakerOpen(t0 + 60_000), true); // reabre por mais 60s
  assert.equal(breakerOpen(t0 + 60_000 + 59_999), true);
  assert.equal(breakerOpen(t0 + 120_000), false); // half-open de novo

  recordResult(true, t0 + 120_000); // sucesso no half-open
  assert.equal(breakerOpen(t0 + 120_000), false); // fecha e reseta
  assert.equal(breakerOpen(t0 + 120_001), false);
});

test("disjuntor: sucesso entre falhas reseta a contagem de consecutivas", () => {
  __resetBreaker();
  const t0 = 20_000_000;
  recordResult(false, t0);
  recordResult(false, t0);
  recordResult(true, t0); // reseta a contagem
  recordResult(false, t0);
  recordResult(false, t0);
  recordResult(false, t0);
  recordResult(false, t0);
  assert.equal(breakerOpen(t0), false); // só 4 consecutivas desde o reset
});

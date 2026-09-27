import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cacheKey,
  shouldSerialize,
  shouldWrite,
  parseCachedEndpoint,
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

test("serialização: no máximo 1 checagem por endpoint a cada 60s", () => {
  __resetWrites();
  const t0 = 1_000_000;
  assert.equal(shouldSerialize("k", t0), true);
  assert.equal(shouldSerialize("k", t0 + 59_999), false);
  assert.equal(shouldSerialize("outro", t0 + 1), true);
  assert.equal(shouldSerialize("k", t0 + 60_000), true);
});

test("escrita: conteúdo mudou grava na hora; igual pula (regrava 1x/dia); até 5 MB", () => {
  __resetWrites();
  const t0 = 1_000_000;
  assert.equal(shouldWrite("k", 100, "h1", t0), true);
  assert.equal(shouldWrite("k", 100, "h1", t0 + 60_000), false); // igual: pula
  assert.equal(shouldWrite("k", 100, "h2", t0 + 61_000), true); // mudou: grava mesmo < 10 min
  assert.equal(shouldWrite("k", 100, "h2", t0 + 61_000 + 23 * 3600_000), false);
  assert.equal(shouldWrite("k", 100, "h2", t0 + 61_000 + 24 * 3600_000), true); // refresh do mtime
  assert.equal(shouldWrite("big", 5 * 1024 * 1024 + 1, "h", t0), false);
  assert.equal(shouldWrite("big", 100, "h", t0), true); // o grande não marcou o hash
});

test("parseCachedEndpoint lê o endpoint do começo do arquivo", () => {
  const body = JSON.stringify({ endpoint: "match/1/incidents", savedAt: "x", data: { a: 1 } });
  assert.equal(parseCachedEndpoint(body.slice(0, 40)), "match/1/incidents");
  assert.equal(parseCachedEndpoint('{"endpoint":"a\\"b/c","data":1}'), 'a"b/c');
  assert.equal(parseCachedEndpoint('{"data":1,"endpoint":"x"}'), null);
  assert.equal(parseCachedEndpoint('{"endpoint":"trunca'), null);
  assert.equal(parseCachedEndpoint(""), null);
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

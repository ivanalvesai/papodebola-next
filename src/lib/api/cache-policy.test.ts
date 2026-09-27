import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isLiveEndpoint,
  isMatchSubEndpoint,
  shouldDiskCache,
  shouldFallback,
  isSavableResponse,
} from "./cache-policy.ts";

test("isLiveEndpoint: qualquer caminho terminado em /live (antes do ?)", () => {
  assert.equal(isLiveEndpoint("matches/live"), true);
  assert.equal(isLiveEndpoint("basketball/matches/live"), true);
  assert.equal(isLiveEndpoint("tennis/events/live"), true);
  assert.equal(isLiveEndpoint("sport/football/events/live?x=1"), true);
  assert.equal(isLiveEndpoint("/matches/live/"), true);
  assert.equal(isLiveEndpoint("matches/1/2/2026"), false);
  assert.equal(isLiveEndpoint("team/1963/matches/next/0"), false);
  assert.equal(isLiveEndpoint("tournament/16/season/58210/rounds?live=1"), false);
  assert.equal(isLiveEndpoint("team/1/delivery"), false);
});

test("isMatchSubEndpoint: match/{id}/... sim; match/{id} não", () => {
  assert.equal(isMatchSubEndpoint("match/123/incidents"), true);
  assert.equal(isMatchSubEndpoint("match/123/lineups"), true);
  assert.equal(isMatchSubEndpoint("match/123/votes"), true);
  assert.equal(isMatchSubEndpoint("match/123"), false);
  assert.equal(isMatchSubEndpoint("match/123?x=1"), false);
  assert.equal(isMatchSubEndpoint("matches/live"), false);
});

test("shouldDiskCache exclui ao vivo e sub-endpoints de jogo", () => {
  assert.equal(shouldDiskCache("match/123"), true);
  assert.equal(shouldDiskCache("tournament/325/season/1/standings/total"), true);
  assert.equal(shouldDiskCache("match/123/commentary"), false);
  assert.equal(shouldDiskCache("matches/live"), false);
});

test("fallback só quando a API falhou, TTL não é ao vivo e o endpoint é cacheável", () => {
  const ep = "team/1963/matches/next/0";
  assert.equal(shouldFallback(true, 1800, ep), false); // sucesso (inclui 204 com null)
  assert.equal(shouldFallback(false, 1800, ep), true);
  assert.equal(shouldFallback(false, 60, ep), true);
  assert.equal(shouldFallback(false, 59, ep), false); // ao vivo: nunca dado velho
  assert.equal(shouldFallback(false, 10, ep), false);
  assert.equal(shouldFallback(false, 300, "matches/live"), false); // /live com TTL longo
  assert.equal(shouldFallback(false, 60, "tennis/events/live"), false);
  assert.equal(shouldFallback(false, 86400, "match/1/lineups"), false);
});

test("isSavableResponse: 404 com corpo e corpo com `error` não viram cópia boa", () => {
  assert.equal(isSavableResponse(200, { events: [] }), true);
  assert.equal(isSavableResponse(undefined, { events: [] }), true);
  assert.equal(isSavableResponse(200, [1, 2]), true);
  assert.equal(isSavableResponse(204, null), false);
  assert.equal(isSavableResponse(200, null), false);
  assert.equal(isSavableResponse(404, { events: [] }), false);
  assert.equal(isSavableResponse(200, { error: { code: 404 } }), false);
});

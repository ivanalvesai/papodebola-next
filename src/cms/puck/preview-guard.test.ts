import { test } from "node:test";
import assert from "node:assert/strict";
import { isFramedBlockType, isValidPreviewId, isPreviewKey, parsePreviewBody, createPreviewStore } from "./preview-guard.ts";

test("só blocos do iframe passam (nunca embed/HTML)", () => {
  for (const s of ["teamWidget", "standings", "scorers", "newsFeed", "liveMatch", "todayGames", "mediaText", "tabs", "formBlock", "countdown", "snippet"]) assert.equal(isFramedBlockType(s), true, s);
  for (const s of ["embed", "hero", "richText", "", undefined, 1]) assert.equal(isFramedBlockType(s), false, String(s));
});
test("id do item: só letras/números/_/-, até 100", () => {
  assert.equal(isValidPreviewId("Standings-1a2b_c"), true);
  assert.equal(isValidPreviewId("</script><script>alert(1)</script>"), false);
  assert.equal(isValidPreviewId(""), false);
  assert.equal(isValidPreviewId("a".repeat(101)), false);
  assert.equal(isValidPreviewId(undefined), false);
});
test("chave é um uuid", () => {
  assert.equal(isPreviewKey("123e4567-e89b-12d3-a456-426614174000"), true);
  assert.equal(isPreviewKey("123e4567"), false);
  assert.equal(isPreviewKey("../x"), false);
});
test("corpo do POST: recusa embed e lixo", () => {
  assert.equal(parsePreviewBody({ block: { blockType: "embed", html: "<script>" } }), "Bloco não suportado na prévia.");
  assert.equal(parsePreviewBody({}), "Bloco inválido.");
  assert.deepEqual(parsePreviewBody({ block: { blockType: "tabs" }, width: "x" }), { block: { blockType: "tabs" }, width: "wide" });
});
test("store: TTL e limite", () => {
  let t = 0;
  let n = 0;
  const s = createPreviewStore({ ttlMs: 100, cap: 2, now: () => t, newKey: () => `k${n++}` });
  const a = s.put({ block: { blockType: "tabs" }, width: "wide" });
  assert.equal(s.get(a)?.block.blockType, "tabs");
  s.put({ block: { blockType: "scorers" }, width: "wide" });
  s.put({ block: { blockType: "standings" }, width: "wide" });
  assert.equal(s.size(), 2);
  assert.equal(s.get(a), null); // o mais antigo saiu pelo limite
  t = 200;
  assert.equal(s.get("k2"), null); // expirou
  s.put({ block: { blockType: "tabs" }, width: "wide" });
  assert.equal(s.size(), 1); // poda os expirados no insert
});
test("snippet: guarda só o id numérico (layout embutido some)", () => {
  const r = parsePreviewBody({ block: { blockType: "snippet", snippet: { id: 999, layout: [{ blockType: "embed", html: "<script>x</script>" }] }, hideOn: "mobile", extra: 1 } });
  assert.deepEqual(r, { block: { blockType: "snippet", snippet: 999, hideOn: "mobile" }, width: "wide" });
  assert.equal(parsePreviewBody({ block: { blockType: "snippet", snippet: { layout: [] } } }), "Escolha um trecho.");
  assert.equal(parsePreviewBody({ block: { blockType: "snippet", snippet: "1 or 1" } }), "Escolha um trecho.");
});
test("store guarda o dono da prévia", () => {
  const s = createPreviewStore({ newKey: () => "k" });
  s.put({ block: { blockType: "tabs" }, width: "wide", userId: 7 });
  assert.equal(s.get("k")?.userId, 7);
});

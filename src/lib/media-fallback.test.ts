import { test } from "node:test";
import assert from "node:assert/strict";
import { webpFallbackName } from "./media-fallback.ts";

test("jpg/jpeg/png antigos apontam pro .webp convertido", () => {
  assert.equal(webpFallbackName("sir-alex-ao-ho.jpg"), "sir-alex-ao-ho.webp");
  assert.equal(webpFallbackName("a-1.JPEG"), "a-1.webp");
  assert.equal(webpFallbackName("estadio copa 2026-800x533.png"), "estadio copa 2026-800x533.webp");
});

test("webp, sem extensão ou com caminho → null", () => {
  assert.equal(webpFallbackName("a.webp"), null);
  assert.equal(webpFallbackName("semext"), null);
  assert.equal(webpFallbackName("../etc/passwd.jpg"), null);
  assert.equal(webpFallbackName("dir/a.jpg"), null);
});

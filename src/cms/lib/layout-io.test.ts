import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLayoutImport, stripIds } from "./layout-io.ts";
const SLUGS = ["heading", "richText", "section"];

test("aceita objeto com layout e remove ids", () => {
  const r = parseLayoutImport(JSON.stringify({ layout: [{ id: "abc", blockType: "heading", text: "Oi" }], hero: { h1: "Título" } }), SLUGS);
  assert.ok(r.ok);
  if (r.ok) { assert.deepEqual(r.data.layout, [{ blockType: "heading", text: "Oi" }]); assert.equal(r.data.hero.h1, "Título"); }
});
test("aceita array puro como layout", () => {
  const r = parseLayoutImport("[{\"blockType\":\"richText\"}]", SLUGS);
  assert.ok(r.ok && r.data.layout.length === 1);
});
test("recusa JSON inválido, sem layout, blockType desconhecido", () => {
  assert.match((parseLayoutImport("{", SLUGS) as any).error, /JSON inválido/);
  assert.match((parseLayoutImport("{\"hero\":{}}", SLUGS) as any).error, /layout/);
  assert.match((parseLayoutImport("[{\"blockType\":\"xpto\"}]", SLUGS) as any).error, /xpto/);
  assert.match((parseLayoutImport("[{\"text\":\"sem tipo\"}]", SLUGS) as any).error, /blockType/);
});
test("stripIds remove id aninhado (seções)", () => {
  assert.deepEqual(stripIds({ id: 1, columns: [{ id: 2, blocks: [{ id: 3, blockType: "heading" }] }] }), { columns: [{ blocks: [{ blockType: "heading" }] }] });
});

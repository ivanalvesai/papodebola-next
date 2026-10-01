import { test } from "node:test";
import assert from "node:assert/strict";
import { parsePuckJson, snippetItem } from "./json-io.ts";

const names = ["Heading", "Section", "Snippet"];

test("JSON válido vira Data com root e zones", () => {
  const r = parsePuckJson(JSON.stringify({ content: [{ type: "Heading", props: { id: "Heading-1", text: "Oi" } }] }), names);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.data.content.length, 1);
    assert.deepEqual(r.data.root, { props: {} });
    assert.deepEqual(r.data.zones, {});
  }
});
test("JSON quebrado / sem content / tipo desconhecido dão erro em PT", () => {
  const a = parsePuckJson("{x", names);
  assert.equal(a.ok, false);
  if (!a.ok) assert.match(a.error, /JSON inválido/);
  const b = parsePuckJson(JSON.stringify({ foo: 1 }), names);
  assert.equal(b.ok, false);
  if (!b.ok) assert.match(b.error, /content/);
  const c = parsePuckJson(JSON.stringify({ content: [{ type: "Nope", props: {} }] }), names);
  assert.equal(c.ok, false);
  if (!c.ok) assert.match(c.error, /Nope/);
});
test("tipos dentro de slots também são conferidos", () => {
  const r = parsePuckJson(
    JSON.stringify({ content: [{ type: "Section", props: { id: "s", content: [{ type: "Fake", props: {} }] } }] }),
    names
  );
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /Fake/);
});
test("item sem id ganha id", () => {
  const r = parsePuckJson(JSON.stringify({ content: [{ type: "Heading", props: {} }] }), names);
  assert.equal(r.ok, true);
  if (r.ok) assert.ok(String(r.data.content[0].props.id).startsWith("Heading-"));
});
test("snippetItem monta o componente Trecho", () => {
  const it = snippetItem({ id: 3, title: "Rodapé" });
  assert.equal(it.type, "Snippet");
  assert.deepEqual(it.props.snippet, { id: 3, title: "Rodapé" });
  assert.ok(it.props.id.startsWith("Snippet-"));
});
test("lista mista dentro de slot também é conferida", () => {
  const r = parsePuckJson(
    JSON.stringify({ content: [{ type: "Section", props: { id: "s", content: [{ type: "Heading", props: {} }, { foo: 1 }] } }] }),
    names
  );
  assert.equal(r.ok, false);
});
test("Trecho dentro de slot é recusado", () => {
  const r = parsePuckJson(
    JSON.stringify({ content: [{ type: "Section", props: { id: "s", content: [{ type: "Snippet", props: { snippet: { id: 1 } } }] } }] }),
    names
  );
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /Trecho/);
  assert.equal(parsePuckJson(JSON.stringify({ content: [{ type: "Snippet", props: {} }] }), names).ok, true);
});

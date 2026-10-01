import { test } from "node:test";
import assert from "node:assert/strict";
import { puckPropsToBlock } from "./to-block.ts";

test("Heading/Text/Button viram blocos da biblioteca", () => {
  assert.deepEqual(puckPropsToBlock("Heading", { text: "Oi", level: "h3" }), { blockType: "heading", text: "Oi", level: "h3" });
  assert.deepEqual(puckPropsToBlock("Button", { label: "Ver", url: "/x", style: "outline" }), { blockType: "button", label: "Ver", url: "/x", style: "outline" });
  assert.equal(puckPropsToBlock("Text", { text: "a\nb" })?.blockType, "richText");
});
test("Text vira Lexical com um parágrafo por linha", () => {
  const b = puckPropsToBlock("Text", { text: "a\nb" });
  assert.equal(b.content.root.children.length, 2);
  assert.equal(b.content.root.children[1].children[0].text, "b");
});
test("TeamWidget usa o id do time escolhido", () => {
  assert.deepEqual(puckPropsToBlock("TeamWidget", { team: { id: 7, name: "Cruzeiro" }, widget: "news", limit: 4 }), { blockType: "teamWidget", team: 7, widget: "news", title: undefined, limit: 4 });
  assert.equal(puckPropsToBlock("TeamWidget", { widget: "news" }), null);
});
test("desconhecido é null", () => { assert.equal(puckPropsToBlock("Nope", {}), null); });

import { test } from "node:test";
import assert from "node:assert/strict";
import { needsAutoTextAppend, hasClassicBlock, isEmptyStaticBlock } from "./team-layout.ts";

test("layout sem o bloco recebe o texto no fim; com o bloco, não", () => {
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }]), true);
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }, { blockType: "teamAutoText" }]), false);
  assert.equal(needsAutoTextAppend([]), true);
});

test("com a página padrão (teamClassic) o texto automático não é anexado", () => {
  assert.equal(needsAutoTextAppend([{ blockType: "teamClassic" }, { blockType: "richText" }]), false);
});

test("hasClassicBlock detecta o bloco da página padrão", () => {
  assert.equal(hasClassicBlock([]), false);
  assert.equal(hasClassicBlock([{ blockType: "teamClassic" }]), true);
  assert.equal(hasClassicBlock([{ blockType: "richText" }, { blockType: "teamNews" }]), false);
});

test("isEmptyStaticBlock: texto/título vazios não renderizam nada", () => {
  assert.equal(isEmptyStaticBlock({ blockType: "richText" }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: null }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: { root: {} } }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "heading" }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "heading", text: "Título" }), false);
  assert.equal(isEmptyStaticBlock({ blockType: "teamNews" }), false);
});

const lex = (...children: unknown[]) => ({ root: { type: "root", children } });
const p = (...children: unknown[]) => ({ type: "paragraph", children });
const t = (text: string) => ({ type: "text", text });

test("isEmptyStaticBlock: Lexical sem texto (parágrafo vazio) é vazio; com texto ou mídia, não", () => {
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex(p()) }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex(p(t("   ")), p({ type: "linebreak" })) }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex() }), true);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex(p(), p(t("Olá"))) }), false);
  assert.equal(
    isEmptyStaticBlock({ blockType: "richText", content: lex(p({ type: "link", children: [t("site")] })) }),
    false
  );
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex({ type: "upload", value: 1 }) }), false);
  assert.equal(isEmptyStaticBlock({ blockType: "richText", content: lex({ type: "horizontalrule" }) }), false);
});

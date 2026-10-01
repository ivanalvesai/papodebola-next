import { test } from "node:test";
import assert from "node:assert/strict";
import { lockFieldsExceptSeo, SEO_FIELD_ALLOWLIST } from "./lock-fields.ts";
import { fieldEditorOrAdmin } from "./access.ts";

/* eslint-disable @typescript-eslint/no-explicit-any */
const tree: any[] = [
  { name: "title", type: "text" },
  {
    type: "tabs",
    tabs: [
      {
        label: "Hub",
        fields: [
          { name: "seo", type: "group", fields: [{ name: "metaTitle", type: "text" }] },
          { name: "h1", type: "text", access: { read: () => true } },
        ],
      },
    ],
  },
  { name: "seoJogoHoje", type: "group", fields: [{ name: "metaTitle", type: "text" }] },
  { name: "layout", type: "blocks", blocks: [] },
  { type: "row", fields: [{ name: "home", type: "text" }, { name: "noindex", type: "checkbox" }] },
  { name: "tools", type: "ui", admin: { components: {} } },
];

test("allowlist", () => {
  assert.ok(SEO_FIELD_ALLOWLIST.includes("seoEstatisticas"));
});

test("lockFieldsExceptSeo trava só o que não é SEO", () => {
  const snapshot = JSON.stringify(tree);
  const out: any[] = lockFieldsExceptSeo(tree as any) as any;
  assert.equal(out[0].access.update, fieldEditorOrAdmin);
  const tab = out[1].tabs[0].fields;
  assert.equal(tab[0].access, undefined);
  assert.equal(tab[0].fields[0].access, undefined);
  assert.equal(tab[1].access.update, fieldEditorOrAdmin);
  assert.equal(typeof tab[1].access.read, "function"); // preserva access existente
  assert.equal(out[2].access, undefined);
  assert.equal(out[2].fields[0].access, undefined);
  assert.equal(out[3].access.update, fieldEditorOrAdmin);
  assert.equal(out[4].access, undefined); // row sem nome não recebe access
  assert.equal(out[4].fields[0].access.update, fieldEditorOrAdmin);
  assert.equal(out[4].fields[1].access, undefined);
  assert.equal(out[5].access, undefined); // ui não tem access
  // original intacto
  assert.equal(JSON.stringify(tree), snapshot);
  assert.equal(tree[0].access, undefined);
  assert.equal(tree[1].tabs[0].fields[1].access.update, undefined);
});

test("aba nomeada fora da allowlist é travada inteira", () => {
  const out: any[] = lockFieldsExceptSeo([{ type: "tabs", tabs: [{ name: "extra", fields: [{ name: "x", type: "text" }] }, { name: "seo", fields: [{ name: "y", type: "text" }] }] }] as any) as any;
  assert.equal(out[0].tabs[0].access.update, fieldEditorOrAdmin);
  assert.equal(out[0].tabs[1].access, undefined);
});

test("excerpt (meta description dos posts) fica livre; title travado", () => {
  const out: any[] = lockFieldsExceptSeo([{ name: "title", type: "text" }, { name: "excerpt", type: "textarea" }] as any) as any;
  assert.equal(out[0].access.update, fieldEditorOrAdmin);
  assert.equal(out[1].access, undefined);
});

test("collapsible: desce e trava o texto de dentro", () => {
  const out: any[] = lockFieldsExceptSeo([{ type: "collapsible", label: "X", fields: [{ name: "a", type: "text" }] }] as any) as any;
  assert.equal(out[0].access, undefined);
  assert.equal(out[0].fields[0].access.update, fieldEditorOrAdmin);
});

test("aba nomeada com grupo seo dentro é travada inteira (não desce)", () => {
  const out: any[] = lockFieldsExceptSeo([{ type: "tabs", tabs: [{ name: "conteudo", fields: [{ name: "seo", type: "group", fields: [{ name: "metaTitle", type: "text" }] }] }] }] as any) as any;
  assert.equal(out[0].tabs[0].access.update, fieldEditorOrAdmin);
  assert.equal(out[0].tabs[0].fields[0].access, undefined);
});

test("array com blocks dentro é travado inteiro, sem descer", () => {
  const out: any[] = lockFieldsExceptSeo([{ name: "itens", type: "array", fields: [{ name: "layout", type: "blocks", blocks: [] }] }] as any) as any;
  assert.equal(out[0].access.update, fieldEditorOrAdmin);
  assert.equal(out[0].fields[0].access, undefined);
});

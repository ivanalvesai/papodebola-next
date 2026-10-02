import { test } from "node:test";
import assert from "node:assert/strict";
import { mergeMetadata, matchRoute } from "./merge-metadata.ts";

const DEFAULTS = {
  title: "Copa do Mundo",
  description: "Desc padrão",
  alternates: { canonical: "https://x/copa" },
  openGraph: { title: "OG", description: "Desc padrão", url: "https://x/copa" },
  twitter: { card: "summary_large_image" as const, description: "Desc padrão" },
};

test("sem doc → exatamente os defaults", () => {
  assert.deepEqual(mergeMetadata(DEFAULTS, null), DEFAULTS);
  assert.deepEqual(mergeMetadata(DEFAULTS, undefined), DEFAULTS);
  assert.deepEqual(mergeMetadata(DEFAULTS, { seo: {} }), DEFAULTS);
  assert.deepEqual(mergeMetadata(DEFAULTS, { seo: { metaTitle: "  ", metaDescription: "", noindex: false } }), DEFAULTS);
});

test("não muta os defaults", () => {
  const d = structuredClone(DEFAULTS);
  mergeMetadata(d, { seo: { metaTitle: "T", metaDescription: "D", noindex: true } });
  assert.deepEqual(d, DEFAULTS);
});

test("metaTitle sobrescreve title string", () => {
  const m = mergeMetadata(DEFAULTS, { seo: { metaTitle: "Novo" } });
  assert.equal(m.title, "Novo");
  assert.equal(m.description, "Desc padrão");
});

test("metaTitle preserva o shape {absolute}", () => {
  const m = mergeMetadata({ title: { absolute: "Velho" } }, { seo: { metaTitle: "Novo" } });
  assert.deepEqual(m.title, { absolute: "Novo" });
});

test("metaDescription sobrescreve description, openGraph e twitter", () => {
  const m = mergeMetadata(DEFAULTS, { seo: { metaDescription: "Nova desc" } });
  assert.equal(m.description, "Nova desc");
  assert.equal((m.openGraph as { description?: string }).description, "Nova desc");
  assert.equal((m.openGraph as { url?: string }).url, "https://x/copa");
  assert.equal((m.twitter as { description?: string }).description, "Nova desc");
});

test("metaDescription não cria openGraph/twitter quando não existem", () => {
  const m = mergeMetadata({ title: "T" }, { seo: { metaDescription: "D" } });
  assert.equal(m.description, "D");
  assert.equal(m.openGraph, undefined);
  assert.equal(m.twitter, undefined);
});

test("noindex → robots index/follow false", () => {
  const m = mergeMetadata(DEFAULTS, { seo: { noindex: true } });
  assert.deepEqual(m.robots, { index: false, follow: false });
});

test("matchRoute: padrão com :param", () => {
  assert.equal(matchRoute("/noticias/brasileirao", ["/noticias/:categoria", "/"]), "/noticias/:categoria");
});

test("matchRoute: exata ganha do padrão", () => {
  assert.equal(matchRoute("/noticias/copa", ["/noticias/:categoria", "/noticias/copa"]), "/noticias/copa");
});

test("matchRoute: número de segmentos tem que bater; sem match → null", () => {
  assert.equal(matchRoute("/noticias/a/b", ["/noticias/:categoria"]), null);
  assert.equal(matchRoute("/futebol/copa-do-mundo/jogo/2026-06-11/mex-x-rsa", ["/futebol/copa-do-mundo/jogo/:data/:slug"]), "/futebol/copa-do-mundo/jogo/:data/:slug");
  assert.equal(matchRoute("/x", []), null);
  assert.equal(matchRoute("/autor/joao", ["/artigos/:slug"]), null);
});

test("metaTitle sobrescreve openGraph.title e twitter.title quando existem", () => {
  const m = mergeMetadata(DEFAULTS, { seo: { metaTitle: "Novo", metaDescription: "Nova desc" } });
  assert.equal((m.openGraph as { title?: string }).title, "Novo");
  assert.equal((m.openGraph as { description?: string }).description, "Nova desc");
  assert.equal((m.twitter as { title?: string }).title, "Novo");
  assert.equal((m.twitter as { description?: string }).description, "Nova desc");
  const s = mergeMetadata({ title: "T" }, { seo: { metaTitle: "Novo" } });
  assert.equal(s.openGraph, undefined);
  assert.equal(s.twitter, undefined);
});

test("metaTitle preserva o shape {default, template}", () => {
  const m = mergeMetadata({ title: { default: "Velho", template: "%s | PDB" } }, { seo: { metaTitle: "Novo" } });
  assert.deepEqual(m.title, { default: "Novo", template: "%s | PDB" });
});

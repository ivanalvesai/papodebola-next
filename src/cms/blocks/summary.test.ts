import { test } from "node:test";
import assert from "node:assert/strict";
import { blockSummary } from "./summary.ts";

test("heading mostra o texto", () => {
  assert.equal(blockSummary("heading", { text: "Tabela do Brasileirão", level: "h2" }), "Tabela do Brasileirão");
});
test("richText resume as primeiras letras do Lexical", () => {
  const content = { root: { children: [{ type: "paragraph", children: [{ type: "text", text: "Primeiro parágrafo da página sobre o campeonato estadual" }] }] } };
  assert.equal(blockSummary("richText", { content }), "Primeiro parágrafo da página sobre o campeonato esta…");
});
test("richText vazio avisa", () => {
  assert.equal(blockSummary("richText", { content: null }), "Texto vazio");
});
test("teamWidget mostra time e widget", () => {
  assert.equal(blockSummary("teamWidget", { team: { name: "Cruzeiro" }, widget: "upcoming" }), "Cruzeiro · Próximos jogos");
  assert.equal(blockSummary("teamWidget", { team: 12, widget: "standing" }), "Classificação (posição)");
});
test("standings/scorers mostram o torneio pelo slug", () => {
  assert.equal(blockSummary("standings", { tournament: "brasileirao-serie-b" }), "Brasileirão Série B");
  assert.equal(blockSummary("scorers", { tournament: "copa-do-mundo", limit: 5 }), "Copa do Mundo 2026 · 5");
});
test("newsFeed descreve a fonte", () => {
  assert.equal(blockSummary("newsFeed", { source: "category", value: "NBA", limit: 6 }), "Categoria NBA · 6");
  assert.equal(blockSummary("newsFeed", { source: "latest" }), "Últimas notícias");
});
test("section conta colunas", () => {
  assert.equal(blockSummary("section", { title: "Destaques", columns: [{}, {}] }), "Destaques · 2 colunas");
  assert.equal(blockSummary("section", { columns: [{}] }), "1 coluna");
});
test("desconhecido devolve vazio", () => {
  assert.equal(blockSummary("xpto", {}), "");
});

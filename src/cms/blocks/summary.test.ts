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

test("blocos ricos: hero, faq, formBlock, countdown, snippet, embed", () => {
  assert.equal(blockSummary("hero", { title: "Bem-vindo ao Papo de Bola, o portal do futebol brasileiro e mundial" }), "Bem-vindo ao Papo de Bola, o portal do futebol brasi…");
  assert.equal(blockSummary("faq", { title: "Dúvidas", items: [{}, {}, {}] }), "Dúvidas · 3 perguntas");
  assert.equal(blockSummary("formBlock", { form: { title: "Contato" } }), "Contato");
  assert.equal(blockSummary("formBlock", { form: 3 }), "Formulário");
  assert.equal(blockSummary("countdown", { team: { name: "Cruzeiro" } }), "Cruzeiro");
  assert.equal(blockSummary("countdown", { matchId: 123 }), "jogo 123");
  assert.equal(blockSummary("snippet", { snippet: { title: "Rodapé institucional" } }), "Rodapé institucional");
  assert.equal(blockSummary("snippet", { snippet: 7 }), "Trecho");
  assert.equal(blockSummary("embed", { html: "<div></div>" }), "HTML (11 caracteres)");
  assert.equal(blockSummary("divider", { style: "space" }), "Espaço");
  assert.equal(blockSummary("cards", { title: "Destaques", items: [{}, {}] }), "Destaques · 2 itens");
});

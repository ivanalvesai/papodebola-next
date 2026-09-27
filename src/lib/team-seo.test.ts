import { test } from "node:test";
import assert from "node:assert/strict";
import { teamSeo, defaultTeamSeo } from "./team-seo.ts";

test("padrão por aba igual ao que as rotas geram hoje", () => {
  assert.equal(defaultTeamSeo("hub", "Palmeiras").title, "Palmeiras - Notícias, Jogos e Classificação");
  assert.equal(defaultTeamSeo("ondeAssistir", "Palmeiras").title, "Onde Assistir Palmeiras Hoje - Transmissão Ao Vivo");
  assert.equal(defaultTeamSeo("estatisticas", "Palmeiras").title, "Estatísticas do Palmeiras 2026 - Números e Desempenho");
});

test("seo do Hub não vaza pras subpáginas", () => {
  const doc = { seo: { metaTitle: "Hub custom", metaDescription: "desc custom" } };
  assert.equal(teamSeo(doc, "hub", "América-MG").title, "Hub custom");
  assert.equal(teamSeo(doc, "escalacao", "América-MG").title, "Escalação do América-MG Hoje - Provável Escalação");
});

test("grupo da aba vence; campo vazio cai no padrão campo a campo", () => {
  const doc = { seoProximos: { metaTitle: "Agenda do Timão", metaDescription: "" } };
  const r = teamSeo(doc, "proximos", "Corinthians");
  assert.equal(r.title, "Agenda do Timão");
  assert.equal(r.description, defaultTeamSeo("proximos", "Corinthians").description);
  assert.deepEqual(teamSeo(null, "hub", "X"), defaultTeamSeo("hub", "X"));
});

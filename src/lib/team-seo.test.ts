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

const next = { opponent: "Atlético-MG", date: "seg 26/10", time: "20h", league: "Brasileirão Série A" };

test("próximos com jogo → título dinâmico", () => {
  assert.equal(teamSeo(null, "proximos", "Flamengo", next).title, "Próximo jogo do Flamengo: x Atlético-MG, seg 26/10, 20h");
});

test("jogo de hoje e onde assistir com jogo → título dinâmico", () => {
  assert.equal(teamSeo(null, "jogoHoje", "Flamengo", next).title, "Flamengo x Atlético-MG hoje: horário e onde assistir");
  assert.equal(teamSeo(null, "ondeAssistir", "Flamengo", next).title, "Onde assistir Flamengo x Atlético-MG hoje");
});

test("sem jogo → padrão estático", () => {
  assert.equal(teamSeo(null, "proximos", "Flamengo", null).title, defaultTeamSeo("proximos", "Flamengo").title);
  assert.equal(teamSeo(null, "proximos", "Flamengo").title, defaultTeamSeo("proximos", "Flamengo").title);
});

test("abas sem template dinâmico ignoram o jogo", () => {
  assert.equal(teamSeo(null, "estatisticas", "Flamengo", next).title, defaultTeamSeo("estatisticas", "Flamengo").title);
});

test("placeholder no título do CMS é preenchido", () => {
  const doc = { seoOndeAssistir: { metaTitle: "Onde ver {adversario} x Timão ({data})" } };
  assert.equal(teamSeo(doc, "ondeAssistir", "Corinthians", next).title, "Onde ver Atlético-MG x Timão (seg 26/10)");
});

test("placeholder sem jogo não vaza a chave crua", () => {
  const doc = { seoOndeAssistir: { metaTitle: "Onde ver {adversario} x Timão" } };
  assert.equal(teamSeo(doc, "ondeAssistir", "Corinthians", null).title, defaultTeamSeo("ondeAssistir", "Corinthians").title);
});

test("título do CMS igual ao padrão antigo (seed) não bloqueia o dinâmico", () => {
  const def = defaultTeamSeo("proximos", "Flamengo");
  const doc = { seoProximos: { metaTitle: def.title, metaDescription: def.description } };
  const r = teamSeo(doc, "proximos", "Flamengo", next);
  assert.equal(r.title, "Próximo jogo do Flamengo: x Atlético-MG, seg 26/10, 20h");
  assert.match(r.description, /contra o Atlético-MG/);
});

test("título do CMS personalizado continua vencendo o dinâmico", () => {
  const doc = { seoProximos: { metaTitle: "Agenda do Mengão" } };
  assert.equal(teamSeo(doc, "proximos", "Flamengo", next).title, "Agenda do Mengão");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { teamTabH1 } from "./team-h1.ts";

test("H1 por aba", () => {
  const b = "/futebol/times/flamengo";
  assert.equal(teamTabH1(b, "Flamengo"), "Flamengo: notícias, jogos e classificação");
  assert.equal(teamTabH1(b + "/proximos-jogos", "Flamengo"), "Próximos jogos do Flamengo");
  assert.equal(teamTabH1(b + "/jogo-hoje", "Flamengo"), "Jogo do Flamengo hoje");
  assert.equal(teamTabH1(b + "/onde-assistir", "Flamengo"), "Onde assistir Flamengo hoje");
  assert.equal(teamTabH1(b + "/escalacao", "Flamengo"), "Escalação do Flamengo");
  assert.equal(teamTabH1(b + "/estatisticas", "Flamengo"), "Estatísticas do Flamengo");
  assert.equal(teamTabH1(b + "/", "Flamengo"), "Flamengo: notícias, jogos e classificação");
});

test("aba desconhecida ou pathname vazio → H1 do hub", () => {
  assert.equal(teamTabH1("/futebol/times/flamengo/xyz", "Flamengo"), "Flamengo: notícias, jogos e classificação");
  assert.equal(teamTabH1("", "Flamengo"), "Flamengo: notícias, jogos e classificação");
});

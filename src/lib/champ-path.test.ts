import { test } from "node:test";
import assert from "node:assert/strict";
import { champPath, TOURNAMENT_BY_SLUG } from "./config.ts";
import { groupLabel } from "./group-label.ts";

test("champPath padrão", () => assert.equal(champPath("brasileirao-serie-b"), "/futebol/brasileirao-serie-b"));
test("champPath Liga das Nações", () =>
  assert.equal(champPath("liga-das-nacoes"), "/futebol/futebol-internacional/liga-das-nacoes"));
test("Liga das Nações configurada", () => {
  const t = TOURNAMENT_BY_SLUG["liga-das-nacoes"];
  assert.equal(t.id, 10783);
  assert.equal(t.seasonId, 89945);
  assert.equal(t.nationalTeams, true);
});
test("href do jogo usa basePath", () =>
  assert.equal(
    `${champPath("liga-das-nacoes")}/jogo/12-11-2026/italia-franca`,
    "/futebol/futebol-internacional/liga-das-nacoes/jogo/12-11-2026/italia-franca"
  ));
test("groupLabel liga + grupo", () =>
  assert.equal(groupLabel("UEFA Nations League 26/27, League A, Group 1"), "Liga A · Grupo 1"));
test("groupLabel só grupo", () => assert.equal(groupLabel("Brasileiro Serie D 2026, Group A1"), "Grupo A1"));
test("groupLabel tabela única", () => assert.equal(groupLabel("Brasileirão Série A 2026"), ""));

import { pelo, doDa } from "./pt-gender.ts";
test("gênero do campeonato", () => {
  assert.equal(pelo("Liga das Nações"), "pela Liga das Nações");
  assert.equal(pelo("Copa Libertadores"), "pela Copa Libertadores");
  assert.equal(pelo("Brasileirão Série B"), "pelo Brasileirão Série B");
  assert.equal(doDa("Liga das Nações"), "da Liga das Nações");
  assert.equal(doDa("Paulista Série A1"), "do Paulista Série A1");
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { isWorldCupFixture } from "./world-cup-fixture.ts";

test("identifica jogo da Copa do Mundo pelo nome do torneio (com/sem prefixo FIFA, PT-BR)", () => {
  assert.equal(isWorldCupFixture({ tournamentName: "FIFA World Cup" }), true);
  assert.equal(isWorldCupFixture({ tournamentName: "World Cup" }), true);
  assert.equal(isWorldCupFixture({ tournamentName: "Copa do Mundo" }), true);
  assert.equal(isWorldCupFixture({ tournamentName: "fifa world cup" }), true);
  assert.equal(isWorldCupFixture({ tournamentName: "  Copa do Mundo  " }), true);
});

test("não confunde com Eliminatórias/outros torneios cujo nome contém 'World Cup'", () => {
  assert.equal(isWorldCupFixture({ tournamentName: "World Cup Qual. CONMEBOL" }), false);
  assert.equal(isWorldCupFixture({ tournamentName: "World Cup Qualification CONMEBOL" }), false);
  assert.equal(isWorldCupFixture({ tournamentName: "Copa América" }), false);
  assert.equal(isWorldCupFixture({ tournamentName: "" }), false);
  assert.equal(isWorldCupFixture({}), false);
});

test("uniqueTournamentId 16 identifica mesmo com nome ausente/diferente", () => {
  assert.equal(isWorldCupFixture({ uniqueTournamentId: 16 }), true);
  assert.equal(isWorldCupFixture({ uniqueTournamentId: 16, tournamentName: "algo estranho" }), true);
  assert.equal(isWorldCupFixture({ uniqueTournamentId: 17, tournamentName: "" }), false);
});

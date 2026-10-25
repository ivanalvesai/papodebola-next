import { test } from "node:test";
import assert from "node:assert/strict";
import { championshipMatchSeo } from "./match-seo.ts";

const f = {
  home: "Flamengo",
  away: "Atlético-MG",
  tournamentName: "Brasileirão Série A",
  timestamp: Date.parse("2026-10-26T23:00:00Z") / 1000,
};

test("futuro: horário, onde assistir e escalações com data", () => {
  const r = championshipMatchSeo({ ...f, status: "notstarted" });
  assert.equal(r.title, "Flamengo x Atlético-MG: horário, onde assistir e escalações (26/10)");
  assert.match(r.description, /onde assistir/);
});

test("ao vivo", () => {
  assert.equal(championshipMatchSeo({ ...f, status: "inprogress" }).title, "Flamengo x Atlético-MG ao vivo - Brasileirão Série A");
});

test("encerrado com placar", () => {
  const r = championshipMatchSeo({ ...f, status: "finished", homeScore: 2, awayScore: 1 });
  assert.equal(r.title, "Flamengo 2x1 Atlético-MG: resultado e lance a lance");
  assert.match(r.description, /Resultado de Flamengo 2x1 Atlético-MG/);
});

test("encerrado sem placar ou status desconhecido não inventa placar", () => {
  assert.equal(championshipMatchSeo({ ...f, status: "finished" }).title, "Flamengo x Atlético-MG: resultado e lance a lance");
  assert.equal(championshipMatchSeo({ ...f, status: "" }).title, "Flamengo x Atlético-MG ao vivo - Brasileirão Série A");
});

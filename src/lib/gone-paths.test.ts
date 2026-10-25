import { test } from "node:test";
import assert from "node:assert/strict";
import { isGonePath } from "./gone-paths.ts";

test("caminhos mortos sem redirect são 410", () => {
  for (const p of ["/cache/home.json", "/cache/standings_brasileirao.json", "/contagiro/z28-1-cg-jaguar2.jpg",
    "/fabiocunha/20050519.htm", "/pernambucoaqui/20061115a.jpg", "/index24horas.jpg", "/indexpapodemidia.jpg", "/PB2018v2.png"])
    assert.equal(isGonePath(p), true, p);
});

test("rotas vivas e legados com 301 não são 410", () => {
  for (const p of ["/", "/futebol/times/flamengo", "/noticias", "/cms-api/media/file/a.jpg", "/cachorro",
    "/24horas/armadilha.jpg", "/papodemidia/coluna/", "/index.htm", "/sp/santana-de-parnaiba"])
    assert.equal(isGonePath(p), false, p);
});

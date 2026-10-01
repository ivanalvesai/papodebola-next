import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validatePath, normalizePath, STATIC_TOP_LEVEL, RESERVED_FIRST_SEGMENTS } from "./cms-paths.ts";

test("aceita caminho simples e aninhado", () => {
  assert.equal(validatePath("/volei/mundial-2026"), true);
  assert.equal(validatePath("/copa-america-2028"), true);
  assert.equal(validatePath("/futebol/copa-america"), true); // /futebol/[slug] faz fallthrough
});
test("vazio é permitido (página fica em /paginas/{slug})", () => {
  assert.equal(validatePath(""), true);
  assert.equal(validatePath(undefined), true);
});
test("formato: começa com /, minúsculas, sem barra final, máx 6 segmentos", () => {
  assert.match(String(validatePath("volei")), /começar com \//);
  assert.match(String(validatePath("/Volei/Mundial")), /letras minúsculas/);
  assert.match(String(validatePath("/volei/")), /barra no final/);
  assert.match(String(validatePath("/a/b/c/d/e/f/g")), /6 segmentos/);
  assert.match(String(validatePath("/volei/mundial 2026")), /letras minúsculas/);
});
test("recusa árvores reservadas ao código", () => {
  for (const p of ["/sobre/x", "/contato/x", "/parceiros/x", "/api/x", "/cms/x", "/cms-api/x", "/cms-preview/x", "/paginas/x", "/noticias/x", "/artigos/x", "/autor/x", "/sp/x", "/jogos-de-hoje/x", "/ao-vivo", "/studio-pdb/x", "/painel-pdb-9x", "/img/team/1", "/_next/x"]) {
    assert.match(String(validatePath(p)), /reservad/i, p);
  }
});
test("recusa rota estática de 1 segmento que já existe", () => {
  for (const p of ["/futebol", "/volei", "/sobre", "/contato", "/nba", "/tenis"]) assert.match(String(validatePath(p)), /já existe/i, p);
});
test("recusa subárvores do futebol que são código", () => {
  for (const p of ["/futebol/times/cruzeiro", "/futebol/copa-do-mundo/x", "/futebol/selecao-brasileira/x", "/futebol/craque/x", "/futebol/onde-assistir", "/futebol/brasileirao-serie-a", "/futebol/copa-america/jogos"]) {
    assert.notEqual(validatePath(p), true, p);
  }
});
test("normalizePath tira espaços e barra final", () => {
  assert.equal(normalizePath("  /volei/mundial-2026/ "), "/volei/mundial-2026");
});
test("toda pasta estática de src/app/(site) está em STATIC_TOP_LEVEL ou RESERVED_FIRST_SEGMENTS", () => {
  const dir = path.resolve(process.cwd(), "src/app/(site)");
  const names = fs.readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("(") && !d.name.startsWith("["))
    .map((d) => d.name);
  assert.ok(names.length > 10);
  for (const n of names) assert.ok(STATIC_TOP_LEVEL.has(n) || RESERVED_FIRST_SEGMENTS.has(n), n);
});
test("recusa caminhos sombreados por redirect ou rota de código", () => {
  for (const p of ["/futsal", "/tenis/halle-2026", "/parceiro/x", "/campeonato/x", "/mma", "/admin", "/agenda/x", "/times/x/y", "/basquete/nba", "/futebolnarede/x"]) {
    assert.notEqual(validatePath(p), true, p);
  }
  assert.match(String(validatePath("/mma")), /redirecionamento/);
  assert.equal(validatePath("/volei/mundial-2026"), true);
  assert.equal(validatePath("/futebol/copa-america"), true);
  assert.equal(validatePath("/agendamento"), true); // prefixo só casa no limite do segmento
});

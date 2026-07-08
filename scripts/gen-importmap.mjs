// Regenera o importMap do Payload antes do `next build`. Sem isso, o admin (/cms) não
// mostra features novas do editor (Table, Blocks) — o importMap fica desatualizado.
//
// Problema: o CLI do Payload carrega a config como ESM, mas o projeto não é
// "type":"module" → ERR_REQUIRE_ASYNC_MODULE (top-level await na config). Solução:
// aplicar "type":"module" TEMPORARIAMENTE só durante o generate e restaurar depois.
// Este arquivo é .mjs (sempre ESM), então roda mesmo sem o type no package.json.
//
// GUARDA (jul/2026): no servidor o `generate:importmap` às vezes falha/gera parcial
// durante o build e o admin fica SEM Table/Blocks → editor quebra (Lexical #17 table).
// Por isso: guardamos o importMap ATUAL (commitado, completo) e, se o generate falhar
// OU vier sem Table/Blocks, RESTAURAMOS o commitado. O importMap completo é a fonte da
// verdade versionada; o generate só o atualiza quando roda 100%.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const IMPORTMAP = "src/app/(payload)/cms/importMap.js";
const ORIG_PKG = readFileSync("package.json", "utf8");
let PREV_MAP = "";
try {
  PREV_MAP = readFileSync(IMPORTMAP, "utf8");
} catch {
  /* primeiro run: sem mapa anterior */
}
const hasEditorNodes = (s) => /TableFeatureClient|BlocksFeatureClient/.test(s || "");

try {
  const pkg = JSON.parse(ORIG_PKG);
  pkg.type = "module";
  writeFileSync("package.json", JSON.stringify(pkg, null, 2));
  execSync("npx --no-install payload generate:importmap", { stdio: "inherit" });

  // Se o mapa gerado perdeu Table/Blocks mas o anterior tinha, o generate veio parcial:
  // restaura o commitado pra não quebrar o editor.
  const generated = readFileSync(IMPORTMAP, "utf8");
  if (!hasEditorNodes(generated) && hasEditorNodes(PREV_MAP)) {
    console.warn("[gen-importmap] mapa gerado SEM Table/Blocks — restaurando o commitado (completo).");
    writeFileSync(IMPORTMAP, PREV_MAP);
  }
} catch (err) {
  console.warn("[gen-importmap] aviso: generate falhou, restaurando o importMap commitado:", err?.message);
  if (PREV_MAP) writeFileSync(IMPORTMAP, PREV_MAP);
} finally {
  writeFileSync("package.json", ORIG_PKG);
}

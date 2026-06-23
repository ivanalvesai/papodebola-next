// Regenera o importMap do Payload antes do `next build`. Sem isso, o admin (/cms) não
// mostra features novas do editor (Table, Blocks) — o importMap fica desatualizado.
//
// Problema: o CLI do Payload carrega a config como ESM, mas o projeto não é
// "type":"module" → ERR_REQUIRE_ASYNC_MODULE (top-level await na config). Solução:
// aplicar "type":"module" TEMPORARIAMENTE só durante o generate e restaurar depois.
// Este arquivo é .mjs (sempre ESM), então roda mesmo sem o type no package.json.
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const ORIG = readFileSync("package.json", "utf8");
try {
  const pkg = JSON.parse(ORIG);
  pkg.type = "module";
  writeFileSync("package.json", JSON.stringify(pkg, null, 2));
  execSync("npx --no-install payload generate:importmap", { stdio: "inherit" });
} catch (err) {
  // Não derruba o build: se o generate falhar, segue com o importMap atual.
  console.warn("[gen-importmap] aviso: falhou, seguindo com o importMap existente:", err?.message);
} finally {
  writeFileSync("package.json", ORIG);
}

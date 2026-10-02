import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildReserved, render } from "../../../scripts/gen-reserved-paths.mjs";
import { RESERVED_EXACT, RESERVED_PREFIXES, STATIC_TOP_LEVEL, FUTEBOL_CODE } from "./reserved-paths.generated.ts";

const root = process.cwd();
const norm = (s: string) => s.replace(/\r\n/g, "\n");

test("arquivo gerado está em dia", () => {
  const current = fs.readFileSync(path.join(root, "src/cms/lib/reserved-paths.generated.ts"), "utf8");
  assert.equal(norm(render(buildReserved(root))), norm(current), "arquivo desatualizado: rode npm run gen:paths");
});
test("exact e prefixes esperados", () => {
  for (const p of ["/privacidade", "/termos", "/paginas"]) assert.ok(RESERVED_EXACT.includes(p), p);
  for (const p of ["/campeonato", "/times", "/vidadecraque", "/tenis/halle-2026"]) assert.ok(RESERVED_PREFIXES.includes(p), p);
  assert.ok(!RESERVED_PREFIXES.includes("/futebol"));
});
test("staticTopLevel cobre as pastas de rotas", () => {
  for (const base of ["src/app/(site)", "src/app"]) {
    for (const d of fs.readdirSync(path.join(root, base), { withFileTypes: true })) {
      if (!d.isDirectory() || /^[(\[_]/.test(d.name)) continue;
      assert.ok(STATIC_TOP_LEVEL.includes(d.name), d.name);
    }
  }
  assert.ok(FUTEBOL_CODE.includes("times") && FUTEBOL_CODE.includes("craque"));
});

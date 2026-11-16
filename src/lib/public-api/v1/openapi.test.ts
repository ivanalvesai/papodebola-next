import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { OPENAPI_YAML } from "./openapi.ts";

const YAML = createRequire(import.meta.url)("yaml");

// Rotas reais em src/app/v1 (route.ts), no formato do OpenAPI: [slug] -> {slug}.
function appRoutes(dir: string, base = "/v1"): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...appRoutes(p, `${base}/${name.replace(/^\[(.+)\]$/, "{$1}")}`));
    else if (name === "route.ts") out.push(base);
  }
  return out;
}

test("OpenAPI é YAML válido e documenta toda rota /v1 existente", () => {
  const spec = YAML.parse(OPENAPI_YAML);
  assert.equal(spec.openapi, "3.1.0");
  const documented = Object.keys(spec.paths);
  const real = appRoutes(join(process.cwd(), "src/app/v1")).filter((r) => r !== "/v1/docs");
  for (const r of real) assert.ok(documented.includes(r), `rota sem documentação: ${r}`);
  for (const d of documented) assert.ok(real.includes(d), `documentada mas não existe: ${d}`);
});

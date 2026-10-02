// Gera src/cms/lib/reserved-paths.generated.ts a partir do next.config.ts (redirects)
// e das pastas de rotas. Rode: npm run gen:paths (o build também roda).
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const uniqSorted = (a) => [...new Set(a)].sort();
const dirs = (p) =>
  fs.existsSync(p)
    ? fs.readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory() && !/^[(\[_]/.test(d.name)).map((d) => d.name)
    : [];

export function buildReserved(rootDir) {
  const cfg = fs.readFileSync(path.join(rootDir, "next.config.ts"), "utf8");
  const exact = [];
  const prefixes = [];
  for (const m of cfg.matchAll(/source:\s*["'`]([^"'`]+)["'`]/g)) {
    const src = m[1];
    if (!src.startsWith("/") || src.includes("${")) continue;
    if (src.includes(":")) {
      const i = src.indexOf("/:");
      const pre = i > 0 ? src.slice(0, i) : "";
      // /futebol tem fallthrough (/futebol/x é permitido) e /futebol/times* é subárvore de código (FUTEBOL_CODE).
      if (!pre || pre === "/futebol" || pre === "/futebol/times" || pre.startsWith("/futebol/times/")) continue;
      prefixes.push(pre);
    } else {
      exact.push(src);
    }
  }
  const appDir = path.join(rootDir, "src/app");
  const siteDir = path.join(appDir, "(site)");
  const staticTopLevel = uniqSorted([...dirs(siteDir), ...dirs(appDir)]);
  const futebolCode = uniqSorted(dirs(path.join(siteDir, "futebol")));
  for (const top of dirs(siteDir)) {
    if (top === "futebol") continue;
    for (const sub of dirs(path.join(siteDir, top))) prefixes.push(`/${top}/${sub}`);
  }
  return { exact: uniqSorted(exact), prefixes: uniqSorted(prefixes), staticTopLevel, futebolCode };
}

export function render(r) {
  const arr = (name, a) => `export const ${name}: readonly string[] = [\n${a.map((s) => `  ${JSON.stringify(s)},`).join("\n")}\n];\n`;
  return (
    `// GERADO por scripts/gen-reserved-paths.mjs — não editar. Rode: npm run gen:paths\n\n` +
    arr("RESERVED_EXACT", r.exact) + "\n" +
    arr("RESERVED_PREFIXES", r.prefixes) + "\n" +
    arr("STATIC_TOP_LEVEL", r.staticTopLevel) + "\n" +
    arr("FUTEBOL_CODE", r.futebolCode)
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = process.cwd();
  const out = path.join(root, "src/cms/lib/reserved-paths.generated.ts");
  fs.writeFileSync(out, render(buildReserved(root)));
  console.log("gerado", path.relative(root, out));
}

// Gera o JSON de um guia de amistoso: node scripts/onde-assistir/build-amistoso.mjs <post> <out.json>
import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";

const [post, out] = process.argv.slice(2);
const mod = await import(pathToFileURL(path.resolve("scripts/onde-assistir/posts", `${post}.mjs`)).href);
const res = mod.default();
for (const side of ["lineupHome", "lineupAway"]) {
  const s = mod.opts[side];
  if (s && s.starters.length !== 11) throw new Error(`${post}: ${side} tem ${s.starters.length} jogadores`);
}
writeFileSync(out, JSON.stringify(res, null, 1));
console.log(res.slug);

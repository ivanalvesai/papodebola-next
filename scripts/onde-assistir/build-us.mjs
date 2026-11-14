// Gera JSON + dados de capa dos guias NBA/NFL: OA_FACTS=facts.json node scripts/onde-assistir/build-us.mjs <post> <out-dir>
import { writeFileSync, mkdirSync } from "node:fs";
import { pathToFileURL } from "node:url";
import path from "node:path";
const [post, out] = process.argv.slice(2);
const mod = await import(pathToFileURL(path.resolve("scripts/onde-assistir/posts", `${post}.mjs`)).href);
mkdirSync(out, { recursive: true });
const sched = [];
for (const p of mod.default()) {
  writeFileSync(path.join(out, `${p.slug}.json`), JSON.stringify(p, null, 1));
  sched.push(`${p.slug}@${p.at}`);
  console.log(p.at, p.slug, "|", p.data.title);
}
writeFileSync(path.join(out, "sched.txt"), sched.join(" "));

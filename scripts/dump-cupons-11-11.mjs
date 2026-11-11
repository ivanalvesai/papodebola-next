// Lista tudo que cita 11.11 / 11/11 / "hoje" nas páginas 28/29 e posts 444/445 (pra revisar o pós-11.11).
//   bash ~/run-seed-cupons.sh dump-cupons-11-11.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const RX = /11\.11|11\/11|hoje|amanh/i;
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
function walk(o, path, out) {
  if (Array.isArray(o)) return o.forEach((v, i) => walk(v, `${path}[${i}]`, out));
  if (o && typeof o === "object") return Object.entries(o).forEach(([k, v]) => walk(v, `${path}.${k}`, out));
  if (typeof o === "string" && RX.test(o) && !/^https?:/.test(o)) out.push(`${path.replace(/\.(content|root|children|fields)/g, "").slice(-60)} = ${o.slice(0, 230)}`);
}
for (const [col, slug] of [["pages", "cupom-amazon"], ["pages", "cupom-shopee"], ["posts", "cupom-amazon-hoje-11-11"], ["posts", "cupom-shopee-hoje-11-11"]]) {
  const d = (await payload.find({ collection: col, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })).docs[0];
  log(`##### ${col}/${slug} id=${d.id} ${d._status}`);
  const out = []; const { id, createdAt, updatedAt, ...rest } = d; walk(rest, "", out); out.forEach((l) => log(l));
}
process.exit(0);

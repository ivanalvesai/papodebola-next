// Mostra a estrutura de uma página do CMS (blocos + nós do texto). bash ~/run-seed-cupons.sh dump-page.mjs
import fs from "fs";
const SLUG = "cupom-shopee";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
const p = (await payload.find({ collection: "pages", where: { slug: { equals: SLUG } }, limit: 1, depth: 0, draft: true })).docs[0];
log(`id=${p.id} status=${p._status} path=${p.path} width=${p.layoutStyle?.width} hero=${JSON.stringify(p.hero)}`);
for (const [i, b] of (p.layout || []).entries()) {
  log(`${i} ${b.blockType} ${b.blockType === "note" ? b.text : ""}`);
  if (b.blockType === "richText") for (const [j, n] of b.content.root.children.entries()) {
    const t = n.type === "block" ? `[${n.fields.blockType}] ${n.fields.title || ""} ${n.fields.store || ""}` : (n.children || []).map((c) => c.text || (c.children || []).map((d) => d.text).join("")).join("").slice(0, 110);
    log(`   ${j} ${n.type}${n.tag ? ":" + n.tag : ""} ${t}`);
  }
}
process.exit(0);

// Marca posts já publicados como guia de onde assistir (tag "Onde assistir"), sem mudar a
// categoria (a URL deles fica igual). Lista validada à mão em 13/11/2026.
//   bash ~/run-seed-cupons.sh tag-posts-onde-assistir.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
const IDS = [446, 447, 442, 439, 437, 438, 434, 435, 433, 430, 432, 429, 428, 422, 424, 423, 414, 413, 412, 409, 402, 390, 382, 337, 215];
const fold = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
for (const id of IDS) {
  try {
    const p = await payload.findByID({ collection: "posts", id, depth: 0 });
    const tags = p.tags || [];
    if (tags.some((t) => fold(t.tag || "") === "onde assistir")) { log(`${id} já tinha`); continue; }
    if (p._status !== "published") { log(`${id} não está publicado, pulei`); continue; }
    await payload.update({ collection: "posts", id, depth: 0, data: { tags: [...tags.map(({ tag }) => ({ tag })), { tag: "Onde assistir" }] } });
    log(`${id} ok ${p.slug}`);
  } catch (e) { log(`${id} ERRO ${e?.message || e}`); }
}
process.exit(0);

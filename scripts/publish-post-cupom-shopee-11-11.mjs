// Publica o post /cupons/cupom-shopee-hoje-11-11 (lê a última versão em rascunho e publica).
// Só rodar com ordem do Ivan. bash ~/run-seed-cupons.sh publish-post-cupom-shopee-11-11.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  const post = (await payload.find({ collection: "posts", where: { slug: { equals: "cupom-shopee-hoje-11-11" } }, limit: 1, depth: 0, draft: true })).docs[0];
  if (!post) throw new Error("post não encontrado");
  const { id, createdAt, updatedAt, _status, ...data } = post;
  const doc = await payload.update({ collection: "posts", id, draft: false, depth: 0, data: { ...data, publishedDate: new Date().toISOString(), _status: "published" } });
  log(`POST ${id} publicado: status=${doc._status}`);
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

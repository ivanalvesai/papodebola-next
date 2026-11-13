// Grava um post "onde assistir" (payload run no servidor). Lê /app/banners/oa-post.json
// (gerado por scripts/onde-assistir/build.mjs) + a capa /app/banners/{coverFile}.
// Cria como RASCUNHO; se existir o arquivo /app/banners/oa-publish, publica.
// Post já publicado continua publicado ao ser atualizado.
//   scp oa-post.json capa.png ivan@...:~/cupons-banners/ ; bash ~/run-seed-cupons.sh create-post-onde-assistir.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  const spec = JSON.parse(fs.readFileSync("/app/banners/oa-post.json", "utf8"));
  const publish = fs.existsSync("/app/banners/oa-publish");
  const prevMedia = await payload.find({ collection: "media", where: { alt: { equals: spec.coverAlt } }, limit: 1 });
  const coverId = prevMedia.docs[0]?.id ?? (await payload.create({ collection: "media", filePath: `/app/banners/${spec.coverFile}`, data: { alt: spec.coverAlt } })).id;
  const existing = (await payload.find({ collection: "posts", where: { slug: { equals: spec.slug } }, limit: 1, draft: true, depth: 0 })).docs[0];
  const status = publish || existing?._status === "published" ? "published" : "draft";
  const data = { ...spec.data, slug: spec.slug, cover: coverId, _status: status, ...(existing ? {} : { publishedDate: new Date().toISOString() }) };
  if (status === "published" && !existing?.publishedDate) data.publishedDate = new Date().toISOString();
  const doc = existing
    ? await payload.update({ collection: "posts", id: existing.id, data, draft: status !== "published", depth: 0 })
    : await payload.create({ collection: "posts", data, draft: status !== "published", depth: 0 });
  log(`POST ${doc.id} ${existing ? "atualizado" : "criado"} status=${status} slug=${spec.slug} cover=${coverId}`);
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

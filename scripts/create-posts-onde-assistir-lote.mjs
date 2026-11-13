// Lote de posts "onde assistir" com publicação AGENDADA (Scheduled Publish do Payload).
// Lê /app/banners/oa-lote.json: [{ file?: "x.json", slug?: "...", at: ISO }]. Com `file`, cria/
// atualiza o post como RASCUNHO (capa incluída) com publishedDate = at; com só `slug`, usa o post
// existente. Depois enfileira o job schedulePublish (waitUntil = at), que o cron 1/min do prod
// executa (# payload-jobs-run). Não duplica job pendente do mesmo post.
//   bash ~/run-seed-cupons.sh create-posts-onde-assistir-lote.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
const lote = JSON.parse(fs.readFileSync("/app/banners/oa-lote.json", "utf8"));
for (const item of lote) {
  try {
    let id, slug = item.slug;
    if (item.file) {
      const spec = JSON.parse(fs.readFileSync(`/app/banners/${item.file}`, "utf8"));
      slug = spec.slug;
      const prevMedia = await payload.find({ collection: "media", where: { alt: { equals: spec.coverAlt } }, limit: 1, depth: 0 });
      const coverId = prevMedia.docs[0]?.id ?? (await payload.create({ collection: "media", filePath: `/app/banners/${spec.coverFile}`, data: { alt: spec.coverAlt } })).id;
      const existing = (await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, draft: true, depth: 0 })).docs[0];
      if (existing?._status === "published") { log(`${slug}: já publicado, pulei`); continue; }
      const data = { ...spec.data, slug, cover: coverId, publishedDate: item.at, _status: "draft" };
      const doc = existing
        ? await payload.update({ collection: "posts", id: existing.id, data, draft: true, depth: 0 })
        : await payload.create({ collection: "posts", data, draft: true, depth: 0 });
      id = doc.id;
    } else {
      const doc = (await payload.find({ collection: "posts", where: { slug: { equals: slug } }, limit: 1, draft: true, depth: 0 })).docs[0];
      if (!doc) { log(`${slug}: não encontrado`); continue; }
      if (doc._status === "published") { log(`${slug}: já publicado, pulei`); continue; }
      await payload.update({ collection: "posts", id: doc.id, data: { publishedDate: item.at }, draft: true, depth: 0 });
      id = doc.id;
    }
    const pend = await payload.find({ collection: "payload-jobs", where: { and: [{ taskSlug: { equals: "schedulePublish" } }, { completedAt: { exists: false } }, { "input.doc.value": { equals: id } }] }, limit: 5, depth: 0 }).catch(() => ({ docs: [] }));
    for (const j of pend.docs) await payload.delete({ collection: "payload-jobs", id: j.id });
    const job = await payload.jobs.queue({ task: "schedulePublish", input: { type: "publish", doc: { relationTo: "posts", value: id } }, waitUntil: new Date(item.at), queue: "default" });
    log(`${id} ${slug} agendado ${item.at} (job ${job.id}${pend.docs.length ? `, ${pend.docs.length} antigo(s) removido(s)` : ""})`);
  } catch (e) { log(`ERRO ${item.file || item.slug}: ${e?.stack || e}`); }
}
process.exit(0);

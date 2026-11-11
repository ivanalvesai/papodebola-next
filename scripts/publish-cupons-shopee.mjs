// Publica a página /cupons/shopee (slug cupom-shopee) com o conteúdo da última versão
// em rascunho. Pedido explícito do Ivan em 11/11/2026 ("pode publicar").
// Rascunho que nunca foi publicado guarda o conteúdo novo só na tabela de versões, por
// isso lê com draft:true e publica com os dados completos.
//   bash ~/run-seed-cupons.sh publish-cupons-shopee.mjs
import fs from "fs";

const LOG = "/app/out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
fs.writeFileSync(LOG, "");
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

try {
  const found = await payload.find({ collection: "pages", where: { slug: { equals: "cupom-shopee" } }, limit: 1, depth: 0, draft: true });
  const page = found.docs[0];
  if (!page) throw new Error("página cupom-shopee não encontrada");
  const { id, createdAt, updatedAt, _status, ...data } = page;
  const doc = await payload.update({ collection: "pages", id, draft: false, depth: 0, data: { ...data, _status: "published" } });
  const coupons = JSON.stringify(doc.layout || []).split('"blockType":"coupon"').length - 1;
  log(`PAGE ${id} publicada: path=${doc.path} status=${doc._status} cupons=${coupons}`);
} catch (e) {
  log(`ERRO: ${e?.stack || e}`);
}
process.exit(0);

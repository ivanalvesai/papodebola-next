// /cupons/amazon (página 28): largura "wide" (1240px) e aviso de afiliado no FIM da página.
// Pedido do Ivan em 11/11/2026. Uso: bash ~/run-seed-cupons.sh cupons-amazon-largura.mjs [publish]
// Sem "publish" grava só rascunho (ver em /cms-preview/pagina/28).
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const PUBLISH = fs.existsSync("/app/PUBLISH");
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  const p = await payload.findByID({ collection: "pages", id: 28, depth: 0, draft: true });
  const isNote = (b) => b.blockType === "note" && String(b.text || "").startsWith("Transparência:");
  const notes = p.layout.filter(isNote);
  if (notes.length !== 1) throw new Error(`esperava 1 aviso, achei ${notes.length}`);
  const layout = [...p.layout.filter((b) => !isNote(b)), notes[0]];
  const { id, createdAt, updatedAt, _status, ...data } = p;
  const doc = await payload.update({ collection: "pages", id, depth: 0, draft: !PUBLISH,
    data: { ...data, layout, layoutStyle: { ...(p.layoutStyle || {}), width: "wide" }, _status: PUBLISH ? "published" : "draft" } });
  log(`ok publish=${PUBLISH} width=${doc.layoutStyle?.width} ordem=${doc.layout.map((b) => b.blockType).join(",")}`);
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

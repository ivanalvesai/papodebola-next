// Passa os banners REAIS pra versão em vídeo (15/11/2026, aprovado pelo Ivan):
// Amazon (id 5) e Shopee (id 6) recebem a arte estática (1º quadro) + MP4 dos banners de teste
// (teste-video-amazon / teste-video-shopee), que depois são apagados. Link, período e "Ativo"
// dos banners reais ficam como estão.   bash ~/run-seed-cupons.sh banner-video-aplicar.mjs
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const id = (v) => (v && typeof v === "object" ? v.id : v);
try {
  const payload = await getPayload({ config });
  for (const [realId, slug] of [[5, "teste-video-amazon"], [6, "teste-video-shopee"]]) {
    const t = (await payload.find({ collection: "promoBanners", where: { slug: { equals: slug } }, limit: 1, depth: 0 })).docs[0];
    if (!t) { log(`SEM teste ${slug}`); continue; }
    const doc = await payload.update({ collection: "promoBanners", id: realId, depth: 1, data: {
      imageDesktop: id(t.imageDesktop), imageMobile: id(t.imageMobile), videoDesktop: id(t.videoDesktop), videoMobile: id(t.videoMobile),
    } });
    log(`REAL id=${doc.id} ${doc.slug} active=${doc.active} video=${doc.videoMobile?.url} img=${doc.imageMobile?.url}`);
    await payload.delete({ collection: "promoBanners", id: t.id });
    log(`apagado teste ${slug} (id ${t.id}); mídias mantidas`);
  }
} catch (e) { log(`ERRO ${e?.stack || e}`); }
process.exit(0);

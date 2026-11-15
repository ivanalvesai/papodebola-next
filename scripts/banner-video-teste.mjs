// Banners ANIMADOS em vídeo (MP4 em loop, ~5x mais leve que o WebP animado) — 15/11/2026.
// Cria 2 banners de TESTE (começam em 2030, então nunca aparecem sozinhos) com a arte estática
// (1º quadro) + o vídeo, copiando link/alt dos banners reais (Amazon id 5, Shopee id 6).
// Ver no dev: https://development.papodebola.com.br/?banner=teste-video-amazon (ou -shopee).
//   arquivos em ~/cupons-banners/ ; bash ~/run-seed-cupons.sh banner-video-teste.mjs
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
try {
  const payload = await getPayload({ config });
  const media = async (file, alt) => {
    const filePath = `/app/banners/${file}`;
    if (!fs.existsSync(filePath)) throw new Error(`arquivo não encontrado: ${filePath}`);
    const d = await payload.create({ collection: "media", filePath, data: { alt } });
    log(`MEDIA ${file} id=${d.id} ${d.mimeType} ${d.filesize}B`);
    return d.id;
  };
  for (const [srcId, slug, base] of [[5, "teste-video-amazon", "black-dos-sonhos-amazon"], [6, "teste-video-shopee", "cupons-esgotando-shopee"]]) {
    const src = await payload.findByID({ collection: "promoBanners", id: srcId, depth: 0 });
    const data = {
      name: `TESTE vídeo — ${src.name}`,
      slug,
      imageDesktop: await media(`${base}-computador-estatico.webp`, src.alt),
      imageMobile: await media(`${base}-celular-estatico.webp`, src.alt),
      videoDesktop: await media(`${base}-computador-video.mp4`, src.alt),
      videoMobile: await media(`${base}-celular-video.mp4`, src.alt),
      alt: src.alt,
      url: src.url,
      startsAt: "2030-01-01T03:00:00.000Z",
      active: true,
    };
    const ex = await payload.find({ collection: "promoBanners", where: { slug: { equals: slug } }, limit: 1 });
    const doc = ex.docs[0] ? await payload.update({ collection: "promoBanners", id: ex.docs[0].id, data }) : await payload.create({ collection: "promoBanners", data });
    log(`BANNER ok id=${doc.id} slug=${doc.slug} video=${typeof doc.videoDesktop === "object" ? doc.videoDesktop?.url : doc.videoDesktop}`);
  }
} catch (e) { log(`ERRO ${e?.stack || e}`); }
process.exit(0);

// Troca a arte do banner da Shopee (id 6) pela versão ANIMADA de "Cupons esgotando"
// (cupons com zoom, raios girando, CORRA! pulsando), aprovada pelo Ivan em 13/11/2026.
// O Payload converte o GIF em WebP animado (animated:true no sharp), então a animação é mantida.
// Link, datas e alt continuam os mesmos. Fonte: scripts/banners/cupons-esgotando.html?anim=1
// + scripts/banners/render-anim.mjs.
//   scp *.gif → ~/cupons-banners/ ; bash ~/run-seed-cupons.sh banner-shopee-animado.mjs
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const ALT = "Cupons esgotando na Shopee: corra e pegue o cupom do dia";
try {
  const payload = await getPayload({ config });
  const media = async (file) => {
    const filePath = `/app/banners/${file}`;
    if (!fs.existsSync(filePath)) throw new Error(`arte não encontrada: ${filePath}`);
    const d = await payload.create({ collection: "media", filePath, data: { alt: ALT } });
    log(`MEDIA ${file} id=${d.id} ${d.filename} ${d.width}x${d.height} ${Math.round(d.filesize / 1024)}KB`);
    return d.id;
  };
  const desk = await media("cupons-esgotando-shopee-animado-computador.gif");
  const mob = await media("cupons-esgotando-shopee-animado-celular.gif");
  const doc = await payload.update({ collection: "promoBanners", id: 6, data: { imageDesktop: desk, imageMobile: mob } });
  log(`BANNER ok id=${doc.id} slug=${doc.slug} active=${doc.active} url=${doc.url}`);
} catch (e) { log(`ERRO ${e?.stack || e}`); }
process.exit(0);

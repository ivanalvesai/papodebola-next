// Troca a arte do banner "Black Friday — Shopee" (id 6) pela "Cupons ESGOTANDO. CORRA!" (versão A,
// laranja, escolhida pelo Ivan em 13/11/2026) e liga o link de afiliado da Shopee (ID 18303861358,
// subId cuponsdodia), que leva à página de cupons do dia. Ocupa o espaço do banner do Mercado Livre (desligado).
//   bash ~/run-seed-cupons.sh banner-shopee-cupons-esgotando.mjs
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const URL = "https://s.shopee.com.br/8Kr2i9GOjg";
const ALT = "Cupons esgotando na Shopee: corra e pegue o cupom do dia";
try {
  const payload = await getPayload({ config });
  const media = async (file) => {
    const filePath = `/app/banners/${file}`;
    if (!fs.existsSync(filePath)) throw new Error(`arte não encontrada: ${filePath}`);
    const d = await payload.create({ collection: "media", filePath, data: { alt: ALT } });
    log(`MEDIA ${file} id=${d.id}`); return d.id;
  };
  const desk = await media("cupons-esgotando-shopee-computador.png");
  const mob = await media("cupons-esgotando-shopee-celular.png");
  const doc = await payload.update({ collection: "promoBanners", id: 6, data: {
    name: "Cupons esgotando — Shopee", imageDesktop: desk, imageMobile: mob, alt: ALT, url: URL, active: true,
  } });
  log(`BANNER ok id=${doc.id} slug=${doc.slug} url=${doc.url} active=${doc.active} ${doc.startsAt}→${doc.endsAt}`);
} catch (e) { log(`ERRO ${e?.stack || e}`); }
process.exit(0);

// Banner da Amazon (id 5, black-friday-amazon) com a arte ANIMADA "Black dos Sonhos" (layout v2:
// título centralizado, cupons se movendo, raios no fundo, lingotes em SVG), aprovada pelo Ivan
// em 13/11/2026, e o link https://link.amazon/A0c8NvoEP (link curto passado por ele).
// O Payload converte o GIF em WebP animado. Fonte: scripts/banners/black-dos-sonhos-amazon.html
// + scripts/banners/render-anim.mjs.
//   MODO=amazon-so  → ativa a Amazon e desativa a Shopee (id 6) até o rodízio por hora ir pra prod
//   MODO=rodizio    → só religa a Shopee (os dois ativos; o navegador alterna de hora em hora)
//   scp *.gif → ~/cupons-banners/ ; bash ~/run-seed-cupons.sh banner-amazon-black-dos-sonhos.mjs
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const MODO = fs.existsSync("/app/banners/MODO-rodizio") ? "rodizio" : "amazon-so";
const URL = "https://link.amazon/A0c8NvoEP";
const ALT = "Black dos Sonhos na Amazon: concorra a R$ 1.000.000 em certificados de barra de ouro";
try {
  const payload = await getPayload({ config });
  if (MODO === "amazon-so") {
    const media = async (file) => {
      const filePath = `/app/banners/${file}`;
      if (!fs.existsSync(filePath)) throw new Error(`arte não encontrada: ${filePath}`);
      const d = await payload.create({ collection: "media", filePath, data: { alt: ALT } });
      log(`MEDIA ${file} id=${d.id} ${d.filename} ${d.width}x${d.height} ${Math.round(d.filesize / 1024)}KB`);
      return d.id;
    };
    const desk = await media("black-dos-sonhos-amazon-animado-computador.gif");
    const mob = await media("black-dos-sonhos-amazon-animado-celular.gif");
    const a = await payload.update({ collection: "promoBanners", id: 5, data: { imageDesktop: desk, imageMobile: mob, url: URL, alt: ALT, active: true } });
    log(`AMAZON ok id=${a.id} slug=${a.slug} active=${a.active} url=${a.url} ${a.startsAt}→${a.endsAt}`);
    const s = await payload.update({ collection: "promoBanners", id: 6, data: { active: false } });
    log(`SHOPEE id=${s.id} active=${s.active} url=${s.url}`);
  } else {
    const s = await payload.update({ collection: "promoBanners", id: 6, data: { active: true } });
    log(`SHOPEE id=${s.id} active=${s.active} url=${s.url} ${s.startsAt}→${s.endsAt}`);
  }
} catch (e) { log(`ERRO ${e?.stack || e}`); }
process.exit(0);

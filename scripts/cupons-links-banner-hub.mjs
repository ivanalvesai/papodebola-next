// 14/11 (pedido do Ivan): enquanto a API de afiliados da Shopee não sai, todo link da Shopee usa o
// link do banner (nossa conta 18303861358, página de cupons do dia). Antes, os 135 links do post 445
// eram da conta webbusca (an_18354640413) e a comissão ia pra ela.
//  - post 445: todo s.shopee.com.br/* vira o link do banner (imagens cf.shopee ficam).
//  - /cupons/shopee (pág. 29): ticket leva pro link do banner; sai o link do Mercado Livre (rascunho, 404).
//  - /cupons/amazon (pág. 28): "outras lojas" ganha Cupom Shopee.
//  - /cupons (pág. 26): hub publicado, com cards Amazon e Shopee, sem Mercado Livre.
// Amazon: links já levam a tag pap0debola-20 (comissão nossa), então ficam como estão.
//   bash ~/run-seed-cupons.sh cupons-links-banner-hub.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const SHOPEE = "https://s.shopee.com.br/8Kr2i9GOjg";
const SHORT = /^https?:\/\/(s\.shopee\.com\.br|shope\.ee)\/[A-Za-z0-9]+$/;

let changes = 0;
function swapShopee(o) {
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && SHORT.test(v) && v !== SHOPEE) { o[k] = SHOPEE; changes++; }
    else if (v && typeof v === "object") swapShopee(v);
  }
}
function swapText(o, from, to) {
  if (!o || typeof o !== "object") return;
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "string" && v.includes(from)) { o[k] = v.split(from).join(to); changes++; }
    else if (v && typeof v === "object") swapText(v, from, to);
  }
}
const coupons = (kids) => kids.filter((n) => n.type === "block" && n.fields?.blockType === "coupon").map((n) => n.fields);

const { getPayload } = await import("payload");
const payload = await getPayload({ config: (await import("@payload-config")).default });

async function edit(collection, id, fn, { publish = false } = {}) {
  changes = 0;
  const doc = await payload.findByID({ collection, id, depth: 0, draft: true });
  const { createdAt, updatedAt, _status, ...data } = JSON.parse(JSON.stringify(doc));
  delete data.id;
  fn(data);
  const keep = publish || _status === "published";
  if (!changes && keep === (_status === "published")) return log(`${collection}/${id}: nada a mudar`);
  await payload.update({ collection, id, depth: 0, draft: !keep, data: { ...data, _status: keep ? "published" : "draft" } });
  log(`${collection}/${id} (${doc.slug}): ${changes} mudanças, ${keep ? "publicado" : "rascunho"}`);
}

try {
  await edit("posts", 445, (d) => swapShopee(d));

  await edit("pages", 29, (d) => {
    const kids = d.layout.find((b) => b.blockType === "richText").content.root.children;
    for (const c of coupons(kids)) if (c.store === "shopee") {
      Object.assign(c, {
        headline: "Cupons do dia",
        details: "Os cupons do 11.11 acabaram às 23h59 de 11/11. No link estão os cupons que a Shopee liberou hoje; resgate antes de fechar a compra. Os cupons da Black Friday entram aqui assim que a Shopee liberar.",
        url: SHOPEE, buttonLabel: "Pegar cupons na Shopee",
      });
      changes++;
    }
    swapShopee(d);
    const lc = d.layout.find((b) => b.blockType === "linkCards");
    const n = lc.items.length;
    lc.items = lc.items.filter((i) => i.href !== "/cupons/mercado-livre");
    changes += n - lc.items.length;
  });

  await edit("pages", 28, (d) => {
    const lc = d.layout.find((b) => b.blockType === "linkCards");
    if (!lc.items.some((i) => i.href === "/cupons/shopee")) { lc.items.push({ label: "Cupom Shopee", href: "/cupons/shopee" }); changes++; }
  });

  await edit("pages", 26, (d) => {
    const cards = d.layout.find((b) => b.blockType === "cards");
    if (!cards.items.some((i) => i.href === "/cupons/shopee")) {
      cards.items.push({ image: null, title: "Cupom Shopee", text: "Cupons da loja, de vendedores e de frete grátis.", href: "/cupons/shopee", linkLabel: "Ver cupons" });
      changes++;
    }
    const note = d.layout.find((b) => b.blockType === "note");
    note.text = "Transparência: esta página tem links de afiliado. Como Associado da Amazon e afiliado da Shopee, o Papo de Bola recebe comissão por compras qualificadas, sem custo a mais para você. Cupons e preços mudam sem aviso; confira as condições na loja antes de pagar.";
    changes++;
    d.seo = { ...d.seo, metaTitle: "Cupons de desconto da Amazon e da Shopee", metaDescription: "Cupons de desconto da Amazon e da Shopee conferidos pela redação, com regras e validade. Ofertas da Black Friday, Cyber Monday e 12.12." };
    swapText(d.layout, "do Mercado Livre, da Amazon e da Shopee", "da Amazon e da Shopee");
    swapText(d.layout, "Mercado Livre, Amazon e Shopee", "Amazon e Shopee");
    const left = JSON.stringify(d).match(/[^"]{0,60}Mercado Livre[^"]{0,40}/g);
    log(`hub: menções restantes a Mercado Livre: ${left ? left.join(" || ") : "nenhuma"}`);
  }, { publish: true });
} catch (e) { log(`ERRO ${e.stack || e}`); }
process.exit(0);

// Virada do 11.11 -> Black Friday (agendado no crontab do servidor pra 12/11/2026 00:05, # cupons-pos-11-11).
// Pedido do Ivan em 11/11: tirar o que venceu e trocar "hoje/11.11" por Black Friday, e os botões de cupom
// da Shopee (cuja campanha 11.11 acaba) passam a levar pra uma página com os produtos e o link de afiliado.
//  - /cupons/shopee (pág. 29): card vira "Black Friday", botão leva pro post com os 67 produtos (links nossos).
//  - post 445 (Shopee): aviso de atualização no topo, card vira "Black Friday" com link nosso pra Shopee,
//    textos sem "hoje"/11.11, títulos e SEO de Black Friday.
//  - /cupons/amazon (pág. 28) e post 444: saem os cupons "só hoje"; validade e textos viram Black Friday.
// Idempotente (só troca o que ainda está no texto antigo). Mantém publicado.
//   bash ~/run-seed-cupons.sh cupons-pos-11-11.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const SHOPEE_POST = "/cupons/cupom-shopee-hoje-11-11";
const SHOPEE_HOME = "https://s.shopee.com.br/5fqFPZpOpH"; // shopee.com.br com nosso link (subId cuponsshopee)
const UPDATE_NOTE = "Atualizado em 12/11: os cupons do 11.11 acabaram à meia-noite. Muitos produtos seguem com desconto, mas preço e estoque mudam; confira na loja antes de comprar. Os cupons da Black Friday entram aqui assim que forem liberados.";

const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const P = (text) => ({ type: "paragraph", children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });

let changes = 0;
// troca o texto de um nó de texto (match exato ou trecho) em toda a árvore Lexical
function replaceText(node, from, to) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n) => replaceText(n, from, to));
  if (node.type === "text" && typeof node.text === "string" && node.text.includes(from)) { node.text = node.text.split(from).join(to); changes++; }
  for (const v of Object.values(node)) if (v && typeof v === "object") replaceText(v, from, to);
}
const blocks = (children, type) => children.filter((n) => n.type === "block" && n.fields?.blockType === type).map((n) => n.fields);
const dropSoHoje = (c) => {
  const before = (c.offers || []).length;
  c.offers = (c.offers || []).filter((o) => !/só hoje/i.test(o.note || ""));
  changes += before - c.offers.length;
  if (/só hoje \(11\/11\); demais até /i.test(c.validUntil || "")) { c.validUntil = c.validUntil.replace(/^.*só hoje \(11\/11\); demais até /i, "Até ") + ", conforme o cupom"; changes++; }
};
const setFaq = (children, question, newQ, newA) => {
  for (const f of blocks(children, "faq")) for (const it of f.items || []) if (it.question === question) {
    it.question = newQ; it.answer = { root: { type: "root", children: [P(newA)], direction: "ltr", format: "", indent: 0, version: 1 } }; changes++;
  }
};
const addUpdateNote = (children) => {
  if (children[0]?.type === "paragraph" && (children[0].children?.[0]?.text || "").startsWith("Atualizado em 12/11")) return;
  children.unshift(P(UPDATE_NOTE)); changes++;
};
const shopeeBlackFriday = (c, url, buttonLabel) => {
  if (c.title === "Cupons Shopee da Black Friday") return;
  Object.assign(c, {
    headline: "Cupons em breve", value: "Black Friday", title: "Cupons Shopee da Black Friday", code: "",
    details: "Os cupons do 11.11 acabaram às 23h59 de 11/11. Os cupons da Black Friday entram aqui assim que a Shopee liberar, conferidos pela redação. Enquanto isso, veja as ofertas que separamos.",
    validUntil: "", url, buttonLabel, offers: [],
  });
  changes++;
};

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

async function edit(collection, slug, fn) {
  changes = 0;
  const doc = (await payload.find({ collection, where: { slug: { equals: slug } }, limit: 1, depth: 0, draft: true })).docs[0];
  if (!doc) return log(`ERRO ${collection}/${slug} não encontrado`);
  const { id, createdAt, updatedAt, _status, ...data } = JSON.parse(JSON.stringify(doc));
  fn(data);
  if (!changes) return log(`${collection}/${slug} (${id}): nada a mudar`);
  const keep = _status === "published";
  await payload.update({ collection, id, depth: 0, draft: !keep, data: { ...data, _status: keep ? "published" : "draft" } });
  log(`${collection}/${slug} (${id}): ${changes} mudanças, ${keep ? "publicado" : "rascunho"}`);
}

try {
  // ── /cupons/shopee ──
  await edit("pages", "cupom-shopee", (d) => {
    const kids = d.layout.find((b) => b.blockType === "richText").content.root.children;
    for (const c of blocks(kids, "coupon")) if (c.store === "shopee") shopeeBlackFriday(c, SHOPEE_POST, "Ver as ofertas da Shopee");
    replaceText(kids, "Separamos 67 ofertas do 11.11 da Shopee,", "Separamos 67 ofertas da Shopee,");
    for (const b of blocks(kids, "ctaButton")) if (b.label === "Ver as 67 ofertas do 11.11 na Shopee") { b.label = "Ver as 67 ofertas da Shopee"; changes++; }
  });

  // ── post Shopee ──
  await edit("posts", "cupom-shopee-hoje-11-11", (d) => {
    const kids = d.content.root.children;
    addUpdateNote(kids);
    for (const c of blocks(kids, "coupon")) if (c.store === "shopee") shopeeBlackFriday(c, SHOPEE_HOME, "Ver ofertas na Shopee");
    replaceText(kids, " da página da campanha de hoje, ", " da página da campanha do 11.11, ");
    replaceText(kids, "Antes de comprar, resgate os cupons abaixo: eles somam com o desconto do produto.", "Quando a Shopee liberar os cupons da Black Friday, eles somam com o desconto do produto.");
    replaceText(kids, "é um dos mais vendidos da campanha: sai por R$ 69,90 com o cupom de R$ 20 só para ele (está no card de cupons acima).", "é um dos mais vendidos da Shopee.");
    for (const g of blocks(kids, "productGrid")) for (const it of g.items || []) if (it.price === "R$ 69,90 com cupom") { Object.assign(it, { price: "R$ 85,41 no Pix", oldPrice: "", tag: "-57%" }); changes++; }
    replaceText(kids, "Mais achadinhos do 11.11 para a casa", "Mais achadinhos da Shopee para a casa");
    replaceText(kids, "Boa parte desses preços só aparece no Pix e com o cupom resgatado; alguns passam a valer a partir da meia-noite.", "Boa parte desses preços só aparece no Pix e com cupom resgatado.");
    replaceText(kids, "Como usar cupom na Shopee hoje", "Como usar cupom na Shopee");
    setFaq(kids, "Qual o cupom Shopee de hoje, 11/11?", "Qual o cupom Shopee de hoje?",
      "Os cupons do 11.11 (R$ 100 OFF, 30% OFF no Full e os códigos de R$ 70 e R$ 20) acabaram à meia-noite de 12/11. Os cupons da Black Friday entram nesta página assim que a Shopee liberar.");
    setFaq(kids, "Até que horas vale o 11.11 da Shopee?", "Até quando valeram as ofertas do 11.11 da Shopee?",
      "As ofertas e cupons do 11.11 valeram até 23h59 de 11 de novembro. Agora começam as ofertas de Black Friday, que vão até o fim do mês.");
    if (d.title.startsWith("Cupom Shopee hoje 11/11")) {
      d.title = "Cupom Shopee: 67 ofertas para a Black Friday com games, celular, casa e mais";
      d.excerpt = "Ofertas da Shopee para a Black Friday: 67 produtos com desconto, como DualSense, Galaxy A17, ventilador, sofá, air fryer, beleza e moda. Cupons novos assim que forem liberados.";
      d.seo = { ...(d.seo || {}), metaTitle: "Cupom Shopee: ofertas e cupons para a Black Friday | Papo de Bola",
        metaDescription: "Cupom Shopee e 67 ofertas para a Black Friday: games, celulares, ventilador, casa, ferramentas, beleza e moda, com preço e nota de quem já comprou." };
      changes++;
    }
  });

  // ── /cupons/amazon ──
  await edit("pages", "cupom-amazon", (d) => {
    const kids = d.layout.find((b) => b.blockType === "richText").content.root.children;
    for (const c of blocks(kids, "coupon")) dropSoHoje(c);
  });

  // ── post Amazon ──
  await edit("posts", "cupom-amazon-hoje-11-11", (d) => {
    const kids = d.content.root.children;
    addUpdateNote(kids);
    for (const c of blocks(kids, "coupon")) {
      dropSoHoje(c);
      if (c.title === "Cupons Amazon de hoje: os destaques do 11.11") { c.title = "Cupons Amazon da Black Friday"; changes++; }
      if (c.validUntil === "11/11/2026 ou enquanto durar") { c.validUntil = "Enquanto a Amazon mantiver a oferta"; changes++; }
    }
    replaceText(kids, "GTA 6 na Amazon: pré-venda e cupom de hoje", "GTA 6 na Amazon: pré-venda e cupom");
    replaceText(kids, ", que hoje aparece com ", ", que apareceu no 11.11 com ");
    replaceText(kids, "Como usar cupom na Amazon hoje", "Como usar cupom na Amazon");
    setFaq(kids, "Qual o cupom Amazon de hoje, 11/11?", "Qual o cupom Amazon de hoje?",
      "Os cupons por categoria da Black Friday estão no card acima, com validade até 18/11, 27/11 ou 30/11. O cupom de R$ 250 do combo PS5 + GTA VI aparece na página do produto enquanto a Amazon mantiver a oferta.");
    setFaq(kids, "O 11.11 da Amazon vale o dia todo?", "Até quando valeram as ofertas do 11.11 da Amazon?",
      "As ofertas do 11.11 valeram no dia 11 de novembro. Agora vale o período de Black Friday, que vai até o fim do mês.");
    if (d.title.startsWith("Cupom Amazon hoje 11/11")) {
      d.title = "Cupom Amazon: ofertas da Black Friday com GTA 6, PS5, TVs e mais";
      d.excerpt = "Cupons da Black Friday na Amazon: pré-venda de GTA 6, combo PS5, Smart TVs, impressoras 3D, futebol e tecnologia.";
      d.seo = { ...(d.seo || {}), metaTitle: "Cupom Amazon: cupons e ofertas da Black Friday | Papo de Bola",
        metaDescription: "Cupons Amazon da Black Friday: GTA 6 em pré-venda, PS5, Smart TV, impressora 3D, camisa da Seleção e mais ofertas conferidas pela redação." };
      changes++;
    }
  });
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

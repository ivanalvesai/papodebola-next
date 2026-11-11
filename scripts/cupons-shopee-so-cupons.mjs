// /cupons/shopee (página 29) fica SÓ com os cupons, como a /cupons/amazon: tira as 8 vitrines
// (os 48 produtos foram pro post /cupons/cupom-shopee-hoje-11-11) e põe um botão pro post logo
// depois do card de cupons. Grava como RASCUNHO (a versão publicada não muda); publicar junto
// com o post: publish-cupons-shopee.mjs + publish-post-cupom-shopee-11-11.mjs.
//   bash ~/run-seed-cupons.sh cupons-shopee-so-cupons.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const POST_URL = "/cupons/cupom-shopee-hoje-11-11";
const T = (text) => ({ type: "text", text, format: 0, detail: 0, mode: "normal", style: "", version: 1 });
const P = (text) => ({ type: "paragraph", children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const POST_P = "Quer ver os produtos? Separamos 67 ofertas do 11.11 da Shopee, com preço e nota de quem já comprou, num post à parte:";
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });
try {
  const page = (await payload.find({ collection: "pages", where: { slug: { equals: "cupom-shopee" } }, limit: 1, depth: 0, draft: true })).docs[0];
  if (!page) throw new Error("página cupom-shopee não encontrada");
  const layout = JSON.parse(JSON.stringify(page.layout || []));
  const rt = layout.find((b) => b.blockType === "richText");
  const kids = rt.content.root.children;
  const txt = (n) => (n.children || []).map((c) => c.text || "").join("");
  const isPostLink = (n) => (n.type === "paragraph" && txt(n).startsWith("Quer ver os produtos?")) || (n.type === "block" && n.fields?.blockType === "ctaButton" && n.fields?.url === POST_URL);
  const products = (n) =>
    (n.type === "block" && n.fields?.blockType === "productGrid") ||
    (n.type === "heading" && n.tag === "h3") ||
    (n.type === "heading" && txt(n) === "Ofertas do 11.11 na Shopee") ||
    (n.type === "paragraph" && txt(n).startsWith("Separamos 48 produtos"));
  const kept = kids.filter((n) => !products(n) && !isPostLink(n));
  const at = kept.findIndex((n) => n.type === "block" && n.fields?.blockType === "coupon");
  if (at < 0) throw new Error("card de cupom não encontrado");
  kept.splice(at + 1, 0, P(POST_P), BLOCK("ctaButton", { label: "Ver as 67 ofertas do 11.11 na Shopee", url: POST_URL, style: "primary" }));
  // cupom com código (R$ 70 OFF) e link do cupom do ventilador vindos da lista de afiliados (11/11 à noite)
  const c = kept[at].fields;
  const campaign = c.url;
  c.offers = [
    ...(c.offers || []).filter((o) => !["C4RR1NH0CH310", "20D3SBL0QU34D0"].includes(o.code) && !String(o.label).startsWith("Ventilador")),
    { label: "Compras acima de R$ 350", value: "R$ 70", note: "Com código", code: "C4RR1NH0CH310", url: campaign },
    { label: "Compras acima de R$ 99", value: "R$ 20", note: "Com código", code: "20D3SBL0QU34D0", url: campaign },
    { label: "Ventilador Mondial 30 cm", value: "R$ 20", note: "Só esse produto, acima de R$ 60", code: "", url: "https://s.shopee.com.br/6q2Cl6BGyy" },
  ];
  c.details = 'Sem código: toque em "Resgatar" na página da Shopee e o cupom fica salvo na sua conta para usar no fechamento do pedido. A Shopee solta novas levas ao longo do dia (16h, 18h, 20h e 22h). Os cupons de R$ 70 e R$ 20 OFF são com código: copie e cole no carrinho. Também há 2 fretes grátis sem valor mínimo. Conferidos em 11/11/2026.';
  rt.content.root.children = kept;
  const { id, createdAt, updatedAt, _status, ...data } = page;
  await payload.update({ collection: "pages", id, draft: true, depth: 0, data: { ...data, layout, _status: "draft" } });
  log(`PAGE ${id} ok (rascunho): ${kids.length} -> ${kept.length} nós; vitrines=${kept.filter((n) => n.fields?.blockType === "productGrid").length}`);
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

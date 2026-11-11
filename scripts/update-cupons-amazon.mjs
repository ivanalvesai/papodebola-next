// Cupons da Amazon (Black Friday 2026) na página /cupons/amazon (página 28, RASCUNHO).
// Troca os "Modelo de cupom" (e qualquer cupom Amazon gerado antes) por cards de cupom no
// visual de ticket, agrupados por categoria, com mini-cupons clicáveis.
//
// Fonte: amazon.com.br/blackfriday/2 → páginas /promotion/psp/{ID}, conferidas no Chrome
// logado do Ivan em 11/11/2026 ~11h (percentual, "só no app", Prime e validade).
// Cupons sem código: o desconto entra no fechamento do pedido.
//
// Rodar no servidor (dev com git pull antes, por causa do schema do bloco):
//   bash ~/run-seed-cupons.sh update-cupons-amazon.mjs
// NÃO publica: atualiza como rascunho. Só o Ivan publica.
import fs from "fs";

const LOG = "/app/out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const TAG = "pap0debola-20";
const psp = (id) => `https://www.amazon.com.br/promotion/psp/${id}?tag=${TAG}`;
const ALL = `https://www.amazon.com.br/blackfriday/2?tag=${TAG}`;
const CHECKED = "11/11/2026, 11h";

// [nome, desconto, observação, id]
const GROUPS = [
  {
    title: "Esportes, futebol e lazer",
    value: "Até 40% OFF",
    valid: "Futebol só hoje (11/11); demais até 27/11 ou 30/11",
    offers: [
      ["Futebol", "40%", "Prime · só hoje", "AASC2PA0ENBIF"],
      ["Corrida", "20%", "Prime · no app", "A8ENSC6UJU4JI"],
      ["Esportes", "20%", "Só no app", "A23PV8R1LRW57"],
      ["Fitness", "20%", "Só no app", "A169PKD5RUI3VN"],
      ["Itens de pesca", "20%", "Só no app", "A3MMQX7895AKQU"],
      ["Suplementos", "15%", "Só no app", "A2G3U1520PCGB0"],
      ["Brinquedos e jogos", "15%", "Só no app", "A2IMN4MJLBWNZG"],
      ["Artigos esportivos", "10%", "Só no app", "A30F87IW26XFD9"],
    ],
  },
  {
    title: "Celular, tecnologia e música",
    value: "Até 20% OFF",
    valid: "Smartphones e smartwatches só hoje (11/11); demais até 18/11 ou 30/11",
    offers: [
      ["Acessórios tech", "20%", "Só no app", "A3RAFMZYAMURGY"],
      ["Discos de vinil", "20%", "Só no app", "A1E0DBN3J209HF"],
      ["Instrumentos musicais", "20%", "Só no app", "A12R7CPY56SNC"],
      ["Smartwatches", "15%", "Só hoje", "A3IBQIGHXLT1O2"],
      ["Smartphones", "10%", "Só hoje", "A1T164EH8D9D88"],
      ["Acessórios eletrônicos", "10%", "Até 18/11", "A1S4BGKW1F9LVM"],
    ],
  },
  {
    title: "Casa, construção e automotivo",
    value: "Até 50% OFF",
    valid: "Até 30/11 (organização de cozinha até 19/11)",
    offers: [
      ["Construção", "50%", "Só no app", "A9Y0D8LUCLXG9"],
      ["Itens automotivos", "50%", "Só no app", "AF5TE5EMUNIGL"],
      ["Automotivo", "20%", "Prime", "A3JXL6ODALE2ZB"],
      ["Reforma da casa", "20%", "Só no app", "AAZZXMPFI1XFX"],
      ["Cozinha", "20%", "Só no app", "AMJ4GNRP8ZU4K"],
      ["Cama e banho", "20%", "Só no app", "A15PQ30RN1HD8H"],
      ["Limpeza", "20%", "Só no app", "A3HOXJ0569I369"],
      ["Itens de verão", "20%", "Só no app", "A14AFAH5JEFOY"],
      ["Térmicos", "15%", "Só no app", "A3RZE7PNT7YE2M"],
      ["Jardim", "15%", "Só no app", "A38EDJK6PG7V45"],
      ["Panelas", "10%", "Só no app", "A2ACYYXSV2U476"],
      ["Eletroportáteis", "10%", "Só no app", "A2AJDMXGQ5DDEE"],
      ["Mesa posta", "10%", "Só no app", "A2AWIDNT6C57LK"],
      ["Ventilação", "10%", "Só no app", "AOPLSPDVXXF4H"],
      ["Ferramentas", "10%", "Só no app", "A2JGURECW4XLZQ"],
      ["Organização de cozinha", "10%", "Prime", "A1LTIEKT4GO37C"],
    ],
  },
  {
    title: "Moda, acessórios e beleza",
    value: "Até 30% OFF",
    valid: "Moda internacional só hoje (11/11); demais até 18/11, 27/11 ou 30/11",
    offers: [
      ["Moda internacional", "30%", "Prime · só hoje", "AFBFIOGRZ1X1O"],
      ["Acessórios de moda", "30%", "Só no app", "A20VB0VIUPNP9C"],
      ["Calvin Klein", "25%", "Prime", "A3MBI1SNURZAG6"],
      ["Carter's (2 itens)", "25%", "Prime", "AJU84VSZIEL3Z"],
      ["Moda feminina", "20%", "Só no app", "A1F6O5QOLNNKNT"],
      ["Moda masculina", "20%", "Só no app", "A4H5PXVENE7T2"],
      ["Carteiras e bolsas", "20%", "Só no app", "A2K9IRSBJOTU9U"],
      ["Relógios", "20%", "Só no app", "A2N6WD5SKSR3G5"],
      ["Beleza premium", "20%", "Até 30/11", "ANH4295O1CRWB"],
      ["Cuidados pessoais", "15%", "Só no app", "A3FY47AKSJETO4"],
    ],
  },
  {
    title: "Leve mais, pague menos",
    value: "Até 30% OFF",
    valid: "Compre 3 e compre 6 até 30/12; livros e papelaria até 30/11",
    offers: [
      ["Compre 6 itens", "30%", "Prime · a partir de R$ 10", "ASUP97JVXDHOH"],
      ["Compre 3 itens", "15%", "Prime · a partir de R$ 10", "A1QDH0NSN0N1CT"],
      ["Escritório e papelaria", "20%", "Só no app", "A3BIAMXR45WRW5"],
      ["Compre 4 livros", "10%", "Prime", "A29MK98EPUD5DV"],
    ],
  },
  {
    title: "Mercado, pet e bebê",
    value: "Até 20% OFF",
    valid: "Até 30/11",
    offers: [
      ["Bebidas alcoólicas (2 itens)", "20%", "Só no app", "A7VMOX256MDVO"],
      ["Alimentos e bebidas", "15%", "Só no app", "A23J480MLGVDPC"],
      ["Snacks", "15%", "Só no app", "A2X2B2SBVPJME0"],
      ["Pet shop", "15%", "Só no app", "A2V8SGPSRNMNJO"],
      ["Itens de bebê", "10%", "Só no app", "AH2QO1TZLZ941"],
    ],
  },
  {
    title: "Importados da Amazon Estados Unidos",
    value: "Até 30% OFF",
    valid: "Até 18/11",
    offers: [
      ["Garrafas Owala", "30%", "Prime", "A2UIB2PEI399NE"],
      ["Papelaria importada", "25%", "Prime", "A1IJL5DWZC9NQB"],
      ["Casa, cozinha e relógios", "20%", "Prime · 1 item", "A19JBLISRIKM41"],
      ["Livros importados (2 itens)", "20%", "Prime", "A2NZHD5OU0644E"],
      ["Vinis e CDs", "20%", "Prime", "AUOV3NNFFOST6"],
    ],
  },
];

const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const couponCard = (g) =>
  BLOCK("coupon", {
    store: "amazon", storeName: "", headline: "Cupons liberados", value: g.value,
    title: `Cupons Amazon: ${g.title}`,
    code: "",
    details: `Sem código: o desconto entra no fechamento do pedido. "Só no app" vale apenas no app da Amazon; "Prime" é só para assinantes. Conferidos em ${CHECKED}.`,
    validUntil: g.valid,
    url: ALL,
    buttonLabel: "Ver todos os cupons na Amazon",
    offers: g.offers.map(([label, value, note, id]) => ({ label, value, note, code: "", url: psp(id) })),
  });

fs.writeFileSync(LOG, "");
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

try {
  const found = await payload.find({ collection: "pages", where: { slug: { equals: "cupom-amazon" } }, limit: 1, depth: 0, draft: true });
  const page = found.docs[0];
  if (!page) throw new Error("página cupom-amazon não encontrada");
  if (page._status === "published") log("ATENÇÃO: a página está PUBLICADA — a atualização vai como rascunho (versão nova), não mexe no publicado.");
  const layout = JSON.parse(JSON.stringify(page.layout || []));
  const rt = layout.find((b) => b.blockType === "richText");
  if (!rt) throw new Error("bloco richText não encontrado");
  const kids = rt.content.root.children;
  const isAmazonCoupon = (n) => n?.type === "block" && n.fields?.blockType === "coupon" && n.fields?.store === "amazon";
  const first = kids.findIndex(isAmazonCoupon);
  if (first < 0) throw new Error("nenhum cupom Amazon (modelo) para substituir");
  const removed = kids.filter(isAmazonCoupon).length;
  const rest = kids.filter((n) => !isAmazonCoupon(n));
  const cards = GROUPS.map(couponCard);
  rest.splice(first, 0, ...cards);
  rt.content.root.children = rest;
  await payload.update({ collection: "pages", id: page.id, draft: true, data: { layout } });
  log(`PAGE ${page.id} ok: removidos ${removed} cupons antigos, inseridos ${cards.length} cards (${GROUPS.reduce((n, g) => n + g.offers.length, 0)} cupons). status=${page._status}`);
} catch (e) {
  log(`ERRO: ${e?.stack || e}`);
}
process.exit(0);

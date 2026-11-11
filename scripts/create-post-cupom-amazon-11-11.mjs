// Post "Cupom Amazon hoje 11.11" (10/11/2026) — categoria Cupons (silada, fora da home).
// Cria como RASCUNHO e agenda a publicação pra 11/11/2026 00:01 (job schedulePublish,
// processado pelo cron do PROD). Idempotente: se o slug existe, atualiza o rascunho.
// Rodar no servidor: bash ~/run-seed-cupons.sh create-post-cupom-amazon-11-11.mjs
// (capa vem de /app/banners/11-11-amazon-computador.png; log em /app/out.txt)
import fs from "fs";
import { getPayload } from "payload";
import config from "@payload-config";

const LOG = "/app/out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const SLUG = "cupom-amazon-hoje-11-11";
const PUBLISH_AT = new Date("2026-11-11T00:01:00-03:00");

// ── helpers Lexical ──
const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const B = (text) => T(text, 1);
const P = (...children) => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? T(c) : c)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const LIST = (kind, items) => ({
  type: "list", listType: kind === "ol" ? "number" : "bullet", tag: kind, start: 1, direction: "ltr", format: "", indent: 0, version: 1,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, checked: undefined, direction: "ltr", format: "", indent: 0, version: 1,
    children: (Array.isArray(it) ? it : [it]).map((c) => (typeof c === "string" ? T(c) : c)) })),
});
const RT = (...nodes) => ({ root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 } });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const FAQ = (items) => BLOCK("faq", { title: "Perguntas frequentes", firstOpen: true, items: items.map(([question, answer]) => ({ question, answer: RT(P(answer)) })) });

// ── produtos (links SiteStripe, tag pap0debola-20) ──
const link = (asin, linkId) => `https://www.amazon.com.br/dp/${asin}?&linkCode=ll2&tag=pap0debola-20&linkId=${linkId}&ref_=as_li_ss_tl`;
const img = (id) => `https://m.media-amazon.com/images/I/${id}._AC_SL500_.jpg`;
const PRICES = {"B0H6KT2RWH": ["R$ 418,40", ""], "B0FPGF9J2J": ["R$ 3.719,90", ""], "B0F8R9NDXC": ["R$ 4.184,90", ""], "B0CQKKHT5J": ["R$ 399,00", ""], "B0HGGNZY3Y": ["R$ 305,58", ""], "B0HCRPPXB1": ["R$ 2.279,05", ""], "B0FYRDJ4GJ": ["R$ 1.459,99", ""], "B0DMQKNPR8": ["R$ 1.899,99", ""], "B0DD81K7V7": ["R$ 3.732,55", ""], "B09WR8L93B": ["R$ 1.151,10", ""], "B0G4MTMHF5": ["R$ 399,90", ""], "B0GQWJK3SG": ["R$ 68,30", ""], "B0CDQGYL23": ["R$ 189,90", "R$ 399,99"], "B0GTBYTK7P": ["R$ 239,00", "R$ 279,99"], "B0DHL93XCN": ["R$ 246,92", ""], "B0CVCLGV1W": ["R$ 185,25", ""], "B0FN5DD149": ["R$ 129,00", ""], "B00M3IFUMK": ["R$ 163,29", ""], "B0GQJM9NJK": ["R$ 4.844,05", ""], "B0BCFKG49M": ["R$ 169,99", ""], "B09B8VGCR8": ["R$ 349,00", ""], "B0CFPL6CFY": ["R$ 1.034,10", ""]};
const prod = (asin, linkId, imgId, name, { badge = "", note = "", rating = "", reviews = "", tag = "" } = {}) => ({
  badge, name, imageUrl: img(imgId), note, rating, reviews, tag, price: PRICES[asin]?.[0] || "", oldPrice: PRICES[asin]?.[1] || "", store: "amazon", url: link(asin, linkId),
});
const PRICE_DATE = "11/11/2026, às 00h10";
const GRID = (title, items, columns = "3") => BLOCK("productGrid", { title, columns, items, priceDate: PRICE_DATE });

const GTA = prod("B0H6KT2RWH", "35c97f0b362f6b1153dc8cf57c767777", "81o4MCqBv5L", "Grand Theft Auto VI (GTA 6) para PS5", {
  badge: "Pré-venda", tag: "Lança 19/11", note: "Reserve agora e receba no lançamento. Mídia física para PlayStation 5.",
});
const BUNDLE = prod("B0H6LVH152", "3e1fc6b464f072abcafdda7915318ed8", "71ru-RmxBuL", "Combo PS5 Slim Digital + GTA VI", {
  badge: "Destaque do dia", tag: "Cupom de R$ 250", note: "Console e jogo juntos. Ative o cupom na página do produto antes de fechar o pedido.",
});

const PS5 = [
  prod("B0FPGF9J2J", "9fea55f01b1d966504463278b18c6923", "71WCygaQDAL", "PlayStation 5 Slim Digital + Astro Bot e Gran Turismo 7", { badge: "Mais vendido", rating: "4,8", reviews: "4.267", note: "Versão sem leitor de disco, já com dois jogos inclusos." }),
  prod("B0F8R9NDXC", "e99fccdc5147f49929cda0f9fec01f41", "71IkUBtdDGL", "PlayStation 5 Slim com leitor de disco + Astro Bot e GT7", { badge: "Em oferta", rating: "4,8", reviews: "2.292", note: "Para quem ainda compra jogo em mídia física." }),
  prod("B0CQKKHT5J", "a93e3fc0712681eab5dcb7370cc3c4da", "517nIWAoJFL", "Controle DualSense Midnight Black", { badge: "Segundo controle", rating: "4,8", reviews: "18.425", note: "O original da Sony, para jogar em dupla." }),
  prod("B0HGGNZY3Y", "f72e5226f2bbfaa9bddaf1d5b8a89033", "716TAfDJvhL", "EA Sports FC 27 para PS5", { badge: "Futebol no console", rating: "4,5", reviews: "97", note: "A edição nova do antigo FIFA." }),
];
const TVS = [
  prod("B0HCRPPXB1", "a63f59e31c1643695ae6511cd87b7595", "71JvlwEntGL", 'Smart TV LG 55" 4K NanoCell com IA', { badge: "Mais bem avaliada", rating: "4,9", reviews: "18", note: "Boa para futebol e para o PS5, com webOS e comando de voz." }),
  prod("B0FYRDJ4GJ", "3dd0664e50a590b826d10911683d348e", "616WEfPh9RL", 'Smart TV TCL 55" QLED 4K P8K 144 Hz', { badge: "Para games", rating: "4,6", reviews: "16", note: "Taxa de 144 Hz, ponto forte para jogo rápido." }),
];
const PRINT3D = [
  prod("B0DMQKNPR8", "4ab3f42fb1b9f4d6699d5e90664483a9", "51N8KRKnqwL", "Impressora 3D Bambu Lab A1 Mini", { badge: "Para começar", rating: "4,6", reviews: "290", note: "Compacta e fácil de calibrar." }),
  prod("B0DD81K7V7", "9cd4287c7b03842cfaa9f07c45b9ec21", "61ZvaPKE7WL", "Impressora 3D Bambu Lab A1 + AMS Lite", { badge: "Multicolorida", rating: "4,3", reviews: "579", note: "Imprime em até 4 cores com o AMS Lite." }),
  prod("B09WR8L93B", "34f2db6c107e2b296cc44de59381cce1", "71Z27TaOeuL", "Impressora 3D Creality Ender 3 V3 SE", { badge: "Custo-benefício", rating: "4,6", reviews: "129", note: "Clássica entre quem gosta de mexer e ajustar." }),
];
const FUTEBOL = [
  prod("B0G4MTMHF5", "f17676d9fc958f576fe12a1702625574", "7166fdSCX4L", "Camisa Seleção Brasileira 2026 II (Nike)", { badge: "Seleção", rating: "5,0", reviews: "12", note: "A camisa azul do Brasil." }),
  prod("B0GQWJK3SG", "2b5789b21812d072f0f2c6bf86b70c34", "71orkI2AKGL", "Bola de campo Penalty Player XXV", { badge: "Pelada de fim de semana", rating: "4,7", reviews: "71" }),
  prod("B0CDQGYL23", "769be5515f2866cdffcae44e48f0e74d", "51fhiF324yL", "Chuteira Mizuno Morelia Club", { badge: "Campo", rating: "4,5", reviews: "44" }),
  prod("B0GTBYTK7P", "f6e753a1d360b14afcd1a507591ceb43", "51vNPfGWmeL", "Chuteira Umbro Attak III", { badge: "Mais em conta", rating: "4,7", reviews: "13" }),
];
const HOMENS = [
  prod("B0FN5DD149", "ee15003abf4a890344e1aa0e495b9211", "71oDl7NmgaL", "Aparador Philips Série 3000 9 em 1", { badge: "Barba e cabelo", rating: "4,7", reviews: "1.827", note: "Barba, cabelo, nariz e orelha num aparelho só." }),
  prod("B00M3IFUMK", "d748418248ca4cdb2f87bee0bebc4eee", "51soMCNMKIL", "Perfume Armaf Club de Nuit Intense Man", { badge: "Queridinho", rating: "4,6", reviews: "75.915", note: "Um dos perfumes masculinos mais avaliados da loja." }),
  prod("B0CVCLGV1W", "a7b5b04f862d2ee8e2dc9f448665ff95", "61o3-pf41tL", "Smartwatch Samsung Galaxy Fit3", { badge: "Treino", rating: "4,8", reviews: "13.590", note: "Mede passos, sono e frequência cardíaca." }),
];
const TECH = [
  prod("B0GQJM9NJK", "bd7df373cdc847c29c0c04bc0df9aaff", "61Tuq7vSuRL", "Notebook Gamer Lenovo LOQ com RTX 3050", { badge: "Notebook gamer", rating: "4,5", reviews: "57" }),
  prod("B0BCFKG49M", "45cb1290995d2ecbed955edeb8312cd2", "71WXVepOnFL", "Headset HyperX Cloud Stinger 2 Core", { badge: "Em oferta", rating: "4,6", reviews: "7.963" }),
  prod("B0DHL93XCN", "5478239b74cac5de6f123a386a50b5a8", "61DFgTmj9xL", "Fone sem fio JBL Wave Beam 2", { badge: "Fone bluetooth", rating: "4,6", reviews: "9.955" }),
  prod("B09B8VGCR8", "2b4bf15c468177da7319fb2c8ba1a6a8", "61evEYmxBZL", "Echo Dot 5ª geração com Alexa", { badge: "Casa inteligente", rating: "4,8", reviews: "96.111" }),
  prod("B0CFPL6CFY", "c7a4d25482c471e5a61f54d855f08376", "716JJfaQRzL", "Kindle Paperwhite 16 GB", { badge: "Leitura", rating: "4,8", reviews: "10.637" }),
];

const content = RT(
  P("O 11.11 chegou e a Amazon abriu a temporada de descontos antes da Black Friday. Separamos os produtos que valem a pena olhar hoje, ", B("11 de novembro de 2026"), ", com destaque para a pré-venda de GTA 6, consoles PS5, Smart TVs, impressoras 3D e itens de futebol."),
  P("Os preços dos cards foram conferidos na madrugada do 11.11. Na Amazon o valor muda várias vezes no mesmo dia e o cupom pode acabar antes do fim da tarde, então toque em ", B("Ver na Amazon"), " para ver o preço atualizado e se o cupom ainda está ativo."),
  H("h2", "GTA 6 na Amazon: pré-venda e cupom de hoje"),
  P("O lançamento mais esperado do ano está marcado para ", B("19 de novembro"), ". Na Amazon dá para reservar só o jogo ou levar o combo com o PS5 Slim Digital, que hoje aparece com ", B("cupom de R$ 250"), " na página do produto."),
  GRID("GTA 6 em destaque", [GTA, BUNDLE], "2"),
  BLOCK("coupon", {
    store: "amazon", storeName: "", title: "R$ 250 de desconto no combo PS5 Slim Digital + GTA VI",
    code: "", details: "Cupom aplicado pela própria página do produto: marque a caixa do cupom antes de colocar no carrinho. Válido enquanto a Amazon mantiver a oferta.",
    validUntil: "11/11/2026 ou enquanto durar", url: BUNDLE.url, buttonLabel: "Ativar cupom na Amazon",
  }),
  H("h2", "PlayStation 5 e jogos em oferta"),
  P("Quem vai jogar GTA 6 e ainda não tem o console encontra as duas versões do PS5 Slim com Astro Bot e Gran Turismo 7 inclusos. Para o futebol virtual, o EA Sports FC 27 também entrou na lista."),
  GRID("PS5, controle e jogos", PS5, "2"),
  H("h2", "Smart TVs para ver futebol e jogar"),
  P("Duas TVs de 55 polegadas com boa nota de quem já comprou. A TCL tem 144 Hz, o que ajuda muito no videogame; a LG é a mais bem avaliada da seleção."),
  GRID("TVs 4K", TVS, "2"),
  H("h2", "Impressora 3D com desconto"),
  P("Impressora 3D virou presente popular. A Bambu Lab A1 Mini é a mais simples para quem nunca imprimiu nada; a A1 com AMS Lite imprime em várias cores; a Ender 3 V3 SE agrada quem gosta de ajustar a máquina."),
  GRID("Impressoras 3D", PRINT3D),
  H("h2", "Ofertas de futebol: camisa, bola e chuteira"),
  GRID("Para quem joga e torce", FUTEBOL, "2"),
  H("h2", "Presentes para homens"),
  P("Aparador, perfume e smartwatch: três itens que costumam aparecer com desconto no 11.11 e resolvem presente de fim de ano."),
  GRID("Cuidados e acessórios", HOMENS),
  H("h2", "Tecnologia: notebook, fone, Alexa e Kindle"),
  GRID("Tecnologia em oferta", TECH),
  H("h2", "Como usar cupom na Amazon hoje"),
  LIST("ol", [
    "Entre na sua conta da Amazon pelo app ou pelo site.",
    "Abra o produto pelo botão da oferta e procure o selo de cupom logo abaixo do preço.",
    [T("Marque a caixa "), B("Aplicar cupom"), T(" antes de adicionar ao carrinho. O desconto aparece só no fechamento do pedido.")],
    "Confira o total antes de pagar. Alguns cupons valem só para vendidos e entregues pela Amazon.",
  ]),
  P("Mais ofertas do dia na página da Black Friday da Amazon:"),
  BLOCK("ctaButton", { label: "Ver todas as ofertas da Amazon", url: "https://www.amazon.com.br/blackfriday?tag=pap0debola-20", style: "primary" }),
  FAQ([
    ["Qual o cupom Amazon de hoje, 11/11?", "O destaque de hoje é o cupom de R$ 250 no combo PS5 Slim Digital + GTA VI, ativado direto na página do produto. Outros produtos da lista também podem ter cupom ou desconto; o valor atualizado aparece na Amazon."],
    ["Quando lança o GTA 6?", "O lançamento de Grand Theft Auto VI está marcado para 19 de novembro de 2026. Quem reserva na pré-venda recebe o jogo a partir da data de lançamento."],
    ["O 11.11 da Amazon vale o dia todo?", "As ofertas do 11.11 valem durante o dia 11 de novembro, mas cupons e estoques podem acabar antes. Depois dele começa o período de Black Friday, que vai até o fim do mês."],
    ["O cupom da Amazon junta com outro desconto?", "Em geral o cupom do produto soma com o preço promocional já exibido. Não dá para usar dois cupons no mesmo produto."],
  ]),
);

const payload = await getPayload({ config });
log(`== ${new Date().toISOString()} create-post-cupom-amazon-11-11`);

// capa: arte do banner 11.11 Amazon (computador)
let coverId;
const prevMedia = await payload.find({ collection: "media", where: { alt: { equals: "Cupom Amazon hoje 11.11 - ofertas do Papo de Bola" } }, limit: 1 });
if (prevMedia.docs[0]) coverId = prevMedia.docs[0].id;
else {
  const m = await payload.create({ collection: "media", filePath: "/app/banners/11-11-amazon-computador.png", data: { alt: "Cupom Amazon hoje 11.11 - ofertas do Papo de Bola" } });
  coverId = m.id;
}
log(`cover=${coverId}`);

const authors = await payload.find({ collection: "authors", limit: 1, where: { slug: { equals: "redacao" } } }).catch(() => ({ docs: [] }));
const data = {
  title: "Cupom Amazon hoje 11/11: ofertas do 11.11 com GTA 6, PS5, TVs e mais",
  slug: SLUG,
  category: "Cupons",
  tags: ["Cupom Amazon", "11.11", "Cupons de hoje", "GTA 6", "PS5", "Black Friday"].map((tag) => ({ tag })),
  cover: coverId,
  excerpt: "Cupons de hoje 11.11 na Amazon: pré-venda de GTA 6, combo PS5 com cupom de R$ 250, Smart TVs, impressoras 3D, futebol e tecnologia.",
  content,
  author: "Redação",
  ...(authors.docs[0] ? { authorProfile: authors.docs[0].id } : {}),
  publishedDate: PUBLISH_AT.toISOString(),
  seo: {
    metaTitle: "Cupom Amazon hoje 11/11: cupons de hoje no 11.11 | Papo de Bola",
    metaDescription: "Cupom Amazon de hoje (11/11): GTA 6 em pré-venda, PS5 com cupom de R$ 250, Smart TV, impressora 3D, camisa da Seleção e mais ofertas do 11.11.",
  },
  _status: "draft",
};

const existing = await payload.find({ collection: "posts", where: { slug: { equals: SLUG } }, limit: 1, draft: true });
// Já publicado (pelo agendamento): atualiza mantendo publicado e não agenda de novo.
const KEEP_PUBLISHED = existing.docs[0]?._status === "published";
if (KEEP_PUBLISHED) data._status = "published";
let id;
if (existing.docs[0]) {
  id = existing.docs[0].id;
  await payload.update({ collection: "posts", id, data, draft: !KEEP_PUBLISHED });
  log(`updated draft id=${id}`);
} else {
  const doc = await payload.create({ collection: "posts", data, draft: true });
  id = doc.id;
  log(`created draft id=${id}`);
}

if (KEEP_PUBLISHED) { log("done (update publicado)"); process.exit(0); }
// agenda publicação (evita duplicar job)
const jobs = await payload.find({ collection: "payload-jobs", where: { taskSlug: { equals: "schedulePublish" }, completedAt: { exists: false } }, limit: 50 });
const dup = jobs.docs.find((j) => j?.input?.doc?.value == id && j?.input?.type === "publish");
if (dup) log(`job ja existe id=${dup.id} waitUntil=${dup.waitUntil}`);
else {
  const job = await payload.jobs.queue({ task: "schedulePublish", input: { type: "publish", doc: { relationTo: "posts", value: id } }, waitUntil: PUBLISH_AT, queue: "default" });
  log(`job queued id=${job.id} waitUntil=${PUBLISH_AT.toISOString()}`);
}
log("done");

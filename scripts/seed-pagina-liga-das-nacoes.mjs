// Cria/atualiza a Página do CMS "Liga das Nações" (slug liga-das-nacoes) — conteúdo editável do
// hub /futebol/futebol-internacional/liga-das-nacoes (H1, subtítulo, SEO e o texto "Como funciona").
// Uso no servidor: bash ~/run-seed-cupons.sh seed-pagina-liga-das-nacoes.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

const txt = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const p = (...kids) => ({ type: "paragraph", children: kids.map((k) => (typeof k === "string" ? txt(k) : k)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const h = (tag, text) => ({ type: "heading", tag, children: [txt(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const li = (text, i) => ({ type: "listitem", value: i + 1, children: [txt(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const ul = (items) => ({ type: "list", listType: "bullet", tag: "ul", start: 1, children: items.map(li), direction: "ltr", format: "", indent: 0, version: 1 });
const root = (children) => ({ root: { type: "root", children, direction: "ltr", format: "", indent: 0, version: 1 } });

const content = root([
  h("h2", "Como funciona a Liga das Nações"),
  p("A Liga das Nações da UEFA reúne as seleções europeias em quatro divisões — Ligas A, B, C e D — montadas pelo ranking. Cada liga é dividida em grupos, e as seleções se enfrentam em jogos de ida e volta nas datas FIFA de setembro, outubro e novembro."),
  ul([
    "Liga A: a elite, com seleções como Espanha, França, Inglaterra, Portugal, Itália e Alemanha. Os melhores dos grupos seguem para o mata-mata que decide o campeão.",
    "Acesso e descenso: os líderes dos grupos das Ligas B, C e D sobem de divisão e os últimos colocados das Ligas A, B e C caem para a edição seguinte.",
    "A tabela acima é atualizada ao vivo: clique em qualquer jogo para ver escalações, estatísticas e o lance a lance.",
  ]),
  p("O torneio também tem peso nas eliminatórias europeias, por isso as seleções costumam ir a campo com força máxima mesmo fora das grandes competições."),
]);

const data = {
  title: "Liga das Nações",
  slug: "liga-das-nacoes",
  hero: {
    h1: "Liga das Nações 2026/27",
    subtitle: "Classificação dos grupos, jogos da rodada e placar ao vivo das seleções europeias na Liga das Nações da UEFA.",
  },
  seo: {
    metaTitle: "Liga das Nações 2026/27: tabela, classificação e jogos ao vivo | Papo de Bola",
    metaDescription: "Liga das Nações da UEFA 2026/27: classificação dos grupos das Ligas A, B, C e D, jogos de hoje, rodadas, resultados e lance a lance ao vivo.",
  },
  layout: [{ blockType: "richText", content }],
  _status: "published",
};

const found = (await payload.find({ collection: "pages", where: { slug: { equals: "liga-das-nacoes" } }, limit: 1, depth: 0, draft: true })).docs[0];
const doc = found
  ? await payload.update({ collection: "pages", id: found.id, data })
  : await payload.create({ collection: "pages", data });
log(`ok id=${doc.id} status=${doc._status} slug=${doc.slug}`);
process.exit(0);

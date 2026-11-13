// Cria/atualiza a Página do CMS "Onde assistir" (slug onde-assistir) — textos editáveis do hub
// /onde-assistir (H1, subtítulo, SEO e o texto de introdução). Fica em RASCUNHO: o hub usa os
// textos padrão do código até alguém publicar no /cms (getPayloadPage só lê publicada).
// Uso no servidor: bash ~/run-seed-cupons.sh seed-pagina-onde-assistir.mjs
import fs from "fs";
const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

const txt = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const p = (...kids) => ({ type: "paragraph", children: kids.map((k) => (typeof k === "string" ? txt(k) : k)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const root = (children) => ({ root: { type: "root", children, direction: "ltr", format: "", indent: 0, version: 1 } });

const content = root([
  p("Aqui você encontra os jogos de futebol de hoje e de amanhã com horário de Brasília e o canal de cada transmissão, na TV aberta, na TV fechada ou no streaming. Os jogos com guia completo têm a ficha da partida, as escalações prováveis, a situação na tabela e o link para o lance a lance ao vivo."),
  p("A grade das emissoras pode mudar até a hora do jogo. Quando a transmissão ainda não foi confirmada, o guia avisa."),
]);

const data = {
  title: "Onde assistir",
  slug: "onde-assistir",
  hero: {
    h1: "Onde assistir futebol hoje",
    subtitle: "Jogos de hoje com horário de Brasília e canal de transmissão, mais os guias de cada partida com escalações prováveis, arbitragem e local.",
  },
  seo: {
    metaTitle: "Onde assistir futebol hoje: jogos, horários e canais | Papo de Bola",
    metaDescription: "Saiba onde assistir aos jogos de futebol de hoje: horários, canais de TV e streaming, prováveis escalações e o lance a lance ao vivo no Papo de Bola.",
  },
  layout: [{ blockType: "richText", content }],
  _status: "draft",
};

const found = (await payload.find({ collection: "pages", where: { slug: { equals: "onde-assistir" } }, limit: 1, depth: 0, draft: true })).docs[0];
if (found?._status === "published") { log(`já publicada (id=${found.id}), não mexi`); process.exit(0); }
const doc = found
  ? await payload.update({ collection: "pages", id: found.id, data, draft: true })
  : await payload.create({ collection: "pages", data, draft: true });
log(`ok id=${doc.id} status=${doc._status} slug=${doc.slug}`);
process.exit(0);

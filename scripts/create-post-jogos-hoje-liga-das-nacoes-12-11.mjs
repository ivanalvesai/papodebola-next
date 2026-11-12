// Post "Jogos de hoje da Liga das Nações (12/11/2026)" — 5ª rodada.
// Dados: AllSportsApi (tournament 10783 / season 89945): horários, estádios, arbitragem e
// classificação após a 4ª rodada. Transmissão: Olhar Digital / O Hoje / Gazeta Web de 12/11.
// Foto: San Siro — Zakarie Faibis, CC BY-SA 4.0 (Wikimedia Commons).
// Cria/atualiza como RASCUNHO (publicar só com ok do Ivan).
//   scp capa + foto -> ~/cupons-banners/ ; bash ~/run-seed-cupons.sh create-post-jogos-hoje-liga-das-nacoes-12-11.mjs
import fs from "fs";
import crypto from "crypto";

const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const SLUG = "jogos-de-hoje-liga-das-nacoes-12-de-novembro";
const HUB = "/futebol/futebol-internacional/liga-das-nacoes";
const J = (pair) => `${HUB}/jogo/12-11-2026/${pair}`;

const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
const B = (text) => T(text, 1);
const LK = (text, url, newTab = false) => ({ type: "link", version: 3, fields: { linkType: "custom", url, newTab }, children: [T(text)], direction: "ltr", format: "", indent: 0 });
const P = (...children) => ({ type: "paragraph", children: children.map((c) => (typeof c === "string" ? T(c) : c)), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
const LIST = (items) => ({
  type: "list", listType: "bullet", tag: "ul", start: 1, direction: "ltr", format: "", indent: 0, version: 1,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, direction: "ltr", format: "", indent: 0, version: 1,
    children: (Array.isArray(it) ? it : [it]).map((c) => (typeof c === "string" ? T(c) : c)) })),
});
const CELL = (content, header) => ({
  type: "tablecell", format: "", indent: 0, colSpan: 1, rowSpan: 1, version: 1, direction: null, headerState: header ? 1 : 0, backgroundColor: null,
  children: [{ type: "paragraph", format: "", indent: 0, version: 1, direction: null, textStyle: "", textFormat: 0,
    children: (Array.isArray(content) ? content : [content]).map((c) => (typeof c === "string" ? T(c) : c)) }],
});
const ROW = (cells, header = false) => ({ type: "tablerow", format: "", indent: 0, version: 1, direction: null, children: cells.map((c) => CELL(c, header)) });
const TABLE = (head, rows) => ({ type: "table", format: "", indent: 0, version: 1, direction: null, children: [ROW(head, true), ...rows.map((r) => ROW(r))] });
const IMG = (mediaId, caption) => ({ id: crypto.randomBytes(12).toString("hex"), type: "upload", value: mediaId, fields: { caption, alignment: "center" }, format: "", version: 3, relationTo: "media" });
const RT = (...nodes) => ({ root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 } });
const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { blockType, ...fields } });
const FAQ = (items) => BLOCK("faq", { title: "Perguntas frequentes", firstOpen: true, items: items.map(([question, answer]) => ({ question, answer: RT(P(answer)) })) });

const TAB_HEAD = ["Pos.", "Seleção", "Pts", "J", "V", "E", "D", "Gols"];

function buildContent(fotoSanSiro) {
  return RT(
    P("A data FIFA de novembro coloca a ", B("5ª rodada da Liga das Nações"), " em campo nesta quinta-feira (12/11), com quatro jogos da Liga A, a elite da competição: ", B("Turquia x Bélgica"), " às 14h e, às 16h45 (de Brasília), ", B("Itália x França"), ", ", B("Tchéquia x Espanha"), " e ", B("Inglaterra x Croácia"), ". O dia tem ainda quatro jogos da Liga C."),
    P("O destaque é o confronto direto em Milão: a França lidera o Grupo 1 com 10 pontos e a Itália vem logo atrás, com 7. No Grupo 3, a Espanha chega com 100% de aproveitamento (12 pontos) e a Inglaterra, segunda colocada, recebe a Croácia em Wembley."),

    H("h2", "Jogos de hoje da Liga das Nações (12/11)"),
    TABLE(["Horário", "Jogo", "Grupo", "Estádio", "Onde assistir"], [
      ["14h", [LK("Turquia x Bélgica", J("turquia-belgica"))], "Liga A · Grupo 1", "Gürsel Aksel, em Izmir", "SporTV"],
      ["16h45", [LK("Itália x França", J("italia-franca"))], "Liga A · Grupo 1", "San Siro, em Milão", "ESPN e Disney+"],
      ["16h45", [LK("Tchéquia x Espanha", J("tchequia-espanha"))], "Liga A · Grupo 3", "Letná, em Praga", "SporTV"],
      ["16h45", [LK("Inglaterra x Croácia", J("inglaterra-croacia"))], "Liga A · Grupo 3", "Wembley, em Londres", "ESPN 4 e Disney+"],
      ["14h", [LK("Armênia x Chipre", J("armenia-chipre"))], "Liga C · Grupo 2", "Vazgen Sargsyan, em Yerevan", "—"],
      ["16h45", [LK("Albânia x Finlândia", J("albania-finlandia"))], "Liga C · Grupo 1", "Air Albania, em Tirana", "—"],
      ["16h45", [LK("San Marino x Belarus", J("san-marino-belarus"))], "Liga C · Grupo 1", "San Marino Stadium, em Serravalle", "—"],
      ["16h45", [LK("Montenegro x Letônia", J("montenegro-letonia"))], "Liga C · Grupo 2", "Gradski, em Podgorica", "—"],
    ]),
    P("A grade de transmissão pode mudar até a hora do jogo; confira no app da emissora. Clique em cada partida para acompanhar o placar ao vivo, as escalações e o lance a lance."),

    H("h2", "Itália x França: o jogo do dia"),
    LIST([
      [B("Horário: "), "16h45 (de Brasília)"],
      [B("Local: "), "Estádio Giuseppe Meazza, o San Siro, em Milão"],
      [B("Onde assistir: "), "ESPN (TV fechada) e Disney+ (streaming)"],
      [B("Arbitragem: "), "István Kovács (Romênia)"],
    ]),
    P("A França chega invicta, com três vitórias e um empate, e pode abrir vantagem na liderança do Grupo 1 com uma vitória em Milão. A Itália precisa vencer para assumir a ponta. Kylian Mbappé é a principal dúvida francesa por problemas físicos."),
    IMG(fotoSanSiro, "San Siro, em Milão, recebe Itália x França pela Liga das Nações. Foto: Zakarie Faibis / Wikimedia Commons (CC BY-SA 4.0)"),

    H("h3", "Classificação do Grupo 1 da Liga A"),
    TABLE(TAB_HEAD, [
      ["1º", "França", "10", "4", "3", "1", "0", "7-2"],
      ["2º", "Itália", "7", "4", "2", "1", "1", "8-5"],
      ["3º", "Bélgica", "6", "4", "2", "0", "2", "6-5"],
      ["4º", "Turquia", "0", "4", "0", "0", "4", "2-11"],
    ]),
    P("Mais cedo, às 14h, a Bélgica visita a lanterna Turquia, em Izmir (árbitro: Sandro Schärer, da Suíça). Com 6 pontos, os belgas ainda sonham com a segunda vaga do grupo."),

    H("h2", "Grupo 3: Espanha e Inglaterra em campo"),
    P("A Espanha, líder com 12 pontos, visita a Tchéquia, que ainda não pontuou, no estádio do Sparta Praga (árbitro: Nikola Dabanović, de Montenegro). Em Wembley, a Inglaterra (9 pontos) encara a Croácia (3), com arbitragem do dinamarquês Morten Krogh."),
    TABLE(TAB_HEAD, [
      ["1º", "Espanha", "12", "4", "4", "0", "0", "12-5"],
      ["2º", "Inglaterra", "9", "4", "3", "0", "1", "14-3"],
      ["3º", "Croácia", "3", "4", "1", "0", "3", "4-14"],
      ["4º", "Tchéquia", "0", "4", "0", "0", "4", "2-10"],
    ]),

    H("h2", "Liga C: a briga pelo acesso"),
    LIST([
      [B("Grupo 1: "), "Albânia (9 pontos) recebe a Finlândia (7) em Tirana; Belarus (7) visita o lanterna San Marino."],
      [B("Grupo 2: "), "Montenegro (10) lidera e recebe a Letônia (1); Chipre (7) visita a Armênia (4) em Yerevan."],
    ]),
    P("Os líderes dos grupos das Ligas B, C e D sobem de divisão para a próxima edição da Liga das Nações. A 6ª e última rodada da fase de liga vai de 15 a 17 de novembro."),
    P("Veja a classificação de todos os grupos, as rodadas e os jogos ao vivo na ", LK("página da Liga das Nações", HUB), "."),

    FAQ([
      ["Quais são os jogos da Liga das Nações hoje, 12/11?", "Pela Liga A: Turquia x Bélgica às 14h, e Itália x França, Tchéquia x Espanha e Inglaterra x Croácia às 16h45 (de Brasília). Pela Liga C: Armênia x Chipre às 14h, e Albânia x Finlândia, San Marino x Belarus e Montenegro x Letônia às 16h45."],
      ["Onde assistir Itália x França?", "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h45 (de Brasília)."],
      ["Onde assistir Inglaterra x Croácia?", "O jogo em Wembley passa na ESPN 4 e no Disney+, às 16h45 (de Brasília)."],
      ["Quem lidera os grupos da Liga A?", "Antes da 5ª rodada: França no Grupo 1 (10 pontos), Holanda no Grupo 2 (8, empatada com a Grécia), Espanha no Grupo 3 (12) e Portugal no Grupo 4 (12)."],
      ["Quando termina a fase de liga?", "A 6ª e última rodada da fase de liga é disputada entre 15 e 17 de novembro de 2026."],
    ]),

    P("Fontes: dados das partidas e classificação via AllSportsApi; transmissão segundo ", LK("Olhar Digital", "https://olhardigital.com.br/2026/11/12/internet-e-redes-sociais/italia-x-franca-onde-assistir-horario-e-escalacoes-do-jogo-da-liga-das-nacoes", true), ", ", LK("O Hoje", "https://ohoje.com/2026/11/12/data-fifa-tem-italia-x-franca-e-inglaterra-x-croacia-nesta-quinta-feira-confira-os-jogos-horarios-e-onde-assistir/", true), " e ", LK("Gazeta Web", "https://www.gazetaweb.com/noticias/esportes/internacional/inglaterra-x-croacia-horario-e-onde-assistir-ao-vivo-948599", true), "."),
  );
}

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const payload = await getPayload({ config });

async function media(file, alt) {
  const prev = await payload.find({ collection: "media", where: { alt: { equals: alt } }, limit: 1 });
  if (prev.docs[0]) return prev.docs[0].id;
  return (await payload.create({ collection: "media", filePath: `/app/banners/${file}`, data: { alt } })).id;
}

try {
  const coverId = await media("capa-liga-das-nacoes-12-11.png", "Jogos de hoje da Liga das Nações em 12/11: Turquia x Bélgica, Itália x França, Tchéquia x Espanha e Inglaterra x Croácia");
  const fotoSanSiro = await media("foto-san-siro.jpg", "Estádio San Siro, em Milão, palco de Itália x França pela Liga das Nações");
  log(`cover=${coverId} fotoSanSiro=${fotoSanSiro}`);
  const authors = await payload.find({ collection: "authors", limit: 1, where: { slug: { equals: "redacao" } } }).catch(() => ({ docs: [] }));
  const data = {
    title: "Jogos de hoje da Liga das Nações (12/11): Itália x França, Inglaterra x Croácia e mais; horários e onde assistir",
    slug: SLUG,
    category: "Futebol Internacional",
    tags: ["Liga das Nações", "Nations League", "Jogos de hoje", "Itália", "França", "Espanha", "Inglaterra", "Croácia"].map((tag) => ({ tag })),
    cover: coverId,
    excerpt: "Liga das Nações hoje (12/11): Turquia x Bélgica às 14h; Itália x França, Tchéquia x Espanha e Inglaterra x Croácia às 16h45. Onde assistir, estádios, arbitragem e classificação.",
    content: buildContent(fotoSanSiro),
    author: "Redação",
    ...(authors.docs[0] ? { authorProfile: authors.docs[0].id } : {}),
    publishedDate: new Date().toISOString(),
    seo: {
      metaTitle: "Jogos de hoje da Liga das Nações (12/11): horários e onde assistir",
      metaDescription: "Liga das Nações hoje: Itália x França (ESPN e Disney+), Inglaterra x Croácia, Tchéquia x Espanha e Turquia x Bélgica. Horários, estádios e classificação.",
    },
    _status: "draft",
  };
  const existing = await payload.find({ collection: "posts", where: { slug: { equals: SLUG } }, limit: 1, draft: true });
  const KEEP_PUBLISHED = existing.docs[0]?._status === "published";
  if (KEEP_PUBLISHED) data._status = "published";
  if (existing.docs[0]) {
    await payload.update({ collection: "posts", id: existing.docs[0].id, data, draft: !KEEP_PUBLISHED });
    log(`POST ${existing.docs[0].id} atualizado (${KEEP_PUBLISHED ? "publicado" : "rascunho"})`);
  } else {
    const doc = await payload.create({ collection: "posts", data, draft: true });
    log(`POST ${doc.id} criado (rascunho)`);
  }
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

// Post "Jogos de hoje da Série B (12/11/2026)" — 38ª rodada, 2 jogos antecipados pela CBF.
// Dados:
//  - CBF jogos/campeonato/1260612 (data, hora, estádio);
//  - /api/championship/brasileirao-serie-b (classificação após a 37ª rodada, últimos jogos,
//    campanha em casa/fora, jogos do 1º turno; Londrina 2x1 Náutico em 11/11);
//  - sites oficiais: operarioferroviario.com.br (saída do Índio, 11/11) e pontepreta.com.br
//    (reforma do gramado do Majestoso, 30/10) — fotos com crédito;
//  - imprensa de 11/11: Diário dos Campos (escalações Ponte x Operário, arbitragem, recorde do
//    Duque de Caxias) e DGABC (escalações SB x Athletic, desfalques, saída do Bergantin);
//  - transmissão: Portal da TV / Oficina da Net de 12/11.
// Cria/atualiza como RASCUNHO (publicar só com ok do Ivan).
//   scp capa + fotos -> ~/cupons-banners/ ; bash ~/run-seed-cupons.sh create-post-jogos-hoje-serie-b-12-11.mjs
import fs from "fs";
import crypto from "crypto";

const LOG = "/app/out.txt"; fs.writeFileSync(LOG, "");
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

const SLUG = "jogos-de-hoje-serie-b-12-de-novembro";
const CAMP = "/futebol/brasileirao-serie-b";
const JOGO1 = `${CAMP}/jogo/12-11-2026/ponte-preta-operario-pr`;
const JOGO2 = `${CAMP}/jogo/12-11-2026/sao-bernardo-athletic-club`;

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

const TAB_HEAD = ["Pos.", "Time", "Pts", "J", "V", "E", "D", "Gols", "SG"];

function buildContent(fotoPonte, fotoOperario) {
  return RT(
    P("A 38ª e última rodada da Série B 2026 tem ", B("dois jogos nesta quinta-feira (12/11)"), ": ", B("Ponte Preta x Operário-PR"), ", às 19h, e ", B("São Bernardo x Athletic"), ", às 20h (horário de Brasília). A CBF antecipou as duas partidas porque elas não mexem mais na briga pelo acesso nem na luta contra o rebaixamento. Os outros sete jogos da rodada, que decidem a temporada, ficam para sábado (14/11), todos às 16h30."),
    P("Mesmo sem nada em jogo na tabela, a noite tem história: a Ponte Preta tenta fugir da pior pontuação da Série B na era dos pontos corridos, o volante Índio pode fazer o último jogo pelo Operário e o técnico Vinícius Bergantin se despede do São Bernardo. A rodada começou na quarta-feira (11/11), com a vitória do Londrina sobre o Náutico por 2 a 1, em Londrina."),

    H("h2", "Jogos de hoje da Série B (12/11)"),
    TABLE(["Horário", "Jogo", "Estádio", "Onde assistir"], [
      ["19h", [LK("Ponte Preta x Operário-PR", JOGO1)], "Ítalo Limongi, em Indaiatuba (SP)", "Disney+"],
      ["20h", [LK("São Bernardo x Athletic", JOGO2)], "1º de Maio, em São Bernardo do Campo (SP)", "Premiere e GE TV (YouTube)"],
    ]),
    P("A transmissão pode mudar até a hora do jogo. Confira no app da emissora antes de a bola rolar."),

    // ===== Jogo 1 =====
    H("h2", "Ponte Preta x Operário-PR: horário, onde assistir e escalações"),
    LIST([
      [B("Horário: "), "19h (de Brasília)"],
      [B("Local: "), "Estádio Ítalo Mário Limongi, em Indaiatuba (SP)"],
      [B("Onde assistir: "), "Disney+"],
      [B("Arbitragem: "), "Deborah Cecília Correia (PE), com Karla Renata Santana (PE) e Fernanda Silva (AL) nas bandeiras; Thayslane Melo (SE) no VAR"],
    ]),
    P("A Ponte Preta já está rebaixada para a Série C e é a lanterna, com 15 pontos. Mesmo assim, o jogo vale uma marca: a pior pontuação da Série B na era dos pontos corridos é do Duque de Caxias, que terminou 2011 com 17 pontos. Só a vitória (18 pontos) tira a Ponte desse recorde negativo; empate ou derrota deixam o time de Campinas com a pior campanha da história da competição."),
    P("A despedida será fora de Campinas. O gramado do Moisés Lucarelli, o Majestoso, passa por uma reforma emergencial, que segundo o clube entrou na reta final no fim de outubro."),
    IMG(fotoPonte, "Reforma do gramado do Moisés Lucarelli, o Majestoso: por isso a Ponte Preta joga em Indaiatuba. Foto: Marcos Ribolli/PontePress (site oficial da Ponte Preta)"),
    P("O Operário é o 10º colocado, com 54 pontos. Não alcança mais o 6º lugar (58 pontos) nem corre risco de queda, mas vem de vitória: 3 a 2 sobre o Sport, em Ponta Grossa."),

    H("h3", "Como os times chegam"),
    TABLE(TAB_HEAD, [
      ["10º", "Operário-PR", "54", "37", "15", "9", "13", "49-50", "-1"],
      ["20º", "Ponte Preta", "15", "37", "3", "6", "28", "21-79", "-58"],
    ]),
    LIST([
      [B("Ponte Preta em casa: "), "2 vitórias, 6 empates e 10 derrotas (12 de 54 pontos possíveis). Não vence há 8 jogos; a última vitória foi 1 a 0 no CRB, em 20 de setembro. Tem a pior defesa da Série B, com 79 gols sofridos."],
      [B("Operário fora de casa: "), "6 vitórias, 4 empates e 8 derrotas (22 pontos)."],
      [B("No primeiro turno: "), "Operário 3 x 2 Ponte Preta, em 22 de julho, pela 19ª rodada."],
    ]),

    H("h3", "Últimos 5 jogos"),
    TABLE(["Rodada", "Ponte Preta", "Operário-PR"], [
      ["33ª", "Novorizontino 5 x 1 Ponte (D)", "Operário 0 x 2 Goiás (D)"],
      ["34ª", "Ponte 1 x 1 Atlético-GO (E)", "América-MG 1 x 0 Operário (D)"],
      ["35ª", "Ponte 2 x 2 Fortaleza (E)", "Operário 1 x 0 Athletic (V)"],
      ["36ª", "Criciúma 2 x 0 Ponte (D)", "Novorizontino 2 x 1 Operário (D)"],
      ["37ª", "Goiás 1 x 0 Ponte (D)", "Operário 3 x 2 Sport (V)"],
    ]),
    P("Nos últimos cinco jogos, a Ponte somou 2 pontos (2 empates e 3 derrotas) e o Operário, 6 (2 vitórias e 3 derrotas)."),

    H("h3", "Prováveis escalações"),
    P(B("Ponte Preta: "), "Vinicius Ferrari; Di Mauro, Sérgio Palacios, Gabriel Caran e Danilo Barcelos (Gustavo Almeida); Rodrigo Souza, Gustavo Telles e Karl; Manu, Danilo Peu e Brandão. ", B("Técnico: "), "Nenê Santana (auxiliar)."),
    P(B("Operário-PR: "), "Elias; Maguinho (João Gabriel), Cuenú, Joseph (Renan Gustavo) e Nicolas; Índio, André e Dudu Mosconi; Brenno, Caio Dantas e Léo Erig. ", B("Técnico: "), "Alberto Valentim."),

    H("h3", "Notícias do Operário: a despedida do Índio"),
    P("Na quarta-feira (11/11), o Operário anunciou no site oficial que não vai renovar o contrato do volante Índio. Ele deixa o clube como o jogador com mais partidas pelo Fantasma desde a profissionalização do futebol, com 249 jogos, e esteve nos títulos da Série D (2017), da Série C (2018) e dos Paranaenses de 2025 e 2026. Escalado entre os prováveis titulares, pode fazer em Indaiatuba o último jogo com a camisa alvinegra."),
    IMG(fotoOperario, "Índio deixa o Operário com 249 jogos, recorde desde a profissionalização do clube. Foto: André Jonsson/OFEC (site oficial do Operário Ferroviário)"),
    P("Fora do time principal, a base também tem semana grande: o Operário chegou à semifinal da Copa do Brasil Sub-20 pela primeira vez."),
    P("Acompanhe o lance a lance na ", LK("página do jogo Ponte Preta x Operário-PR", JOGO1), "."),

    // ===== Jogo 2 =====
    H("h2", "São Bernardo x Athletic: horário, onde assistir e escalações"),
    LIST([
      [B("Horário: "), "20h (de Brasília)"],
      [B("Local: "), "Estádio 1º de Maio, em São Bernardo do Campo (SP)"],
      [B("Onde assistir: "), "Premiere e GE TV, no YouTube"],
      [B("Arbitragem: "), "Paulo Belence Alves dos Prazeres (PE)"],
    ]),
    P("O São Bernardo fecha sua primeira Série B, depois do acesso conquistado na Série C de 2025. O Tigre do ABC chegou a liderar a competição nas primeiras rodadas, mas caiu de rendimento, trocou Ricardo Catalá por Vinícius Bergantin em agosto e termina no meio da tabela, em 11º, com 52 pontos. O jogo marca a despedida de Bergantin, que encaminhou a ida para a Chapecoense; a diretoria já procura o substituto para 2027."),
    P("O Athletic, de São João del-Rei (MG), é o 14º, com 47 pontos, e também garantiu a permanência: o Avaí, primeiro time da zona de rebaixamento, chega no máximo a 43. O time do técnico Alex de Souza, ídolo do Cruzeiro como jogador, vem de derrota por 3 a 2 para o Atlético-GO."),

    H("h3", "Como os times chegam"),
    TABLE(TAB_HEAD, [
      ["11º", "São Bernardo", "52", "37", "14", "10", "13", "52-42", "+10"],
      ["14º", "Athletic", "47", "37", "11", "14", "12", "44-44", "0"],
    ]),
    LIST([
      [B("São Bernardo em casa: "), "5 vitórias, 6 empates e 7 derrotas (21 pontos)."],
      [B("Athletic fora de casa: "), "4 vitórias, 8 empates e 6 derrotas (20 pontos)."],
      [B("No primeiro turno: "), "Athletic 2 x 1 São Bernardo, em 23 de julho, pela 19ª rodada."],
    ]),

    H("h3", "Últimos 5 jogos"),
    TABLE(["Rodada", "São Bernardo", "Athletic"], [
      ["33ª", "Juventude 2 x 2 São Bernardo (E)", "Athletic 2 x 2 Londrina (E)"],
      ["34ª", "São Bernardo 0 x 1 Criciúma (D)", "Avaí 0 x 0 Athletic (E)"],
      ["35ª", "São Bernardo 3 x 2 Vila Nova (V)", "Operário 1 x 0 Athletic (D)"],
      ["36ª", "Cuiabá 1 x 2 São Bernardo (V)", "Athletic 2 x 1 Ceará (V)"],
      ["37ª", "Avaí 2 x 1 São Bernardo (D)", "Athletic 2 x 3 Atlético-GO (D)"],
    ]),
    P("Nos últimos cinco jogos, o São Bernardo somou 7 pontos (2 vitórias, 1 empate e 2 derrotas) e o Athletic, 5 (1 vitória, 2 empates e 2 derrotas)."),

    H("h3", "Desfalques"),
    LIST([
      [B("São Bernardo: "), "o volante Marcão está suspenso. Rodrigo Andrade e Matheus Salustiano se recuperam de cirurgia, Rodrigo Ferreira trata um trauma no joelho e Hélder está em protocolo de concussão."],
      [B("Athletic: "), "Zeca, Kauan Lindes, Pedro Oliveira, Bruninho e Luan Polli já deixaram o clube e não jogam."],
    ]),

    H("h3", "Prováveis escalações"),
    P(B("São Bernardo: "), "Alex Alves; Luizão, Jemerson, Paré e Hugo Sanches; Dudu Miraíma, Lucas Lima e um volante no lugar do suspenso Marcão; Lucas Fernandes, Pedrinho e Fabrício Daniel. ", B("Técnico: "), "Vinícius Bergantin."),
    P(B("Athletic: "), "Tony; Lucas Belezi, Philipe Sampaio, Jhonatan Silva e Diogo Batista; Gabriel Verutti, João Miguel e Yago Santos; Yarlen, Kauan Rodrigues e Gustavão. ", B("Técnico: "), "Alex de Souza."),
    P("Siga o placar ao vivo na ", LK("página do jogo São Bernardo x Athletic", JOGO2), "."),

    // ===== Sábado =====
    H("h2", "O que ainda está em jogo no sábado (14/11)"),
    P("A decisão da Série B fica para a última tarde da competição. Antes da rodada final:"),
    LIST([
      [B("Topo: "), "Novorizontino (70 pontos) e Juventude (68) estão no G2. O Vila Nova (66) ainda pode passar o Juventude."],
      [B("Briga do 3º ao 6º: "), "Vila Nova (66), Criciúma (62), Fortaleza (62) e CRB (58) ocupam a faixa. Goiás e Atlético-GO também têm 58 pontos e o Sport, 55."],
      [B("Rebaixamento: "), "Ponte Preta, América-MG e Londrina já caíram. A última vaga do Z4 está entre Avaí (40 pontos) e Ceará (43): o Avaí precisa vencer o América-MG e torcer por derrota do Ceará para o CRB."],
    ]),
    TABLE(["Jogo", "Estádio"], [
      ["América-MG x Avaí", "Independência, em Belo Horizonte"],
      ["Fortaleza x Vila Nova", "Arena Castelão, em Fortaleza"],
      ["Atlético-GO x Cuiabá", "Antônio Accioly, em Goiânia"],
      ["Criciúma x Novorizontino", "Heriberto Hülse, em Criciúma"],
      ["Sport x Goiás", "Ilha do Retiro, em Recife"],
      ["CRB x Ceará", "Rei Pelé, em Maceió"],
      ["Juventude x Botafogo-SP", "Alfredo Jaconi, em Caxias do Sul"],
    ]),
    P("Todos os jogos de sábado começam às 16h30 (de Brasília). Veja a classificação completa e as rodadas na ", LK("página da Série B", CAMP), "."),

    FAQ([
      ["Quais são os jogos da Série B hoje, 12/11?", "Ponte Preta x Operário-PR, às 19h, no Ítalo Limongi, em Indaiatuba, e São Bernardo x Athletic, às 20h, no 1º de Maio, em São Bernardo do Campo. Os dois são da 38ª e última rodada."],
      ["Onde assistir Ponte Preta x Operário-PR?", "A partida tem transmissão prevista no Disney+, às 19h (de Brasília)."],
      ["Onde assistir São Bernardo x Athletic?", "O jogo passa no Premiere e na GE TV, no YouTube, às 20h (de Brasília)."],
      ["A Ponte Preta pode ter a pior campanha da história da Série B?", "Sim. Com 15 pontos, a Ponte precisa vencer o Operário para chegar a 18 e superar os 17 pontos do Duque de Caxias em 2011, a menor pontuação da Série B na era dos pontos corridos."],
      ["Por que esses jogos foram antecipados?", "A CBF antecipou as duas partidas para quinta-feira porque elas não interferem mais na disputa pelo acesso nem na luta contra o rebaixamento. Os jogos que decidem a Série B são no sábado (14/11), às 16h30."],
    ]),

    P("Fontes: tabela da CBF; sites oficiais do ", LK("Operário Ferroviário", "https://www.operarioferroviario.com.br/noticias/1584879", true), " e da ", LK("Ponte Preta", "https://pontepreta.com.br/reforma-emergencial-do-gramado-do-majestoso-entra-na-reta-final/", true), "; escalações e arbitragem publicadas pelo ", LK("Diário dos Campos", "https://dcmais.com.br/esportes/operario-encerra-serie-b-contra-a-rebaixada-ponte-preta/", true), " e pelo ", LK("Diário do Grande ABC", "https://www.dgabc.com.br/Noticia/4368265/sao-bernardo-fc-x-athletic-mg-pela-serie-b-veja-onde-assistir-e-as-provaveis-escalacoes", true), "."),
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
  const coverId = await media("capa-serie-b-12-11.png", "Jogos de hoje da Série B em 12/11: Ponte Preta x Operário-PR e São Bernardo x Athletic");
  const fotoPonte = await media("foto-ponte-majestoso.jpg", "Reforma do gramado do Estádio Moisés Lucarelli, o Majestoso, da Ponte Preta");
  const fotoOperario = await media("foto-operario-indio.jpg", "Volante Índio, do Operário Ferroviário, com os troféus do clube");
  log(`cover=${coverId} fotoPonte=${fotoPonte} fotoOperario=${fotoOperario}`);

  const teamDocs = await payload.find({ collection: "teams", where: { slug: { in: ["ponte-preta", "operario-pr", "sao-bernardo", "athletic-club"] } }, limit: 10, depth: 0 });
  const authors = await payload.find({ collection: "authors", limit: 1, where: { slug: { equals: "redacao" } } }).catch(() => ({ docs: [] }));
  const data = {
    title: "Jogos de hoje da Série B (12/11): horário e onde assistir Ponte Preta x Operário e São Bernardo x Athletic",
    slug: SLUG,
    category: "Brasileirão",
    tags: ["Série B", "Brasileirão Série B", "Jogos de hoje", "Ponte Preta", "Operário-PR", "São Bernardo", "Athletic"].map((tag) => ({ tag })),
    teams: teamDocs.docs.map((t) => t.id),
    cover: coverId,
    excerpt: "Série B hoje (12/11): Ponte Preta x Operário-PR às 19h (Disney+) e São Bernardo x Athletic às 20h (Premiere e GE TV). Tabela, últimos 5 jogos, escalações e desfalques.",
    content: buildContent(fotoPonte, fotoOperario),
    author: "Redação",
    ...(authors.docs[0] ? { authorProfile: authors.docs[0].id } : {}),
    publishedDate: new Date().toISOString(),
    seo: {
      metaTitle: "Jogos de hoje da Série B (12/11): horários e onde assistir",
      metaDescription: "Série B hoje: Ponte Preta x Operário-PR às 19h no Disney+ e São Bernardo x Athletic às 20h no Premiere e GE TV. Tabela, últimos jogos e escalações.",
    },
    _status: "draft",
  };

  const existing = await payload.find({ collection: "posts", where: { slug: { equals: SLUG } }, limit: 1, draft: true });
  const KEEP_PUBLISHED = existing.docs[0]?._status === "published";
  if (KEEP_PUBLISHED) data._status = "published";
  if (existing.docs[0]) {
    await payload.update({ collection: "posts", id: existing.docs[0].id, data, draft: !KEEP_PUBLISHED });
    log(`POST ${existing.docs[0].id} atualizado (${KEEP_PUBLISHED ? "publicado" : "rascunho"}) teams=${data.teams}`);
  } else {
    const doc = await payload.create({ collection: "posts", data, draft: true });
    log(`POST ${doc.id} criado (rascunho) teams=${data.teams}`);
  }
} catch (e) { log(`ERRO: ${e?.stack || e}`); }
process.exit(0);

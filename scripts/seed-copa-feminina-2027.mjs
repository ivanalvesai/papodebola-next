// Cria (ou atualiza) DOIS documentos, sempre como RASCUNHO:
//   1. Página do CMS  → collection "pages", slug "copa-do-mundo-feminina"
//      (renderiza em /futebol/copa-do-mundo-feminina: hero + blocos + feed de notícias)
//   2. Post           → collection "posts", categoria "Copa do Mundo Feminina"
//      (URL /futebol/copa-do-mundo-feminina/selecoes-classificadas-copa-do-mundo-feminina-2027)
//
// Como rodar (ver [[criar_post_payload_run]] / [[payload_migrations_recipe]]):
//   docker exec pdb-post npx payload run scripts/seed-copa-feminina-2027.mjs
//   docker exec pdb-post cat /app/seed-out.txt
//
// NUNCA publica — quem publica é o Ivan, pelo /cms.
// Dados das classificadas conferidos em 10/08/2026 (Fifa, Wikipédia por confederação,
// Al Jazeera/Itatiaia pra CAN feminina). O quadro africano fechou em 8 e 9 de agosto.
import fs from "fs";

const LOG = "/app/seed-out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

// ── helpers Lexical (mesmos do seed-casas-de-apostas) ─────────────────────────
const T = (text, format = 0) => ({
  type: "text",
  text,
  format,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
});
const LK = (text, url) => ({
  type: "link",
  version: 3,
  fields: { linkType: "custom", url, newTab: false },
  children: [T(text)],
  direction: "ltr",
  format: "",
  indent: 0,
});
const P = (...children) => ({
  type: "paragraph",
  children: children.length ? children : [T("")],
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  textFormat: 0,
});
const H = (tag, text) => ({
  type: "heading",
  tag,
  children: [T(text)],
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
});
const LI = (...children) => ({
  type: "listitem",
  children: children.length ? children : [T("")],
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
  value: 1,
});
const UL = (...items) => ({
  type: "list",
  listType: "bullet",
  tag: "ul",
  start: 1,
  children: items.map((li, i) => ({ ...li, value: i + 1 })),
  direction: "ltr",
  format: "",
  indent: 0,
  version: 1,
});
const RT = (...nodes) => ({
  root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 },
});
const B = 1; // bitmask de negrito no Lexical

const HUB = "/futebol/copa-do-mundo-feminina";

// ── dados ────────────────────────────────────────────────────────────────────
// [seleção, confederação, como se classificou]
const QUALIFIED = [
  ["Brasil", "Conmebol", "País-sede"],
  ["Colômbia", "Conmebol", "Campeã da Liga das Nações (jun/2026)"],
  ["Argentina", "Conmebol", "Vice da Liga das Nações (jun/2026)"],
  ["Austrália", "AFC (Ásia)", "Quartas da Copa da Ásia (13/03/2026)"],
  ["China", "AFC (Ásia)", "Quartas da Copa da Ásia (14/03/2026)"],
  ["Coreia do Sul", "AFC (Ásia)", "Quartas da Copa da Ásia (14/03/2026)"],
  ["Japão", "AFC (Ásia)", "Quartas da Copa da Ásia (15/03/2026)"],
  ["Filipinas", "AFC (Ásia)", "Repescagem asiática (19/03/2026)"],
  ["Coreia do Norte", "AFC (Ásia)", "Repescagem asiática (19/03/2026)"],
  ["Marrocos", "CAF (África)", "Quartas da CAN feminina (08/08/2026)"],
  ["Argélia", "CAF (África)", "Quartas da CAN feminina (08/08/2026)"],
  ["Camarões", "CAF (África)", "Quartas da CAN feminina (09/08/2026)"],
  ["Malawi", "CAF (África)", "Quartas da CAN feminina (09/08/2026)"],
  ["Espanha", "Uefa (Europa)", "1ª do Grupo A3 da Liga A"],
  ["Alemanha", "Uefa (Europa)", "1ª do Grupo A4 da Liga A"],
  ["França", "Uefa (Europa)", "1ª do Grupo A2 da Liga A"],
  ["Dinamarca", "Uefa (Europa)", "1ª do Grupo A1 da Liga A"],
  ["Nova Zelândia", "OFC (Oceania)", "Campeã da Copa das Nações (15/04/2026)"],
];

const REMAINING = [
  ["Uefa (Europa)", "7", "Playoffs em outubro e entre novembro e dezembro de 2026"],
  ["Concacaf", "4", "Campeonato da Concacaf, entre novembro e dezembro de 2026"],
  ["Repescagem intercontinental", "3", "Torneio de 10 seleções, entre o fim de 2026 e o início de 2027"],
];

const VENUES = [
  ["Rio de Janeiro", "Maracanã", "73.139"],
  ["Brasília", "Mané Garrincha", "69.910"],
  ["Belo Horizonte", "Mineirão", "66.658"],
  ["Fortaleza", "Arena Castelão", "57.867"],
  ["Porto Alegre", "Beira-Rio", "50.848"],
  ["São Paulo", "Neo Química Arena", "48.905"],
  ["Salvador", "Arena Fonte Nova", "47.915"],
  ["Recife", "Arena Pernambuco", "45.440"],
];

const tableBlock = (headers, rows) => ({
  blockType: "table",
  headers: headers.map((label) => ({ label })),
  rows: rows.map((cells) => ({ cells: cells.map((value) => ({ value })) })),
});

// ── conteúdo da PÁGINA (hub) ─────────────────────────────────────────────────
const pageLayout = [
  {
    blockType: "richText",
    content: RT(
      P(
        T("A Copa do Mundo Feminina de 2027 é a primeira disputada na América do Sul e devolve ao Brasil um Mundial adulto 13 anos depois de 2014. São "),
        T("32 seleções", B),
        T(" em oito grupos de quatro, entre 24 de junho e 25 de julho de 2027, em oito cidades. O Brasil já está classificado como anfitrião.")
      ),
      P(
        T("Esta página reúne o que já está definido — classificadas, vagas em disputa, sedes e datas — e é atualizada a cada rodada das eliminatórias.")
      )
    ),
  },
  { blockType: "heading", level: "h2", text: "Seleções já classificadas (18 de 32)" },
  tableBlock(["Seleção", "Confederação", "Como se classificou"], QUALIFIED),
  {
    blockType: "note",
    text: "Ásia, África, América do Sul e Oceania já preencheram todas as suas vagas. A Concacaf ainda não definiu nenhuma das quatro.",
  },
  { blockType: "heading", level: "h2", text: "As 14 vagas ainda em disputa" },
  tableBlock(["Confederação", "Vagas", "Quando se define"], REMAINING),
  { blockType: "heading", level: "h2", text: "Sedes, datas e formato" },
  {
    blockType: "richText",
    content: RT(
      P(
        T("O torneio começa em 24 de junho e termina em 25 de julho de 2027. São 64 jogos: fase de grupos com oito chaves de quatro seleções, e as duas melhores de cada grupo avançam às oitavas de final.")
      )
    ),
  },
  tableBlock(["Cidade-sede", "Estádio", "Capacidade"], VENUES),
  {
    blockType: "note",
    text: "Página atualizada conforme as eliminatórias avançam. Última atualização: 10 de agosto de 2026.",
  },
];

// ── conteúdo do POST ─────────────────────────────────────────────────────────
const postContent = RT(
  P(
    T("A Copa do Mundo Feminina de 2027 ainda está a quase um ano de distância, mas metade do quadro já está montada: "),
    T("18 das 32 seleções", B),
    T(" garantiram vaga no Mundial que o Brasil recebe entre 24 de junho e 25 de julho de 2027. As duas últimas confirmações vieram no fim de semana, na Copa Africana de Nações disputada no Marrocos.")
  ),
  P(
    T("Camarões e Malawi chegaram às semifinais da CAN feminina no domingo (9) e, com isso, carimbaram o passaporte para o Brasil — na África, a vaga no Mundial é decidida já nas quartas de final. Os Camarões bateram a Nigéria por 1 a 0, com gol de falta de Myriam Nyadjou. O Malawi virou sobre Gana por 2 a 1 e vai disputar a primeira Copa do Mundo da história do país.")
  ),

  H("h2", "As 18 seleções já classificadas"),
  P(T("Veja quem já está no Brasil, confederação por confederação.")),

  H("h3", "Ásia (AFC): 6 de 6 vagas preenchidas"),
  P(
    T("A Copa da Ásia disputada na Austrália, em março, resolveu toda a cota asiática. As quatro vencedoras das quartas de final se classificaram direto; as outras duas vagas saíram de uma repescagem continental.")
  ),
  UL(
    LI(T("Austrália", B), T(" — classificada em 13 de março")),
    LI(T("China", B), T(" — 14 de março")),
    LI(T("Coreia do Sul", B), T(" — 14 de março")),
    LI(T("Japão", B), T(" — 15 de março")),
    LI(T("Filipinas", B), T(" — 19 de março, na repescagem")),
    LI(T("Coreia do Norte", B), T(" — 19 de março, na repescagem"))
  ),

  H("h3", "África (CAF): 4 de 4 vagas preenchidas"),
  P(
    T("As quatro semifinalistas da Copa Africana de Nações, no Marrocos, ficaram com as vagas diretas. As quatro eliminadas nas quartas ainda brigam por duas vagas na repescagem intercontinental.")
  ),
  UL(
    LI(T("Marrocos", B), T(" — venceu a África do Sul por 2 a 1, no sábado (8)")),
    LI(T("Argélia", B), T(" — passou pela Costa do Marfim, também no sábado (8)")),
    LI(T("Camarões", B), T(" — 1 a 0 na Nigéria, no domingo (9)")),
    LI(T("Malawi", B), T(" — 2 a 1 em Gana, no domingo (9)"))
  ),

  H("h3", "América do Sul (Conmebol): 3 de 3 vagas preenchidas"),
  P(
    T("A Conmebol usou a Liga das Nações Feminina, disputada em pontos corridos entre outubro de 2025 e junho de 2026, como eliminatória. A Colômbia terminou em primeiro e a Argentina em segundo. Venezuela e Equador, 3ª e 4ª, seguem vivas na repescagem intercontinental.")
  ),
  UL(
    LI(T("Brasil", B), T(" — vaga automática de país-sede")),
    LI(T("Colômbia", B), T(" — campeã da Liga das Nações")),
    LI(T("Argentina", B), T(" — vice-campeã"))
  ),

  H("h3", "Europa (Uefa): 4 de 11 vagas preenchidas"),
  P(
    T("Só as quatro vencedoras dos grupos da Liga A entraram direto quando a fase de liga terminou, em 9 de junho. As outras sete vagas europeias saem dos playoffs de outubro, novembro e dezembro.")
  ),
  UL(
    LI(T("Espanha", B), T(" — atual campeã mundial")),
    LI(T("Alemanha", B)),
    LI(T("França", B)),
    LI(T("Dinamarca", B))
  ),

  H("h3", "Oceania (OFC): 1 de 1 vaga preenchida"),
  UL(
    LI(
      T("Nova Zelândia", B),
      T(" — bateu Papua-Nova Guiné por 1 a 0 na final da Copa das Nações, em 15 de abril, em Auckland. A PNG ficou com a vaga oceânica na repescagem.")
    )
  ),

  H("h3", "Concacaf: nenhuma das 4 vagas definidas"),
  P(
    T("A região de Estados Unidos, Canadá e México é a única que ainda não tem representante confirmado. O torneio classificatório da Concacaf acontece em novembro e dezembro de 2026.")
  ),

  H("h2", "Argélia e Malawi vão estrear em Copa do Mundo"),
  P(
    T("Das 18 classificadas, duas nunca disputaram um Mundial: Argélia e Malawi. O caso malauiano é o mais improvável — a seleção chegou ao torneio como 153ª do ranking da Fifa, em sua primeira participação na própria CAN, e eliminou adversárias mais bem cotadas. O time é puxado pelas irmãs Temwa e Tabitha Chawinga, esta última artilheira e uma das jogadoras mais decisivas do futebol europeu nos últimos anos.")
  ),
  P(
    T("Camarões volta ao Mundial depois de ficar de fora da edição de 2023, e Marrocos disputará a segunda Copa seguida.")
  ),

  H("h2", "As 14 vagas que ainda estão em jogo"),
  UL(
    LI(T("7 vagas da Uefa", B), T(" — playoffs em duas rodadas: 7 a 13 de outubro e 26 de novembro a 5 de dezembro de 2026")),
    LI(T("4 vagas da Concacaf", B), T(" — torneio classificatório em novembro e dezembro de 2026")),
    LI(
      T("3 vagas da repescagem intercontinental", B),
      T(" — um torneio de 10 seleções (2 da Ásia, 2 da África, 2 da Concacaf, 2 da América do Sul, 1 da Oceania e 1 da Europa) entre o fim de 2026 e o começo de 2027")
    )
  ),
  P(
    T("Venezuela, Equador e Papua-Nova Guiné já estão nessa repescagem. As africanas saem das eliminadas nas quartas da CAN — África do Sul, Nigéria, Costa do Marfim e Gana disputam duas vagas.")
  ),

  H("h2", "O boicote da Uefa é o ponto de interrogação da Copa"),
  P(
    T("Há um risco que paira sobre as quatro classificadas europeias — e sobre as outras sete vagas do continente. Em 30 de julho de 2026, as 55 federações da Uefa aprovaram, por unanimidade, boicotar competições da Fifa caso a entidade siga com o plano de vender participação em seus torneios a investidores privados, o projeto batizado de FIFA Forward Enterprise, que prevê captar até US$ 4,2 bilhões.")
  ),
  P(
    T("A Copa do Mundo Feminina de 2027 é o primeiro torneio adulto no calendário depois da decisão. Concacaf e a confederação asiática também se manifestaram contra o plano, sem aderir formalmente ao boicote. O primeiro teste prático vem antes: o Mundial sub-20 feminino, na Polônia, em setembro.")
  ),
  P(
    T("Enquanto Fifa e Uefa não fecham um acordo, Espanha, Alemanha, França e Dinamarca seguem classificadas — e os playoffs europeus de outubro seguem no calendário.")
  ),

  H("h2", "Quando e onde é a Copa do Mundo Feminina de 2027"),
  P(
    T("O Mundial será disputado entre 24 de junho e 25 de julho de 2027, com 32 seleções divididas em oito grupos de quatro. As duas melhores de cada chave avançam às oitavas de final, num total de 64 jogos.")
  ),
  P(T("As oito cidades-sede são:")),
  UL(
    ...VENUES.map(([city, stadium]) => LI(T(`${city} `, B), T(`— ${stadium}`)))
  ),
  P(
    T("A lista de classificadas é atualizada a cada rodada das eliminatórias na "),
    LK("página da Copa do Mundo Feminina 2027", HUB),
    T(".")
  )
);

// ── execução ─────────────────────────────────────────────────────────────────
const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;
const client = await getPayload({ config });

// 1) Página do CMS (hub)
const PAGE_SLUG = "copa-do-mundo-feminina";
const pageData = {
  title: "Copa do Mundo Feminina 2027 (hub)",
  slug: PAGE_SLUG,
  hero: {
    h1: "Copa do Mundo Feminina 2027: o Mundial vai ser aqui",
    subtitle:
      "De 24 de junho a 25 de julho de 2027, em oito cidades brasileiras. Acompanhe as seleções classificadas, as vagas em disputa, as sedes e as notícias do torneio.",
  },
  layout: pageLayout,
  seo: {
    metaTitle: "Copa do Mundo Feminina 2027: seleções classificadas, sedes e datas",
    metaDescription:
      "Copa do Mundo Feminina de 2027 no Brasil: as 18 seleções já classificadas, as 14 vagas ainda em disputa, as oito cidades-sede, datas e as últimas notícias.",
  },
  _status: "draft",
};

const foundPage = await client.find({
  collection: "pages",
  where: { slug: { equals: PAGE_SLUG } },
  limit: 1,
  draft: true,
});
if (foundPage.docs[0]) {
  const r = await client.update({
    collection: "pages",
    id: foundPage.docs[0].id,
    draft: true,
    data: pageData,
  });
  log(`OK: página ${r.id} (${PAGE_SLUG}) atualizada como rascunho.`);
} else {
  const r = await client.create({ collection: "pages", draft: true, data: pageData });
  log(`OK: página ${r.id} (${PAGE_SLUG}) criada como rascunho.`);
}

// 2) Post
const POST_SLUG = "selecoes-classificadas-copa-do-mundo-feminina-2027";
const postData = {
  title:
    "Copa do Mundo Feminina 2027: as 18 seleções que já garantiram vaga no Brasil",
  slug: POST_SLUG,
  category: "Copa do Mundo Feminina",
  author: "Redação",
  excerpt:
    "Com Camarões e Malawi, a África fechou sua cota e o Mundial de 2027 já tem 18 das 32 vagas ocupadas. Veja a lista completa, quem ainda pode se classificar e o risco do boicote europeu.",
  seo: {
    metaTitle: "Copa do Mundo Feminina 2027: as seleções já classificadas",
    metaDescription:
      "Veja as 18 seleções classificadas para a Copa do Mundo Feminina de 2027 no Brasil, as 14 vagas ainda em disputa e o calendário das eliminatórias.",
  },
  publishedDate: new Date().toISOString(),
  _status: "draft",
  content: postContent,
};

const foundPost = await client.find({
  collection: "posts",
  where: { slug: { equals: POST_SLUG } },
  limit: 1,
  draft: true,
});
if (foundPost.docs[0]) {
  const r = await client.update({
    collection: "posts",
    id: foundPost.docs[0].id,
    draft: true,
    data: postData,
  });
  log(`OK: post ${r.id} (${POST_SLUG}) atualizado como rascunho.`);
} else {
  const r = await client.create({ collection: "posts", draft: true, data: postData });
  log(`OK: post ${r.id} (${POST_SLUG}) criado como rascunho.`);
}

// Monta o ESQUELETO do guia /apostas/casas-de-apostas (post `casas-de-apostas`) a partir do
// "Brief de desenvolvimento — /apostas/casas-de-apostas": headings na hierarquia aprovada,
// tabela comparativa das 20 casas, 3 cards de review completo, 17 cards "em avaliação",
// FAQ (6 perguntas), índice e bloco do autor. O TEXTO fica como placeholder [PREENCHER...] —
// o conteúdo aprovado é colado no /cms.
//
// Como rodar (ver [[criar_post_payload_run]] / [[payload_migrations_recipe]]):
//   docker exec pdb-post npx payload run scripts/seed-casas-de-apostas.mjs
// Sempre grava como RASCUNHO. Nunca publica (só o Ivan publica).
//
// O conteúdo anterior do post NÃO se perde: o Payload guarda o histórico de versões
// (drafts, maxPerDoc 50) e o script salva um backup em /app/backup-casas-de-apostas.json.
import fs from "fs";

const LOG = "/app/seed-out.txt";
const log = (m) => fs.appendFileSync(LOG, `${m}\n`);

// ── helpers Lexical ───────────────────────────────────────────────────────────
const T = (text, format = 0) => ({
  type: "text",
  text,
  format,
  detail: 0,
  mode: "normal",
  style: "",
  version: 1,
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
const RT = (...nodes) => ({
  root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 },
});
const BLOCK = (blockType, fields) => ({
  type: "block",
  version: 2,
  format: "",
  fields: { blockType, ...fields },
});

// ── dados do brief ────────────────────────────────────────────────────────────
// Só as 3 primeiras têm nota (brief §8: NÃO atribuir nota às 17 "em avaliação").
const REVIEWED = [
  { name: "Betano", score: "9.2", slug: "betano" },
  { name: "KTO", score: "9.0", slug: "kto" },
  { name: "Betnacional", score: "8.9", slug: "betnacional" },
];
const PENDING = [
  "BetBoom", "Stake", "Bet365", "Novibet", "Sportingbet", "BetMGM", "Betsson",
  "Brazino777", "Rivalo", "HiperBet", "Betfair", "VBET", "Esportes da Sorte",
  "Superbet", "Lottoland", "Blaze", "Br4bet",
];
const ALL = [
  ...REVIEWED.map((r) => ({ ...r, pending: false })),
  ...PENDING.map((name) => ({ name, score: "", slug: "", pending: true })),
];

const FILL = "[PREENCHER]";
const ph = (what) => `[PREENCHER — ${what}]`;

const content = RT(
  P(T(ph("parágrafo de abertura do conteúdo aprovado"))),

  // Mini-TOC: se monta sozinho com os H2 abaixo.
  BLOCK("toc", { title: "Nesta página", auto: true, items: [] }),

  // Tabela comparativa (20 linhas). Linha sem nota sai como "Em avaliação".
  BLOCK("bettingTable", {
    title: "Comparativo das 20 casas licenciadas",
    emptyScoreLabel: "Em avaliação",
    rows: ALL.map((h) => ({
      name: h.name,
      score: h.score,
      license: ph("portaria SPA"),
      payment: FILL,
      highlight: FILL,
      href: h.slug ? `/apostas/${h.slug}` : "",
    })),
  }),

  // Caixa "Recomendação rápida" (destaque verde). O CTA da Betano entra como bloco
  // "Botão" quando o link de afiliado real existir — placeholder não vai pro ar.
  BLOCK("callout", {
    style: "highlight",
    content: RT(
      P(T("Recomendação rápida: ", 1), T(ph("texto da recomendação aprovada"))),
      P(T("[INSERIR LINK AFILIADO — Betano: adicionar aqui um bloco “Botão” com o link de tracking real]"))
    ),
  }),

  H("h2", "Ranking Completo de Casas de Apostas"),
  ...REVIEWED.flatMap((h, i) => [
    H("h3", `${i + 1}. ${h.name} — Nota ${h.score}`),
    BLOCK("bettingReview", {
      name: h.name,
      rank: String(i + 1),
      score: h.score,
      license: ph("portaria SPA"),
      ra: ph("nota do Reclame Aqui (julho/2026)"),
      raUrl: "",
      images: [],
      summary: RT(P(T(ph(`análise completa da ${h.name}`)))),
      prosTitle: "Prós",
      pros: [{ item: ph("pró 1") }, { item: ph("pró 2") }, { item: ph("pró 3") }],
      consTitle: "Contras",
      cons: [{ item: ph("contra 1") }, { item: ph("contra 2") }],
      ctaLabel: `Abrir conta na ${h.name}`,
      ctaUrl: "", // pendente: link de afiliado real (brief §6). Vazio = botão não renderiza.
      linkLabel: "Ver análise completa",
      linkHref: `/apostas/${h.slug}`, // pendente: publicar a review individual (brief §6)
      cor: "verde",
    }),
  ]),

  H("h2", "Outras Operadoras Licenciadas (Avaliação em Andamento)"),
  P(T(ph("parágrafo explicando que estas casas ainda não receberam nota"))),
  ...PENDING.flatMap((name) => [
    H("h3", name),
    BLOCK("bettingReview", {
      name,
      rank: "",
      score: "", // sem nota de propósito (brief §8)
      license: ph("portaria SPA"),
      ra: ph("nota do Reclame Aqui (julho/2026)"),
      raUrl: "",
      images: [],
      summary: RT(P(T(ph(`resumo da ${name}`)))),
      prosTitle: "Prós",
      pros: [{ item: ph("pró 1") }, { item: ph("pró 2") }],
      consTitle: "Contras",
      cons: [{ item: ph("contra 1") }],
      ctaLabel: `Abrir conta na ${name}`,
      ctaUrl: "", // pendente: link de afiliado real (brief §6)
      linkLabel: "",
      linkHref: "",
      cor: "verde",
    }),
  ]),
  H("h3", "Lista em Expansão"),
  P(T(ph("texto sobre novas operadoras entrando na lista"))),

  H("h2", "Qual Casa de Aposta Escolher para Cada Perfil"),
  P(T(ph("texto por perfil de apostador"))),

  H("h2", "Como Interpretar Nota, Licença e Bônus"),
  P(T(ph("como lemos nota, licença SPA e bônus"))),

  H("h2", "Frequência de Atualização"),
  P(T(ph("compromisso de revisão mensal"))),

  BLOCK("faq", {
    title: "Perguntas Frequentes",
    firstOpen: true,
    items: Array.from({ length: 6 }, (_, i) => ({
      question: ph(`pergunta ${i + 1}`),
      answer: RT(P(T(ph(`resposta ${i + 1}`)))),
    })),
  }),

  // Bloco de autor (não-heading de propósito — brief §3). authorId setado abaixo.
  BLOCK("authorBox", { author: null, intro: "Conteúdo criado por", title: "Sobre o Autor" })
);

const { getPayload } = await import("payload");
const config = (await import("@payload-config")).default;

const client = await getPayload({ config });

// Autor do bloco "Sobre o Autor" (brief: Lucas Lima).
const authors = await client.find({
  collection: "authors",
  where: { slug: { equals: "lucas-lima" } },
  limit: 1,
});
const authorId = authors.docs[0]?.id || null;
if (!authorId) log("AVISO: autor lucas-lima não encontrado — bloco de autor sai sem autor.");
const lastBlock = content.root.children[content.root.children.length - 1];
lastBlock.fields.author = authorId;

const found = await client.find({
  collection: "posts",
  where: { slug: { equals: "casas-de-apostas" } },
  limit: 1,
  draft: true,
});
const existing = found.docs[0];
if (!existing) {
  log("ERRO: post casas-de-apostas não encontrado. Abortado (o script não cria post novo).");
} else {
  fs.writeFileSync(
    "/app/backup-casas-de-apostas.json",
    JSON.stringify({ id: existing.id, title: existing.title, content: existing.content }, null, 2)
  );
  const res = await client.update({
    collection: "posts",
    id: existing.id,
    draft: true, // rascunho: publicação é decisão do Ivan
    data: {
      title: "Casas de Apostas no Brasil: as 20 Melhores (Julho de 2026)",
      category: "Casas de Apostas",
      authorProfile: authorId || undefined,
      excerpt:
        "As melhores casas de apostas são Betano, KTO e Betnacional. Ranking com as 20 operadoras licenciadas pela SPA, verificado e atualizado em julho/2026.",
      seo: {
        metaTitle: "Casas de Apostas no Brasil: as 20 Melhores (Julho 2026)",
        metaDescription:
          "As melhores casas de apostas são Betano, KTO e Betnacional. Ranking com as 20 operadoras licenciadas pela SPA, verificado e atualizado em julho/2026.",
      },
      _status: "draft",
      content,
    },
  });
  log(`OK: post ${res.id} atualizado como rascunho (${content.root.children.length} nós).`);
}

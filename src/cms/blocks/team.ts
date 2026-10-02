import type { Block, Field } from "payload";
import { withMeta } from "./meta.ts";

// ── Biblioteca de blocos da collection `teams` (piloto do CMS de blocos de time) ──
// DINÂMICOS: ao renderizar, buscam dado AO VIVO via getTeamPageDataFor(team) — os mesmos
// cards de hoje, embrulhados (ver TeamBlockRenderer). O editor só escolhe/ordena e pode
// dar um título. ESTÁTICOS: texto/título autoral. Os mesmos blocos ficam disponíveis em
// todas as abas (hub + 5 sub-rotas) → composição livre por página.
const blockTitle: Field = {
  name: "title",
  type: "text",
  admin: { description: "Título exibido acima do bloco (opcional)" },
};
const blockLimit: Field = {
  name: "limit",
  type: "number",
  admin: { description: "Quantos itens mostrar (opcional)" },
};

export const TEAM_LAYOUT_BLOCKS: Block[] = [
  // — Dinâmicos (dados ao vivo do time) —
  withMeta({ slug: "teamTodayMatch", labels: { singular: "Jogo de hoje", plural: "Jogo de hoje" }, fields: [blockTitle] }, "team", { hideOn: false }),
  withMeta({ slug: "teamUpcoming", labels: { singular: "Próximos jogos", plural: "Próximos jogos" }, fields: [blockTitle, blockLimit] }, "team", { hideOn: false }),
  withMeta({ slug: "teamResults", labels: { singular: "Resultados recentes", plural: "Resultados recentes" }, fields: [blockTitle, blockLimit] }, "team", { hideOn: false }),
  withMeta({ slug: "teamStanding", labels: { singular: "Classificação (posição)", plural: "Classificação" }, fields: [blockTitle] }, "team", { hideOn: false }),
  withMeta({ slug: "teamNews", labels: { singular: "Notícias do time", plural: "Notícias do time" }, fields: [blockTitle, blockLimit] }, "team", { hideOn: false }),
  withMeta({ slug: "teamScorers", labels: { singular: "Artilheiros", plural: "Artilheiros" }, fields: [blockTitle, blockLimit] }, "team", { hideOn: false }),
  withMeta({ slug: "teamWhereToWatch", labels: { singular: "Onde assistir", plural: "Onde assistir" }, fields: [blockTitle] }, "team", { hideOn: false }),
  withMeta({ slug: "teamLineup", labels: { singular: "Escalação provável", plural: "Escalação" }, fields: [blockTitle] }, "team", { hideOn: false }),
  withMeta({ slug: "teamClusterLinks", labels: { singular: "Links do cluster (hub)", plural: "Links do cluster" }, fields: [] }, "team", { hideOn: false }),
  withMeta({ slug: "teamAutoText", labels: { singular: "Texto automático do time", plural: "Textos automáticos" }, fields: [] }, "team", { hideOn: false }),
  // Página padrão da aba inteira (os mesmos cards dos times do config). Textos/títulos do
  // editor entram antes/depois dela.
  withMeta({ slug: "teamClassic", labels: { singular: "Página padrão do time (cards automáticos)", plural: "Páginas padrão do time" }, fields: [] }, "team", { hideOn: false }),
  // — Estáticos (texto autoral) —
  withMeta(
    {
      slug: "richText",
      labels: { singular: "Texto", plural: "Textos" },
      fields: [{ name: "content", type: "richText" }],
    },
    "text",
    { hideOn: false },
  ),
  withMeta(
    {
      slug: "heading",
      labels: { singular: "Título", plural: "Títulos" },
      fields: [
        { name: "text", type: "text" },
        { name: "level", type: "select", defaultValue: "h2", options: ["h2", "h3"] },
      ],
    },
    "text",
    { hideOn: false },
  ),
];

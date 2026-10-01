import type { Block, Field } from "payload";
import { withMeta } from "./meta.ts";
import { tournamentOptions, WIDGET_OPTIONS } from "./options.ts";

const title: Field = { name: "title", type: "text", label: "Título (opcional)", admin: { description: "Aparece acima do bloco" } };
const limit = (def: number): Field => ({ name: "limit", type: "number", label: "Quantidade", defaultValue: def, min: 1, max: 30 });
const tournament: Field = {
  name: "tournament", type: "select", required: true, label: "Campeonato",
  defaultValue: "brasileirao-serie-a", options: tournamentOptions(),
};

// Bloco DINÂMICO: jogos de hoje (lidos do store; nunca bate na API). O editor escolhe a
// liga e a ORDEM (um bloco por campeonato). Movido verbatim do payload.config.ts: slug e
// campos não mudam (as tabelas do Postgres levam o nome do slug).
export const todayGamesBlock: Block = withMeta({
  slug: "todayGames",
  labels: { singular: "Jogos de hoje (dinâmico)", plural: "Jogos de hoje" },
  fields: [
    { name: "title", type: "text", admin: { description: "Título acima dos jogos (opcional)" } },
    {
      name: "league",
      type: "text",
      admin: {
        description:
          "Liga: 'all' (todos), 'copa-do-mundo', 'brasileirao-serie-a', 'brasileirao-serie-b', 'brasileirao-serie-c', 'copa-do-brasil', 'libertadores', 'sudamericana'. Vazio = todos.",
      },
    },
    {
      name: "emptyTitle",
      type: "text",
      admin: { description: "Empty-state (só no bloco 'all'): título quando NÃO há jogos hoje" },
    },
    { name: "emptyText", type: "text", admin: { description: "Empty-state: texto de apoio" } },
    { name: "primaryCtaLabel", type: "text", admin: { description: "Empty-state: botão 1 (texto)" } },
    { name: "primaryCtaHref", type: "text", admin: { description: "Empty-state: botão 1 (URL)" } },
    { name: "secondaryCtaLabel", type: "text", admin: { description: "Empty-state: botão 2 (texto)" } },
    { name: "secondaryCtaHref", type: "text", admin: { description: "Empty-state: botão 2 (URL)" } },
  ],
}, "data");

export function dataBlocks(): Block[] {
  return [
    todayGamesBlock,
    withMeta({
      slug: "teamWidget",
      labels: { singular: "Widget de time", plural: "Widgets de time" },
      fields: [
        { name: "team", type: "relationship", relationTo: "teams", required: true, label: "Time", admin: { description: "Qualquer time cadastrado em Times" } },
        { name: "widget", type: "select", required: true, defaultValue: "upcoming", label: "O que mostrar", options: WIDGET_OPTIONS },
        title, limit(5),
      ],
    }, "data"),
    withMeta({
      slug: "standings",
      labels: { singular: "Classificação de campeonato", plural: "Classificações" },
      fields: [
        tournament, title,
        { name: "rows", type: "number", label: "Linhas", defaultValue: 20, min: 4, max: 30 },
        { name: "compact", type: "checkbox", label: "Versão compacta (10 linhas, estilo widget)", defaultValue: false },
      ],
    }, "data"),
    withMeta({
      slug: "scorers",
      labels: { singular: "Artilharia de campeonato", plural: "Artilharias" },
      fields: [tournament, title, limit(10)],
    }, "data"),
    withMeta({
      slug: "newsFeed",
      labels: { singular: "Feed de notícias", plural: "Feeds de notícias" },
      fields: [
        { name: "source", type: "select", required: true, defaultValue: "latest", label: "Fonte",
          options: [
            { label: "Últimas notícias", value: "latest" },
            { label: "Por categoria", value: "category" },
            { label: "Por tag", value: "tag" },
            { label: "Por time", value: "team" },
          ] },
        { name: "value", type: "text", label: "Categoria ou tag", admin: { description: "Nome exato (ex.: NBA, Brasileirão, Copa do Mundo)", condition: (_, s) => s?.source === "category" || s?.source === "tag" } },
        { name: "team", type: "relationship", relationTo: "teams", label: "Time", admin: { condition: (_, s) => s?.source === "team" } },
        limit(6),
        { name: "layout", type: "select", defaultValue: "grid", label: "Formato",
          options: [{ label: "Grade (cards com imagem)", value: "grid" }, { label: "Lista", value: "list" }, { label: "Destaque + grade", value: "featured" }] },
        title,
        { name: "seeAllHref", type: "text", label: "Link 'Ver todas' (opcional)" },
      ],
    }, "data"),
    withMeta({
      slug: "liveMatch",
      labels: { singular: "Jogo ao vivo (futebol)", plural: "Jogos ao vivo" },
      fields: [
        { name: "matchId", type: "number", required: true, label: "ID do jogo (API)", admin: { description: "Número do evento na API esportiva (ex.: 16814493). Placar e lance a lance atualizam sozinhos." } },
        { name: "competition", type: "text", label: "Competição (texto acima do placar)" },
        title,
      ],
    }, "data"),
  ];
}

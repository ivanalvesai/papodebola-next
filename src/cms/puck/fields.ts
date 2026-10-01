// Campos dos componentes do Puck — COMPARTILHADOS entre o editor (client) e o render do
// servidor (RSC), senão o Render do Puck não transforma os slots igual. Sem JSX aqui (o mapRow da Mídia usa createElement).
import type { Fields } from "@puckeditor/core";
import { tournamentOptions, WIDGET_OPTIONS } from "@/cms/blocks/options";
import { teamExternal } from "./externals";
import { RICH_FIELDS } from "./fields-rich";
/* eslint-disable @typescript-eslint/no-explicit-any */

const title = { type: "text", label: "Título (opcional)" } as const;
const tournament = { type: "select", label: "Campeonato", options: tournamentOptions() } as const;

// Escolha de time direto da collection `teams` (só roda no navegador, dentro do /cms).
export { teamExternal };

const BASE_FIELDS: Record<string, Fields<any>> = {
  Heading: {
    text: { type: "text", label: "Texto" },
    level: { type: "radio", label: "Nível", options: [{ label: "H2", value: "h2" }, { label: "H3", value: "h3" }] },
  },
  Text: { text: { type: "textarea", label: "Texto (uma linha = um parágrafo)" } },
  Image: {
    url: { type: "text", label: "URL da imagem (copie de Mídia)" },
    caption: { type: "text", label: "Legenda" },
  },
  Button: {
    label: { type: "text", label: "Texto" },
    url: { type: "text", label: "Link" },
    style: { type: "radio", label: "Estilo", options: [{ label: "Verde", value: "primary" }, { label: "Contorno", value: "outline" }] },
  },
  Columns: {
    count: { type: "radio", label: "Colunas", options: [{ label: "2", value: 2 }, { label: "3", value: 3 }] },
    col1: { type: "slot", disallow: ["Snippet"] },
    col2: { type: "slot", disallow: ["Snippet"] },
    col3: { type: "slot", disallow: ["Snippet"] },
  },
  Section: {
    title,
    background: {
      type: "select",
      label: "Fundo",
      options: [{ label: "Nenhum", value: "none" }, { label: "Card", value: "card" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }],
    },
    content: { type: "slot", disallow: ["Snippet"] },
  },
  TeamWidget: {
    team: teamExternal as any,
    widget: { type: "select", label: "O que mostrar", options: WIDGET_OPTIONS },
    title,
    limit: { type: "number", label: "Quantidade", min: 1, max: 30 },
  },
  Standings: {
    tournament,
    title,
    rows: { type: "number", label: "Linhas", min: 4, max: 30 },
    compact: { type: "radio", label: "Compacta", options: [{ label: "Não", value: false }, { label: "Sim", value: true }] },
  },
  Scorers: { tournament, title, limit: { type: "number", label: "Quantidade", min: 1, max: 30 } },
  NewsFeed: {
    source: {
      type: "select",
      label: "Fonte",
      options: [{ label: "Últimas", value: "latest" }, { label: "Categoria", value: "category" }, { label: "Tag", value: "tag" }, { label: "Time", value: "team" }],
    },
    value: { type: "text", label: "Categoria/tag" },
    team: teamExternal as any,
    limit: { type: "number", label: "Quantidade", min: 1, max: 30 },
    layout: {
      type: "select",
      label: "Formato",
      options: [{ label: "Grade", value: "grid" }, { label: "Lista", value: "list" }, { label: "Destaque", value: "featured" }],
    },
    title,
  },
  LiveMatch: {
    matchId: { type: "number", label: "ID do jogo (API)" },
    competition: { type: "text", label: "Competição" },
    title,
  },
  TodayGames: {
    league: { type: "select", label: "Liga", options: [{ label: "Todas", value: "all" }, ...tournamentOptions()] },
    title,
  },
};

export const FIELDS: Record<string, Fields<any>> = { ...BASE_FIELDS, ...RICH_FIELDS };

export const CATEGORIES = {
  texto: { title: "Texto e mídia", components: ["Heading", "Text", "Image", "Button", "MediaText", "Carousel"] },
  layout: { title: "Layout", components: ["Section", "Columns", "Divider"] },
  destaques: { title: "Destaques", components: ["Hero", "Cta", "Cards", "Stats", "Testimonials", "People", "Timeline"] },
  interacao: { title: "Interação", components: ["Faq", "Tabs", "FormBlock", "Buttons", "Social", "IconList"] },
  incorporar: { title: "Incorporar", components: ["Instagram", "XPost", "Embed"] },
  dados: { title: "Dados ao vivo", components: ["TeamWidget", "Standings", "Scorers", "NewsFeed", "LiveMatch", "TodayGames", "Countdown"] },
  trechos: { title: "Trechos", components: ["Snippet"] },
};

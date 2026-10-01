import type { Block } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { withMeta } from "./meta.ts";

type RichTextEditor = ReturnType<typeof lexicalEditor>;

// Blocos estáticos das Páginas do CMS (movidos verbatim do payload.config.ts).
// Slugs e campos NÃO podem mudar: as tabelas do Postgres levam o nome do slug.
// A ordem aqui é a ordem no drawer.
export const STATIC_BLOCK_SLUGS = ["richText","heading","image","gallery","youtube","quote","list","table","note","columns","button","infoCard","linkCards"] as const;

export function staticBlocks(richTextEditor: RichTextEditor): Block[] {
  const blocks: Block[] = [
    withMeta(
      {
        slug: "richText",
        labels: { singular: "Texto", plural: "Textos" },
        fields: [{ name: "content", type: "richText", editor: richTextEditor }],
      },
      "text",
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
    ),
    withMeta(
      {
        slug: "image",
        labels: { singular: "Imagem", plural: "Imagens" },
        fields: [
          { name: "image", type: "upload", relationTo: "media", required: true },
          { name: "caption", type: "text" },
          { name: "align", type: "select", defaultValue: "center", options: ["left", "center", "right"] },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "gallery",
        labels: { singular: "Galeria", plural: "Galerias" },
        fields: [
          {
            name: "images",
            type: "array",
            fields: [{ name: "image", type: "upload", relationTo: "media" }],
          },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "youtube",
        labels: { singular: "Vídeo do YouTube", plural: "Vídeos do YouTube" },
        fields: [
          {
            name: "url",
            type: "text",
            required: true,
            label: "Link do vídeo",
            admin: {
              description:
                "Cole o link (https://www.youtube.com/watch?v=XXXX, https://youtu.be/XXXX ou o link do Shorts).",
            },
          },
          { name: "title", type: "text", label: "Título (opcional)", admin: { description: "Aparece acima do vídeo." } },
          { name: "caption", type: "text", label: "Legenda (opcional)", admin: { description: "Aparece abaixo do vídeo." } },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "quote",
        labels: { singular: "Citação", plural: "Citações" },
        fields: [
          { name: "text", type: "textarea", required: true },
          { name: "author", type: "text" },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "list",
        labels: { singular: "Lista", plural: "Listas" },
        fields: [
          {
            name: "items",
            type: "array",
            minRows: 1,
            fields: [{ name: "content", type: "richText" }],
          },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "table",
        labels: { singular: "Tabela", plural: "Tabelas" },
        fields: [
          { name: "headers", type: "array", fields: [{ name: "label", type: "text" }] },
          {
            name: "rows",
            type: "array",
            fields: [{ name: "cells", type: "array", fields: [{ name: "value", type: "text" }] }],
          },
        ],
      },
      "text",
    ),
    withMeta(
      {
        slug: "note",
        labels: { singular: "Nota", plural: "Notas" },
        fields: [{ name: "text", type: "text", required: true }],
      },
      "text",
    ),
    withMeta(
      {
        slug: "columns",
        labels: { singular: "Colunas", plural: "Colunas" },
        fields: [
          {
            name: "columns",
            type: "array",
            labels: { singular: "Coluna", plural: "Colunas" },
            minRows: 2,
            maxRows: 4,
            fields: [{ name: "content", type: "richText" }],
          },
        ],
      },
      "layout",
    ),
    withMeta(
      {
        slug: "button",
        labels: { singular: "Botão", plural: "Botões" },
        fields: [
          { name: "label", type: "text", required: true },
          { name: "url", type: "text", required: true },
          { name: "style", type: "select", defaultValue: "primary", options: ["primary", "outline"] },
        ],
      },
      "layout",
    ),
    withMeta(
      {
        slug: "infoCard",
        labels: { singular: "Card de info", plural: "Cards de info" },
        fields: [
          { name: "label", type: "text", required: true },
          { name: "value", type: "text", required: true },
          { name: "href", type: "text" },
        ],
      },
      "layout",
    ),
    withMeta(
      {
        slug: "linkCards",
        labels: { singular: "Cards de link (grid)", plural: "Cards de link" },
        fields: [
          { name: "title", type: "text", admin: { description: "Título acima dos cards (opcional)" } },
          {
            name: "items",
            type: "array",
            label: "Cards",
            admin: { description: "Cada card é um link. Arraste para reordenar." },
            fields: [
              { name: "label", type: "text", required: true },
              { name: "href", type: "text", required: true },
            ],
          },
        ],
      },
      "layout",
    ),
  ];
  // Ordem do drawer = ordem de STATIC_BLOCK_SLUGS (fonte única).
  const pos = (b: Block) => (STATIC_BLOCK_SLUGS as readonly string[]).indexOf(b.slug);
  return blocks.sort((a, b) => pos(a) - pos(b));
}

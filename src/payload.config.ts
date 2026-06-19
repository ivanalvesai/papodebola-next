import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Payload (Fase 1 da migração). Admin em /cms e API em /cms-api pra NÃO colidir
// com o /admin (404 no middleware) nem com as rotas em /api do app. Postgres.
export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || "",
  editor: lexicalEditor(),
  sharp,
  routes: {
    admin: "/cms",
    api: "/cms-api",
    graphQL: "/cms-api/graphql",
    graphQLPlayground: "/cms-api/graphql-playground",
  },
  admin: {
    user: "users",
    importMap: { baseDir: path.resolve(dirname, "app/(payload)") },
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
  }),
  collections: [
    {
      slug: "users",
      auth: true,
      admin: { useAsTitle: "email" },
      fields: [],
    },
    {
      slug: "media",
      upload: { staticDir: path.resolve(dirname, "../public/cms-media") },
      fields: [{ name: "alt", type: "text" }],
    },
    {
      slug: "pages",
      admin: { useAsTitle: "title" },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true, index: true },
        {
          name: "hero",
          type: "group",
          fields: [
            { name: "h1", type: "text" },
            { name: "subtitle", type: "text" },
          ],
        },
        {
          name: "layout",
          type: "blocks",
          blocks: [
            {
              slug: "richText",
              labels: { singular: "Texto", plural: "Textos" },
              fields: [{ name: "content", type: "richText" }],
            },
            {
              slug: "heading",
              labels: { singular: "Título", plural: "Títulos" },
              fields: [
                { name: "text", type: "text" },
                { name: "level", type: "select", defaultValue: "h2", options: ["h2", "h3"] },
              ],
            },
            {
              slug: "image",
              labels: { singular: "Imagem", plural: "Imagens" },
              fields: [
                { name: "image", type: "upload", relationTo: "media", required: true },
                { name: "caption", type: "text" },
                { name: "align", type: "select", defaultValue: "center", options: ["left", "center", "right"] },
              ],
            },
            {
              slug: "columns",
              labels: { singular: "Colunas", plural: "Colunas" },
              fields: [
                {
                  name: "columns",
                  type: "array",
                  minRows: 2,
                  maxRows: 4,
                  fields: [{ name: "content", type: "richText" }],
                },
              ],
            },
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
            {
              slug: "quote",
              labels: { singular: "Citação", plural: "Citações" },
              fields: [
                { name: "text", type: "textarea", required: true },
                { name: "author", type: "text" },
              ],
            },
            {
              slug: "button",
              labels: { singular: "Botão", plural: "Botões" },
              fields: [
                { name: "label", type: "text", required: true },
                { name: "url", type: "text", required: true },
                { name: "style", type: "select", defaultValue: "primary", options: ["primary", "outline"] },
              ],
            },
          ],
        },
        {
          name: "seo",
          type: "group",
          fields: [
            { name: "metaTitle", type: "text" },
            { name: "metaDescription", type: "textarea" },
          ],
        },
      ],
    },
  ],
});

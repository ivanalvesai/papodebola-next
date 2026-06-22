import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { articleHref } from "@/lib/config";

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
    // Só o dev sincroniza o schema (PAYLOAD_DB_PUSH=true no .env.local do dev).
    // Prod usa o schema já criado pelo dev (banco é compartilhado). Antes da Fase 3
    // (notícias com dados) migramos pra migrations formais (prodMigrations).
    push: process.env.PAYLOAD_DB_PUSH === "true",
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
      // staticDir no volume COMPARTILHADO (/app/data) — persiste entre deploys e é
      // o mesmo em dev e prod. URL servida via /cms-api/media/file/<filename>.
      // formatOptions: original vira WebP. imageSizes: versão "card" (800px WebP).
      upload: {
        staticDir: path.resolve(dirname, "../data/cms-media"),
        formatOptions: { format: "webp", options: { quality: 80 } },
        imageSizes: [
          { name: "card", width: 800, formatOptions: { format: "webp", options: { quality: 78 } } },
        ],
      },
      // Leitura pública: as imagens/arquivos precisam abrir pra qualquer visitante.
      access: { read: () => true },
      fields: [{ name: "alt", type: "text" }],
    },
    {
      slug: "pages",
      admin: { useAsTitle: "title" },
      // Rascunho/publicar: edições ficam em draft até publicar. O site (find sem
      // draft) só mostra a versão publicada. Anônimo só lê publicado.
      versions: { drafts: true, maxPerDoc: 50 },
      access: {
        read: ({ req: { user } }) =>
          user ? true : { _status: { equals: "published" } },
      },
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
            {
              slug: "infoCard",
              labels: { singular: "Card de info", plural: "Cards de info" },
              fields: [
                { name: "label", type: "text", required: true },
                { name: "value", type: "text", required: true },
                { name: "href", type: "text" },
              ],
            },
            {
              slug: "note",
              labels: { singular: "Nota", plural: "Notas" },
              fields: [{ name: "text", type: "text", required: true }],
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
    {
      slug: "posts",
      labels: { singular: "Post", plural: "Posts" },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "publishedDate", "_status"],
        // Botão "Preview" no editor → abre o post (mesmo rascunho) renderizado no
        // layout real do site, numa página dedicada (não toca nas páginas públicas/ISR).
        preview: (doc: { slug?: string }) =>
          doc?.slug
            ? `/cms-preview/${doc.slug}?previewSecret=${process.env.CRON_SECRET || ""}`
            : null,
      },
      // schedulePublish: habilita "Schedule Publish" (publicar/despublicar em data/hora).
      // Usa a fila de jobs (ver `jobs` no fim do config) — disparada por cron 1/min.
      versions: { drafts: { schedulePublish: true }, maxPerDoc: 20 },
      access: {
        read: ({ req: { user } }) =>
          user ? true : { _status: { equals: "published" } },
      },
      // 3e: edição/publicação no /cms revalida o site na hora (substitui o mu-plugin).
      hooks: {
        afterChange: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ doc }: any) => {
            try {
              revalidatePath("/");
              revalidatePath("/noticias");
              if (doc?.category && doc?.slug) revalidatePath(articleHref(doc.category, doc.slug));
            } catch {
              /* fora de contexto de request (build/cli) */
            }
            return doc;
          },
        ],
        afterDelete: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ doc }: any) => {
            try {
              revalidatePath("/");
              revalidatePath("/noticias");
              if (doc?.category && doc?.slug) revalidatePath(articleHref(doc.category, doc.slug));
            } catch {
              /* */
            }
          },
        ],
      },
      fields: [
        { name: "title", type: "text", required: true },
        { name: "slug", type: "text", required: true, unique: true, index: true },
        {
          name: "category",
          type: "text",
          admin: { description: "Nome da categoria (define a URL /{categoria}/{slug})" },
        },
        { name: "tags", type: "array", fields: [{ name: "tag", type: "text" }] },
        { name: "cover", type: "upload", relationTo: "media" },
        { name: "excerpt", type: "textarea", admin: { description: "Resumo (meta description)" } },
        {
          name: "body",
          type: "code",
          admin: { language: "html", description: "Corpo do post (HTML)" },
        },
        { name: "author", type: "text", defaultValue: "Redação" },
        {
          name: "publishedDate",
          type: "date",
          admin: { date: { pickerAppearance: "dayAndTime" } },
        },
        { name: "pdbLink", type: "text", admin: { description: "URL custom do card (opcional)" } },
        {
          name: "seo",
          type: "group",
          fields: [
            { name: "metaTitle", type: "text" },
            { name: "metaDescription", type: "textarea" },
          ],
        },
        {
          name: "wpId",
          type: "number",
          index: true,
          admin: { readOnly: true, description: "ID de origem no WordPress (import)" },
        },
      ],
    },
  ],
  // Fila de jobs — necessária pro Scheduled Publish. NÃO usamos autoRun (rodaria em
  // dev E prod, com corrida de qual revalida). Em vez disso, um cron 1/min no SERVIDOR
  // bate em GET /cms-api/payload-jobs/run (no prod) com Bearer do CRON_SECRET → só o
  // prod processa os agendamentos e revalida o próprio cache.
  jobs: {
    access: {
      run: ({ req }: { req: { user?: unknown; headers: Headers } }): boolean => {
        if (req.user) return true;
        const secret = process.env.CRON_SECRET;
        if (!secret) return false;
        return req.headers.get("authorization") === `Bearer ${secret}`;
      },
    },
  },
});

import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import type { Block, Field } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import {
  lexicalEditor,
  EXPERIMENTAL_TableFeature,
  BlocksFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import { articleHref } from "@/lib/config";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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

const teamLayoutBlocks: Block[] = [
  // — Dinâmicos (dados ao vivo do time) —
  { slug: "teamTodayMatch", labels: { singular: "Jogo de hoje", plural: "Jogo de hoje" }, fields: [blockTitle] },
  { slug: "teamUpcoming", labels: { singular: "Próximos jogos", plural: "Próximos jogos" }, fields: [blockTitle, blockLimit] },
  { slug: "teamResults", labels: { singular: "Resultados recentes", plural: "Resultados recentes" }, fields: [blockTitle, blockLimit] },
  { slug: "teamStanding", labels: { singular: "Classificação (posição)", plural: "Classificação" }, fields: [blockTitle] },
  { slug: "teamNews", labels: { singular: "Notícias do time", plural: "Notícias do time" }, fields: [blockTitle, blockLimit] },
  { slug: "teamScorers", labels: { singular: "Artilheiros", plural: "Artilheiros" }, fields: [blockTitle, blockLimit] },
  { slug: "teamWhereToWatch", labels: { singular: "Onde assistir", plural: "Onde assistir" }, fields: [blockTitle] },
  { slug: "teamLineup", labels: { singular: "Escalação provável", plural: "Escalação" }, fields: [blockTitle] },
  { slug: "teamClusterLinks", labels: { singular: "Links do cluster (hub)", plural: "Links do cluster" }, fields: [] },
  // — Estáticos (texto autoral) —
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
];

// Uma aba por página do cluster (hub + 5 sub-rotas). Mesmos blocos em todas → composição livre.
const teamLayoutTab = (name: string, label: string): Field => ({
  name,
  label: "Layout",
  type: "blocks",
  blocks: teamLayoutBlocks,
  admin: { description: `Blocos da página "${label}". Vazio = usa o layout padrão (igual Série A).` },
});

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
            // Bloco DINÂMICO: jogos de hoje (lidos do store; nunca bate na API). O editor
            // escolhe a liga e a ORDEM (um bloco por campeonato) — como os widgets dos times.
            {
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
            },
            // Grid de cards de link (ex.: "Principais Campeonatos") — em colunas, e cada
            // card é um item do array reordenável no /cms.
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
            // Vídeo embed do YouTube. Adicione um bloco por vídeo (arraste pra reordenar).
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
        {
          name: "showSponsors",
          type: "checkbox",
          defaultValue: false,
          label: "Exibir faixa de patrocinadores nesta página",
          admin: {
            description:
              "Mostra a faixa com os patrocinadores ATIVOS abaixo do conteúdo desta página. Usado na página do Municipal.",
          },
        },
      ],
    },
    {
      slug: "teams",
      labels: { singular: "Time", plural: "Times" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "slug", "tournament", "_status"],
        description:
          "Páginas de time geridas no CMS (piloto: Série B). Identidade + SEO + layout (blocos) por página. Layout vazio = layout padrão do código (igual Série A).",
      },
      versions: { drafts: true, maxPerDoc: 30 },
      access: {
        read: ({ req: { user } }) =>
          user ? true : { _status: { equals: "published" } },
      },
      // Editar/publicar um time revalida o hub + as 5 sub-rotas na hora.
      hooks: {
        afterChange: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ doc }: any) => {
            try {
              const base = `/futebol/times/${doc.slug}`;
              for (const p of [base, `${base}/jogo-hoje`, `${base}/onde-assistir`, `${base}/escalacao`, `${base}/proximos-jogos`, `${base}/estatisticas`]) {
                revalidatePath(p);
              }
            } catch {
              /* fora de contexto de request (build/cli) */
            }
            return doc;
          },
        ],
      },
      fields: [
        { name: "name", type: "text", required: true, label: "Nome" },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { description: "URL final: /futebol/times/{slug} (ex.: criciuma)" },
        },
        {
          name: "sofascoreId",
          type: "number",
          required: true,
          label: "ID do time (Sofascore)",
          admin: { description: "ID na API esportiva — alimenta os blocos de dados ao vivo" },
        },
        {
          name: "tournament",
          type: "select",
          required: true,
          defaultValue: "serie-b",
          label: "Torneio",
          options: [
            { label: "Brasileirão Série A", value: "serie-a" },
            { label: "Brasileirão Série B", value: "serie-b" },
          ],
          admin: { description: "Define a classificação/artilharia corretas" },
        },
        {
          type: "tabs",
          tabs: [
            { label: "Hub", fields: [teamLayoutTab("layoutHub", "Hub")] },
            { label: "Jogo de hoje", fields: [teamLayoutTab("layoutJogoHoje", "Jogo de hoje")] },
            { label: "Onde assistir", fields: [teamLayoutTab("layoutOndeAssistir", "Onde assistir")] },
            { label: "Escalação", fields: [teamLayoutTab("layoutEscalacao", "Escalação")] },
            { label: "Próximos jogos", fields: [teamLayoutTab("layoutProximos", "Próximos jogos")] },
            { label: "Estatísticas", fields: [teamLayoutTab("layoutEstatisticas", "Estatísticas")] },
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
        // Live Preview: aba com o site renderizado lado a lado dentro do editor
        // (atualiza ao salvar). Mesma página /cms-preview. Só config — sem schema.
        livePreview: {
          url: ({ data }: { data: { slug?: string } }) =>
            data?.slug
              ? `/cms-preview/${data.slug}?previewSecret=${process.env.CRON_SECRET || ""}`
              : "",
          breakpoints: [
            { label: "Mobile", name: "mobile", width: 390, height: 844 },
            { label: "Tablet", name: "tablet", width: 768, height: 1024 },
            { label: "Desktop", name: "desktop", width: 1440, height: 900 },
          ],
        },
      },
      // schedulePublish: habilita "Schedule Publish" (publicar/despublicar em data/hora).
      // Usa a fila de jobs (ver `jobs` no fim do config), disparada por cron 1/min no prod.
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
        // Corpo VISUAL (editor Lexical) — o que o redator usa (negrito, títulos, listas,
        // links, imagem). Tem prioridade no render; ver postBodyHtml em articles-payload.
        {
          name: "content",
          type: "richText",
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              // Tabelas nativas no editor (botão + menu "/").
              EXPERIMENTAL_TableFeature(),
              // Imagem com campo de Alinhamento (Centro/Esquerda/Direita) na inserção.
              UploadFeature({
                collections: {
                  media: {
                    fields: [
                      {
                        name: "alignment",
                        type: "select",
                        label: "Alinhamento",
                        defaultValue: "center",
                        options: [
                          { label: "Centro", value: "center" },
                          { label: "Esquerda", value: "left" },
                          { label: "Direita", value: "right" },
                        ],
                      },
                      {
                        name: "caption",
                        type: "text",
                        label: "Legenda / crédito (opcional)",
                        admin: { description: 'Ex.: "Foto: Divulgação / FIFA". Aparece embaixo da imagem.' },
                      },
                    ],
                  },
                },
              }),
              // Blocos reutilizáveis inseríveis pelo menu "+" / "/": vídeo, colunas, destaque.
              BlocksFeature({
                blocks: [
                  {
                    slug: "video",
                    labels: { singular: "Vídeo (YouTube/Vimeo)", plural: "Vídeos" },
                    fields: [
                      {
                        name: "url",
                        type: "text",
                        required: true,
                        label: "URL do vídeo",
                        admin: { description: "Cole o link do YouTube ou Vimeo" },
                      },
                      { name: "caption", type: "text", label: "Legenda (opcional)" },
                    ],
                  },
                  {
                    slug: "columns",
                    labels: { singular: "Colunas", plural: "Colunas" },
                    fields: [
                      {
                        name: "count",
                        type: "select",
                        label: "Quantidade",
                        defaultValue: "2",
                        options: [
                          { label: "2 colunas", value: "2" },
                          { label: "3 colunas", value: "3" },
                        ],
                      },
                      { name: "col1", type: "richText", label: "Coluna 1", editor: lexicalEditor() },
                      { name: "col2", type: "richText", label: "Coluna 2", editor: lexicalEditor() },
                      {
                        name: "col3",
                        type: "richText",
                        label: "Coluna 3",
                        editor: lexicalEditor(),
                        admin: { condition: (_, s) => s?.count === "3" },
                      },
                    ],
                  },
                  {
                    slug: "callout",
                    labels: { singular: "Destaque / Aviso", plural: "Destaques" },
                    fields: [
                      {
                        name: "style",
                        type: "select",
                        label: "Estilo",
                        defaultValue: "info",
                        options: [
                          { label: "Informação (azul)", value: "info" },
                          { label: "Atenção (amarelo)", value: "warning" },
                          { label: "Sucesso (verde)", value: "success" },
                          { label: "Destaque (verde PdB)", value: "highlight" },
                          // Mesmas cores do "Comentário da Redação" do lance a lance:
                          { label: "Comentário (verde, com selo 💬)", value: "comment" },
                          { label: "Informação (verde, sem selo)", value: "comment-plain" },
                        ],
                      },
                      { name: "content", type: "richText", label: "Conteúdo", editor: lexicalEditor() },
                    ],
                  },
                  {
                    slug: "sponsorCard",
                    labels: { singular: "Patrocinador (card)", plural: "Patrocinadores (cards)" },
                    fields: [
                      {
                        name: "sponsor",
                        type: "relationship",
                        relationTo: "sponsors",
                        required: true,
                        label: "Empresa",
                        admin: { description: "Escolha um patrocinador cadastrado. O card sai clicável (link rastreado)." },
                      },
                    ],
                  },
                ],
              }),
            ],
          }),
          admin: { description: "Corpo do post (editor visual). Quando preenchido, substitui o HTML." },
        },
        // HTML legado (fallback durante a migração). Some do editor quando `content` existir.
        {
          name: "body",
          type: "code",
          admin: { language: "html", description: "Corpo em HTML (legado / fallback)" },
        },
        // Legado (texto livre). Escondido do editor: usar "Autor (perfil)" abaixo.
        // Mantido no schema/API como fallback dos ~400 posts antigos que só têm o texto.
        {
          name: "author",
          type: "text",
          defaultValue: "Redação",
          admin: { hidden: true },
        },
        {
          name: "authorProfile",
          type: "relationship",
          relationTo: "authors",
          label: "Autor (perfil)",
          admin: {
            description:
              "Selecione o autor cadastrado. Definido → o byline do post vira link para /autor/{slug} e a autoria entra no SEO. Vazio → usa o texto acima.",
          },
        },
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
    {
      slug: "authors",
      labels: { singular: "Autor", plural: "Autores" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "slug", "role", "_status"],
        description:
          "Autores/colunistas. Cada autor publica a página /autor/{slug} (bio + artigos) e pode ser ligado aos posts (byline linkável + autoria no SEO). Criar autor novo = 1 entrada aqui. Salvou = no ar.",
      },
      // Sem drafts (publica direto ao salvar): mantém o schema enxuto (uma tabela só).
      access: { read: () => true },
      // Editar/publicar um autor revalida a página dele na hora.
      hooks: {
        afterChange: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ doc }: any) => {
            try {
              if (doc?.slug) revalidatePath(`/autor/${doc.slug}`);
            } catch {
              /* fora de contexto de request (build/cli) */
            }
            return doc;
          },
        ],
      },
      fields: [
        { name: "name", type: "text", required: true, label: "Nome" },
        {
          name: "slug",
          type: "text",
          required: true,
          unique: true,
          index: true,
          admin: { description: "URL final: /autor/{slug} (ex.: ivan-alves)" },
        },
        {
          name: "role",
          type: "text",
          label: "Cargo / função",
          admin: { description: 'Ex.: "Repórter de futebol", "Editor-chefe"' },
        },
        { name: "photo", type: "upload", relationTo: "media", label: "Foto" },
        {
          name: "bio",
          type: "richText",
          label: "Biografia",
          editor: lexicalEditor(),
          admin: { description: "Quem é o autor, experiência, especialidade (ajuda no E-E-A-T)." },
        },
        {
          name: "social",
          type: "group",
          label: "Redes e contato",
          fields: [
            { name: "twitter", type: "text", label: "Twitter/X (URL)" },
            { name: "instagram", type: "text", label: "Instagram (URL)" },
            { name: "linkedin", type: "text", label: "LinkedIn (URL)" },
            { name: "email", type: "text", label: "E-mail" },
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
      slug: "matchComments",
      labels: { singular: "Comentário do jogo", plural: "Comentários do jogo" },
      admin: {
        useAsTitle: "label",
        defaultColumns: ["label", "matchId", "minute", "updatedAt"],
        description:
          "Comentários manuais injetados no lance a lance de um jogo (texto + imagem + link). Preencha o ID do jogo e o minuto; o card aparece encaixado no minuto, sem atrapalhar a API. Salvou = no ar (o lance a lance puxa no polling, ~10-15s).",
      },
      access: { read: () => true },
      fields: [
        {
          name: "matchId",
          type: "number",
          required: true,
          label: "ID do jogo (Sofascore)",
          index: true,
          admin: { description: "O número que aparece no rodapé da página do jogo (ex.: 12813014)." },
        },
        {
          name: "minute",
          type: "number",
          label: "Minuto",
          admin: { description: "Minuto do jogo onde encaixa (ex.: 37). Deixe vazio se for usar a Fase abaixo." },
        },
        {
          name: "moment",
          type: "text",
          label: "Fase (quando não há minuto)",
          admin: {
            description:
              "Use no lugar do minuto: Pré-jogo, Intervalo, Prorrogação, Fim de jogo (ou escreva livre). Posiciona no feed e aparece no lugar do minuto. Se vazio, usa o Minuto acima.",
          },
        },
        {
          name: "highlight",
          type: "checkbox",
          defaultValue: true,
          label: "Destacar como \"Comentário da Redação\"",
          admin: {
            description:
              "Ligado: mostra o cabeçalho \"💬 Comentário da Redação\" (rótulo abaixo). Desligado: só o texto/foto, sem o cabeçalho — mas nas mesmas cores do comentário.",
          },
        },
        {
          name: "label",
          type: "text",
          defaultValue: "Comentário da Redação",
          label: "Rótulo do card",
          admin: { condition: (_, s) => s?.highlight !== false, description: "Texto do cabeçalho (quando destacado)." },
        },
        {
          name: "content",
          type: "richText",
          label: "Conteúdo",
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              // Imagem no comentário (upload) + legenda; links (abrir em nova aba) já vêm no default.
              UploadFeature({
                collections: {
                  media: {
                    fields: [{ name: "caption", type: "text", label: "Legenda (opcional)" }],
                  },
                },
              }),
            ],
          }),
          admin: { description: "Texto + imagem + link (com opção de abrir em nova aba), igual ao editor dos posts." },
        },
      ],
    },
    // Jogos do municipal com VÍDEO ao vivo + comentários editáveis (layout tipo Copa).
    // Usado pra jogos que não têm lance a lance da API (ex.: transmissão de YouTube).
    {
      slug: "municipalGames",
      labels: { singular: "Jogo do municipal", plural: "Jogos do municipal" },
      admin: {
        useAsTitle: "matchup",
        defaultColumns: ["matchup", "date", "slug", "updatedAt"],
        description:
          "Página de jogo do municipal com vídeo do YouTube (embed) + comentários editáveis, no layout dos jogos da Copa. URL: /sp/santana-de-parnaiba/municipal/jogo/{slug}. Salvou = no ar.",
      },
      access: { read: () => true },
      fields: [
        {
          name: "slug",
          type: "text",
          required: true,
          index: true,
          label: "Slug da URL",
          admin: { description: "Ex.: u-parque-santana-2lstw9fr — precisa bater com o slug do jogo na lista pra virar link automático." },
        },
        { name: "matchup", type: "text", label: "Confronto (título)", admin: { description: "Ex.: U Parque x Santana" } },
        {
          type: "row",
          fields: [
            { name: "home", type: "text", label: "Mandante", admin: { width: "50%" } },
            { name: "away", type: "text", label: "Visitante", admin: { width: "50%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "date", type: "text", label: "Data", admin: { width: "33%", description: "05/07/2026" } },
            { name: "time", type: "text", label: "Horário", admin: { width: "33%", description: "09h40" } },
            { name: "roundLabel", type: "text", label: "Rodada", admin: { width: "34%", description: "9ª rodada" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "venue", type: "text", label: "Local", admin: { width: "50%" } },
            { name: "division", type: "text", label: "Divisão", admin: { width: "50%", description: "Ex.: 1ª Divisão" } },
          ],
        },
        {
          name: "youtubeUrl",
          type: "text",
          label: "Vídeo do YouTube (abaixo do placar)",
          admin: { description: "Cole o link (watch, youtu.be ou live). Aparece grande no meio, abaixo do placar." },
        },
        {
          type: "row",
          fields: [
            { name: "homeLineup", type: "textarea", label: "Escalação mandante (1 por linha)", admin: { width: "50%" } },
            { name: "awayLineup", type: "textarea", label: "Escalação visitante (1 por linha)", admin: { width: "50%" } },
          ],
        },
        {
          name: "content",
          type: "richText",
          label: "Textos e comentários (abaixo do vídeo)",
          editor: lexicalEditor({
            features: ({ defaultFeatures }) => [
              ...defaultFeatures,
              UploadFeature({ collections: { media: { fields: [{ name: "caption", type: "text", label: "Legenda (opcional)" }] } } }),
              BlocksFeature({
                blocks: [
                  {
                    slug: "callout",
                    labels: { singular: "Comentário / Destaque", plural: "Comentários" },
                    fields: [
                      {
                        name: "style",
                        type: "select",
                        label: "Estilo",
                        defaultValue: "comment",
                        options: [
                          { label: "Comentário (verde, com selo 💬)", value: "comment" },
                          { label: "Informação (verde, sem selo)", value: "comment-plain" },
                          { label: "Destaque (verde PdB)", value: "highlight" },
                          { label: "Informação (azul)", value: "info" },
                          { label: "Atenção (amarelo)", value: "warning" },
                        ],
                      },
                      { name: "content", type: "richText", label: "Conteúdo", editor: lexicalEditor() },
                    ],
                  },
                  {
                    slug: "sponsorCard",
                    labels: { singular: "Patrocinador (card)", plural: "Patrocinadores (cards)" },
                    fields: [
                      {
                        name: "sponsor",
                        type: "relationship",
                        relationTo: "sponsors",
                        required: true,
                        label: "Empresa",
                        admin: { description: "Escolha um patrocinador cadastrado. O card sai clicável (link rastreado)." },
                      },
                    ],
                  },
                ],
              }),
            ],
          }),
          admin: { description: "O 'lance a lance' editorial: escreva textos, comentários (bloco verde) e cards de patrocinador que aparecem abaixo do vídeo." },
        },
        {
          name: "showSponsors",
          type: "checkbox",
          defaultValue: true,
          label: "Exibir faixa de patrocinadores nesta página",
          admin: { description: "Mostra a faixa com os patrocinadores ATIVOS no rodapé da página do jogo. Desmarque pra ocultar." },
        },
        {
          name: "banners",
          type: "array",
          label: "Banners nesta página",
          admin: {
            description:
              "Posicione banners grandes na página do jogo. Escolha o patrocinador (tipo Banner) e onde ele aparece.",
          },
          fields: [
            {
              name: "sponsor",
              type: "relationship",
              relationTo: "sponsors",
              required: true,
              label: "Patrocinador",
              filterOptions: () => ({ format: { equals: "banner" } }),
            },
            {
              name: "position",
              type: "select",
              required: true,
              defaultValue: "above-score",
              label: "Posição",
              options: [
                { label: "Topo da página", value: "top" },
                { label: "Acima do placar", value: "above-score" },
                { label: "Acima do player (vídeo)", value: "above-player" },
                { label: "Rodapé (junto da faixa)", value: "footer" },
              ],
            },
          ],
        },
      ],
    },
    // Patrocinadores: cadastro único, reusado em cards (no editor) e faixas. Os links
    // passam pelo /parceiro/{slug} (conta cliques + UTM) e saem com rel="sponsored" (SEO).
    {
      slug: "sponsors",
      labels: { singular: "Patrocinador", plural: "Patrocinadores" },
      admin: {
        useAsTitle: "name",
        defaultColumns: ["name", "format", "active", "clicks", "updatedAt"],
        description:
          "Cadastre a empresa 1x. Tipo 'Card' aparece na faixa do rodapé; tipo 'Banner' você posiciona na página do jogo. Marque 'Ativo' pra publicar. Cliques contados via /parceiro/{slug}.",
      },
      access: { read: () => true },
      fields: [
        { name: "name", type: "text", required: true, label: "Nome" },
        {
          name: "slug",
          type: "text",
          required: true,
          index: true,
          label: "Slug",
          admin: { description: "Usado na URL /parceiro/{slug} (ex.: grafica-giga)." },
        },
        { name: "tagline", type: "textarea", label: "Slogan / descrição curta" },
        {
          name: "format",
          type: "select",
          defaultValue: "card",
          label: "Tipo de patrocínio",
          options: [
            { label: "Card pequeno (rodapé — logo grande)", value: "card" },
            { label: "Banner grande (imagem larga — posicionável)", value: "banner" },
          ],
          admin: {
            description:
              "Card = tile de logo na faixa do rodapé. Banner = imagem larga que você posiciona (topo, acima do placar, acima do player).",
          },
        },
        {
          name: "logo",
          type: "upload",
          relationTo: "media",
          label: "Logo (card)",
          admin: { description: "Logo do card pequeno. Aparece grande, cobrindo o card." },
        },
        {
          name: "banner",
          type: "upload",
          relationTo: "media",
          label: "Banner (imagem larga)",
          admin: {
            description:
              "Esticado: ~1200px de largura (o site tem até 1240px), altura à vontade (ex.: 1200×150 a 1200×250). Centralizado: qualquer tamanho, aparece no tamanho natural (até ~150px de altura). Usado quando o tipo é 'Banner grande'.",
            condition: (_, s) => s?.format === "banner",
          },
        },
        {
          name: "bannerCentered",
          type: "checkbox",
          defaultValue: false,
          label: "Imagem centralizada (fundo transparente, não estica)",
          admin: {
            description:
              "Marque pra banners finos: a imagem fica centralizada no tamanho natural, com fundo transparente (na cor do site). Desmarcado = a imagem estica pra ocupar toda a largura.",
            condition: (_, s) => s?.format === "banner",
          },
        },
        {
          type: "row",
          fields: [
            { name: "site", type: "text", label: "Site", admin: { width: "50%" } },
            { name: "whatsapp", type: "text", label: "WhatsApp (link ou número)", admin: { width: "50%" } },
          ],
        },
        {
          type: "row",
          fields: [
            { name: "instagram", type: "text", label: "Instagram (@ ou link)", admin: { width: "50%" } },
            { name: "facebook", type: "text", label: "Facebook (link)", admin: { width: "50%" } },
          ],
        },
        { name: "active", type: "checkbox", defaultValue: true, label: "Ativo (aparece nas faixas de patrocinadores)" },
        {
          name: "clicks",
          type: "number",
          defaultValue: 0,
          label: "Cliques",
          admin: { readOnly: true, description: "Contador de cliques no link /parceiro/{slug}." },
        },
      ],
    },
  ],
  // Fila de jobs — necessária pro Scheduled Publish. Sem autoRun (rodaria em dev E
  // prod, com corrida de qual revalida). Um cron 1/min no SERVIDOR bate em
  // GET /cms-api/payload-jobs/run (no prod) com Bearer do CRON_SECRET → só o prod
  // processa os agendamentos e revalida o próprio cache.
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

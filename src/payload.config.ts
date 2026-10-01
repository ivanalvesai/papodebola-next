import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import type { Field } from "payload";
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
import { pt } from "@payloadcms/translations/languages/pt";
import { pageBlocks, TEAM_LAYOUT_BLOCKS } from "@/cms/blocks";
import { pagesCollection } from "@/cms/collections/pages";
import { pageTemplatesCollection } from "@/cms/collections/page-templates";
import { snippetsCollection } from "@/cms/collections/snippets";
import { pageTextsCollection } from "@/cms/collections/page-texts";
import { usersCollection } from "@/cms/collections/users";
import { siteSettingsGlobal } from "@/cms/globals/site-settings";
import { adminOnly, anyLogged, editorOrAdmin, hiddenUnlessEditor, publishedOrLogged, seoOrEditorOrAdmin } from "@/cms/lib/access";
import { lockFieldsExceptSeo } from "@/cms/lib/lock-fields";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { isAutosave } from "@/cms/lib/is-autosave";
import { previewUrl, PREVIEW_BREAKPOINTS } from "@/cms/lib/preview-url";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);


// Uma aba por página do cluster (hub + 5 sub-rotas). Mesmos blocos em todas → composição livre.
const teamLayoutTab = (name: string, label: string, aba: string): Field[] => [
  {
    name: `preview_${name}`,
    type: "ui",
    admin: { components: { Field: "@/cms/components/team-preview-link#TeamPreviewLink" }, custom: { aba } },
  },
  {
    name,
    label: "Layout",
    labels: { singular: "Bloco", plural: "Blocos" },
    type: "blocks",
    blocks: TEAM_LAYOUT_BLOCKS,
    admin: { description: `Blocos da página "${label}". Vazio = página padrão do site.` },
  },
];

// SEO de uma aba do time (meta title/description). O da aba Hub mantém o name "seo"
// (mesmas colunas no banco); as outras abas usam seoJogoHoje, seoOndeAssistir etc.
const teamSeoGroup = (name: string): Field => ({
  name,
  type: "group",
  label: "SEO desta página",
  fields: [
    { name: "metaTitle", type: "text", label: "Título (meta title)" },
    { name: "metaDescription", type: "textarea", label: "Descrição (meta description)" },
  ],
});

// Payload (Fase 1 da migração). Admin em /cms e API em /cms-api pra NÃO colidir
// com o /admin (404 no middleware) nem com as rotas em /api do app. Postgres.
// Editor rich text COMPLETO (mesmos cards: video, Instagram, X, escalacao, colunas,
// destaque, tabela) — compartilhado por POSTS e PAGINAS do CMS (bloco Texto).
const richTextEditor = lexicalEditor({
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
                    slug: "instagram",
                    labels: { singular: "Post do Instagram", plural: "Posts do Instagram" },
                    fields: [
                      {
                        name: "url",
                        type: "text",
                        required: true,
                        label: "Link do post do Instagram",
                        admin: {
                          description:
                            "Cole o link do post ou reel (ex.: https://www.instagram.com/p/XXXXXXX/). O card mostra a foto e a legenda completa, igual ao do ge.",
                        },
                      },
                      {
                        name: "caption",
                        type: "textarea",
                        label: "Legenda de reserva (opcional)",
                        admin: {
                          description:
                            "Texto exibido só se o Instagram não carregar (rede/bloqueio). Opcional — o normal é o próprio card do Instagram trazer a legenda.",
                        },
                      },
                    ],
                  },
                  {
                    slug: "tweet",
                    labels: { singular: "Post do X (Twitter)", plural: "Posts do X (Twitter)" },
                    fields: [
                      {
                        name: "url",
                        type: "text",
                        required: true,
                        label: "Link do post do X",
                        admin: {
                          description:
                            "Cole o link do post do X/Twitter (ex.: https://x.com/usuario/status/123456789). O card mostra o post oficial, igual ao do ge.",
                        },
                      },
                      {
                        name: "caption",
                        type: "textarea",
                        label: "Texto de reserva (opcional)",
                        admin: {
                          description:
                            "Exibido só se o X não carregar (rede/bloqueio). Opcional — o normal é o próprio card do X trazer o conteúdo do post.",
                        },
                      },
                    ],
                  },
                  {
                    slug: "lineup",
                    labels: { singular: "Escalação no campo", plural: "Escalações no campo" },
                    fields: [
                      {
                        name: "team",
                        type: "text",
                        required: true,
                        label: "Time",
                        admin: {
                          components: {
                            Field: "@/components/cms/lineup-team-field#LineupTeamField",
                          },
                        },
                      },
                      {
                        name: "formation",
                        type: "text",
                        required: true,
                        label: "Formação",
                        admin: { description: "Ex.: 4-3-3, 4-2-3-1, 3-5-2. Define como os jogadores se posicionam no campo." },
                      },
                      {
                        name: "label",
                        type: "text",
                        label: "Rótulo",
                        defaultValue: "Provável",
                        admin: { description: 'Ex.: "Provável" ou "Confirmada". Aparece ao lado da formação.' },
                      },
                      {
                        name: "players",
                        type: "array",
                        label: "Jogadores (do goleiro para o ataque)",
                        minRows: 1,
                        maxRows: 11,
                        admin: { description: "Liste os 11 titulares NA ORDEM: goleiro primeiro, depois defensores, meias e atacantes. É essa ordem que posiciona no campo." },
                        fields: [
                          { name: "name", type: "text", required: true, label: "Nome" },
                          { name: "number", type: "text", label: "Número (opcional)" },
                          {
                            name: "playerId",
                            type: "text",
                            label: "ID do jogador (foto, opcional)",
                            admin: { description: "ID na API esportiva (Sofascore). Preenchido → mostra a FOTO do jogador no campo. Vazio → mostra só o número." },
                          },
                        ],
                      },
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
                  // Card de palpite/previsão (ex.: "Previsão de placar: Espanha 1 x 0 Bélgica — Odd 7,50 na Betano").
                  {
                    slug: "prediction",
                    labels: { singular: "Previsão / Palpite (card)", plural: "Previsões / Palpites" },
                    fields: [
                      { name: "label", type: "text", label: "Rótulo", defaultValue: "Previsão de placar" },
                      { name: "text", type: "text", required: true, label: "Palpite", admin: { description: 'Ex.: "Espanha 1 x 0 Bélgica" ou "Menos de 2.5 gols"' } },
                      { name: "odd", type: "text", label: "Odd", admin: { description: 'Ex.: "7,50"' } },
                      { name: "house", type: "text", label: "Casa de aposta", admin: { description: 'Ex.: "Betano"' } },
                      { name: "url", type: "text", label: "Link de afiliado (opcional)" },
                      { name: "note", type: "textarea", label: "Análise (opcional)" },
                      { name: "cor", type: "select", label: "Cor do card", defaultValue: "verde", options: [{ label: "Verde (padrão)", value: "verde" }, { label: "Azul", value: "azul" }, { label: "Vermelho", value: "vermelho" }, { label: "Dourado", value: "dourado" }, { label: "Roxo", value: "roxo" }, { label: "Escuro", value: "escuro" }] },
                    ],
                  },
                  // Card de destaque com estatísticas (ex.: "Destaque da Espanha: Oyarzabal + dados").
                  {
                    slug: "statCard",
                    labels: { singular: "Destaque com dados (card)", plural: "Destaques com dados" },
                    fields: [
                      { name: "title", type: "text", required: true, label: "Título", admin: { description: 'Ex.: "Destaque da Espanha"' } },
                      { name: "subtitle", type: "text", label: "Subtítulo", admin: { description: 'Ex.: nome do jogador, "Mikel Oyarzabal"' } },
                      { name: "imageUrl", type: "text", label: "Imagem (URL, opcional)", admin: { description: "Cole a URL de uma foto ou escudo (opcional)." } },
                      {
                        name: "rows",
                        type: "array",
                        label: "Dados (rótulo + valor)",
                        fields: [
                          { name: "label", type: "text", label: "Rótulo" },
                          { name: "value", type: "text", label: "Valor" },
                        ],
                      },
                      { name: "cor", type: "select", label: "Cor do card", defaultValue: "verde", options: [{ label: "Verde (padrão)", value: "verde" }, { label: "Azul", value: "azul" }, { label: "Vermelho", value: "vermelho" }, { label: "Dourado", value: "dourado" }, { label: "Roxo", value: "roxo" }, { label: "Escuro", value: "escuro" }] },
                    ],
                  },
                  // Botão call-to-action (ex.: "Apostar na Betano"). rel=sponsored nofollow.
                  {
                    slug: "ctaButton",
                    labels: { singular: "Botão (call-to-action)", plural: "Botões" },
                    fields: [
                      { name: "label", type: "text", required: true, label: "Texto do botão" },
                      { name: "url", type: "text", required: true, label: "Link" },
                      {
                        name: "style",
                        type: "select",
                        label: "Estilo",
                        defaultValue: "primary",
                        options: [
                          { label: "Preenchido", value: "primary" },
                          { label: "Contorno", value: "outline" },
                        ],
                      },
                      { name: "cor", type: "select", label: "Cor do botão", defaultValue: "verde", options: [{ label: "Verde (padrão)", value: "verde" }, { label: "Azul", value: "azul" }, { label: "Vermelho", value: "vermelho" }, { label: "Dourado", value: "dourado" }, { label: "Roxo", value: "roxo" }, { label: "Escuro", value: "escuro" }] },
                    ],
                  },
                  // Tabela de seleções/times no visual da Copa (barra verde + escudo por
                  // linha). Feita pra listas que CRESCEM (ex.: classificados pra Copa
                  // Feminina 2027, até fechar as 32): o editor só adiciona linhas no /cms.
                  // Escudo: id do time na API esportiva (mesmo /api/team-img dos escudos).
                  {
                    slug: "teamsTable",
                    labels: { singular: "Tabela de seleções/times", plural: "Tabelas de seleções/times" },
                    fields: [
                      {
                        name: "title",
                        type: "text",
                        label: "Título (barra verde)",
                        admin: { description: 'Ex.: "Seleções classificadas (18 de 32)". Vazio = tabela sem barra.' },
                      },
                      { name: "col1Label", type: "text", label: "Rótulo da 1ª coluna", defaultValue: "Seleção" },
                      { name: "col2Label", type: "text", label: "Rótulo da 2ª coluna", defaultValue: "Confederação" },
                      {
                        name: "col3Label",
                        type: "text",
                        label: "Rótulo da 3ª coluna",
                        admin: { description: "Vazio = tabela com só duas colunas." },
                      },
                      {
                        name: "numbered",
                        type: "checkbox",
                        label: "Numerar as linhas (#)",
                        defaultValue: true,
                      },
                      {
                        name: "rows",
                        type: "array",
                        label: "Linhas",
                        admin: { description: "Arraste para reordenar. Adicione uma linha a cada nova seleção." },
                        fields: [
                          { name: "name", type: "text", required: true, label: "Seleção / time" },
                          {
                            name: "teamId",
                            type: "text",
                            label: "ID do escudo (opcional)",
                            admin: {
                              description:
                                "ID do time na API esportiva — serve o escudo de /api/team-img/{id}. Ex.: 7411 = Brasil (feminino). Vazio = linha sem escudo.",
                            },
                          },
                          { name: "col2", type: "text", label: "2ª coluna" },
                          { name: "col3", type: "text", label: "3ª coluna" },
                          {
                            name: "highlight",
                            type: "checkbox",
                            label: "Destacar a linha (faixa verde)",
                          },
                        ],
                      },
                      { name: "note", type: "text", label: "Nota abaixo da tabela (opcional)" },
                    ],
                  },
                  // ── Blocos da vertical de APOSTAS (guia /apostas/casas-de-apostas) ──
                  // Tabela comparativa de casas: a ORDEM do array é a posição (#) na tabela.
                  // Linha sem nota sai como "Em avaliação" (nunca inventar nota — regra do brief).
                  {
                    slug: "bettingTable",
                    labels: { singular: "Tabela de casas de apostas", plural: "Tabelas de casas de apostas" },
                    fields: [
                      { name: "title", type: "text", label: "Título acima da tabela (opcional)" },
                      {
                        name: "emptyScoreLabel",
                        type: "text",
                        label: "Texto quando não há nota",
                        defaultValue: "Em avaliação",
                      },
                      {
                        name: "rows",
                        type: "array",
                        label: "Casas",
                        admin: { description: "Arraste para reordenar — a ordem define o número (#) da linha." },
                        fields: [
                          { name: "name", type: "text", required: true, label: "Casa" },
                          { name: "logo", type: "upload", relationTo: "media", label: "Logo (opcional)" },
                          {
                            name: "score",
                            type: "text",
                            label: "Nota",
                            admin: { description: 'Ex.: "9.2". Vazio = mostra "Em avaliação".' },
                          },
                          { name: "license", type: "text", label: "Licença", admin: { description: 'Ex.: "SPA — Portaria 249/2025"' } },
                          { name: "payment", type: "text", label: "Pagamento", admin: { description: 'Ex.: "Pix"' } },
                          { name: "highlight", type: "text", label: "Diferencial" },
                          {
                            name: "href",
                            type: "text",
                            label: "Link (opcional)",
                            admin: {
                              description:
                                "Interno (/apostas/betano) sai normal; externo (https://...) sai como afiliado (sponsored nofollow).",
                            },
                          },
                        ],
                      },
                    ],
                  },
                  // Card de casa de apostas: serve pro review completo (com nota, prints,
                  // prós/contras e 2 CTAs) e pro card "em avaliação" (sem nota, 1 CTA).
                  {
                    slug: "bettingReview",
                    labels: { singular: "Casa de apostas (card)", plural: "Casas de apostas (cards)" },
                    fields: [
                      { name: "name", type: "text", required: true, label: "Nome da casa" },
                      { name: "rank", type: "text", label: "Posição (opcional)", admin: { description: 'Ex.: "1"' } },
                      { name: "logo", type: "upload", relationTo: "media", label: "Logo" },
                      {
                        name: "score",
                        type: "text",
                        label: "Nota",
                        admin: { description: 'Ex.: "9.2". Vazio = card sai como "Em avaliação" (sem badge de nota).' },
                      },
                      { name: "license", type: "text", label: "Licença (SPA)" },
                      { name: "ra", type: "text", label: "Reclame Aqui", admin: { description: 'Ex.: "Nota 7.4/10 — 89% de resposta"' } },
                      { name: "raUrl", type: "text", label: "Link do Reclame Aqui" },
                      { name: "raProof", type: "upload", relationTo: "media", label: "Print do Reclame Aqui" },
                      {
                        name: "images",
                        type: "array",
                        label: "Imagens (print do app, mercados, saque…)",
                        fields: [
                          { name: "image", type: "upload", relationTo: "media" },
                          { name: "caption", type: "text", label: "Legenda" },
                        ],
                      },
                      { name: "summary", type: "richText", label: "Análise", editor: lexicalEditor() },
                      { name: "prosTitle", type: "text", label: "Título dos prós", defaultValue: "Prós" },
                      { name: "pros", type: "array", label: "Prós", fields: [{ name: "item", type: "text" }] },
                      { name: "consTitle", type: "text", label: "Título dos contras", defaultValue: "Contras" },
                      { name: "cons", type: "array", label: "Contras", fields: [{ name: "item", type: "text" }] },
                      { name: "ctaLabel", type: "text", label: "CTA de afiliado (texto)", defaultValue: "Abrir conta" },
                      {
                        name: "ctaUrl",
                        type: "text",
                        label: "CTA de afiliado (link)",
                        admin: { description: "Link de tracking real. Sem link, o botão NÃO é renderizado (nada de placeholder no ar)." },
                      },
                      { name: "linkLabel", type: "text", label: "Link interno (texto)", defaultValue: "Ver análise completa" },
                      { name: "linkHref", type: "text", label: "Link interno (URL)", admin: { description: "Ex.: /apostas/betano" } },
                      { name: "cor", type: "select", label: "Cor do card", defaultValue: "verde", options: [{ label: "Verde (padrão)", value: "verde" }, { label: "Azul", value: "azul" }, { label: "Vermelho", value: "vermelho" }, { label: "Dourado", value: "dourado" }, { label: "Roxo", value: "roxo" }, { label: "Escuro", value: "escuro" }] },
                    ],
                  },
                  // Perguntas frequentes (accordion <details>). Também vira schema FAQPage.
                  {
                    slug: "faq",
                    labels: { singular: "Perguntas frequentes", plural: "Perguntas frequentes" },
                    fields: [
                      { name: "title", type: "text", label: "Título", defaultValue: "Perguntas Frequentes" },
                      { name: "firstOpen", type: "checkbox", label: "Primeira pergunta já aberta", defaultValue: true },
                      {
                        name: "items",
                        type: "array",
                        label: "Perguntas",
                        fields: [
                          { name: "question", type: "text", required: true, label: "Pergunta" },
                          { name: "answer", type: "richText", label: "Resposta", editor: lexicalEditor() },
                        ],
                      },
                    ],
                  },
                  // Mini-índice com âncoras. Por padrão se monta sozinho a partir dos H2 do texto.
                  {
                    slug: "toc",
                    labels: { singular: "Nesta página (índice)", plural: "Índices" },
                    fields: [
                      { name: "title", type: "text", label: "Título", defaultValue: "Nesta página" },
                      {
                        name: "auto",
                        type: "checkbox",
                        label: "Montar automaticamente com os títulos (H2) do texto",
                        defaultValue: true,
                      },
                      {
                        name: "items",
                        type: "array",
                        label: "Itens (manual)",
                        admin: { condition: (_, s) => !s?.auto },
                        fields: [
                          { name: "label", type: "text", required: true, label: "Texto" },
                          { name: "anchor", type: "text", label: "Âncora ou URL", admin: { description: 'Ex.: "#ranking-completo"' } },
                        ],
                      },
                    ],
                  },
                  // Bloco "Sobre o Autor" (E-E-A-T): foto + bio da collection Autores.
                  {
                    slug: "authorBox",
                    labels: { singular: "Sobre o autor", plural: "Sobre o autor" },
                    fields: [
                      { name: "author", type: "relationship", relationTo: "authors", required: true, label: "Autor" },
                      { name: "intro", type: "text", label: "Linha acima (opcional)", admin: { description: 'Ex.: "Conteúdo criado por"' } },
                      { name: "title", type: "text", label: "Título do box", defaultValue: "Sobre o Autor" },
                    ],
                  },
                  // Box de prós e contras (✅ / ❌) em duas colunas.
                  {
                    slug: "prosCons",
                    labels: { singular: "Prós e Contras", plural: "Prós e Contras" },
                    fields: [
                      { name: "prosTitle", type: "text", label: "Título dos prós", defaultValue: "Vantagens" },
                      { name: "pros", type: "array", label: "Prós", fields: [{ name: "item", type: "text" }] },
                      { name: "consTitle", type: "text", label: "Título dos contras", defaultValue: "Desvantagens" },
                      { name: "cons", type: "array", label: "Contras", fields: [{ name: "item", type: "text" }] },
                      { name: "cor", type: "select", label: "Cor do card", defaultValue: "verde", options: [{ label: "Verde (padrão)", value: "verde" }, { label: "Azul", value: "azul" }, { label: "Vermelho", value: "vermelho" }, { label: "Dourado", value: "dourado" }, { label: "Roxo", value: "roxo" }, { label: "Escuro", value: "escuro" }] },
                    ],
                  },
                ],
              }),
            ],
          });

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
    meta: { titleSuffix: " · Papo de Bola CMS" },
    livePreview: { breakpoints: PREVIEW_BREAKPOINTS },
  },
  i18n: { supportedLanguages: { pt }, fallbackLanguage: "pt" },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    // Só o dev sincroniza o schema (PAYLOAD_DB_PUSH=true no .env.local do dev).
    // Prod usa o schema já criado pelo dev (banco é compartilhado). Antes da Fase 3
    // (notícias com dados) migramos pra migrations formais (prodMigrations).
    push: process.env.PAYLOAD_DB_PUSH === "true",
  }),
  collections: [
    {
      slug: "media",
      labels: { singular: "Mídia", plural: "Mídias" },
      admin: { group: "Conteúdo" },
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
      access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin },
      fields: [{ name: "alt", type: "text" }],
    },
    pagesCollection(richTextEditor),
    pageTemplatesCollection(richTextEditor),
    snippetsCollection(richTextEditor),
    pageTextsCollection,
    {
      slug: "teams",
      labels: { singular: "Time", plural: "Times" },
      admin: {
        useAsTitle: "name",
        group: "Futebol",
        livePreview: { url: ({ data }: { data: { slug?: string } }) => previewUrl("time", data?.slug, "hub") },
        preview: (data: { slug?: string }) => previewUrl("time", data?.slug, "hub"),
        defaultColumns: ["name", "slug", "tournament", "_status"],
        description:
          "Páginas de time geridas no CMS. Aba de layout vazia = página padrão do site. SEO de cada aba fica dentro da aba.",
      },
      versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 },
      // seo: pode salvar, mas só os campos de SEO (lockFieldsExceptSeo nos fields).
      access: { read: publishedOrLogged, create: editorOrAdmin, update: seoOrEditorOrAdmin, delete: adminOnly },
      // Editar/publicar um time revalida o hub + as 5 sub-rotas na hora.
      hooks: {
        afterChange: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ doc, req }: any) => {
            if (isAutosave(req)) return doc;
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
      fields: lockFieldsExceptSeo([
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
            { label: "Europa (sem tabela do Brasileirão)", value: "europa" },
          ],
          admin: { description: "Define a classificação/artilharia corretas" },
        },
        {
          type: "tabs",
          tabs: [
            { label: "Hub", fields: [...teamLayoutTab("layoutHub", "Hub", "hub"), teamSeoGroup("seo")] },
            { label: "Jogo de hoje", fields: [...teamLayoutTab("layoutJogoHoje", "Jogo de hoje", "jogo-hoje"), teamSeoGroup("seoJogoHoje")] },
            { label: "Onde assistir", fields: [...teamLayoutTab("layoutOndeAssistir", "Onde assistir", "onde-assistir"), teamSeoGroup("seoOndeAssistir")] },
            { label: "Escalação", fields: [...teamLayoutTab("layoutEscalacao", "Escalação", "escalacao"), teamSeoGroup("seoEscalacao")] },
            { label: "Próximos jogos", fields: [...teamLayoutTab("layoutProximos", "Próximos jogos", "proximos-jogos"), teamSeoGroup("seoProximos")] },
            { label: "Estatísticas", fields: [...teamLayoutTab("layoutEstatisticas", "Estatísticas", "estatisticas"), teamSeoGroup("seoEstatisticas")] },
          ],
        },
      ]),
    },
    {
      slug: "posts",
      labels: { singular: "Post", plural: "Posts" },
      admin: {
        useAsTitle: "title",
        defaultColumns: ["title", "category", "publishedDate", "_status"],
        // Botão "Preview" no editor → abre o post (mesmo rascunho) renderizado no
        // layout real do site, numa página dedicada (não toca nas páginas públicas/ISR).
        group: "Conteúdo",
        preview: (doc: { slug?: string }) => (doc?.slug ? previewUrl("post", doc.slug) : null),
        // Live Preview: aba com o site renderizado lado a lado dentro do editor
        // (atualiza ao salvar). Mesma página /cms-preview. Só config — sem schema.
        livePreview: {
          url: ({ data }: { data: { slug?: string } }) => (data?.slug ? previewUrl("post", data.slug) : ""),
          breakpoints: PREVIEW_BREAKPOINTS,
        },
      },
      // schedulePublish: habilita "Schedule Publish" (publicar/despublicar em data/hora).
      // Usa a fila de jobs (ver `jobs` no fim do config), disparada por cron 1/min no prod.
      versions: { drafts: { schedulePublish: true }, maxPerDoc: 20 },
      // seo: pode salvar, mas só os campos de SEO (lockFieldsExceptSeo nos fields).
      access: { read: publishedOrLogged, create: editorOrAdmin, update: seoOrEditorOrAdmin, delete: editorOrAdmin },
      // 3e: edição/publicação no /cms revalida o site na hora (substitui o mu-plugin).
      hooks: {
        // Ao PUBLICAR sem "Data de publicação" preenchida, carimba a data com o horário
        // da publicação. Sem isto, um post publicado com data vazia (NULL) sobe pro TOPO
        // da home (Postgres ordena `data DESC` como NULLS FIRST) e vira o destaque errado.
        beforeChange: [
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          ({ data, originalDoc }: any) => {
            if (
              data?._status === "published" &&
              !data?.publishedDate &&
              !originalDoc?.publishedDate
            ) {
              data.publishedDate = new Date().toISOString();
            }
            return data;
          },
        ],
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
      fields: lockFieldsExceptSeo([
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
          editor: richTextEditor,
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
      ]),
    },
    {
      slug: "authors",
      labels: { singular: "Autor", plural: "Autores" },
      admin: {
        group: "Conteúdo",
        useAsTitle: "name",
        hidden: hiddenUnlessEditor,
        defaultColumns: ["name", "slug", "role", "_status"],
        description:
          "Autores/colunistas. Cada autor publica a página /autor/{slug} (bio + artigos) e pode ser ligado aos posts (byline linkável + autoria no SEO). Criar autor novo = 1 entrada aqui. Salvou = no ar.",
      },
      // Sem drafts (publica direto ao salvar): mantém o schema enxuto (uma tabela só).
      access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: adminOnly },
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
        group: "Futebol",
        useAsTitle: "label",
        hidden: hiddenUnlessEditor,
        defaultColumns: ["label", "matchId", "minute", "updatedAt"],
        description:
          "Comentários manuais injetados no lance a lance de um jogo (texto + imagem + link). Preencha o ID do jogo e o minuto; o card aparece encaixado no minuto, sem atrapalhar a API. Salvou = no ar (o lance a lance puxa no polling, ~10-15s).",
      },
      access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin },
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
        group: "Futebol",
        useAsTitle: "matchup",
        hidden: hiddenUnlessEditor,
        // A DATA aparece na coluna "date" da lista → distingue jogos dos mesmos times em
        // rodadas diferentes. (useAsTitle precisa ser campo real; virtual quebra o Payload.)
        defaultColumns: ["matchup", "date", "time", "roundLabel", "updatedAt"],
        description:
          "Página de jogo do municipal com vídeo do YouTube (embed) + comentários editáveis, no layout dos jogos da Copa. URL: /sp/santana-de-parnaiba/municipal/jogo/{data}/{slug}. Salvou = no ar. Use a coluna Data pra achar o jogo certo.",
      },
      access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin },
      fields: [
        {
          name: "slug",
          type: "text",
          required: true,
          index: true,
          label: "Slug da URL",
          admin: { description: "Ex.: u-parque-santana — o par de times (sem a data). A data vem do campo Data; a URL final é /jogo/{data}/{slug}." },
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
        {
          name: "seo",
          type: "group",
          label: "SEO e cabeçalhos",
          admin: {
            description:
              "Controle os títulos da página. Deixe vazio pra usar o padrão automático (ex.: H1 = 'Time x Time · Fase · Futebol Municipal de Santana de Parnaíba').",
          },
          fields: [
            {
              name: "h1",
              type: "text",
              label: "Título principal (H1)",
              admin: { description: "Ex.: União do Parque x S.C. Santana - Primeira Fase. Vazio = gera automático." },
            },
            {
              type: "row",
              fields: [
                { name: "headingLineups", type: "text", label: "H2 — Escalações", admin: { width: "33%", placeholder: "Escalações" } },
                { name: "headingPlayByPlay", type: "text", label: "H2 — Lance a lance", admin: { width: "34%", placeholder: "Lance a lance" } },
                { name: "headingGoals", type: "text", label: "H2 — Gols", admin: { width: "33%", placeholder: "Gols" } },
              ],
            },
            { name: "metaTitle", type: "text", label: "SEO — Título (meta title)", admin: { description: "Vazio = gera automático." } },
            { name: "metaDescription", type: "textarea", label: "SEO — Descrição (meta description)", admin: { description: "Vazio = gera automático." } },
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
        group: "Comercial",
        useAsTitle: "name",
        hidden: hiddenUnlessEditor,
        defaultColumns: ["name", "format", "active", "clicks", "updatedAt"],
        description:
          "Cadastre a empresa 1x. Tipo 'Card' aparece na faixa do rodapé; tipo 'Banner' você posiciona na página do jogo. Marque 'Ativo' pra publicar. Cliques contados via /parceiro/{slug}.",
      },
      access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: adminOnly },
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
        {
          name: "linkTo",
          type: "select",
          defaultValue: "auto",
          label: "Pra onde o card/banner leva ao clicar",
          options: [
            { label: "Automático (site → WhatsApp → Instagram → Facebook)", value: "auto" },
            { label: "Site", value: "site" },
            { label: "WhatsApp", value: "whatsapp" },
            { label: "Instagram", value: "instagram" },
            { label: "Facebook", value: "facebook" },
            { label: "URL personalizada", value: "custom" },
          ],
          admin: { description: "Escolha o destino do clique. Ex.: 'WhatsApp' abre a conversa mesmo tendo site cadastrado." },
        },
        {
          name: "linkCustom",
          type: "text",
          label: "URL personalizada",
          admin: {
            description: "Cole o link completo (https://...). Usado quando o destino é 'URL personalizada'.",
            condition: (_, s) => s?.linkTo === "custom",
          },
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
    // Usuários por último: o painel ordena os grupos pela 1ª coleção de cada um
    // (Conteúdo / Futebol / Comercial / Sistema).
    usersCollection,
  ],
  globals: [siteSettingsGlobal],
  // Formulários (plugin oficial): collections `forms` e `form-submissions`.
  // Overrides de labels/admin/access são mesclados por cima dos padrões do plugin.
  plugins: [
    formBuilderPlugin({
      fields: {
        text: true, textarea: true, select: true, radio: true, email: true, checkbox: true, number: true, message: true,
        state: false, country: false, payment: false, date: false,
      },
      redirectRelationships: ["pages"],
      defaultToEmail: "contato@papodebola.com.br",
      formOverrides: {
        labels: { singular: "Formulário", plural: "Formulários" },
        admin: { group: "Conteúdo", useAsTitle: "title", hidden: hiddenUnlessEditor },
        access: { read: anyLogged, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin },
      },
      formSubmissionOverrides: {
        labels: { singular: "Resposta de formulário", plural: "Respostas de formulário" },
        admin: { group: "Conteúdo", hidden: hiddenUnlessEditor },
        access: { read: editorOrAdmin, delete: adminOnly },
      },
    }),
  ],
  // E-mail (respostas de formulário) só com SMTP configurado; sem SMTP_HOST o Payload
  // usa o adapter de console (só loga) e as respostas continuam salvas no CMS.
  ...(process.env.SMTP_HOST
    ? {
        email: nodemailerAdapter({
          defaultFromAddress: process.env.SMTP_FROM || "noreply@papodebola.com.br",
          defaultFromName: "Papo de Bola",
          transportOptions: {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: Number(process.env.SMTP_PORT || 587) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
        }),
      }
    : {}),
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

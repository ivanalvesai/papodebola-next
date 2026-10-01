# CMS "estilo Elementor": blocos ricos, Construtor fiel, trechos, formulários, textos/SEO e papéis — Design

**Data:** 2026-10-01 · **Status:** aprovado pelo Ivan (brainstorm desta sessão; "faça tudo isso") · **Escopo:** arquitetural, continuação da spec `2026-09-30-cms-page-builder-design.md` (já em prod)

## 1. Objetivo

Qualquer pessoa da equipe monta páginas bonitas e completas no `/cms`, arrastando e soltando, vendo o
resultado real em celular/tablet/PC, com o máximo dos blocos que existem no Elementor (hero, cards,
FAQ, depoimentos, números, abas, galeria, formulários, embeds, Instagram, X…), reaproveitando seções
de outras páginas (trechos salvos) e importando layouts gerados por IA. Além disso: abrir o CMS pra
terceiros com papéis, e editar textos/SEO de **todas** as páginas do site (inclusive as programadas)
sem deploy, aposentando o painel antigo.

### Restrições (herdadas e novas)

- **Nada já no ar muda.** Rotas em código continuam ganhando; defaults reproduzem o HTML atual; páginas
  e posts existentes não são tocados.
- **Postgres compartilhado**: DDL **só aditivo**, gerado/revisado pela receita, aplicado **pelo Ivan** via
  psql (como em 01/10). Uma única aplicação pra tudo desta spec.
- **Nunca publicar sem ordem**: testes como rascunho, usuário temporário apagado no fim.
- **ISR + polling** em páginas públicas; nenhuma chamada nova direta à API esportiva.
- Client components não importam `@/lib/data/*`; módulos de node:test usam imports relativos `.ts`;
  importMap versionado; sem `text-[10px]`/`[11px]`; ícones novos só onde o editor escolhe (lista de
  ícones é feature do bloco, não decoração nossa).
- E-mail de formulário depende de conta SMTP (`SMTP_HOST/PORT/USER/PASS`) que o Ivan cria no aaPanel;
  sem ela, respostas ficam só no CMS (sem erro).

## 2. Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Componentes de bloco | **Presentacionais puros** em `src/components/payload/blocks/*.tsx` (sem fetch), usados pelo `PageBlock` (site), pelo preview e pelo canvas do Puck | Mesmo visual nos três lugares; zero duplicação de markup |
| Fidelidade do canvas | **CSS real do site** injetado no iframe do Puck (route `/api/cms/site-css` que descobre os stylesheets da página pública) + blocos de dados via **mini-preview** (`/cms-block-preview?b=…` renderizando `PageBlock` de verdade) | Elementor-like sem reescrever renderers |
| Visibilidade responsiva | Campo `hideOn` (`none`/`mobile`/`desktop`) em **todo** bloco via `withMeta`; render aplica `max-md:hidden` / `md:hidden` | Elementor tem; é 1 coluna por tabela de bloco |
| Trechos salvos | Collection `snippets` ("Trechos") com `layout` (mesma biblioteca) + inserção pelo painel lateral (append via PATCH) e bloco `snippet` (referência) no site/Puck | "Copiar seção de outra página" e reuso |
| Formulários | **`@payloadcms/plugin-form-builder`** oficial (collections `forms`, `form-submissions`) + bloco `formBlock` + `FormRenderer` client + `@payloadcms/email-nodemailer` | Não reinventar; respostas e e-mails prontos |
| Textos/SEO | Global `siteSettings` + collection `pageTexts` (1 doc por rota) alimentando `getEditableText` e um `buildMetadata(route, defaults)`; migração dos overrides atuais; painel `/painel-pdb-9x/paginas` aposentado | Uma só fonte, editável por papel `seo` |
| Papéis | `users.roles` hasMany `admin`/`editor`/`seo` (`saveToJWT`), access por collection; sem roles = `editor` | Abrir pra terceiros |
| Validador de caminho | **Gerado**: `scripts/gen-reserved-paths.mjs` lê `next.config.ts` (sources) + pastas de `src/app` → `src/cms/lib/reserved-paths.generated.ts`; roda no `build` e no teste | Não envelhece |
| Importar HTML de outros sites | Bloco **Embed HTML** (raw, só admin/editor) + trechos; conversor HTML→blocos fica fora de escopo | Risco e esforço altos; Embed cobre 90% |
| Dashboard | `admin.components.beforeDashboard` com atalhos por papel | Barato |

## 3. Biblioteca de blocos (novos) — schema → componente

Todos entram em `pageBlocks()` (Páginas, Modelos, Trechos) e no Puck. Campos resumidos; rótulos PT.

| Bloco | Campos | Componente / observação |
|---|---|---|
| `hero` | `title`, `subtitle`, `align` (left/center), `background` (`color`: none/green/dark/custom hex; `image` upload; `overlay` 0-80), `height` (auto/tall), `buttons[]` {label, href, style primary/outline/white} (0-2), `minHeight?` | `HeroBlock` |
| `cards` | `title?`, `columns` 2/3/4, `items[]` {image, title, text, href, linkLabel} | `CardsBlock` (grade responsiva) |
| `cta` | `title`, `text`, `background` (green/dark/light/image), `buttons[]` (0-2), `align` | `CtaBlock` |
| `faq` | `title?`, `items[]` {question, answer (textarea)} , `schema` (checkbox default true) | `FaqBlock` (acordeão `<details>`, JSON-LD FAQPage quando `schema`) |
| `testimonials` | `title?`, `items[]` {quote, name, role, photo?} , `layout` grid/carousel | `TestimonialsBlock` (carousel = scroll-snap CSS, sem lib) |
| `stats` | `title?`, `items[]` {value, label, suffix?} (2-4), `background` | `StatsBlock` (contador animado client-side leve) |
| `mediaText` | `image`, `imageSide` left/right, `title`, `text` (richText padrão), `button?` | `MediaTextBlock` |
| `iconList` | `title?`, `items[]` {icon (select de ~30 nomes Lucide curados), text, href?} | `IconListBlock` (mapa nome→componente) |
| `tabs` | `items[]` {label, content richText padrão} | `TabsBlock` (client, botões + painel) |
| `divider` | `style` (line/space), `size` (sm/md/lg) | `DividerBlock` |
| `carousel` | `title?`, `images[]` {image, caption}, `aspect` 16:9/4:3/1:1 | `CarouselBlock` (scroll-snap + setas client) |
| `buttons` | `items[]` {label, href, style}, `align` | `ButtonsBlock` |
| `social` | `items[]` {network (instagram/x/youtube/facebook/tiktok/whatsapp/site), url}, `size` | `SocialBlock` (ícones Lucide/SVG inline) |
| `people` | `title?`, `items[]` {photo, name, role, text?, links[]?}, `columns` | `PeopleBlock` |
| `timeline` | `title?`, `items[]` {date, title, text} | `TimelineBlock` |
| `instagram` | `url`, `caption?` | `InstagramBlock` (mesmo markup do card do editor + `InstagramEmbedLoader`) |
| `xPost` | `url`, `caption?` | `XPostBlock` (+ `TweetEmbedLoader`) |
| `embed` | `html` (code), `height?`, `note?` | `EmbedBlock` (raw HTML em `div`; **create/update só admin/editor** via access de campo) |
| `formBlock` | `form` (relationship `forms`), `intro?` (richText padrão), `compact` | `FormBlockView` (server) → `FormRenderer` (client) |
| `countdown` | `team` (relationship `teams`) ou `matchId`, `title?`, `showBroadcast` | `CountdownBlock` (server busca próximo jogo; client conta regressiva; ao vivo mostra placar via polling existente) |
| `snippet` | `snippet` (relationship `snippets`) | renderiza `snippet.layout` via `PageBlock` (sem recursão de snippet dentro de snippet) |
| `youtube` (existente) | + `provider` auto YouTube/Vimeo | `VideoBlock` |

`hideOn` em todos (via `withMeta`). Os 19 blocos já existentes migram o markup para `blocks/*.tsx`
(sem mudar classes). Grupos no drawer: Texto e mídia · Layout · Destaques (hero, cta, cards, stats,
testimonials, mediaText, people, timeline) · Interação (faq, tabs, formBlock, buttons, social,
iconList) · Incorporar (youtube, instagram, xPost, embed, carousel) · Dados ao vivo · Trechos.
Thumbnails SVG novas pelo gerador.

## 4. Construtor (Puck) fiel

- `src/cms/puck/fields.ts` ganha todos os blocos acima (campos equivalentes; `upload` vira `external`
  listando `/cms-api/media` com miniatura; `richText` vira `textarea` com parágrafos; arrays viram
  `array`). `puckPropsToBlock` cobre todos. Categorias = grupos do drawer.
- **CSS do site no canvas**: route `GET /api/cms/site-css` (só logado) faz fetch de
  `http://127.0.0.1:${PORT}/termos-de-uso`, extrai `<link rel="stylesheet" href="/_next/static/…css">`,
  devolve JSON `{ hrefs }` (cache 10 min). `overrides.iframe` injeta os `<link>` e a classe/fonte do
  `<body>` (`font-sans`, `bg-body`). Os componentes do canvas são os **mesmos** `blocks/*.tsx`.
- **Dados ao vivo no canvas**: componentes de dados renderizam `<iframe src="/cms-block-preview?b=<base64 json do bloco>" />` (route `src/app/(site)/cms-block-preview/page.tsx`, `force-dynamic`, noindex, acesso só logado, renderiza `PageBlock` dentro de um shell mínimo com o CSS do site; altura auto via `postMessage`).
- Importar/Exportar JSON do Construtor (mesmo painel) e **Inserir trecho** (externals de `snippets`).
- Viewports: Celular 390 / Tablet 768 / Desktop 1440 (já); `hideOn` respeitado no canvas (opacidade).

## 5. Trechos (`snippets`)

Collection `snippets` ("Trechos", grupo Conteúdo): `title`, `description`, `layout` (blocks). Painel lateral
da página ganha **"Salvar blocos selecionados como trecho"** (na prática: salvar o layout inteiro ou os N
últimos blocos — UI simples: campo "quais blocos" por índice) e **"Inserir trecho"** (append dos blocos do
trecho ao fim do layout, `stripIds`). Bloco `snippet` referencia por id (atualiza em todas as páginas).

## 6. Formulários

- `formBuilderPlugin({ fields: { text, textarea, select, email, checkbox, number, message, radio: true; state/country/payment/date: false }, formOverrides: { admin.group "Conteúdo", labels PT, access editor+ }, formSubmissionOverrides: { labels PT, read editor+ }, redirectRelationships: ["pages"] })`.
- `email: nodemailerAdapter({ defaultFromAddress: SMTP_FROM, defaultFromName: "Papo de Bola", transportOptions: { host: SMTP_HOST, port: SMTP_PORT, secure: port===465, auth } })` **só se `SMTP_HOST` existir**; senão sem adapter (Payload loga).
- `FormRenderer` (client): monta campos a partir de `form.fields`, valida obrigatórios, POST `/cms-api/form-submissions` `{ form: id, submissionData: [{field, value}] }`, confirmação por mensagem (richText) ou redirect; honeypot simples; estados carregando/erro em PT.
- Seed: form "Contato" (nome, e-mail, mensagem) + e-mail pra `contato@papodebola.com.br`.

## 7. Textos e SEO no CMS

- Global `siteSettings` ("Configurações do site", grupo Conteúdo): `siteName`, `metaTitleDefault`, `metaDescriptionDefault`, `social{instagram,x,youtube,facebook?,tiktok?}`. Alimenta `(site)/layout.tsx` e `site-schema.tsx` (hoje via `getEditableText("site.*")`).
- Collection `pageTexts` ("Textos e SEO das páginas", grupo Conteúdo): `route` (unique; `/`, `/futebol/copa-do-mundo`, padrões `/noticias/:categoria`), `label`, `seo{metaTitle, metaDescription, noindex}`, `texts[]` {`key` (id do registro, ex. `copa.h1`), `label`, `value` (textarea)}. Sem drafts. Access: read público (só o site lê), create/update `seo`/`editor`/`admin`.
- `getEditableText(id)`: lê `pageTexts` da rota de `EDITABLE[id].page` (cache por request + `unstable_cache` 5 min com tag `pageTexts`) → `texts[key=id]` → fallback default. `getEditableTemplate` igual. `site.*` lê o global.
- `buildMetadata(route, defaults: Metadata): Promise<Metadata>` em `src/lib/seo/build-metadata.ts`: mescla `seo.metaTitle/metaDescription/noindex` do doc da rota (ou do padrão com `:param`) sobre os defaults. As **36 rotas** com meta fixa passam a chamar `buildMetadata("/rota", { …meta atual… })` (trabalho mecânico, 1 commit por grupo de rotas). Rotas de preview/cms ficam de fora.
- Hooks `afterChange` em `pageTexts`/`siteSettings`: `revalidateTag("pageTexts")` + `revalidatePath(route)` (global: `revalidatePath("/", "layout")`).
- Migração (script `payload run`, uso único): 1 doc `pageTexts` por `page` distinto do registro `EDITABLE` (com `texts` = overrides atuais de `data/editable-content.json`, só os que diferem do default) + 1 doc por rota com meta fixa (seo vazio = usa default do código); global `siteSettings` com os valores atuais.
- Aposentar: aba "Páginas" do painel (`/painel-pdb-9x/paginas` → redirect 308 para `/cms/collections/pageTexts`), `/api/page-overrides` removido, `editable-content-store.ts` removido; o JSON antigo fica no volume como backup.

## 8. Papéis

- `users.fields`: `name`, `roles` (select hasMany `admin|editor|seo`, default `['editor']`, `saveToJWT`, update só admin).
- Helpers `src/cms/lib/access.ts`: `isAdmin`, `hasRole(...roles)`, `anyLogged`, `publishedOrLogged`.
- Regras: `users` tudo admin (próprio perfil: read/update self); `teams`, `sponsors`, `authors`, `matchComments`, `municipalGames`: editor+ (delete admin); `posts`, `pages`, `pageTemplates`, `snippets`, `media`, `forms`, `form-submissions`: editor+ (delete editor+; form-submissions delete admin); `pageTexts`, `siteSettings`: seo+editor+admin (update), delete admin; campos `seo.*` de `pages`/`posts`/`teams`: `seo` pode update, resto do doc não (access de campo). `admin.hidden` esconde o que o papel não lê.
- Seed: ivansjp → `['admin']`, utopiaseo01 → `['seo']`.

## 9. Dashboard e validador

- `beforeDashboard`: cards por papel: Nova página, Modelos, Trechos, Formulários + Respostas (editor+),
  Textos e SEO (seo+), Posts, Ver site, Doc "Como criar uma página".
- `scripts/gen-reserved-paths.mjs` → `src/cms/lib/reserved-paths.generated.ts` (`RESERVED_EXACT`, `RESERVED_PREFIXES`, `STATIC_TOP_LEVEL`, `CODE_SUBTREES` por pasta de `src/app`); `cms-paths.ts` passa a importar; teste regenera em memória e compara (falha se desatualizado); `build` roda o script.

## 10. Schema (DDL aditivo, uma aplicação)

`users.name`, `users_roles` (tabela hasMany), global `site_settings`, `page_texts` (+ `page_texts_texts`), `snippets` (+ blocos), `forms*` e `form_submissions*` (plugin), tabelas dos 22 blocos novos em `pages`/`_pages_v`/`page_templates`/`snippets`, coluna `hide_on` em todas as tabelas de bloco, `payload_locked_documents_rels.{snippets_id,forms_id,form_submissions_id,page_texts_id}`, enums novos. Receita igual à de 01/10; `NODE_ENV=production PAYLOAD_DB_PUSH=false` no container efêmero.

## 11. Testes e validação

- Unitário: `puckPropsToBlock` (todos os tipos), `parseLayoutImport` (novos slugs), `reserved-paths` (gerado = atual), `access` helpers, `buildMetadata` merge, `FormRenderer` → payload do POST (função pura `toSubmissionData`).
- Browser (agent-browser, dev, usuário temporário `editor` e `seo`): drawer com os grupos novos; página rascunho com hero + cards + faq + formBlock + countdown; Live Preview; canvas do Construtor com CSS real (captura) e dados reais no mini-preview; inserir trecho; formulário enviado no preview → aparece em Respostas; papel `seo` não vê Times nem Usuários e edita Textos e SEO; `/painel-pdb-9x/paginas` → 308; textos migrados renderizam igual (diff de `/sobre`, `/`, Copa hub antes/depois).
- Prod: rotas de controle 200, `/cms` ok, `payloadInitError` 0.

## 12. Fora de escopo

Conversor HTML→blocos; roles mais finos (por página); CRON_SECRET rotação (Ivan); pagamentos/uploads em formulários; blocos ricos nas abas de times (só via `richText`).

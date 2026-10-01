# CMS estilo Elementor — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Páginas bonitas e completas montadas no `/cms` arrastando e soltando (22 blocos novos, Construtor com visual real, trechos reutilizáveis, formulários com respostas e e-mail), textos/SEO de todas as páginas editáveis no CMS, e papéis de acesso pra abrir o CMS pra terceiros.

**Architecture:** (1) Blocos viram componentes presentacionais puros em `src/components/payload/blocks/` compartilhados por site, preview e canvas do Puck. (2) Config do Payload ganha os blocos, `hideOn`, collections `snippets`/`pageTexts`, global `siteSettings`, plugin de formulários, e-mail SMTP opcional e `users.roles`; **um** DDL aditivo aplicado pelo Ivan. (3) Canvas do Puck carrega o CSS real do site e mostra dados ao vivo por mini-preview. (4) `getEditableText`/`buildMetadata` passam a ler do Payload; painel antigo aposentado. (5) Access por papel + dashboard + validador de caminhos gerado do `next.config.ts`.

**Tech Stack:** Next.js 16.2 (App Router), React 19.2, Payload 3.85.1 (+ `@payloadcms/plugin-form-builder@3.85.1`, `@payloadcms/email-nodemailer@3.85.1`, `nodemailer`), `@puckeditor/core@0.23`, Tailwind v4, node:test, agent-browser 0.38.

**Spec:** `docs/superpowers/specs/2026-10-01-cms-elementor-design.md`

## Global Constraints

- Nada já no ar muda: os 19 blocos existentes mantêm slugs, campos e **classes CSS**; rotas em código ganham do CMS; páginas/posts/times existentes intocados; refatorar `generateMetadata` das 36 rotas **sem mudar o resultado quando não há doc em `pageTexts`**.
- Postgres compartilhado: DDL **só aditivo**, receita de 01/10 (`pdb-migrate` + `migrate:create` + extração + dry-run em restore do backup), aplicado **pelo Ivan** via psql (uma vez, Task 4). Container efêmero sempre com `-e NODE_ENV=production -e PAYLOAD_DB_PUSH=false`.
- Nunca publicar sem ordem; conteúdo de teste em rascunho e apagado; usuários temporários apagados.
- Páginas públicas: ISR + polling, nunca `force-dynamic`; nenhuma chamada nova direta à API esportiva.
- Client components não importam valores de `@/lib/data/*`; módulos carregados por node:test usam imports relativos `.ts`; `src/cms/blocks/**` e `src/cms/lib/**` sem React e sem `@/lib/data`.
- `importMap.js` regenerado e commitado a cada componente client/admin novo (`node scripts/gen-importmap.mjs`).
- Sem `text-[10px]`/`[11px]`; ícones só como escolha do editor (bloco `iconList`/`social`), não decoração.
- E-mail: só liga se `SMTP_HOST` existir; sem ele, formulários salvam no CMS e não quebram.
- Commits terminam com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`; `npm run typecheck && npm test` antes de cada commit; deploy `git pushdev` → validar → promote só na Task 14.

## Review Focus

1. **Papel `seo` editando um post/página**: só os campos `seo.*` podem mudar; o resto do doc é recusado (access de campo) e o admin esconde o que não pode. → Task 11 testa `fieldAccess`/`collectionAccess` helpers e a Task 12 confere no browser.
2. **Bloco `embed` com `<script>` criado por `seo`/anônimo**: recusado; só admin/editor criam/alteram. → Task 11 (access de campo `html`).
3. **Rota com `pageTexts` ausente ou Postgres fora**: `buildMetadata` devolve exatamente os defaults do código; `getEditableText` devolve o default do registro. → Task 10 testa `mergeMetadata` e o fallback.
4. **Formulário sem SMTP configurado**: a resposta é salva, o usuário vê a confirmação, nenhum 500. → Task 7 (FormRenderer trata erro) + Task 12 (envio real no dev sem SMTP).
5. **Caminho reservado novo (redirect adicionado no `next.config.ts`) sem regenerar a lista**: o teste falha e o build regenera. → Task 3.

---

### Task 1: Blocos novos (schema), `hideOn`, grupos e thumbnails

**Files:**
- Modify: `src/cms/blocks/meta.ts` (BLOCK_GROUPS + `hideOn`), `src/cms/blocks/index.ts`, `src/cms/blocks/summary.ts`, `src/cms/blocks/index.test.ts`, `src/cms/blocks/summary.test.ts`, `scripts/gen-block-thumbs.mjs`
- Create: `src/cms/blocks/rich.ts`, `src/cms/blocks/icons.ts`

**Interfaces:**
- Produces: `richBlocks(richTextEditor): Block[]` (22 blocos: hero, cards, cta, faq, testimonials, stats, mediaText, iconList, tabs, divider, carousel, buttons, social, people, timeline, instagram, xPost, embed, formBlock, countdown, snippet; `youtube` existente ganha `provider`), `ICON_NAMES` (30 nomes Lucide), `SOCIAL_NETWORKS`, `HIDE_ON_FIELD`, `BLOCK_GROUPS` com `highlight`, `interact`, `embed`, `snippet`; `PAGE_BLOCK_SLUGS` atualizado; `withMeta` injeta `hideOn` em todo bloco.
- Consumes: `withMeta`, `STATIC_BLOCK_SLUGS`, `dataBlocks`.

- [ ] **Step 1: Testes**

Em `src/cms/blocks/index.test.ts` acrescentar:
```ts
test("todo bloco tem hideOn e grupo", () => {
  for (const b of pageBlocks({} as any)) {
    assert.ok(b.fields.some((f: any) => f.name === "hideOn"), b.slug);
    assert.ok(b.admin?.group, b.slug);
  }
});
test("PAGE_BLOCK_SLUGS inclui os blocos ricos", () => {
  for (const s of ["hero","cards","cta","faq","testimonials","stats","mediaText","iconList","tabs","divider","carousel","buttons","social","people","timeline","instagram","xPost","embed","formBlock","countdown","snippet"]) assert.ok((PAGE_BLOCK_SLUGS as readonly string[]).includes(s), s);
  assert.ok(!(SECTION_INNER_SLUGS as readonly string[]).includes("snippet"), "snippet não entra dentro de seção");
});
```
Em `summary.test.ts`: `hero` → `clip(title)`; `faq` → `"Título · N perguntas"`; `formBlock` com `form:{title:"Contato"}` → `"Contato"`; `countdown` com `team:{name:"Cruzeiro"}` → `"Cruzeiro"`; `snippet` com `snippet:{title:"Rodapé institucional"}` → `"Rodapé institucional"`; `embed` → `"HTML (N caracteres)"`.

- [ ] **Step 2: Rodar e ver falhar** — `npm test` (os novos testes falham).

- [ ] **Step 3: `meta.ts`**

```ts
export const BLOCK_GROUPS = {
  text: "Texto e mídia", layout: "Layout", highlight: "Destaques", interact: "Interação",
  embed: "Incorporar", data: "Dados ao vivo", snippet: "Trechos", team: "Dados do time",
} as const;
export const HIDE_ON_FIELD: Field = {
  name: "hideOn", type: "select", defaultValue: "none", label: "Visibilidade",
  options: [{ label: "Mostrar em tudo", value: "none" }, { label: "Ocultar no celular", value: "mobile" }, { label: "Ocultar no computador", value: "desktop" }],
  admin: { description: "Esconde este bloco só no celular ou só no computador." },
};
export function withMeta(block: Block, group: keyof typeof BLOCK_GROUPS): Block {
  const hasHide = block.fields.some((f: any) => f.name === "hideOn");
  return { ...block, fields: hasHide ? block.fields : [...block.fields, HIDE_ON_FIELD], admin: { /* igual ao atual */ } };
}
```
(`Field` type-only de `payload`.) Os blocos de **time** (`TEAM_LAYOUT_BLOCKS`) NÃO recebem `hideOn` (não mudar tabelas de `teams`): em `team.ts`, remover o campo após `withMeta` ou passar um flag `withMeta(b, g, { hideOn: false })` — implementar o flag.

- [ ] **Step 4: `icons.ts`**

```ts
// Ícones que o editor pode escolher (nomes do lucide-react). Mapa nome→componente fica no render.
export const ICON_NAMES = ["check","star","trophy","calendar","clock","map-pin","tv","users","user","heart","shield","flag","goal","ticket","newspaper","play","video","camera","phone","mail","message-circle","link","globe","award","zap","sparkles","list","info","alert-circle","chevron-right"] as const;
export const ICON_OPTIONS = ICON_NAMES.map((n) => ({ label: n, value: n }));
export const SOCIAL_NETWORKS = [
  { label: "Instagram", value: "instagram" }, { label: "X (Twitter)", value: "x" }, { label: "YouTube", value: "youtube" },
  { label: "Facebook", value: "facebook" }, { label: "TikTok", value: "tiktok" }, { label: "WhatsApp", value: "whatsapp" }, { label: "Site", value: "site" },
];
```

- [ ] **Step 5: `rich.ts` (schema dos 21 blocos novos + ajuste do youtube)**

Helpers no topo: `t(name,label,extra?)` text, `ta(name,label)` textarea, `up(name,label,required?)` upload media, `sel(name,label,options,def)`, `btns(max=2)` = array `buttons` {label req, href req, style select primary/outline/white}, `bg` = select `background` none/green/dark/light. Definições (campos exatamente estes nomes):
- `hero`: `title` req, `subtitle` ta, `align` left/center (def center), `bgColor` none/green/dark/custom, `bgHex` text (condition custom), `bgImage` up, `overlay` number 0-80 def 40, `height` auto/tall, `buttons` btns(2).
- `cards`: `title`, `columns` select 2/3/4 (def 3), `items` array min1 {image up, title req, text ta, href, linkLabel}.
- `cta`: `title` req, `text` ta, `background` green/dark/light/image (def green), `bgImage` up (cond image), `align` left/center, `buttons` btns(2).
- `faq`: `title`, `items` array min1 {question req, answer ta req}, `schema` checkbox def true (label "Marcar como FAQ pro Google").
- `testimonials`: `title`, `layout` grid/carousel, `items` array {quote ta req, name req, role, photo up}.
- `stats`: `title`, `background` none/green/dark, `items` array min2 max4 {value req (text, ex. "1.200"), label req, suffix}.
- `mediaText`: `image` up req, `imageSide` left/right, `title`, `text` richText (editor padrão), `button` group {label, href}.
- `iconList`: `title`, `columns` 1/2, `items` array {icon select ICON_OPTIONS def "check", text req, href}.
- `tabs`: `items` array min2 {label req, content richText padrão}.
- `divider`: `style` line/space (def line), `size` sm/md/lg.
- `carousel`: `title`, `aspect` 16:9/4:3/1:1, `images` array min2 {image up req, caption}.
- `buttons`: `align` left/center/right, `items` btns(4) (name `items`).
- `social`: `size` sm/md/lg, `items` array {network select SOCIAL_NETWORKS, url req}.
- `people`: `title`, `columns` 2/3/4, `items` array {photo up, name req, role, text ta, links array {label, url}}.
- `timeline`: `title`, `items` array min2 {date req, title req, text ta}.
- `instagram`: `url` req (description "Link do post/reel"), `caption`.
- `xPost`: `url` req, `caption`.
- `embed`: `html` type `code` (admin language html) req com `access: { create: editorOrAdmin, update: editorOrAdmin }` (importar de `../lib/access.ts` — criado na Task 2 como módulo **sem React**; nesta task criar um stub `src/cms/lib/access.ts` com `hasRole`/`editorOrAdmin` conforme Task 2 Step 3, pra não bloquear), `height` number, `note`.
- `formBlock`: `form` relationship `forms` req, `intro` richText padrão, `compact` checkbox.
- `countdown`: `team` relationship `teams`, `matchId` number, `title`, `showBroadcast` checkbox def true (description: "Escolha o time OU informe o id do jogo").
- `snippet`: `snippet` relationship `snippets` req.
- `youtube` (em `static.ts`): acrescentar `provider` select auto/youtube/vimeo def auto (sem mudar os outros campos).
`richBlocks(editor)` devolve os 21 com `withMeta(b, grupo)`: highlight = hero, cta, cards, stats, testimonials, mediaText, people, timeline; interact = faq, tabs, formBlock, buttons, social, iconList; embed = instagram, xPost, embed, carousel; snippet = snippet. Mover `youtube` pro grupo `embed`.

- [ ] **Step 6: `index.ts`**

`inner = [...staticBlocks(editor), ...dataBlocks(), ...richBlocks(editor).filter(b => b.slug !== "snippet")]`; `pageBlocks = [sectionBlock(inner), ...inner, snippetBlock]`. Atualizar `SECTION_INNER_SLUGS` (sem `snippet`) e `PAGE_BLOCK_SLUGS = ["section", ...SECTION_INNER_SLUGS, "snippet"]`. Exportar `richBlocks`, `RICH_BLOCK_SLUGS`.

- [ ] **Step 7: `summary.ts`** — casos novos: hero/cta/cards/stats/testimonials/people/timeline/faq/tabs/iconList/carousel/buttons/social (join de título + contagem de itens), mediaText (title), divider ("Linha"/"Espaço"), instagram/xPost (url curta), embed (`HTML (${(d.html||"").length} caracteres)`), formBlock (`d.form?.title || "Formulário"`), countdown (`d.team?.name || (d.matchId && "jogo "+d.matchId) || ""`), snippet (`d.snippet?.title || "Trecho"`).

- [ ] **Step 8: thumbnails** — em `gen-block-thumbs.mjs`, adicionar formas/títulos pros 21 slugs novos (wireframes simples: hero = retângulo escuro com título e 2 botões; cards = 3 cards com imagem; cta = faixa verde; faq = 4 linhas com chevron; stats = 3 números grandes; mediaText = imagem + linhas; iconList = círculos + linhas; tabs = 3 abas; divider = linha; carousel = 3 imagens com setas; buttons = 3 botões; social = 5 círculos; people = 3 avatares; timeline = linha vertical com pontos; instagram/xPost = card com avatar; embed = `</>`; formBlock = 3 inputs + botão; countdown = 4 caixas com números; snippet = card com ícone de clipe). `npm run thumbs` → 52 SVGs.

- [ ] **Step 9: Verificar e commitar** — `npm run typecheck && npm test`; `git add src/cms scripts/gen-block-thumbs.mjs public/cms-blocks`; `git commit -m "feat(cms): 21 blocos ricos (hero, cards, faq, formulário, contagem…), visibilidade por dispositivo e grupos novos (schema)"`.

---

### Task 2: Collections `snippets`, `pageTexts`, global `siteSettings`, papéis em `users`, plugin de formulários, e-mail

**Files:**
- Create: `src/cms/lib/access.ts`, `src/cms/lib/access.test.ts`, `src/cms/collections/snippets.ts`, `src/cms/collections/page-texts.ts`, `src/cms/globals/site-settings.ts`, `src/cms/collections/users.ts`
- Modify: `src/payload.config.ts`, `package.json`, `.env.example`

**Interfaces:**
- Produces: `hasRole(user, ...roles)`, `isAdmin(req)`, `editorOrAdmin`, `seoOrEditorOrAdmin`, `anyLogged`, `publishedOrLogged` (Access), `fieldEditorOrAdmin` (FieldAccess); collections `snippets{title,description,layout}`, `pageTexts{route,label,seo{metaTitle,metaDescription,noindex},texts[{key,label,value}]}`, global `siteSettings{siteName,metaTitleDefault,metaDescriptionDefault,social{instagram,x,youtube,facebook,tiktok}}`, `users{name,roles}`; plugin collections `forms`/`form-submissions`.

- [ ] **Step 1: Deps** — `npm install @payloadcms/plugin-form-builder@3.85.1 @payloadcms/email-nodemailer@3.85.1 nodemailer@^6.9.16`.

- [ ] **Step 2: Teste de access** (`src/cms/lib/access.test.ts`)

```ts
import { test } from "node:test"; import assert from "node:assert/strict";
import { hasRole, editorOrAdmin, seoOrEditorOrAdmin, publishedOrLogged, fieldEditorOrAdmin } from "./access.ts";
const req = (roles?: string[]) => ({ req: { user: roles ? { roles } : null } } as any);
test("hasRole", () => { assert.equal(hasRole({ roles: ["seo"] }, "seo", "admin"), true); assert.equal(hasRole({ roles: [] }, "admin"), false); assert.equal(hasRole(null, "admin"), false); });
test("sem roles conta como editor", () => { assert.equal(editorOrAdmin(req([])), true); assert.equal(editorOrAdmin(req(["seo"])), false); assert.equal(editorOrAdmin(req(undefined)), false); });
test("seoOrEditorOrAdmin e publishedOrLogged", () => { assert.equal(seoOrEditorOrAdmin(req(["seo"])), true); assert.deepEqual(publishedOrLogged(req(undefined)), { _status: { equals: "published" } }); assert.equal(publishedOrLogged(req(["editor"])), true); });
test("fieldEditorOrAdmin", () => { assert.equal(fieldEditorOrAdmin(req(["seo"])), false); assert.equal(fieldEditorOrAdmin(req(["admin"])), true); });
```

- [ ] **Step 3: `access.ts`** (sem React)

```ts
import type { Access, FieldAccess } from "payload";
type U = { roles?: string[] | null } | null | undefined;
export function roles(u: U): string[] { const r = (u?.roles || []) as string[]; return r.length ? r : (u ? ["editor"] : []); }
export function hasRole(u: U, ...r: string[]): boolean { const mine = roles(u); return r.some((x) => mine.includes(x)); }
export const anyLogged: Access = ({ req }) => !!req.user;
export const adminOnly: Access = ({ req }) => hasRole(req.user as U, "admin");
export const editorOrAdmin: Access = ({ req }) => hasRole(req.user as U, "editor", "admin");
export const seoOrEditorOrAdmin: Access = ({ req }) => hasRole(req.user as U, "seo", "editor", "admin");
export const publishedOrLogged: Access = ({ req }) => (req.user ? true : { _status: { equals: "published" } });
export const fieldEditorOrAdmin: FieldAccess = ({ req }) => hasRole(req.user as U, "editor", "admin");
export const fieldSeoOrEditorOrAdmin: FieldAccess = ({ req }) => hasRole(req.user as U, "seo", "editor", "admin");
export const selfOrAdmin: Access = ({ req, id }) => hasRole(req.user as U, "admin") || (!!req.user && String(req.user.id) === String(id));
```

- [ ] **Step 4: `users.ts`**

```ts
export const usersCollection: CollectionConfig = {
  slug: "users", labels: { singular: "Usuário", plural: "Usuários" }, auth: true,
  admin: { useAsTitle: "email", group: "Sistema", hidden: ({ user }) => !hasRole(user as any, "admin") },
  access: { read: selfOrAdmin, create: adminOnly, update: selfOrAdmin, delete: adminOnly, admin: () => true },
  fields: [
    { name: "name", type: "text", label: "Nome" },
    { name: "roles", type: "select", hasMany: true, required: true, defaultValue: ["editor"], saveToJWT: true, label: "Papéis",
      options: [{ label: "Administrador (tudo)", value: "admin" }, { label: "Editor (conteúdo)", value: "editor" }, { label: "SEO (textos e meta)", value: "seo" }],
      access: { update: ({ req }) => hasRole(req.user as any, "admin") } },
  ],
};
```

- [ ] **Step 5: `snippets.ts`, `page-texts.ts`, `site-settings.ts`**

- `snippets`: slug `snippets`, labels Trecho/Trechos, group Conteúdo, `useAsTitle: title`, access read anyLogged / create+update editorOrAdmin / delete editorOrAdmin; fields `title` req, `description` textarea, `layout` blocks = `pageBlocks(editor).filter(b => b.slug !== "snippet")`, initCollapsed; hook `afterChange` → `revalidateTag("snippets")` (try/catch).
- `pageTexts`: slug `pageTexts`, labels "Textos e SEO da página"/"Textos e SEO das páginas", group Conteúdo, `useAsTitle: label`, defaultColumns route/label/updatedAt, `description: "Uma entrada por página do site. SEO vale pro Google; textos valem pro que aparece na tela."`; access read `() => true`, create/update `seoOrEditorOrAdmin`, delete adminOnly; fields: `route` text req unique index (description "Caminho da página (ex.: /futebol/copa-do-mundo). Padrões com :param também valem (ex.: /noticias/:categoria)"), `label` text req, `seo` group {metaTitle text, metaDescription textarea, noindex checkbox}, `texts` array {key text req (description "id do texto no código, não mude"), label text, value textarea} com `admin.components.RowLabel` = `"@/cms/components/text-row-label#TextRowLabel"` (client: mostra `label || key`); hook afterChange/afterDelete: `revalidateTag("pageTexts")`; `revalidatePath(doc.route)` se não tiver `:`; se `route === "/"` → `revalidatePath("/")`.
- `siteSettings` (global): slug `siteSettings`, label "Configurações do site", group Conteúdo, access read `() => true`, update `seoOrEditorOrAdmin`; fields `siteName` req, `metaTitleDefault`, `metaDescriptionDefault` textarea, `social` group {instagram, x, youtube, facebook, tiktok}; hook afterChange → `revalidateTag("siteSettings")` + `revalidatePath("/", "layout")`.

- [ ] **Step 6: `payload.config.ts`**

- `collections`: `usersCollection` substitui o inline; adicionar `snippetsCollection(richTextEditor)`, `pageTextsCollection`; `globals: [siteSettingsGlobal]`.
- Access por papel (Task 11 aplica o resto; aqui só o mínimo pra o schema): nada mais.
- `plugins: [formBuilderPlugin({ fields: { text: true, textarea: true, select: true, radio: true, email: true, checkbox: true, number: true, message: true, state: false, country: false, payment: false, date: false }, redirectRelationships: ["pages"], formOverrides: { labels: { singular: "Formulário", plural: "Formulários" }, admin: { group: "Conteúdo", useAsTitle: "title" }, access: { read: anyLogged, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin } }, formSubmissionOverrides: { labels: { singular: "Resposta de formulário", plural: "Respostas de formulário" }, admin: { group: "Conteúdo" }, access: { read: editorOrAdmin, delete: adminOnly } } })]`. Conferir no `.d.ts` do plugin os nomes exatos (`formOverrides`, `formSubmissionOverrides`, `fields`, `redirectRelationships`, `defaultToEmail`) e ajustar.
- `email: process.env.SMTP_HOST ? nodemailerAdapter({ defaultFromAddress: process.env.SMTP_FROM || "noreply@papodebola.com.br", defaultFromName: "Papo de Bola", transportOptions: { host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), secure: Number(process.env.SMTP_PORT || 587) === 465, auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } } }) : undefined`.
- `.env.example`: adicionar `SMTP_HOST=`, `SMTP_PORT=587`, `SMTP_USER=`, `SMTP_PASS=`, `SMTP_FROM=noreply@papodebola.com.br`.
- `TextRowLabel` client em `src/cms/components/text-row-label.tsx` (usa `useRowLabel`).

- [ ] **Step 7: gen-importmap, typecheck, testes, commit** — `git commit -m "feat(cms): trechos, textos/SEO das páginas, configurações do site, papéis de usuário, plugin de formulários e e-mail (schema)"`.

---

### Task 3: Validador de caminhos gerado do `next.config.ts` e das pastas

**Files:**
- Create: `scripts/gen-reserved-paths.mjs`, `src/cms/lib/reserved-paths.generated.ts`, `src/cms/lib/reserved-paths.test.ts`
- Modify: `src/cms/lib/cms-paths.ts`, `src/cms/lib/cms-paths.test.ts`, `package.json` (`"build": "node scripts/gen-reserved-paths.mjs && node scripts/gen-importmap.mjs && next build"`, `"gen:paths": "node scripts/gen-reserved-paths.mjs"`)

- [ ] **Step 1: Teste** (`reserved-paths.test.ts`): importa `generate()` do script? O script é `.mjs`; exportar a função `buildReserved(rootDir)` de `scripts/gen-reserved-paths.mjs` (ESM) e, no teste (`.ts` rodando com strip-types), `import { buildReserved } from "../../../scripts/gen-reserved-paths.mjs"`; asserts: resultado deep-equal ao conteúdo de `reserved-paths.generated.ts` (importado com `.ts`) — se diferente, mensagem "rode npm run gen:paths"; `exact` contém `/privacidade`, `/termos`, `/paginas`; `prefixes` contém `/campeonato`, `/times`, `/vidadecraque`, `/tenis/halle-2026`; `staticTopLevel` contém todas as pastas de `src/app/(site)` e `src/app` sem `(`/`[`/`_`.
- [ ] **Step 2: Script** — lê `next.config.ts` como texto; regex `source:\s*["'\`]([^"'\`]+)["'\`]`; para cada source: se contém `:` → prefixo = parte antes do primeiro `/:`; senão exact. Pastas: `readdirSync("src/app/(site)")` + `readdirSync("src/app")`, filtrando `(`, `[`, `_`, arquivos; `futebol` subpastas → `codeSubtrees["/futebol"] = [...]`; `tenis/halle-2026` → prefixo. Escreve o `.ts` com `export const RESERVED_EXACT: readonly string[]`, `RESERVED_PREFIXES`, `STATIC_TOP_LEVEL`, `FUTEBOL_CODE` ordenados; cabeçalho "GERADO — não editar". `export function buildReserved(root)`; `if (import.meta.url === pathToFileURL(process.argv[1]).href) write`.
- [ ] **Step 3: `cms-paths.ts`** passa a importar do gerado (mantém `RESERVED_FIRST_SEGMENTS` = `RESERVED_TOP_LEVEL` − futebol + extras como hoje; `STATIC_TOP_LEVEL` e `FUTEBOL_CODE` e as listas de redirect vêm do gerado). Testes existentes continuam verdes.
- [ ] **Step 4: Commit** — `feat(cms): validador de caminhos gerado do next.config e das pastas de rotas`.

---

### Task 4: DDL aditivo (servidor) — gerar, revisar, Ivan aplica, validar init

Mesma receita da Task 4 do plano anterior (push sem rebuild, watcher parado, backup `~/pdb_payload_backup_20261001b.sql`, rebuild `pdb-migrate`, `migrate:create elementor`, extrair DDL aditivo idempotente para `~/pdb-ddl-20261001.sql` + summary, dry-run 2× em restore, **PARAR com NEEDS_CONTEXT** pro controller revisar; o Ivan aplica via psql; depois verificar colunas/tabelas e rodar o check de init com `payload run` (**`-e NODE_ENV=production -e PAYLOAD_DB_PUSH=false`**) consultando `pages`, `snippets`, `pageTexts`, `forms`, `form-submissions`, global `siteSettings` e `users` (roles). Esperado no DDL: `users_roles` (hasMany) + `users.name`; `site_settings`(+`_social`), `page_texts`, `page_texts_texts`, `snippets` + `snippets_blocks_*`, `forms*`, `form_submissions*`, blocos novos em `pages/_pages_v/page_templates/snippets`, `hide_on` em todas as tabelas de bloco dessas 4 collections, `youtube.provider`, `payload_locked_documents_rels.{snippets_id, forms_id, form_submissions_id, page_texts_id}`, enums. Nada de DROP/ALTER COLUMN/RENAME/ALTER TYPE.

---

### Task 5: Componentes presentacionais — refatorar os existentes + Destaques e Interação

**Files:**
- Create: `src/components/payload/blocks/{heading,rich-text,image,columns,table,gallery,quote,button,list,info-card,note,video,link-cards,hero,cards,cta,stats,media-text,divider,buttons,icon-list,social,people,timeline,hide-on}.tsx`, `src/components/payload/blocks/index.ts`
- Modify: `src/components/payload/page-blocks.tsx`, `src/components/payload/section-block.tsx`

**Interfaces:**
- Produces: um componente por bloco, assinatura `({ block }: { block: any }) => JSX` (puros, sem fetch; podem ser importados por client components — sem `@/lib/data`), `hideOnClass(block)`, `BLOCK_COMPONENTS: Record<slug, Component>` (só os puros), `lucideIcon(name)`.
- Consumes: `lexicalToHtml` (server-only) — o `rich-text.tsx` fica **server** (import de `@/lib/data/articles-payload`); no canvas do Puck o bloco Texto usa outro caminho (Task 8). Marcar no `index.ts` quais são "client-safe".

- [ ] **Step 1: Mover os 13 existentes** — cortar o JSX de cada `case` do `PageBlock` para o componente correspondente **sem mudar classes**; `PageBlock` passa a `return <Comp block={block} />`. `hide-on.tsx`: `export function hideOnClass(b){ return b?.hideOn === "mobile" ? "max-md:hidden" : b?.hideOn === "desktop" ? "md:hidden" : ""; }`; `PageBlock` envolve o resultado em `<div className={hideOnClass(block)}>` **somente quando a classe não é vazia** (mantém HTML idêntico nos blocos antigos).
- [ ] **Step 2: Novos (Destaques/Interação)** com Tailwind do projeto (`bg-green`, `text-text-primary`, `border-border-custom`, `bg-card-bg`, `rounded-lg`); todos aceitam `block` no shape do schema; imagens: `block.image?.url` (upload populado) com `alt`. Exemplos completos:

`hero.tsx`:
```tsx
export function HeroBlock({ block }: { block: any }) {
  const bg = block.bgColor === "green" ? "bg-green text-white" : block.bgColor === "dark" ? "bg-[#111827] text-white" : block.bgColor === "custom" && block.bgHex ? "text-white" : "bg-body text-text-primary";
  const img = block.bgImage && typeof block.bgImage === "object" ? block.bgImage : null;
  const align = block.align === "left" ? "text-left items-start" : "text-center items-center";
  return (
    <section className={`relative overflow-hidden rounded-lg ${bg} ${block.height === "tall" ? "min-h-[420px]" : ""}`} style={block.bgColor === "custom" && block.bgHex ? { backgroundColor: block.bgHex } : undefined}>
      {img?.url && <img src={img.url} alt={img.alt || ""} className="absolute inset-0 h-full w-full object-cover" />}
      {img?.url && <div className="absolute inset-0 bg-black" style={{ opacity: (Number(block.overlay ?? 40)) / 100 }} />}
      <div className={`relative flex flex-col gap-4 px-6 py-14 sm:px-10 ${align}`}>
        <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{block.title}</h2>
        {block.subtitle && <p className="max-w-2xl text-base opacity-90">{block.subtitle}</p>}
        <BlockButtons items={block.buttons} onDark={bg.includes("text-white")} />
      </div>
    </section>
  );
}
```
`buttons.tsx` exporta `BlockButtons({ items, onDark })` (primary = `bg-green text-white`, outline = `border border-current`, white = `bg-white text-green`) e `ButtonsBlock` (alinhamento). `cards.tsx`: `grid gap-4 sm:grid-cols-2 lg:grid-cols-{3|4}`, card com imagem `aspect-[16/10] object-cover`, título `text-base font-bold`, texto `text-sm text-text-secondary`, link `text-green font-semibold`. `cta.tsx`: faixa `rounded-lg p-8 sm:p-10` com bg por opção. `stats.tsx`: grade 2-4 com `text-3xl font-bold text-green` (valor) e `text-sm` (label) — contador animado fica pra client `StatsCounter` ("use client", IntersectionObserver, só números). `media-text.tsx`: `grid md:grid-cols-2 gap-6 items-center` com ordem por `imageSide`; `text` via `RichText` do lexical (`@payloadcms/richtext-lexical/react`). `divider.tsx`: `<hr className="border-border-custom">` ou `<div className="h-{4|8|12}">`. `icon-list.tsx`: `lucideIcon(name)` mapa nome→componente dos 30 (`import { Check, Star, … } from "lucide-react"`). `social.tsx`: SVGs inline simples por rede (sem lib). `people.tsx`, `timeline.tsx` (lista com borda esquerda verde e pontos).
- [ ] **Step 3: `index.ts`** — `BLOCK_COMPONENTS` (todos os puros) e `CLIENT_SAFE_SLUGS` (todos menos `richText`, `columns`, `list`, `mediaText`, `tabs` que usam `RichText`/`lexicalToHtml` — o Puck trata em Task 8).
- [ ] **Step 4: Testes** — `src/lib/cms-render.test.ts`: `hideOnClass` (3 casos). Smoke de render: `react-dom/server` `renderToStaticMarkup(<HeroBlock block={{title:"Oi"}} />)` contém `Oi` — só se o node:test conseguir importar TSX (`--experimental-strip-types` não transforma JSX); **se não**, pular smoke e documentar (verificação visual na Task 12).
- [ ] **Step 5: typecheck, testes, commit** — `feat(cms): blocos como componentes puros compartilhados + hero, cards, CTA, números, imagem+texto, divisor, botões, lista com ícones, redes, pessoas, linha do tempo`.

---

### Task 6: FAQ (schema), abas, depoimentos, carrossel, Instagram, X, embed, vídeo, trecho, contagem regressiva

**Files:**
- Create: `src/components/payload/blocks/{faq,tabs,testimonials,carousel,instagram,x-post,embed,snippet,countdown}.tsx`, `src/components/payload/blocks/countdown-client.tsx`, `src/components/payload/blocks/tabs-client.tsx`, `src/components/payload/blocks/carousel-client.tsx`, `src/lib/data/snippets.ts`, `src/lib/countdown.ts`, `src/lib/countdown.test.ts`
- Modify: `page-blocks.tsx`, `video.tsx` (provider Vimeo: `https://player.vimeo.com/video/{id}`)

- [ ] **Step 1: Teste puro** `countdown.test.ts`: `splitCountdown(msLeft)` → `{d,h,m,s}`; `nextMatchFor(data: TeamPageData)` → `todayMatch ?? upcomingMatches[0] ?? null` com `timestamp`.
- [ ] **Step 2: Componentes** — `faq.tsx`: `<details className="group rounded-lg border …"><summary className="cursor-pointer …">` + JSON-LD `FAQPage` (`<script type="application/ld+json">`) quando `block.schema !== false`. `tabs-client.tsx` ("use client"): botões `role="tab"` + painel; o conteúdo richText é convertido no server (`tabs.tsx` server chama `lexicalToHtml` por aba e passa `html[]` pro client). `testimonials.tsx` (grid ou `flex overflow-x-auto snap-x`). `carousel-client.tsx` (scroll-snap + setas, sem lib; `aspect-video`/`aspect-[4/3]`/`aspect-square`). `instagram.tsx`: `<blockquote class="instagram-media" data-instgrm-permalink=…>` + `<InstagramEmbedLoader/>` (`@/components/article/instagram-embed`). `x-post.tsx`: `<blockquote class="twitter-tweet"><a href=url/>` + `<TweetEmbedLoader/>`. `embed.tsx`: `<div dangerouslySetInnerHTML={{__html: block.html}} style={{minHeight: block.height}} />` + `note`. `snippet.tsx` (server): `getSnippet(id)` de `src/lib/data/snippets.ts` (`unstable_cache` tag `snippets`, depth 2, null em erro) → `(doc.layout||[]).map(b => b.blockType === "snippet" ? null : <PageBlock block={b} pageWidth={pageWidth}/>)`. `countdown.tsx` (server): resolve time (`resolveTeam` já existe em data-blocks → exportar) → `getTeamPageDataFor` → `nextMatchFor` → se `matchId` informado, `getMatchDetail(matchId)` → passa `{ home, away, homeId, awayId, timestamp, league, broadcast? }` pro `CountdownClient` (conta d/h/m/s a cada 1 s; se `timestamp <= now` mostra "Começou" e link pra página do jogo quando existir href). Em erro/sem jogo → `null`.
- [ ] **Step 3: `page-blocks.tsx`** — cases novos; `pageWidth` propagado pro `snippet`.
- [ ] **Step 4: typecheck, testes, commit** — `feat(cms): FAQ com schema, abas, depoimentos, carrossel, Instagram, X, embed HTML, vídeo Vimeo, trecho e contagem regressiva`.

---

### Task 7: Formulários — render no site

**Files:**
- Create: `src/components/payload/blocks/form-block.tsx` (server), `src/components/forms/form-renderer.tsx` (client), `src/lib/forms.ts`, `src/lib/forms.test.ts`
- Modify: `page-blocks.tsx`

- [ ] **Step 1: Teste puro** `forms.test.ts`: `toSubmissionData(fields, values)` → `[{field,value}]` só pros campos de dado (ignora `message`), checkbox → `"true"/"false"`; `validateRequired(fields, values)` → lista de nomes faltando; `fieldWidthClass("50")` → `sm:w-1/2`.
- [ ] **Step 2: `forms.ts`** (puro) + `form-renderer.tsx` ("use client"): props `{ form: { id, title, fields[], submitButtonLabel, confirmationType, confirmationMessageHtml?, redirectUrl? }, compact }`; renderiza inputs por `blockType` (text/email/number → `<input>`, textarea, select/radio → opções, checkbox, message → html); honeypot `<input name="website" tabIndex={-1} className="hidden">`; submit `POST /cms-api/form-submissions` `{ form: form.id, submissionData }` (JSON, `Content-Type: application/json`); estados `enviando…`/erro "Não foi possível enviar. Tente de novo."; sucesso → mensagem (html) ou `window.location.assign(redirectUrl)`. Classes do site (`rounded-lg border border-border-custom px-3 py-2 text-sm`, botão `bg-green text-white`).
- [ ] **Step 3: `form-block.tsx`** (server): `block.form` populado (depth 2) ou `payload.findByID("forms")`; converte `confirmationMessage` (richText) com `lexicalToHtml`; `redirect` → `redirect.url` ou página relacionada (`/paginas/{slug}` ou `path`); passa pro `FormRenderer`. Null se o form não existe.
- [ ] **Step 4: Commit** — `feat(cms): bloco Formulário (plugin oficial) renderizado no site com respostas no CMS`.

---

### Task 8: Construtor fiel — CSS do site, mini-preview de dados, todos os blocos no Puck, trechos, JSON

**Files:**
- Create: `src/app/api/cms/site-css/route.ts`, `src/app/(site)/cms-block-preview/page.tsx`, `src/cms/puck/block-frame.tsx`, `src/cms/puck/fields-rich.ts`
- Modify: `src/cms/puck/fields.ts`, `config.editor.tsx`, `config.server.tsx`, `to-block.ts` (+ test), `editor.tsx`

- [ ] **Step 1: Testes** (`to-block.test.ts`): um caso por componente novo (Hero, Cards, Cta, Faq, Testimonials, Stats, MediaText, IconList, Tabs, Divider, Carousel, Buttons, Social, People, Timeline, Instagram, XPost, Embed, FormBlock, Countdown, Snippet) verificando `blockType` e 1-2 campos; `Snippet` com `snippet:{id:3}` → `{blockType:"snippet", snippet:3}`.
- [ ] **Step 2: `site-css/route.ts`** — `GET`: exige usuário (`payload.auth({headers})`), faz `fetch(`http://127.0.0.1:${process.env.PORT||3000}/termos-de-uso`, { cache: "no-store" })`, extrai com regex `href="(/_next/static/[^"]+\.css)"`, devolve `{ hrefs, bodyClass }` (classe do `<body>` extraída) com `Cache-Control: private, max-age=600`; erro → `{ hrefs: [] }`.
- [ ] **Step 3: `cms-block-preview/page.tsx`** — `force-dynamic`, noindex; `searchParams.b` = base64url de JSON `{ block, width }`; `assertPreviewAccess()`; renderiza `<div className="mx-auto max-w-[1240px] p-4"><PageBlock block={block} pageWidth={width||"wide"} /></div>` + script inline que faz `parent.postMessage({ pdbPreviewHeight: document.body.scrollHeight, id: searchParams.id }, "*")` no load e em `ResizeObserver`.
- [ ] **Step 4: `block-frame.tsx`** ("use client") — `BlockFrame({ block, id })`: `<iframe src={`/cms-block-preview?b=${b64}&id=${id}`} style={{ width: "100%", height, border: 0 }} />` com listener de `message` ajustando `height` (min 120). Usado pelos componentes de dados no `config.editor.tsx` (TeamWidget, Standings, Scorers, NewsFeed, LiveMatch, TodayGames, Countdown, FormBlock, Snippet, Text/RichText-dependentes: MediaText, Tabs).
- [ ] **Step 5: `fields-rich.ts`** — `FIELDS` dos 21 novos (array fields com `arrayFields`, `external` pra mídia: `mediaExternal` listando `/cms-api/media?limit=40&depth=0&where[mimeType][like]=image` com `getItemSummary` mostrando `filename` e miniatura via `renderItem`? — Puck `external` suporta `mapRow`; usar `mapRow: (i) => ({ Imagem: <img src={i.url} width={48}/>, Nome: i.filename })`; `showSearch`). `to-block.ts`: `Image`/upload externals viram `{ url, alt }` objetos (os componentes aceitam `image.url`).
- [ ] **Step 6: `config.editor.tsx`** — componentes novos: os client-safe renderizam o **mesmo** componente de `blocks/*` (import direto; são puros); os que dependem de server (MediaText, Tabs, FormBlock, Countdown, Snippet, dados) usam `BlockFrame`. `overrides.iframe`: `useEffect` que faz `fetch("/api/cms/site-css")` e injeta `<link rel="stylesheet">` por href + `document.body.className = bodyClass` + `<base href="/">`; `iframe={{ syncHostStyles: false }}` (não misturar CSS do admin). Categorias = grupos do drawer (Texto e mídia, Layout, Destaques, Interação, Incorporar, Dados ao vivo, Trechos).
- [ ] **Step 7: `config.server.tsx`** — `viaBlock` pros novos; `Snippet` idem.
- [ ] **Step 8: `editor.tsx`** — botões "Exportar JSON" (copia `puckData`) e "Importar JSON" (textarea + validação `content[]` + `type` ∈ componentes) e "Inserir trecho" (external listando `/cms-api/snippets` → insere componente `Snippet`).
- [ ] **Step 9: gen-importmap (sem componente admin novo — conferir), typecheck, testes, commit** — `feat(cms): Construtor com CSS real do site, dados ao vivo no canvas, 21 blocos novos, trechos e JSON`.

---

### Task 9: Trechos no painel lateral + dashboard

**Files:**
- Modify: `src/cms/components/template-tools.tsx`, `src/app/(payload)/custom.scss`
- Create: `src/cms/components/dashboard-shortcuts.tsx`, modify `payload.config.ts` (`admin.components.beforeDashboard: ["@/cms/components/dashboard-shortcuts#DashboardShortcuts"]`)

- [ ] **Step 1: TemplateTools** — seção "Trechos": select de trechos (`/cms-api/snippets?limit=100&sort=title`) + "Inserir no fim da página" (GET draft → `layout = [...layout, { blockType: "snippet", snippet: id }]` → PATCH draft → reload); "Salvar blocos como trecho": input "do bloco nº ___ ao nº ___" (1-based, default tudo) + título → `POST /cms-api/snippets` com `stripIds(layout.slice(a-1,b))`. Confirmações com `Modal`.
- [ ] **Step 2: `DashboardShortcuts`** (server component): lê `user.roles`; grade de cards (`<a>`) com `Gutter`/`Card` do `@payloadcms/ui` ou markup próprio com classes `pdb-dash`: Nova página (`/cms/collections/pages/create`), Páginas, Modelos, Trechos, Formulários, Respostas (editor+), Textos e SEO (seo+), Configurações do site (seo+), Posts, Ver o site (`/`), Guia (link pra `/cms-guia` → página estática `src/app/(site)/cms-guia/page.tsx` noindex com o passo a passo da doc, só logado via `assertPreviewAccess`).
- [ ] **Step 3: importMap, typecheck, commit** — `feat(cms): inserir/salvar trechos no painel e atalhos no dashboard por papel`.

---

### Task 10: Textos e SEO lidos do Payload; `buildMetadata` nas 36 rotas; painel antigo aposentado

**Files:**
- Create: `src/lib/data/site-texts.ts`, `src/lib/seo/build-metadata.ts`, `src/lib/seo/build-metadata.test.ts`
- Modify: `src/components/editable.tsx`, `src/app/(site)/layout.tsx`, `src/components/seo/site-schema.tsx`, 36 `page.tsx` (lista na spec §7 — exceto `(payload)/cms`, `cms-preview/*`), `src/app/(site)/painel-pdb-9x/paginas/*` (vira redirect), `src/app/(site)/painel-pdb-9x/layout.tsx` (tira o item), `src/components/studio/panel-menu.tsx`, `src/middleware.ts` (remover `/api/page-overrides`)
- Delete: `src/app/api/page-overrides/route.ts`, `src/lib/data/editable-content-store.ts`

- [ ] **Step 1: Teste** `build-metadata.test.ts`: `mergeMetadata(defaults, doc)` — doc null → defaults iguais (deep-equal); `metaTitle` sobrescreve `title` (string ou `{absolute}` preservando o shape), `metaDescription` sobrescreve `description` e `openGraph.description`; `noindex` → `robots: { index: false, follow: false }`; `matchRoute("/noticias/brasileirao", ["/noticias/:categoria", "/"])` → `"/noticias/:categoria"`.
- [ ] **Step 2: `site-texts.ts`** — `getSiteSettings()` (`unstable_cache` tag `siteSettings`, 300 s; null em erro), `getPageTexts(route)` (`unstable_cache` tag `pageTexts`; busca exata, senão padrão `:param` via `matchRoute`), `textValue(doc, key)`.
- [ ] **Step 3: `editable.tsx`** — `getEditableText(id)`: se `id.startsWith("site.")` → do global (`siteName`, `metaTitleDefault`, `metaDescriptionDefault`, `social.*`) com fallback `EDITABLE[id].default`; senão → `getPageTexts(EDITABLE[id].page)` → `texts[key=id].value` → default. Remover `getEditableValues`.
- [ ] **Step 4: `build-metadata.ts`** — `export async function buildMetadata(route, defaults)`: `mergeMetadata(defaults, await getPageTexts(route))` (try/catch → defaults).
- [ ] **Step 5: 36 rotas** — em cada `generateMetadata`/`export const metadata`, envolver: `return buildMetadata("/rota", { ...objeto atual... })`; `export const metadata = {…}` vira `export async function generateMetadata() { return buildMetadata("/rota", {…}); }`. Rotas dinâmicas usam o padrão (`"/noticias/:categoria"`, `"/futebol/selecoes/:slug"`, `"/autor/:slug"`, `"/artigos/:slug"`, `"/futebol/craque/:slug"`, `"/futebol/copa-do-mundo/fase/:fase"`, jogos: `"/futebol/copa-do-mundo/jogo/:data/:slug"` etc.). 4 commits por lote (esportes; futebol; notícias/autor/artigos; sp/tênis/outros). Resultado sem doc = idêntico (checar `curl | grep <title>` antes/depois no dev na Task 12).
- [ ] **Step 6: Aposentar painel** — `painel-pdb-9x/paginas/page.tsx` → `permanentRedirect("/cms/collections/pageTexts")`; remover item do menu e `panel-menu.tsx`; apagar `/api/page-overrides` e o store; `middleware.ts` sem `/api/page-overrides`.
- [ ] **Step 7: typecheck (vai apontar todo uso restante do store), testes, commits.**

---

### Task 11: Papéis aplicados (access por collection e campo) + escondendo no admin

**Files:**
- Modify: `src/payload.config.ts` (posts, teams, authors, sponsors, matchComments, municipalGames, media), `src/cms/collections/{pages,page-templates,snippets,page-texts}.ts`, `src/cms/blocks/rich.ts` (embed.html access), `src/cms/lib/access.ts` (+ `seoFieldsOnly`)

- [ ] **Step 1: Regras** — tabela da spec §8: `read` publishedOrLogged (posts/pages/teams) ou anyLogged; `create/update` editorOrAdmin; `delete` admin (teams/sponsors/authors/users/form-submissions) ou editorOrAdmin (posts/pages/templates/snippets/media/forms). `pageTexts`/`siteSettings` update seoOrEditorOrAdmin. **Papel `seo` em posts/pages/teams**: `update: seoOrEditorOrAdmin` na collection, e TODOS os campos que não são `seo.*`/`seoJogoHoje…` recebem `access: { update: fieldEditorOrAdmin }` — implementar com um helper `lockFieldsExceptSeo(fields: Field[]): Field[]` que percorre recursivamente (tabs/groups/rows) e adiciona `access.update = fieldEditorOrAdmin` em campos com `name` fora da allowlist (`seo`, `seoJogoHoje`, `seoOndeAssistir`, `seoEscalacao`, `seoProximos`, `seoEstatisticas`, `metaTitle`, `metaDescription`, `noindex`). Teste: `lockFieldsExceptSeo` em uma árvore sintética (tabs → group → text) marca só os certos.
- [ ] **Step 2: `admin.hidden`** por papel: users (admin), teams/sponsors/authors/matchComments/municipalGames (editor+), form-submissions (editor+); `seo` vê posts/pages/teams/pageTexts/siteSettings/media.
- [ ] **Step 3: typecheck, testes, commit** — `feat(cms): papéis admin/editor/seo aplicados (access por collection e campo)`.

---

### Task 12: Deploy dev, seed, validação no browser, limpeza

- [ ] Snapshot "antes" (`/`, `/sobre`, `/futebol/copa-do-mundo`, `/nba`, `/tenis`, `/noticias`) com `<title>` e `<meta name=description>` + HTML normalizado.
- [ ] `git pushdev` → healthy; `payloadInitError` 0; `/cms-api/{pages,snippets,pageTexts,forms}?limit=1` 200/401; `/cms-api/globals/siteSettings` 200.
- [ ] **Seed** (`payload run`, container efêmero com `NODE_ENV=production PAYLOAD_DB_PUSH=false`, volume montado): (1) `users`: ivansjp → `["admin"]`, utopiaseo01 → `["seo"]`; usuários temporários `cms-editor@…` (editor) e `cms-seo@…` (seo); (2) `siteSettings` com os valores atuais (lendo `data/editable-content.json` + defaults de `EDITABLE`); (3) `pageTexts`: 1 doc por `page` distinto de `EDITABLE` (route = page; `texts` = só overrides existentes) + 1 doc por rota das 36 (seo vazio); (4) form "Contato" (nome, e-mail, mensagem; confirmação "Recebemos sua mensagem"; e-mail → contato@papodebola.com.br); (5) snippet "Rodapé institucional" (cta + social); (6) modelo "Landing completa" (hero, cards, stats, faq, cta, formBlock).
- [ ] **Browser** (agent-browser): como editor — drawer com 7 grupos e thumbnails; página rascunho com hero (imagem de fundo), cards, faq, countdown (Cruzeiro), formBlock (Contato), instagram, tabs; Live Preview; Construtor: CSS real (captura), hero editado ao vivo, Standings via mini-preview com dados reais, inserir trecho, exportar/importar JSON; painel: salvar blocos como trecho / inserir; enviar o formulário **no preview** (rascunho) → aparece em Respostas; `/painel-pdb-9x/paginas` → 308. Como seo — não vê Times/Usuários/Respostas; abre um post e só consegue mudar `seo.*` (tentar mudar título → recusado); edita "Textos e SEO" de `/` (meta description) → `curl` mostra a nova; reverte. Diff dos `<title>`/description "antes/depois" das 6 rotas sem doc de SEO = iguais; os 73 textos migrados: `/sobre` e Copa hub idênticos.
- [ ] Ajustes achados → commits `fix(cms): …` + `git pushdev`.
- [ ] **Limpeza**: página/rascunhos de teste, trecho/modelo de teste (manter os seeds deliberados), usuários temporários, respostas de teste (manter 1 como exemplo? não — apagar), containers efêmeros. psql: `users` só ivansjp/utopiaseo01.

---

### Task 13: Documentação, memória, grafo

- `docs/knowledge/2026-10-01-cms-elementor.md` (como usar cada bloco com capturas de referência, trechos, formulários e SMTP pendente, papéis e o que cada um vê, textos/SEO e como pedir à IA, Construtor, GOTCHAs, DDL/backup, decisões, pendências); `CLAUDE.md` (atualizar a subseção "CMS: criar páginas" + nova linha de envs SMTP); memória `cms_elementor.md` + `MEMORY.md`; `/graphify --update`. Commit só `CLAUDE.md`/`.env.example`.

### Task 14: Promote e verificação em prod

- `bash /home/ivan/promote.sh -y`; checagens: rotas de controle 200, `/cms` ok, `payloadInitError` 0, `<title>` das 6 rotas iguais ao de antes, `/cms-api/globals/siteSettings` 200; relato final com rulings, pendências (SMTP creds, CRON_SECRET) e próximos passos.

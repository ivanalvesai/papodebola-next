# Onde Assistir: implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** standardized "onde assistir" posts at `/onde-assistir/{slug}` (with a match-data card and rich blocks), a new `/onde-assistir` hub, a redesigned `/ao-vivo`, cross-listing cards with no duplicated content, and the 10 posts for the Nations League matches on 13/11 with professional covers.

**Architecture:** the post is a normal Payload post (`category: "Onde Assistir"` + `matchId`). `CATEGORY_HUB` sends it to `/onde-assistir/{slug}`. A new Lexical block, `matchInfo` (no migration), holds only the editorial data (channel). The rest of the card comes from the match (`getMatchEvent`/snapshot). Other pages render only a card that links to the canonical URL. Data comes from the snapshots/agenda already saved (golden rule), with no new live calls during render.

**Tech Stack:** Next.js 16 App Router (ISR + `generateStaticParams`), Payload 3 (Lexical blocks), Tailwind v4, node:test, sharp (cover on the server).

**Spec:** `docs/superpowers/specs/2026-11-12-onde-assistir-design.md`

## Global Constraints
- Post title: `{A} x {B}: onde assistir, horário e escalações`. Slug: `{a}-x-{b}-onde-assistir-horario-e-escalacoes`.
- Every route with `[param]` exports `revalidate` + `generateStaticParams` (it may return `[]`). Never `force-dynamic`, never `dynamicParams=false`, never a global `loading.tsx`.
- Every piece of sports data comes from the snapshot/agenda store (`withSnapshot`, `getStoredFootballAgenda`). No page may depend only on the live API.
- Posts **do not cite sources** (competing portals). Channels for 13/11 are in the spec table; Holanda x Grécia = ESPN + Disney+.
- Post authors alternate: Ivan Alves (authors id 1) and Lucas Lima (id 2).
- Covers 1200×675: flags/text between y≈30 and y≈420 (bottom area is for the home title overlay).
- Text sizes: no `text-[10px]`/`text-[11px]` in reading content (minimum `text-xs` = 13px).
- No icons unless asked (Ivan's rule), except the live dot that already exists.
- PT-BR copy with accents. Publish each post once it is ready (Ivan's explicit order for these 10).
- Never `git push --force`. Dev first (`git pushdev`), promote only with Ivan's ok.

## Review Focus
1. Post with no `matchId`, or a match missing from the snapshot → page renders without the card (no 500).
2. A match without referee/venue in the API → that section/line disappears; nothing invented.
3. Category "Onde Assistir" must stay out of the home and `/noticias` (silo), but show up on `/onde-assistir`, `/ao-vivo` and the NL hub.
4. `/ao-vivo` with the agenda empty (day with no games or store not filled yet) → friendly text plus a link to the posts; never an empty table.
5. Old URL `/[categoria]/[slug]` for a post in the category (`/onde-assistir/x` hitting the generic route) must not duplicate: the article's `url` is the canonical and the alternative route 308-redirects/404s.

---

### Task 1: Category, silo and post data (matchId + matchInfo)

**Files:**
- Modify: `src/lib/config.ts` (WP_CATEGORIES, CATEGORY_HUB)
- Modify: `src/lib/data/articles-payload.ts` (silo, `mapPost`, `extractStructured`)
- Modify: `src/types/article.ts`
- Test: `src/lib/data/onde-assistir.test.ts` (new)

**Interfaces:**
- Produces: `Article.matchId?: number`; `Article.watch?: { channels: string; confirmed: boolean }`; `extractWatchInfo(content): {channels:string;confirmed:boolean}|null` exported from `articles-payload.ts`; `WATCH_CATEGORY = "Onde Assistir"` exported from `config.ts`.

- [ ] Step 1: test
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { articleHref, WATCH_CATEGORY } from "../config.ts";
import { extractWatchInfo } from "./articles-payload.ts";
test("onde assistir mora em /onde-assistir/{slug}", () => {
  assert.equal(articleHref(WATCH_CATEGORY, "holanda-x-grecia-onde-assistir-horario-e-escalacoes"),
    "/onde-assistir/holanda-x-grecia-onde-assistir-horario-e-escalacoes");
});
test("extractWatchInfo lê o bloco matchInfo", () => {
  const content = { root: { children: [{ type: "block", fields: { blockType: "matchInfo", channels: "ESPN e Disney+", channelsConfirmed: true } }] } };
  assert.deepEqual(extractWatchInfo(content), { channels: "ESPN e Disney+", confirmed: true });
  assert.equal(extractWatchInfo({ root: { children: [] } }), null);
  assert.equal(extractWatchInfo(null), null);
});
```
If `articles-payload.ts` cannot be imported from node:test (Payload imports), move `walkBlocks`/`extractWatchInfo` to a new pure file `src/lib/watch-info.ts` and import that in the test and in `articles-payload.ts`.
- [ ] Step 2: `npm test` → FAIL.
- [ ] Step 3: implement. In `config.ts`: `export const WATCH_CATEGORY = "Onde Assistir";`, add `'Onde Assistir'` to WP_CATEGORIES, `"Onde Assistir": "/onde-assistir"` to CATEGORY_HUB. In `articles-payload.ts`: add "Onde Assistir" to the siloed list (line ~688: `["Craques","Casas de Apostas","Cupons","Onde Assistir"]`). In `mapPost`: `matchId: typeof p.matchId === "number" ? p.matchId : undefined, watch: extractWatchInfo(p.content) || undefined`. `extractWatchInfo`: walkBlocks, first `blockType === "matchInfo"` → `{ channels: String(f.channels||"").trim(), confirmed: !!f.channelsConfirmed }` (null if channels is empty).
- [ ] Step 4: `npm test` → PASS; `npx tsc --noEmit`.
- [ ] Step 5: commit `feat(onde-assistir): categoria, silo e dados do post`.

### Task 2: `matchInfo` block in the editor + referee in MatchEvent

**Files:**
- Modify: `src/payload.config.ts` (next to `productGrid`, ~line 575, in the shared richTextEditor blocks)
- Modify: `src/lib/data/articles-payload.ts` (converter `matchInfo: () => ""`; the card is rendered by the page)
- Modify: `src/lib/data/match-detail.ts` (`MatchEvent.referee: { name: string; country: string } | null`, filled in `normalizeEvent` from `raw.referee?.name` / `raw.referee?.country?.name`)

- [ ] Step 1: block
```ts
{
  slug: "matchInfo",
  labels: { singular: "Ficha do jogo (onde assistir)", plural: "Fichas do jogo" },
  fields: [
    { name: "channels", type: "text", required: true, label: "Onde assistir (canais)", admin: { description: 'Ex.: "ESPN e Disney+". O resto da ficha (data, hora, estádio, árbitro, bandeiras) sai do "ID do jogo" do post.' } },
    { name: "channelsConfirmed", type: "checkbox", label: "Transmissão confirmada", defaultValue: true },
  ],
},
```
- [ ] Step 2: converter `matchInfo: () => ""` (keeps the block out of the body HTML). Test in `onde-assistir.test.ts` if the converter is exported; otherwise covered by the visual check in Task 3.
- [ ] Step 3: referee in `normalizeEvent` + type; `npx tsc --noEmit`; `npm test`.
- [ ] Step 4: commit `feat(onde-assistir): bloco Ficha do jogo + árbitro no evento`. (Lexical blocks: no DDL; the build regenerates the importMap.)

### Task 3: Post route `/onde-assistir/[slug]` + Ficha card + SportsEvent

**Files:**
- Create: `src/app/(site)/onde-assistir/[slug]/page.tsx` (copy of `futebol/copa-do-mundo/[slug]/page.tsx` with `PREFIX = "/onde-assistir"`, same generateStaticParams/revalidate 1800 → **300** because of the live status)
- Create: `src/components/onde-assistir/match-info-card.tsx` (server)
- Create: `src/lib/data/watch.ts` (`getWatchMatch(matchId)`)
- Modify: `src/components/article/article-view.tsx` (optional `before?: ReactNode` prop rendered right after the cover; `extraSchema?: ReactNode`)

**Interfaces:**
- Produces: `getWatchMatch(id:number): Promise<WatchMatch|null>` with `WatchMatch = { id; home; away; homeId; awayId; timestamp; tournament; round?: string; venue: {stadium;city}|null; referee: {name;country}|null; statusType; homeScore; awayScore; href: string }`. Source: `getMatchEvent(id)` (snapshot/ISR) + `href` via `championshipMatchHref` (match-detail.ts) using the NL slug when `tournament` id = 10783; fallback href = null.
- `<MatchInfoCard m={WatchMatch} channels={string} confirmed={boolean} />`.

- [ ] Step 1: test for `getWatchMatch` mapping → write a pure function `toWatchMatch(event, href)` in `watch.ts` and test it in `onde-assistir.test.ts` (no venue → `venue:null`; country names translated with `translateCountry`).
- [ ] Step 2: card layout (white card, green top border):
  - Line 1: "LIGA DAS NAÇÕES · {round/group}" (text-xs, green, uppercase).
  - Middle: flag A (64px, `/api/team-img/{id}`) · name · "x" or score/minute · name · flag B.
  - Data grid (2 cols mobile, 4 desktop): Data (`sexta-feira, 13/11`), Horário (`16h45 (Brasília)`), Local (stadium, city), Árbitro (`name (country)`); cells without data don't render.
  - "Onde assistir" strip in green-light with the channels in bold; when `!confirmed`: "Grade sujeita a confirmação".
  - Button "Acompanhe o lance a lance →" (`href`).
- [ ] Step 3: page: if `article.category === WATCH_CATEGORY && article.matchId`, fetch `getWatchMatch` and pass `<MatchInfoCard>` in `before`; JSON-LD `SportsEvent` reusing `src/components/seo/sports-event-schema.tsx` (homeTeam/awayTeam/startDate -03:00/location/superEvent). Article without match → renders like a normal post.
- [ ] Step 4: `npm run gen:paths`; `npx tsc --noEmit`; `npm test`.
- [ ] Step 5: commit `feat(onde-assistir): rota do post + ficha do jogo`.

### Task 4: Watch-post queries + cross-listing card

**Files:**
- Modify: `src/lib/data/articles-payload.ts` + `src/lib/data/articles.ts`: `getWatchPosts({ tag?: string; matchIds?: number[]; limit?: number })` → `Article[]` (category = WATCH_CATEGORY, published, newest first).
- Create: `src/components/onde-assistir/watch-post-card.tsx` (16:9 cover, "ONDE ASSISTIR" label, title, `{date time} · {channels}`; link = `article.url`).
- Create: `src/components/onde-assistir/watch-posts-strip.tsx` (horizontal grid of cards, H2 passed by prop; null if empty).
- Modify: `src/app/(site)/futebol/futebol-internacional/liga-das-nacoes/page.tsx` (strip "Onde assistir os próximos jogos" with `getWatchPosts({ tag: "Liga das Nações", limit: 8 })`, before the news).
- Modify: `src/components/match/championship-match-page.tsx` / `match-preview.tsx` (if there is a post with `matchId` = this match → card "Onde assistir {A} x {B}" inside "Quando é e onde assistir").

- [ ] Step 1: test of a pure filter/sort (`sortWatchPosts` by match date, `null` last).
- [ ] Step 2: implement; tsc; test.
- [ ] Step 3: commit `feat(onde-assistir): cards cruzados (hub LN e página do jogo)`.

### Task 5: `/onde-assistir` hub

**Files:**
- Create: `src/app/(site)/onde-assistir/page.tsx` (revalidate 300)
- Create: `scripts/seed-pagina-onde-assistir.mjs` (CMS page slug `onde-assistir`: hero h1/subtitle, seo, layout with intro text + FAQ). **Draft** until Ivan approves.
- Modify: `src/lib/dedicated-pages.ts` (+ "onde-assistir"), `src/app/sitemap.ts` (+ `/onde-assistir`).

Structure: breadcrumb (Início › Onde Assistir) → H1 "Onde assistir futebol hoje: jogos, horários e canais" + subtitle → "Jogos de hoje" (agenda `getStoredFootballAgenda()` grouped by league; each match: time, teams with crests, channels from the post when there is one (`getWatchPosts({matchIds})`) or `getBroadcasters(league)`, link to the post or else to the match page) → "Onde assistir: próximos jogos" (grid of `WatchPostCard` grouped by match day: "Hoje", "Amanhã", "sábado, 14/11") → CMS blocks (intro, FAQ) → JSON-LD CollectionPage + ItemList (post URLs) + BreadcrumbList.
Metadata: title absolute "Onde assistir futebol hoje: jogos, horários e canais | Papo de Bola"; description "Saiba onde assistir aos jogos de futebol de hoje: horários, canais de TV e streaming, prováveis escalações e o lance a lance ao vivo no Papo de Bola."; canonical `/onde-assistir`; OG.

- [ ] Steps: gen:paths → tsc → test → commit `feat(onde-assistir): hub /onde-assistir`.

### Task 6: `/ao-vivo` redesigned

**Files:**
- Modify: `src/app/(site)/ao-vivo/page.tsx` (rewrite; revalidate 60)
- Create: `src/components/ao-vivo/live-board.tsx` (client: receives the initial groups and polls `/api/agenda` (existing route, check its contract) every 30s while there are live games)

Layout 1240px: breadcrumb → H1 "Jogos ao vivo hoje" + editable subtitle → "Ao vivo agora" (red cards) → "Ainda hoje" → "Encerrados", grouped by championship (league header with link to `champPath`). Card: crests, names, score/minute or time, line "{channels}" + links "Onde assistir" (post) and "Lance a lance" (`event.href`). Strip `WatchPostsStrip` "Onde assistir hoje". Empty → "Nenhum jogo ao vivo agora" + link to `/jogos-de-hoje/futebol` and `/onde-assistir`.
Data: `getStoredFootballAgenda()` (NOT `getTodayMatches`).
Metadata: title "Jogos ao vivo hoje: placares em tempo real e onde assistir | Papo de Bola"; description "Acompanhe os jogos de futebol ao vivo hoje com placar em tempo real, horários, onde assistir e lance a lance: Brasileirão, Liga das Nações, Champions e mais."; canonical `/ao-vivo`; JSON-LD CollectionPage + ItemList of SportsEvent.

- [ ] Steps: tsc → test → commit `feat(ao-vivo): página refeita no layout do site`.

### Task 7: Deploy to dev + visual approval
- [ ] `git pushdev`; in the dev build log, check ● for `/onde-assistir/[slug]` and that `/onde-assistir` and `/ao-vivo` are not ƒ.
- [ ] Run the seed (draft) and create **1 sample post** as a draft (Task 8) → Ivan reviews `/cms-preview/post/{slug}`, `/onde-assistir`, `/ao-vivo` and the NL hub on dev.
- [ ] Adjust whatever he asks for. Only then move on to the 10 posts.

### Task 8: Covers + 10 posts (13/11)

**Files:**
- Create: `scripts/capa-onde-assistir.mjs` (server, sharp): args `matchId`; real stadium background (existing medium 892 or the NL Wikimedia photo already used), dark gradient, two 220px circular flags with a white border and shadow from `/app/data/team-images/{id}.png`, "X" in the middle, top seal "LIGA DAS NAÇÕES · ONDE ASSISTIR" in green #00965E, line "Sexta, 13/11 · 16h45 · ESPN e Disney+" in white bold. Everything between y 30–420. Generates a png, uploads it as Payload media (alt "{A} x {B}: onde assistir") → returns the id.
- Create: `scripts/create-post-onde-assistir.mjs` (payload run): input JSON `{ matchId, channels, authorId, lead, comoChegam:[A,B], emJogo, destaques:[A,B], faq:[...] }` → Lexical with: paragraph lead; H2 "Ficha do jogo" + block `matchInfo`; H2 "Como chegam {A} e {B}" + paragraphs + block `statCard` "Situação no grupo" (rows from the saved table); H2 "O que está em jogo"; H2 "Escalações prováveis" + 2 blocks `lineup` (confirmed lineup from the API, otherwise the XI from `/api/lineup-suggest?teamId=`, labeled "provável", with the coach); H2 "Arbitragem e local" (only if available); H2 "Quem observar"; block `faq` (3–4 questions). tags ["Onde assistir","Liga das Nações",A,B]; category "Onde Assistir"; matchId; authorProfile alternating; seo.metaTitle = title; seo.metaDescription = "Saiba onde assistir a {A} x {B} pela Liga das Nações nesta sexta (13/11), às {hora}, {no estádio}. Veja canal, prováveis escalações e arbitragem."; publishedDate now; **published** (Ivan's order) — but the 1st one stays a draft until Task 7 is approved.
- Content: text written match by match (500–700 words), real context from the group table (the saved snapshot), revised with humanizer; no fonts/sources cited.
- [ ] Per match, in order (14h Moldávia x Cazaquistão first, then the 16h45 ones by group): cover → post → check on dev → publish → revalidate `/`, `/onde-assistir`, the post's path → next one.
- [ ] Log each published post in the spec's "Progresso" section (id, slug, author).

### Task 9: Production + SEO
- [ ] With Ivan's ok: promote (includes the perf commit 4fbecae), revalidate the paths, check TTFB/HIT in prod.
- [ ] Sitemaps: confirm the posts in `/sitemap.xml` and `/news-sitemap.xml`; resubmit news-sitemap in GSC; request indexing for `/onde-assistir` and the posts (Chrome, URL-prefix property).
- [ ] Update CLAUDE.md (section "Onde assistir": category, block, scripts) + memory.

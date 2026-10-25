# SEO + retenção ("teia do jogo") Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir os erros técnicos que o Google vê e transformar as páginas de time (89% dos cliques) em porta de entrada pro site: cada jogo linka a página do jogo, adversário, notícias e tabela; títulos dinâmicos; feed RSS + sitemap de notícias.

**Architecture:** Helpers puros e testáveis em `src/lib/` (sem imports `@/`, pra rodar no `node --test`), consumidos por componentes server do Next 16. O dado do jogo (`TeamMatch`) passa a carregar `href` e slugs dos times, então todo card linka sem chamadas extras à API. Schema do Payload só com DDL aditivo.

**Tech Stack:** Next.js 16 App Router, TypeScript, Payload 3 + Postgres, Tailwind v4, `node --test --experimental-strip-types`.

**Spec:** `docs/superpowers/specs/2026-10-25-seo-retencao-teia-do-jogo-design.md`

## Global Constraints

- Branch `development`; deploy: `git pushdev` → validar em development.papodebola.com.br → `git promote`. Nunca commitar na `master`.
- Só o dev consulta a AllSportsApi; nenhuma página que bate na API pode virar `force-dynamic` (ISR + polling).
- Nenhuma mudança pode aumentar chamadas à API por acesso: dado novo vem do que já é buscado (em cache) ou de chamadas com `revalidate ≥ 3600`.
- Schema: só DDL aditivo (CREATE/ADD), com backup antes, seguindo `payload_migrations_recipe`. Banco é compartilhado dev/prod.
- Nunca publicar post sem ordem do Ivan.
- Testes puros não importam `@/…` (o `node --test` não resolve alias): dependências entram por parâmetro.
- Fonte de leitura ≥ `text-xs` (13px); não usar `text-[10px]`/`text-[11px]` em conteúdo novo. Não adicionar ícones novos.
- Depois de deploy em prod: revalidar páginas afetadas e Purge Everything no Cloudflare.

## Review Focus

- Jogo de campeonato que não está em `TOURNAMENTS` (ex.: amistoso, estadual sem seasonId) → card sem link, sem quebrar.
- Time sem próximo jogo (fim de temporada / API fora) → título e H1 padrão, nunca "x undefined".
- Adversário fora dos 57 times → nome sem link.
- Post sem `teams` (os 430 antigos) → continua aparecendo pela tag.
- `/feed.xml` com 0 posts ou título com `&`/`<` → XML válido (escape).

---

### Task 1: Baseline do GSC

**Files:**
- Create: `scripts/gsc-report.mjs`
- Create: `docs/knowledge/2026-10-25-baseline-gsc.md`

- [ ] **Step 1:** Criar `scripts/gsc-report.mjs` reaproveitando a autenticação de `scripts/gsc-top-pages.mjs` (JWT RS256 → token, `webmasters.readonly`). Saída: totais 28d (cliques, impressões, CTR, posição), CTR por aba do time (`hub`, `proximos-jogos`, `jogo-hoje`, `onde-assistir`, `escalacao`, `estatisticas`), buckets de posição (1-3, 3-5, 5-10, 10-20, 20+) e top 20 páginas. `GSC_DAYS` configurável.
- [ ] **Step 2:** Rodar `node scripts/gsc-report.mjs > /tmp/b.txt` e colar o resultado em `docs/knowledge/2026-10-25-baseline-gsc.md`, junto com os achados dos logs do nginx (spec, seção Contexto).
- [ ] **Step 3:** Commit `chore(seo): script gsc-report + baseline 25/10`.

### Task 2: Ícones do manifest (fim do 404 de /favicon.svg)

**Files:** Modify: `src/app/manifest.ts`

- [ ] **Step 1:** Trocar `icons` por:

```ts
icons: [
  { src: "/simbolo-papo-de-bola.png", sizes: "512x512", type: "image/png", purpose: "any" },
  { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
],
```

(conferir o tamanho real de `public/simbolo-papo-de-bola.png` com `file`/`identify` e ajustar `sizes`).
- [ ] **Step 2:** `grep -rn "favicon.svg" src public` → nenhuma ocorrência.
- [ ] **Step 3:** Commit `fix(seo): manifest com ícones PNG (favicon.svg não existia → 404 em toda página)`.

### Task 3: 410 Gone pras URLs mortas

**Files:**
- Create: `src/lib/gone-paths.ts`, `src/lib/gone-paths.test.ts`
- Modify: `src/middleware.ts`, `package.json` (nada — `src/lib/*.test.ts` já está no glob)

**Interfaces:** Produces `isGonePath(pathname: string): boolean`.

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isGonePath } from "./gone-paths.ts";

test("prefixos do site de 2005 e cache do estático antigo são 410", () => {
  for (const p of ["/24horas/beladodia/x.jpg", "/papodemidia/coluna/", "/vidadecraque/a.jpg",
    "/especiais/galeria/x.jpg", "/fabiocunha/20050519.htm", "/pernambucoaqui/a.jpg",
    "/contagiro/z.jpg", "/index.htm", "/index24horas.jpg", "/PB2018v2.png", "/cache/home.json"])
    assert.equal(isGonePath(p), true, p);
});

test("rotas vivas não são 410", () => {
  for (const p of ["/", "/futebol/times/flamengo", "/noticias", "/cms-api/media/file/a.jpg", "/sp/santana-de-parnaiba"])
    assert.equal(isGonePath(p), false, p);
});
```

- [ ] **Step 2:** `npm test` → FAIL (módulo não existe).
- [ ] **Step 3: implementação**

```ts
// URLs do Papo de Bola antigo (site de 2005) e do estático (cache/*.json) que ainda
// são pedidas por bots. 410 diz ao Google que sumiram de vez (para de rastrear).
const GONE_PREFIXES = ["/24horas", "/papodemidia", "/vidadecraque", "/especiais/", "/fabiocunha",
  "/pernambucoaqui", "/contagiro", "/cache/"];
const GONE_EXACT = new Set(["/index.htm", "/index24horas.jpg", "/indexpapodemidia.jpg", "/PB2018v2.png"]);

export function isGonePath(pathname: string): boolean {
  if (GONE_EXACT.has(pathname)) return true;
  return GONE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p.endsWith("/") ? p : p + "/") || pathname.startsWith(p + "."));
}
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** No `src/middleware.ts`, antes de qualquer outra lógica: `if (isGonePath(req.nextUrl.pathname)) return new NextResponse("Gone", { status: 410 });` e garantir que o `matcher` cobre esses caminhos (se o matcher só pega `/painel-pdb-9x` etc., adicionar `"/24horas/:path*", "/papodemidia/:path*", "/vidadecraque/:path*", "/especiais/:path*", "/fabiocunha/:path*", "/pernambucoaqui/:path*", "/contagiro/:path*", "/cache/:path*", "/index.htm", "/index24horas.jpg", "/indexpapodemidia.jpg", "/PB2018v2.png"`). Conferir no `next.config.ts` se algum desses tem redirect 308 hoje (ex.: `/index.htm`) — o 410 substitui.
- [ ] **Step 6:** `npm run typecheck`; commit `fix(seo): 410 Gone pras URLs do site de 2005 e /cache/*.json`.

### Task 4: Mídia ausente → 404 (não 500)

**Files:** Modify: `src/app/(payload)/cms-api/[...slug]/route.ts` (gerado pelo Payload — envolver só o GET)

- [ ] **Step 1:** Reproduzir: `curl -sI https://www.papodebola.com.br/cms-api/media/file/sir-alex-ferguson-passa-mal-em-old-trafford-e-e-levado-ao-ho.jpg` → 500. Ver `docker logs papodebola-next-dev 2>&1 | grep -i ENOENT | tail` no servidor pra confirmar que é arquivo ausente.
- [ ] **Step 2:** Envolver o GET:

```ts
const payloadGET = REST_GET(config);
// Arquivo de mídia que sumiu do volume: o handler do Payload estoura 500 (ENOENT).
// Pro Google é 404 (some do índice de imagens) em vez de erro de servidor.
export const GET = async (req: Request, ctx: { params: Promise<{ slug: string[] }> }) => {
  const res = await payloadGET(req, ctx);
  if (res.status === 500 && new URL(req.url).pathname.startsWith("/cms-api/media/file/")) {
    return new Response("Not found", { status: 404 });
  }
  return res;
};
```

(o Payload pode regenerar esse arquivo num upgrade; deixar o comentário `/* EDITADO À MÃO: wrapper 404 */` no topo.)
- [ ] **Step 3:** Listar posts cuja capa aponta pra arquivo ausente: no servidor, `docker exec papodebola-next-dev ls /app/media` × `filename` da collection `media` (via `bash ~/run-seed.sh` com script que lista `media` e checa `fs.existsSync`). Registrar a lista no doc de conhecimento (correção das capas fica pro Ivan/editor).
- [ ] **Step 4:** typecheck; commit `fix(cms): mídia ausente responde 404 em vez de 500`.

### Task 5: Feed RSS + sitemap de notícias

**Files:**
- Create: `src/lib/seo/feeds.ts`, `src/lib/seo/feeds.test.ts`
- Create: `src/app/feed.xml/route.ts`, `src/app/news-sitemap.xml/route.ts`
- Modify: `next.config.ts` (redirects), `src/app/robots.ts`, `src/app/(site)/layout.tsx` (ou o layout raiz que tem o `<head>`)

**Interfaces:**
- Produces `type FeedItem = { title: string; url: string; description?: string; date: string /* ISO */; image?: string }`
- `buildRss(items: FeedItem[], site: { title: string; url: string; description: string }): string`
- `buildNewsSitemap(items: FeedItem[], nowMs: number, publication: string): string` (só itens com `date` nas últimas 48h)

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildRss, buildNewsSitemap } from "./feeds.ts";

const site = { title: "Papo de Bola", url: "https://www.papodebola.com.br", description: "Futebol" };

test("rss escapa XML e lista itens", () => {
  const xml = buildRss([{ title: "Fla & Flu <hoje>", url: "https://www.papodebola.com.br/a", date: "2026-10-25T12:00:00Z" }], site);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(xml, /Fla &amp; Flu &lt;hoje&gt;/);
  assert.match(xml, /<pubDate>Sun, 25 Oct 2026 12:00:00 GMT<\/pubDate>/);
});

test("rss vazio continua válido", () => {
  assert.match(buildRss([], site), /<channel>[\s\S]*<\/channel>/);
});

test("news sitemap só com as últimas 48h", () => {
  const now = Date.parse("2026-10-25T12:00:00Z");
  const xml = buildNewsSitemap([
    { title: "novo", url: "https://x/novo", date: "2026-10-25T08:00:00Z" },
    { title: "velho", url: "https://x/velho", date: "2026-10-20T08:00:00Z" },
  ], now, "Papo de Bola");
  assert.match(xml, /https:\/\/x\/novo/);
  assert.doesNotMatch(xml, /velho/);
  assert.match(xml, /<news:language>pt<\/news:language>/);
});
```

- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: implementação** (`src/lib/seo/feeds.ts`)

```ts
export type FeedItem = { title: string; url: string; description?: string; date: string; image?: string };

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function buildRss(items: FeedItem[], site: { title: string; url: string; description: string }): string {
  const body = items
    .map((i) => `<item><title>${esc(i.title)}</title><link>${esc(i.url)}</link><guid isPermaLink="true">${esc(i.url)}</guid>` +
      `<pubDate>${new Date(i.date).toUTCString()}</pubDate>` +
      (i.description ? `<description>${esc(i.description)}</description>` : "") +
      (i.image ? `<enclosure url="${esc(i.image)}" type="image/jpeg"/>` : "") + `</item>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>` +
    `<title>${esc(site.title)}</title><link>${esc(site.url)}</link><description>${esc(site.description)}</description>` +
    `<language>pt-BR</language><atom:link href="${esc(site.url)}/feed.xml" rel="self" type="application/rss+xml"/>${body}</channel></rss>`;
}

export function buildNewsSitemap(items: FeedItem[], nowMs: number, publication: string): string {
  const recent = items.filter((i) => nowMs - Date.parse(i.date) <= 48 * 3600 * 1000);
  const urls = recent
    .map((i) => `<url><loc>${esc(i.url)}</loc><news:news><news:publication><news:name>${esc(publication)}</news:name>` +
      `<news:language>pt</news:language></news:publication><news:publication_date>${new Date(i.date).toISOString()}</news:publication_date>` +
      `<news:title>${esc(i.title)}</news:title></news:news></url>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">${urls}</urlset>`;
}
```

- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Rotas. `src/app/feed.xml/route.ts`:

```ts
import { getArticles } from "@/lib/data/articles";
import { articleHref } from "@/lib/config";
import { buildRss } from "@/lib/seo/feeds";

export const revalidate = 900;
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function GET() {
  const { articles } = await getArticles({ perPage: 50 }).catch(() => ({ articles: [] as never[] }));
  const xml = buildRss(
    articles.map((a) => ({ title: a.title, url: BASE + articleHref(a), description: a.excerpt, date: a.date, image: a.image })),
    { title: "Papo de Bola", url: BASE, description: "Notícias de futebol brasileiro e mundial" }
  );
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
```

Antes de escrever, conferir os nomes reais dos campos de `Article` (`src/types`) e a assinatura de `articleHref` (memória `urls_noticia_por_categoria`); ajustar `a.date/a.excerpt/a.image` pros nomes reais. `src/app/news-sitemap.xml/route.ts` igual, com `buildNewsSitemap(items, Date.now(), "Papo de Bola")`, `revalidate = 600`, `Content-Type: application/xml`.
- [ ] **Step 6:** `next.config.ts` redirects: `{ source: "/feed", destination: "/feed.xml", permanent: true }`, `{ source: "/feed/", ... }`, `{ source: "/rss", ... }`. `robots.ts`: `sitemap: [\`${BASE}/sitemap.xml\`, \`${BASE}/news-sitemap.xml\`]`. Layout: `alternates: { types: { "application/rss+xml": "/feed.xml" } }` no `metadata` do layout raiz do site.
- [ ] **Step 7:** `npm run gen:paths` (pasta nova em `src/app` exige), `npm test`, `npm run typecheck`. Commit `feat(seo): feed RSS (/feed.xml) + sitemap de notícias; /feed e /rss redirecionam`.

### Task 6: H1 por aba do time

**Files:**
- Create: `src/lib/team-h1.ts`, `src/lib/team-h1.test.ts`, `src/components/team/team-h1.tsx`
- Modify: `src/app/(site)/futebol/times/[slug]/layout.tsx:76`

**Interfaces:** Produces `teamTabH1(pathname: string, name: string): string`.

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { teamTabH1 } from "./team-h1.ts";

test("H1 por aba", () => {
  const b = "/futebol/times/flamengo";
  assert.equal(teamTabH1(b, "Flamengo"), "Flamengo: notícias, jogos e classificação");
  assert.equal(teamTabH1(b + "/proximos-jogos", "Flamengo"), "Próximos jogos do Flamengo");
  assert.equal(teamTabH1(b + "/jogo-hoje", "Flamengo"), "Jogo do Flamengo hoje");
  assert.equal(teamTabH1(b + "/onde-assistir", "Flamengo"), "Onde assistir Flamengo hoje");
  assert.equal(teamTabH1(b + "/escalacao", "Flamengo"), "Escalação do Flamengo");
  assert.equal(teamTabH1(b + "/estatisticas", "Flamengo"), "Estatísticas do Flamengo");
  assert.equal(teamTabH1(b + "/", "Flamengo"), "Flamengo: notícias, jogos e classificação");
});
```

- [ ] **Step 2:** FAIL. **Step 3:**

```ts
const BY_TAB: Record<string, (n: string) => string> = {
  "proximos-jogos": (n) => `Próximos jogos do ${n}`,
  "jogo-hoje": (n) => `Jogo do ${n} hoje`,
  "onde-assistir": (n) => `Onde assistir ${n} hoje`,
  escalacao: (n) => `Escalação do ${n}`,
  estatisticas: (n) => `Estatísticas do ${n}`,
};
export function teamTabH1(pathname: string, name: string): string {
  const tab = pathname.replace(/\/+$/, "").split("/")[4] || "";
  return (BY_TAB[tab] || ((n: string) => `${n}: notícias, jogos e classificação`))(name);
}
```

- [ ] **Step 4:** PASS. **Step 5:** `src/components/team/team-h1.tsx` (`"use client"`, `usePathname()` → `<h1 className="text-xl font-bold text-text-primary">{teamTabH1(pathname, name)}</h1>`). No layout, trocar o `<h1>{team.name}</h1>` por `<TeamH1 name={team.name} />` (é SSR'd; o HTML já sai com o H1 certo). Nas views clássicas o título interno ("Próximos Jogos do X") continua `h2` — ok.
- [ ] **Step 6:** `npm run build` local não é necessário; typecheck + `curl` no dev depois do deploy (`grep -o '<h1[^>]*>[^<]*'`). Commit `fix(seo): H1 próprio em cada aba do time`.

### Task 7: `href` e slugs no TeamMatch

**Files:**
- Create: `src/lib/match-href.ts`, `src/lib/match-href.test.ts`
- Modify: `src/lib/data/team.ts:30-64` (interface + `normalizeTeamMatch`)

**Interfaces:**
- Produces `matchHref(m: { uniqueTournamentId: number; timestamp: number; homeId: number; awayId: number; home: string; away: string }, deps: { champSlugById: Record<number, string>; worldCupId: number; worldCupHref: (ts, hId, aId, h, a) => string; champHref: (slug, ts, hId, aId, h, a) => string }): string | null`
- `TeamMatch` ganha `uniqueTournamentId: number; href: string | null; homeSlug: string | null; awaySlug: string | null`.

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchHref } from "./match-href.ts";

const deps = {
  champSlugById: { 325: "brasileirao-serie-a" } as Record<number, string>,
  worldCupId: 16,
  worldCupHref: (ts: number, h: number, a: number) => `/futebol/copa-do-mundo/jogo/${ts}/${h}-${a}`,
  champHref: (s: string, ts: number, h: number, a: number) => `/futebol/${s}/jogo/${ts}/${h}-${a}`,
};
const base = { timestamp: 100, homeId: 1, awayId: 2, home: "A", away: "B" };

test("campeonato com página → href do campeonato", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325 }, deps), "/futebol/brasileirao-serie-a/jogo/100/1-2");
});
test("Copa → href da Copa", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 16 }, deps), "/futebol/copa-do-mundo/jogo/100/1-2");
});
test("torneio sem página ou dado faltando → null", () => {
  assert.equal(matchHref({ ...base, uniqueTournamentId: 999 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, timestamp: 0 }, deps), null);
  assert.equal(matchHref({ ...base, uniqueTournamentId: 325, homeId: 0 }, deps), null);
});
```

- [ ] **Step 2:** FAIL. **Step 3:**

```ts
type M = { uniqueTournamentId: number; timestamp: number; homeId: number; awayId: number; home: string; away: string };
type Deps = {
  champSlugById: Record<number, string>;
  worldCupId: number;
  worldCupHref: (ts: number, homeId: number, awayId: number, home: string, away: string) => string;
  champHref: (slug: string, ts: number, homeId: number, awayId: number, home: string, away: string) => string;
};
// Página do jogo a partir do torneio: campeonato com página → /futebol/{camp}/jogo/…,
// Copa → /futebol/copa-do-mundo/jogo/…; sem página (amistoso etc.) → null (card sem link).
export function matchHref(m: M, d: Deps): string | null {
  if (!m.timestamp || !m.homeId || !m.awayId) return null;
  if (m.uniqueTournamentId === d.worldCupId) return d.worldCupHref(m.timestamp, m.homeId, m.awayId, m.home, m.away);
  const slug = d.champSlugById[m.uniqueTournamentId];
  return slug ? d.champHref(slug, m.timestamp, m.homeId, m.awayId, m.home, m.away) : null;
}
```

- [ ] **Step 4:** PASS. **Step 5:** Em `team.ts`: adicionar os 4 campos ao `TeamMatch`; em `normalizeTeamMatch`, `uniqueTournamentId: event.tournament?.uniqueTournament?.id || 0`, e depois `href: matchHref(m, DEPS)`, `homeSlug: TEAM_SLUG_BY_ID[homeId] ?? null`, `awaySlug: …`. `DEPS` montado com `TOURNAMENT_BY_ID` (só torneios com `seasonId`), `worldCupId: 16` (constante já existente da Copa — `grep -rn "16" src/lib/data/worldcup*` pra reusar o nome), `worldCupMatchHref`, `championshipMatchHref`. `TEAM_SLUG_BY_ID` = `Object.fromEntries(ALL_CLUSTER_TEAMS.map(t => [t.id, t.slug]))` — conferir se `ALL_CLUSTER_TEAMS` inclui a Série B; se não, unir com os ids da collection `teams` não é possível de forma síncrona → aceitar só os do config nesta task e registrar.
- [ ] **Step 6:** `grep -rn "TeamMatch" src` → corrigir qualquer construção literal de `TeamMatch` (fixtures, snapshots) que o typecheck acusar, preenchendo `href: null, homeSlug: null, awaySlug: null, uniqueTournamentId: 0`.
- [ ] **Step 7:** typecheck + test; commit `feat(times): TeamMatch com href da página do jogo e slugs dos times`.

### Task 8: Cards de jogo e adversário viram links

**Files:**
- Create: `src/components/team/match-link.tsx`
- Modify: `src/components/team/match-hero.tsx`, `src/components/team/classic/proximos.tsx`, `src/components/team/classic/hub.tsx`, `src/components/team/classic/jogo-hoje.tsx`, `src/components/team/classic/onde-assistir.tsx`, `src/components/payload/team-blocks.tsx` (`TodayMatch`, `Upcoming`, `Results`)

**Interfaces:** Consumes `TeamMatch.href/homeSlug/awaySlug` (Task 7). Produces `<MatchLink match className>{children}</MatchLink>` (renderiza `<Link href>` se `href`, senão `<div>`) e `<TeamName id slug name />` (link pro time se `slug`).

- [ ] **Step 1:** `match-link.tsx`:

```tsx
import Link from "next/link";
import type { TeamMatch } from "@/lib/data/team";

export function MatchLink({ match, className, children }: { match: Pick<TeamMatch, "href">; className?: string; children: React.ReactNode }) {
  return match.href ? <Link href={match.href} className={className}>{children}</Link> : <div className={className}>{children}</div>;
}

export function TeamNameLink({ slug, name, className }: { slug: string | null; name: string; className?: string }) {
  return slug ? <Link href={`/futebol/times/${slug}`} className={className}>{name}</Link> : <span className={className}>{name}</span>;
}
```

Atenção: card inteiro clicável **e** nome do time linkado = `<a>` dentro de `<a>` (HTML inválido). Regra: o card linka a página do jogo; nomes dos times só viram link **fora** do card (no `MatchHero`, abaixo do placar, numa linha "Ver página do {adversário}").
- [ ] **Step 2:** `proximos.tsx`: trocar o `<div key={m.id} className="bg-card-bg …">` por `<MatchLink key={m.id} match={m} className="block bg-card-bg …">`. Fazer o mesmo nas listas de `hub.tsx`, `jogo-hoje.tsx`, `onde-assistir.tsx`, e em `Upcoming`/`Results` do `team-blocks.tsx` (aproveitar e trocar `text-[10px]` por `text-xs` nessas linhas).
- [ ] **Step 3:** `match-hero.tsx`: botão "Página do jogo →" quando `match.href`, e "Mais sobre o {adversário}" (link pro time) quando o adversário tem `slug` (descobrir o adversário: o time da página é `homeId === teamId` ? away : home — o `MatchHero` recebe só `match`; adicionar prop opcional `teamId`).
- [ ] **Step 4:** typecheck; `npm run dev` e abrir `/futebol/times/flamengo/proximos-jogos` → cards clicáveis, sem erro de hidratação (`<a>` aninhado) no console.
- [ ] **Step 5:** Commit `feat(times): cards de jogo linkam a página do jogo; link pro adversário`.

### Task 9: Campo "Times" nos posts + notícias do time

**Files:**
- Modify: `src/payload.config.ts` (collection `posts`), `src/lib/data/articles-payload.ts:591-630`, `src/lib/data/articles.ts:141` (opção `teamId`), `src/lib/data/team.ts:127`
- Create: `~/pdb-ddl-20261025-posts-teams.sql` (no servidor)

**Interfaces:** Produces `getArticles({ teamId?: number, tag?: string, … })` — com `teamId`, retorna posts com `teams.apiId = teamId` OU `tags.tag like nome`.

- [ ] **Step 1:** Ver o schema da collection `teams` (`grep -n 'slug: "teams"' -A40 src/payload.config.ts`): qual campo guarda o id da API (provável `apiId`/`teamId`). Adicionar em `posts.fields`, depois de `tags`:

```ts
{
  name: "teams",
  type: "relationship",
  relationTo: "teams",
  hasMany: true,
  label: "Times",
  admin: { description: "Times do post — a notícia aparece nas páginas desses times e dos jogos deles." },
},
{ name: "matchId", type: "number", label: "ID do jogo (opcional)", admin: { description: "Liga o post à página do jogo." } },
```

- [ ] **Step 2:** DDL pela receita (`payload_migrations_recipe`): backup `pg_dump`, `migrate:create` no container `pdb-migrate`, extrair **só** o que for novo — esperado: `ALTER TABLE posts ADD COLUMN match_id numeric;`, `ALTER TABLE _posts_v ADD COLUMN version_match_id numeric;`, e em `posts_rels`/`_posts_v_rels` `ADD COLUMN teams_id integer` + FK + índice (se `posts_rels` não existir, `CREATE TABLE`). Revisar: nenhum DROP. Aplicar em transação (`-v ON_ERROR_STOP=1`). Validar init do Payload (memória `payload_useastitle_virtual_incidente`): `curl -s dev/cms-api/posts?limit=1` = 200 e `docker logs … | grep payloadInitError` vazio.
- [ ] **Step 3:** `articles-payload.ts`: aceitar `teamId?: number; teamName?: string`; quando presente, `and.push({ or: [{ "teams.apiId": { equals: teamId } }, { "tags.tag": { like: teamName } }, { title: { like: teamName } }] })` (usar o nome real do campo de id da API em `teams`). Repassar em `getArticles`.
- [ ] **Step 4:** `team.ts:127`: `getArticles({ teamId: team.id, teamName: team.name, perPage: 10 })`.
- [ ] **Step 5:** typecheck; no dev, abrir `/futebol/times/mirassol` → seção de notícias com itens (casa título com "Mirassol").
- [ ] **Step 6:** Commit `feat(cms): campo Times/ID do jogo nos posts; notícias do time por relação, tag ou título`.

### Task 10: Rodapé de navegação em toda aba (`TeamCrossLinks`)

**Files:**
- Create: `src/lib/standings-window.ts`, `src/lib/standings-window.test.ts`, `src/components/team/team-cross-links.tsx`
- Modify: `src/components/payload/team-cms-page.tsx` (renderizar no fim de todas as variantes)

**Interfaces:** Produces `standingsWindow<T extends { teamId: number }>(rows: T[], teamId: number, radius: number): T[]`.

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { standingsWindow } from "./standings-window.ts";
const rows = Array.from({ length: 20 }, (_, i) => ({ teamId: i + 1 }));
test("janela centrada", () => assert.deepEqual(standingsWindow(rows, 10, 2).map((r) => r.teamId), [8, 9, 10, 11, 12]));
test("topo e fundo mantêm 5 linhas", () => {
  assert.deepEqual(standingsWindow(rows, 1, 2).map((r) => r.teamId), [1, 2, 3, 4, 5]);
  assert.deepEqual(standingsWindow(rows, 20, 2).map((r) => r.teamId), [16, 17, 18, 19, 20]);
});
test("time ausente → vazio", () => assert.deepEqual(standingsWindow(rows, 99, 2), []));
```

- [ ] **Step 2:** FAIL. **Step 3:**

```ts
export function standingsWindow<T extends { teamId: number }>(rows: T[], teamId: number, radius: number): T[] {
  const i = rows.findIndex((r) => r.teamId === teamId);
  if (i < 0) return [];
  const size = radius * 2 + 1;
  const start = Math.max(0, Math.min(i - radius, rows.length - size));
  return rows.slice(start, start + size);
}
```

(adaptar ao formato real de `StandingRow` — se o id estiver em `row.team.id`, mapear antes de chamar.)
- [ ] **Step 4:** PASS. **Step 5:** `team-cross-links.tsx` (server): três blocos — "Últimas do {time}" (`data.news.slice(0,4)`, link via `articleHref`), "{time} na tabela" (`standingsWindow`, link pro campeonato `/futebol/{teamTournament slug}`), "Próximo adversário" (link pro time se `awaySlug/homeSlug`, e pra página do jogo se `href`). Cada bloco some se vazio. Container `mx-auto max-w-[1240px] px-4 pb-8`.
- [ ] **Step 6:** Em `TeamCmsView`, envolver os 3 retornos com `<>{…}<TeamCrossLinks data={data} /></>`. (Todos os 57 times passam por aqui; o caminho clássico sem doc também deve renderizar — adicionar nas 6 `page.tsx` no ramo `Classic…` ou mover pra dentro de cada componente clássico; escolher o ponto único: um wrapper `TeamPageShell` usado nos dois ramos.)
- [ ] **Step 7:** typecheck/test; commit `feat(times): rodapé com notícias, tabela e próximo adversário em toda aba`.

### Task 11: Página de jogo rica + título por status

**Files:**
- Create: `src/lib/match-seo.ts`, `src/lib/match-seo.test.ts`, `src/components/match/match-preview.tsx`
- Modify: `src/app/(site)/futebol/[slug]/jogo/[data]/[match]/page.tsx`

**Interfaces:** Produces `championshipMatchSeo(f: { home: string; away: string; tournamentName: string; timestamp: number; status: "notstarted" | "inprogress" | "finished"; homeScore?: number | null; awayScore?: number | null }): { title: string; description: string }`.

- [ ] **Step 1: teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { championshipMatchSeo } from "./match-seo.ts";
const f = { home: "Flamengo", away: "Atlético-MG", tournamentName: "Brasileirão Série A", timestamp: Date.parse("2026-10-26T23:00:00Z") / 1000 };
test("futuro", () => assert.equal(championshipMatchSeo({ ...f, status: "notstarted" }).title, "Flamengo x Atlético-MG: horário, onde assistir e escalações (26/10)"));
test("ao vivo", () => assert.equal(championshipMatchSeo({ ...f, status: "inprogress" }).title, "Flamengo x Atlético-MG ao vivo - Brasileirão Série A"));
test("encerrado", () => assert.equal(championshipMatchSeo({ ...f, status: "finished", homeScore: 2, awayScore: 1 }).title, "Flamengo 2x1 Atlético-MG: resultado e lance a lance"));
test("encerrado sem placar cai no ao vivo/padrão", () => assert.match(championshipMatchSeo({ ...f, status: "finished" }).title, /Flamengo x Atlético-MG/));
```

- [ ] **Step 2:** FAIL. **Step 3:** implementar (data em America/Sao_Paulo via `toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",timeZone:"America/Sao_Paulo"})`; descriptions: futuro "Veja horário, estádio, onde assistir e a provável escalação de A x B pelo {torneio}."; encerrado "Resultado de A x B: placar, gols e lance a lance pelo {torneio}.").
- [ ] **Step 4:** PASS. **Step 5:** Na `page.tsx`, trocar o `title` fixo (`… ao vivo - …`, linha 62) por `championshipMatchSeo` com o status do `detail`/fixture já buscado (não adicionar fetch no `generateMetadata` além do que já existe).
- [ ] **Step 6:** `match-preview.tsx` (server), renderizado acima do `LiveMatch` quando o jogo ainda não terminou: resposta direta (data/hora/estádio), `BroadcastChannels league={tournamentName}`, links "Página do {casa}" / "Página do {fora}" (slug via `TEAM_SLUG_BY_ID` da Task 7), "Notícias dos dois times" (`getArticles({ teamId: homeId, teamName: home, perPage: 3 })` + o mesmo pro visitante, ambos já com ISR do `getArticles`), posição dos dois na tabela (`getChampionshipData(slug)` — já em cache e já usado no resolve). Sem chamadas novas à AllSportsApi. Escalação provável: reaproveitar `getTeamLastLineup(teamId, 3)` só se já estiver em cache ≥ 1h (conferir o `revalidate` dela; se < 3600, deixar de fora e registrar).
- [ ] **Step 7:** typecheck; dev: abrir um jogo futuro do Brasileirão (`curl` no sitemap → primeira URL `/futebol/brasileirao-serie-a/jogo/` com data futura) e um encerrado; conferir título e blocos.
- [ ] **Step 8:** Commit `feat(jogo): página de jogo de campeonato com pré-jogo, notícias e título por status`.

### Task 12: Títulos dinâmicos nas abas do time

**Files:**
- Modify: `src/lib/team-seo.ts`, `src/lib/team-seo.test.ts`, as 6 `page.tsx` de `src/app/(site)/futebol/times/[slug]/` (só `proximos`, `jogo-hoje`, `onde-assistir` mudam o `generateMetadata`), `proximos-jogos/page.tsx` (`revalidate`)

**Interfaces:** `teamSeo(doc, page, name, next?: { opponent: string; date: string; time: string; league: string } | null)`; placeholders `{adversario} {data} {hora} {campeonato}`.

- [ ] **Step 1: testes** (adicionar ao `team-seo.test.ts`; os 3 existentes continuam passando):

```ts
const next = { opponent: "Atlético-MG", date: "seg 26/10", time: "20h", league: "Brasileirão Série A" };
test("próximos com jogo → título dinâmico", () => {
  assert.equal(teamSeo(null, "proximos", "Flamengo", next).title, "Próximo jogo do Flamengo: x Atlético-MG, seg 26/10, 20h");
});
test("sem jogo → padrão", () => {
  assert.equal(teamSeo(null, "proximos", "Flamengo", null).title, defaultTeamSeo("proximos", "Flamengo").title);
});
test("placeholder no título do CMS", () => {
  const doc = { seoOndeAssistir: { metaTitle: "Onde ver {adversario} x Timão ({data})" } };
  assert.equal(teamSeo(doc, "ondeAssistir", "Corinthians", next).title, "Onde ver Atlético-MG x Timão (seg 26/10)");
});
test("placeholder sem jogo não vaza chave crua", () => {
  const doc = { seoOndeAssistir: { metaTitle: "Onde ver {adversario} x Timão" } };
  assert.equal(teamSeo(doc, "ondeAssistir", "Corinthians", null).title, defaultTeamSeo("ondeAssistir", "Corinthians").title);
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Implementar: `dynamicTeamSeo(page, name, next)` com os padrões do spec (próximos, jogoHoje "{time} x {adversario} hoje: horário e onde assistir", ondeAssistir "Onde assistir {time} x {adversario} hoje"); `fill(template, next)` substitui placeholders; se o template tem placeholder e `next` é null → cai no padrão estático. Ordem: título do CMS (preenchido) > dinâmico (se `next`) > padrão estático.
- [ ] **Step 4:** PASS. **Step 5:** Nas 3 páginas, `generateMetadata` pega o próximo jogo de `getTeamNextEvents(id)` (mesma chamada em cache da página, `dropStaleUpcoming`), formata `date` como "seg 26/10" e `time` como "20h"/"20h30" (America/Sao_Paulo) e passa como `next`; o adversário é o time que não é o da página. Na `jogo-hoje`, só passa `next` se o jogo é hoje. `proximos-jogos/page.tsx`: `revalidate = 3600`.
- [ ] **Step 6:** typecheck; commit `feat(seo): títulos das abas do time com adversário e data do próximo jogo`.

### Task 13: Correções do rastreamento pós-migração Payload

**Achados do rastreamento (25/10, 699 URLs do sitemap, jogos amostrados 1/15):** todas 200, 0 título duplicado, 0 canonical errado, 0 noindex indevido, 0 páginas lentas (>8s). Problemas:
- 20 hubs de time com "Nenhuma notícia encontrada" → resolvido pela Task 9 (verificar depois).
- `/sp/santana-de-parnaiba/municipal` sem `<h1>`.
- `/tenis/halle-2026` (torneio de junho) mostra "indisponível".
- `/jogos-de-hoje` com 153 palavras no HTML (conteúdo vem só no cliente).
- `/futebol/times/nottingham-forest/proximos-jogos` "Nenhum jogo agendado" (dado da API; sem ação de código).

**Files:** `src/app/(site)/sp/santana-de-parnaiba/municipal/page.tsx`, `src/app/sitemap.ts`, `src/app/(site)/tenis/halle-2026/page.tsx`, `src/app/(site)/jogos-de-hoje/page.tsx`

- [ ] **Step 1:** Municipal: o título principal da página vira `<h1>` (achar o heading atual no client component e trocar a tag; se o título vem de componente compartilhado, passar `as="h1"`).
- [ ] **Step 2:** Halle 2026: tirar `/tenis/halle-2026` do `sitemap.ts` e servir o snapshot arquivado em vez de "indisponível" se existir (`withSnapshot`); se não houver dado, `robots: { index: false }` na página (torneio encerrado, sem conteúdo).
- [ ] **Step 3:** `/jogos-de-hoje`: renderizar no servidor um resumo (lista de jogos de futebol de hoje da store `football-today.json`, que o prod só lê — memória `agenda_jogos_hoje_store`) + links pros esportes, pra o HTML inicial ter conteúdo. Sem chamada nova à API.
- [ ] **Step 4:** Commit por item; reexecutar o crawl nessas URLs contra o dev depois do deploy.

### Task 14: Modelo de pré-jogo + documentação + deploy

**Files:**
- Create: `docs/knowledge/2026-10-25-seo-teia-do-jogo.md`
- Modify: `CLAUDE.md` (seções SEO e Cluster de Times), memória

- [ ] **Step 1:** Modelo "Pré-jogo" no `/cms` (collection de modelos/snippets que o Studio já usa — memória `cms_elementor`: trechos): título "{Casa} x {Fora}: onde assistir, horário e escalações", seções Onde assistir / Horário e local / Como chegam / Prováveis escalações / Link "Acompanhe o jogo ao vivo" → página do jogo. Criar como **rascunho** via `bash ~/run-seed.sh` (nunca publicado).
- [ ] **Step 2:** `npm test && npm run typecheck`; `git pushdev`; validar no dev: `/futebol/times/flamengo/proximos-jogos` (H1, títulos, links), `/feed.xml`, `/news-sitemap.xml`, um jogo do Brasileirão, `/24horas/x.jpg` = 410, `/favicon.svg` não é mais pedido.
- [ ] **Step 3:** `git promote` (via `nohup` — memória `handoff_02out`); revalidar `/`, as abas dos 10 times principais e `/jogos-de-hoje/futebol`; pedir ao Ivan o Purge Everything no Cloudflare.
- [ ] **Step 4:** Doc de conhecimento + `/graphify --update`; atualizar CLAUDE.md e memória. Pendências pro Ivan: acesso GA4 à service account, enviar `/news-sitemap.xml` no GSC, Publisher Center do Google Notícias, capas quebradas listadas na Task 4.

# Instagram: artes + fila de aprovação + publicação — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- Every post published on the site becomes an Instagram draft in `/cms`, with feed and stories art plus an AI-written caption.
- Ivan approves each draft.
- Only the prod container publishes, through the Meta Graph API.

**Architecture:**
- **Pure core** (`src/lib/instagram/*.ts`, relative imports, tested with `node --test`): template choice, time suggestion, visual rotation, file names, captions, Meta client.
- **HTML templates** are rendered by headless Chromium (`puppeteer-core`) into PNG, then converted to JPEG by `sharp`. The files live on the shared volume `data/instagram/`.
- **Payload pieces:**
  - collection `instagramPosts`, with a custom endpoint for the buttons;
  - an `afterChange` hook on `posts`;
  - job task `instagramPublish`, run by the existing 1/min cron, prod only.

**Tech Stack:**
- Next.js 16 and Payload 3.85 (Postgres)
- `puppeteer-core` and Alpine `chromium`
- `sharp` (already installed)
- Anthropic Messages API, via raw `fetch` as in `src/lib/services/image-agent.ts`
- Meta Graph API

**Spec:** `docs/superpowers/specs/2026-11-13-instagram-artes-design.md`

## Global Constraints

- **Formats:**
  - Feed: 1080×1350 JPEG.
  - Stories: 1080×1920 JPEG.
  - JPEG quality 90, under 8 MB.
- **Safe areas:**
  - Stories: no text in the top 250 px or the bottom 340 px.
  - Feed: 60 px margin.
- Stories carry the text "Leia em papodebola.com.br".
- **Fonts:** Anton and Barlow Condensed (OFL) for headlines, Open Sans for information. Load them locally from `src/lib/instagram/fonts/`, never from Google Fonts at render time.
- **Golden rule and speed:** art, crests and backgrounds are read from disk. The sports API is used at most once (`getMatchDetail`) when there is no snapshot.
- **Access:** only admin and editor; the `seo` role does not see the collection (`editorOrAdmin`, `hiddenUnlessEditor` from `src/cms/lib/access.ts`).
- **Nothing goes to Instagram without approval.**
- **Publishing:**
  - Only prod publishes. Jobs run through the cron that calls `/cms-api/payload-jobs/run` with `CRON_SECRET`.
  - The URL handed to Meta is always `https://www.papodebola.com.br/api/instagram/media/{file}`.
- **Media route:** the file name is validated with `^[0-9]+-(feed|story)-[a-f0-9]{8}\.jpg$`.
- **Cleanup:** art files are deleted after 7 days; the record stays.
- **Envs** go only in the server `.env.local`, never in code or logs:
  ```
  META_PAGE_TOKEN
  IG_USER_ID
  META_GRAPH_VERSION=v23.0
  CHROMIUM_PATH
  ```
- **Schema:** additive DDL only, following `payload_migrations_recipe`: backup, then CREATE/ADD COLUMN, then dry-run.
  - Never name an array `texts`, `numbers` or `rels`.
  - In ephemeral containers, always set `NODE_ENV=production PAYLOAD_DB_PUSH=false`.
- **Admin components:**
  - Every new admin component needs a hand-added line in `src/app/(payload)/cms/importMap.js` (import plus a map key). The build's `gen-importmap.mjs` may regenerate it, and the committed file is the source of truth.
  - No icons in the UI unless Ivan asks.
- **Deploy:**
  - `git pushdev` after each stage. Promote only with Ivan's order.
  - Never `git push --force`.
  - Never publish CMS content without Ivan's order.
- **Tests:**
  - Command: `npm test` (node --test with `--experimental-strip-types`).
  - Test files import `./x.ts` with the extension (`allowImportingTsExtensions` is on).

## Review Focus

1. **Two containers hit the hook at once** (the database is shared). Expectation: exactly one `instagramPosts` row per post. Pinned in Task 7, where a duplicate-key error is swallowed.
2. **Double "Publicar agora" click, or the cron overlapping a manual run.** Expectation: one Instagram post. Pinned in Task 10 with the `claimForPublish` conditional-update test.
3. **Very long team names or titles** (e.g. "Irlanda do Norte x Bósnia e Herzegovina"). Expectation: the text shrinks and never overflows the safe area. Pinned in Task 3 with `fitFontSize` tests.
4. **Night-stadium layout.** Expectation: the time strip never overlaps the crests, since Ivan flagged this. Pinned in Task 3 with the geometry test `layoutBoxes`.
5. **Path traversal or arbitrary file reads through the media route** (`..%2F`, `.png`, an uppercase hash). Expectation: 404. Pinned in Task 1 with `isValidMediaFile` tests.

---

## Stage 1 — Artes (ends with a visual approval by Ivan)

### Task 1: Pure core helpers

**Files:**
- Create: `src/lib/instagram/core.ts`
- Test: `src/lib/instagram/core.test.ts`
- Modify: `package.json` (add `src/lib/instagram/*.test.ts` to the `test` script)

**Interfaces:**
- Produces:
  - `type Template = "jogo" | "noticia"`
  - `type Layout = "diag-up" | "diag-down" | "green-band" | "footer-cut" | "stadium"`
  - `type Visual = { layout: Layout; bg: string }`
  - `pickTemplate(p: { category?: string | null; matchId?: number | null; tags?: { tag?: string | null }[] | null }): Template`
  - `suggestPublishAt(kickoffSec: number | null, nowMs: number): string`, returning ISO
  - `pickVisual(recent: Visual[], bgs: string[], rnd?: () => number): Visual`
  - `mediaFileName(id: number, kind: "feed" | "story", hash: string): string`
  - `isValidMediaFile(name: string): boolean`
  - `LAYOUTS: Layout[]`

- [ ] **Step 1: Write the failing tests** in `src/lib/instagram/core.test.ts`

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { pickTemplate, suggestPublishAt, pickVisual, mediaFileName, isValidMediaFile, LAYOUTS, type Visual } from "./core.ts";

test("guia de jogo pela categoria, tag ou matchId", () => {
  assert.equal(pickTemplate({ category: "Onde Assistir" }), "jogo");
  assert.equal(pickTemplate({ tags: [{ tag: "Onde assistir" }] }), "jogo");
  assert.equal(pickTemplate({ matchId: 123 }), "jogo");
  assert.equal(pickTemplate({ category: "Futebol" }), "noticia");
});

test("horário sugerido: 2h antes do apito, ou agora se já passou", () => {
  const now = Date.UTC(2026, 10, 14, 10, 0);
  const kick = Date.UTC(2026, 10, 14, 19, 0) / 1000;
  assert.equal(suggestPublishAt(kick, now), new Date(Date.UTC(2026, 10, 14, 17, 0)).toISOString());
  assert.equal(suggestPublishAt(Date.UTC(2026, 10, 14, 11, 0) / 1000, now), new Date(now).toISOString());
  assert.equal(suggestPublishAt(null, now), new Date(now).toISOString());
});

test("rodízio: não repete layout nem fundo dos últimos 3", () => {
  const recent: Visual[] = [
    { layout: "diag-up", bg: "a.jpg" }, { layout: "stadium", bg: "b.jpg" }, { layout: "green-band", bg: "c.jpg" },
  ];
  for (let i = 0; i < 50; i++) {
    const v = pickVisual(recent, ["a.jpg", "b.jpg", "c.jpg", "d.jpg"], Math.random);
    assert.ok(!["diag-up", "stadium", "green-band"].includes(v.layout));
    assert.equal(v.bg, "d.jpg");
  }
});

test("rodízio: biblioteca pequena demais ainda devolve algo", () => {
  const v = pickVisual([{ layout: "diag-up", bg: "a.jpg" }], ["a.jpg"], () => 0);
  assert.ok(LAYOUTS.includes(v.layout));
  assert.equal(v.bg, "a.jpg");
});

test("nome de arquivo + validação da rota de mídia", () => {
  const n = mediaFileName(42, "feed", "0a1b2c3d");
  assert.equal(n, "42-feed-0a1b2c3d.jpg");
  assert.ok(isValidMediaFile(n));
  for (const bad of ["../42-feed-0a1b2c3d.jpg", "42-feed-0A1B2C3D.jpg", "42-feed-0a1b2c3d.png", "42-reel-0a1b2c3d.jpg", "x-feed-0a1b2c3d.jpg", "42-feed-0a1b2c3d.jpg/..", ""]) {
    assert.equal(isValidMediaFile(bad), false, bad);
  }
});
```

- [ ] **Step 2: Add the glob to `package.json` "test"** (append ` src/lib/instagram/*.test.ts`), then run `npm test`.
  Expected: FAIL, "Cannot find module './core.ts'".

- [ ] **Step 3: Implement** `src/lib/instagram/core.ts`

```ts
// Núcleo puro do Instagram (sem Payload, sem React): testável com node --test.
export type Template = "jogo" | "noticia";
export type Layout = "diag-up" | "diag-down" | "green-band" | "footer-cut" | "stadium";
export type Visual = { layout: Layout; bg: string };
export const LAYOUTS: Layout[] = ["diag-up", "diag-down", "green-band", "footer-cut", "stadium"];

const norm = (s?: string | null) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

export function pickTemplate(p: { category?: string | null; matchId?: number | null; tags?: { tag?: string | null }[] | null }): Template {
  if (norm(p.category) === "onde assistir") return "jogo";
  if ((p.tags || []).some((t) => norm(t?.tag) === "onde assistir")) return "jogo";
  if (p.matchId) return "jogo";
  return "noticia";
}

export function suggestPublishAt(kickoffSec: number | null, nowMs: number): string {
  if (!kickoffSec) return new Date(nowMs).toISOString();
  const t = kickoffSec * 1000 - 2 * 3600 * 1000;
  return new Date(Math.max(t, nowMs)).toISOString();
}

function pick<T>(all: T[], avoid: T[], rnd: () => number): T {
  const free = all.filter((x) => !avoid.includes(x));
  const pool = free.length ? free : all;
  return pool[Math.floor(rnd() * pool.length) % pool.length];
}

export function pickVisual(recent: Visual[], bgs: string[], rnd: () => number = Math.random): Visual {
  const last = recent.slice(0, 3);
  const layout = pick(LAYOUTS, last.map((v) => v.layout), rnd);
  const bg = bgs.length ? pick(bgs, last.map((v) => v.bg), rnd) : "";
  return { layout, bg };
}

export function mediaFileName(id: number, kind: "feed" | "story", hash: string): string {
  return `${id}-${kind}-${hash}.jpg`;
}

const MEDIA_RE = /^[0-9]+-(feed|story)-[a-f0-9]{8}\.jpg$/;
export function isValidMediaFile(name: string): boolean {
  return MEDIA_RE.test(name);
}
```

- [ ] **Step 4: Run** `npm test`. Expected: all tests PASS, including the 5 new ones.
- [ ] **Step 5: Commit**

```bash
git add src/lib/instagram/core.ts src/lib/instagram/core.test.ts package.json
git commit -m "feat(instagram): núcleo puro (template, horário sugerido, rodízio, nome de arquivo)"
```

### Task 2: Fonts, flags, HD crests, backgrounds (assets on disk)

**Files:**
- Create: `src/lib/instagram/fonts/` containing `Anton-Regular.ttf`, `BarlowCondensed-BlackItalic.ttf`, `BarlowCondensed-ExtraBoldItalic.ttf`, `OpenSans-Bold.ttf`, `OpenSans-ExtraBold.ttf` and `OFL.txt`
- Create: `src/lib/instagram/flags.ts`, which maps national team id to ISO code
- Create: `src/lib/instagram/assets.ts`, which resolves crests, backgrounds and fonts as data URIs
- Test: `src/lib/instagram/assets.test.ts`
- Create: `scripts/instagram/download-flags.mjs`, `scripts/instagram/crests-hd.json`, `scripts/instagram/download-crests-hd.mjs`, `scripts/instagram/download-backgrounds.mjs`
- Create on the volume (server): `data/instagram/{bandeiras,escudos,fundos}/` and `data/instagram/fundos/CREDITOS.md`

**Interfaces:**
- Produces:
  - `NATIONAL_ISO: Record<number, string>`, e.g. `{4748:"br",22672:"br",4819:"ar",4725:"uy",4770:"jp",...}`
  - `resolveCrest(teamId: number, dataDir?: string): Promise<{ uri: string; hd: boolean }>`
  - `listBackgrounds(dataDir?: string): Promise<string[]>`, returning file names
  - `backgroundUri(file: string, dataDir?: string): Promise<string | null>`
  - `fontFaceCss(): Promise<string>`, the `@font-face` rules with base64 TTFs
- `dataDir` defaults to `join(process.cwd(), "data")`.
- Crest order:
  1. `instagram/escudos/{id}.svg`
  2. `instagram/escudos/{id}.png`
  3. `instagram/bandeiras/{iso}.svg`, via NATIONAL_ISO
  4. `team-images/{id}.png`, which returns `hd:false`
  5. a transparent 1×1 PNG, which also returns `hd:false`

- [ ] **Step 1: Write the failing tests** (`assets.test.ts`). They use a temp dir with fake files.

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { resolveCrest, listBackgrounds } from "./assets.ts";

async function fixture() {
  const d = await mkdtemp(join(tmpdir(), "ig-"));
  await mkdir(join(d, "instagram/escudos"), { recursive: true });
  await mkdir(join(d, "instagram/bandeiras"), { recursive: true });
  await mkdir(join(d, "instagram/fundos"), { recursive: true });
  await mkdir(join(d, "team-images"), { recursive: true });
  await writeFile(join(d, "instagram/escudos/1963.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  await writeFile(join(d, "instagram/bandeiras/br.svg"), "<svg/>");
  await writeFile(join(d, "team-images/5981.png"), Buffer.from([0x89, 0x50]));
  await writeFile(join(d, "instagram/fundos/estadio-1.jpg"), "x");
  await writeFile(join(d, "instagram/fundos/CREDITOS.md"), "x");
  return d;
}

test("escudo HD do clube vence", async () => {
  const r = await resolveCrest(1963, await fixture());
  assert.equal(r.hd, true);
  assert.match(r.uri, /^data:image\/png;base64,/);
});

test("seleção usa a bandeira vetorial", async () => {
  const r = await resolveCrest(4748, await fixture());
  assert.equal(r.hd, true);
  assert.match(r.uri, /^data:image\/svg\+xml;base64,/);
});

test("sem HD cai no escudo de 150px e avisa", async () => {
  const r = await resolveCrest(5981, await fixture());
  assert.equal(r.hd, false);
});

test("time desconhecido não quebra", async () => {
  const r = await resolveCrest(999999, await fixture());
  assert.equal(r.hd, false);
  assert.match(r.uri, /^data:image\/png;base64,/);
});

test("fundos: só imagens", async () => {
  assert.deepEqual(await listBackgrounds(await fixture()), ["estadio-1.jpg"]);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL, module not found.

- [ ] **Step 3: Implement** `src/lib/instagram/flags.ts` and `src/lib/instagram/assets.ts`

```ts
// flags.ts — seleção (id Sofascore) → código ISO da bandeira (flagcdn).
// Ampliar ao incluir seleção nova (download-flags.mjs baixa todas as listadas aqui).
export const NATIONAL_ISO: Record<number, string> = {
  4748: "br", 22672: "br", 4819: "ar", 4725: "uy", 4770: "jp", 33759: "pe",
  4705: "pt", 4481: "es", 4699: "fr", 4711: "de", 4713: "gb-eng", 4707: "it",
  4708: "nl", 4717: "be", 4476: "dk", 4692: "no", 4693: "se", 4718: "pl",
  4698: "ro", 4715: "ua", 4714: "at", 4469: "ie", 4710: "gb-nir", 4695: "ba",
  4712: "ge", 4697: "hu", 4689: "xk", 4490: "il", 4702: "gb-wls",
};
```

The ids above that were not confirmed in this session must be verified in Step 3b before they are used.

```ts
// assets.ts — tudo do DISCO (regra de ouro + velocidade). Nada de API aqui.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { NATIONAL_ISO } from "./flags.ts";

const DEF = () => join(process.cwd(), "data");
const EMPTY_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

async function tryUri(file: string, mime: string): Promise<string | null> {
  try { return `data:${mime};base64,${(await readFile(file)).toString("base64")}`; } catch { return null; }
}

export async function resolveCrest(teamId: number, dataDir: string = DEF()): Promise<{ uri: string; hd: boolean }> {
  const esc = join(dataDir, "instagram", "escudos");
  const svg = await tryUri(join(esc, `${teamId}.svg`), "image/svg+xml");
  if (svg) return { uri: svg, hd: true };
  const png = await tryUri(join(esc, `${teamId}.png`), "image/png");
  if (png) return { uri: png, hd: true };
  const iso = NATIONAL_ISO[teamId];
  if (iso) {
    const flag = await tryUri(join(dataDir, "instagram", "bandeiras", `${iso}.svg`), "image/svg+xml");
    if (flag) return { uri: flag, hd: true };
  }
  const low = await tryUri(join(dataDir, "team-images", `${teamId}.png`), "image/png");
  return { uri: low || `data:image/png;base64,${EMPTY_PNG}`, hd: false };
}

export async function listBackgrounds(dataDir: string = DEF()): Promise<string[]> {
  try {
    return (await readdir(join(dataDir, "instagram", "fundos"))).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
  } catch { return []; }
}

export async function backgroundUri(file: string, dataDir: string = DEF()): Promise<string | null> {
  if (!/^[\w.-]+\.(jpe?g|png|webp)$/i.test(file)) return null;
  const mime = /png$/i.test(file) ? "image/png" : /webp$/i.test(file) ? "image/webp" : "image/jpeg";
  return tryUri(join(dataDir, "instagram", "fundos", file), mime);
}

const FONTS: [string, string, number, string][] = [
  ["Anton", "Anton-Regular.ttf", 400, "normal"],
  ["Barlow Condensed", "BarlowCondensed-BlackItalic.ttf", 900, "italic"],
  ["Barlow Condensed", "BarlowCondensed-ExtraBoldItalic.ttf", 800, "italic"],
  ["Open Sans", "OpenSans-Bold.ttf", 700, "normal"],
  ["Open Sans", "OpenSans-ExtraBold.ttf", 800, "normal"],
];
let fontCss: string | null = null;
export async function fontFaceCss(): Promise<string> {
  if (fontCss) return fontCss;
  const dir = join(process.cwd(), "src", "lib", "instagram", "fonts");
  const parts = await Promise.all(FONTS.map(async ([fam, file, w, st]) => {
    const b64 = (await readFile(join(dir, file))).toString("base64");
    return `@font-face{font-family:'${fam}';src:url(data:font/ttf;base64,${b64}) format('truetype');font-weight:${w};font-style:${st};}`;
  }));
  return (fontCss = parts.join(""));
}
```

The Dockerfile runner stage copies only `.next/standalone`. Add `COPY --from=builder /app/src/lib/instagram/fonts ./src/lib/instagram/fonts` in Task 4.

- [ ] **Step 3b: Verify national team ids.**
  - For each id in `NATIONAL_ISO` not in {4748, 22672, 4819, 4725, 4770, 33759}, run on the server:
    ```
    curl -s -H "x-proxy-auth: $SPORTS_PROXY_TOKEN" http://127.0.0.1:3001/api/sports-proxy/team/{id}
    ```
    and confirm that `team.name` is the expected country.
  - Remove any id that does not match. Better a missing flag (fallback) than the wrong flag.
  - Add the Nations League teams from the 14/11 posts, using the ids found in `data/snapshots/matches/*.json` (`event.homeId`/`awayId`).

- [ ] **Step 4: Download the fonts.**
  - Get them from the google/fonts GitHub repo (`ofl/anton/Anton-Regular.ttf`, `ofl/barlowcondensed/BarlowCondensed-BlackItalic.ttf` and `-ExtraBoldItalic.ttf`, `ofl/opensans/OpenSans[wdth,wght].ttf`).
  - For Open Sans, use the static `OpenSans-Bold.ttf` and `OpenSans-ExtraBold.ttf` from `https://github.com/googlefonts/opensans/tree/main/fonts/ttf`.
  - Copy `OFL.txt`.
  - Commit them (OFL allows redistribution).

- [ ] **Step 5: Write the download scripts.**
  - `scripts/instagram/download-flags.mjs`:
    - parses the ISO codes out of `src/lib/instagram/flags.ts` with the regex `/"([a-z-]+)"/g`;
    - fetches `https://flagcdn.com/{iso}.svg` with a 350 ms sleep between requests;
    - writes `data/instagram/bandeiras/{iso}.svg`;
    - skips existing files.
  - `scripts/instagram/crests-hd.json`:
    - holds `[{ "id": 1963, "name": "Palmeiras", "commons": "File:Palmeiras logo.svg" }, ...]` for the 57 teams (Série A, Europa and Série B lists in CLAUDE.md);
    - fill each `commons` value by searching `https://commons.wikimedia.org/w/index.php?search=<team>+logo+svg` and picking the file that matches the current crest.
    - If no file is found, omit the team. It then falls back to the 150 px crest with a warning, which the spec allows.
  - `scripts/instagram/download-crests-hd.mjs`:
    - for each entry, calls `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url&titles=<commons>`;
    - downloads the SVG (sleep 350 ms) to `data/instagram/escudos/{id}.svg`;
    - prints `ok/skip/miss` per team;
    - sends the generic `User-Agent: papodebola-bot/1.0`.
  - `scripts/instagram/download-backgrounds.mjs`:
    - takes a hard-coded list of 8 to 10 photos from the Unsplash or Pexels CDN: stadium at night, grass close-up, lit stands, ball on grass.
    - Choose them in this step, under the Unsplash License or Pexels License (both allow commercial use without attribution). Pick photos with no visible brand or face.
    - writes `data/instagram/fundos/{slug}.jpg`;
    - resizes to width 1600 with sharp;
    - appends `slug | url | autor | licença` to `CREDITOS.md`.

- [ ] **Step 6: Run** `npm test` and expect PASS. Then run the 3 download scripts locally against a local `data/` to test them. They run on the server in Task 4.
- [ ] **Step 7: Commit**

```bash
git add src/lib/instagram/fonts src/lib/instagram/flags.ts src/lib/instagram/assets.ts src/lib/instagram/assets.test.ts scripts/instagram
git commit -m "feat(instagram): fontes locais, bandeiras, escudos HD e fundos no volume"
```

### Task 3: HTML templates (jogo × 5 layouts, notícia)

**Files:**
- Create: `src/lib/instagram/templates/shared.ts` (sizes, safe areas, `fitFontSize`, `esc`, theme by competition)
- Create: `src/lib/instagram/templates/jogo.ts`
- Create: `src/lib/instagram/templates/noticia.ts`
- Test: `src/lib/instagram/templates.test.ts`

**Interfaces:**
- Consumes: `Layout` and `Visual` from `core.ts`.
- Produces:
  - `type Format = "feed" | "story"`
  - `SIZE: Record<Format, { w: number; h: number }>`, which is `{feed:{w:1080,h:1350},story:{w:1080,h:1920}}`
  - `SAFE: Record<Format, { top: number; bottom: number; side: number }>`, which is `{feed:{top:60,bottom:60,side:60},story:{top:250,bottom:340,side:60}}`
  - `fitFontSize(text: string, maxPx: number, minPx: number, widthPx: number, maxLines: number, charW?: number): number`. `charW` is the average glyph width as a fraction of the font size, default 0.5 for condensed type.
  - `themeFor(competition: string): { accent: string; band: string; bandText: string; tint: string }`
  - `type JogoData = { home: string; away: string; homeCrest: string; awayCrest: string; kicker: string; when: string; channels: string; competition: string; bgUri: string | null; fonts: string }`
  - `layoutBoxes(layout: Layout, f: Format): { crestTop: number; crestBottom: number; stripTop: number; stripBottom: number }`
  - `jogoHtml(d: JogoData, v: Visual, f: Format): string`
  - `type NoticiaData = { title: string; highlight: string | null; category: string; photoUri: string | null; bgUri: string | null; fonts: string }`
  - `noticiaHtml(d: NoticiaData, f: Format): string`
- Every template loads the logo from `public/logotipo-papo-de-bola.png` as a data URI. The caller passes it in `fonts`-like style; to keep it simple, `shared.ts` exports `logoUri(): Promise<string>`, which reads that file once and caches it.

- [ ] **Step 1: Write the failing tests**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fitFontSize, layoutBoxes, SAFE, SIZE, themeFor } from "./templates/shared.ts";
import { jogoHtml } from "./templates/jogo.ts";
import { noticiaHtml } from "./templates/noticia.ts";
import { LAYOUTS } from "./core.ts";

const d = { home: "Irlanda do Norte", away: "Bósnia e Herzegovina", homeCrest: "data:x", awayCrest: "data:y",
  kicker: "LIGA DAS NAÇÕES · ONDE ASSISTIR", when: "SÁBADO · 16H45", channels: "Disney+", competition: "Liga das Nações", bgUri: null, fonts: "" };

test("texto longo encolhe e nunca passa do mínimo", () => {
  const big = fitFontSize("JAPÃO X BRASIL", 120, 48, 960, 1);
  const small = fitFontSize("IRLANDA DO NORTE X BÓSNIA E HERZEGOVINA", 120, 48, 960, 1);
  assert.ok(small < big);
  assert.ok(small >= 48);
  assert.ok(fitFontSize("x".repeat(500), 120, 48, 960, 2) === 48);
});

test("nenhum layout põe a faixa de horário sobre os escudos", () => {
  for (const f of ["feed", "story"] as const) for (const l of LAYOUTS) {
    const b = layoutBoxes(l, f);
    const overlaps = b.stripTop < b.crestBottom && b.stripBottom > b.crestTop;
    assert.equal(overlaps, false, `${l}/${f}`);
    assert.ok(b.crestTop >= SAFE[f].top, `${l}/${f} topo`);
    assert.ok(b.stripBottom <= SIZE[f].h - SAFE[f].bottom, `${l}/${f} rodapé`);
  }
});

test("html escapa texto e traz o CTA só no stories", () => {
  const h = jogoHtml({ ...d, home: "<b>X</b>" }, { layout: "diag-up", bg: "" }, "story");
  assert.ok(!h.includes("<b>X</b>"));
  assert.ok(h.includes("Leia em papodebola.com.br"));
  assert.ok(!jogoHtml(d, { layout: "stadium", bg: "" }, "feed").includes("Leia em papodebola.com.br"));
});

test("notícia: destaque vira span amarelo", () => {
  const h = noticiaHtml({ title: "Neymar volta à Seleção", highlight: "Neymar", category: "Seleção", photoUri: null, bgUri: null, fonts: "" }, "feed");
  assert.match(h, /<span class="hl">Neymar<\/span>/);
});

test("tema por competição", () => {
  assert.notEqual(themeFor("Brasileirão Série B").band, themeFor("Brasileirão Série A").band);
  assert.ok(themeFor("qualquer").band);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.

- [ ] **Step 3: Implement** `shared.ts`

```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Layout } from "../core.ts";

export type Format = "feed" | "story";
export const SIZE: Record<Format, { w: number; h: number }> = { feed: { w: 1080, h: 1350 }, story: { w: 1080, h: 1920 } };
export const SAFE: Record<Format, { top: number; bottom: number; side: number }> = {
  feed: { top: 60, bottom: 60, side: 60 }, story: { top: 250, bottom: 340, side: 60 },
};

export const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Estimativa por largura média do glifo; a fonte condensada fica ~0,5 do corpo.
export function fitFontSize(text: string, maxPx: number, minPx: number, widthPx: number, maxLines: number, charW = 0.5): number {
  const len = Math.max(1, text.length);
  const ideal = (widthPx * maxLines) / (len * charW);
  return Math.max(minPx, Math.min(maxPx, Math.floor(ideal)));
}

// Geometria (px na arte final). A faixa de horário SEMPRE em área própria.
export function layoutBoxes(layout: Layout, f: Format): { crestTop: number; crestBottom: number; stripTop: number; stripBottom: number } {
  const H = SIZE[f].h, s = SAFE[f];
  const crest = f === "feed" ? 360 : 340;
  if (layout === "stadium") {
    const crestTop = s.top + (f === "feed" ? 200 : 260);
    const stripTop = crestTop + crest + 60;
    return { crestTop, crestBottom: crestTop + crest, stripTop, stripBottom: stripTop + 170 };
  }
  const crestTop = s.top + (f === "feed" ? 150 : 220);
  const stripBottom = H - s.bottom - (f === "feed" ? 60 : 40);
  return { crestTop, crestBottom: crestTop + crest, stripTop: stripBottom - 230, stripBottom };
}

export function themeFor(competition: string): { accent: string; band: string; bandText: string; tint: string } {
  const c = competition.toLowerCase();
  if (c.includes("série b") || c.includes("serie b")) return { accent: "#FFD400", band: "#1d4ed8", bandText: "#fff", tint: "rgba(10,30,90,.55)" };
  if (c.includes("libertadores") || c.includes("copa do brasil")) return { accent: "#D4AF37", band: "#111", bandText: "#D4AF37", tint: "rgba(0,0,0,.6)" };
  if (c.includes("nações") || c.includes("nacoes")) return { accent: "#FFD400", band: "#0b1f4d", bandText: "#fff", tint: "rgba(5,15,45,.55)" };
  if (c.includes("seleção") || c.includes("selecao") || c.includes("amistoso")) return { accent: "#FFD400", band: "#FFD400", bandText: "#111", tint: "rgba(0,60,30,.5)" };
  return { accent: "#FFD400", band: "#FFD400", bandText: "#111", tint: "rgba(0,40,25,.5)" };
}

let logo: string | null = null;
export async function logoUri(): Promise<string> {
  if (logo) return logo;
  const b = await readFile(join(process.cwd(), "public", "logotipo-papo-de-bola.png"));
  return (logo = `data:image/png;base64,${b.toString("base64")}`);
}

export function pageShell(f: Format, fonts: string, css: string, body: string): string {
  const { w, h } = SIZE[f];
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;font-family:'Open Sans',sans-serif;color:#fff;background:#04140c}
.hl{color:#FFD400}${css}</style></head><body>${body}</body></html>`;
}
```

- [ ] **Step 4: Implement** `jogo.ts`.
  - It uses `layoutBoxes` for absolute positioning, so the test geometry is the real geometry.
  - **Grass background** (`diag-up`, `diag-down`, `green-band`, `footer-cut`): when `bgUri` is null, use the CSS stripes from the approved mockup (`repeating-linear-gradient(90deg,#0c6a43 0 120px,#0a5c3a 120px 240px)` plus a center circle). When `bgUri` is set, use the photo with `filter:brightness(.55)` and the theme `tint` on top.
  - **Crests:** circles of size `crestBottom - crestTop` with a 10 px white border. The home crest is left-aligned at `SAFE.side + 20` and the away crest right-aligned. An "X" sits between them in Barlow Condensed 900 italic, 110 px.
  - **Names:** under the crests (`crestBottom + 24`), uppercase Barlow Condensed 900 italic, font size `fitFontSize(name, 72, 40, 440, 1)`.
  - **Kicker:** a translucent black pill at `SAFE.top`, plus the logo at the top right (height 44, `filter:brightness(0) invert(1)`).
  - **Strip:** a block from `stripTop` to `stripBottom`, containing `when` (Barlow 900 italic, size `fitFontSize(when, 96, 56, 900, 1)`) and `channels` (Open Sans 700, 34 px) below it. Per layout:
    - `diag-up`: `transform:rotate(-6deg)`, band color `theme.band`, plus a 50 px green stripe `#00965E` under it;
    - `diag-down`: `rotate(6deg)`;
    - `green-band`: flat `#00965E` with white text;
    - `footer-cut`: flat band with `clip-path:polygon(0 18%,100% 0,100% 100%,0 100%)`;
    - `stadium`: the background is the photo (or a CSS radial gradient when there is no photo) with a green radial glow. The title `HOME X AWAY` uses Anton above the crests (top `SAFE.top + 40`) with the "X" in `.hl`. The strip is a flat green gradient band at `stripTop`.
  - Stories only: a white pill "Leia em papodebola.com.br" at `top = SIZE.story.h - SAFE.story.bottom + 40`. This position is inside the bottom area on purpose: it is not text over the reply box, and it sits 300 px above the bottom edge.
  - Every text value goes through `esc()`.
- [ ] **Step 5: Implement** `noticia.ts`.
  - The full-bleed photo is `photoUri`, falling back to `bgUri`, then to the CSS grass.
  - Gradient: `linear-gradient(180deg,rgba(0,0,0,0) 30%,rgba(0,0,0,.92) 100%)`.
  - Category tag: green `#00965E` pill, Open Sans 800, 30 px, uppercase. It sits just above the title.
  - Title: Anton, size `fitFontSize(title, 110, 58, 960, 4, 0.45)`, line-height 1.02, uppercase. It is anchored to `bottom: SAFE.bottom + 70` (feed) or `SAFE.bottom + 120` (story).
  - Highlight: replace the first occurrence of `highlight`, matched case-insensitively, in the escaped title with `<span class="hl">…</span>`.
  - Logo at the top left, at `SAFE.top`.
  - Story CTA the same as in jogo.
- [ ] **Step 6: Run** `npm test`. Expected: PASS.
- [ ] **Step 7: Commit**

```bash
git add src/lib/instagram/templates src/lib/instagram/templates.test.ts
git commit -m "feat(instagram): templates de jogo (5 variações) e notícia com áreas seguras"
```

### Task 4: Renderer (Chromium) + Docker + sample script → Ivan approves

**Files:**
- Create: `src/lib/instagram/render.ts`
- Create: `scripts/instagram/render-sample.ts`
- Modify: `Dockerfile`
- Modify: `package.json` (dependency `puppeteer-core`)
- Modify: `next.config.ts` (`serverExternalPackages: ["puppeteer-core"]`, appended to the existing array if one exists)

**Interfaces:**
- Consumes: `SIZE`, `Format`.
- Produces: `renderJpeg(html: string, f: Format): Promise<Buffer>`. It runs one browser at a time through a module-level promise chain, and closes the page after each render. The browser is reused and closed after 60 s idle.

- [ ] **Step 1: Install.** Run `npm i puppeteer-core@24`. It uses the system Chrome; no download.

- [ ] **Step 2: Implement** `render.ts`

```ts
import type { Browser } from "puppeteer-core";
import sharp from "sharp";
import { SIZE, type Format } from "./templates/shared.ts";

let browser: Promise<Browser> | null = null;
let idle: ReturnType<typeof setTimeout> | null = null;
let chain: Promise<unknown> = Promise.resolve();

async function getBrowser(): Promise<Browser> {
  if (!browser) {
    const { default: puppeteer } = await import("puppeteer-core");
    const executablePath = process.env.CHROMIUM_PATH || "/usr/bin/chromium-browser";
    browser = puppeteer.launch({ executablePath, headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"] });
    browser.catch(() => { browser = null; });
  }
  return browser;
}

function scheduleClose() {
  if (idle) clearTimeout(idle);
  idle = setTimeout(async () => {
    const b = browser; browser = null;
    try { await (await b)?.close(); } catch { /* já caiu */ }
  }, 60_000);
}

export function renderJpeg(html: string, f: Format): Promise<Buffer> {
  const job = chain.then(async () => {
    const b = await getBrowser();
    const page = await b.newPage();
    try {
      await page.setViewport({ width: SIZE[f].w, height: SIZE[f].h, deviceScaleFactor: 1 });
      await page.setContent(html, { waitUntil: "load", timeout: 20_000 });
      await page.evaluate(() => document.fonts.ready);
      const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: SIZE[f].w, height: SIZE[f].h } });
      return await sharp(Buffer.from(png)).jpeg({ quality: 90, mozjpeg: true }).toBuffer();
    } finally {
      await page.close().catch(() => {});
      scheduleClose();
    }
  });
  chain = job.catch(() => {});
  return job;
}
```

- [ ] **Step 3: Write** `scripts/instagram/render-sample.ts`.
  - Run with: `CHROMIUM_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe" node --experimental-strip-types scripts/instagram/render-sample.ts <outDir>`.
  - It builds three inputs by hand:
    - **Japão x Brasil:** ids 4770 and 4748, "SÁBADO · 7H15", "Globo · SporTV · ge tv", competition "Amistoso".
    - **A club match:** Palmeiras 1963 x Flamengo 5981, "DOMINGO · 16H", "Globo · Premiere", "Brasileirão Série A".
    - **A news item:** title "Ancelotti convoca a Seleção para os amistosos", highlight "Ancelotti", category "Seleção", photo `data/cms-media/<some existing jpg/webp>` read as a data URI.
  - It renders every layout × feed/story for the two games, plus feed/story for the news: 22 files named `{case}-{layout}-{format}.jpg`.
  - Imports are relative (`../../src/lib/instagram/...ts`).

- [ ] **Step 4: Run it locally** against a local `data/` that holds the flags and crests from Task 2.
  - Expected: 22 JPEGs, each 1080×1350 or 1080×1920. Check them with `node -e "require('sharp')('f.jpg').metadata().then(console.log)"`.
  - Open a few of them with the Read tool to check visually: no overlap, nothing cut off.

- [ ] **Step 5: Change the Dockerfile** (runner stage)

```dockerfile
RUN apk add --no-cache openssh-client chromium
ENV CHROMIUM_PATH=/usr/bin/chromium-browser
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/instagram/fonts ./src/lib/instagram/fonts
```

Also add `"puppeteer-core"` to `serverExternalPackages` in `next.config.ts`, so it stays in `node_modules` in standalone and is not bundled.

- [ ] **Step 6: Commit and pushdev.** Check `df -h /` on the server before and after the build, since the image grows by about 200 MB.

```bash
git add src/lib/instagram/render.ts scripts/instagram/render-sample.ts Dockerfile package.json package-lock.json next.config.ts
git commit -m "feat(instagram): render via Chromium headless + JPEG; Chromium no container"
git pushdev
```

- [ ] **Step 7: Prepare the server volume.**
  - Run the download scripts inside the dev container's `data/` (the volume is shared): `docker exec papodebola-next-dev node scripts/...`.
  - The scripts are not in the standalone image, so instead run them on the host from `/home/ivan/papodebola-next-dev` with `DATA_DIR` pointing to the volume mountpoint. Get the mountpoint with `docker volume inspect papodebola-next_pdb-data -f '{{.Mountpoint}}'`, then use `sudo -u` as needed.
  - Then `docker cp` the result into the container, or write the scripts to accept `DATA_DIR` (add this in Task 2's scripts: `const DATA = process.env.DATA_DIR || "data"`).
  - Check with `ls /app/data/instagram/{bandeiras,escudos,fundos} | wc -l`.

- [ ] **Step 8: GATE.**
  - Render the samples inside the dev container: `docker exec papodebola-next-dev node --experimental-strip-types scripts/instagram/render-sample.ts /app/data/instagram/amostras`. Copy `scripts/` in first with `docker cp` if needed.
  - Download the files to the scratchpad and show them to Ivan, in the visual companion or as images.
  - **Stop until Ivan approves the look.** Adjust the CSS in Task 3's files and repeat.

---

## Stage 2 — Fila no /cms

### Task 5: Collection `instagramPosts` + DDL

**Files:**
- Create: `src/cms/collections/instagram-posts.ts`
- Modify: `src/payload.config.ts` (import, then add it to `collections` after `promoBannersCollection`)
- Create: `docs/superpowers/plans/sql/2026-11-13-instagram-posts.sql`, the additive DDL

**Interfaces:**
- Produces:
  - collection slug `instagramPosts`;
  - fields `post` (rel → posts, unique, index), `template`, `visual` (json), `highlight`, `feedFile`, `storyFile`, `caption`, `toFeed`, `toStory`, `publishAt`, `status`, `postChanged` (checkbox), `lowResCrest` (checkbox), `result` (group: `feedMediaId`, `feedPermalink`, `storyMediaId`, `error`, `attempts` number), `artsDeletedAt`;
  - status values `rascunho | aprovado | publicando | publicado | erro | descartado`.

- [ ] **Step 1: Write the collection**

```ts
import type { CollectionConfig } from "payload";
import { adminOnly, editorOrAdmin, hiddenUnlessEditor } from "@/cms/lib/access";

export const instagramPostsCollection: CollectionConfig = {
  slug: "instagramPosts",
  labels: { singular: "Instagram", plural: "Instagram" },
  admin: {
    group: "Comercial",
    useAsTitle: "caption",
    hidden: hiddenUnlessEditor,
    defaultColumns: ["post", "status", "toFeed", "toStory", "publishAt", "updatedAt"],
    description: "Artes e legenda geradas a cada post publicado. Nada vai pro Instagram sem aprovação. As artes são apagadas do servidor 7 dias depois.",
  },
  access: { read: editorOrAdmin, create: editorOrAdmin, update: editorOrAdmin, delete: adminOnly },
  fields: [
    { name: "panel", type: "ui", admin: { components: { Field: "@/cms/components/instagram-panel#InstagramPanel" } } },
    { name: "post", type: "relationship", relationTo: "posts", required: true, unique: true, index: true, label: "Post" },
    { name: "template", type: "select", required: true, defaultValue: "noticia", options: [{ label: "Jogo", value: "jogo" }, { label: "Notícia", value: "noticia" }] },
    { name: "visual", type: "json", admin: { hidden: true } },
    { name: "highlight", type: "text", label: "Palavra em destaque (amarelo)", admin: { description: "Opcional. Depois de mudar, clique em Regerar artes." } },
    { name: "caption", type: "textarea", label: "Legenda" },
    { type: "row", fields: [
      { name: "toStory", type: "checkbox", defaultValue: true, label: "Publicar no stories" },
      { name: "toFeed", type: "checkbox", defaultValue: false, label: "Publicar no feed" },
    ] },
    { name: "publishAt", type: "date", label: "Quando publicar", admin: { date: { pickerAppearance: "dayAndTime" }, description: "Vazio = assim que aprovar." } },
    { name: "status", type: "select", required: true, defaultValue: "rascunho", index: true, admin: { readOnly: true },
      options: ["rascunho", "aprovado", "publicando", "publicado", "erro", "descartado"].map((v) => ({ label: v[0].toUpperCase() + v.slice(1), value: v })) },
    { name: "postChanged", type: "checkbox", admin: { readOnly: true }, label: "Post mudou depois das artes" },
    { name: "lowResCrest", type: "checkbox", admin: { readOnly: true }, label: "Escudo em baixa: subir HD" },
    { name: "feedFile", type: "text", admin: { readOnly: true } },
    { name: "storyFile", type: "text", admin: { readOnly: true } },
    { name: "artsDeletedAt", type: "date", admin: { readOnly: true } },
    { name: "result", type: "group", label: "Resultado", admin: { readOnly: true }, fields: [
      { name: "feedMediaId", type: "text" }, { name: "feedPermalink", type: "text" },
      { name: "storyMediaId", type: "text" }, { name: "error", type: "textarea" },
      { name: "attempts", type: "number", defaultValue: 0 },
    ] },
  ],
};
```

- [ ] **Step 2: Register it** in `payload.config.ts`: `import { instagramPostsCollection } from "@/cms/collections/instagram-posts";` and add it to `collections`. Temporarily point the `panel` field at an existing component, or create the component stub `src/cms/components/instagram-panel.tsx` that returns `null` now (Task 8 fills it). Add the stub to `importMap.js` by hand, following the `TemplateTools` pattern on lines 1 and 37.

- [ ] **Step 3: Generate and review the DDL.**
  - Follow `payload_migrations_recipe` (memory): back up the database, run `migrate:create` in a temporary container from the dev image with `NODE_ENV=production PAYLOAD_DB_PUSH=false`, and keep **only** the `CREATE TYPE`, `CREATE TABLE "instagram_posts"`, `CREATE UNIQUE INDEX` on `post_id`, the indexes, and the `ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instagram_posts_id"` with its FK and index.
  - Save it in the SQL file above. It must contain no DROP or ALTER of existing columns.
- [ ] **Step 4: Apply** it in a transaction on the shared Postgres. Ivan pre-authorized reviewed additive DDL (memory `feedback_ddl_pode_aplicar`). Then validate that Payload initializes: `curl -s https://development.papodebola.com.br/cms-api/instagramPosts?limit=1` must return 401 or 403, not 500, and `docker logs papodebola-next-dev | grep payloadInitError` must be empty.
- [ ] **Step 5: Commit, pushdev,** then open `/cms` and confirm the "Instagram" entry shows under Comercial for an admin.

```bash
git add src/cms/collections/instagram-posts.ts src/payload.config.ts src/cms/components/instagram-panel.tsx "src/app/(payload)/cms/importMap.js" docs/superpowers/plans/sql
git commit -m "feat(instagram): collection instagramPosts (fila de aprovação) + DDL aditivo"
```

### Task 6: Caption by AI with fallback

**Files:**
- Create: `src/lib/instagram/caption.ts`
- Test: `src/lib/instagram/caption.test.ts`

**Interfaces:**
- Produces:
  - `type CaptionInput = { title: string; excerpt?: string | null; category?: string | null; home?: string; away?: string; when?: string; channels?: string; competition?: string }`
  - `fallbackCaption(i: CaptionInput): string`
  - `hashtags(i: CaptionInput): string[]`, returning 6 to 10 items, no accents, no spaces, always including `#futebol` and `#papodebola`
  - `generateCaption(i: CaptionInput, fetchFn?: typeof fetch): Promise<{ text: string; ai: boolean }>`
- The model comes from `process.env.INSTAGRAM_CAPTION_MODEL || "claude-sonnet-5-5"`, with a 20 s `AbortSignal.timeout`. On any error, or when `ANTHROPIC_API_KEY` is missing, it returns the fallback with `ai:false`.

- [ ] **Step 1: Write the failing tests**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { fallbackCaption, hashtags, generateCaption } from "./caption.ts";

const i = { title: "Japão x Brasil: onde assistir", excerpt: "Amistoso em Singapura.", home: "Japão", away: "Brasil", competition: "Amistoso", when: "sábado, 7h15", channels: "Globo e SporTV" };

test("hashtags sem acento e com as fixas", () => {
  const h = hashtags(i);
  assert.ok(h.length >= 6 && h.length <= 10);
  assert.ok(h.includes("#futebol") && h.includes("#papodebola"));
  assert.ok(h.includes("#japao") && h.every((t) => /^#[a-z0-9]+$/.test(t)));
});

test("fallback traz título, link na bio e hashtags", () => {
  const c = fallbackCaption(i);
  assert.ok(c.includes(i.title) && c.includes("Link na bio") && c.includes("#papodebola"));
  assert.ok(c.length <= 2200);
});

test("IA fora do ar → fallback", async () => {
  process.env.ANTHROPIC_API_KEY = "x";
  const r = await generateCaption(i, (async () => { throw new Error("down"); }) as typeof fetch);
  assert.equal(r.ai, false);
  assert.ok(r.text.includes("Link na bio"));
});

test("IA responde → usa o texto e garante link na bio + hashtags", async () => {
  process.env.ANTHROPIC_API_KEY = "x";
  const fake = (async () => new Response(JSON.stringify({ content: [{ type: "text", text: "Sábado tem Japão x Brasil!" }] }), { status: 200 })) as typeof fetch;
  const r = await generateCaption(i, fake);
  assert.equal(r.ai, true);
  assert.ok(r.text.startsWith("Sábado tem Japão x Brasil!"));
  assert.ok(r.text.includes("Link na bio") && r.text.includes("#papodebola"));
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.

- [ ] **Step 3: Implement** `caption.ts`

```ts
export type CaptionInput = { title: string; excerpt?: string | null; category?: string | null; home?: string; away?: string; when?: string; channels?: string; competition?: string };

const tag = (s?: string | null) => (s ? "#" + s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "") : "");

export function hashtags(i: CaptionInput): string[] {
  const out = [tag(i.competition), tag(i.home), tag(i.away), tag(i.category), "#futebol", "#futebolbrasileiro", "#ondeassistir", "#papodebola"]
    .filter((t) => t.length > 2);
  if (!i.home) out.splice(out.indexOf("#ondeassistir"), 1);
  const uniq = [...new Set(out)];
  while (uniq.length < 6) uniq.splice(uniq.length - 1, 0, ["#esporte", "#noticias", "#bola"][uniq.length % 3]);
  return [...new Set(uniq)].slice(0, 10);
}

const tail = (i: CaptionInput) => `\n\n🔗 Link na bio\n\n${hashtags(i).join(" ")}`;

export function fallbackCaption(i: CaptionInput): string {
  const lines = [i.title];
  if (i.when || i.channels) lines.push([i.when, i.channels && `📺 ${i.channels}`].filter(Boolean).join(" · "));
  if (i.excerpt) lines.push(i.excerpt);
  return (lines.join("\n\n") + tail(i)).slice(0, 2200);
}

const SYSTEM = "Você escreve legendas de Instagram para o Papo de Bola, portal de futebol. Português do Brasil, tom animado e direto, no máximo 600 caracteres, 1 ou 2 emojis, sem hashtags e sem 'link na bio' (o sistema adiciona). Use SOMENTE os fatos fornecidos; não invente placar, escalação, horário ou declaração.";

export async function generateCaption(i: CaptionInput, fetchFn: typeof fetch = fetch): Promise<{ text: string; ai: boolean }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { text: fallbackCaption(i), ai: false };
  try {
    const res = await fetchFn("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.INSTAGRAM_CAPTION_MODEL || "claude-sonnet-5-5",
        max_tokens: 400,
        system: SYSTEM,
        messages: [{ role: "user", content: `Fatos do post (JSON):\n${JSON.stringify(i)}` }],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const j = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (j.content || []).filter((c) => c.type === "text").map((c) => c.text || "").join("").trim();
    if (!text) throw new Error("vazio");
    return { text: (text.slice(0, 1600) + tail(i)).slice(0, 2200), ai: true };
  } catch {
    return { text: fallbackCaption(i), ai: false };
  }
}
```

- [ ] **Step 4: Run** `npm test`. Expected: PASS.
- [ ] **Step 5: Commit**: `git commit -m "feat(instagram): legenda pela IA com fallback por modelo"`

### Task 7: Generator service + hook on posts (one row per post)

**Files:**
- Create: `src/lib/instagram/generate.ts`, which runs inside Next/Payload and uses `@/` imports
- Create: `src/lib/instagram/enqueue.ts`, the pure decision logic
- Test: `src/lib/instagram/enqueue.test.ts`
- Modify: `src/payload.config.ts` (posts `hooks.afterChange` and `afterDelete`)

**Interfaces:**
- Consumes:
  - `pickTemplate`, `suggestPublishAt`, `pickVisual`, `mediaFileName`
  - `resolveCrest`, `listBackgrounds`, `backgroundUri`, `fontFaceCss`
  - `jogoHtml`, `noticiaHtml`, `logoUri`
  - `renderJpeg`
  - `generateCaption`
  - `readSnapshot` and `getMatchDetail`
- Produces:
  - `hookAction(doc, previousDoc, hasItem): "create" | "markChanged" | "discard" | "none"` in `enqueue.ts` (pure)
  - `isDuplicateKeyError(e: unknown): boolean` in `enqueue.ts`. True when the message or code matches `23505`, `duplicate key` or `unique`.
  - `ensureInstagramItem(payload, postId: number): Promise<void>` in `generate.ts`. It creates the row and swallows duplicate-key errors.
  - `generateArts(payload, itemId: number, opts?: { newVisual?: boolean; withCaption?: boolean }): Promise<void>` in `generate.ts`. It writes `data/instagram/{file}`, deletes the item's previous JPGs, and updates the row.

- [ ] **Step 1: Write the failing tests** (`enqueue.test.ts`)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { hookAction, isDuplicateKeyError } from "./enqueue.ts";

test("publicou agora e não tem item → cria", () => {
  assert.equal(hookAction({ _status: "published" }, { _status: "draft" }, false), "create");
  assert.equal(hookAction({ _status: "published" }, null, false), "create");
});
test("já tem item: edição de post publicado → marca 'post mudou'", () => {
  assert.equal(hookAction({ _status: "published", title: "B" }, { _status: "published", title: "A" }, true), "markChanged");
});
test("despublicou → descarta (se ainda não saiu)", () => {
  assert.equal(hookAction({ _status: "draft" }, { _status: "published" }, true), "discard");
});
test("rascunho/autosave sem item → nada", () => {
  assert.equal(hookAction({ _status: "draft" }, { _status: "draft" }, false), "none");
});
test("violação de unicidade reconhecida", () => {
  assert.ok(isDuplicateKeyError({ code: "23505" }));
  assert.ok(isDuplicateKeyError(new Error('duplicate key value violates unique constraint "instagram_posts_post_idx"')));
  assert.ok(!isDuplicateKeyError(new Error("timeout")));
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.

- [ ] **Step 3: Implement** `enqueue.ts`

```ts
type D = { _status?: string; title?: string; excerpt?: string; cover?: unknown } | null | undefined;

export function hookAction(doc: D, prev: D, hasItem: boolean): "create" | "markChanged" | "discard" | "none" {
  const pub = doc?._status === "published";
  const wasPub = prev?._status === "published";
  if (pub && !hasItem) return "create";
  if (!pub && wasPub && hasItem) return "discard";
  if (pub && wasPub && hasItem && (doc?.title !== prev?.title || doc?.excerpt !== prev?.excerpt || JSON.stringify(doc?.cover) !== JSON.stringify(prev?.cover))) return "markChanged";
  return "none";
}

export function isDuplicateKeyError(e: unknown): boolean {
  const o = e as { code?: string; message?: string; cause?: { code?: string } };
  if (o?.code === "23505" || o?.cause?.code === "23505") return true;
  return /duplicate key|unique constraint|must be unique/i.test(String(o?.message || ""));
}
```

- [ ] **Step 4: Implement** `generate.ts`. Key logic:
  - `ensureInstagramItem`:
    - fetch the post at `depth: 1`;
    - `template = pickTemplate(post)`;
    - kickoff = `readSnapshot<MatchDetail>("matches", post.matchId)?.event.startTimestamp` ?? null;
    - `payload.create({ collection: "instagramPosts", data: { post: postId, template, status: "rascunho", publishAt: suggestPublishAt(kickoff, Date.now()) }, overrideAccess: true })`, wrapped in try/catch with `isDuplicateKeyError` (return silently when true);
    - then `void generateArts(payload, created.id, { newVisual: true, withCaption: true }).catch(err => payload.update({... data: { "result.error": msg } }))`. Use `data: { result: { ...item.result, error: msg } }`; the group must be written whole.
  - `generateArts`:
    - Load the item and its post (`depth: 1`, which gives `cover.url` and `cover.filename`).
    - Visual: when `newVisual` is set or there is none, take the last 3 items (`payload.find({ collection: "instagramPosts", sort: "-createdAt", limit: 3, where: { id: { not_equals: id } } })`), map them to `visual`, and call `pickVisual(recent, await listBackgrounds())`.
    - **jogo** data comes from the snapshot `readSnapshot<MatchDetail>("matches", matchId)`, or else `await getMatchDetail(matchId)` **once**. If neither exists: `home`/`away` from the post title split on " x " before ":", and `when` from `publishedDate`. Then:
      - `channels`: the post's first `matchInfo` block (`content.root.children` → nodes with `type==="block"` and `fields.blockType==="matchInfo"`) → `fields.channels`;
      - `competition`: the first post tag that is not "Onde assistir", else `category`;
      - `when`: formatted in `America/Sao_Paulo` as `SÁBADO · 7H15` with `Intl.DateTimeFormat("pt-BR",{timeZone:"America/Sao_Paulo",weekday:"long",hour:"2-digit",minute:"2-digit"})`, uppercase, with `:00` → `H` and `:mm` → `Hmm`;
      - `kicker`: `${competition.toUpperCase()} · ONDE ASSISTIR`;
      - crests via `resolveCrest`, with `lowResCrest = !home.hd || !away.hd`.
    - **noticia**: `photoUri` is read from disk at `data/cms-media/{cover.filename}` (the Payload staticDir), as a data URI with its mime. `highlight` comes from the item.
    - Render: `feed = await renderJpeg(html(feed), "feed")`, then the story (sequentially). `hash = crypto.randomBytes(4).toString("hex")`. Write both files to `data/instagram/`. Delete the old `feedFile`/`storyFile` if present (`unlink`, ignoring errors).
    - Caption: when `withCaption` is set, `generateCaption(...)`.
    - Update the row with `feedFile`, `storyFile`, `visual`, `lowResCrest`, `postChanged:false`, `artsDeletedAt:null`, the caption when generated, and `result.error:""`.

- [ ] **Step 5: Wire the hooks** in `payload.config.ts` posts:
  - add to `afterChange` a hook that skips when `isAutosave(req)`;
  - it reads the current item with `req.payload.find({ collection: "instagramPosts", where: { post: { equals: doc.id } }, limit: 1, overrideAccess: true })`, then switches on `hookAction(doc, previousDoc, !!item)`:
    - `create` → `void ensureInstagramItem(req.payload, doc.id)`;
    - `markChanged` → update `postChanged: true`, only when status is `rascunho`/`aprovado`;
    - `discard` → update `status: "descartado"`, only when status is `rascunho`/`aprovado`.
  - Errors are caught and logged with `console.error("[instagram]", ...)`. **The hook never throws**, because post publishing must never fail because of Instagram.
  - `afterDelete`: mark the item `descartado` when it has not been published. The FK would block deletion, so set `onDelete` handling: before deleting the post, delete the item if it is unpublished, otherwise null the relation. Use `beforeDelete` on posts for this.
- [ ] **Step 6: Run** `npm test` and `npm run typecheck`. Expected: PASS.
- [ ] **Step 7: Verify on dev.** Commit and pushdev.
  - In `/cms`, publish a **draft test post** created for the purpose ("Teste Instagram (apagar)"). Ivan's rule forbids publishing real content without an order, so instead trigger `ensureInstagramItem` on an **already published** post through a temporary script: `bash ~/run-seed.sh` with a script that calls `ensureInstagramItem(payload, 477)`.
  - Expected: one row in `instagramPosts`; both JPGs in `/app/data/instagram/`; the caption filled in.
  - Run it twice: there must still be only one row.

```bash
git commit -m "feat(instagram): geração das artes + legenda ao publicar post (1 item por post)"
```

### Task 8: Admin panel (preview + buttons) via collection endpoint

**Files:**
- Modify: `src/cms/collections/instagram-posts.ts` (add `endpoints`)
- Create: `src/lib/instagram/actions.ts` (pure transitions)
- Test: `src/lib/instagram/actions.test.ts`
- Create: `src/cms/components/instagram-panel.tsx`, replacing the stub
- Create: `src/app/api/instagram/media/[file]/route.ts`

**Interfaces:**
- Produces:
  - `type Action = "approve" | "publishNow" | "newVisual" | "regenerate" | "retry" | "discard"`
  - `nextState(status: string, action: Action): { status: string; queue: boolean } | null`, where null means not allowed. The rules:
    - `approve` and `publishNow`: from rascunho or erro → aprovado, with `queue: true`;
    - `retry`: from erro → aprovado, with `queue: true`;
    - `newVisual` and `regenerate`: from rascunho, aprovado or erro → same status, with `queue: false`;
    - `discard`: from rascunho, aprovado or erro → descartado.
  - Endpoint: `POST /cms-api/instagramPosts/:id/action`, body `{ action }`. It requires `req.user` with the editor or admin role, and returns `{ ok, status }` or 400/403.
  - Media route: `GET /api/instagram/media/{file}`, which returns the JPEG from `data/instagram/`, or 404.

- [ ] **Step 1: Write the failing tests** (`actions.test.ts`)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { nextState } from "./actions.ts";

test("aprovar rascunho enfileira", () => assert.deepEqual(nextState("rascunho", "approve"), { status: "aprovado", queue: true }));
test("não aprova o que já foi publicado", () => assert.equal(nextState("publicado", "approve"), null));
test("não mexe no que está publicando", () => {
  for (const a of ["approve", "publishNow", "newVisual", "regenerate", "retry", "discard"] as const) assert.equal(nextState("publicando", a), null);
});
test("tentar de novo só a partir de erro", () => {
  assert.deepEqual(nextState("erro", "retry"), { status: "aprovado", queue: true });
  assert.equal(nextState("rascunho", "retry"), null);
});
test("trocar visual mantém o status", () => assert.deepEqual(nextState("aprovado", "newVisual"), { status: "aprovado", queue: false }));
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL. **Step 3: Implement** `actions.ts` with exactly the table above.

- [ ] **Step 4: Write the endpoint handler** in the collection (`endpoints: [{ path: "/:id/action", method: "post", handler }]`):
  - check the role with `hasRole(req.user, "editor", "admin")`, else 403;
  - parse the body with `await req.json?.()`;
  - load the item and compute `nextState`; return 400 when it is null;
  - `newVisual`/`regenerate`: `await generateArts(req.payload, id, { newVisual: action === "newVisual" })`;
  - `approve`/`retry`: set the status and leave `publishAt` as it is;
  - `publishNow`: also set `publishAt` to now;
  - when `queue` is set, `await queuePublish(req.payload, id)` (defined in Task 10). Until Task 10 exists, the status change alone is enough: guard it with `if (typeof queuePublish === "function")`. Do not leave placeholder code; Task 10 adds the call.
  - also block approval when the item has neither `toFeed` nor `toStory` (400 "Marque feed ou stories").

- [ ] **Step 5: Media route.**
  - `src/app/api/instagram/media/[file]/route.ts`: `isValidMediaFile(file)` else 404, then `readFile(join(process.cwd(),"data","instagram",file))`, else 404.
  - Headers: `content-type: image/jpeg` and `cache-control: public, max-age=604800, immutable`.
  - Exports `export const dynamic = "force-static"` is **not** used. Use `export const revalidate = 604800` and `export function generateStaticParams() { return []; }`, the project rule for `[param]` routes.
  - Downloads go through `?download=1`, which adds `content-disposition: attachment`.

- [ ] **Step 6: Write the panel** `instagram-panel.tsx` (`"use client"`):
  - uses `useDocumentInfo()` from `@payloadcms/ui` for the `id`, and `useFormFields` for `status`, `feedFile`, `storyFile`, `caption`, `postChanged`, `lowResCrest`, `result`;
  - shows the two previews side by side (`<img src="/api/instagram/media/{file}">`, widths 270 and 190 px), or the text "Artes apagadas (7 dias). Clique em Regerar artes." when the file is empty;
  - warnings: "O post mudou depois das artes" and "Escudo em baixa: subir HD em Times";
  - when `status === "erro"`, a red box with `result.error`;
  - buttons, shown according to `nextState(status, a) !== null`, with labels "Aprovar", "Publicar agora", "Trocar visual", "Regerar artes", "Tentar de novo" and "Descartar". They call `fetch(`/cms-api/instagramPosts/${id}/action`, { method: "POST", credentials: "include", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ action }) })`, then `router.refresh()` or `window.location.reload()`;
  - "Descartar" uses an inline confirm (a second click within 4 s); no `window.confirm`;
  - links "Baixar feed (JPG)" and "Baixar stories (JPG)" (`?download=1`), and "Copiar legenda" (`navigator.clipboard.writeText(caption)`, label "Copiada!" for 2 s);
  - plain buttons styled with inline CSS like the other `src/cms/components/*`; no icons;
  - stays responsive, since Ivan uses it on the phone: the two previews wrap with `flex-wrap`;
  - the `importMap.js` entry already exists from Task 5.
- [ ] **Step 7: Run** `npm test` and `npm run typecheck`. Commit and pushdev. In the dev `/cms`, open the item from Task 7 and test "Trocar visual": the images change and the layout differs. Test downloading and copying the caption.

```bash
git commit -m "feat(instagram): painel no /cms (prévia, aprovar, trocar visual, baixar, copiar legenda) + rota de mídia"
```

### Task 9: Cleanup after 7 days

**Files:**
- Create: `src/lib/instagram/cleanup.ts` (pure selection logic plus the runner)
- Test: `src/lib/instagram/cleanup.test.ts`
- Create: `src/app/api/instagram/cleanup/route.ts`
- Server: crontab line `# pdb-instagram-limpeza`

**Interfaces:**
- Produces:
  - `isExpired(createdAt: string, nowMs: number, days = 7): boolean`
  - `runCleanup(payload, nowMs): Promise<{ cleaned: number }>`
  - Route: `GET /api/instagram/cleanup?secret=<REVALIDATION_SECRET>`, the same auth as `/api/archive/run`.

- [ ] **Step 1: Write the failing test**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isExpired } from "./cleanup.ts";
const now = Date.UTC(2026, 10, 20, 12);
test("8 dias → expira; 6 dias → fica", () => {
  assert.equal(isExpired(new Date(now - 8 * 86400e3).toISOString(), now), true);
  assert.equal(isExpired(new Date(now - 6 * 86400e3).toISOString(), now), false);
});
test("data inválida nunca apaga", () => assert.equal(isExpired("lixo", now), false));
```

- [ ] **Step 2: FAIL. Step 3: Implement.**
  - `isExpired` returns `Number.isFinite(t) && now - t > days*86400e3`.
  - `runCleanup`: `payload.find({ collection:"instagramPosts", where:{ and:[{ createdAt:{ less_than: new Date(now-7*86400e3).toISOString() } }, { artsDeletedAt:{ exists:false } }] }, limit: 200, overrideAccess: true })`. For each item:
    - unlink both files, ignoring ENOENT;
    - update `{ feedFile:"", storyFile:"", artsDeletedAt: new Date(now).toISOString() }`.
  - **Do not** clean items in `aprovado` or `publicando`, because Meta still needs the URL. Skip them; the next day's run catches them.
  - Also delete orphan files in `data/instagram/*.jpg` older than 7 days that no row references (from failed renders), and the samples folder `data/instagram/amostras`.
- [ ] **Step 4: Write the route**: `export const dynamic = "force-dynamic"`. This is allowed because the route does not hit the sports API; the force-dynamic ban applies only to pages that do. It uses `getPayload({ config })` as the other `/api/payload-*` routes do.
- [ ] **Step 5: Test** with a temporary script on dev that creates an item with `createdAt` 8 days ago (via `payload.update` on `createdAt` with `overrideAccess`), calls the route, and checks that the files are gone and the row is kept. Then delete the test item.
- [ ] **Step 6: Add the cron on the server**, pointing at **dev** as the other maintenance crons do:

```
40 3 * * * curl -fsS "https://development.papodebola.com.br/api/instagram/cleanup?secret=<REVALIDATION_SECRET>" >/dev/null 2>&1 # pdb-instagram-limpeza
```

- [ ] **Step 7: Commit:** `git commit -m "feat(instagram): limpeza das artes após 7 dias (registro fica)"`

---

## Stage 3 — Publicação

### Task 10: Meta client + publish job with lock, retry and daily limit

**Files:**
- Create: `src/lib/instagram/meta.ts` (pure, with an injectable `fetch`)
- Test: `src/lib/instagram/meta.test.ts`
- Create: `src/lib/instagram/publish.ts` (job handler, `claimForPublish`, `queuePublish`, `retryDelayMs`)
- Test: `src/lib/instagram/publish.test.ts`
- Modify: `src/payload.config.ts` (`jobs.tasks`)
- Modify: `src/cms/collections/instagram-posts.ts` (call `queuePublish` from the endpoint)

**Interfaces:**
- Produces:
  - `meta.ts`:
    - `type MetaCfg = { token: string; igUserId: string; version: string; fetch?: typeof fetch }`
    - `createContainer(cfg, { imageUrl, caption?, story: boolean }): Promise<string>`. It POSTs `/{ig}/media` with `image_url`, plus `caption` for feed or `media_type=STORIES` for stories.
    - `waitFinished(cfg, containerId, { intervalMs = 3000, timeoutMs = 60000, sleep? }): Promise<void>`. It polls `GET /{id}?fields=status_code`; `FINISHED` returns; `ERROR` or `EXPIRED` throws.
    - `publishContainer(cfg, containerId): Promise<string>`, returning the media id
    - `getPermalink(cfg, mediaId): Promise<string | null>`
    - `publishingUsage(cfg): Promise<{ used: number; limit: number }>`, from `GET /{ig}/content_publishing_limit?fields=quota_usage,config`, with default limit 50
    - `checkToken(cfg): Promise<boolean>`, from `GET /me`
    - Errors throw `MetaError(message, code?)` with the Meta `error.message`.
  - `publish.ts`:
    - `retryDelayMs(attempt: number): number | null`, giving 1 → 60e3, 2 → 300e3, 3 → 900e3, ≥4 → null
    - `claimForPublish(payload, id): Promise<boolean>`
    - `queuePublish(payload, id): Promise<void>`
    - `runPublish(payload, id, cfg): Promise<void>`
  - Payload task slug `instagramPublish`, with input `{ itemId: number }`.

- [ ] **Step 1: Write the failing tests** (`meta.test.ts`, with a fake fetch that records calls)

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createContainer, waitFinished, publishContainer, publishingUsage, MetaError } from "./meta.ts";

function fakeFetch(replies: unknown[]) {
  const calls: { url: string; body?: string }[] = [];
  const f = (async (url: string, init?: RequestInit) => {
    calls.push({ url: String(url), body: init?.body ? String(init.body) : undefined });
    const r = replies.shift();
    return new Response(JSON.stringify(r), { status: (r as { error?: unknown })?.error ? 400 : 200 });
  }) as unknown as typeof fetch;
  return { f, calls };
}
const cfg = (f: typeof fetch) => ({ token: "T", igUserId: "IG", version: "v23.0", fetch: f });

test("stories manda media_type=STORIES e sem legenda", async () => {
  const { f, calls } = fakeFetch([{ id: "C1" }]);
  assert.equal(await createContainer(cfg(f), { imageUrl: "https://x/1.jpg", caption: "oi", story: true }), "C1");
  assert.match(calls[0].url, /graph\.facebook\.com\/v23\.0\/IG\/media/);
  assert.match(calls[0].body!, /media_type=STORIES/);
  assert.doesNotMatch(calls[0].body!, /caption=/);
});

test("feed manda legenda", async () => {
  const { f, calls } = fakeFetch([{ id: "C2" }]);
  await createContainer(cfg(f), { imageUrl: "https://x/1.jpg", caption: "oi #a", story: false });
  assert.match(calls[0].body!, /caption=oi\+%23a|caption=oi%20%23a/);
});

test("espera FINISHED; ERROR vira MetaError", async () => {
  const ok = fakeFetch([{ status_code: "IN_PROGRESS" }, { status_code: "FINISHED" }]);
  await waitFinished(cfg(ok.f), "C1", { intervalMs: 1, sleep: async () => {} });
  const bad = fakeFetch([{ status_code: "ERROR" }]);
  await assert.rejects(waitFinished(cfg(bad.f), "C1", { intervalMs: 1, sleep: async () => {} }), MetaError);
});

test("erro da Meta carrega a mensagem", async () => {
  const { f } = fakeFetch([{ error: { message: "Invalid OAuth access token", code: 190 } }]);
  await assert.rejects(publishContainer(cfg(f), "C1"), (e: MetaError) => e.message.includes("Invalid OAuth") && e.code === 190);
});

test("uso do limite diário", async () => {
  const { f } = fakeFetch([{ data: [{ quota_usage: 7, config: { quota_total: 50 } }] }]);
  assert.deepEqual(await publishingUsage(cfg(f)), { used: 7, limit: 50 });
});
```

And in `publish.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { retryDelayMs, claimForPublish } from "./publish.ts";

test("3 tentativas: 1, 5, 15 min; depois para", () => {
  assert.equal(retryDelayMs(1), 60e3); assert.equal(retryDelayMs(2), 300e3);
  assert.equal(retryDelayMs(3), 900e3); assert.equal(retryDelayMs(4), null);
});

test("trava: só um ganha mesmo com duas chamadas", async () => {
  let status = "aprovado";
  const fakePayload = { update: async ({ where }: { where: { and: [{ id: unknown }, { status: { equals: string } }] } }) => {
    if (status === where.and[1].status.equals) { status = "publicando"; return { docs: [{ id: 1 }] }; }
    return { docs: [] };
  } };
  const [a, b] = await Promise.all([claimForPublish(fakePayload as never, 1), claimForPublish(fakePayload as never, 1)]);
  assert.equal([a, b].filter(Boolean).length, 1);
});
```

- [ ] **Step 2: Run** `npm test`. Expected: FAIL.

- [ ] **Step 3: Implement** `meta.ts`.
  - Base URL: `https://graph.facebook.com/${version}`.
  - POSTs use `body: new URLSearchParams({...params, access_token: token})`.
  - GETs append `access_token` in the query.
  - Parse the JSON. When `json.error` is set, throw `new MetaError(json.error.message, json.error.code)`.
  - **Never** put the token in the error message.

- [ ] **Step 4: Implement** `publish.ts`
  - `claimForPublish`: `const r = await payload.update({ collection: "instagramPosts", where: { and: [{ id: { equals: id } }, { status: { equals: "aprovado" } }] }, data: { status: "publicando" }, overrideAccess: true }); return (r.docs?.length ?? 0) > 0;`
  - `queuePublish`: load the item, then `payload.jobs.queue({ task: "instagramPublish", input: { itemId: id }, waitUntil: item.publishAt && new Date(item.publishAt) > new Date() ? new Date(item.publishAt) : undefined })`.
  - `runPublish`:
    1. When `process.env.SPORTS_PROXY_URL` is unset, this is not prod. Return without touching anything, so that only prod publishes. Prod is the container with `SPORTS_PROXY_URL`, as the archive route already assumes.
    2. When `!cfg.token`, set `status: "erro"` with the error "Instagram não conectado (META_PAGE_TOKEN ausente)" and return.
    3. Call `claimForPublish`; return when it fails.
    4. Check `publishingUsage`. When `used + destinations > limit`, set `erro` with "Limite diário de 50 publicações do Instagram atingido" and return.
    5. For the story when `toStory` is set and the feed when `toFeed` is set: `imageUrl = https://www.papodebola.com.br/api/instagram/media/${file}`, then `createContainer`, `waitFinished`, `publishContainer`. For the feed, also call `getPermalink`.
    6. Save `result.storyMediaId`, `feedMediaId` and `feedPermalink` after **each** destination succeeds, so a retry skips the destinations already published (check the existing ids first).
    7. On full success, set `status: "publicado"` and `result.error: ""`.
    8. On an exception: `attempts = (result.attempts||0)+1`, then `delay = retryDelayMs(attempts)`.
       - When the error code is 190 (invalid token) or delay is null: `status:"erro"` and `result.error = e.message`.
       - Otherwise `status:"aprovado"` and queue again with `waitUntil = now + delay`.
  - In `payload.config.ts`, change `jobs` to add `tasks: [{ slug: "instagramPublish", inputSchema: [{ name: "itemId", type: "number", required: true }], handler: async ({ input, req }) => { await runPublish(req.payload, input.itemId, { token: process.env.META_PAGE_TOKEN || "", igUserId: process.env.IG_USER_ID || "", version: process.env.META_GRAPH_VERSION || "v23.0" }); return { output: {} }; } }]`.
  - The `payload_jobs` table already exists. Check whether a task slug needs a new enum value: if `payload_jobs.task_slug` is a Postgres enum (`enum_payload_jobs_task_slug`), the additive DDL is `ALTER TYPE ... ADD VALUE 'instagramPublish'`. Check with `\dT+ enum_payload_jobs*` and apply following the recipe; it is additive.
  - Endpoint (Task 8): when `queue` is set, call `await queuePublish(req.payload, id)`. Before approving, also call `publishingUsage` when the token exists, and return 400 "Limite diário atingido" when it is full.

- [ ] **Step 5: Run** `npm test` and `npm run typecheck`. Expected: PASS.
- [ ] **Step 6: Commit and pushdev.** No real publishing is possible yet without the token.

```bash
git commit -m "feat(instagram): publicação via Graph API (job só no prod, trava, 3 tentativas, limite diário)"
```

### Task 11: Token health + /cms warning + Meta setup guide

**Files:**
- Create: `src/app/api/instagram/health/route.ts`. It runs `checkToken` and `publishingUsage`, and writes `data/instagram/health.json` as `{ ok, checkedAt, used, limit, error? }`. The route is `force-dynamic`, with secret auth as in cleanup.
- Modify: `src/cms/components/dashboard-shortcuts.tsx`. It reads `/api/instagram/health-status` (a public GET that returns only `{ ok, checkedAt, used, limit }` from `health.json`, never the token) and shows a yellow box "Conexão com o Instagram caiu: refazer login (ver guia)" when `ok === false`, or "Instagram: X de 50 publicações hoje" when ok. Logged-in editors and admins only, as the dashboard already is.
- Create: `src/app/api/instagram/health-status/route.ts`
- Create: `docs/knowledge/2026-11-13-instagram-meta-setup.md` (gitignored folder; it is the click-by-click guide)
- Server: crontab `# pdb-instagram-saude` at `15 7 * * *`, pointing at **prod** (prod holds the token): `curl -fsS "https://www.papodebola.com.br/api/instagram/health?secret=..."`

- [ ] **Step 1: Write the routes**, reusing `checkToken` and `publishingUsage` from Task 10. Test them by hand on dev without a token: `ok:false`, error "não conectado".

- [ ] **Step 2: Write the guide.** Ivan follows it himself; never type credentials for him. Its steps, in Portuguese:
  1. developers.facebook.com → Meus apps → Criar app → tipo **Empresa** → nome "Papo de Bola Publisher".
  2. Add the product **Instagram** ("API do Instagram com login do Facebook") and **Login do Facebook para Empresas**.
  3. Graph API Explorer → choose the app → User Token with `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`, `business_management` → Generate → authorize the Papo de Bola Page and the Instagram account.
  4. Exchange it for a long-lived token: `GET /oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-token}`.
  5. `GET /me/accounts` with the long-lived token → the Page's `access_token`. That is the non-expiring token. Check it in the Access Token Debugger: "Expires: Never".
  6. `GET /{page-id}?fields=instagram_business_account` → `IG_USER_ID`.
  7. Ivan pastes `META_PAGE_TOKEN`, `IG_USER_ID` and `META_GRAPH_VERSION=v23.0` into `/home/ivan/papodebola-next/.env.local` and the dev one, then recreates the containers (`docker compose up -d`). If he prefers that I write the file, I write it without printing the value.
  8. The app stays in **development mode**, with Ivan as admin. Publishing to his own account needs no Meta review.

- [ ] **Step 3: Commit, pushdev, add the cron.** Commit with: `git commit -m "feat(instagram): saúde do token e uso diário no dashboard do /cms"`.

### Task 12: Docs + promote + first real story (gated)

- [ ] **Step 1: Update CLAUDE.md.** Add a section "Instagram (13/11)": the collection, the flow, the volume `data/instagram/{bandeiras,escudos,fundos}`, the envs, the crons `pdb-instagram-limpeza` and `pdb-instagram-saude`, "só o prod publica", and the HD crest gotcha (`scripts/instagram/download-crests-hd.mjs`).
- [ ] **Step 2: Update memory.** Write `memory/instagram_integracao.md` and add a line to the MEMORY.md index.
- [ ] **Step 3: Write the knowledge doc** `docs/knowledge/2026-11-13-instagram.md`, then run `/graphify --update`.
- [ ] **Step 4: Ask Ivan for the promote.** It needs his order. After the promote, confirm Payload initializes in prod (`grep payloadInitError`) and that `/api/instagram/media/<file>` returns 200 from outside (Meta fetches this URL).
- [ ] **Step 5: First real publication.** Ivan picks one item, checks only "Publicar no stories" and clicks "Publicar agora". Wait for the cron (≤1 min) and confirm:
  - status `publicado` and a `storyMediaId`;
  - the story visible on @papodebola.com.br.
  Only then confirm with Ivan that feed publishing is released.
- [ ] **Step 6: Final commit** of the docs: `git commit -m "docs(instagram): CLAUDE.md + guia + memória"`.

---

## Self-review notes

- **Spec coverage:**
  - §3.1 → Task 5 and Task 8
  - §3.2 → Task 7
  - §3.3 → Tasks 2, 3, 4 and 8 (media route)
  - §3.4 → Task 6
  - §3.5 → Tasks 10 and 11
  - §3.6 → Task 9
  - §4 edge cases:
    - discard → Task 7
    - post taken off the site after publishing → `hookAction` returns "none" for published items, because `discard` only applies to rascunho and aprovado
    - Chrome failure → Task 7, `result.error`
    - missing cover → Task 3 fallback
    - low-res crest → Task 2 and Task 7
    - Meta refusal and invalid token → Task 10
    - double click → Task 10 `claimForPublish`
  - §5 tests → every task; samples → Task 4 gate; first story → Task 12.
- **Not in Phase 1, per spec §1:** extra formats, trophies, carousel, metrics.
- **The "Escudo HD" field on Teams (spec §3.3)** is replaced by HD files on the volume (`data/instagram/escudos/{sofascoreId}.svg|png`), filled by script. This avoids DDL on `teams` (and its `_teams_v` versions table) while meeting the same goal. Uploading a crest by hand = putting the file in that folder. If Ivan wants upload through /cms, it is an extra task: an upload field plus an afterChange hook that copies the file to that folder.

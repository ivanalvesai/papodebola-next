# CMS page builder — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Qualquer pessoa cria páginas completas do site pelo `/cms` (URL livre, blocos de texto/mídia/dados ao vivo), vendo o resultado ao vivo, com modelos e importação de JSON, mais um piloto de canvas drag & drop (Puck) — sem tocar em nada que já está no ar.

**Architecture:** (1) Biblioteca única de blocos em `src/cms/blocks/` (com thumbnail, grupo e rótulo), usada por `pages` e pela nova collection `pageTemplates`; renderer único `PageBlock` que embrulha componentes de dados que já existem. (2) Campo `path` em `pages` + catch-all `[...path]` + fallthrough nas rotas dinâmicas existentes (rotas em código sempre ganham). (3) Live Preview nativo (listener `RefreshRouteOnSave`, autosave) em pages/teams/posts, admin em PT-BR e agrupado. (4) Painel de modelos (aplicar / salvar / exportar / importar JSON) via campo `ui` + REST. (5) Aba "Construtor (beta)" com Puck gravando em `puckData`, renderizado no servidor pelo mesmo `PageBlock`.

**Tech Stack:** Next.js 16.2 (App Router, ISR), React 19.2, TypeScript, Payload 3.85.1 (Postgres), `@payloadcms/live-preview-react@3.85.1`, `@puckeditor/core@0.23`, Tailwind v4, `node --test` (Node 24 local), Docker no servidor, `agent-browser` 0.38 pra testes de UI.

**Spec:** `docs/superpowers/specs/2026-09-30-cms-page-builder-design.md`

## Global Constraints

- **Nada do que está no ar muda**: rotas em código têm prioridade absoluta; `slug` das páginas existentes e `/paginas/{slug}` continuam iguais; defaults dos campos novos reproduzem o HTML atual (verificado por diff em `/sobre` e `/paginas/apostas`).
- **Fallback no código sempre**: toda leitura do Payload devolve `null` em erro e a rota segue o comportamento atual (`notFound()` / JSX em código).
- **Postgres compartilhado dev/prod**: só DDL **aditivo** (receita `payload_migrations_recipe`), `pg_dump` antes, aplicar em transação, **nunca** `payload migrate`. Validar init: sem `payloadInitError` nos logs e `/cms-api/pages?limit=1` → 200.
- **Nunca publicar sem ordem**: conteúdo de teste é rascunho (`_status: draft`), visto via `/cms-preview/*`, e apagado no fim. `_status=published` no dev aparece em prod na hora.
- Blocos de dados: **ISR + polling, nunca `force-dynamic`**; nenhuma chamada nova direta à API (só funções de `src/lib/data`).
- Arquivos do repo são **CRLF**; `src/cms/blocks/**` não pode importar React nem `@/lib/data/*` (o `payload.config.ts` roda no CLI de migration).
- Client component **não** pode importar valor de `@/lib/data/*` (puxa `node:fs` → build quebra). Usar `import type`.
- `importMap.js` é fonte da verdade versionada: rodar `node scripts/gen-importmap.mjs` localmente e commitar quando houver componente client novo.
- Sem ícones novos em UI pública; sem `text-[10px]`/`text-[11px]` em conteúdo novo.
- Typecheck local `npx tsc --noEmit` antes de cada commit; `npm test` verde.
- Commits terminam com `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.
- Deploy: DDL aplicado **antes** do primeiro `git pushdev` que usa os campos novos. Promote só na Task 13.

## Review Focus

1. **`path` colidindo com rota em código** (ex.: `/futebol/times/x`, `/noticias/x`, `/sp/x`, `/futebol/brasileirao-serie-a`): o CMS tem que recusar com mensagem em PT; a rota em código continua respondendo mesmo que alguém grave direto no banco. → Task 3 testa `validatePath`; Task 6 garante que o fallthrough só roda depois do `notFound` natural.
2. **Página com `path` ainda em rascunho**: a URL pública dá 404 real (não vaza), mas o preview mostra. → Task 6 (`getPayloadPageByPath` filtra `_status=published`) e Task 11 confere no browser.
3. **Bloco de dados com referência quebrada** (time apagado, torneio sem `seasonId`, `matchId` inválido): o bloco some ou mostra empty-state curto; a página nunca quebra. → Task 5 testa `widgetToBlockType`/`resolveTournament` e os renderers engolem erro.
4. **JSON importado inválido** (não é array, `blockType` desconhecido, `id`s de outra página): recusa com erro em PT ou limpa `id`s; nunca grava lixo. → Task 8 testa `parseLayoutImport`.
5. **Autosave + banco sem a coluna `autosave`**: o Payload falha no init e derruba o `/cms` inteiro (incidente `payload_useastitle_virtual`). → Task 4 aplica o DDL antes do build e valida `payloadInitError`.

---

### Task 0: Dependências e scripts

**Files:**
- Modify: `package.json`

**Interfaces:**
- Produces: `npm run typecheck`, `npm run thumbs` (gera SVGs, Task 1), deps `@payloadcms/live-preview-react`, `@puckeditor/core`.

- [ ] **Step 1: Instalar dependências (versões fixas, compatíveis com payload 3.85.1 / react 19.2.4)**

```bash
npm install @payloadcms/live-preview-react@3.85.1 @puckeditor/core@0.23.0
```

- [ ] **Step 2: Adicionar scripts**

Em `package.json` → `"scripts"`:
```json
"typecheck": "tsc --noEmit",
"thumbs": "node scripts/gen-block-thumbs.mjs"
```

- [ ] **Step 3: Verificar**

Run: `npm run typecheck`
Expected: sem erros (o projeto já compila hoje).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(cms): deps do page builder (live-preview-react, puck) + script typecheck

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 1: Biblioteca de blocos `src/cms/blocks/` + thumbnails + rótulo de bloco

**Files:**
- Create: `src/cms/blocks/index.ts`, `src/cms/blocks/meta.ts`, `src/cms/blocks/static.ts`, `src/cms/blocks/team.ts`, `src/cms/blocks/summary.ts`, `src/cms/blocks/summary.test.ts`
- Create: `src/cms/components/block-summary-label.tsx`
- Create: `scripts/gen-block-thumbs.mjs`, `public/cms-blocks/*.svg` (gerados)
- Modify: `src/payload.config.ts` (remover `teamLayoutBlocks` inline das linhas 20-64 e os blocos inline de `pages.layout` linhas ~635-820; importar das listas novas)

**Interfaces:**
- Produces: `PAGE_BLOCKS: Block[]` (todos os blocos de página, Task 2 adiciona os de dados), `STATIC_BLOCKS: Block[]`, `TEAM_LAYOUT_BLOCKS: Block[]`, `withMeta(block, {group, summary?}): Block`, `BLOCK_GROUPS`, `blockSummary(blockType, data): string`, `thumbUrl(slug): string`.
- Consumes: `richTextEditor` (const em `payload.config.ts:91`) — por isso `STATIC_BLOCKS` é uma **função** `staticBlocks(richTextEditor)`.

- [ ] **Step 1: Teste do resumo de bloco (puro)**

`src/cms/blocks/summary.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { blockSummary } from "./summary.ts";

test("heading mostra o texto", () => {
  assert.equal(blockSummary("heading", { text: "Tabela do Brasileirão", level: "h2" }), "Tabela do Brasileirão");
});
test("richText resume as primeiras letras do Lexical", () => {
  const content = { root: { children: [{ type: "paragraph", children: [{ type: "text", text: "Primeiro parágrafo da página sobre o campeonato estadual" }] }] } };
  assert.equal(blockSummary("richText", { content }), "Primeiro parágrafo da página sobre o campeonato estad…");
});
test("richText vazio avisa", () => {
  assert.equal(blockSummary("richText", { content: null }), "Texto vazio");
});
test("teamWidget mostra time e widget", () => {
  assert.equal(blockSummary("teamWidget", { team: { name: "Cruzeiro" }, widget: "upcoming" }), "Cruzeiro · Próximos jogos");
  assert.equal(blockSummary("teamWidget", { team: 12, widget: "standing" }), "Classificação (posição)");
});
test("standings/scorers mostram o torneio pelo slug", () => {
  assert.equal(blockSummary("standings", { tournament: "brasileirao-serie-b" }), "Brasileirão Série B");
  assert.equal(blockSummary("scorers", { tournament: "copa-do-mundo", limit: 5 }), "Copa do Mundo 2026 · 5");
});
test("newsFeed descreve a fonte", () => {
  assert.equal(blockSummary("newsFeed", { source: "category", value: "NBA", limit: 6 }), "Categoria NBA · 6");
  assert.equal(blockSummary("newsFeed", { source: "latest" }), "Últimas notícias");
});
test("section conta colunas", () => {
  assert.equal(blockSummary("section", { title: "Destaques", columns: [{}, {}] }), "Destaques · 2 colunas");
});
test("desconhecido devolve vazio", () => {
  assert.equal(blockSummary("xpto", {}), "");
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test --experimental-strip-types src/cms/blocks/summary.test.ts`
Expected: FAIL (módulo não existe).

- [ ] **Step 3: Implementar `summary.ts` (sem React, sem `@/lib/data`)**

`src/cms/blocks/summary.ts`:
```ts
import { TOURNAMENT_BY_SLUG } from "@/lib/config";

// Rótulo curto de um bloco colapsado no /cms (ex.: "Cruzeiro · Próximos jogos").
// Puro: usado pelo componente BlockSummaryLabel (client) e testado em node:test.
/* eslint-disable @typescript-eslint/no-explicit-any */

export const WIDGET_LABELS: Record<string, string> = {
  todayMatch: "Jogo de hoje",
  upcoming: "Próximos jogos",
  results: "Resultados recentes",
  standing: "Classificação (posição)",
  news: "Notícias do time",
  scorers: "Artilheiros",
  whereToWatch: "Onde assistir",
  lineup: "Escalação provável",
};

export function tournamentLabel(slug: string | undefined): string {
  if (!slug) return "";
  if (slug === "copa-do-mundo") return "Copa do Mundo 2026";
  return TOURNAMENT_BY_SLUG[slug]?.name || slug;
}

function lexicalText(content: any): string {
  const out: string[] = [];
  const walk = (n: any) => {
    if (!n) return;
    if (typeof n.text === "string") out.push(n.text);
    (n.children || []).forEach(walk);
  };
  walk(content?.root);
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function clip(s: string, max = 52): string {
  return s.length > max ? `${s.slice(0, max)}…` : s;
}

function join(...parts: (string | number | undefined | null | false)[]): string {
  return parts.filter((p) => p !== undefined && p !== null && p !== false && p !== "").join(" · ");
}

export function blockSummary(blockType: string, data: any): string {
  const d = data || {};
  switch (blockType) {
    case "heading": return clip(d.text || "");
    case "richText": { const t = lexicalText(d.content); return t ? clip(t) : "Texto vazio"; }
    case "image": return d.caption ? clip(d.caption) : (d.image?.alt ? clip(d.image.alt) : "Imagem");
    case "gallery": return `${(d.images || []).length} imagens`;
    case "quote": return clip(d.text || "");
    case "button": return join(d.label, d.url);
    case "list": return `${(d.items || []).length} itens`;
    case "infoCard": return join(d.label, d.value);
    case "note": return clip(d.text || "");
    case "youtube": return clip(d.title || d.url || "");
    case "linkCards": return join(d.title, `${(d.items || []).length} cards`);
    case "columns": return `${(d.columns || []).length} colunas`;
    case "table": return `${(d.rows || []).length} linhas`;
    case "todayGames": return join(d.title, d.league && d.league !== "all" ? tournamentLabel(d.league) : "Todas as ligas");
    case "teamWidget": {
      const team = d.team && typeof d.team === "object" ? d.team.name : undefined;
      return join(team, WIDGET_LABELS[d.widget] || d.widget);
    }
    case "standings": return join(d.title, tournamentLabel(d.tournament), d.compact && "compacta");
    case "scorers": return join(d.title, tournamentLabel(d.tournament), d.limit);
    case "newsFeed": {
      const src = d.source === "category" ? `Categoria ${d.value || ""}`.trim()
        : d.source === "tag" ? `Tag ${d.value || ""}`.trim()
        : d.source === "team" ? `Time ${d.team && typeof d.team === "object" ? d.team.name : ""}`.trim()
        : "Últimas notícias";
      return join(d.title, src, d.limit);
    }
    case "liveMatch": return join(d.title, d.matchId && `jogo ${d.matchId}`);
    case "section": return join(d.title, `${(d.columns || []).length || 1} colunas`);
    default: return "";
  }
}
```

- [ ] **Step 4: Rodar o teste**

Run: `node --test --experimental-strip-types src/cms/blocks/summary.test.ts`
Expected: PASS (8 testes). Também adicionar `src/cms/blocks/*.test.ts` ao script `test` do `package.json`:
`"test": "node --test --experimental-strip-types src/lib/*.test.ts src/lib/api/*.test.ts src/cms/blocks/*.test.ts src/cms/lib/*.test.ts"` (a pasta `src/cms/lib` nasce na Task 3; criar `src/cms/lib/.gitkeep` agora pra o glob não falhar).

- [ ] **Step 5: `meta.ts` — grupos, thumbnail e rótulo**

`src/cms/blocks/meta.ts`:
```ts
import type { Block } from "payload";

export const BLOCK_GROUPS = {
  text: "Texto e mídia",
  layout: "Layout",
  data: "Dados ao vivo",
  team: "Dados do time",
} as const;

export function thumbUrl(slug: string): string {
  return `/cms-blocks/${slug}.svg`;
}

// Aplica grupo, thumbnail e rótulo-resumo a um bloco. O Label é o mesmo componente pra
// todos (lê blockType + dados da linha e chama blockSummary).
export function withMeta(block: Block, group: keyof typeof BLOCK_GROUPS): Block {
  return {
    ...block,
    admin: {
      ...(block.admin || {}),
      group: BLOCK_GROUPS[group],
      images: { thumbnail: { url: thumbUrl(block.slug), alt: `Bloco ${block.slug}` } },
      components: {
        ...(block.admin?.components || {}),
        Label: "@/cms/components/block-summary-label#BlockSummaryLabel",
      },
    },
  };
}
```

- [ ] **Step 6: `static.ts` — mover os 13 blocos estáticos do `payload.config.ts` (verbatim)**

`src/cms/blocks/static.ts` exporta `staticBlocks(richTextEditor: RichTextAdapterProvider)`. Copiar **sem alterar slugs/campos** os blocos `richText`, `heading`, `image`, `columns`, `table`, `gallery`, `quote`, `button`, `list`, `infoCard`, `note`, `linkCards`, `youtube` que hoje estão inline em `pages.layout.blocks` (`src/payload.config.ts` ~linhas 638-820; `todayGames` fica pra Task 2). Envolver cada um em `withMeta(..., "text" | "layout")`:

```ts
import type { Block, RichTextAdapterProvider } from "payload";
import { withMeta } from "./meta";

export function staticBlocks(richTextEditor: RichTextAdapterProvider): Block[] {
  return [
    withMeta({ slug: "richText", labels: { singular: "Texto", plural: "Textos" },
      fields: [{ name: "content", type: "richText", editor: richTextEditor }] }, "text"),
    withMeta({ slug: "heading", /* ...igual ao atual... */ }, "text"),
    withMeta({ slug: "image", /* ... */ }, "text"),
    withMeta({ slug: "gallery", /* ... */ }, "text"),
    withMeta({ slug: "youtube", /* ... */ }, "text"),
    withMeta({ slug: "quote", /* ... */ }, "text"),
    withMeta({ slug: "list", /* ... */ }, "text"),
    withMeta({ slug: "table", /* ... */ }, "text"),
    withMeta({ slug: "note", /* ... */ }, "text"),
    withMeta({ slug: "columns", /* ... */ }, "layout"),
    withMeta({ slug: "button", /* ... */ }, "layout"),
    withMeta({ slug: "infoCard", /* ... */ }, "layout"),
    withMeta({ slug: "linkCards", /* ... */ }, "layout"),
  ];
}
```
(Onde está `/* ... */`, colar o objeto atual do config, inteiro. A ordem acima é a ordem no drawer.)

- [ ] **Step 7: `team.ts` — mover `teamLayoutBlocks` (verbatim) com meta**

`src/cms/blocks/team.ts`: mover `blockTitle`, `blockLimit` e o array `teamLayoutBlocks` de `payload.config.ts:20-64` pra cá como `export const TEAM_LAYOUT_BLOCKS: Block[]`, envolvendo os dinâmicos em `withMeta(b, "team")` e `richText`/`heading` em `withMeta(b, "text")`. Slugs e campos iguais.

- [ ] **Step 8: `index.ts`**

```ts
import type { Block, RichTextAdapterProvider } from "payload";
import { staticBlocks } from "./static";
export { TEAM_LAYOUT_BLOCKS } from "./team";
export { BLOCK_GROUPS, thumbUrl, withMeta } from "./meta";

// Biblioteca completa das Páginas (e dos Modelos). A Task 2 acrescenta os blocos de dados
// e a Seção aqui.
export function pageBlocks(richTextEditor: RichTextAdapterProvider): Block[] {
  return [...staticBlocks(richTextEditor)];
}
export const PAGE_BLOCK_SLUGS = ["richText","heading","image","gallery","youtube","quote","list","table","note","columns","button","infoCard","linkCards"] as const;
```

- [ ] **Step 9: `BlockSummaryLabel` (client)**

`src/cms/components/block-summary-label.tsx`:
```tsx
"use client";
import React from "react";
import { useRowLabel } from "@payloadcms/ui";
import { blockSummary } from "@/cms/blocks/summary";

// Rótulo do bloco colapsado: "Nome do bloco — resumo". Recebe blockType/rowLabel do
// Payload (BlockRowLabelClientComponent) e os dados da linha via useRowLabel.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function BlockSummaryLabel(props: { blockType?: string; rowLabel?: string; rowNumber?: number }) {
  const row = useRowLabel<any>();
  const data = row?.data || {};
  const type = props.blockType || data.blockType || "";
  const summary = blockSummary(type, data);
  return (
    <span className="pdb-block-label">
      <strong>{props.rowLabel || type}</strong>
      {summary ? <span className="pdb-block-label__summary"> — {summary}</span> : null}
    </span>
  );
}
```

- [ ] **Step 10: Gerador de thumbnails (SVG 480×320, wireframe)**

`scripts/gen-block-thumbs.mjs`:
```js
// Gera public/cms-blocks/{slug}.svg (480x320, 3:2) pra galeria de blocos do /cms.
// Wireframes simples: fundo claro, título do bloco, e formas que sugerem o layout.
import { mkdirSync, writeFileSync } from "node:fs";
const OUT = "public/cms-blocks";
mkdirSync(OUT, { recursive: true });
const G = "#00965E", B = "#F2F3F5", T = "#1F2937", M = "#9CA3AF", W = "#FFFFFF";
const rect = (x, y, w, h, f = M, r = 6) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"/>`;
const lines = (x, y, w, n, gap = 18, f = M) => Array.from({ length: n }, (_, i) => rect(x, y + i * gap, i === n - 1 ? w * 0.6 : w, 8, f, 4)).join("");
const card = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${W}" stroke="#E5E7EB"/>`;
const shapes = {
  richText: lines(40, 90, 400, 8),
  heading: rect(40, 130, 300, 26, T) + lines(40, 180, 400, 3),
  image: rect(60, 70, 360, 190, "#D1D5DB", 12) + `<circle cx="150" cy="140" r="22" fill="${W}"/>`,
  gallery: [0,1,2,3,4,5].map(i => rect(40 + (i % 3) * 140, 70 + Math.floor(i / 3) * 110, 120, 95, "#D1D5DB", 10)).join(""),
  youtube: rect(60, 70, 360, 200, "#111827", 12) + `<polygon points="220,130 220,210 290,170" fill="${W}"/>`,
  quote: rect(40, 90, 6, 140, G, 3) + lines(64, 95, 360, 5),
  list: [0,1,2,3].map(i => `<circle cx="52" cy="${100 + i * 40}" r="5" fill="${G}"/>` + rect(70, 95 + i * 40, 330 - i * 40, 10, M, 4)).join(""),
  table: [0,1,2,3,4].map(i => rect(40, 80 + i * 40, 400, 30, i === 0 ? "#D1D5DB" : W, 4)).join("") ,
  note: rect(40, 230, 400, 10, M, 4) + rect(40, 250, 260, 10, M, 4),
  columns: [0,1,2].map(i => card(40 + i * 140, 80, 120, 170) + lines(52 + i * 140, 100, 96, 5, 16)).join(""),
  button: rect(150, 130, 180, 56, G, 12) + rect(190, 152, 100, 12, W, 4),
  infoCard: card(60, 100, 360, 120) + rect(80, 120, 160, 12, T, 4) + rect(80, 150, 260, 12, M, 4),
  linkCards: [0,1,2,3,4,5].map(i => card(40 + (i % 3) * 140, 80 + Math.floor(i / 3) * 90, 120, 70) + rect(52 + (i % 3) * 140, 105 + Math.floor(i / 3) * 90, 80, 10, G, 4)).join(""),
  section: rect(20, 60, 440, 220, "#E5E7EB", 14) + card(40, 90, 200, 160) + card(260, 90, 180, 160) + lines(52, 110, 170, 4) + lines(272, 110, 150, 4),
  todayGames: [0,1,2].map(i => card(40 + i * 140, 110, 120, 90) + `<circle cx="${70 + i * 140}" cy="140" r="12" fill="#D1D5DB"/><circle cx="${130 + i * 140}" cy="140" r="12" fill="#D1D5DB"/>` + rect(85 + i * 140, 170, 30, 10, G, 4)).join(""),
  teamWidget: card(60, 70, 360, 200) + `<circle cx="120" cy="130" r="28" fill="#D1D5DB"/>` + rect(170, 110, 200, 14, T, 4) + rect(170, 140, 140, 10, M, 4) + rect(80, 200, 320, 40, B, 8),
  standings: [0,1,2,3,4,5].map(i => rect(40, 80 + i * 32, 400, 24, i === 0 ? "#D1D5DB" : W, 4) + (i ? `<circle cx="70" cy="${92 + i * 32}" r="8" fill="${i < 3 ? G : "#D1D5DB"}"/>` : "")).join(""),
  scorers: [0,1,2,3].map(i => `<circle cx="70" cy="${100 + i * 46}" r="16" fill="#D1D5DB"/>` + rect(100, 94 + i * 46, 220, 12, T, 4) + rect(380, 94 + i * 46, 40, 12, G, 4)).join(""),
  newsFeed: [0,1,2].map(i => card(40 + i * 140, 70, 120, 190) + rect(40 + i * 140, 70, 120, 90, "#D1D5DB", 10) + lines(52 + i * 140, 175, 96, 3, 16)).join(""),
  liveMatch: card(60, 70, 360, 200) + `<circle cx="140" cy="150" r="30" fill="#D1D5DB"/><circle cx="340" cy="150" r="30" fill="#D1D5DB"/>` + rect(210, 130, 60, 40, T, 8) + rect(200, 210, 80, 18, "#E8312A", 9),
  teamTodayMatch: card(60, 70, 360, 200) + `<circle cx="140" cy="150" r="30" fill="#D1D5DB"/><circle cx="340" cy="150" r="30" fill="#D1D5DB"/>` + rect(215, 140, 50, 24, T, 6),
  teamUpcoming: [0,1,2,3].map(i => rect(40, 80 + i * 46, 400, 36, W, 6) + rect(60, 92 + i * 46, 120, 10, T, 4) + rect(300, 92 + i * 46, 120, 10, M, 4)).join(""),
  teamResults: [0,1,2,3].map(i => rect(40, 80 + i * 46, 400, 36, W, 6) + rect(60, 92 + i * 46, 100, 10, T, 4) + rect(220, 90 + i * 46, 40, 14, G, 4) + rect(320, 92 + i * 46, 100, 10, T, 4)).join(""),
  teamStanding: card(60, 70, 360, 200) + rect(90, 110, 90, 60, G, 8) + lines(220, 110, 160, 4, 22),
  teamNews: [0,1,2,3].map(i => rect(40, 80 + i * 48, 400, 12, T, 4) + rect(40, 100 + i * 48, 120, 8, M, 4)).join(""),
  teamScorers: [0,1,2,3,4,5].map(i => card(40 + (i % 3) * 140, 80 + Math.floor(i / 3) * 100, 120, 80) + `<circle cx="${70 + (i % 3) * 140}" cy="${120 + Math.floor(i / 3) * 100}" r="16" fill="#D1D5DB"/>`).join(""),
  teamWhereToWatch: card(60, 70, 360, 200) + [0,1,2].map(i => rect(90, 110 + i * 44, 300, 28, B, 6)).join(""),
  teamLineup: rect(60, 60, 360, 220, "#1F8A4C", 12) + [0,1,2,3,4,5,6,7,8,9,10].map(i => `<circle cx="${120 + (i % 4) * 80}" cy="${100 + Math.floor(i / 4) * 60}" r="12" fill="${W}"/>`).join(""),
  teamClusterLinks: [0,1,2,3,4].map(i => rect(40 + i * 82, 140, 70, 40, i ? W : G, 8)).join(""),
  teamAutoText: lines(40, 90, 400, 7),
  teamClassic: rect(20, 50, 440, 240, "#E5E7EB", 14) + card(40, 70, 200, 100) + card(260, 70, 180, 100) + card(40, 190, 400, 80),
};
const titles = {
  richText: "Texto", heading: "Título", image: "Imagem", gallery: "Galeria", youtube: "Vídeo do YouTube", quote: "Citação", list: "Lista", table: "Tabela", note: "Nota",
  columns: "Colunas", button: "Botão", infoCard: "Card de info", linkCards: "Cards de link", section: "Seção",
  todayGames: "Jogos de hoje", teamWidget: "Widget de time", standings: "Classificação", scorers: "Artilharia", newsFeed: "Feed de notícias", liveMatch: "Jogo ao vivo",
  teamTodayMatch: "Jogo de hoje", teamUpcoming: "Próximos jogos", teamResults: "Resultados", teamStanding: "Posição na tabela", teamNews: "Notícias do time", teamScorers: "Artilheiros", teamWhereToWatch: "Onde assistir", teamLineup: "Escalação", teamClusterLinks: "Links do cluster", teamAutoText: "Texto automático", teamClassic: "Página padrão do time",
};
for (const [slug, body] of Object.entries(shapes)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="320" viewBox="0 0 480 320"><rect width="480" height="320" fill="${B}"/>${body}<rect x="0" y="284" width="480" height="36" fill="${W}"/><text x="16" y="308" font-family="Open Sans, Arial, sans-serif" font-size="16" font-weight="700" fill="${T}">${titles[slug]}</text><circle cx="456" cy="302" r="6" fill="${G}"/></svg>`;
  writeFileSync(`${OUT}/${slug}.svg`, svg);
}
console.log(`[thumbs] ${Object.keys(shapes).length} SVGs em ${OUT}`);
```

Run: `npm run thumbs` → 31 SVGs. Abrir um no navegador pra conferir que renderiza.

- [ ] **Step 11: Ligar no `payload.config.ts`**

- Apagar `blockTitle`, `blockLimit`, `teamLayoutBlocks` (linhas 20-64) e importar `TEAM_LAYOUT_BLOCKS` de `@/cms/blocks`; em `teamLayoutTab` usar `blocks: TEAM_LAYOUT_BLOCKS`.
- Em `pages.layout`: substituir o array inline por `blocks: pageBlocks(richTextEditor)` **mantendo o bloco `todayGames` inline por enquanto** (ele migra na Task 2): `blocks: [...pageBlocks(richTextEditor), todayGamesBlockTemporario]`. Adicionar `admin: { initCollapsed: true }` ao campo.
- `import { pageBlocks, TEAM_LAYOUT_BLOCKS } from "@/cms/blocks";`

- [ ] **Step 12: Regenerar importMap, typecheck, testes**

```bash
node scripts/gen-importmap.mjs
npm run typecheck && npm test
```
Expected: importMap ganha `BlockSummaryLabel`; tudo verde. Conferir que `importMap.js` ainda tem `TableFeatureClient` e `BlocksFeatureClient`.

- [ ] **Step 13: Commit**

```bash
git add src/cms scripts/gen-block-thumbs.mjs public/cms-blocks src/payload.config.ts "src/app/(payload)/cms/importMap.js" package.json
git commit -m "feat(cms): biblioteca de blocos em src/cms/blocks com thumbnails, grupos e rótulo-resumo

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Blocos novos — Seção e dados ao vivo (schema)

**Files:**
- Create: `src/cms/blocks/data.ts`, `src/cms/blocks/section.ts`, `src/cms/blocks/options.ts`, `src/cms/blocks/options.test.ts`
- Modify: `src/cms/blocks/index.ts`, `src/payload.config.ts` (remover `todayGames` inline)

**Interfaces:**
- Produces: `dataBlocks(): Block[]` (todayGames, teamWidget, standings, scorers, newsFeed, liveMatch), `sectionBlock(inner: Block[]): Block`, `tournamentOptions(): {label,value}[]`, `WIDGET_OPTIONS`, `pageBlocks(editor)` passa a incluir tudo, `PAGE_BLOCK_SLUGS` completo, `SECTION_INNER_SLUGS`.
- Nomes de campo (usados na Task 5 e 9): `teamWidget{team,widget,title,limit}`, `standings{tournament,title,rows,compact}`, `scorers{tournament,title,limit}`, `newsFeed{source,value,team,limit,layout,title,seeAllHref}`, `liveMatch{matchId,competition,title}`, `section{title,width,background,columns[{span,blocks}]}`.

- [ ] **Step 1: Teste das opções**

`src/cms/blocks/options.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { tournamentOptions, WIDGET_OPTIONS } from "./options.ts";

test("tournamentOptions inclui todos do config + Copa", () => {
  const values = tournamentOptions().map((o) => o.value);
  assert.ok(values.includes("brasileirao-serie-a"));
  assert.ok(values.includes("premier-league"));
  assert.equal(values[0], "copa-do-mundo");
  assert.equal(new Set(values).size, values.length);
});
test("WIDGET_OPTIONS tem os 8 widgets do time", () => {
  assert.equal(WIDGET_OPTIONS.length, 8);
  assert.deepEqual(WIDGET_OPTIONS.map((o) => o.value), ["todayMatch","upcoming","results","standing","news","scorers","whereToWatch","lineup"]);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `node --test --experimental-strip-types src/cms/blocks/options.test.ts` → FAIL.

- [ ] **Step 3: `options.ts`**

```ts
import { TOURNAMENTS } from "@/lib/config";
import { WIDGET_LABELS } from "./summary";

export function tournamentOptions(): { label: string; value: string }[] {
  return [
    { label: "Copa do Mundo 2026", value: "copa-do-mundo" },
    ...Object.values(TOURNAMENTS).map((t) => ({ label: t.name, value: t.slug })),
  ];
}
export const WIDGET_OPTIONS = Object.entries(WIDGET_LABELS).map(([value, label]) => ({ label, value }));
```

- [ ] **Step 4: `data.ts`**

```ts
import type { Block, Field } from "payload";
import { withMeta } from "./meta";
import { tournamentOptions, WIDGET_OPTIONS } from "./options";

const title: Field = { name: "title", type: "text", label: "Título (opcional)", admin: { description: "Aparece acima do bloco" } };
const limit = (def: number): Field => ({ name: "limit", type: "number", label: "Quantidade", defaultValue: def, min: 1, max: 30 });
const tournament: Field = {
  name: "tournament", type: "select", required: true, label: "Campeonato",
  defaultValue: "brasileirao-serie-a", options: tournamentOptions(),
};

// Mover o bloco `todayGames` de payload.config.ts pra cá, verbatim, só embrulhado:
export const todayGamesBlock: Block = withMeta({
  slug: "todayGames",
  labels: { singular: "Jogos de hoje", plural: "Jogos de hoje" },
  fields: [ /* colar os 8 campos atuais: title, league, emptyTitle, emptyText, primaryCtaLabel, primaryCtaHref, secondaryCtaLabel, secondaryCtaHref */ ],
}, "data");

export function dataBlocks(): Block[] {
  return [
    todayGamesBlock,
    withMeta({
      slug: "teamWidget",
      labels: { singular: "Widget de time", plural: "Widgets de time" },
      fields: [
        { name: "team", type: "relationship", relationTo: "teams", required: true, label: "Time", admin: { description: "Qualquer time cadastrado em Times" } },
        { name: "widget", type: "select", required: true, defaultValue: "upcoming", label: "O que mostrar", options: WIDGET_OPTIONS },
        title, limit(5),
      ],
    }, "data"),
    withMeta({
      slug: "standings",
      labels: { singular: "Classificação de campeonato", plural: "Classificações" },
      fields: [
        tournament, title,
        { name: "rows", type: "number", label: "Linhas", defaultValue: 20, min: 4, max: 30 },
        { name: "compact", type: "checkbox", label: "Versão compacta (10 linhas, estilo widget)", defaultValue: false },
      ],
    }, "data"),
    withMeta({
      slug: "scorers",
      labels: { singular: "Artilharia de campeonato", plural: "Artilharias" },
      fields: [tournament, title, limit(10)],
    }, "data"),
    withMeta({
      slug: "newsFeed",
      labels: { singular: "Feed de notícias", plural: "Feeds de notícias" },
      fields: [
        { name: "source", type: "select", required: true, defaultValue: "latest", label: "Fonte",
          options: [
            { label: "Últimas notícias", value: "latest" },
            { label: "Por categoria", value: "category" },
            { label: "Por tag", value: "tag" },
            { label: "Por time", value: "team" },
          ] },
        { name: "value", type: "text", label: "Categoria ou tag", admin: { description: "Nome exato (ex.: NBA, Brasileirão, Copa do Mundo)", condition: (_, s) => s?.source === "category" || s?.source === "tag" } },
        { name: "team", type: "relationship", relationTo: "teams", label: "Time", admin: { condition: (_, s) => s?.source === "team" } },
        limit(6),
        { name: "layout", type: "select", defaultValue: "grid", label: "Formato",
          options: [{ label: "Grade (cards com imagem)", value: "grid" }, { label: "Lista", value: "list" }, { label: "Destaque + grade", value: "featured" }] },
        title,
        { name: "seeAllHref", type: "text", label: "Link 'Ver todas' (opcional)" },
      ],
    }, "data"),
    withMeta({
      slug: "liveMatch",
      labels: { singular: "Jogo ao vivo (futebol)", plural: "Jogos ao vivo" },
      fields: [
        { name: "matchId", type: "number", required: true, label: "ID do jogo (API)", admin: { description: "Número do evento na API esportiva (ex.: 16814493). Placar e lance a lance atualizam sozinhos." } },
        { name: "competition", type: "text", label: "Competição (texto acima do placar)" },
        title,
      ],
    }, "data"),
  ];
}
```

- [ ] **Step 5: `section.ts`**

```ts
import type { Block } from "payload";
import { withMeta } from "./meta";

// Seção com 1 a 3 colunas; cada coluna recebe blocos da biblioteca (sem outra Seção dentro).
export function sectionBlock(inner: Block[]): Block {
  return withMeta({
    slug: "section",
    labels: { singular: "Seção (colunas)", plural: "Seções" },
    fields: [
      { name: "title", type: "text", label: "Título da seção (opcional)" },
      { name: "width", type: "select", defaultValue: "wide", label: "Largura",
        options: [{ label: "Estreita (720px)", value: "narrow" }, { label: "Larga (1240px)", value: "wide" }, { label: "Tela cheia", value: "full" }],
        admin: { description: "Só vale quando a página é larga ou tela cheia (Aparência da página)." } },
      { name: "background", type: "select", defaultValue: "none", label: "Fundo",
        options: [{ label: "Nenhum", value: "none" }, { label: "Card branco", value: "card" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }] },
      {
        name: "columns", type: "array", label: "Colunas", minRows: 1, maxRows: 3,
        admin: { description: "1 a 3 colunas. No celular empilham." },
        fields: [
          { name: "span", type: "select", defaultValue: "1", label: "Largura da coluna", options: [{ label: "Normal", value: "1" }, { label: "Dupla", value: "2" }] },
          { name: "blocks", type: "blocks", label: "Blocos", blocks: inner, admin: { initCollapsed: true } },
        ],
      },
    ],
  }, "layout");
}
```

- [ ] **Step 6: Atualizar `index.ts`**

```ts
import { dataBlocks } from "./data";
import { sectionBlock } from "./section";

export function pageBlocks(richTextEditor: RichTextAdapterProvider): Block[] {
  const inner = [...staticBlocks(richTextEditor), ...dataBlocks()];
  return [sectionBlock(inner), ...inner];
}
export const SECTION_INNER_SLUGS = ["richText","heading","image","gallery","youtube","quote","list","table","note","columns","button","infoCard","linkCards","todayGames","teamWidget","standings","scorers","newsFeed","liveMatch"] as const;
export const PAGE_BLOCK_SLUGS = ["section", ...SECTION_INNER_SLUGS] as const;
export { dataBlocks, todayGamesBlock } from "./data";
```

- [ ] **Step 7: Tirar o `todayGames` inline do `payload.config.ts`** (agora vem do `pageBlocks`). `pages.layout.blocks: pageBlocks(richTextEditor)`.

- [ ] **Step 8: Rodar** `node --test --experimental-strip-types src/cms/blocks/options.test.ts && npm run typecheck` → PASS.

- [ ] **Step 9: Commit**

```bash
git add src/cms src/payload.config.ts
git commit -m "feat(cms): blocos Seção, widget de time, classificação, artilharia, feed de notícias e jogo ao vivo (schema)

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Collection `pages` (path, aparência, editor, hooks, live preview), `pageTemplates`, admin PT-BR

**Files:**
- Create: `src/cms/lib/cms-paths.ts`, `src/cms/lib/cms-paths.test.ts`, `src/cms/collections/pages.ts`, `src/cms/collections/page-templates.ts`, `src/cms/lib/preview-url.ts`
- Modify: `src/payload.config.ts` (pages vira import; `teams` ganha livePreview/autosave/group/`ui` de preview; `i18n`, `admin.meta`, `admin.group` em todas), `src/lib/data/payload-pages.ts` (tipo)

**Interfaces:**
- Produces: `validatePath(value): true | string`, `normalizePath(v): string`, `RESERVED_FIRST_SEGMENTS`, `previewUrl(kind: 'pagina'|'time'|'post', id|slug, extra?)`, collections `pages` (campos novos: `path`, `layoutStyle{width,showBreadcrumb}`, `hero{h1,subtitle,style,image}`, `editor`, `puckData`, `templateTools` ui), `pageTemplates{title,description,thumbnail,hero,layoutStyle,layout}`.
- Tipo `PayloadPage` ganha: `id: number; path?: string | null; layoutStyle?: { width?: "narrow"|"wide"|"full"; showBreadcrumb?: boolean }; hero?: { h1?; subtitle?; style?: "centered"|"left"|"banner"; image?: { url?: string; alt?: string } | number | null }; editor?: "blocks"|"puck"; puckData?: any; showSponsors?: boolean; _status?: string;`

- [ ] **Step 1: Teste do validador de caminho**

`src/cms/lib/cms-paths.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { validatePath, normalizePath } from "./cms-paths.ts";

test("aceita caminho simples e aninhado", () => {
  assert.equal(validatePath("/volei/mundial-2026"), true);
  assert.equal(validatePath("/copa-america-2028"), true);
  assert.equal(validatePath("/futebol/copa-america"), true); // /futebol/[slug] faz fallthrough
});
test("vazio é permitido (página fica em /paginas/{slug})", () => {
  assert.equal(validatePath(""), true);
  assert.equal(validatePath(undefined), true);
});
test("formato: começa com /, minúsculas, sem barra final, máx 6 segmentos", () => {
  assert.match(String(validatePath("volei")), /começar com \//);
  assert.match(String(validatePath("/Volei/Mundial")), /letras minúsculas/);
  assert.match(String(validatePath("/volei/")), /barra no final/);
  assert.match(String(validatePath("/a/b/c/d/e/f/g")), /6 segmentos/);
  assert.match(String(validatePath("/volei/mundial 2026")), /letras minúsculas/);
});
test("recusa árvores reservadas ao código", () => {
  for (const p of ["/api/x", "/cms/x", "/cms-api/x", "/cms-preview/x", "/paginas/x", "/noticias/x", "/artigos/x", "/autor/x", "/sp/x", "/jogos-de-hoje/x", "/ao-vivo", "/studio-pdb/x", "/painel-pdb-9x", "/img/team/1", "/_next/x"]) {
    assert.match(String(validatePath(p)), /reservad/i, p);
  }
});
test("recusa rota estática de 1 segmento que já existe", () => {
  for (const p of ["/futebol", "/volei", "/sobre", "/contato", "/nba", "/tenis"]) assert.match(String(validatePath(p)), /já existe/i, p);
});
test("recusa subárvores do futebol que são código", () => {
  for (const p of ["/futebol/times/cruzeiro", "/futebol/copa-do-mundo/x", "/futebol/selecao-brasileira/x", "/futebol/craque/x", "/futebol/onde-assistir", "/futebol/brasileirao-serie-a", "/futebol/copa-america/jogos"]) {
    assert.notEqual(validatePath(p), true, p);
  }
});
test("normalizePath tira espaços e barra final", () => {
  assert.equal(normalizePath("  /volei/mundial-2026/ "), "/volei/mundial-2026");
});
```

- [ ] **Step 2: Rodar e ver falhar** — `node --test --experimental-strip-types src/cms/lib/cms-paths.test.ts` → FAIL.

- [ ] **Step 3: `cms-paths.ts`**

```ts
import { RESERVED_TOP_LEVEL, TOURNAMENT_BY_SLUG } from "@/lib/config";

// Caminhos que o CMS pode ou não usar. Regra: rota em CÓDIGO sempre ganha. Aqui só
// impedimos o editor de gravar um caminho que nunca vai responder (ou que colide).

// Árvores inteiramente do código (qualquer coisa abaixo é recusada).
export const RESERVED_FIRST_SEGMENTS = new Set([
  ...RESERVED_TOP_LEVEL, "api", "cms", "cms-api", "cms-preview", "paginas", "img", "_next",
  "autor", "studio-pdb", "painel-pdb-9x", "sitemap.xml", "robots.txt", "manifest.webmanifest", "llms.txt",
]);
// Rotas estáticas de 1 segmento que existem em src/app/(site) (um CMS path igual nunca responderia).
export const STATIC_TOP_LEVEL = new Set([
  "apostas", "boxe", "combate", "esports", "formula-1", "futebol", "futebol-americano", "nba", "tenis", "volei",
  "sobre", "contato", "parceiros", "politica-de-privacidade", "termos-de-uso", "casas-de-apostas",
]);
// Subárvores do /futebol que são código.
const FUTEBOL_CODE = new Set(["times", "copa-do-mundo", "copa-do-mundo-feminina", "selecao-brasileira", "selecoes", "craque", "onde-assistir"]);

export function normalizePath(v: string | undefined | null): string {
  const s = String(v ?? "").trim();
  return s.length > 1 ? s.replace(/\/+$/, "") : s;
}

export function validatePath(value: string | undefined | null): true | string {
  const v = String(value ?? "").trim();
  if (!v) return true;
  if (!v.startsWith("/")) return "O caminho precisa começar com / (ex.: /volei/mundial-2026).";
  if (v.length > 1 && v.endsWith("/")) return "Sem barra no final.";
  const segs = v.slice(1).split("/");
  if (segs.length > 6) return "Máximo de 6 segmentos.";
  if (!segs.every((s) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))) return "Use só letras minúsculas, números e hífens em cada parte.";
  const [first, second] = segs;
  if (RESERVED_FIRST_SEGMENTS.has(first)) return `"/${first}" é reservado ao código do site.`;
  if (segs.length === 1 && STATIC_TOP_LEVEL.has(first)) return `A rota /${first} já existe no site.`;
  if (first === "futebol") {
    if (FUTEBOL_CODE.has(second)) return `"/futebol/${second}" é reservado ao código do site.`;
    if (TOURNAMENT_BY_SLUG[second]) return `/futebol/${second} já existe (campeonato).`;
    if (segs.length > 2) return "Abaixo de /futebol só é possível 1 nível (ex.: /futebol/copa-america).";
  }
  return true;
}
```

- [ ] **Step 4: Rodar** → PASS. (Se `RESERVED_TOP_LEVEL` de `@/lib/config` puxar algo que quebre no node:test, o teste roda com `--experimental-strip-types` igual aos demais — `config.ts` já é importado em `src/lib/*.test.ts`.)

- [ ] **Step 5: `preview-url.ts`**

```ts
// URLs de preview/live preview por collection. CRON_SECRET autoriza o iframe do /cms
// mesmo sem cookie (ver cms-preview-auth). Relativas: o admin e o site são o mesmo host.
export function previewUrl(kind: "pagina" | "time" | "post", key: string | number | undefined, extra?: string): string {
  const secret = process.env.CRON_SECRET || "";
  const base = kind === "pagina" ? `/cms-preview/pagina/${key ?? "novo"}`
    : kind === "time" ? `/cms-preview/time/${key ?? ""}/${extra || "hub"}`
    : `/cms-preview/${key ?? ""}`;
  return `${base}?previewSecret=${encodeURIComponent(secret)}`;
}
export const PREVIEW_BREAKPOINTS = [
  { label: "Celular", name: "mobile", width: 390, height: 844 },
  { label: "Tablet", name: "tablet", width: 768, height: 1024 },
  { label: "Desktop", name: "desktop", width: 1440, height: 900 },
];
```

- [ ] **Step 6: `src/cms/collections/pages.ts`** (mover a collection pra fora do config; usar os campos atuais + novos)

```ts
import type { CollectionConfig, Field, RichTextAdapterProvider } from "payload";
import { revalidatePath } from "next/cache";
import { pageBlocks } from "@/cms/blocks";
import { validatePath, normalizePath } from "@/cms/lib/cms-paths";
import { previewUrl, PREVIEW_BREAKPOINTS } from "@/cms/lib/preview-url";
import { dedicatedPageRoute } from "@/lib/dedicated-pages";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const heroGroup: Field = {
  name: "hero", type: "group", label: "Cabeçalho",
  fields: [
    { name: "h1", type: "text", label: "Título (H1)" },
    { name: "subtitle", type: "text", label: "Subtítulo" },
    { name: "style", type: "select", defaultValue: "centered", label: "Estilo",
      options: [{ label: "Centralizado", value: "centered" }, { label: "Alinhado à esquerda", value: "left" }, { label: "Banner com imagem", value: "banner" }] },
    { name: "image", type: "upload", relationTo: "media", label: "Imagem do banner", admin: { condition: (_, s) => s?.style === "banner" } },
  ],
};
export const layoutStyleGroup: Field = {
  name: "layoutStyle", type: "group", label: "Aparência da página",
  fields: [
    { name: "width", type: "select", defaultValue: "narrow", label: "Largura",
      options: [{ label: "Estreita em card (720px) — padrão", value: "narrow" }, { label: "Larga (1240px)", value: "wide" }, { label: "Tela cheia (seções controlam a largura)", value: "full" }] },
    { name: "showBreadcrumb", type: "checkbox", defaultValue: false, label: "Mostrar trilha (Início › …)" },
  ],
};

export function pagesCollection(richTextEditor: RichTextAdapterProvider): CollectionConfig {
  return {
    slug: "pages",
    labels: { singular: "Página", plural: "Páginas" },
    admin: {
      useAsTitle: "title",
      group: "Conteúdo",
      defaultColumns: ["title", "path", "slug", "_status", "updatedAt"],
      description: "Páginas montadas por blocos. Caminho vazio = /paginas/{slug}. Use a aba Live Preview pra ver ao vivo.",
      livePreview: { url: ({ data }) => previewUrl("pagina", data?.id), breakpoints: PREVIEW_BREAKPOINTS },
      preview: (data) => previewUrl("pagina", (data as any)?.id),
      components: {
        views: {
          edit: {
            construtor: {
              Component: "@/cms/components/puck-view#PuckView",
              path: "/construtor",
              tab: { label: "Construtor (beta)", href: "/construtor", order: "60" },
            },
          },
        },
      },
    },
    versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
    access: { read: ({ req: { user } }) => (user ? true : { _status: { equals: "published" } }) },
    hooks: {
      afterChange: [({ doc }: any) => { revalidatePageDoc(doc); return doc; }],
      afterDelete: [({ doc }: any) => { revalidatePageDoc(doc); return doc; }],
    },
    fields: [
      { name: "title", type: "text", required: true, label: "Nome da página" },
      {
        name: "path", type: "text", unique: true, index: true, label: "Caminho (URL final)",
        admin: { position: "sidebar", description: "Ex.: /volei/mundial-2026. Vazio = /paginas/{slug}. Rotas que já existem no site são recusadas." },
        hooks: { beforeValidate: [({ value }) => (value ? normalizePath(value) : value)] },
        validate: (value: any) => validatePath(value),
      },
      { name: "slug", type: "text", required: true, unique: true, index: true, admin: { position: "sidebar", description: "Identificador interno (também usado em /paginas/{slug})" } },
      { name: "templateTools", type: "ui", admin: { position: "sidebar", components: { Field: "@/cms/components/template-tools#TemplateTools" } } },
      { name: "editor", type: "select", defaultValue: "blocks", label: "Editor usado no site", admin: { position: "sidebar", description: "Blocos (esta aba) ou Construtor (aba Construtor). Mudar aqui troca o que o site renderiza." },
        options: [{ label: "Blocos", value: "blocks" }, { label: "Construtor (beta)", value: "puck" }] },
      heroGroup,
      layoutStyleGroup,
      { name: "layout", type: "blocks", label: "Blocos da página", blocks: pageBlocks(richTextEditor), admin: { initCollapsed: true } },
      { name: "puckData", type: "json", label: "Dados do Construtor", admin: { hidden: true } },
      { name: "seo", type: "group", label: "SEO", fields: [
        { name: "metaTitle", type: "text", label: "Título (meta title)" },
        { name: "metaDescription", type: "textarea", label: "Descrição (meta description)" },
      ] },
      { name: "showSponsors", type: "checkbox", defaultValue: false, label: "Exibir faixa de patrocinadores nesta página",
        admin: { description: "Mostra a faixa com os patrocinadores ATIVOS abaixo do conteúdo desta página. Usado na página do Municipal." } },
    ],
  };
}

export function pagePublicPath(doc: { path?: string | null; slug?: string }): string {
  if (doc.path) return doc.path;
  const dedicated = doc.slug ? dedicatedPageRoute(doc.slug) : null;
  return dedicated || `/paginas/${doc.slug}`;
}

function revalidatePageDoc(doc: any) {
  try {
    revalidatePath(pagePublicPath(doc));
    if (doc?.slug) revalidatePath(`/paginas/${doc.slug}`);
    revalidatePath("/sitemap.xml");
  } catch { /* fora de request (CLI/build) */ }
}
```

- [ ] **Step 7: `src/cms/collections/page-templates.ts`**

```ts
import type { CollectionConfig, RichTextAdapterProvider } from "payload";
import { pageBlocks } from "@/cms/blocks";
import { heroGroup, layoutStyleGroup } from "./pages";

export function pageTemplatesCollection(richTextEditor: RichTextAdapterProvider): CollectionConfig {
  return {
    slug: "pageTemplates",
    labels: { singular: "Modelo de página", plural: "Modelos de página" },
    admin: { useAsTitle: "title", group: "Conteúdo", defaultColumns: ["title", "description", "updatedAt"],
      description: "Layouts prontos pra começar uma página. Em qualquer Página, use 'Aplicar modelo' na barra lateral." },
    access: { read: ({ req: { user } }) => !!user, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
    fields: [
      { name: "title", type: "text", required: true, label: "Nome do modelo" },
      { name: "description", type: "textarea", label: "Pra que serve" },
      { name: "thumbnail", type: "upload", relationTo: "media", label: "Miniatura (opcional)" },
      heroGroup,
      layoutStyleGroup,
      { name: "layout", type: "blocks", label: "Blocos", blocks: pageBlocks(richTextEditor), admin: { initCollapsed: true } },
    ],
  };
}
```

- [ ] **Step 8: Ligar no `payload.config.ts`**

- Import `{ pt } from "@payloadcms/translations/languages/pt"`; `i18n: { supportedLanguages: { pt }, fallbackLanguage: "pt" }`.
- `admin: { user: "users", importMap: {...}, meta: { titleSuffix: " · Papo de Bola CMS" }, livePreview: { breakpoints: PREVIEW_BREAKPOINTS } }` (breakpoints globais; `url` fica por collection).
- Substituir o objeto inline de `pages` por `pagesCollection(richTextEditor)`; adicionar `pageTemplatesCollection(richTextEditor)` logo depois.
- `teams`: `admin.group: "Futebol"`, `admin.livePreview: { url: ({ data }) => previewUrl("time", data?.slug, "hub") }`, `admin.preview: (data) => previewUrl("time", data?.slug, "hub")`, `versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 30 }`. Em cada aba (`teamLayoutTab`), acrescentar antes do campo de blocos um `ui`: `{ name: \`preview_${name}\`, type: "ui", admin: { components: { Field: "@/cms/components/team-preview-link#TeamPreviewLink" }, custom: { aba: <slug da aba: hub|jogo-hoje|onde-assistir|escalacao|proximos-jogos|estatisticas> } } }` (o componente lê `field.admin.custom.aba` e o `slug` do form e abre `previewUrl("time", slug, aba)` numa nova aba).
- `posts`: `admin.group: "Conteúdo"`; `livePreview.url` passa a usar `previewUrl("post", data?.slug)` (mesmo destino de hoje). `media`, `authors`: grupo "Conteúdo". `matchComments`, `municipalGames`: "Futebol". `sponsors`: "Comercial". `users`: "Sistema".
- Labels PT nas collections que não têm (`users`: Usuário/Usuários; `media`: Mídia/Mídias).

- [ ] **Step 9: `TeamPreviewLink` (client, pequeno)**

`src/cms/components/team-preview-link.tsx`:
```tsx
"use client";
import React from "react";
import { useFormFields } from "@payloadcms/ui";

export function TeamPreviewLink(props: { field?: { admin?: { custom?: { aba?: string } } } }) {
  const slug = useFormFields(([fields]) => fields?.slug?.value as string | undefined);
  const aba = props.field?.admin?.custom?.aba || "hub";
  if (!slug) return null;
  const href = `/cms-preview/time/${slug}/${aba}`;
  return (
    <p className="pdb-preview-link">
      <a href={href} target="_blank" rel="noreferrer">Ver esta aba no preview ↗</a>
      <span> (abre em nova janela; usa sua sessão do CMS)</span>
    </p>
  );
}
```

- [ ] **Step 10: Atualizar `PayloadPage` em `src/lib/data/payload-pages.ts`** com os campos novos (ver Interfaces). Criar **stubs** mínimos pros componentes que o config referencia mas só nascem depois, pra o typecheck/importMap passarem agora: `src/cms/components/template-tools.tsx` (`"use client"; export function TemplateTools(){ return null; }`) e `src/cms/components/puck-view.tsx` (`export function PuckView(){ return null; }`). As Tasks 8 e 9 substituem.

- [ ] **Step 11: importMap, typecheck, testes**

```bash
node scripts/gen-importmap.mjs && npm run typecheck && npm test
```
Expected: verde; `importMap.js` com `TemplateTools`, `PuckView`, `TeamPreviewLink`, `BlockSummaryLabel`.

- [ ] **Step 12: Commit**

```bash
git add src/cms src/payload.config.ts src/lib/data/payload-pages.ts "src/app/(payload)/cms/importMap.js" package.json
git commit -m "feat(cms): páginas com caminho livre, aparência, live preview, autosave; modelos de página; admin em PT-BR agrupado

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Schema no Postgres (DDL aditivo) — no servidor

**Files:**
- Create (servidor, workspace dev): `Dockerfile.migrate` (não commitado — está gitignored? conferir; se não estiver, criar em `/home/ivan/` e usar `-f`)
- Produz: `~/pdb_payload_backup_20260930.sql`, `~/pdb-ddl-20260930.sql` (só DDL aditivo)

**Interfaces:**
- Consumes: `payload.config.ts` da Task 3 (push pro GitHub **sem** rebuild: `git push origin development`, e no servidor `git pull` no workspace dev sem rodar `rebuild.sh`).

- [ ] **Step 1: Push do código (sem rebuild) e pull no servidor**

```bash
git push origin development
ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 "cd /home/ivan/papodebola-next-dev && git pull --rebase origin development && git log --oneline -1"
```
(**Não** rodar `rebuild.sh` ainda. O watcher reage a edições no filesystem via inotify: um `git pull` pode disparar o watcher → ele faria rebuild. Pra evitar: `sudo systemctl stop papodebola-watch-dev` antes do pull e `start` só no fim da Task 10.)

- [ ] **Step 2: Backup**

```bash
ssh ... "docker exec pdb-postgres pg_dump -U pdb -d pdb_payload --no-owner > ~/pdb_payload_backup_20260930.sql && ls -la ~/pdb_payload_backup_20260930.sql"
```

- [ ] **Step 3: Rebuild da imagem `pdb-migrate` (deps mudaram)**

`/home/ivan/Dockerfile.migrate`:
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
```
```bash
ssh ... "cd /home/ivan/papodebola-next-dev && docker build -f /home/ivan/Dockerfile.migrate -t pdb-migrate . 2>&1 | tail -3"
```

- [ ] **Step 4: Gerar a migration num container na `pdb-net`**

Pegar `DATABASE_URI` e `PAYLOAD_SECRET` do `.env.local` do dev (não ecoar valores):
```bash
ssh ... 'cd /home/ivan/papodebola-next-dev && set -a && . ./.env.local && set +a && docker rm -f pdb-mig 2>/dev/null; docker run --name pdb-mig --network pdb-net -e DATABASE_URI="$DATABASE_URI" -e PAYLOAD_SECRET="$PAYLOAD_SECRET" -e PAYLOAD_CONFIG_PATH=src/payload.config.ts pdb-migrate sh -c "node -e \"const p=require(\\\"./package.json\\\");p.type=\\\"module\\\";require(\\\"fs\\\").writeFileSync(\\\"./package.json\\\",JSON.stringify(p))\" && npx payload migrate:create page_builder 2>&1 | tail -5" && rm -rf /tmp/pdb-migrations && docker cp pdb-mig:/app/src/migrations /tmp/pdb-migrations && ls /tmp/pdb-migrations'
```

- [ ] **Step 5: Extrair SÓ o DDL novo**

O arquivo gerado tem o schema inteiro. Extrair pra `~/pdb-ddl-20260930.sql` apenas:
- `CREATE TYPE` dos enums novos: `enum_pages_hero_style`, `enum_pages_layout_style_width`, `enum_pages_editor`, `enum__pages_v_version_*` equivalentes, enums dos blocos novos (`*_blocks_section_width`, `*_background`, `*_columns_span`, `*_team_widget_widget`, `*_standings_tournament`, `*_scorers_tournament`, `*_news_feed_source`, `*_news_feed_layout`) e os de `page_templates`.
- `ALTER TABLE pages ADD COLUMN` para: `path`, `hero_style`, `hero_image_id`, `layout_style_width`, `layout_style_show_breadcrumb`, `editor`, `puck_data`; `ALTER TABLE _pages_v ADD COLUMN` para `version_path`, `version_hero_style`, `version_hero_image_id`, `version_layout_style_width`, `version_layout_style_show_breadcrumb`, `version_editor`, `version_puck_data`, `autosave`; `ALTER TABLE _teams_v ADD COLUMN autosave boolean`.
- `CREATE TABLE` de todas as tabelas novas: `pages_blocks_section`, `pages_blocks_section_columns`, `pages_blocks_section_columns_blocks_*` (uma por bloco interno — o Postgres aninha o nome), `pages_blocks_team_widget`, `pages_blocks_standings`, `pages_blocks_scorers`, `pages_blocks_news_feed`, `pages_blocks_live_match`, os espelhos `_pages_v_blocks_*`, `pages_rels` (se não existir — hoje `pages` não tem relationship; o `team` do teamWidget/newsFeed cria `pages_rels` e `_pages_v_rels`), e **tudo** de `page_templates*` (`page_templates`, `page_templates_blocks_*`, `page_templates_rels`).
- `CREATE INDEX`/`UNIQUE INDEX` novos (inclusive `pages_path_idx` único) e `ADD CONSTRAINT ... FOREIGN KEY` novos.
- `ALTER TABLE payload_locked_documents_rels ADD COLUMN page_templates_id integer` + FK + index.

Conferir com `grep -nE "DROP|ALTER COLUMN|RENAME" ~/pdb-ddl-20260930.sql` → **vazio**. Envolver em `BEGIN; ... COMMIT;`. Toda linha `CREATE TABLE`/`CREATE TYPE`/`CREATE INDEX` pode ganhar `IF NOT EXISTS` pra idempotência.

- [ ] **Step 6: Aplicar em transação e validar**

```bash
ssh ... "docker cp ~/pdb-ddl-20260930.sql pdb-postgres:/tmp/ddl.sql && docker exec pdb-postgres psql -U pdb -d pdb_payload -v ON_ERROR_STOP=1 -f /tmp/ddl.sql 2>&1 | tail -5"
ssh ... "docker exec pdb-postgres psql -U pdb -d pdb_payload -At -c \"select column_name from information_schema.columns where table_name='pages' order by ordinal_position\" | tr '\n' ' '; echo; docker exec pdb-postgres psql -U pdb -d pdb_payload -At -c \"select count(*) from information_schema.tables where table_name like 'page_templates%'\""
```
Expected: colunas novas presentes; ≥ 20 tabelas `page_templates*`. `docker rm -f pdb-mig`.

- [ ] **Step 7: Prova de init do Payload com o schema novo (antes do build do dev)**

No container `pdb-mig`-like (mesma imagem): `npx payload run` de um script que faz `payload.find({collection:'pages', limit:1})` e `payload.find({collection:'pageTemplates', limit:1})` e grava `/app/out.txt`. Se der erro de coluna faltando, voltar ao Step 5 (algo ficou de fora). Nada no repo.

---

### Task 5: Renderer único `PageBlock` + blocos de dados + shell da página

**Files:**
- Create: `src/components/payload/data-blocks.tsx`, `src/components/payload/section-block.tsx`, `src/components/payload/standings-table-block.tsx`, `src/components/payload/page-shell.tsx`, `src/lib/cms-render.ts`, `src/lib/cms-render.test.ts`
- Modify: `src/components/payload/page-blocks.tsx`, `src/components/payload/agenda-blocks.tsx`, `src/lib/data/scorers.ts` (generalizar), `src/components/payload/team-blocks.tsx` (exportar `TeamBlock` já exporta; nada)

**Interfaces:**
- Produces: `PageBlock({ block, pageWidth })` (async server), `PageBlocks({ page, breadcrumbItems? })`, `widgetToBlockType(widget): string`, `resolveTournament(slug): { kind: "worldcup" } | { kind: "tournament"; t: Tournament } | null`, `getScorersFor(t: Tournament): Promise<Scorer[]>`.
- Consumes: `getTeamPageDataFor`, `getTeamLastLineup`, `teamInfoFromDoc`, `getStandings`, `getWorldCupStandings`, `getWorldCupScorers`, `getArticles`, `getMatchDetail`, `getStoredFootballAgenda`, `TeamBlock`, `StandingsWidget`, `ScorersWidget`, `FeedItem`, `FeaturedCard` (precisa ser exportado de `news-section.tsx`), `LiveMatch`, `MatchCarousel`.

- [ ] **Step 1: Testes puros**

`src/lib/cms-render.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { widgetToBlockType, resolveTournament, pathBreadcrumb } from "./cms-render.ts";

test("widgetToBlockType mapeia pros slugs dos blocos de time", () => {
  assert.equal(widgetToBlockType("upcoming"), "teamUpcoming");
  assert.equal(widgetToBlockType("whereToWatch"), "teamWhereToWatch");
  assert.equal(widgetToBlockType("todayMatch"), "teamTodayMatch");
  assert.equal(widgetToBlockType("xpto"), "");
});
test("resolveTournament", () => {
  assert.deepEqual(resolveTournament("copa-do-mundo"), { kind: "worldcup" });
  const r = resolveTournament("brasileirao-serie-b");
  assert.equal(r?.kind, "tournament");
  assert.equal(resolveTournament("nao-existe"), null);
  assert.equal(resolveTournament(undefined), null);
});
test("pathBreadcrumb gera trilha a partir do caminho", () => {
  assert.deepEqual(pathBreadcrumb("/volei/mundial-2026", "Mundial 2026"), [
    { label: "Início", href: "/" },
    { label: "Volei", href: "/volei" },
    { label: "Mundial 2026", href: "/volei/mundial-2026" },
  ]);
});
```

- [ ] **Step 2: Falhar** → `node --test --experimental-strip-types src/lib/cms-render.test.ts`.

- [ ] **Step 3: `src/lib/cms-render.ts`** (sem React, sem `@/lib/data`)

```ts
import { TOURNAMENT_BY_SLUG, type Tournament } from "@/lib/config";

const WIDGET_TO_BLOCK: Record<string, string> = {
  todayMatch: "teamTodayMatch", upcoming: "teamUpcoming", results: "teamResults", standing: "teamStanding",
  news: "teamNews", scorers: "teamScorers", whereToWatch: "teamWhereToWatch", lineup: "teamLineup",
};
export function widgetToBlockType(widget: string | undefined): string {
  return (widget && WIDGET_TO_BLOCK[widget]) || "";
}
export function resolveTournament(slug: string | undefined): { kind: "worldcup" } | { kind: "tournament"; t: Tournament } | null {
  if (!slug) return null;
  if (slug === "copa-do-mundo") return { kind: "worldcup" };
  const t = TOURNAMENT_BY_SLUG[slug];
  return t ? { kind: "tournament", t } : null;
}
export function pathBreadcrumb(path: string, title: string): { label: string; href: string }[] {
  const segs = path.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  const items = [{ label: "Início", href: "/" }];
  segs.forEach((s, i) => {
    const href = `/${segs.slice(0, i + 1).join("/")}`;
    const label = i === segs.length - 1 ? title : s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    items.push({ label, href });
  });
  return items;
}
```

- [ ] **Step 4: Passar** → PASS.

- [ ] **Step 5: Generalizar artilharia em `src/lib/data/scorers.ts`**

Transformar o corpo de `getTopScorers()` em `export async function getScorersFor(t: Tournament): Promise<Scorer[]>` (mesma lógica: `getStandings(t.id, t.seasonId)` → top 10 times → `team/{id}/tournament/{t.id}/season/{t.seasonId}/best-players` com 300ms entre chamadas → ordena por gols → 15) e manter `export async function getTopScorers() { return getScorersFor(TOURNAMENTS.BRASILEIRAO_A); }`. Importar `type Tournament` de `@/lib/config` e `getStandings` de `./standings`.

- [ ] **Step 6: `standings-table-block.tsx`** (tabela completa, server)

```tsx
import Link from "next/link";
import { TeamLogo } from "@/components/ui/team-logo";
import type { StandingsGroup } from "@/types/standings";

export function StandingsTableBlock({ groups, title, href, rows = 20 }: { groups: StandingsGroup[]; title: string; href?: string; rows?: number }) {
  const list = groups[0]?.rows?.slice(0, rows) || [];
  return (
    <div className="rounded-lg border border-border-custom bg-card-bg">
      <h3 className="border-b border-border-custom px-4 py-3 text-sm font-bold text-text-primary">
        {href ? <Link href={href} className="hover:text-green">{title}</Link> : title}
      </h3>
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-text-muted">Classificação indisponível</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border-light text-text-muted">
              <th className="px-3 py-2 text-left font-semibold">Time</th>
              {["P","J","V","E","D","SG"].map((h) => <th key={h} className="w-8 px-1 py-2 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.teamId} className="border-b border-border-light last:border-0">
                  <td className="px-3 py-2"><span className="flex items-center gap-2"><span className="w-5 text-right font-bold text-text-muted">{r.pos}</span><TeamLogo src={`/api/team-img/${r.teamId}`} alt={r.team} size={20} /><span className="font-semibold text-text-primary">{r.team}</span></span></td>
                  <td className="px-1 py-2 text-center font-bold">{r.pts}</td>
                  <td className="px-1 py-2 text-center">{r.matches}</td>
                  <td className="px-1 py-2 text-center">{r.wins}</td>
                  <td className="px-1 py-2 text-center">{r.draws}</td>
                  <td className="px-1 py-2 text-center">{r.losses}</td>
                  <td className="px-1 py-2 text-center">{r.gd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```
(Conferir a assinatura de `TeamLogo` em `src/components/ui/team-logo.tsx` e ajustar props se diferir.)

- [ ] **Step 7: `data-blocks.tsx`** (server components async; cada um engole erro)

```tsx
import { getPayload } from "payload";
import config from "@payload-config";
import { getTeamPageDataFor, getTeamLastLineup } from "@/lib/data/team";
import { teamInfoFromDoc, type PayloadTeam } from "@/lib/data/payload-teams";
import { getStandings, getWorldCupStandings } from "@/lib/data/standings";
import { getScorersFor, getWorldCupScorers } from "@/lib/data/scorers";
import { getArticles } from "@/lib/data/articles";
import { getMatchDetail, type MatchDetail } from "@/lib/data/match-detail";
import { getStoredFootballAgenda } from "@/lib/data/agenda";
import { TeamBlock } from "./team-blocks";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { StandingsTableBlock } from "./standings-table-block";
import { FeedItem } from "@/components/news/news-feed";
import { FeaturedCard } from "@/components/home/news-section";
import { LiveMatch } from "@/components/world-cup/live-match";
import { TodayGamesBlock } from "./agenda-blocks";
import { widgetToBlockType, resolveTournament } from "@/lib/cms-render";
import { tournamentLabel } from "@/cms/blocks/summary";

/* eslint-disable @typescript-eslint/no-explicit-any */
const card = "rounded-lg border border-border-custom bg-card-bg";

async function resolveTeam(team: any): Promise<PayloadTeam | null> {
  if (team && typeof team === "object" && team.sofascoreId) return team as PayloadTeam;
  const id = typeof team === "number" ? team : Number(team?.id);
  if (!id) return null;
  try {
    const payload = await getPayload({ config });
    return (await payload.findByID({ collection: "teams", id, depth: 0 })) as unknown as PayloadTeam;
  } catch { return null; }
}

export async function TeamWidgetBlock({ block }: { block: any }) {
  const doc = await resolveTeam(block.team);
  const blockType = widgetToBlockType(block.widget);
  if (!doc || !blockType) return null;
  try {
    const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
    const lineup = block.widget === "lineup" ? await getTeamLastLineup(data.id, 3).catch(() => null) : null;
    return <TeamBlock block={{ blockType, title: block.title, limit: block.limit }} data={data} page="hub" lineup={lineup} />;
  } catch { return null; }
}

export async function StandingsBlock({ block }: { block: any }) {
  const r = resolveTournament(block.tournament);
  if (!r) return null;
  try {
    const groups = r.kind === "worldcup" ? await getWorldCupStandings() : (r.t.seasonId ? await getStandings(r.t.id, r.t.seasonId) : []);
    const title = block.title || `Classificação · ${tournamentLabel(block.tournament)}`;
    const href = r.kind === "worldcup" ? "/futebol/copa-do-mundo" : `/futebol/${r.t.slug}`;
    if (block.compact) return <StandingsWidget standings={groups} />;
    return <StandingsTableBlock groups={groups} title={title} href={href} rows={block.rows || 20} />;
  } catch { return null; }
}

export async function ScorersBlock({ block }: { block: any }) {
  const r = resolveTournament(block.tournament);
  if (!r) return null;
  try {
    const scorers = r.kind === "worldcup" ? await getWorldCupScorers() : await getScorersFor(r.t);
    return (
      <div className="space-y-2">
        {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
        <ScorersWidget scorers={scorers.slice(0, block.limit || 10)} />
      </div>
    );
  } catch { return null; }
}

export async function NewsFeedBlock({ block }: { block: any }) {
  let opts: { category?: string; tag?: string } = {};
  if (block.source === "category" && block.value) opts = { category: block.value };
  else if (block.source === "tag" && block.value) opts = { tag: block.value };
  else if (block.source === "team") { const t = await resolveTeam(block.team); if (!t) return null; opts = { tag: t.name }; }
  const limit = block.limit || 6;
  let articles: any[] = [];
  try { articles = (await getArticles({ ...opts, perPage: limit })).articles.slice(0, limit); } catch { return null; }
  if (!articles.length) return null;
  const header = (block.title || block.seeAllHref) && (
    <div className="mb-3 flex items-center justify-between">
      {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
      {block.seeAllHref && <a href={block.seeAllHref} className="text-sm font-semibold text-green hover:underline">Ver todas</a>}
    </div>
  );
  if (block.layout === "list") return <div className={`${card} p-5`}>{header}<div>{articles.map((a) => <FeedItem key={a.slug} article={a} />)}</div></div>;
  if (block.layout === "featured") {
    const [first, ...rest] = articles;
    return <div>{header}<div className="grid gap-3 lg:grid-cols-[2fr_1fr]"><FeaturedCard article={first} big /><div className="grid gap-3">{rest.slice(0, 2).map((a) => <FeaturedCard key={a.slug} article={a} />)}</div></div></div>;
  }
  return <div>{header}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{articles.map((a) => <FeaturedCard key={a.slug} article={a} />)}</div></div>;
}

export async function LiveMatchBlock({ block }: { block: any }) {
  const id = Number(block.matchId);
  if (!Number.isFinite(id) || id <= 0) return null;
  const detail = await getMatchDetail(id).catch(() => null);
  if (!detail) return null;
  return (
    <div className="space-y-2">
      {block.title && <h2 className="text-base font-bold text-text-primary">{block.title}</h2>}
      <LiveMatch matchId={id} initial={detail as MatchDetail} group={null} competition={block.competition || ""} />
    </div>
  );
}

export async function TodayGamesDataBlock({ block }: { block: any }) {
  const leagues = await getStoredFootballAgenda().catch(() => []);
  return <TodayGamesBlock block={block} leagues={leagues} />;
}
```
Exportar `FeaturedCard` em `news-section.tsx` (`export function FeaturedCard`) e `TodayGamesBlock` em `agenda-blocks.tsx` (`export function TodayGamesBlock`).

- [ ] **Step 8: `section-block.tsx`**

```tsx
import type { ReactNode } from "react";
/* eslint-disable @typescript-eslint/no-explicit-any */
const BG: Record<string, string> = { none: "", card: "rounded-lg border border-border-custom bg-card-bg p-6", green: "rounded-lg bg-green p-6 text-white [&_h2]:text-white", dark: "rounded-lg bg-[#111827] p-6 text-white [&_h2]:text-white" };
const WIDTH: Record<string, string> = { narrow: "mx-auto max-w-[720px]", wide: "mx-auto max-w-[1240px]", full: "w-full" };

// Seção em colunas. `renderBlocks` é injetado pelo PageBlock (evita import circular).
export function SectionBlock({ block, pageWidth, renderBlocks }: { block: any; pageWidth: string; renderBlocks: (blocks: any[]) => ReactNode }) {
  const cols: any[] = block.columns?.length ? block.columns : [{ span: "1", blocks: [] }];
  const spans = cols.map((c) => (c.span === "2" ? 2 : 1));
  const total = spans.reduce((a, b) => a + b, 0);
  const grid = cols.length === 1 ? "" : `grid gap-4 md:[grid-template-columns:${spans.map((s) => `${s}fr`).join("_")}]`;
  const inner = (
    <div className={BG[block.background || "none"]}>
      {block.title && <h2 className="mb-4 text-lg font-bold text-text-primary">{block.title}</h2>}
      <div className={grid}>
        {cols.map((c, i) => <div key={i} className="min-w-0 space-y-5">{renderBlocks(c.blocks || [])}</div>)}
      </div>
    </div>
  );
  // Página estreita: a seção obedece ao card. Página larga/cheia: a seção escolhe a largura.
  if (pageWidth === "narrow") return inner;
  if (block.width === "full" && pageWidth === "full") return <div className={`${BG[block.background || "none"] ? "" : ""} w-full px-4`}>{inner}</div>;
  return <div className={`${WIDTH[block.width || "wide"]} px-4`}>{inner}</div>;
}
```
(Nota: Tailwind v4 não gera classes arbitrárias dinâmicas como `[grid-template-columns:1fr_2fr]` se a string não existir estaticamente no fonte. Em vez disso, usar `style={{ gridTemplateColumns: spans.map(s => `${s}fr`).join(" ") }}` com a classe `grid gap-4` só em `md:` — implemente com `className="grid gap-4"` + `style` e um wrapper `md:` via CSS utilitário: `className="grid gap-4 max-md:!grid-cols-1"` e `style={{ gridTemplateColumns }}`.) Remover a variável `total` se não usada.

- [ ] **Step 9: `page-shell.tsx` + reescrever `PageBlock`/`PageBlocks` em `page-blocks.tsx`**

Em `page-blocks.tsx`:
- Tornar `PageBlock` **async** e receber `pageWidth` (default `"narrow"`): `export async function PageBlock({ block, pageWidth = "narrow" }: { block: any; pageWidth?: string })`.
- Casos novos: `case "section": return <SectionBlock block={block} pageWidth={pageWidth} renderBlocks={(bs) => bs.map((b, i) => <PageBlock key={i} block={b} pageWidth="narrow" />)} />;` `case "teamWidget": return <TeamWidgetBlock block={block} />;` `case "standings": return <StandingsBlock block={block} />;` `case "scorers": return <ScorersBlock block={block} />;` `case "newsFeed": return <NewsFeedBlock block={block} />;` `case "liveMatch": return <LiveMatchBlock block={block} />;` `case "todayGames": return <TodayGamesDataBlock block={block} />;`
- Os 13 casos atuais ficam **idênticos**.

`page-shell.tsx` substitui o `PageBlocks` atual (mover pra lá e reexportar de `page-blocks.tsx` pra não quebrar imports existentes: `sobre`, `contato`, `parceiros`, `politica-de-privacidade`, `termos-de-uso`, `paginas/[slug]`):
```tsx
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import type { PayloadPage } from "@/lib/data/payload-pages";
import { pathBreadcrumb } from "@/lib/cms-render";
import { PageBlock } from "./page-blocks";
import { PuckRender } from "@/cms/puck/render"; // Task 9; até lá, criar stub que retorna null

/* eslint-disable @typescript-eslint/no-explicit-any */
function Hero({ page }: { page: PayloadPage }) {
  const h = page.hero || {};
  if (!h.h1 && !h.subtitle) return null;
  if (h.style === "banner") {
    const img = h.image && typeof h.image === "object" ? h.image : null;
    return (
      <div className="relative mb-8 overflow-hidden rounded-lg bg-[#0B3D2E] text-white">
        {img?.url && <img src={img.url} alt={img.alt || ""} className="absolute inset-0 h-full w-full object-cover opacity-40" />}
        <div className="relative px-6 py-14 sm:px-10">
          {h.h1 && <h1 className="text-3xl font-bold sm:text-4xl">{h.h1}</h1>}
          {h.subtitle && <p className="mt-3 max-w-2xl text-base text-white/85">{h.subtitle}</p>}
        </div>
      </div>
    );
  }
  const align = h.style === "left" ? "text-left" : "text-center";
  return (
    <div className={`mb-8 ${align}`}>
      {h.h1 && <h1 className="text-2xl font-bold text-text-primary">{h.h1}</h1>}
      {h.subtitle && <p className="mt-2 text-sm text-text-muted">{h.subtitle}</p>}
    </div>
  );
}

export function PageBlocks({ page }: { page: PayloadPage }) {
  const width = page.layoutStyle?.width || "narrow";
  const crumbs = page.layoutStyle?.showBreadcrumb && page.path ? pathBreadcrumb(page.path, page.hero?.h1 || page.title || "") : null;
  const body = page.editor === "puck" && page.puckData?.content?.length
    ? <PuckRender data={page.puckData} />
    : (page.layout || []).map((block: any, i: number) => <PageBlock key={i} block={block} pageWidth={width} />);

  if (width === "narrow") {
    // IDÊNTICO ao HTML atual quando não há breadcrumb (default) — não mudar classes.
    return (
      <div className="mx-auto max-w-[720px] px-4 py-12">
        {crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}
        <Hero page={page} />
        <div className="space-y-5 rounded-lg border border-border-custom bg-card-bg p-8 leading-relaxed text-text-secondary">{body}</div>
      </div>
    );
  }
  if (width === "wide") {
    return (
      <div className="mx-auto max-w-[1240px] px-4 py-8">
        {crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}
        <Hero page={page} />
        <div className="space-y-6 text-text-secondary">{body}</div>
      </div>
    );
  }
  return (
    <div className="w-full py-8">
      <div className="mx-auto max-w-[1240px] px-4">{crumbs && <PageBreadcrumb className="mb-4" items={crumbs} />}<Hero page={page} /></div>
      <div className="space-y-6 text-text-secondary [&>*:not([data-full])]:mx-auto [&>*:not([data-full])]:max-w-[1240px] [&>*:not([data-full])]:px-4">{body}</div>
    </div>
  );
}
```
Criar stub `src/cms/puck/render.tsx` (`export function PuckRender(_: { data: any }) { return null; }`) até a Task 9.

- [ ] **Step 10: `agenda-blocks.tsx`** — manter `AgendaBlockRenderer` funcionando (ele já passa `leagues`); só exportar `TodayGamesBlock`. Conferir que `jogos-de-hoje/futebol` continua igual.

- [ ] **Step 11: Typecheck + testes + commit**

```bash
npm run typecheck && npm test
git add src/components src/lib/cms-render.ts src/lib/cms-render.test.ts src/lib/data/scorers.ts src/cms/puck
git commit -m "feat(cms): renderer único de blocos com Seção, widget de time, classificação, artilharia, feed e jogo ao vivo; shell de página com largura/hero/trilha

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Rotas — catch-all, fallthroughs, redirect, sitemap

**Files:**
- Create: `src/app/(site)/[...path]/page.tsx`, `src/components/payload/cms-page-route.tsx`
- Modify: `src/lib/data/payload-pages.ts`, `src/app/(site)/[categoria]/[slug]/page.tsx`, `src/app/(site)/futebol/[slug]/page.tsx`, `src/app/(site)/paginas/[slug]/page.tsx`, `src/app/sitemap.ts`

**Interfaces:**
- Produces: `getPayloadPageByPath(path, opts?: { draft?: boolean }): Promise<PayloadPage|null>`, `getPayloadPageById(id, draft)`, `getPayloadPagePaths(): Promise<string[]>` (publicadas com `path`), `cmsPageMetadata(path): Promise<Metadata>`, `CmsPage({ path })` (server component que faz `notFound()` se não existir).

- [ ] **Step 1: `payload-pages.ts`**

```ts
export const getPayloadPageByPath = cache(async (path: string, opts?: { draft?: boolean }): Promise<PayloadPage | null> => {
  if (!path || !path.startsWith("/")) return null;
  try {
    const payload = await getPayload({ config });
    const where: any = opts?.draft ? { path: { equals: path } } : { and: [{ path: { equals: path } }, { _status: { equals: "published" } }] };
    const res = await payload.find({ collection: "pages", where, limit: 1, depth: 2, draft: !!opts?.draft });
    return (res.docs[0] as PayloadPage) || null;
  } catch { return null; }
});

export const getPayloadPageById = cache(async (id: number | string, draft = false): Promise<PayloadPage | null> => {
  try {
    const payload = await getPayload({ config });
    return (await payload.findByID({ collection: "pages", id, depth: 2, draft })) as PayloadPage;
  } catch { return null; }
});

// Caminhos publicados com `path` (sitemap). Vazio em erro.
export const getPayloadPagePaths = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "pages", where: { and: [{ _status: { equals: "published" } }, { path: { exists: true } }] }, limit: 500, depth: 0, pagination: false });
    return res.docs.map((d: any) => d.path).filter((p: any) => typeof p === "string" && p.startsWith("/"));
  } catch { return []; }
});
```
`getPayloadPageSlugs` passa a excluir páginas com `path` (elas não vivem em `/paginas/`): adicionar `{ path: { exists: false } }` ao `where`.

- [ ] **Step 2: `cms-page-route.tsx`**

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayloadPageByPath } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function cmsPageMetadata(path: string): Promise<Metadata | null> {
  const page = await getPayloadPageByPath(path);
  if (!page) return null;
  const title = page.seo?.metaTitle || page.title;
  const description = page.seo?.metaDescription || page.hero?.subtitle || undefined;
  const img = page.hero?.image && typeof page.hero.image === "object" ? page.hero.image.url : undefined;
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { title: title || undefined, description, url: `${SITE}${path}`, type: "website", ...(img ? { images: [{ url: img.startsWith("http") ? img : `${SITE}${img}` }] } : {}) },
  };
}

// Renderiza a página do CMS daquele caminho ou dá 404 real (nunca vaza rascunho).
export async function CmsPage({ path }: { path: string }) {
  const page = await getPayloadPageByPath(path);
  if (!page) notFound();
  return <PageBlocks page={page} />;
}
```

- [ ] **Step 3: Catch-all `src/app/(site)/[...path]/page.tsx`**

```tsx
import type { Metadata } from "next";
import { CmsPage, cmsPageMetadata } from "@/components/payload/cms-page-route";

// Páginas do CMS em URL livre. Só chega aqui o que NENHUMA rota em código pegou
// (1 segmento ou 3+; 2 segmentos caem em /[categoria]/[slug], que faz fallthrough).
// ISR: blocos de dados ao vivo rodam aqui, então nunca force-dynamic.
export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { return []; }

export async function generateMetadata({ params }: { params: Promise<{ path: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  return (await cmsPageMetadata(`/${path.join("/")}`)) || {};
}
export default async function CmsCatchAll({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return <CmsPage path={`/${path.join("/")}`} />;
}
```

- [ ] **Step 4: Fallthrough em `[categoria]/[slug]/page.tsx`**

Em `generateMetadata`: quando `!article`, `return (await cmsPageMetadata(\`/${categoria}/${slug}\`)) || {};` (mantém `{}` quando a URL não é a canônica do artigo). No componente: substituir `if (!article) notFound();` por `if (!article) return <CmsPage path={\`/${categoria}/${slug}\`} />;`.

- [ ] **Step 5: Fallthrough em `futebol/[slug]/page.tsx`**

`generateMetadata`: `if (!t) return (await cmsPageMetadata(\`/futebol/${slug}\`)) || { title: "Campeonato não encontrado" };`. Componente: `if (!TOURNAMENT_BY_SLUG[slug]) return <CmsPage path={\`/futebol/${slug}\`} />;`. (O `layout.tsx` já devolve título "Campeonato"/canonical genérico; a metadata da page sobrescreve.)

- [ ] **Step 6: `/paginas/[slug]` redireciona quando a página tem `path`**

Depois de `const page = await getPayloadPage(slug); if (!page) notFound();` adicionar `if (page.path) permanentRedirect(page.path);` (também no `generateMetadata`).

- [ ] **Step 7: Sitemap**

Em `src/app/sitemap.ts`, junto da listagem de `/paginas/{slug}`, adicionar `const cmsPaths = await getPayloadPagePaths().catch(() => []);` e mapear `{ url: \`${BASE}${p}\`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 }`.

- [ ] **Step 8: Typecheck + commit**

```bash
npm run typecheck && npm test
git add "src/app/(site)/[...path]" src/components/payload/cms-page-route.tsx src/lib/data/payload-pages.ts "src/app/(site)/[categoria]" "src/app/(site)/futebol/[slug]/page.tsx" "src/app/(site)/paginas" src/app/sitemap.ts
git commit -m "feat(cms): páginas do CMS em URL livre (catch-all + fallthrough em notícias e campeonatos), redirect de /paginas e sitemap

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Preview ao vivo — listener, rotas de preview de página e time

**Files:**
- Create: `src/lib/cms-preview-auth.ts`, `src/components/payload/live-preview-listener.tsx`, `src/app/(site)/cms-preview/pagina/[id]/page.tsx`, `src/app/(site)/cms-preview/time/[slug]/[aba]/page.tsx`
- Modify: `src/app/(site)/cms-preview/[slug]/page.tsx`

**Interfaces:**
- Produces: `assertPreviewAccess(previewSecret?: string): Promise<boolean>`, `<LivePreviewListener/>`, `<PreviewBanner/>`.
- Consumes: `getPayloadPageById(id, true)`, `TeamCmsView`, `getTeam` (precisa de versão draft: adicionar `getTeamDraft(slug)` em `payload-teams.ts` = mesmo `find` com `draft: true` sem filtro de status).

- [ ] **Step 1: `cms-preview-auth.ts`** (extraído do preview de posts)

```ts
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";

// Acesso ao preview: secret (iframe do Live Preview) OU sessão do /cms (cookie payload-token).
export async function assertPreviewAccess(previewSecret?: string): Promise<boolean> {
  if (process.env.CRON_SECRET && previewSecret === process.env.CRON_SECRET) return true;
  try {
    const payload = await getPayload({ config });
    const { user } = await payload.auth({ headers: await headers() });
    return !!user;
  } catch { return false; }
}
```

- [ ] **Step 2: `live-preview-listener.tsx`**

```tsx
"use client";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";

// Dentro do iframe do Live Preview do /cms: ao salvar/autosalvar, refaz o render do servidor.
export function LivePreviewListener() {
  const router = useRouter();
  const serverURL = typeof window !== "undefined" ? window.location.origin : "";
  return <RefreshRouteOnSave refresh={() => router.refresh()} serverURL={serverURL} />;
}
export function PreviewBanner({ children }: { children?: React.ReactNode }) {
  return <div className="bg-green px-4 py-2 text-center text-sm font-semibold text-white">Pré-visualização do CMS · rascunho · esta página é privada e ainda NÃO está publicada{children}</div>;
}
```

- [ ] **Step 3: `/cms-preview/pagina/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { getPayloadPageById } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";
import { LivePreviewListener, PreviewBanner } from "@/components/payload/live-preview-listener";

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Preview" };

export default async function PreviewPagina({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ previewSecret?: string }> }) {
  const { id } = await params;
  const { previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  if (id === "novo") return <><PreviewBanner /><p className="mx-auto max-w-[720px] px-4 py-16 text-center text-text-muted">Salve a página uma vez (rascunho) pra ver o preview.</p></>;
  const page = await getPayloadPageById(id, true);
  if (!page) notFound();
  return (<><LivePreviewListener /><PreviewBanner /><PageBlocks page={page} /></>);
}
```

- [ ] **Step 4: `/cms-preview/time/[slug]/[aba]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { getTeamDraft } from "@/lib/data/payload-teams";
import { TeamCmsView } from "@/components/payload/team-cms-page";
import { LivePreviewListener, PreviewBanner } from "@/components/payload/live-preview-listener";
import type { TeamNarrativePage } from "@/lib/team-narrative";

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Preview" };
const ABA: Record<string, TeamNarrativePage> = { hub: "hub", "jogo-hoje": "jogoHoje", "onde-assistir": "ondeAssistir", escalacao: "escalacao", "proximos-jogos": "proximos", estatisticas: "estatisticas" };

export default async function PreviewTime({ params, searchParams }: { params: Promise<{ slug: string; aba: string }>; searchParams: Promise<{ previewSecret?: string }> }) {
  const { slug, aba } = await params;
  const { previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  const page = ABA[aba];
  if (!page) notFound();
  const doc = await getTeamDraft(slug);
  if (!doc) notFound();
  return (<><LivePreviewListener /><PreviewBanner /><TeamCmsView doc={doc} page={page} /></>);
}
```
`getTeamDraft` em `payload-teams.ts`: igual ao ramo `DRAFTS` de `getTeam` (`draft: true`, sem filtro `_status`), exportado, `cache()`.

- [ ] **Step 5: Posts** — em `cms-preview/[slug]/page.tsx` trocar a guarda inline por `assertPreviewAccess` e adicionar `<LivePreviewListener />` antes da faixa.

- [ ] **Step 6: Typecheck + commit**

```bash
npm run typecheck
git add src/lib/cms-preview-auth.ts src/components/payload/live-preview-listener.tsx "src/app/(site)/cms-preview" src/lib/data/payload-teams.ts
git commit -m "feat(cms): live preview que atualiza ao salvar (posts) + preview de páginas por id e de times por aba

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Painel de modelos (aplicar / salvar / exportar / importar JSON) + CSS do admin

**Files:**
- Create: `src/cms/lib/layout-io.ts`, `src/cms/lib/layout-io.test.ts`
- Modify: `src/cms/components/template-tools.tsx` (substituir o stub), `src/app/(payload)/custom.scss`

**Interfaces:**
- Produces: `parseLayoutImport(raw: string, knownSlugs: readonly string[]): { ok: true; data: { layout: any[]; hero?: any; layoutStyle?: any } } | { ok: false; error: string }`, `stripIds(x)`.

- [ ] **Step 1: Teste**

`src/cms/lib/layout-io.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseLayoutImport, stripIds } from "./layout-io.ts";
const SLUGS = ["heading", "richText", "section"];

test("aceita objeto com layout e remove ids", () => {
  const r = parseLayoutImport(JSON.stringify({ layout: [{ id: "abc", blockType: "heading", text: "Oi" }], hero: { h1: "Título" } }), SLUGS);
  assert.ok(r.ok);
  if (r.ok) { assert.deepEqual(r.data.layout, [{ blockType: "heading", text: "Oi" }]); assert.equal(r.data.hero.h1, "Título"); }
});
test("aceita array puro como layout", () => {
  const r = parseLayoutImport("[{\"blockType\":\"richText\"}]", SLUGS);
  assert.ok(r.ok && r.data.layout.length === 1);
});
test("recusa JSON inválido, sem layout, blockType desconhecido", () => {
  assert.match((parseLayoutImport("{", SLUGS) as any).error, /JSON inválido/);
  assert.match((parseLayoutImport("{\"hero\":{}}", SLUGS) as any).error, /layout/);
  assert.match((parseLayoutImport("[{\"blockType\":\"xpto\"}]", SLUGS) as any).error, /xpto/);
  assert.match((parseLayoutImport("[{\"text\":\"sem tipo\"}]", SLUGS) as any).error, /blockType/);
});
test("stripIds remove id aninhado (seções)", () => {
  assert.deepEqual(stripIds({ id: 1, columns: [{ id: 2, blocks: [{ id: 3, blockType: "heading" }] }] }), { columns: [{ blocks: [{ blockType: "heading" }] }] });
});
```

- [ ] **Step 2: Falhar** → `node --test --experimental-strip-types src/cms/lib/layout-io.test.ts`.

- [ ] **Step 3: `layout-io.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
export function stripIds(x: any): any {
  if (Array.isArray(x)) return x.map(stripIds);
  if (x && typeof x === "object") {
    const out: any = {};
    for (const [k, v] of Object.entries(x)) if (k !== "id") out[k] = stripIds(v);
    return out;
  }
  return x;
}
export function parseLayoutImport(raw: string, knownSlugs: readonly string[]): { ok: true; data: { layout: any[]; hero?: any; layoutStyle?: any } } | { ok: false; error: string } {
  let parsed: any;
  try { parsed = JSON.parse(raw); } catch { return { ok: false, error: "JSON inválido. Cole exatamente o que foi exportado/gerado." }; }
  const layout = Array.isArray(parsed) ? parsed : parsed?.layout;
  if (!Array.isArray(layout)) return { ok: false, error: "Não encontrei a lista 'layout' de blocos." };
  for (const [i, b] of layout.entries()) {
    if (!b || typeof b !== "object" || typeof b.blockType !== "string") return { ok: false, error: `Bloco ${i + 1} sem 'blockType'.` };
    if (!knownSlugs.includes(b.blockType)) return { ok: false, error: `Bloco ${i + 1}: tipo "${b.blockType}" não existe neste site.` };
  }
  const data: any = { layout: stripIds(layout) };
  if (!Array.isArray(parsed)) { if (parsed.hero) data.hero = stripIds(parsed.hero); if (parsed.layoutStyle) data.layoutStyle = stripIds(parsed.layoutStyle); }
  return { ok: true, data };
}
```

- [ ] **Step 4: Passar** → PASS.

- [ ] **Step 5: `TemplateTools` (client)**

`src/cms/components/template-tools.tsx`:
```tsx
"use client";
import React, { useEffect, useState } from "react";
import { useDocumentInfo, useModal, Modal, Button } from "@payloadcms/ui";
import { parseLayoutImport } from "@/cms/lib/layout-io";
import { PAGE_BLOCK_SLUGS } from "@/cms/blocks";

/* eslint-disable @typescript-eslint/no-explicit-any */
const API = "/cms-api";
async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, { credentials: "include", headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

export function TemplateTools() {
  const { id } = useDocumentInfo();
  const { openModal, closeModal } = useModal();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sel, setSel] = useState("");
  const [json, setJson] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { api("/pageTemplates?limit=100&depth=0&sort=title").then((r) => setTemplates(r.docs || [])).catch(() => {}); }, []);

  const patch = async (data: any) => { await api(`/pages/${id}?draft=true`, { method: "PATCH", body: JSON.stringify(data) }); window.location.reload(); };
  const current = async () => api(`/pages/${id}?draft=true&depth=0`);

  const applyTemplate = async () => {
    const t = templates.find((x) => String(x.id) === sel); if (!t) return;
    setBusy(true);
    try { await patch({ layout: (t.layout || []).map(({ id: _i, ...b }: any) => b), hero: t.hero, layoutStyle: t.layoutStyle }); }
    catch (e: any) { setMsg(`Erro ao aplicar: ${e.message}`); setBusy(false); }
  };
  const saveAsTemplate = async () => {
    const title = window.prompt("Nome do modelo:"); if (!title) return;
    setBusy(true);
    try { const doc = await current(); await api("/pageTemplates", { method: "POST", body: JSON.stringify({ title, hero: doc.hero, layoutStyle: doc.layoutStyle, layout: (doc.layout || []).map(({ id: _i, ...b }: any) => b) }) }); setMsg(`Modelo "${title}" salvo.`); }
    catch (e: any) { setMsg(`Erro ao salvar: ${e.message}`); } finally { setBusy(false); }
  };
  const exportJson = async () => {
    try { const doc = await current(); const out = JSON.stringify({ hero: doc.hero, layoutStyle: doc.layoutStyle, layout: doc.layout }, null, 2); setJson(out); await navigator.clipboard?.writeText(out); setMsg("Layout copiado pro clipboard (e mostrado abaixo)."); }
    catch (e: any) { setMsg(`Erro ao exportar: ${e.message}`); }
  };
  const importJson = async () => {
    const r = parseLayoutImport(json, PAGE_BLOCK_SLUGS);
    if (!r.ok) { setMsg(r.error); return; }
    setBusy(true);
    try { await patch(r.data); } catch (e: any) { setMsg(`Erro ao importar: ${e.message}`); setBusy(false); }
  };

  if (!id) return <div className="pdb-tools"><p className="pdb-tools__hint">Salve a página (rascunho) pra liberar modelos, importar e exportar.</p></div>;
  const confirm = (slug: string, text: string, onYes: () => void) => (
    <Modal slug={slug} className="pdb-confirm">
      <div className="pdb-confirm__box"><p>{text}</p><div className="pdb-confirm__actions"><Button buttonStyle="secondary" onClick={() => closeModal(slug)}>Cancelar</Button><Button onClick={() => { closeModal(slug); onYes(); }}>Confirmar</Button></div></div>
    </Modal>
  );
  return (
    <div className="pdb-tools">
      <h4>Modelos e layout</h4>
      <label>Começar de um modelo
        <select value={sel} onChange={(e) => setSel(e.target.value)}><option value="">— escolher —</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select>
      </label>
      <Button size="small" disabled={!sel || busy} onClick={() => openModal("pdb-apply")}>Aplicar modelo</Button>
      <Button size="small" buttonStyle="secondary" disabled={busy} onClick={saveAsTemplate}>Salvar como modelo</Button>
      <Button size="small" buttonStyle="secondary" onClick={exportJson}>Exportar layout (JSON)</Button>
      <textarea value={json} onChange={(e) => setJson(e.target.value)} rows={6} placeholder="Cole aqui um layout em JSON (gerado pela IA ou exportado de outra página)" />
      <Button size="small" buttonStyle="secondary" disabled={!json.trim() || busy} onClick={() => openModal("pdb-import")}>Importar layout (JSON)</Button>
      {msg && <p className="pdb-tools__msg">{msg}</p>}
      {confirm("pdb-apply", "Aplicar o modelo substitui TODOS os blocos desta página (fica como rascunho). Continuar?", applyTemplate)}
      {confirm("pdb-import", "Importar substitui TODOS os blocos desta página (fica como rascunho). Continuar?", importJson)}
    </div>
  );
}
```
(Confirmar que `Modal`, `useModal`, `Button` são exportados por `@payloadcms/ui` — `grep -n "export { Modal\|useModal\|export { Button" node_modules/@payloadcms/ui/dist/exports/client/index.d.ts`. Se `Modal` não estiver, usar `ConfirmationModal` ou um `<dialog>` nativo; nunca `window.confirm`. `window.prompt` pro nome do modelo é aceitável — é input, não dialog bloqueante de confirmação crítica; se preferir, trocar por `<input>` inline.)

- [ ] **Step 6: `custom.scss`**

```scss
/* Papo de Bola — ajustes do admin do Payload (/cms). Só CSS. */
:root { --pdb-green: #00965E; }
.btn--style-primary { --theme-elevation-800: var(--pdb-green); }
.pdb-block-label { display: inline-flex; gap: .5rem; align-items: baseline; font-size: 14px; }
.pdb-block-label__summary { color: var(--theme-elevation-500); font-weight: 400; }
/* galeria de blocos: cards maiores e título legível */
.blocks-drawer__block { min-width: 200px; }
.blocks-drawer__block img { aspect-ratio: 3 / 2; object-fit: cover; border-radius: 6px; }
.blocks-drawer__block-name, .thumbnail-card__label { font-size: 14px; font-weight: 600; }
.pdb-tools { display: grid; gap: .5rem; padding: .75rem; border: 1px solid var(--theme-elevation-150); border-radius: 6px; }
.pdb-tools h4 { margin: 0 0 .25rem; font-size: 14px; }
.pdb-tools label { display: grid; gap: .25rem; font-size: 13px; }
.pdb-tools select, .pdb-tools textarea { width: 100%; font: inherit; font-size: 13px; padding: .4rem; border: 1px solid var(--theme-elevation-200); border-radius: 4px; background: var(--theme-input-bg); color: inherit; }
.pdb-tools__hint, .pdb-tools__msg { font-size: 13px; color: var(--theme-elevation-600); margin: 0; }
.pdb-confirm__box { background: var(--theme-elevation-0); padding: 1.5rem; border-radius: 8px; max-width: 420px; margin: 20vh auto; }
.pdb-confirm__actions { display: flex; gap: .5rem; justify-content: flex-end; margin-top: 1rem; }
.pdb-preview-link { font-size: 13px; margin: 0 0 .5rem; } .pdb-preview-link a { color: var(--pdb-green); font-weight: 600; }
```
(Os nomes `.blocks-drawer__block*`/`.thumbnail-card__label` devem ser conferidos no DOM real do drawer durante a Task 11; ajustar seletores se necessário.)

- [ ] **Step 7: importMap, typecheck, testes, commit**

```bash
node scripts/gen-importmap.mjs && npm run typecheck && npm test
git add src/cms "src/app/(payload)/custom.scss" "src/app/(payload)/cms/importMap.js" package.json
git commit -m "feat(cms): painel de modelos (aplicar/salvar/exportar/importar JSON) e CSS do admin

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Piloto Puck — aba "Construtor (beta)"

**Files:**
- Create: `src/cms/puck/fields.ts`, `src/cms/puck/config.editor.tsx`, `src/cms/puck/config.server.tsx`, `src/cms/puck/to-block.ts`, `src/cms/puck/to-block.test.ts`, `src/cms/puck/editor.tsx`
- Modify: `src/cms/puck/render.tsx` (stub → real), `src/cms/components/puck-view.tsx` (stub → real)

**Interfaces:**
- Produces: `puckPropsToBlock(type, props): any | null` (puro), `PuckRender({ data })` (server), `PuckView(props: DocumentViewServerProps)` (server) → `PuckEditor({ id })` (client).
- Componentes Puck (chaves): `Heading{text,level}`, `Text{text}`, `Image{url,caption}`, `Button{label,url,style}`, `Columns{col1,col2,col3?: slot; count}`, `Section{title,background,content: slot}`, `TeamWidget{team: external {id,name}, widget, title, limit}`, `Standings{tournament,title,rows,compact}`, `Scorers{tournament,title,limit}`, `NewsFeed{source,value,limit,layout,title}`, `LiveMatch{matchId,competition,title}`, `TodayGames{league,title}`.

- [ ] **Step 1: Teste da conversão**

`src/cms/puck/to-block.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { puckPropsToBlock } from "./to-block.ts";

test("Heading/Text/Button viram blocos da biblioteca", () => {
  assert.deepEqual(puckPropsToBlock("Heading", { text: "Oi", level: "h3" }), { blockType: "heading", text: "Oi", level: "h3" });
  assert.deepEqual(puckPropsToBlock("Button", { label: "Ver", url: "/x", style: "outline" }), { blockType: "button", label: "Ver", url: "/x", style: "outline" });
  assert.equal(puckPropsToBlock("Text", { text: "a\nb" })?.blockType, "richText");
});
test("Text vira Lexical com um parágrafo por linha", () => {
  const b = puckPropsToBlock("Text", { text: "a\nb" });
  assert.equal(b.content.root.children.length, 2);
  assert.equal(b.content.root.children[1].children[0].text, "b");
});
test("TeamWidget usa o id do time escolhido", () => {
  assert.deepEqual(puckPropsToBlock("TeamWidget", { team: { id: 7, name: "Cruzeiro" }, widget: "news", limit: 4 }), { blockType: "teamWidget", team: 7, widget: "news", title: undefined, limit: 4 });
  assert.equal(puckPropsToBlock("TeamWidget", { widget: "news" }), null);
});
test("desconhecido é null", () => { assert.equal(puckPropsToBlock("Nope", {}), null); });
```

- [ ] **Step 2: Falhar** → `node --test --experimental-strip-types src/cms/puck/to-block.test.ts`. (Adicionar `src/cms/puck/*.test.ts` ao script `test`.)

- [ ] **Step 3: `to-block.ts`**

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
function lexicalParagraphs(text: string) {
  const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim().length);
  return { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr",
    children: lines.map((l) => ({ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, textStyle: "",
      children: [{ type: "text", text: l, format: 0, detail: 0, mode: "normal", style: "", version: 1 }] })) } };
}
export function puckPropsToBlock(type: string, p: any): any | null {
  const d = p || {};
  switch (type) {
    case "Heading": return { blockType: "heading", text: d.text || "", level: d.level === "h3" ? "h3" : "h2" };
    case "Text": return { blockType: "richText", content: lexicalParagraphs(d.text) };
    case "Button": return { blockType: "button", label: d.label || "", url: d.url || "#", style: d.style === "outline" ? "outline" : "primary" };
    case "Image": return d.url ? { blockType: "image", image: { url: d.url, alt: d.caption || "" }, caption: d.caption, align: "center" } : null;
    case "TeamWidget": { const id = Number(d.team?.id ?? d.team); return id ? { blockType: "teamWidget", team: id, widget: d.widget || "upcoming", title: d.title, limit: d.limit } : null; }
    case "Standings": return { blockType: "standings", tournament: d.tournament || "brasileirao-serie-a", title: d.title, rows: d.rows, compact: !!d.compact };
    case "Scorers": return { blockType: "scorers", tournament: d.tournament || "brasileirao-serie-a", title: d.title, limit: d.limit };
    case "NewsFeed": return { blockType: "newsFeed", source: d.source || "latest", value: d.value, team: d.team?.id, limit: d.limit, layout: d.layout || "grid", title: d.title };
    case "LiveMatch": return d.matchId ? { blockType: "liveMatch", matchId: Number(d.matchId), competition: d.competition, title: d.title } : null;
    case "TodayGames": return { blockType: "todayGames", league: d.league || "all", title: d.title };
    default: return null;
  }
}
```

- [ ] **Step 4: Passar** → PASS.

- [ ] **Step 5: `fields.ts` (compartilhado, sem React)**

```ts
import type { Fields } from "@puckeditor/core";
import { tournamentOptions, WIDGET_OPTIONS } from "@/cms/blocks/options";
/* eslint-disable @typescript-eslint/no-explicit-any */
const title = { type: "text", label: "Título (opcional)" } as const;
const tournament = { type: "select", label: "Campeonato", options: tournamentOptions() } as const;
export const teamExternal = {
  type: "external", label: "Time", placeholder: "Escolher time",
  fetchList: async ({ query }: { query: string }) => {
    const qs = query ? `&where[name][like]=${encodeURIComponent(query)}` : "";
    const r = await fetch(`/cms-api/teams?limit=60&depth=0&sort=name${qs}`, { credentials: "include" }).then((x) => x.json());
    return (r.docs || []).map((d: any) => ({ id: d.id, name: d.name, slug: d.slug }));
  },
  getItemSummary: (item: any) => item?.name || "",
  showSearch: true,
} as const;
export const FIELDS: Record<string, Fields<any>> = {
  Heading: { text: { type: "text", label: "Texto" }, level: { type: "radio", label: "Nível", options: [{ label: "H2", value: "h2" }, { label: "H3", value: "h3" }] } },
  Text: { text: { type: "textarea", label: "Texto (uma linha = um parágrafo)" } },
  Image: { url: { type: "text", label: "URL da imagem (copie de Mídia)" }, caption: { type: "text", label: "Legenda" } },
  Button: { label: { type: "text", label: "Texto" }, url: { type: "text", label: "Link" }, style: { type: "radio", label: "Estilo", options: [{ label: "Verde", value: "primary" }, { label: "Contorno", value: "outline" }] } },
  Columns: { count: { type: "radio", label: "Colunas", options: [{ label: "2", value: 2 }, { label: "3", value: 3 }] }, col1: { type: "slot" }, col2: { type: "slot" }, col3: { type: "slot" } },
  Section: { title, background: { type: "select", label: "Fundo", options: [{ label: "Nenhum", value: "none" }, { label: "Card", value: "card" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }] }, content: { type: "slot" } },
  TeamWidget: { team: teamExternal as any, widget: { type: "select", label: "O que mostrar", options: WIDGET_OPTIONS }, title, limit: { type: "number", label: "Quantidade", min: 1, max: 30 } },
  Standings: { tournament, title, rows: { type: "number", label: "Linhas", min: 4, max: 30 }, compact: { type: "radio", label: "Compacta", options: [{ label: "Não", value: false }, { label: "Sim", value: true }] } },
  Scorers: { tournament, title, limit: { type: "number", label: "Quantidade", min: 1, max: 30 } },
  NewsFeed: { source: { type: "select", label: "Fonte", options: [{ label: "Últimas", value: "latest" }, { label: "Categoria", value: "category" }, { label: "Tag", value: "tag" }] }, value: { type: "text", label: "Categoria/tag" }, limit: { type: "number", label: "Quantidade", min: 1, max: 30 }, layout: { type: "select", label: "Formato", options: [{ label: "Grade", value: "grid" }, { label: "Lista", value: "list" }, { label: "Destaque", value: "featured" }] }, title },
  LiveMatch: { matchId: { type: "number", label: "ID do jogo (API)" }, competition: { type: "text", label: "Competição" }, title },
  TodayGames: { league: { type: "select", label: "Liga", options: [{ label: "Todas", value: "all" }, ...tournamentOptions()] }, title },
};
export const CATEGORIES = {
  texto: { title: "Texto e mídia", components: ["Heading", "Text", "Image", "Button"] },
  layout: { title: "Layout", components: ["Section", "Columns"] },
  dados: { title: "Dados ao vivo", components: ["TeamWidget", "Standings", "Scorers", "NewsFeed", "LiveMatch", "TodayGames"] },
};
```

- [ ] **Step 6: `config.editor.tsx` (client; placeholders)**

```tsx
"use client";
import type { Config } from "@puckeditor/core";
import { FIELDS, CATEGORIES } from "./fields";
import { blockSummary } from "@/cms/blocks/summary";
import { puckPropsToBlock } from "./to-block";
/* eslint-disable @typescript-eslint/no-explicit-any */
const box: React.CSSProperties = { border: "1px dashed #9CA3AF", borderRadius: 8, padding: 16, background: "#fff", color: "#374151", fontFamily: "Open Sans, Arial, sans-serif" };
const Placeholder = ({ type, props }: { type: string; props: any }) => {
  const b = puckPropsToBlock(type, props);
  return <div style={box}><strong style={{ display: "block", fontSize: 13, color: "#00965E" }}>{type} · dado ao vivo</strong><span style={{ fontSize: 14 }}>{b ? blockSummary(b.blockType, b) || "configure nos campos à direita" : "configure nos campos à direita"}</span></div>;
};
const data = (type: string) => ({ fields: FIELDS[type], render: (props: any) => <Placeholder type={type} props={props} /> });
export const editorConfig: Config = {
  categories: CATEGORIES as any,
  components: {
    Heading: { fields: FIELDS.Heading, defaultProps: { text: "Título", level: "h2" }, render: ({ text, level }: any) => level === "h3" ? <h3 style={{ fontFamily: "Open Sans, Arial", fontWeight: 700, fontSize: 18 }}>{text}</h3> : <h2 style={{ fontFamily: "Open Sans, Arial", fontWeight: 700, fontSize: 22 }}>{text}</h2> },
    Text: { fields: FIELDS.Text, defaultProps: { text: "Escreva aqui." }, render: ({ text }: any) => <div style={{ fontSize: 16, lineHeight: 1.6, fontFamily: "Open Sans, Arial" }}>{String(text || "").split(/\r?\n/).map((l: string, i: number) => <p key={i}>{l}</p>)}</div> },
    Image: { fields: FIELDS.Image, render: ({ url, caption }: any) => url ? <figure style={{ margin: 0 }}><img src={url} alt={caption || ""} style={{ maxWidth: "100%", borderRadius: 8 }} />{caption && <figcaption style={{ fontSize: 13, color: "#6B7280" }}>{caption}</figcaption>}</figure> : <div style={box}>Imagem: informe a URL</div> },
    Button: { fields: FIELDS.Button, defaultProps: { label: "Saiba mais", url: "/", style: "primary" }, render: ({ label, style }: any) => <span style={{ display: "inline-block", padding: "8px 16px", borderRadius: 8, fontWeight: 600, background: style === "outline" ? "#fff" : "#00965E", color: style === "outline" ? "#00965E" : "#fff", border: "1px solid #00965E" }}>{label}</span> },
    Columns: { fields: FIELDS.Columns, defaultProps: { count: 2, col1: [], col2: [], col3: [] }, render: ({ count, col1: C1, col2: C2, col3: C3 }: any) => <div style={{ display: "grid", gap: 16, gridTemplateColumns: `repeat(${count || 2}, 1fr)` }}><C1 /><C2 />{(count || 2) === 3 && <C3 />}</div> },
    Section: { fields: FIELDS.Section, defaultProps: { background: "none", content: [] }, render: ({ title, background, content: Content }: any) => <section style={{ padding: 16, borderRadius: 10, background: background === "green" ? "#00965E" : background === "dark" ? "#111827" : background === "card" ? "#fff" : "transparent", color: background === "green" || background === "dark" ? "#fff" : "inherit", border: background === "card" ? "1px solid #E5E7EB" : "none" }}>{title && <h2 style={{ fontFamily: "Open Sans, Arial", fontWeight: 700 }}>{title}</h2>}<Content /></section> },
    TeamWidget: data("TeamWidget"), Standings: data("Standings"), Scorers: data("Scorers"), NewsFeed: data("NewsFeed"), LiveMatch: data("LiveMatch"), TodayGames: data("TodayGames"),
  },
};
```

- [ ] **Step 7: `config.server.tsx` + `render.tsx`**

```tsx
// config.server.tsx — mesmo shape; render chama o renderer real do site.
import type { Config } from "@puckeditor/core";
import { FIELDS } from "./fields";
import { PageBlock } from "@/components/payload/page-blocks";
import { puckPropsToBlock } from "./to-block";
/* eslint-disable @typescript-eslint/no-explicit-any */
const viaBlock = (type: string) => ({ fields: FIELDS[type], render: (props: any) => { const b = puckPropsToBlock(type, props); return b ? <PageBlock block={b} pageWidth="wide" /> : null; } });
const BG: Record<string, string> = { none: "", card: "rounded-lg border border-border-custom bg-card-bg p-6", green: "rounded-lg bg-green p-6 text-white [&_h2]:text-white", dark: "rounded-lg bg-[#111827] p-6 text-white [&_h2]:text-white" };
export const serverConfig: Config = {
  components: {
    Heading: viaBlock("Heading"), Text: viaBlock("Text"), Image: viaBlock("Image"), Button: viaBlock("Button"),
    TeamWidget: viaBlock("TeamWidget"), Standings: viaBlock("Standings"), Scorers: viaBlock("Scorers"), NewsFeed: viaBlock("NewsFeed"), LiveMatch: viaBlock("LiveMatch"), TodayGames: viaBlock("TodayGames"),
    Columns: { fields: FIELDS.Columns, render: ({ count, col1: C1, col2: C2, col3: C3 }: any) => <div className={`grid gap-4 ${(count || 2) === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}><div className="min-w-0 space-y-5"><C1 /></div><div className="min-w-0 space-y-5"><C2 /></div>{(count || 2) === 3 && <div className="min-w-0 space-y-5"><C3 /></div>}</div> },
    Section: { fields: FIELDS.Section, render: ({ title, background, content: Content }: any) => <section className={BG[background || "none"]}>{title && <h2 className="mb-4 text-lg font-bold text-text-primary">{title}</h2>}<div className="space-y-5"><Content /></div></section> },
  },
};
```
```tsx
// render.tsx
import { Render } from "@puckeditor/core/rsc";
import { serverConfig } from "./config.server";
/* eslint-disable @typescript-eslint/no-explicit-any */
export function PuckRender({ data }: { data: any }) {
  if (!data?.content?.length) return null;
  return <Render config={serverConfig} data={data} />;
}
```

- [ ] **Step 8: `editor.tsx` (client) + `puck-view.tsx` (server)**

```tsx
// editor.tsx
"use client";
import React, { useEffect, useState } from "react";
import { Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { editorConfig } from "./config.editor";
/* eslint-disable @typescript-eslint/no-explicit-any */
const EMPTY: Data = { content: [], root: { props: {} }, zones: {} };
export function PuckEditor({ id }: { id?: number | string }) {
  const [data, setData] = useState<Data | null>(null);
  const [status, setStatus] = useState("");
  useEffect(() => {
    if (!id) return;
    fetch(`/cms-api/pages/${id}?draft=true&depth=0`, { credentials: "include" }).then((r) => r.json()).then((d) => setData(d.puckData?.content ? d.puckData : EMPTY)).catch(() => setData(EMPTY));
  }, [id]);
  if (!id) return <div style={{ padding: 32 }}><p>Salve a página (rascunho) na aba Editar antes de usar o Construtor.</p></div>;
  if (!data) return <div style={{ padding: 32 }}>Carregando…</div>;
  const save = async (d: Data, editor: "puck" | "blocks") => {
    setStatus("Salvando…");
    const r = await fetch(`/cms-api/pages/${id}?draft=true`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ puckData: d, editor }) });
    setStatus(r.ok ? `Rascunho salvo (${editor === "puck" ? "site usa o Construtor" : "site usa os Blocos"}). Publicar continua na aba Editar.` : `Erro ${r.status}`);
  };
  return (
    <div style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "8px 16px", fontSize: 13, display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #E5E7EB" }}>
        <strong>Construtor (beta)</strong><span>Arraste componentes pro canvas. "Salvar rascunho" grava e faz o site usar o Construtor nesta página.</span>
        <a href={`/cms-preview/pagina/${id}`} target="_blank" rel="noreferrer">Ver preview ↗</a>
        <span style={{ marginLeft: "auto", color: "#00965E" }}>{status}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Puck config={editorConfig} data={data} onPublish={(d) => save(d, "puck")} viewports={[{ width: 390, height: "auto", label: "Celular", icon: "Smartphone" }, { width: 768, height: "auto", label: "Tablet", icon: "Tablet" }, { width: 1440, height: "auto", label: "Desktop", icon: "Monitor" }]}
          overrides={{ headerActions: ({ children }) => <>{children}<button type="button" onClick={() => setData((cur) => { if (cur) save(cur, "blocks"); return cur; })} style={{ marginLeft: 8 }}>Voltar o site pros Blocos</button></> }} />
      </div>
    </div>
  );
}
```
(No Puck 0.23 o botão padrão do header chama `onPublish`; renomear o rótulo via `overrides.headerActions` se possível — o texto padrão "Publish" confunde; se não der pra renomear, esconder `children` e renderizar botão próprio "Salvar rascunho" que usa `usePuck`/`useGetPuck` pra pegar `appState.data` e chamar `save(data, "puck")`.)

```tsx
// puck-view.tsx (server)
import React from "react";
import type { DocumentViewServerProps } from "payload";
import { PuckEditor } from "@/cms/puck/editor";
export function PuckView(props: DocumentViewServerProps) {
  const id = (props as any)?.doc?.id as number | undefined;
  return <PuckEditor id={id} />;
}
```
Na collection (Task 3) a view já está registrada. Como a view custom **substitui** o conteúdo da área do documento, o Payload mantém o cabeçalho com as abas (Editar / Construtor / Versões / API).

- [ ] **Step 9: importMap, typecheck, testes, commit**

```bash
node scripts/gen-importmap.mjs && npm run typecheck && npm test
git add src/cms "src/app/(payload)/cms/importMap.js" package.json
git commit -m "feat(cms): aba Construtor (beta) com Puck — canvas drag & drop gravando em puckData, render no servidor via PageBlock

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Deploy no dev + verificação do build e do init

**Files:** nenhum no repo (operação)

- [ ] **Step 1: Snapshot do HTML atual (ANTES do deploy) pra diff**

```bash
mkdir -p "$SCRATCH/html-before"
for p in /sobre /paginas/apostas /futebol/times/cruzeiro /futebol/brasileirao-serie-a /jogos-de-hoje/futebol; do
  curl -s "https://development.papodebola.com.br$p" | sed -E 's#/_next/static/[^"]+##g' > "$SCRATCH/html-before/$(echo $p | tr '/' '_').html"; done
```
(`$SCRATCH` = pasta de scratchpad da sessão.)

- [ ] **Step 2: Push + rebuild do dev**

```bash
git pushdev
```
Acompanhar `tail -f /home/ivan/papodebola-next-dev/logs/rebuild_*.log` até "healthy". Religar o watcher: `sudo systemctl start papodebola-watch-dev`.

- [ ] **Step 3: Verificações**

```bash
ssh ... "docker logs papodebola-next-dev --since 10m 2>&1 | grep -ci payloadInitError; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/cms-api/pages?limit=1; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/cms-api/pageTemplates?limit=1; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3001/cms/collections/pages"
```
Expected: `0`, `200`, `401` (pageTemplates exige login), `200`/`302`.

- [ ] **Step 4: Diff do HTML (DEPOIS)**

Repetir o Step 1 em `html-after` e `diff` cada par. Esperado: **sem diferenças** fora de timestamps/dados ao vivo em `/sobre` e `/paginas/apostas` (shell idêntico). Se o diff mostrar classes do shell diferentes, corrigir `page-shell.tsx` antes de seguir.

- [ ] **Step 5: Rotas de controle respondem igual**

```bash
for p in / /sobre /paginas/apostas /noticias /futebol/times/cruzeiro /futebol/brasileirao-serie-a /jogos-de-hoje/futebol /nao-existe-xyz /futebol/nao-existe-xyz /volei/nao-existe-xyz; do printf "%s " "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://development.papodebola.com.br$p"; done
```
Expected: 200 nas existentes, **404** nas três `nao-existe`.

---

### Task 11: Validação no browser (agent-browser) + seed de modelos + limpeza

**Files:** scripts de uso único no scratchpad/servidor (não commitados)

- [ ] **Step 1: Usuário temporário + modelos via `payload run`**

Script `seed-builder.mjs` (scratchpad), rodado no container efêmero da imagem `pdb-migrate` (receita `criar_post_payload_run`: `docker create --name pdb-seed --network pdb-net -e DATABASE_URI -e PAYLOAD_SECRET -e PAYLOAD_CONFIG_PATH=src/payload.config.ts -v papodebola-next_pdb-data:/app/data pdb-migrate sleep infinity` → `docker cp src/. pdb-seed:/app/src/` → `type:module` → `docker cp seed-builder.mjs` → `docker exec pdb-seed npx payload run seed-builder.mjs` → `cat /app/out.txt`). Top-level await; log em `/app/out.txt`.

```js
import fs from "node:fs";
import { getPayload } from "payload";
import config from "@payload-config";
const log = (m) => fs.appendFileSync("/app/out.txt", m + "\n");
const payload = await getPayload({ config });
const email = "cms-teste@papodebola.com.br", password = "Teste-Builder-2026!";
const u = await payload.create({ collection: "users", data: { email, password } });
log(`user ${u.id}`);
const H = (text) => ({ blockType: "heading", text, level: "h2" });
const T = (text) => ({ blockType: "richText", content: { root: { type: "root", format: "", indent: 0, version: 1, direction: "ltr", children: [{ type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, textStyle: "", children: [{ type: "text", text, format: 0, detail: 0, mode: "normal", style: "", version: 1 }] }] } } });
const templates = [
  { title: "Hub de campeonato", description: "Tabela, artilharia, jogos de hoje e notícias de um campeonato.", hero: { h1: "Nome do campeonato", subtitle: "Tabela, jogos e notícias", style: "left" }, layoutStyle: { width: "wide", showBreadcrumb: true },
    layout: [ { blockType: "section", width: "wide", background: "none", columns: [ { span: "2", blocks: [ { blockType: "standings", tournament: "brasileirao-serie-a", rows: 20 } ] }, { span: "1", blocks: [ { blockType: "scorers", tournament: "brasileirao-serie-a", limit: 8 }, { blockType: "newsFeed", source: "category", value: "Brasileirão", limit: 5, layout: "list", title: "Últimas do campeonato" } ] } ] }, { blockType: "todayGames", league: "brasileirao-serie-a", title: "Jogos de hoje" }, T("Texto de contexto sobre o campeonato (edite).") ] },
  { title: "Página institucional", description: "Texto corrido em card estreito, com cards de informação.", hero: { h1: "Título da página", style: "centered" }, layoutStyle: { width: "narrow" },
    layout: [ T("Primeiro parágrafo (edite)."), H("Seção"), T("Mais texto."), { blockType: "infoCard", label: "Contato", value: "contato@papodebola.com.br", href: "mailto:contato@papodebola.com.br" } ] },
  { title: "Landing de esporte", description: "Banner, notícias em grade, cards de links e texto.", hero: { h1: "Nome do esporte", subtitle: "Notícias, jogos e tabelas", style: "banner" }, layoutStyle: { width: "wide", showBreadcrumb: true },
    layout: [ { blockType: "newsFeed", source: "latest", limit: 6, layout: "featured", title: "Últimas notícias" }, { blockType: "linkCards", title: "Principais competições", items: [ { label: "Brasileirão Série A", href: "/futebol/brasileirao-serie-a" }, { label: "Copa do Brasil", href: "/futebol/copa-do-brasil" }, { label: "Libertadores", href: "/futebol/libertadores" } ] }, T("Texto de apresentação (edite).") ] },
];
for (const t of templates) { const d = await payload.create({ collection: "pageTemplates", data: t }); log(`template ${d.id} ${t.title}`); }
```

- [ ] **Step 2: Login + navegação com agent-browser**

```bash
agent-browser open https://development.papodebola.com.br/cms/login
agent-browser snapshot -i          # achar os refs dos campos
agent-browser fill @<email> cms-teste@papodebola.com.br
agent-browser fill @<senha> 'Teste-Builder-2026!'
agent-browser click @<entrar>
agent-browser screenshot "$SCRATCH/01-dashboard.png"
```
Checar na captura: UI em **PT-BR** ("Coleções", "Criar novo"), grupos **Conteúdo / Futebol / Comercial / Sistema**.

- [ ] **Step 3: Criar página rascunho com blocos**

`/cms/collections/pages/create` → Nome "Teste Builder 2026", Caminho `/teste-builder-2026`, slug `teste-builder-2026` → "Salvar rascunho". Abrir "Adicionar bloco": captura do drawer (thumbnails + grupos). Adicionar `Seção` → coluna com `Classificação` (Brasileirão B) e `Widget de time` (Cruzeiro · Próximos jogos); adicionar `Feed de notícias` (Últimas, grade). Salvar rascunho. Verificar que os blocos colapsados mostram o **rótulo-resumo** (ex.: "Classificação de campeonato — Brasileirão Série B"). Capturas.

- [ ] **Step 4: Live Preview**

Clicar na aba "Live Preview": iframe mostra a página com a faixa de rascunho e os blocos renderizados com dados reais; trocar viewport Celular/Tablet/Desktop; editar o H1 e esperar o autosave (1,5s) → iframe atualiza. Captura. Testar também `/cms-preview/time/cruzeiro/hub` (logado) e um post em Live Preview (muda título → atualiza).

- [ ] **Step 5: Modelos**

Barra lateral → "Começar de um modelo" → "Hub de campeonato" → Aplicar → confirmar → página recarrega com o layout do modelo. "Exportar layout (JSON)" → textarea preenchida. Apagar um bloco, "Importar layout (JSON)" com o conteúdo exportado → confirmar → blocos voltam. Colar JSON inválido → mensagem em PT. "Salvar como modelo" → aparece em Modelos de página (apagar depois).

- [ ] **Step 6: Construtor (beta)**

Aba "Construtor (beta)": arrastar Heading + Standings + Columns(2) com Text e Scorers → salvar rascunho → `/cms-preview/pagina/<id>` renderiza via Puck (dados reais). Clicar "Voltar o site pros Blocos" → preview volta aos blocos. Capturas.

- [ ] **Step 7: Rotas públicas e segurança**

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://development.papodebola.com.br/teste-builder-2026      # 404 (rascunho não vaza)
curl -s -o /dev/null -w '%{http_code}\n' "https://development.papodebola.com.br/cms-preview/pagina/<id>"  # 404 sem secret/sessão
```
Tentar no CMS salvar `path=/futebol/times/cruzeiro` e `path=/noticias/x` → erro de validação em PT.

- [ ] **Step 8: Ajustes achados** — se os seletores do `custom.scss` não bateram com o DOM do drawer, ou o `useRowLabel` não trouxe dados (rótulo sem resumo), corrigir, `git pushdev`, revalidar. Commit `fix(cms): ...`.

- [ ] **Step 9: Limpeza (obrigatória)**

Pelo CMS (ou `payload run`): apagar a página "Teste Builder 2026" e o modelo criado no Step 5; apagar o usuário `cms-teste@…`; `docker rm -f pdb-seed`. Conferir `select count(*) from pages where slug='teste-builder-2026'` = 0 e `select email from users` sem o teste. Revalidar `/sitemap.xml` no dev.

---

### Task 12: Documentação, memória e grafo

**Files:**
- Create: `docs/knowledge/2026-09-30-cms-page-builder.md`
- Modify: `CLAUDE.md` (seção curta "CMS: criar páginas" apontando pro doc), memória do projeto (`cms_page_builder.md` + `MEMORY.md`)

- [ ] **Step 1: Doc de conhecimento** com: como criar uma página (passo a passo pra não-programador), lista dos blocos e campos, regra dos caminhos, como pedir pra IA um layout em JSON (formato = `{ hero, layoutStyle, layout: [...] }`, slugs da `PAGE_BLOCK_SLUGS`), modelos, Construtor (limitações: canvas em wireframe, publicar na aba Editar), preview por id/aba, gotchas (autosave exige DDL, importMap, `useRowLabel`, seletores do drawer), DDL aplicado (arquivo e backup), decisões (sem `blockReferences`, Puck isolado).
- [ ] **Step 2: Memória** (`~/.claude/projects/.../memory/cms_page_builder.md`, type project, com Why/How to apply) + linha no `MEMORY.md`; atualizar `cms_blocos_implementacao.md` (fases 4-6 concluídas).
- [ ] **Step 3: `/graphify --update`** e commit:

```bash
git add docs/knowledge/2026-09-30-cms-page-builder.md CLAUDE.md
git commit -m "docs(cms): page builder — como criar páginas pelo CMS, blocos, modelos, JSON pela IA, Construtor

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git pushdev
```

---

### Task 13: Promover pra produção e verificar

- [ ] **Step 1: Promote**

```bash
ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 "bash /home/ivan/promote.sh -y 2>&1 | tail -20"
```

- [ ] **Step 2: Verificar prod**

```bash
for p in / /sobre /paginas/apostas /futebol/times/cruzeiro /futebol/brasileirao-serie-a /noticias /jogos-de-hoje/futebol /nao-existe-xyz; do printf "%s " "$p"; curl -s -o /dev/null -w '%{http_code}\n' "https://www.papodebola.com.br$p"; done
ssh ... "docker logs papodebola-next --since 5m 2>&1 | grep -ci payloadInitError; curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3000/cms-api/pages?limit=1"
curl -s https://www.papodebola.com.br/sobre | grep -o '<title>[^<]*' ; curl -s https://www.papodebola.com.br/sitemap.xml | grep -c '<loc>'
```
Expected: 200 nas rotas, 404 em `nao-existe`, `0` init errors, `200` na API, título igual ao de antes.

- [ ] **Step 3: `/cms` em prod** abre em PT-BR com os grupos (login do Ivan — só abrir a lista, nada a criar).

- [ ] **Step 4: Relato final** pro Ivan: o que foi entregue, como usar (3 passos), o que é beta, e as sugestões de próximos passos (roles, dashboard, fidelidade do canvas, bloco de jogo por campeonato).

# Liga das Nações (UEFA Nations League) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seção completa da Liga das Nações 26/27 em `/futebol/futebol-internacional/liga-das-nacoes`. Inclui tabela dos 14 grupos (Ligas A–D), rodadas, jogos ao vivo e páginas de jogo em `/futebol/futebol-internacional/liga-das-nacoes/jogo/DD-MM-YYYY/{casa}-{fora}`. Também entra na agenda de jogos de hoje e na barra da home, com textos e SEO editáveis no /cms, um item de menu "Futebol internacional › Liga das Nações" e um post com os jogos de hoje.

**Architecture:** reaproveita o motor genérico de campeonatos (`TOURNAMENTS` → `getChampionshipData`, `ChampionshipClient`, página de jogo genérica com `LiveMatch`).
- **Caminho próprio:** o campeonato ganha um `basePath`. Um helper único, `champPath(slug)`, troca os ~10 lugares que hoje montam `/futebol/${slug}` na mão.
- **Rotas:** ficam em pastas estáticas aninhadas que delegam para os componentes genéricos. `/futebol/liga-das-nacoes/*` redireciona 308 pro caminho novo.
- **Nomes de seleção:** traduzidos com `translateCountry` (flag `nationalTeams`).
- **CMS:** os textos vêm de uma Página do CMS (`liga-das-nacoes`), no padrão da Copa Feminina.

**Tech Stack:** Next.js 16 App Router, Payload CMS 3 (Postgres), AllSportsApi (Sofascore), node:test.

**Spec:** pedido do Ivan (12/11/2026) neste chat. Referência visual: ge.globo.com/futebol/futebol-internacional/liga-das-nacoes/ (tabela + rodada).

## Global Constraints

- **API:** uniqueTournament **10783**, season **89945** ("UEFA Nations League 26/27"). 6 rodadas; `currentRound` = 5 em 12/11. Grupos chegam como `"UEFA Nations League 26/27, League A, Group 1"`.
- **URL do jogo:** `/futebol/futebol-internacional/liga-das-nacoes/jogo/{DD-MM-YYYY}/{casa}-{fora}`, com data em BRT e slug do par via `matchPairSlug` (mesmo padrão da Copa/Série B).
- **Só o dev consulta a API.** Nada de `force-dynamic` em página que bate na API; usar ISR (`revalidate = 30` no jogo) + polling do cliente.
- **Nomes de seleção em PT-BR** (Itália, França, Tchéquia, Espanha...). Seleção sem tradução cai no nome original.
- **Fora da enum do Payload:** o slug novo não pode entrar no select `tournament` do Payload, porque isso mudaria a enum do Postgres e exigiria DDL. `cmsSelectable: false`.
- **Rascunho primeiro:** posts são criados como rascunho; publicar só com ordem do Ivan.
- **Pasta nova em `src/app`** exige `npm run gen:paths`.
- **Fonte:** legibilidade de ~16 px; nada de `text-[10px]` em conteúdo novo.

## Review Focus

1. **Seleção fora das 48 da Copa** (Gales, Montenegro, Ilhas Faroé): o slug do par precisa ser IGUAL na tabela, na agenda e na barra; senão a página do jogo dá 404. → teste do `matchPairSlug` com nome em inglês vs traduzido.
2. **Nome do grupo:** "League A, Group 1" precisa virar "Liga A · Grupo 1"; hoje `cleanGroupName` mostraria só "Grupo 1", repetido 4×. → teste do `groupLabel`.
3. **URL antiga `/futebol/liga-das-nacoes/...`** (gerada antes do basePath ou digitada) → 308 pro caminho aninhado.
4. **Link de um jogo da Liga das Nações** em qualquer lugar (agenda, barra, sitemap, card da tabela) aponta pro caminho aninhado. → teste do `champPath`/`championshipMatchHref`.
5. **Payload sem a página `liga-das-nacoes`** (CMS fora ou rascunho): o hub ainda renderiza com título e intro padrão do código.

---

### Task 1: `champPath` + metadados do torneio

**Files:**
- Modify: `src/lib/config.ts` (interface `Tournament`, entrada `NATIONS_LEAGUE`, helper `champPath`)
- Modify: `src/cms/blocks/options.ts:7` (filtra `cmsSelectable === false`)
- Test: `src/lib/champ-path.test.ts`

**Interfaces:**
- Produces: `champPath(slug: string): string`, the base path with no trailing slash. `Tournament.basePath?`, `Tournament.nationalTeams?`, `Tournament.cmsSelectable?`. `TOURNAMENTS.NATIONS_LEAGUE` with slug `liga-das-nacoes`.

- [ ] Teste:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { champPath, TOURNAMENT_BY_SLUG } from "./config.ts";
test("champPath padrão", () => assert.equal(champPath("brasileirao-serie-b"), "/futebol/brasileirao-serie-b"));
test("champPath Liga das Nações", () => assert.equal(champPath("liga-das-nacoes"), "/futebol/futebol-internacional/liga-das-nacoes"));
test("Liga das Nações configurada", () => {
  const t = TOURNAMENT_BY_SLUG["liga-das-nacoes"];
  assert.equal(t.id, 10783); assert.equal(t.seasonId, 89945); assert.equal(t.nationalTeams, true);
});
```
- [ ] Rodar `node --test --experimental-strip-types src/lib/champ-path.test.ts` e confirmar que FALHA.
- [ ] Implementar:
```ts
export interface Tournament { id: number; name: string; seasonId: number | null; slug: string;
  basePath?: string; nationalTeams?: boolean; cmsSelectable?: boolean; }
// ...
  // Seleções (UEFA) — temporada 26/27: GET tournament/10783/seasons
  NATIONS_LEAGUE: { id: 10783, name: 'Liga das Nações', seasonId: 89945, slug: 'liga-das-nacoes',
    basePath: '/futebol/futebol-internacional/liga-das-nacoes', nationalTeams: true, cmsSelectable: false },
// ...
export function champPath(slug: string): string {
  return TOURNAMENT_BY_SLUG[slug]?.basePath || `/futebol/${slug}`;
}
```
  Em `options.ts`, trocar por `Object.values(TOURNAMENTS).filter((t) => t.cmsSelectable !== false)`.
- [ ] Rodar o teste e o `npm test` inteiro (o `options.test.ts` precisa continuar passando) e confirmar que PASSA.
- [ ] Commit `feat(liga-das-nacoes): torneio no config + champPath`.

### Task 2: links de campeonato usam `champPath`

**Files:**
- Modify:
  - `src/lib/data/match-detail.ts:472` (`championshipMatchHref`)
  - `src/lib/data/matches.ts:352` (`leagueMatchHref`)
  - `src/lib/data/agenda.ts:114,239`
  - `src/lib/data/cbf-calendar.ts:232`
  - `src/app/(site)/futebol/[slug]/championship-client.tsx:307` and the breadcrumb
  - `src/components/match/match-preview.tsx:78`
  - `src/app/(site)/futebol/page.tsx:31,100`
  - `src/app/sitemap.ts:80`
  - `src/app/llms.txt/route.ts:13`
  - the generic match page (canonical, url, breadcrumb)

**Interfaces:**
- Consumes: `champPath` (Task 1).
- Produces: `championshipMatchHref("liga-das-nacoes", …)` returns `/futebol/futebol-internacional/liga-das-nacoes/jogo/…`.

- [ ] Teste em `src/lib/champ-path.test.ts`. `match-detail` importa `fetch`/alias, então o teste cobre a montagem pura:
```ts
test("href do jogo usa basePath", () => {
  assert.equal(`${champPath("liga-das-nacoes")}/jogo/12-11-2026/italia-franca`,
    "/futebol/futebol-internacional/liga-das-nacoes/jogo/12-11-2026/italia-franca");
});
```
- [ ] Substituir cada `` `/futebol/${slug}` `` / `` `/futebol/${t.slug}` `` / `` `/futebol/${champSlug}` `` por `champPath(...)`. Conferir com `grep -rn '/futebol/\${' src` que só sobram rotas que não são de campeonato (artigo, copa).
- [ ] `npx tsc --noEmit` + `npm test`.
- [ ] Commit `refactor(campeonatos): links via champPath`.

### Task 3: nomes de seleção + rótulo de grupo

**Files:**
- Modify: `src/lib/i18n/countries.ts`, adding the missing countries:
  - Wales: "País de Gales"; Northern Ireland: "Irlanda do Norte"; Republic of Ireland / Ireland: "Irlanda"
  - Iceland: "Islândia"; Montenegro: "Montenegro"; Kazakhstan: "Cazaquistão"; Moldova: "Moldávia"
  - Faroe Islands: "Ilhas Faroé"; North Macedonia: "Macedônia do Norte"; Kosovo: "Kosovo"; Belarus: "Belarus"
  - Finland: "Finlândia"; Latvia: "Letônia"; Lithuania: "Lituânia"; Estonia: "Estônia"; Luxembourg: "Luxemburgo"
  - Andorra, Gibraltar, Liechtenstein, Malta and San Marino: "San Marino", with the same names
  - Azerbaijan: "Azerbaijão"; Armenia: "Armênia"; Georgia: "Geórgia"; Bulgaria: "Bulgária"; Romania: "Romênia"
  - Hungary: "Hungria"; Israel: "Israel"; Cyprus: "Chipre"; Albania: "Albânia"; Poland: "Polônia"
  - Sweden: "Suécia"; "Bosnia & Herzegovina": "Bósnia e Herzegovina"; Denmark: "Dinamarca"; Belgium: "Bélgica"
  - Only add the ones that are not already in the map.
- Modify: `src/lib/data/championship.ts` (`normalizeMatch` + standings translated when `nationalTeams`)
- Modify: `src/lib/data/matches.ts` (`normalizeEvent`: translate names when the league is `nationalTeams`)
- Create: `src/lib/group-label.ts` (pure function) + use it in `championship-client.tsx`
- Test: `src/lib/group-label.test.ts`

**Interfaces:**
- Produces: `groupLabel(name: string): string`. "…League A, Group 1" gives "Liga A · Grupo 1"; "…, Group A1" gives "Grupo A1"; with no "Group" it gives "".

- [ ] Teste:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupLabel } from "./group-label.ts";
test("liga + grupo", () => assert.equal(groupLabel("UEFA Nations League 26/27, League A, Group 1"), "Liga A · Grupo 1"));
test("só grupo", () => assert.equal(groupLabel("Brasileiro Serie D 2026, Group A1"), "Grupo A1"));
test("tabela única", () => assert.equal(groupLabel("Brasileirão Série A 2026"), ""));
```
- [ ] Rodar e confirmar que FALHA.
- [ ] Implementar:
```ts
export function groupLabel(name: string): string {
  const g = name.match(/Group\s+([A-Za-z]?\d+[A-Za-z]?)/i);
  if (!g) return "";
  const l = name.match(/League\s+([A-D])\b/i);
  return l ? `Liga ${l[1].toUpperCase()} · Grupo ${g[1].toUpperCase()}` : `Grupo ${g[1].toUpperCase()}`;
}
```
  No client, `cleanGroupName` vira `groupLabel`. Em `championship.ts`, um helper `tr(name)` (`t.nationalTeams ? translateCountry(name) : name`) aplicado em home/away do `normalizeMatch` e no `team` das linhas da classificação.
- [ ] Rodar os testes + `tsc` e confirmar que PASSA.
- [ ] Commit `feat(liga-das-nacoes): seleções em PT-BR e rótulo Liga/Grupo`.

### Task 4: rotas aninhadas (hub + jogo) + redirects + menu

**Files:**
- Modify: `src/app/(site)/futebol/[slug]/championship-client.tsx`. The default export accepts an optional `slug` prop (falls back to `useParams`), plus optional `intro?: React.ReactNode` / `title?: string` rendered under the H1.
- Create: `src/app/(site)/futebol/futebol-internacional/liga-das-nacoes/page.tsx`. Server page, `revalidate = 1800`:
  - `getPayloadPage("liga-das-nacoes")` supplies hero (H1/subtitle) and SEO; the code holds the defaults.
  - Renders `<ChampionshipClient slug="liga-das-nacoes" title intro />`, the CMS blocks (`PageBlock`) and the "Futebol Internacional" `NewsFeed`.
- Refactor: move the body and metadata of `src/app/(site)/futebol/[slug]/jogo/[data]/[match]/page.tsx` into `src/components/match/championship-match-page.tsx`:
  - `export async function championshipMatchMetadata(slug, data, match): Promise<Metadata>`
  - `export async function ChampionshipMatchPage({ slug, data, match })`
  - The generic route becomes a thin wrapper.
- Create: `src/app/(site)/futebol/futebol-internacional/liga-das-nacoes/jogo/[data]/[match]/page.tsx`. A thin wrapper with `slug = "liga-das-nacoes"`, `revalidate = 30`.
- Modify: `next.config.ts` redirects (308):
  - `/futebol/liga-das-nacoes` goes to `/futebol/futebol-internacional/liga-das-nacoes`.
  - `/futebol/liga-das-nacoes/:path*` goes to `/futebol/futebol-internacional/liga-das-nacoes/:path*`.
  - `/futebol/futebol-internacional` goes to `/noticias/futebol-internacional`.
- Modify: `src/lib/dedicated-pages.ts` (adds `liga-das-nacoes`).
- Modify: `src/components/layout/main-nav.tsx`, `side-panel.tsx`. New "Futebol internacional" group with the item "Liga das Nações".
- Run: `npm run gen:paths`.

- [ ] Implementar, rodar `npm run gen:paths`, `npx tsc --noEmit`, `npm test`.
- [ ] `npm run build` local (pega erro de rota/import client-server).
- [ ] Commit `feat(liga-das-nacoes): hub e página de jogo aninhados + menu`.

### Task 5: agenda, barra da home e sitemap

**Files:**
- Modify: `src/lib/data/agenda.ts` (`FOOTBALL_AGENDA_CHAMPS` + `EUROPE_AGENDA_CHAMPS` ganham `"liga-das-nacoes"`).
- Modify: `src/lib/data/matches.ts` (`FUTEBOL_TODAY_ORDER`: `10783` logo depois do 16; `CLEAN_MATCH_SLUG_LEAGUES` ganha 10783).
- Modify: `src/app/sitemap.ts` (`MATCH_CHAMPIONSHIPS` ganha `"liga-das-nacoes"`).
- Modify: the league name in the agenda uses `t.name` ("Liga das Nações") — already the case.

- [ ] Implementar + `tsc` + `npm test`.
- [ ] Commit `feat(liga-das-nacoes): agenda de hoje, barra da home e sitemap`.

### Task 6: deploy dev, CMS, validação, promote

- [ ] `git pushdev`; após o rebuild, revalidar `/`, `/jogos-de-hoje/futebol`, o hub e `POST /api/agenda/refresh`.
- [ ] Página no CMS (script `payload run` via `~/run-seed.sh`): `pages` com slug `liga-das-nacoes`, título, hero (H1 "Liga das Nações 2026/27", subtítulo), SEO (metaTitle/metaDescription) e um bloco de texto "Como funciona" (Ligas A–D, rebaixamento/acesso, Final Four). Publicada, porque o conteúdo é a seção que o Ivan pediu.
- [ ] Validar no dev:
  - O hub mostra 14 grupos com rótulo "Liga X · Grupo N" e nomes em PT.
  - A rodada 5 vem com os jogos de hoje.
  - `/jogo/12-11-2026/italia-franca` dá 200, com placar ao vivo.
  - `/futebol/liga-das-nacoes` dá 308.
  - A agenda lista os jogos.
  - O menu mostra o item.
- [ ] Promote com `nohup bash /home/ivan/promote.sh -y` (o Ivan pediu "faça"), revalidar em prod e checar as mesmas URLs.

### Task 7: post "Jogos de hoje da Liga das Nações" (rascunho)

- [ ] Script `scripts/create-post-jogos-hoje-liga-das-nacoes-12-11.mjs`, no padrão de `create-post-jogos-hoje-serie-b-12-11.mjs`:
  - Tabela de jogos (horário BRT, grupo, onde assistir quando houver).
  - Classificação dos grupos envolvidos; links pra página de cada jogo e pro hub.
  - FAQ.
  - Capa com crests na faixa de cima/meio (regra da área segura).
  - Foto real com crédito, só de fonte com licença de uso (Wikimedia Commons). Imagens da FIFA/UEFA têm direitos reservados, então só entram com crédito e se o Ivan aprovar.
- [ ] Criar como RASCUNHO, mostrar o preview (`/cms-preview`) e publicar só com o ok.

## Self-review

- **Cobertura:**
  - Menu: Task 4. Hub com tabela e rodada: Tasks 1, 3 e 4. Jogo ao vivo no formato pedido: Tasks 2 e 4.
  - Jogos de hoje e da semana: Task 5; a rodada no hub cobre a semana (rodadas 5 e 6, de 12 a 17/11).
  - CMS: Task 6. Post: Task 7.
- **Tipos:** `champPath(slug)` tem a mesma assinatura nas Tasks 1, 2 e 4. `groupLabel` está nas Tasks 3 e 4.

---

## PROGRESSO (atualizar a cada passo — retomar daqui se o PC reiniciar)

- 12/11 ~11h50 — Tasks 1, 2, 3 FEITAS no working tree (NÃO commitado ainda):
  - Em `config.ts`: `NATIONS_LEAGUE` + `champPath()`. `options.ts` filtra `cmsSelectable`. `group-label.ts` + `champ-path.test.ts` (npm test: 207 ok).
  - Links via `champPath` em: agenda, matches, match-detail, sitemap, llms, `futebol/page`, `match-preview`, championship-client.
  - `countries.ts` ganhou 28 seleções. championship.ts e matches.ts traduzem quando `nationalTeams`.
  - Agenda (`FOOTBALL_AGENDA_CHAMPS`/EUROPE), barra (`FUTEBOL_TODAY_ORDER` 10783 + `CLEAN_MATCH_SLUG_LEAGUES`) e sitemap (`MATCH_CHAMPIONSHIPS`) com liga-das-nacoes.
- Task 4 EM ANDAMENTO:
  - Feito:
    - A página de jogo genérica foi extraída para `src/components/match/championship-match-page.tsx`. A rota genérica virou um wrapper.
    - Criadas as rotas `futebol/futebol-internacional/liga-das-nacoes/page.tsx` (hub) e `.../jogo/[data]/[match]/page.tsx`.
    - O `ChampionshipClient` aceita as props `slug` e `header`.
  - Falta:
    - Redirects no `next.config` (`/futebol/liga-das-nacoes*` e `/futebol/futebol-internacional`).
    - `DEDICATED_PAGE_ROUTES`.
    - Menu (`main-nav` + `side-panel`).
    - Rodar `npm run gen:paths`, `tsc` e build. Depois commit, pushdev, página no CMS, validação e promote (Task 6). Post rascunho (Task 7).
- 12/11 ~12h05 — Task 4 e Task 5 CONCLUÍDAS; commit `bed2f87`; `git pushdev` disparado.
  - Página do CMS criada e PUBLICADA: id **30**, slug `liga-das-nacoes`, via `scripts/seed-pagina-liga-das-nacoes.mjs` + `bash ~/run-seed-cupons.sh`.
  - Próximo: validar no dev (hub, `/jogo/12-11-2026/turquia-belgica`, 308 de `/futebol/liga-das-nacoes`, agenda via `/api/agenda/refresh`), promote, Task 7 (post).
- 12/11 ~12h15 — dev validado (hub 200, 14 grupos em PT, jogos 200, 308 ok). Fix: slug na agenda saía em inglês (italy-franca) → selecaoSlugById traduz; commit seguinte + pushdev.
- 12/11 ~12h35 — POST 447 criado RASCUNHO (slug jogos-de-hoje-liga-das-nacoes-12-de-novembro, capa media 890, foto San Siro 891 CC BY-SA). Script scripts/create-post-jogos-hoje-liga-das-nacoes-12-11.mjs. Falta: validar fix 2ccf2fa no dev (agenda com italia-franca), PROMOTE, revalidar prod, Ivan aprovar post.
- 12/11 ~12h45 — dev validado após fix (agenda 8 jogos com slug PT, 8 páginas 200). PROMOTE disparado (nohup, log ~/promote-nl-20261112.log). Depois: revalidar prod (/ , hub, /jogos-de-hoje/futebol), checar no navegador.
- 12/11 ~13h10 — EM PROD (promote 65a9d17). Hub, jogos (200), 308, agenda (8 jogos) validados no navegador. Pendências: 'pelo/do Liga das Nações' (gênero no MatchPreview) e 'top 2 avançam' no cabeçalho da classificação; post 447 aguardando ok do Ivan; commitar scripts (seed-pagina + post).

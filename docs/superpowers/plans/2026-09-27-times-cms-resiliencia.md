# Times no CMS + resiliência sem API + páginas quebradas — Plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Os 57 times editáveis no /cms (SEO por aba, sem mudar o visual), toda página do site sobrevivendo à API fora do ar, e zero URL quebrada.

**Architecture:** (1) `fetchAllSports` grava o último dado bom de cada endpoint no volume e serve dele quando a API falha. (2) O corpo das 6 rotas de time vira componentes "clássicos" usados pelo config e pelo CMS; o CMS ganha SEO por aba, torneio Europa e bloco de texto automático; os 37 times do config são semeados como docs. (3) Correções pontuais de redirects e rotas do levantamento.

**Tech Stack:** Next.js 16 (App Router, ISR), TypeScript, Payload 3 (Postgres), Node 24 local (`node --test --experimental-strip-types` pros testes de funções puras), Docker no servidor.

**Spec:** `docs/superpowers/specs/2026-09-27-times-cms-resiliencia-design.md`

## Global Constraints

- Arquivos do repo são CRLF: edição por script precisa tolerar `\r\n`.
- Só o **dev** consulta a API de esportes; a prod usa o proxy do dev (`SPORTS_PROXY_URL`).
- Página que usa a API nunca `force-dynamic`: ISR + polling.
- Postgres é **compartilhado** dev/prod; schema só por DDL **aditivo** (receita `payload_migrations_recipe`), com backup antes. Nunca `payload migrate` direto.
- Validar init do Payload após deploy de schema: sem `payloadInitError` nos logs e `/cms-api/teams?limit=1` responde 200.
- 404 se testa em **build de produção**, não em `npm run dev`.
- Não usar `text-[10px]`/`text-[11px]` em conteúdo novo; não adicionar ícones novos.
- Scripts de uso único (seed, comparação, simulação) ficam no scratchpad/servidor e são **apagados** no fim; nada deles entra no repo.
- Commits terminam com `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
- Deploy: `git pushdev` (dev) → validar → `ssh ... "bash /home/ivan/promote.sh -y"` (prod).

## Review Focus

1. API responde **204** (sem conteúdo) → é sucesso com `null`; não pode acionar o fallback do disco (Task 1 testa `shouldFallback`).
2. Endpoint ao vivo (`revalidate < 60`) com a API fora → devolve `null`, nunca dado velho de "ao vivo" (Task 1 testa).
3. América-MG tem `seo` preenchido: depois da mudança ele vale só pro Hub; as 5 subpáginas usam o próprio grupo ou o padrão (Task 3 testa `teamSeo`).
4. Layout personalizado sem o bloco `teamAutoText` → texto automático aparece **uma** vez no fim; com o bloco → só no lugar do bloco (Task 4 testa `needsAutoTextAppend`).
5. Payload fora do ar → os 37 times renderizam pelo config (Task 7 verifica com o CMS inacessível no container de simulação).

---

### Task 1: Último dado bom da API salvo em disco

**Files:**
- Create: `src/lib/api/api-cache.ts`
- Create: `src/lib/api/api-cache.test.ts`
- Modify: `src/lib/api/allsports.ts` (função `fetchAllSports`, hoje nas linhas ~173-233)

**Interfaces:**
- Produces: `cacheKey(endpoint: string): string`, `shouldFallback(ok: boolean, revalidate: number): boolean`, `shouldWrite(key: string, now: number, sizeBytes: number): boolean`, `saveLastGood(endpoint: string, data: unknown): Promise<void>`, `readLastGood<T>(endpoint: string): Promise<T | null>`.

- [ ] **Step 1: Teste das funções puras**

`src/lib/api/api-cache.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { cacheKey, shouldFallback, shouldWrite, __resetWrites } from "./api-cache.ts";

test("cacheKey é estável e seguro pra nome de arquivo", () => {
  const a = cacheKey("team/1963/matches/next/0");
  assert.equal(a, cacheKey("team/1963/matches/next/0"));
  assert.match(a, /^[a-f0-9]{40}$/);
  assert.notEqual(a, cacheKey("team/1963/matches/previous/0"));
});

test("fallback só quando a API falhou e o endpoint não é ao vivo", () => {
  assert.equal(shouldFallback(true, 1800), false);  // sucesso (inclui 204 com null)
  assert.equal(shouldFallback(false, 1800), true);
  assert.equal(shouldFallback(false, 60), true);
  assert.equal(shouldFallback(false, 59), false);   // ao vivo: nunca dado velho
  assert.equal(shouldFallback(false, 10), false);
});

test("escrita limitada a 1 por endpoint a cada 10 min e até 5 MB", () => {
  __resetWrites();
  const t0 = 1_000_000;
  assert.equal(shouldWrite("k", t0, 100), true);
  assert.equal(shouldWrite("k", t0 + 60_000, 100), false);
  assert.equal(shouldWrite("k", t0 + 600_001, 100), true);
  assert.equal(shouldWrite("big", t0, 5 * 1024 * 1024 + 1), false);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `node --test --experimental-strip-types src/lib/api/api-cache.test.ts`
Expected: FAIL (módulo `./api-cache.ts` não existe).

- [ ] **Step 3: Implementar `src/lib/api/api-cache.ts`**

```ts
import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";

// Último dado BOM de cada endpoint da API de esportes, no volume compartilhado
// (data/api-cache). Se a API parar, fetchAllSports serve daqui: nenhuma página perde
// os dados que já mostrou. Endpoints ao vivo (revalidate < 60) ficam de fora: dado
// velho de "ao vivo" engana mais do que vazio (incidente de 16/07).
const DIR = join(process.cwd(), "data", "api-cache");
const MIN_WRITE_INTERVAL_MS = 10 * 60 * 1000;
const MAX_BYTES = 5 * 1024 * 1024;
const LIVE_TTL_LIMIT = 60;
const lastWrite = new Map<string, number>();

export function cacheKey(endpoint: string): string {
  return createHash("sha1").update(endpoint).digest("hex");
}

export function shouldFallback(ok: boolean, revalidate: number): boolean {
  return !ok && revalidate >= LIVE_TTL_LIMIT;
}

export function shouldWrite(key: string, now: number, sizeBytes: number): boolean {
  if (sizeBytes > MAX_BYTES) return false;
  const prev = lastWrite.get(key);
  if (prev != null && now - prev < MIN_WRITE_INTERVAL_MS) return false;
  lastWrite.set(key, now);
  return true;
}

export function __resetWrites(): void {
  lastWrite.clear();
}

export async function saveLastGood(endpoint: string, data: unknown): Promise<void> {
  try {
    const key = cacheKey(endpoint);
    const body = JSON.stringify({ endpoint, savedAt: new Date().toISOString(), data });
    if (!shouldWrite(key, Date.now(), Buffer.byteLength(body))) return;
    await mkdir(DIR, { recursive: true });
    const file = join(DIR, `${key}.json`);
    const tmp = `${file}.${process.pid}.tmp`;
    await writeFile(tmp, body);
    await rename(tmp, file);
  } catch {
    /* disco cheio/somente leitura: não derruba o render */
  }
}

export async function readLastGood<T>(endpoint: string): Promise<T | null> {
  try {
    const raw = await readFile(join(DIR, `${cacheKey(endpoint)}.json`), "utf-8");
    const parsed = JSON.parse(raw) as { endpoint: string; data: T };
    return parsed.endpoint === endpoint ? parsed.data : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `node --test --experimental-strip-types src/lib/api/api-cache.test.ts`
Expected: 3 testes PASS.

- [ ] **Step 5: Ligar no `fetchAllSports`**

Em `src/lib/api/allsports.ts`: renomear a `fetchAllSports` atual para `fetchAllSportsResult` com retorno `Promise<{ ok: boolean; data: T | null }>` (cada `return x` vira `return { ok: <sucesso?>, data: x }`: proxy ok → `{ok:true,data:result.data}`; build → `{ok:false,data:null}`; proxy com erro http → `{ok:false,data:null}`; direto → `{ ok: result.ok, data: result.data }`). Nova `fetchAllSports` pública (mesma assinatura de hoje):

```ts
import { readLastGood, saveLastGood, shouldFallback } from "./api-cache";

export async function fetchAllSports<T>(endpoint: string, revalidate: number = 1800): Promise<T | null> {
  const res = await fetchAllSportsResult<T>(endpoint, revalidate);
  if (res.ok) {
    if (res.data != null) void saveLastGood(endpoint, res.data);
    return res.data;
  }
  if (!shouldFallback(res.ok, revalidate)) return null;
  const stale = await readLastGood<T>(endpoint);
  if (stale != null) console.warn(`API_FALLBACK_DISK ${endpoint}`);
  return stale;
}
```

Import sem extensão `.ts` no código da app (o teste usa `.ts` por causa do strip-types; o Next resolve os dois).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit -p .`
Expected: sem erros. Se o `tsconfig` reclamar do import `./api-cache.ts` no arquivo de teste, adicionar `"allowImportingTsExtensions": true` NÃO — em vez disso excluir `**/*.test.ts` do `tsconfig.json` (`"exclude"`).

- [ ] **Step 7: Commit**

```bash
git add src/lib/api/api-cache.ts src/lib/api/api-cache.test.ts src/lib/api/allsports.ts tsconfig.json
git commit -m "feat(api): último dado bom de cada endpoint salvo no volume e servido quando a API falha"
```

---

### Task 2: Próximos jogos velhos somem quando a API está fora

**Files:**
- Create: `src/lib/team-match-filters.ts`
- Create: `src/lib/team-match-filters.test.ts`
- Modify: `src/lib/data/team.ts` (`getTeamPageDataFor`)

**Interfaces:**
- Produces: `dropStaleUpcoming<T extends { timestamp: number }>(list: T[], nowSec: number): T[]`

- [ ] **Step 1: Teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { dropStaleUpcoming } from "./team-match-filters.ts";

test("descarta jogo que começou há mais de 3h e mantém o resto", () => {
  const now = 1_800_000_000;
  const list = [
    { id: 1, timestamp: now - 4 * 3600 },
    { id: 2, timestamp: now - 2 * 3600 },
    { id: 3, timestamp: now + 3600 },
    { id: 4, timestamp: 0 },
  ];
  assert.deepEqual(dropStaleUpcoming(list, now).map((m) => m.id), [2, 3]);
});
```

- [ ] **Step 2: Rodar e ver falhar** — `node --test --experimental-strip-types src/lib/team-match-filters.test.ts` → FAIL.

- [ ] **Step 3: Implementar**

```ts
// Lista de "próximos jogos" vinda do último dado bom salvo em disco pode trazer jogos
// que já aconteceram (API fora por dias). Mantém só o que ainda não começou ou começou
// há até 3h (ainda pode estar rolando). timestamp 0 = inválido.
const GRACE_SECS = 3 * 3600;

export function dropStaleUpcoming<T extends { timestamp: number }>(list: T[], nowSec: number): T[] {
  return list.filter((m) => m.timestamp > 0 && m.timestamp >= nowSec - GRACE_SECS);
}
```

- [ ] **Step 4: Rodar e ver passar.**

- [ ] **Step 5: Usar em `getTeamPageDataFor`**

Em `src/lib/data/team.ts`, logo depois do `Promise.all`:
```ts
import { dropStaleUpcoming } from "@/lib/team-match-filters";
// ...
const upcoming = dropStaleUpcoming(nextEvents, Date.now() / 1000);
```
e trocar os usos de `nextEvents` por `upcoming` (no `todayMatch` e em `upcomingMatches: upcoming.slice(0, 10)`).

- [ ] **Step 6: `npx tsc --noEmit -p .` limpo. Commit** `fix(times): próximos jogos já passados não aparecem quando a API está fora`.

---

### Task 3: SEO por aba (`teamSeo`) e rotas usando o helper

**Files:**
- Create: `src/lib/team-seo.ts`, `src/lib/team-seo.test.ts`
- Modify: `src/lib/data/payload-teams.ts` (tipo `PayloadTeam`)
- Modify: as 6 rotas em `src/app/(site)/futebol/times/[slug]/` (só `generateMetadata`)

**Interfaces:**
- Produces: `type TeamPage = "hub" | "jogoHoje" | "ondeAssistir" | "escalacao" | "proximos" | "estatisticas"`; `TEAM_SEO_FIELD: Record<TeamPage, "seo" | "seoJogoHoje" | "seoOndeAssistir" | "seoEscalacao" | "seoProximos" | "seoEstatisticas">`; `defaultTeamSeo(page: TeamPage, name: string): { title: string; description: string }`; `teamSeo(doc: { seo?, seoJogoHoje?, ... } | null, page: TeamPage, name: string): { title: string; description: string }`; `TEAM_PAGE_PATH: Record<TeamPage, string>` (`""`, `/jogo-hoje`, `/onde-assistir`, `/escalacao`, `/proximos-jogos`, `/estatisticas`).

- [ ] **Step 1: Teste**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { teamSeo, defaultTeamSeo } from "./team-seo.ts";

test("padrão por aba igual ao que as rotas geram hoje", () => {
  assert.equal(defaultTeamSeo("hub", "Palmeiras").title, "Palmeiras - Notícias, Jogos e Classificação");
  assert.equal(defaultTeamSeo("ondeAssistir", "Palmeiras").title, "Onde Assistir Palmeiras Hoje - Transmissão Ao Vivo");
  assert.equal(defaultTeamSeo("estatisticas", "Palmeiras").title, "Estatísticas do Palmeiras 2026 - Números e Desempenho");
});

test("seo do Hub não vaza pras subpáginas", () => {
  const doc = { seo: { metaTitle: "Hub custom", metaDescription: "desc custom" } };
  assert.equal(teamSeo(doc, "hub", "América-MG").title, "Hub custom");
  assert.equal(teamSeo(doc, "escalacao", "América-MG").title, "Escalação do América-MG Hoje - Provável Escalação");
});

test("grupo da aba vence; campo vazio cai no padrão campo a campo", () => {
  const doc = { seoProximos: { metaTitle: "Agenda do Timão", metaDescription: "" } };
  const r = teamSeo(doc, "proximos", "Corinthians");
  assert.equal(r.title, "Agenda do Timão");
  assert.equal(r.description, defaultTeamSeo("proximos", "Corinthians").description);
  assert.deepEqual(teamSeo(null, "hub", "X"), defaultTeamSeo("hub", "X"));
});
```

- [ ] **Step 2: Rodar e ver falhar.**

- [ ] **Step 3: Implementar `src/lib/team-seo.ts`** (textos copiados das rotas atuais, sem mudar uma vírgula)

```ts
export type TeamPage = "hub" | "jogoHoje" | "ondeAssistir" | "escalacao" | "proximos" | "estatisticas";
type SeoGroup = { metaTitle?: string | null; metaDescription?: string | null };
type SeoField = "seo" | "seoJogoHoje" | "seoOndeAssistir" | "seoEscalacao" | "seoProximos" | "seoEstatisticas";
export type TeamSeoDoc = Partial<Record<SeoField, SeoGroup | null>>;

export const TEAM_SEO_FIELD: Record<TeamPage, SeoField> = {
  hub: "seo",
  jogoHoje: "seoJogoHoje",
  ondeAssistir: "seoOndeAssistir",
  escalacao: "seoEscalacao",
  proximos: "seoProximos",
  estatisticas: "seoEstatisticas",
};

export const TEAM_PAGE_PATH: Record<TeamPage, string> = {
  hub: "",
  jogoHoje: "/jogo-hoje",
  ondeAssistir: "/onde-assistir",
  escalacao: "/escalacao",
  proximos: "/proximos-jogos",
  estatisticas: "/estatisticas",
};

export function defaultTeamSeo(page: TeamPage, name: string): { title: string; description: string } {
  switch (page) {
    case "hub":
      return {
        title: `${name} - Notícias, Jogos e Classificação`,
        description: `Tudo sobre o ${name}: notícias, jogos de hoje, próximos jogos, escalação, estatísticas e onde assistir ao vivo.`,
      };
    case "jogoHoje":
      return {
        title: `Jogo do ${name} Hoje - Horário e Placar`,
        description: `Veja se o ${name} joga hoje, horário do jogo, placar ao vivo e detalhes da partida.`,
      };
    case "ondeAssistir":
      return {
        title: `Onde Assistir ${name} Hoje - Transmissão Ao Vivo`,
        description: `Saiba onde assistir ao jogo do ${name} hoje ao vivo. TV, streaming e opções de transmissão.`,
      };
    case "escalacao":
      return {
        title: `Escalação do ${name} Hoje - Provável Escalação`,
        description: `Provável escalação do ${name} para o próximo jogo, com base no time que começou a última partida, formação e destaques da temporada.`,
      };
    case "proximos":
      return {
        title: `Próximos Jogos do ${name} - Calendário 2026`,
        description: `Calendário completo dos próximos jogos do ${name} em 2026. Datas, horários, adversários e campeonatos.`,
      };
    case "estatisticas":
      return {
        title: `Estatísticas do ${name} 2026 - Números e Desempenho`,
        description: `Estatísticas do ${name} na temporada 2026: posição, aproveitamento, gols, artilheiros e sequência recente.`,
      };
  }
}

export function teamSeo(doc: TeamSeoDoc | null, page: TeamPage, name: string): { title: string; description: string } {
  const def = defaultTeamSeo(page, name);
  const g = doc?.[TEAM_SEO_FIELD[page]] || null;
  return {
    title: g?.metaTitle?.trim() || def.title,
    description: g?.metaDescription?.trim() || def.description,
  };
}
```

**Antes do Step 3, conferir** que os 6 textos acima batem exatamente com os `generateMetadata` atuais (`grep -n "title:\|description:"` nas 6 rotas). Se algum diferir, o do código atual vence e o teste é ajustado.

- [ ] **Step 4: Rodar e ver passar.**

- [ ] **Step 5: `PayloadTeam`** em `src/lib/data/payload-teams.ts`: `tournament: "serie-a" | "serie-b" | "europa"` e `extends TeamSeoDoc` (import type de `@/lib/team-seo`), removendo o campo `seo` próprio.

- [ ] **Step 6: `generateMetadata` das 6 rotas** — mesmo corpo em todas, mudando só a `page` (`hub`, `jogoHoje`, `ondeAssistir`, `escalacao`, `proximos`, `estatisticas`):

```ts
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = await getTeam(slug);
  const name = doc?.name || TEAM_BY_SLUG[slug]?.name;
  if (!name) return {};
  const { title, description } = teamSeo(doc, "escalacao", name);
  return { title, description, alternates: { canonical: `/futebol/times/${slug}${TEAM_PAGE_PATH.escalacao}` } };
}
```

- [ ] **Step 7: `npx tsc --noEmit -p .` limpo. Commit** `feat(times): SEO por aba com padrão centralizado (teamSeo)`.

---

### Task 4: Página clássica compartilhada + schema do CMS (Europa, SEO por aba, texto automático) + rascunho no dev

**Files:**
- Create: `src/components/team/classic/hub.tsx`, `jogo-hoje.tsx`, `onde-assistir.tsx`, `escalacao.tsx`, `proximos.tsx`, `estatisticas.tsx`
- Create: `src/lib/team-layout.ts`, `src/lib/team-layout.test.ts`
- Modify: as 6 rotas (corpo da página), `src/components/payload/team-cms-page.tsx`, `src/components/payload/team-blocks.tsx`, `src/payload.config.ts` (collection `teams` + `teamLayoutBlocks`), `src/lib/config.ts` (`teamTournament`, `TeamInfo.tournament`), `src/lib/data/payload-teams.ts` (drafts no dev)

**Interfaces:**
- Consumes: `TeamPage`, `TEAM_SEO_FIELD` (Task 3); `TeamPageData`, `getTeamPageDataFor`, `getTeamLastLineup` (existentes).
- Produces: componentes `ClassicTeamHub({ data })`, `ClassicTeamJogoHoje({ data })`, `ClassicTeamOndeAssistir({ data })`, `ClassicTeamEscalacao({ data, lineup })`, `ClassicTeamProximos({ data })`, `ClassicTeamEstatisticas({ data })` (todos server components, recebem `data: TeamPageData`; `lineup: TeamLastLineup | null`); `needsAutoTextAppend(blocks: { blockType?: string }[]): boolean`; env `TEAMS_CMS_DRAFTS`.

- [ ] **Step 1: Teste de `needsAutoTextAppend`**

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { needsAutoTextAppend } from "./team-layout.ts";

test("layout sem o bloco recebe o texto no fim; com o bloco, não", () => {
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }]), true);
  assert.equal(needsAutoTextAppend([{ blockType: "teamNews" }, { blockType: "teamAutoText" }]), false);
  assert.equal(needsAutoTextAppend([]), true);
});
```

- [ ] **Step 2: Ver falhar; implementar `src/lib/team-layout.ts`; ver passar**

```ts
// Layout personalizado de time: o texto automático aparece onde o editor pôs o bloco
// "teamAutoText". Se ele não pôs, anexa no fim (uma vez), como sempre foi.
export function needsAutoTextAppend(blocks: { blockType?: string }[]): boolean {
  return !blocks.some((b) => b?.blockType === "teamAutoText");
}
```

- [ ] **Step 3: Extrair a página clássica (movimento mecânico, sem mudar JSX)**

Para cada rota, mover **todo o JSX retornado depois de `const data = await getTeamPageData(slug); if (!data) notFound();`** para o componente clássico correspondente, trocando:
- `team.name` → `data.name`; `slug` → `data.slug`; `team.id` → `data.id`.
- Hub: o `<h3>` "Brasileirão 2026" vira `{data.tournament?.slug === "brasileirao-serie-a" ? "Brasileirão 2026" : `${data.tournament?.name ?? "Classificação"} 2026`}` e o link `/futebol/brasileirao-serie-a` vira `` `/futebol/${data.tournament?.slug ?? "brasileirao-serie-a"}` ``. O texto `posicao` vira `posição` (acento).
- Escalação: o `lineup` que a rota busca hoje vira prop.
- Imports que o JSX usa vão junto.

A rota fica:
```tsx
export default async function TeamHubPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = await getTeam(slug);
  if (doc) return <TeamCmsView doc={doc} page="hub" />;
  const data = await getTeamPageData(slug);
  if (!data) notFound();
  return <ClassicTeamHub data={data} />;
}
```

- [ ] **Step 4: `TeamCmsView` usa a clássica quando a aba está vazia**

Em `src/components/payload/team-cms-page.tsx`:
```tsx
const CLASSIC = {
  hub: ClassicTeamHub,
  jogoHoje: ClassicTeamJogoHoje,
  ondeAssistir: ClassicTeamOndeAssistir,
  proximos: ClassicTeamProximos,
  estatisticas: ClassicTeamEstatisticas,
} as const;

export async function TeamCmsView({ doc, page }: { doc: PayloadTeam; page: TeamNarrativePage }) {
  const data = await getTeamPageDataFor(teamInfoFromDoc(doc));
  const layout = (doc[FIELD_BY_KEY[page]] as unknown as { blockType?: string }[] | undefined) || [];
  const lineup = page === "escalacao" ? await getTeamLastLineup(data.id, 3).catch(() => null) : null;
  if (!layout.length) {
    if (page === "escalacao") return <ClassicTeamEscalacao data={data} lineup={lineup} />;
    const Classic = CLASSIC[page];
    return <Classic data={data} />;
  }
  return (
    <>
      <TeamBlockRenderer data={data} blocks={layout} page={page} lineup={lineup} />
      {needsAutoTextAppend(layout) && (
        <div className="mx-auto max-w-[860px] px-4 pb-6 space-y-5">
          {page === "escalacao" && <ProbableLineup lineup={lineup} />}
          <TeamNarrativeSection narrative={buildTeamNarrative(data, page, { lineup })} />
        </div>
      )}
    </>
  );
}
```
Conferir a assinatura real do componente de escalação da rota atual antes (ela usa `getTeamLastLineup(team.id, 3)`).

- [ ] **Step 5: Bloco `teamAutoText` no renderer**

Em `team-blocks.tsx`: `TeamBlockRenderer` ganha props `page: TeamNarrativePage` e `lineup: TeamLastLineup | null` e repassa pro `Block`; novo case:
```tsx
case "teamAutoText":
  return (
    <div className="space-y-5">
      {page === "escalacao" && <ProbableLineup lineup={lineup} />}
      <TeamNarrativeSection narrative={buildTeamNarrative(data, page, { lineup })} />
    </div>
  );
```
`DEFAULT_TEAM_LAYOUTS` sai de `team-blocks.tsx` e do `team-cms-page.tsx` (aba vazia agora = clássica). Se outro arquivo importar `DEFAULT_TEAM_LAYOUTS`, substituir o uso (grep antes).

- [ ] **Step 6: Schema no `payload.config.ts`**

- `teamLayoutBlocks` ganha `{ slug: "teamAutoText", labels: { singular: "Texto automático do time", plural: "Textos automáticos" }, fields: [] }`.
- `tournament.options` ganha `{ label: "Europa (sem tabela do Brasileirão)", value: "europa" }`; `admin.description` do collection passa a "Páginas de time geridas no CMS. Aba de layout vazia = página padrão do site. SEO de cada aba fica dentro da aba.".
- Em cada aba do `tabs` (menos Hub), adicionar depois do layout um grupo:
```ts
{ name: "seoJogoHoje", type: "group", label: "SEO desta página", fields: [
  { name: "metaTitle", type: "text", label: "Título (meta title)" },
  { name: "metaDescription", type: "textarea", label: "Descrição (meta description)" },
] }
```
(nomes: `seoJogoHoje`, `seoOndeAssistir`, `seoEscalacao`, `seoProximos`, `seoEstatisticas`). O `seo` existente sai do fim e vai para dentro da aba Hub, com `label: "SEO desta página"` (mesmo `name`, mesmas colunas no banco).

- [ ] **Step 7: `teamTournament` e tipo**

`src/lib/config.ts`: `TeamInfo.tournament?: "serie-a" | "serie-b" | "europa"`; em `teamTournament`, antes da checagem de slug: `if (team.tournament === "europa") return null;`.

- [ ] **Step 8: Rascunhos visíveis só no dev**

`src/lib/data/payload-teams.ts`: `const DRAFTS = process.env.TEAMS_CMS_DRAFTS === "1";` — em `getTeam` e `getPayloadTeamSlugs`: se `DRAFTS`, `find({ ..., draft: true, where: { slug: { equals: slug } } })` (sem filtro de `_status`); senão, como hoje. Os outros dois (`getPayloadTeamSlugMap`, `getPayloadTeamsList`) seguem só publicados.

- [ ] **Step 9: Verificação local**

Run: `node --test --experimental-strip-types src/lib/*.test.ts src/lib/api/*.test.ts` → todos PASS.
Run: `npx tsc --noEmit -p .` → limpo.
Run: `node scripts/gen-importmap.mjs` e conferir que o importMap não mudou de forma inesperada (`git diff --stat`).

- [ ] **Step 10: Commit** (sem push ainda: o schema precisa estar no banco antes do dev rodar este código)

```bash
git add -A && git commit -m "feat(times): página clássica compartilhada, SEO por aba, torneio Europa e bloco de texto automático no CMS"
```

---

### Task 5: Schema no banco + deploy no dev + init validado

**Files:** nenhum no repo (operação no servidor). Scratchpad: `ddl-teams.sql`.

- [ ] **Step 1: Backup** — `ssh ... 'docker exec pdb-postgres pg_dump -U pdb -d pdb_payload --no-owner > ~/pdb_payload_backup_20260927.sql && ls -la ~/pdb_payload_backup_20260927.sql'` (tamanho > 1 MB).

- [ ] **Step 2: Push sem rebuild** — `git push origin development`; no servidor `cd /home/ivan/papodebola-next-dev && git pull --rebase`.

- [ ] **Step 3: Gerar a migration de referência** com a imagem `pdb-migrate` (rebuild se `package-lock.json` mudou desde a última: `docker build -f Dockerfile.migrate -t pdb-migrate .`), seguindo a receita: container `pdb-mig` na `pdb-net`, `type: module`, `npx payload migrate:create teams_seo_tabs`, copiar `src/migrations` pra fora.

- [ ] **Step 4: Extrair só o DDL novo** do `up()` para `ddl-teams.sql`. Esperado (conferir nomes no arquivo gerado, não inventar):
  - `ALTER TYPE "public"."enum_teams_tournament" ADD VALUE 'europa';` e o mesmo para `"enum__teams_v_version_tournament"`.
  - `ALTER TABLE "teams" ADD COLUMN "seo_jogo_hoje_meta_title" varchar; ... "seo_jogo_hoje_meta_description" varchar;` (× 5 grupos) e em `"_teams_v"` com prefixo `version_`.
  - `CREATE TABLE "teams_blocks_team_auto_text" (...)` e `"_teams_v_blocks_team_auto_text"` + FKs + índices exatamente como gerados.
  - **Nenhum** DROP, nenhum ALTER em coluna existente. `ALTER TYPE ... ADD VALUE` não pode rodar dentro de transação em Postgres < 12: conferir `SELECT version()`; se ≥ 12, tudo numa transação.

- [ ] **Step 5: Aplicar** — `docker exec -i pdb-postgres psql -U pdb -d pdb_payload -v ON_ERROR_STOP=1 < ddl-teams.sql` (com `BEGIN;`/`COMMIT;` no arquivo). Conferir: `\d teams` mostra as 10 colunas novas; `\dT+ enum_teams_tournament` mostra `europa`.

- [ ] **Step 6: Limpar** — `docker rm -f pdb-mig`; apagar `/tmp/pdb-migrations`.

- [ ] **Step 7: Env do dev** — no servidor, acrescentar `TEAMS_CMS_DRAFTS=1` em `/home/ivan/papodebola-next-dev/.env.local` (só no dev).

- [ ] **Step 8: Rebuild do dev** — `cd /home/ivan/papodebola-next-dev && bash rebuild.sh`.

- [ ] **Step 9: Validar**
  - `docker logs papodebola-next-dev 2>&1 | grep -c payloadInitError` → `0`.
  - `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/cms-api/teams?limit=1` → `200`.
  - `curl` das 6 rotas de `criciuma` (Série B, agora página clássica) e de `palmeiras`/`real-madrid` (config) no `:3001` → `200`, títulos iguais aos padrões de `defaultTeamSeo`.
  - `ls` de `/app/data/api-cache` no container do dev tem arquivos depois de alguns minutos.

---

### Task 6: Seed dos 37 times como rascunho + comparação dev × prod

**Files:** scratchpad (fora do repo): `seed-teams.mjs`, `compare-teams.sh`.

- [ ] **Step 1: Seed** (`npx payload run` no container efêmero `pdb-post`, padrão de `criar_post_payload_run`, log em arquivo):

```js
import fs from "node:fs";
import { getPayload } from "payload";
import config from "@payload-config";
import { ALL_CLUSTER_TEAMS } from "@/lib/config";
import { defaultTeamSeo, TEAM_SEO_FIELD } from "@/lib/team-seo";

const log = (...a) => fs.appendFileSync("/app/out.txt", a.join(" ") + "\n");
const EU = new Set(["real-madrid","barcelona","liverpool","manchester-city","manchester-united","chelsea","tottenham","arsenal","juventus","milan","inter-milan","bayern","psg","porto","nottingham-forest","aston-villa","dortmund"]);
const PAGES = ["hub","jogoHoje","ondeAssistir","escalacao","proximos","estatisticas"];
const payload = await getPayload({ config });

function seoFill(doc, name) {
  const out = {};
  for (const p of PAGES) {
    const f = TEAM_SEO_FIELD[p];
    const cur = doc?.[f] || {};
    const def = defaultTeamSeo(p, name);
    out[f] = { metaTitle: cur.metaTitle || def.title, metaDescription: cur.metaDescription || def.description };
  }
  return out;
}

// 1) 37 times do config → rascunho (não duplica)
for (const t of ALL_CLUSTER_TEAMS) {
  const found = await payload.find({ collection: "teams", where: { slug: { equals: t.slug } }, draft: true, limit: 1 });
  if (found.docs.length) { log("existe", t.slug); continue; }
  await payload.create({
    collection: "teams", draft: true,
    data: { name: t.name, slug: t.slug, sofascoreId: t.id, tournament: EU.has(t.slug) ? "europa" : "serie-a", _status: "draft", ...seoFill(null, t.name) },
  });
  log("criado", t.slug);
}
// 2) Série B já publicada: preenche só os grupos de SEO vazios (mantém publicado)
const serieB = await payload.find({ collection: "teams", where: { tournament: { equals: "serie-b" } }, limit: 100, pagination: false });
for (const d of serieB.docs) {
  await payload.update({ collection: "teams", id: d.id, data: seoFill(d, d.name) });
  log("seo-b", d.slug);
}
log("FIM");
```
Conferir antes que `ALL_CLUSTER_TEAMS` tem 37 itens e que nenhum slug colide com a Série B.

- [ ] **Step 2: Rodar** e conferir `out.txt`: 37 `criado` (ou `existe`), 20 `seo-b`, `FIM`. Remover o container.

- [ ] **Step 3: Comparar** — para cada um dos 37 slugs × 6 rotas, baixar HTML de `http://127.0.0.1:3001` (dev, rascunho do CMS) e `http://127.0.0.1:3000` (prod, config), 1 requisição por vez com 1 s de intervalo; normalizar removendo `/_next/static/[^"]*`, `self.__next_f.push(...)`, atributos `nonce`, ids gerados (`:r[0-9a-z]+:`), e as diferenças esperadas desta entrega (acento em "posição"). Extrair do HTML normalizado: `<title>`, meta description, canonical, `<h1>`, `<h2>`/`<h3>` e texto visível do `<main>`. Reportar qualquer diferença.
  - Diferenças esperadas e aceitas: dado ao vivo que mudou entre as duas requisições (placar/horário), e dev ≠ prod em código ainda não promovido (a prod ainda não tem a Task 1-4). Para isolar isso, comparar dev-CMS com **dev-config**: antes do seed, salvar o HTML do dev de 3 times (Palmeiras, Cruzeiro, Real Madrid) × 6 rotas; depois do seed, comparar com o dev de novo.
  - Nenhuma diferença estrutural (seção faltando, título diferente, coluna lateral ausente).

- [ ] **Step 4:** se houver diferença estrutural, corrigir o componente clássico/`TeamCmsView`, commit, `git pushdev`, repetir o Step 3.

---

### Task 7: Simulação da API fora do ar (e do CMS fora do ar)

**Files:** nenhum (servidor; container temporário removido no fim).

- [ ] **Step 1:** esperar o `data/api-cache` do dev ter arquivos de times, campeonato, tênis, NBA (visitar no `:3001` uma vez: `/futebol/times/palmeiras`, `/futebol/times/palmeiras/estatisticas`, `/futebol/times/real-madrid`, `/tenis`, `/nba`, `/futebol/brasileirao-serie-a`, `/api/championship/brasileirao-serie-a`).
- [ ] **Step 2:** subir container temporário da imagem do dev:
```bash
docker run -d --name pdb-apioff --network pdb-net -p 127.0.0.1:3099:3000 \
  --env-file /home/ivan/papodebola-next-dev/.env.local \
  -e ALLSPORTS_API_KEY=chave-invalida-teste -e SPORTS_PROXY_URL= -e TEAMS_CMS_DRAFTS=1 \
  -v papodebola-next_pdb-data:/app/data:ro papodebola-next-dev-nextjs:latest
```
(conferir o nome real da imagem e do volume com `docker inspect papodebola-next-dev`). Volume **somente leitura** para não sujar os dados.
- [ ] **Step 3:** no `:3099`, as páginas do Step 1 respondem 200 e mostram dados (nomes de adversários, posição na tabela, artilheiros); `docker logs pdb-apioff | grep -c API_FALLBACK_DISK` > 0.
- [ ] **Step 4:** CMS fora: `docker network disconnect pdb-net pdb-apioff`, reiniciar o container; `/futebol/times/palmeiras` responde 200 (config), `/futebol/times/criciuma` pode dar 404 (esperado: Série B só existe no CMS).
- [ ] **Step 5:** `docker rm -f pdb-apioff`.

---

### Task 8: Correções de URLs quebradas (levantamento)

**Files:**
- Modify: `next.config.ts` (redirects)
- Outros conforme o levantamento (lista fechada no Step 1).

- [ ] **Step 1:** consolidar os resultados do crawl do servidor (`/tmp/pdb-audit/*_res.tsv`): toda linha com status ≠ 200/301/308, toda cadeia de redirect com 2+ saltos, e toda URL do GSC com impressões que não termina em 200. Para cada grupo, achar a rota em `src/app/(site)/` e decidir: corrigir a rota, 301 para o destino certo, ou tirar do sitemap/links.
- [ ] **Step 2: Cadeias já identificadas** — em `next.config.ts`:
  - `{ source: "/esporte/nba", destination: "/nba", permanent: true }` (era `/basquete/nba`, que redireciona de novo).
  - Antes de `/campeonato/:slug`, adicionar `{ source: "/campeonato/brasileirao", destination: "/futebol/brasileirao-serie-a", permanent: true }`.
- [ ] **Step 3:** aplicar as demais correções do Step 1, uma por commit, cada uma com o `curl` que prova o antes/depois.
- [ ] **Step 4:** build de produção local (`npm run build`, montar o standalone e subir na porta 3010 como em `soft404_e_paginas_legais`) e conferir as URLs corrigidas: 200/301/404 corretos.
- [ ] **Step 5:** commit por correção.

---

### Task 9: Publicação, promoção e validação final

- [ ] **Step 1:** `git pushdev`; revalidar e conferir no dev as rotas corrigidas.
- [ ] **Step 2:** publicar os 37 rascunhos (script `npx payload run` com `payload.update({ collection: "teams", id, data: { _status: "published" } })` para cada doc em rascunho, sem mexer em conteúdo); conferir `SELECT count(*) FROM teams WHERE _status='published'` = 57.
- [ ] **Step 3:** promover (`promote.sh -y`); validar init do Payload na prod (`payloadInitError` = 0, `/cms-api/teams?limit=1` 200); revalidar `/`, `/sitemap.xml` e as 342 rotas de time (`/api/revalidate` com os paths, em lotes de 50).
- [ ] **Step 4:** recrawl na prod das URLs do levantamento e das 342 rotas de time (1 req/s): todas 200 (ou o 301/404 decidido).
- [ ] **Step 5: `agent-browser`** (desktop 1440 e celular 390): `/`, `/futebol/times/palmeiras` (+ `/estatisticas`), `/futebol/times/real-madrid`, `/futebol/times/criciuma`, `/futebol/selecao-brasileira/25-09-2026/australia-brasil`, `/cms` → Times → Palmeiras → aba "Onde assistir" mostra "SEO desta página" preenchido. Screenshots salvos no scratchpad; sem erro no console.
- [ ] **Step 6:** documentar em `docs/knowledge/2026-09-27-times-cms-resiliencia.md` (o que mudou, como editar SEO por aba, o fallback do `data/api-cache`, como reverter), atualizar `CLAUDE.md` (seção de times e da arquitetura de API) e a memória; apagar scripts do scratchpad, `/tmp/pdb-audit` e containers temporários no servidor; commit e promover a doc.

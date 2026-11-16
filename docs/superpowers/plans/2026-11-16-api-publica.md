# API pública `/v1` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expor os dados esportivos já coletados pelo Papo de Bola numa API `/v1` com chave + IP, cache e ao vivo, servida por um container próprio (`papodebola-api`) para o site novo do Ivan.

**Architecture:** Rotas Next (`src/app/v1/**/route.ts`) chamam as funções de dados existentes (`getChampionshipData`, `getMatchDetail`, store de jogos de hoje...) e passam o resultado por conversores puros (`src/lib/public-api/v1/*`) que montam DTOs em português com envelope `{data, meta}`. Um wrapper `withPublicApi` faz chave/IP/cota/cache/uso. Em prod roda no container `papodebola-api` (mesma imagem da prod, `PDB_API_MODE=1`, sem fallback direto ao fornecedor), atrás de Cloudflare + nginx.

**Tech Stack:** Next.js 16 App Router (route handlers, runtime Node), TypeScript, `node:test` com `--experimental-strip-types`, Docker, nginx (aaPanel), Cloudflare.

**Spec:** `docs/superpowers/specs/2026-11-16-api-publica-design.md`

## Global Constraints

- Só o development consulta a AllSportsApi. O container da API **nunca** chama a RapidAPI direto (`PDB_API_MODE=1` desliga o fallback direto).
- Nada pendura: valem os limites do `fetchAllSports` (retry 429 ~2 s, `AbortSignal.timeout(8s)`).
- Chave só no cabeçalho `x-api-key`; formato `pdb_` + 40 caracteres; guardar só SHA-256; exibir uma vez.
- Cota padrão por chave: **600 req/min**. Sem CORS.
- Campos em português; ids do Sofascore preservados; datas ISO com `-03:00`.
- Envelope: `{ data, meta: { atualizadoEm, desatualizado, proximaAtualizacaoSugerida } }`; erro: `{ erro: { codigo, mensagem } }`.
- TTLs: ao vivo 10 s; jogos de hoje 30 s; campeonato com jogo em andamento 60 s, sem jogo 600 s; jogo encerrado 86400 s; imagens `max-age=2592000`.
- Testes com `node --test --experimental-strip-types`: módulos testados importam outros módulos de runtime por caminho **relativo com `.ts`**; dependências só de tipo usam `import type` (são apagadas).
- Pasta nova em `src/app` exige `npm run gen:paths` (o teste `reserved-paths` falha se esquecer).
- Fluxo: commit na branch `development`, `git pushdev`, validar, `git promote` só com ok do Ivan.

## Review Focus

- **Jogo inexistente / id não numérico** (`/v1/jogos/abc`, `/v1/jogos/999999999`): espera-se 400 e 404 com envelope de erro, nunca 500 nem HTML.
- **Slug de campeonato desconhecido ou rodada inexistente**: 404 `nao_encontrado`, não tabela vazia com 200.
- **Arquivo `api-keys.json` ausente ou corrompido**: todas as chamadas dão 401 (falha fechada), sem derrubar o processo.
- **Rajada de pedidos iguais ao vivo com cache frio**: uma única busca (coalescência), e erro na busca não fica cacheado como sucesso.
- **Data fora do intervalo em `/v1/jogos?data=`** (formato errado, ano 1999, daqui a 2 anos): 400 `parametro_invalido`, para ninguém usar a API para varrer o fornecedor.

---

## File Structure

```
src/lib/public-api/
  envelope.ts            # ok()/fail() → Response JSON no formato do contrato
  envelope.test.ts
  keys.ts                # gerar chave, hash, verificar (puro) + tipos ApiKeyRecord
  keys.test.ts
  keys-store.ts          # ler/gravar data/api-keys.json (IO, cache 30 s)
  rate-limit.ts          # token bucket por chave (puro, injeta relógio)
  rate-limit.test.ts
  response-cache.ts      # cache TTL em memória + coalescência (puro)
  response-cache.test.ts
  authorize.ts           # decide 401/403/429/ok a partir de headers+chaves (puro)
  authorize.test.ts
  client-ip.ts           # IP de origem a partir dos headers
  usage.ts               # contagem por chave/rota, flush a cada 60 s em data-api/usage
  with-public-api.ts     # wrapper das rotas /v1 (auth → cache → handler → uso)
  v1/
    status.ts            # statusType bruto → status do contrato
    dto.ts               # tipos do contrato v1
    map-championship.ts  # ChampionshipData → DTOs (tabela, rodadas, artilharia)
    map-match.ts         # MatchDetail/MatchLive/AgendaEvent/TeamMatch → DTOs
    map.test.ts
    ttl.ts               # TTL e proximaAtualizacaoSugerida por tipo/estado
    ttl.test.ts
    openapi.yaml
src/app/v1/
  campeonatos/route.ts
  campeonatos/[slug]/route.ts
  campeonatos/[slug]/rodadas/[chave]/route.ts
  campeonatos/[slug]/artilharia/route.ts
  jogos/route.ts                 # ?data=AAAA-MM-DD
  jogos/hoje/route.ts
  jogos/ao-vivo/route.ts
  jogos/[id]/route.ts
  jogos/[id]/ao-vivo/route.ts
  times/[id]/route.ts
  imagens/time/[id]/route.ts
  imagens/jogador/[id]/route.ts
  docs/route.ts
src/app/api/painel-api-keys/route.ts
src/app/(site)/painel-pdb-9x/api/page.tsx
Modify:
  src/lib/api/allsports.ts       # PDB_API_MODE: sem fallback direto
  src/middleware.ts              # proteger /api/painel-api-keys
  src/app/(site)/painel-pdb-9x/layout.tsx  # aba "API"
  package.json                   # globs de teste
  CLAUDE.md, docs/knowledge/2026-11-16-api-publica.md
Servidor (fora do git): /home/ivan/papodebola-api/docker-compose.yml, vhost nginx api, rebuild.sh da prod, override do dev
```

---

### Task 1: Envelope, status e TTL (base do contrato)

**Files:**
- Create: `src/lib/public-api/envelope.ts`, `src/lib/public-api/envelope.test.ts`
- Create: `src/lib/public-api/v1/status.ts`, `src/lib/public-api/v1/ttl.ts`, `src/lib/public-api/v1/ttl.test.ts`
- Modify: `package.json` (script `test`)

**Interfaces:**
- Produces:
  - `type ErrorCode = "parametro_invalido" | "chave_ausente" | "chave_invalida" | "ip_nao_autorizado" | "chave_desativada" | "nao_encontrado" | "limite_excedido" | "indisponivel" | "erro_interno"`
  - `interface Meta { atualizadoEm: string; desatualizado: boolean; proximaAtualizacaoSugerida: number }`
  - `ok(data: unknown, meta: Meta, init?: { headers?: Record<string,string> }): Response`
  - `fail(status: number, codigo: ErrorCode, mensagem: string, headers?: Record<string,string>): Response`
  - `isoBrt(d: Date | number | string): string` (ms ou ISO → `"AAAA-MM-DDTHH:mm:ss-03:00"`)
  - `type StatusV1 = "agendado" | "ao_vivo" | "intervalo" | "encerrado" | "adiado" | "cancelado" | "interrompido"`; `toStatusV1(raw: string, desc?: string): StatusV1`
  - `TTL = { aoVivo: 10, hoje: 30, campeonatoComJogo: 60, campeonatoParado: 600, encerrado: 86400, agendado: 60, time: 300, diaPassado: 86400, diaFuturo: 600 }`
  - `matchTtl(status: StatusV1): number` → ao_vivo/intervalo 10, encerrado/cancelado 86400, demais 60
  - `suggestedRefresh(status: StatusV1): number` → ao_vivo 10, intervalo 60, encerrado/cancelado 86400, demais 300

- [ ] **Step 1: Add test globs to `package.json`**

In `"test"`, append ` src/lib/public-api/*.test.ts src/lib/public-api/v1/*.test.ts` before the closing quote.

- [ ] **Step 2: Write failing tests**

`src/lib/public-api/envelope.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { ok, fail, isoBrt } from "./envelope.ts";

test("ok monta envelope data+meta com JSON e sem CORS", async () => {
  const r = ok({ a: 1 }, { atualizadoEm: "x", desatualizado: false, proximaAtualizacaoSugerida: 10 });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get("content-type"), "application/json; charset=utf-8");
  assert.equal(r.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(await r.json(), { data: { a: 1 }, meta: { atualizadoEm: "x", desatualizado: false, proximaAtualizacaoSugerida: 10 } });
});

test("fail monta erro com codigo/mensagem e headers extras", async () => {
  const r = fail(429, "limite_excedido", "calma", { "retry-after": "3" });
  assert.equal(r.status, 429);
  assert.equal(r.headers.get("retry-after"), "3");
  assert.deepEqual(await r.json(), { erro: { codigo: "limite_excedido", mensagem: "calma" } });
});

test("isoBrt converte para -03:00", () => {
  assert.equal(isoBrt(Date.UTC(2026, 10, 16, 18, 42, 10)), "2026-11-16T15:42:10-03:00");
  assert.equal(isoBrt("2026-11-16T02:00:00.000Z"), "2026-11-15T23:00:00-03:00");
});
```

`src/lib/public-api/v1/ttl.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { toStatusV1 } from "./status.ts";
import { matchTtl, suggestedRefresh } from "./ttl.ts";

test("status bruto da API vira status do contrato", () => {
  assert.equal(toStatusV1("notstarted"), "agendado");
  assert.equal(toStatusV1("inprogress"), "ao_vivo");
  assert.equal(toStatusV1("inprogress", "Halftime"), "intervalo");
  assert.equal(toStatusV1("inprogress", "Intervalo"), "intervalo");
  assert.equal(toStatusV1("finished"), "encerrado");
  assert.equal(toStatusV1("postponed"), "adiado");
  assert.equal(toStatusV1("canceled"), "cancelado");
  assert.equal(toStatusV1("cancelled"), "cancelado");
  assert.equal(toStatusV1("interrupted"), "interrompido");
  assert.equal(toStatusV1("suspended"), "interrompido");
  assert.equal(toStatusV1(""), "agendado");
});

test("ttl e atualização sugerida por status", () => {
  assert.equal(matchTtl("ao_vivo"), 10);
  assert.equal(matchTtl("intervalo"), 10);
  assert.equal(matchTtl("encerrado"), 86400);
  assert.equal(matchTtl("agendado"), 60);
  assert.equal(suggestedRefresh("ao_vivo"), 10);
  assert.equal(suggestedRefresh("intervalo"), 60);
  assert.equal(suggestedRefresh("encerrado"), 86400);
  assert.equal(suggestedRefresh("agendado"), 300);
});
```

- [ ] **Step 3: Run and verify fail**

Run: `npm test 2>&1 | tail -20`
Expected: FAIL — `Cannot find module .../envelope.ts`.

- [ ] **Step 4: Implement**

`src/lib/public-api/envelope.ts`:
```ts
// Formato único de resposta da API pública /v1 (ver spec 2026-11-16-api-publica-design.md §3.3).
export type ErrorCode =
  | "parametro_invalido" | "chave_ausente" | "chave_invalida" | "ip_nao_autorizado"
  | "chave_desativada" | "nao_encontrado" | "limite_excedido" | "indisponivel" | "erro_interno";

export interface Meta {
  atualizadoEm: string;
  desatualizado: boolean;
  proximaAtualizacaoSugerida: number;
}

const JSON_CT = "application/json; charset=utf-8";

export function ok(data: unknown, meta: Meta, init: { headers?: Record<string, string> } = {}): Response {
  return new Response(JSON.stringify({ data, meta }), {
    status: 200,
    headers: { "content-type": JSON_CT, "cache-control": "private, no-store", ...(init.headers || {}) },
  });
}

export function fail(status: number, codigo: ErrorCode, mensagem: string, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ erro: { codigo, mensagem } }), {
    status,
    headers: { "content-type": JSON_CT, "cache-control": "no-store", ...headers },
  });
}

// Horário de Brasília fixo (-03:00; o Brasil não tem horário de verão desde 2019).
export function isoBrt(d: Date | number | string): string {
  const ms = d instanceof Date ? d.getTime() : typeof d === "number" ? d : Date.parse(d);
  const s = new Date(ms - 3 * 3600_000).toISOString().slice(0, 19);
  return `${s}-03:00`;
}
```

`src/lib/public-api/v1/status.ts`:
```ts
export type StatusV1 = "agendado" | "ao_vivo" | "intervalo" | "encerrado" | "adiado" | "cancelado" | "interrompido";

// statusType bruto do Sofascore (notstarted | inprogress | finished | postponed | canceled ...)
// + descrição (EN ou PT) para detectar o intervalo.
export function toStatusV1(raw: string, desc = ""): StatusV1 {
  const t = (raw || "").toLowerCase();
  if (t === "inprogress") return /half ?time|intervalo/i.test(desc) ? "intervalo" : "ao_vivo";
  if (t === "finished") return "encerrado";
  if (t === "postponed") return "adiado";
  if (t === "canceled" || t === "cancelled") return "cancelado";
  if (t === "interrupted" || t === "suspended" || t === "abandoned") return "interrompido";
  return "agendado";
}
```

`src/lib/public-api/v1/ttl.ts`:
```ts
import type { StatusV1 } from "./status.ts";

export const TTL = {
  aoVivo: 10, hoje: 30, campeonatoComJogo: 60, campeonatoParado: 600,
  encerrado: 86400, agendado: 60, time: 300, diaPassado: 86400, diaFuturo: 600,
} as const;

export function matchTtl(s: StatusV1): number {
  if (s === "ao_vivo" || s === "intervalo") return TTL.aoVivo;
  if (s === "encerrado" || s === "cancelado") return TTL.encerrado;
  return TTL.agendado;
}

export function suggestedRefresh(s: StatusV1): number {
  if (s === "ao_vivo") return 10;
  if (s === "intervalo") return 60;
  if (s === "encerrado" || s === "cancelado") return 86400;
  return 300;
}
```

- [ ] **Step 5: Run and verify pass**

Run: `npm test 2>&1 | tail -8`
Expected: all pass (`# fail 0`).

- [ ] **Step 6: Commit**
```bash
git add package.json src/lib/public-api
git commit -m "feat(api-v1): envelope, status e TTL do contrato público"
```

---

### Task 2: Conversores (DTOs v1)

**Files:**
- Create: `src/lib/public-api/v1/dto.ts`, `map-championship.ts`, `map-match.ts`, `map.test.ts`

**Interfaces:**
- Consumes: `toStatusV1`, `StatusV1` (Task 1), `isoBrt` (Task 1). Types only: `ChampionshipData`, `RoundRef` (`@/types/tournament`), `StandingsGroup` (`@/types/standings`), `ChampionshipMatch` (`@/types/match`), `Scorer` (`@/types/team`), `MatchDetail`, `MatchLive`, `MatchEvent`, `MatchIncident`, `TeamLineup`, `MatchStatItem`, `MatchCommentary`, `ShootoutKick` (`@/lib/data/match-detail`), `AgendaLeagueGroup`, `AgendaEvent` (`@/lib/data/agenda`), `TeamMatch` (`@/lib/data/team`).
- Produces (all in `dto.ts`):
```ts
export interface TimeRefV1 { id: number; nome: string; escudo: string }       // escudo = "/v1/imagens/time/{id}"
export interface PlacarV1 { mandante: number | null; visitante: number | null; penaltisMandante?: number | null; penaltisVisitante?: number | null }
export interface JogoResumoV1 { id: number; campeonato?: string; rodada?: number; inicio: string; inicioTs: number; status: StatusV1; statusTexto: string; mandante: TimeRefV1; visitante: TimeRefV1; placar: PlacarV1 }
export interface LinhaTabelaV1 { posicao: number; time: TimeRefV1; pontos: number; jogos: number; vitorias: number; empates: number; derrotas: number; golsPro: number; golsContra: number; saldo: number; zona: string; variacao: number; ultimos: ("V" | "E" | "D")[] }
export interface GrupoTabelaV1 { nome: string; linhas: LinhaTabelaV1[] }
export interface RodadaRefV1 { chave: string; numero: number; nome: string; mataMata: boolean }
export interface CampeonatoResumoV1 { slug: string; nome: string; id: number; temporadaId: number | null }
export interface CampeonatoV1 extends CampeonatoResumoV1 { rodadaAtual: string; rodadas: RodadaRefV1[]; tabela: GrupoTabelaV1[]; temJogoAoVivo: boolean }
export interface ArtilheiroV1 { posicao: number; jogador: { id: number; nome: string; foto: string }; time: TimeRefV1; gols: number; nota: number | null }
export interface LanceV1 { tipo: string; detalhe: string; minuto: number | null; acrescimo: number | null; jogador: string | null; assistencia: string | null; entrou: string | null; saiu: string | null; lado: "mandante" | "visitante" | null; placarMandante: number | null; placarVisitante: number | null; texto: string | null }
export interface NarracaoV1 { id: number; tipo: string; texto: string; minuto: number | null; rotuloMinuto: string | null; lado: "mandante" | "visitante" | null; jogador: string | null; html: string | null }
export interface JogadorEscalacaoV1 { id: number; nome: string; numero: number | null; posicao: string; nota: string | null; capitao: boolean; foto: string }
export interface EscalacaoV1 { formacao: string | null; titulares: JogadorEscalacaoV1[]; reservas: JogadorEscalacaoV1[] }
export interface EstatisticaV1 { nome: string; mandante: string; visitante: string }
export interface CobrancaPenaltiV1 { ordem: number; jogador: string; lado: "mandante" | "visitante"; converteu: boolean; motivo: string }
export interface JogoV1 extends JogoResumoV1 { estadio: { nome: string; cidade: string; pais: string } | null; arbitro: string | null; vencedor: "mandante" | "visitante" | null; inicioPeriodoTs: number; lances: LanceV1[]; narracao: NarracaoV1[]; estatisticas: EstatisticaV1[]; penaltis: CobrancaPenaltiV1[] }
export interface JogoCompletoV1 extends JogoV1 { escalacoes: { confirmadas: boolean; mandante: EscalacaoV1 | null; visitante: EscalacaoV1 | null } }
export interface DiaCampeonatoV1 { campeonato: string; jogos: JogoResumoV1[] }
export interface TimeV1 { id: number; nome: string; escudo: string; proximos: JogoResumoV1[]; ultimos: JogoResumoV1[] }
```
- Functions:
  - `map-championship.ts`: `toCampeonatoResumo(t: {slug,name,id,seasonId}): CampeonatoResumoV1`; `toCampeonato(t, d: ChampionshipData): CampeonatoV1`; `toRodada(d: ChampionshipData, chave: string): JogoResumoV1[] | null` (null = chave inexistente); `toArtilharia(list: Scorer[]): ArtilheiroV1[]`; `hasLiveMatch(d: ChampionshipData): boolean`
  - `map-match.ts`: `teamRef(id: number, nome: string): TimeRefV1`; `fromChampionshipMatch(m: ChampionshipMatch, campeonato?: string): JogoResumoV1`; `fromAgendaEvent(e: AgendaEvent): JogoResumoV1`; `fromTeamMatch(m: TeamMatch): JogoResumoV1`; `toJogo(live: MatchLive): JogoV1`; `toJogoCompleto(d: MatchDetail): JogoCompletoV1`; `toDia(groups: AgendaLeagueGroup[], onlyLive?: boolean): DiaCampeonatoV1[]`

- [ ] **Step 1: Write failing tests** — `src/lib/public-api/v1/map.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { toCampeonato, toRodada, toArtilharia, hasLiveMatch } from "./map-championship.ts";
import { fromChampionshipMatch, fromAgendaEvent, toJogoCompleto, toJogo, toDia } from "./map-match.ts";

const T = { slug: "brasileirao-serie-a", name: "Brasileirão Série A", id: 325, seasonId: 87678 };
const cm = (over: Record<string, unknown> = {}) => ({
  id: 1, home: "Cruzeiro", away: "Palmeiras", homeId: 1954, awayId: 1963, homeScore: 2, awayScore: 1,
  status: "finished", statusDesc: "Encerrado", timestamp: 1763496000, round: 34, ...over,
});
const champ = (over: Record<string, unknown> = {}) => ({
  tournament: { id: 325, seasonId: 87678, name: "Brasileirão Série A" },
  rounds: [33, 34], currentRound: 34,
  roundList: [
    { key: "33", round: 33, label: "Rodada 33", knockout: false },
    { key: "34", round: 34, label: "Rodada 34", knockout: false },
  ],
  standings: [{ name: "Brasileirão Série A", rows: [{ pos: 1, team: "Palmeiras", teamId: 1963, pts: 70, matches: 34, wins: 21, draws: 7, losses: 6, gf: 60, ga: 30, gd: 30, promo: "Libertadores", posChange: 0, recentForm: ["W", "D", "L"] }] }],
  matchesByRound: { "34": [cm()] },
  updatedAt: "2026-11-16T18:00:00.000Z",
  ...over,
});

test("campeonato: tabela em português, forma V/E/D, rodadas e escudo", () => {
  const c = toCampeonato(T, champ() as any);
  assert.equal(c.slug, "brasileirao-serie-a");
  assert.equal(c.rodadaAtual, "34");
  assert.deepEqual(c.rodadas.map((r) => r.chave), ["33", "34"]);
  const l = c.tabela[0].linhas[0];
  assert.equal(l.posicao, 1);
  assert.equal(l.pontos, 70);
  assert.deepEqual(l.ultimos, ["V", "E", "D"]);
  assert.deepEqual(l.time, { id: 1963, nome: "Palmeiras", escudo: "/v1/imagens/time/1963" });
  assert.equal(c.temJogoAoVivo, false);
});

test("campeonato sem roundList usa rounds numéricos", () => {
  const c = toCampeonato(T, champ({ roundList: undefined }) as any);
  assert.deepEqual(c.rodadas, [
    { chave: "33", numero: 33, nome: "Rodada 33", mataMata: false },
    { chave: "34", numero: 34, nome: "Rodada 34", mataMata: false },
  ]);
});

test("rodada inexistente devolve null; existente devolve jogos", () => {
  assert.equal(toRodada(champ() as any, "99"), null);
  const jogos = toRodada(champ() as any, "34")!;
  assert.equal(jogos.length, 1);
  assert.equal(jogos[0].status, "encerrado");
  assert.deepEqual(jogos[0].placar, { mandante: 2, visitante: 1 });
});

test("jogo com pênaltis expõe penaltis no placar", () => {
  const j = fromChampionshipMatch(cm({ homeScore: 1, awayScore: 1, homePens: 3, awayPens: 4 }) as any);
  assert.deepEqual(j.placar, { mandante: 1, visitante: 1, penaltisMandante: 3, penaltisVisitante: 4 });
});

test("hasLiveMatch detecta inprogress em qualquer rodada", () => {
  assert.equal(hasLiveMatch(champ({ matchesByRound: { "34": [cm({ status: "inprogress" })] } }) as any), true);
});

test("artilharia numera posição e aponta foto", () => {
  const a = toArtilharia([{ player: { id: 9, name: "Fulano da Silva", shortName: "F. Silva" }, team: { id: 1963, name: "Palmeiras" }, goals: 15, rating: 7.4 }]);
  assert.deepEqual(a[0], { posicao: 1, jogador: { id: 9, nome: "Fulano da Silva", foto: "/v1/imagens/jogador/9" }, time: { id: 1963, nome: "Palmeiras", escudo: "/v1/imagens/time/1963" }, gols: 15, nota: 7.4 });
});

const ev = (over: Record<string, unknown> = {}) => ({
  id: 77, homeId: 1954, awayId: 1963, home: "Cruzeiro", away: "Palmeiras", homeScore: 1, awayScore: 1,
  homePens: 3, awayPens: 4, winnerCode: 2, statusType: "finished", statusDesc: "Encerrado",
  startTimestamp: 1763496000, periodStart: 0, live: false,
  venue: { stadium: "Mineirão", city: "Belo Horizonte", country: "Brasil" }, referee: { name: "Juiz", country: "BR" }, ...over,
});
const detail = () => ({
  event: ev(),
  incidents: [{ type: "goal", cls: "regular", minute: 10, addedTime: null, player: "A", assist: "B", playerIn: null, playerOut: null, isHome: true, homeScore: 1, awayScore: 0, text: null }],
  commentary: [{ id: 5, type: "goal", text: "Goal", textPt: "Gol!", isHome: true, player: "A", playerId: 1, playerIn: null, playerInId: null, playerOut: null, reason: null, minute: 10 }],
  home: { formation: "4-3-3", starters: [{ id: 1, name: "A", number: 9, position: "F", rating: "7.5", captain: true }], bench: [] },
  away: null, lineupsConfirmed: true,
  stats: [{ name: "Posse de bola", home: "55%", away: "45%", homeNum: 55, awayNum: 45 }],
  shootout: [{ sequence: 1, player: "A", isHome: true, scored: true, reason: "scored" }],
});

test("jogo completo: lances, narração em PT, escalação, pênaltis, vencedor", () => {
  const j = toJogoCompleto(detail() as any);
  assert.equal(j.id, 77);
  assert.equal(j.status, "encerrado");
  assert.equal(j.vencedor, "visitante");
  assert.deepEqual(j.estadio, { nome: "Mineirão", cidade: "Belo Horizonte", pais: "Brasil" });
  assert.equal(j.arbitro, "Juiz");
  assert.equal(j.lances[0].lado, "mandante");
  assert.equal(j.narracao[0].texto, "Gol!");
  assert.equal(j.escalacoes.mandante!.titulares[0].foto, "/v1/imagens/jogador/1");
  assert.equal(j.escalacoes.visitante, null);
  assert.deepEqual(j.penaltis[0], { ordem: 1, jogador: "A", lado: "mandante", converteu: true, motivo: "scored" });
  assert.equal(j.inicio, "2025-11-18T17:00:00-03:00");
});

test("jogo ao vivo enxuto não tem escalações", () => {
  const d = detail();
  const j = toJogo({ event: ev({ statusType: "inprogress", statusDesc: "2º tempo" }), incidents: d.incidents, commentary: d.commentary, stats: d.stats, shootout: [] } as any);
  assert.equal(j.status, "ao_vivo");
  assert.equal("escalacoes" in j, false);
});

test("dia agrupa por campeonato e filtra ao vivo", () => {
  const e = (id: number, statusType: string) => ({ id, league: "Série A", home: "X", away: "Y", homeId: 1, awayId: 2, homeScore: 0, awayScore: 0, status: "", statusType, time: "16:00", timestamp: 1763496000 });
  const groups = [{ league: "Série A", events: [e(1, "inprogress"), e(2, "notstarted")] }, { league: "Série B", events: [e(3, "finished")] }];
  assert.equal(toDia(groups as any).length, 2);
  const live = toDia(groups as any, true);
  assert.equal(live.length, 1);
  assert.deepEqual(live[0].jogos.map((j) => j.id), [1]);
  assert.equal(fromAgendaEvent(e(9, "notstarted") as any).campeonato, "Série A");
});
```

- [ ] **Step 2: Run and verify fail**

Run: `npm test 2>&1 | tail -20` — Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `dto.ts`** — exactly the interfaces listed under **Produces**, prefixed with `import type { StatusV1 } from "./status.ts";` and each `export`.

- [ ] **Step 4: Implement `map-match.ts`**
```ts
import type { ChampionshipMatch } from "@/types/match";
import type { MatchDetail, MatchLive, MatchEvent, TeamLineup } from "@/lib/data/match-detail";
import type { AgendaEvent, AgendaLeagueGroup } from "@/lib/data/agenda";
import type { TeamMatch } from "@/lib/data/team";
import { toStatusV1 } from "./status.ts";
import { isoBrt } from "../envelope.ts";
import type { TimeRefV1, PlacarV1, JogoResumoV1, JogoV1, JogoCompletoV1, EscalacaoV1, DiaCampeonatoV1 } from "./dto.ts";

const lado = (isHome: boolean | null | undefined) => (isHome == null ? null : isHome ? "mandante" : "visitante") as "mandante" | "visitante" | null;

export function teamRef(id: number, nome: string): TimeRefV1 {
  return { id, nome, escudo: `/v1/imagens/time/${id}` };
}

function placar(h: number | null | undefined, a: number | null | undefined, hp?: number | null, ap?: number | null): PlacarV1 {
  const p: PlacarV1 = { mandante: h ?? null, visitante: a ?? null };
  if (hp != null || ap != null) { p.penaltisMandante = hp ?? null; p.penaltisVisitante = ap ?? null; }
  return p;
}

function resumo(x: { id: number; homeId: number; awayId: number; home: string; away: string; ts: number; raw: string; desc: string; hs: number | null; as: number | null; hp?: number | null; ap?: number | null; campeonato?: string; rodada?: number }): JogoResumoV1 {
  const j: JogoResumoV1 = {
    id: x.id, inicio: isoBrt(x.ts * 1000), inicioTs: x.ts, status: toStatusV1(x.raw, x.desc), statusTexto: x.desc,
    mandante: teamRef(x.homeId, x.home), visitante: teamRef(x.awayId, x.away), placar: placar(x.hs, x.as, x.hp, x.ap),
  };
  if (x.campeonato) j.campeonato = x.campeonato;
  if (x.rodada != null) j.rodada = x.rodada;
  return j;
}

export function fromChampionshipMatch(m: ChampionshipMatch, campeonato?: string): JogoResumoV1 {
  return resumo({ id: m.id, homeId: m.homeId, awayId: m.awayId, home: m.home, away: m.away, ts: m.timestamp, raw: m.status, desc: m.statusDesc, hs: m.homeScore, as: m.awayScore, hp: m.homePens, ap: m.awayPens, campeonato, rodada: m.round });
}

export function fromAgendaEvent(e: AgendaEvent): JogoResumoV1 {
  return resumo({ id: e.id, homeId: e.homeId, awayId: e.awayId, home: e.home, away: e.away, ts: e.timestamp, raw: e.statusType, desc: e.status, hs: e.homeScore, as: e.awayScore, campeonato: e.league });
}

export function fromTeamMatch(m: TeamMatch): JogoResumoV1 {
  return resumo({ id: m.id, homeId: m.homeId, awayId: m.awayId, home: m.home, away: m.away, ts: m.timestamp, raw: m.status, desc: m.statusText, hs: m.homeScore, as: m.awayScore, campeonato: m.league });
}

function eventBase(e: MatchEvent): Omit<JogoV1, "lances" | "narracao" | "estatisticas" | "penaltis"> {
  return {
    ...resumo({ id: e.id, homeId: e.homeId, awayId: e.awayId, home: e.home, away: e.away, ts: e.startTimestamp, raw: e.statusType, desc: e.statusDesc, hs: e.homeScore, as: e.awayScore, hp: e.homePens, ap: e.awayPens }),
    estadio: e.venue ? { nome: e.venue.stadium, cidade: e.venue.city, pais: e.venue.country } : null,
    arbitro: e.referee?.name || null,
    vencedor: e.winnerCode === 1 ? "mandante" : e.winnerCode === 2 ? "visitante" : null,
    inicioPeriodoTs: e.periodStart || 0,
  };
}

export function toJogo(l: MatchLive): JogoV1 {
  return {
    ...eventBase(l.event),
    lances: l.incidents.map((i) => ({ tipo: i.type, detalhe: i.cls, minuto: i.minute, acrescimo: i.addedTime, jogador: i.player, assistencia: i.assist, entrou: i.playerIn, saiu: i.playerOut, lado: lado(i.isHome), placarMandante: i.homeScore, placarVisitante: i.awayScore, texto: i.text })),
    narracao: l.commentary.map((c) => ({ id: c.id, tipo: c.type, texto: c.textPt || c.text, minuto: c.minute, rotuloMinuto: c.minuteLabel ?? null, lado: lado(c.isHome), jogador: c.player, html: c.html ?? null })),
    estatisticas: l.stats.map((s) => ({ nome: s.name, mandante: s.home, visitante: s.away })),
    penaltis: l.shootout.map((k) => ({ ordem: k.sequence, jogador: k.player, lado: k.isHome ? "mandante" : "visitante", converteu: k.scored, motivo: k.reason })),
  };
}

function escalacao(t: TeamLineup | null): EscalacaoV1 | null {
  if (!t) return null;
  const p = (x: TeamLineup["starters"][number]) => ({ id: x.id, nome: x.name, numero: x.number, posicao: x.position, nota: x.rating, capitao: x.captain, foto: `/v1/imagens/jogador/${x.id}` });
  return { formacao: t.formation, titulares: t.starters.map(p), reservas: t.bench.map(p) };
}

export function toJogoCompleto(d: MatchDetail): JogoCompletoV1 {
  return { ...toJogo(d), escalacoes: { confirmadas: d.lineupsConfirmed, mandante: escalacao(d.home), visitante: escalacao(d.away) } };
}

export function toDia(groups: AgendaLeagueGroup[], onlyLive = false): DiaCampeonatoV1[] {
  return groups
    .map((g) => ({ campeonato: g.league, jogos: g.events.filter((e) => !onlyLive || e.statusType === "inprogress").map(fromAgendaEvent) }))
    .filter((g) => g.jogos.length > 0);
}
```

- [ ] **Step 5: Implement `map-championship.ts`**
```ts
import type { ChampionshipData, RoundRef } from "@/types/tournament";
import type { Scorer } from "@/types/team";
import { fromChampionshipMatch, teamRef } from "./map-match.ts";
import type { CampeonatoResumoV1, CampeonatoV1, JogoResumoV1, ArtilheiroV1, RodadaRefV1 } from "./dto.ts";

type T = { slug: string; name: string; id: number; seasonId: number | null };
const FORM: Record<string, "V" | "E" | "D"> = { W: "V", D: "E", L: "D" };

export function toCampeonatoResumo(t: T): CampeonatoResumoV1 {
  return { slug: t.slug, nome: t.name, id: t.id, temporadaId: t.seasonId };
}

function rounds(d: ChampionshipData): RoundRef[] {
  if (d.roundList?.length) return d.roundList;
  return d.rounds.map((r) => ({ key: String(r), round: r, label: `Rodada ${r}`, knockout: false }));
}

export function hasLiveMatch(d: ChampionshipData): boolean {
  return Object.values(d.matchesByRound || {}).some((list) => list.some((m) => m.status === "inprogress"));
}

export function toCampeonato(t: T, d: ChampionshipData): CampeonatoV1 {
  const rodadas: RodadaRefV1[] = rounds(d).map((r) => ({ chave: r.key, numero: r.round, nome: r.label, mataMata: r.knockout }));
  return {
    ...toCampeonatoResumo(t),
    rodadaAtual: d.currentRoundKey || String(d.currentRound),
    rodadas,
    tabela: (d.standings || []).map((g) => ({
      nome: g.name,
      linhas: g.rows.map((r) => ({
        posicao: r.pos, time: teamRef(r.teamId, r.team), pontos: r.pts, jogos: r.matches, vitorias: r.wins,
        empates: r.draws, derrotas: r.losses, golsPro: r.gf, golsContra: r.ga, saldo: r.gd, zona: r.promo,
        variacao: r.posChange, ultimos: (r.recentForm || []).map((f) => FORM[f]).filter(Boolean),
      })),
    })),
    temJogoAoVivo: hasLiveMatch(d),
  };
}

export function toRodada(d: ChampionshipData, chave: string): JogoResumoV1[] | null {
  const list = d.matchesByRound?.[chave];
  if (!list) return null;
  return list.map((m) => fromChampionshipMatch(m, d.tournament.name)).sort((a, b) => a.inicioTs - b.inicioTs);
}

export function toArtilharia(list: Scorer[]): ArtilheiroV1[] {
  return list.map((s, i) => ({
    posicao: i + 1,
    jogador: { id: s.player.id, nome: s.player.name, foto: `/v1/imagens/jogador/${s.player.id}` },
    time: teamRef(s.team.id, s.team.name), gols: s.goals, nota: s.rating,
  }));
}
```

- [ ] **Step 6: Run and verify pass** — `npm test 2>&1 | tail -8` → `# fail 0`. Also `npm run typecheck` → no errors in `src/lib/public-api`.

- [ ] **Step 7: Commit**
```bash
git add src/lib/public-api/v1
git commit -m "feat(api-v1): conversores do contrato (campeonato, rodada, artilharia, jogo, dia)"
```

---

### Task 3: Chaves, cota e cache com coalescência

**Files:**
- Create: `src/lib/public-api/keys.ts`, `keys.test.ts`, `rate-limit.ts`, `rate-limit.test.ts`, `response-cache.ts`, `response-cache.test.ts`, `authorize.ts`, `authorize.test.ts`, `client-ip.ts`

**Interfaces:**
- Produces:
  - `interface ApiKeyRecord { id: string; nome: string; hash: string; prefixo: string; ipsPermitidos: string[]; cotaPorMinuto: number; ativa: boolean; criadaEm: string }`
  - `generateKey(): string` (`pdb_` + 40 chars `[A-Za-z0-9]`); `hashKey(k: string): string` (sha256 hex); `newRecord(nome: string, ips: string[], cota?: number): { key: string; record: ApiKeyRecord }`; `findKey(records: ApiKeyRecord[], key: string): ApiKeyRecord | null` (timing-safe compare)
  - `createRateLimiter(now?: () => number): { take(id: string, perMinute: number): { ok: true } | { ok: false; retryAfter: number } }`
  - `createResponseCache(now?: () => number): { get<T>(key: string, load: () => Promise<{ value: T; ttl: number }>): Promise<T> }` — erro na carga não é cacheado; carga concorrente compartilhada
  - `type AuthResult = { ok: true; record: ApiKeyRecord } | { ok: false; status: number; codigo: ErrorCode; mensagem: string; retryAfter?: number }`
  - `authorize(input: { key: string | null; ip: string | null; records: ApiKeyRecord[] }, limiter: ReturnType<typeof createRateLimiter>): AuthResult`
  - `clientIp(h: Headers): string | null` → `x-real-ip` ▸ `cf-connecting-ip` ▸ 1º de `x-forwarded-for`

- [ ] **Step 1: Write failing tests**

`src/lib/public-api/keys.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateKey, hashKey, newRecord, findKey } from "./keys.ts";

test("chave tem formato pdb_ + 40 alfanuméricos e é aleatória", () => {
  const a = generateKey(), b = generateKey();
  assert.match(a, /^pdb_[A-Za-z0-9]{40}$/);
  assert.notEqual(a, b);
});

test("registro guarda só hash e prefixo, nunca a chave", () => {
  const { key, record } = newRecord("Site novo", ["1.2.3.4"]);
  assert.equal(record.hash, hashKey(key));
  assert.equal(record.prefixo, key.slice(0, 8));
  assert.equal(JSON.stringify(record).includes(key), false);
  assert.equal(record.cotaPorMinuto, 600);
  assert.equal(record.ativa, true);
});

test("findKey acha pelo hash e rejeita chave errada", () => {
  const { key, record } = newRecord("x", ["*"]);
  assert.equal(findKey([record], key)?.id, record.id);
  assert.equal(findKey([record], key.slice(0, -1) + "Z"), null);
  assert.equal(findKey([record], ""), null);
});
```

`src/lib/public-api/rate-limit.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter } from "./rate-limit.ts";

test("token bucket: estoura na cota e recupera com o tempo", () => {
  let t = 0;
  const rl = createRateLimiter(() => t);
  for (let i = 0; i < 3; i++) assert.equal(rl.take("k", 3).ok, true);
  const r = rl.take("k", 3);
  assert.equal(r.ok, false);
  assert.ok(!r.ok && r.retryAfter >= 1);
  t += 20_000; // 20 s = 1 ficha (3/min)
  assert.equal(rl.take("k", 3).ok, true);
  assert.equal(rl.take("outra", 3).ok, true);
});
```

`src/lib/public-api/response-cache.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { createResponseCache } from "./response-cache.ts";

test("pedidos simultâneos = uma carga; respeita TTL", async () => {
  let t = 0, calls = 0;
  const c = createResponseCache(() => t);
  const load = async () => { calls++; await new Promise((r) => setTimeout(r, 5)); return { value: calls, ttl: 10 }; };
  const all = await Promise.all(Array.from({ length: 50 }, () => c.get("x", load)));
  assert.equal(calls, 1);
  assert.ok(all.every((v) => v === 1));
  t += 9_000; assert.equal(await c.get("x", load), 1);
  t += 2_000; assert.equal(await c.get("x", load), 2);
});

test("erro na carga não fica cacheado", async () => {
  const c = createResponseCache(() => 0);
  await assert.rejects(c.get("y", async () => { throw new Error("boom"); }));
  assert.equal(await c.get("y", async () => ({ value: "ok", ttl: 10 })), "ok");
});
```

`src/lib/public-api/authorize.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { authorize } from "./authorize.ts";
import { newRecord } from "./keys.ts";
import { createRateLimiter } from "./rate-limit.ts";

const { key, record } = newRecord("site", ["10.0.0.1"], 2);
const rl = () => createRateLimiter(() => 0);

test("sem chave = 401 chave_ausente", () => {
  const r = authorize({ key: null, ip: "10.0.0.1", records: [record] }, rl());
  assert.deepEqual([r.ok, !r.ok && r.status, !r.ok && r.codigo], [false, 401, "chave_ausente"]);
});
test("chave errada = 401 chave_invalida", () => {
  const r = authorize({ key: "pdb_x", ip: "10.0.0.1", records: [record] }, rl());
  assert.equal(!r.ok && r.codigo, "chave_invalida");
});
test("sem arquivo de chaves = 401 (falha fechada)", () => {
  const r = authorize({ key, ip: "10.0.0.1", records: [] }, rl());
  assert.equal(!r.ok && r.status, 401);
});
test("IP fora da lista = 403", () => {
  const r = authorize({ key, ip: "8.8.8.8", records: [record] }, rl());
  assert.deepEqual([!r.ok && r.status, !r.ok && r.codigo], [403, "ip_nao_autorizado"]);
});
test("IP ausente com lista restrita = 403", () => {
  assert.equal(!authorize({ key, ip: null, records: [record] }, rl()).ok, true);
});
test("chave desativada = 403", () => {
  const r = authorize({ key, ip: "10.0.0.1", records: [{ ...record, ativa: false }] }, rl());
  assert.equal(!r.ok && r.codigo, "chave_desativada");
});
test("'*' libera qualquer IP; cota estourada = 429 com retryAfter", () => {
  const open = { ...record, ipsPermitidos: ["*"] };
  const l = rl();
  assert.equal(authorize({ key, ip: "9.9.9.9", records: [open] }, l).ok, true);
  assert.equal(authorize({ key, ip: "9.9.9.9", records: [open] }, l).ok, true);
  const r = authorize({ key, ip: "9.9.9.9", records: [open] }, l);
  assert.deepEqual([!r.ok && r.status, !r.ok && r.codigo], [429, "limite_excedido"]);
  assert.ok(!r.ok && (r.retryAfter ?? 0) >= 1);
});
```

- [ ] **Step 2: Run and verify fail** — `npm test 2>&1 | tail -20` → FAIL (modules missing).

- [ ] **Step 3: Implement**

`src/lib/public-api/keys.ts`:
```ts
import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";

export interface ApiKeyRecord {
  id: string; nome: string; hash: string; prefixo: string;
  ipsPermitidos: string[]; cotaPorMinuto: number; ativa: boolean; criadaEm: string;
}

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateKey(): string {
  const bytes = randomBytes(40);
  let s = "";
  for (const b of bytes) s += ALPHA[b % ALPHA.length];
  return `pdb_${s}`;
}

export const hashKey = (k: string) => createHash("sha256").update(k).digest("hex");

export function newRecord(nome: string, ips: string[], cota = 600): { key: string; record: ApiKeyRecord } {
  const key = generateKey();
  return {
    key,
    record: { id: randomUUID(), nome, hash: hashKey(key), prefixo: key.slice(0, 8), ipsPermitidos: ips, cotaPorMinuto: cota, ativa: true, criadaEm: new Date().toISOString() },
  };
}

export function findKey(records: ApiKeyRecord[], key: string): ApiKeyRecord | null {
  if (!key) return null;
  const h = Buffer.from(hashKey(key), "hex");
  for (const r of records) {
    const rh = Buffer.from(r.hash || "", "hex");
    if (rh.length === h.length && timingSafeEqual(rh, h)) return r;
  }
  return null;
}
```

`src/lib/public-api/rate-limit.ts`:
```ts
// Token bucket por chave, em memória (um processo por container). Recarrega perMinute fichas/min.
export function createRateLimiter(now: () => number = Date.now) {
  const buckets = new Map<string, { tokens: number; at: number }>();
  return {
    take(id: string, perMinute: number): { ok: true } | { ok: false; retryAfter: number } {
      const t = now();
      const rate = perMinute / 60_000; // fichas por ms
      const b = buckets.get(id) ?? { tokens: perMinute, at: t };
      b.tokens = Math.min(perMinute, b.tokens + (t - b.at) * rate);
      b.at = t;
      buckets.set(id, b);
      if (b.tokens >= 1) { b.tokens -= 1; return { ok: true }; }
      return { ok: false, retryAfter: Math.max(1, Math.ceil((1 - b.tokens) / rate / 1000)) };
    },
  };
}
```

`src/lib/public-api/response-cache.ts`:
```ts
// Cache TTL em memória + coalescência: N pedidos simultâneos para a mesma chave = 1 carga.
// A carga decide o próprio TTL (ex.: jogo encerrado 24 h, ao vivo 10 s). Erro não é cacheado.
export function createResponseCache(now: () => number = Date.now, maxEntries = 5000) {
  const store = new Map<string, { value: unknown; exp: number }>();
  const inflight = new Map<string, Promise<unknown>>();
  return {
    async get<T>(key: string, load: () => Promise<{ value: T; ttl: number }>): Promise<T> {
      const hit = store.get(key);
      if (hit && hit.exp > now()) return hit.value as T;
      const pending = inflight.get(key);
      if (pending) return pending as Promise<T>;
      const p = (async () => {
        try {
          const { value, ttl } = await load();
          if (store.size >= maxEntries) store.delete(store.keys().next().value as string);
          store.set(key, { value, exp: now() + ttl * 1000 });
          return value;
        } finally {
          inflight.delete(key);
        }
      })();
      inflight.set(key, p);
      return p;
    },
  };
}
```

`src/lib/public-api/authorize.ts`:
```ts
import type { ErrorCode } from "./envelope.ts";
import { findKey, type ApiKeyRecord } from "./keys.ts";
import type { createRateLimiter } from "./rate-limit.ts";

export type AuthResult =
  | { ok: true; record: ApiKeyRecord }
  | { ok: false; status: number; codigo: ErrorCode; mensagem: string; retryAfter?: number };

export function authorize(
  input: { key: string | null; ip: string | null; records: ApiKeyRecord[] },
  limiter: ReturnType<typeof createRateLimiter>
): AuthResult {
  if (!input.key) return { ok: false, status: 401, codigo: "chave_ausente", mensagem: "Envie a chave no cabeçalho x-api-key." };
  const rec = findKey(input.records, input.key);
  if (!rec) return { ok: false, status: 401, codigo: "chave_invalida", mensagem: "Chave inválida." };
  if (!rec.ativa) return { ok: false, status: 403, codigo: "chave_desativada", mensagem: "Chave desativada." };
  const anyIp = rec.ipsPermitidos.includes("*");
  if (!anyIp && (!input.ip || !rec.ipsPermitidos.includes(input.ip)))
    return { ok: false, status: 403, codigo: "ip_nao_autorizado", mensagem: "IP de origem não autorizado para esta chave." };
  const t = limiter.take(rec.id, rec.cotaPorMinuto);
  if (!t.ok) return { ok: false, status: 429, codigo: "limite_excedido", mensagem: "Limite de pedidos por minuto excedido.", retryAfter: t.retryAfter };
  return { ok: true, record: rec };
}
```

`src/lib/public-api/client-ip.ts`:
```ts
// nginx do vhost api define X-Real-IP = IP real (via CF-Connecting-IP + set_real_ip_from da Cloudflare).
export function clientIp(h: Headers): string | null {
  const v = h.get("x-real-ip") || h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0];
  return v?.trim() || null;
}
```

- [ ] **Step 4: Run and verify pass** — `npm test 2>&1 | tail -8` → `# fail 0`.

- [ ] **Step 5: Commit**
```bash
git add src/lib/public-api
git commit -m "feat(api-v1): chaves com hash, IP permitido, cota por minuto e cache com coalescência"
```

---

### Task 4: Wrapper `withPublicApi`, store de chaves, uso e modo API sem fallback direto

**Files:**
- Create: `src/lib/public-api/keys-store.ts`, `src/lib/public-api/usage.ts`, `src/lib/public-api/with-public-api.ts`, `src/lib/public-api/v1/v1-error.ts`
- Modify: `src/lib/api/allsports.ts:253-254` (fallback direto)
- Test: `src/lib/api/direct-fallback.test.ts` (novo) + `src/lib/api/direct-fallback.ts` (novo, puro)

**Interfaces:**
- Consumes: `authorize`, `createRateLimiter`, `createResponseCache`, `clientIp`, `ok`, `fail`, `Meta`, `ApiKeyRecord`, `newRecord`.
- Produces:
  - `keys-store.ts`: `loadKeys(): Promise<ApiKeyRecord[]>` (cache 30 s; arquivo ausente/corrompido → `[]`); `saveKeys(list: ApiKeyRecord[]): Promise<void>` (grava `data/api-keys.json` atômico: tmp + rename; limpa o cache)
  - `usage.ts`: `recordUsage(keyId: string, route: string): void`; `readUsage(days: number): Promise<Record<string, Record<string, { total: number; rotas: Record<string, number>; ultimo: string }>>>` (data → keyId → ...). Dir = `process.env.PDB_API_STATE_DIR || join(cwd, "data-api")`, arquivo `usage/{AAAA-MM-DD}.json`, flush a cada 60 s, erros de escrita ignorados.
  - `with-public-api.ts`:
```ts
export interface V1Result { data: unknown; meta: Meta; ttl: number }
export { V1ErrorLike as V1Error }   // de ./v1/v1-error.ts (criado neste task)
export function withPublicApi<P>(routeName: string, handler: (req: Request, params: P) => Promise<V1Result>):
  (req: Request, ctx: { params: Promise<P> }) => Promise<Response>
export function withPublicApiRaw<P>(routeName: string, handler: (req: Request, params: P) => Promise<Response>):
  (req: Request, ctx: { params: Promise<P> }) => Promise<Response>   // auth+uso, sem cache JSON (imagens)
```
  - `direct-fallback.ts`: `allowDirectFallback(env: Record<string, string | undefined>): boolean` → `false` se `PDB_API_MODE === "1"`.

- [ ] **Step 1: Failing test for direct fallback** — `src/lib/api/direct-fallback.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { allowDirectFallback } from "./direct-fallback.ts";

test("container da API nunca cai para o fornecedor direto", () => {
  assert.equal(allowDirectFallback({ PDB_API_MODE: "1" }), false);
  assert.equal(allowDirectFallback({}), true);
  assert.equal(allowDirectFallback({ PDB_API_MODE: "0" }), true);
});
```
Run: `npm test 2>&1 | tail -10` → FAIL (module missing).

- [ ] **Step 2: Implement and wire**

`src/lib/api/direct-fallback.ts`:
```ts
// PDB_API_MODE=1 (container papodebola-api): se o proxy do dev estiver inacessível, NÃO consulta a
// RapidAPI direto — a camada de snapshot serve o disco. Só o dev fala com o fornecedor.
export function allowDirectFallback(env: Record<string, string | undefined>): boolean {
  return env.PDB_API_MODE !== "1";
}
```
In `src/lib/api/allsports.ts`, add import `import { allowDirectFallback } from "./direct-fallback";` at top, and replace:
```ts
    if (result.reason !== "unreachable") return { ok: false, data: null, outage: isOutage(result), skipped: false };
    console.warn(`SportsProxy unreachable, falling back to direct API: ${endpoint}`);
```
with:
```ts
    if (result.reason !== "unreachable") return { ok: false, data: null, outage: isOutage(result), skipped: false };
    if (!allowDirectFallback(process.env)) {
      console.warn(`API_MODE: proxy inacessível, sem fallback direto: ${endpoint}`);
      return { ok: false, data: null, outage: true, skipped: false };
    }
    console.warn(`SportsProxy unreachable, falling back to direct API: ${endpoint}`);
```
Run: `npm test 2>&1 | tail -5` → `# fail 0`.

- [ ] **Step 3: Implement `keys-store.ts`**
```ts
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import type { ApiKeyRecord } from "./keys.ts";

// Chaves da API pública no volume compartilhado. O painel do dev grava; o container da API só lê.
const FILE = join(process.cwd(), "data", "api-keys.json");
let cache: { at: number; list: ApiKeyRecord[] } | null = null;

export async function loadKeys(): Promise<ApiKeyRecord[]> {
  if (cache && Date.now() - cache.at < 30_000) return cache.list;
  let list: ApiKeyRecord[] = [];
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf-8"));
    if (Array.isArray(parsed)) list = parsed.filter((r) => r && typeof r.hash === "string" && Array.isArray(r.ipsPermitidos));
  } catch {
    list = []; // ausente/corrompido: falha fechada (todas as chamadas 401)
  }
  cache = { at: Date.now(), list };
  return list;
}

export async function saveKeys(list: ApiKeyRecord[]): Promise<void> {
  await mkdir(dirname(FILE), { recursive: true });
  const tmp = `${FILE}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(list, null, 2));
  await rename(tmp, FILE);
  cache = null;
}
```

- [ ] **Step 4: Implement `usage.ts`**
```ts
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

type Day = Record<string, { total: number; rotas: Record<string, number>; ultimo: string }>;
const DIR = join(process.env.PDB_API_STATE_DIR || join(process.cwd(), "data-api"), "usage");
const pending = new Map<string, Day>(); // data → uso ainda não gravado
let timer: ReturnType<typeof setInterval> | null = null;

const today = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export function recordUsage(keyId: string, route: string): void {
  const d = today();
  const day = pending.get(d) ?? {};
  const k = (day[keyId] ??= { total: 0, rotas: {}, ultimo: "" });
  k.total++;
  k.rotas[route] = (k.rotas[route] || 0) + 1;
  k.ultimo = new Date().toISOString();
  pending.set(d, day);
  if (!timer) { timer = setInterval(() => void flush(), 60_000); timer.unref?.(); }
}

async function flush(): Promise<void> {
  for (const [d, delta] of [...pending]) {
    pending.delete(d);
    try {
      await mkdir(DIR, { recursive: true });
      const file = join(DIR, `${d}.json`);
      let cur: Day = {};
      try { cur = JSON.parse(await readFile(file, "utf-8")); } catch { /* novo dia */ }
      for (const [id, v] of Object.entries(delta)) {
        const c = (cur[id] ??= { total: 0, rotas: {}, ultimo: "" });
        c.total += v.total;
        for (const [r, n] of Object.entries(v.rotas)) c.rotas[r] = (c.rotas[r] || 0) + n;
        c.ultimo = v.ultimo;
      }
      await writeFile(file, JSON.stringify(cur));
    } catch { /* volume ro (dev): uso não é registrado, não derruba nada */ }
  }
}

export async function readUsage(days: number): Promise<Record<string, Day>> {
  const out: Record<string, Day> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(Date.now() - 3 * 3600_000 - i * 86400_000).toISOString().slice(0, 10);
    try { out[d] = JSON.parse(await readFile(join(DIR, `${d}.json`), "utf-8")); } catch { /* sem uso */ }
  }
  return out;
}
```

- [ ] **Step 5: Implement `v1-error.ts` and `with-public-api.ts`**

`src/lib/public-api/v1/v1-error.ts` (puro, para os testes não carregarem o wrapper):
```ts
import type { ErrorCode } from "../envelope.ts";
export class V1ErrorLike extends Error {
  constructor(public status: number, public codigo: ErrorCode, message: string) { super(message); }
}
```

`src/lib/public-api/with-public-api.ts`:
```ts
import { ok, fail, type Meta } from "./envelope.ts";
import { authorize } from "./authorize.ts";
import { createRateLimiter } from "./rate-limit.ts";
import { createResponseCache } from "./response-cache.ts";
import { clientIp } from "./client-ip.ts";
import { loadKeys } from "./keys-store.ts";
import { recordUsage } from "./usage.ts";
import { V1ErrorLike } from "./v1/v1-error.ts";

export { V1ErrorLike as V1Error };
export interface V1Result { data: unknown; meta: Meta; ttl: number }

const limiter = createRateLimiter();
const cache = createResponseCache();

async function guard(req: Request, routeName: string): Promise<Response | null> {
  const auth = authorize({ key: req.headers.get("x-api-key"), ip: clientIp(req.headers), records: await loadKeys() }, limiter);
  if (!auth.ok) return fail(auth.status, auth.codigo, auth.mensagem, auth.retryAfter ? { "retry-after": String(auth.retryAfter) } : {});
  recordUsage(auth.record.id, routeName);
  return null;
}

function toError(e: unknown): Response {
  if (e instanceof V1ErrorLike) return fail(e.status, e.codigo, e.message);
  console.error("API_V1_ERROR", e);
  return fail(500, "erro_interno", "Erro interno.");
}

// Rotas JSON: auth → cache (chave = URL sem host) → handler → envelope.
export function withPublicApi<P>(routeName: string, handler: (req: Request, params: P) => Promise<V1Result>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const denied = await guard(req, routeName);
    if (denied) return denied;
    try {
      const params = await ctx.params;
      const u = new URL(req.url);
      const r = await cache.get(`${u.pathname}?${u.searchParams.toString()}`, async () => {
        const res = await handler(req, params);
        return { value: res, ttl: res.ttl };
      });
      return ok(r.data, r.meta);
    } catch (e) {
      return toError(e);
    }
  };
}

// Rotas binárias (imagens): auth + uso, o handler monta a Response.
export function withPublicApiRaw<P>(routeName: string, handler: (req: Request, params: P) => Promise<Response>) {
  return async (req: Request, ctx: { params: Promise<P> }): Promise<Response> => {
    const denied = await guard(req, routeName);
    if (denied) return denied;
    try {
      return await handler(req, await ctx.params);
    } catch (e) {
      return toError(e);
    }
  };
}
```
Note: `V1ErrorLike` thrown inside the cache loader is not cached (Task 3 guarantees errors aren't cached) — so 404s are recomputed each time; acceptable because 404 handlers fail fast on config lookups.

- [ ] **Step 6: Typecheck and test** — `npm run typecheck && npm test 2>&1 | tail -5` → no type errors, `# fail 0`.

- [ ] **Step 7: Commit**
```bash
git add src/lib/public-api src/lib/api/direct-fallback.ts src/lib/api/direct-fallback.test.ts src/lib/api/allsports.ts
git commit -m "feat(api-v1): wrapper withPublicApi (chave, IP, cota, cache, uso) e modo API sem fallback direto"
```

---

### Task 5: Rotas `/v1` de campeonatos e jogos

**Files:**
- Create: `src/app/v1/campeonatos/route.ts`, `src/app/v1/campeonatos/[slug]/route.ts`, `src/app/v1/campeonatos/[slug]/rodadas/[chave]/route.ts`, `src/app/v1/campeonatos/[slug]/artilharia/route.ts`, `src/app/v1/jogos/route.ts`, `src/app/v1/jogos/hoje/route.ts`, `src/app/v1/jogos/ao-vivo/route.ts`, `src/app/v1/jogos/[id]/route.ts`, `src/app/v1/jogos/[id]/ao-vivo/route.ts`, `src/app/v1/times/[id]/route.ts`
- Create: `src/lib/public-api/v1/sources.ts` (leitura comum: campeonato por slug, store de hoje, validação de id/data)
- Create: `src/lib/public-api/v1/validate.ts` (validação pura)
- Test: `src/lib/public-api/v1/validate.test.ts`

**Interfaces:**
- Consumes: `withPublicApi`, `V1Result` (Task 4), `V1ErrorLike` (`src/lib/public-api/v1/v1-error.ts`, Task 4); mappers (Task 2); `TTL`, `matchTtl`, `suggestedRefresh` (Task 1); `isoBrt`; `TOURNAMENT_BY_SLUG`, `TOURNAMENTS` (`@/lib/config`); `getChampionshipData` (`@/lib/data/championship`); `getScorersFor` (`@/lib/data/scorers`); `readSnapshot` (`@/lib/data/snapshot-store`); `getFootballAgendaForDay` (`@/lib/data/agenda`); `getMatchDetail`, `getMatchLive` (`@/lib/data/match-detail`); `getTeamNextEvents`, `getTeamPreviousEvents` (`@/lib/data/team`).
- Produces (`sources.ts`):
  - `parseId(raw: string): number` → lança `V1Error(400, "parametro_invalido")` se não for inteiro positivo ≤ 1e10
  - `parseDay(raw: string | null, now?: number): Date` → aceita só `AAAA-MM-DD` entre hoje−60 e hoje+30 dias (BRT), senão `V1Error(400)`; retorna `Date` ao meio-dia BRT do dia
  - `isStale(updatedAtIso: string | undefined, maxAgeSec: number, now?: number): boolean`
  - `championship(slug: string): Promise<{ t: Tournament; d: ChampionshipData }>` → 404 se slug fora de `TOURNAMENT_BY_SLUG`, 503 `indisponivel` se `getChampionshipData` vier null
  - `todayStore(): Promise<{ leagues: AgendaLeagueGroup[]; updatedAt: string | null }>` (lê `readSnapshot("agenda","football-today")`, descarta se `date` ≠ hoje BRT)

- [ ] **Step 1: Failing tests** — `src/lib/public-api/v1/validate.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseId, parseDay, isStale } from "./validate.ts";

test("parseId aceita inteiro positivo e rejeita o resto", () => {
  assert.equal(parseId("15526001"), 15526001);
  for (const bad of ["abc", "0", "-1", "1.5", "", "99999999999"]) assert.throws(() => parseId(bad), /inválid/);
});

test("parseDay só aceita AAAA-MM-DD dentro da janela", () => {
  const now = Date.UTC(2026, 10, 16, 15); // 16/11/2026 12h BRT
  assert.equal(parseDay("2026-11-20", now).toISOString(), "2026-11-20T15:00:00.000Z");
  for (const bad of ["20/11/2026", "2026-13-01", "1999-01-01", "2028-01-01", null]) assert.throws(() => parseDay(bad as any, now));
});

test("isStale compara idade com o limite", () => {
  const now = Date.parse("2026-11-16T18:00:00Z");
  assert.equal(isStale("2026-11-16T17:59:00Z", 300, now), false);
  assert.equal(isStale("2026-11-16T17:00:00Z", 300, now), true);
  assert.equal(isStale(undefined, 300, now), true);
});
```
Run `npm test 2>&1 | tail -10` → FAIL (module missing).

- [ ] **Step 2: Implement `validate.ts`**
```ts
import { V1ErrorLike } from "./v1-error.ts"; // criado no Task 4

export function parseId(raw: string): number {
  if (!/^\d{1,10}$/.test(raw || "") || Number(raw) <= 0) throw new V1ErrorLike(400, "parametro_invalido", "Id inválido.");
  return Number(raw);
}

export function parseDay(raw: string | null, now = Date.now()): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw || "");
  if (!m) throw new V1ErrorLike(400, "parametro_invalido", "Use data=AAAA-MM-DD.");
  const ms = Date.UTC(+m[1], +m[2] - 1, +m[3], 15); // 12h BRT
  const d = new Date(ms);
  if (d.getUTCMonth() !== +m[2] - 1) throw new V1ErrorLike(400, "parametro_invalido", "Data inválida.");
  const days = (ms - now) / 86400_000;
  if (days < -60 || days > 30) throw new V1ErrorLike(400, "parametro_invalido", "Data fora da janela (60 dias para trás, 30 para a frente).");
  return d;
}

export function isStale(updatedAtIso: string | undefined | null, maxAgeSec: number, now = Date.now()): boolean {
  const t = updatedAtIso ? Date.parse(updatedAtIso) : NaN;
  return !Number.isFinite(t) || now - t > maxAgeSec * 1000;
}
```
Run `npm test 2>&1 | tail -5` → pass.

- [ ] **Step 3: Implement `sources.ts`**
```ts
import { TOURNAMENT_BY_SLUG, type Tournament } from "@/lib/config";
import { getChampionshipData } from "@/lib/data/championship";
import { readSnapshot } from "@/lib/data/snapshot-store";
import type { ChampionshipData } from "@/types/tournament";
import type { AgendaLeagueGroup } from "@/lib/data/agenda";
import { V1ErrorLike } from "./v1-error.ts";

export { parseId, parseDay, isStale } from "./validate.ts";

export async function championship(slug: string): Promise<{ t: Tournament; d: ChampionshipData }> {
  const t = TOURNAMENT_BY_SLUG[slug];
  if (!t) throw new V1ErrorLike(404, "nao_encontrado", "Campeonato não encontrado.");
  const d = await getChampionshipData(slug);
  if (!d) throw new V1ErrorLike(503, "indisponivel", "Dados do campeonato ainda não coletados.");
  return { t, d };
}

const brToday = () => new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);

export async function todayStore(): Promise<{ leagues: AgendaLeagueGroup[]; updatedAt: string | null }> {
  const s = await readSnapshot<{ date: string; updatedAt: string; leagues: AgendaLeagueGroup[] }>("agenda", "football-today");
  if (!s || s.date !== brToday()) return { leagues: [], updatedAt: null };
  return { leagues: s.leagues || [], updatedAt: s.updatedAt };
}
```

- [ ] **Step 4: Implement routes.** Every file starts with:
```ts
export const dynamic = "force-dynamic"; // rota autenticada por chave; o cache é o do withPublicApi (nunca bate no fornecedor por acesso)
export const runtime = "nodejs";
```

`src/app/v1/campeonatos/route.ts`:
```ts
import { TOURNAMENTS } from "@/lib/config";
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { toCampeonatoResumo } from "@/lib/public-api/v1/map-championship";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("campeonatos", async () => ({
  data: Object.values(TOURNAMENTS).filter((t) => t.seasonId).map(toCampeonatoResumo),
  meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: 86400 },
  ttl: 3600,
}));
```

`src/app/v1/campeonatos/[slug]/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship, isStale } from "@/lib/public-api/v1/sources";
import { toCampeonato, hasLiveMatch } from "@/lib/public-api/v1/map-championship";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string }>("campeonato", async (_req, { slug }) => {
  const { t, d } = await championship(slug);
  const live = hasLiveMatch(d);
  const ttl = live ? TTL.campeonatoComJogo : TTL.campeonatoParado;
  return {
    data: toCampeonato(t, d),
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: isStale(d.updatedAt, 7200), proximaAtualizacaoSugerida: live ? 60 : 600 },
    ttl,
  };
});
```

`src/app/v1/campeonatos/[slug]/rodadas/[chave]/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship, isStale } from "@/lib/public-api/v1/sources";
import { toRodada, hasLiveMatch } from "@/lib/public-api/v1/map-championship";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string; chave: string }>("rodada", async (_req, { slug, chave }) => {
  const { d } = await championship(slug);
  const jogos = toRodada(d, decodeURIComponent(chave));
  if (!jogos) throw new V1ErrorLike(404, "nao_encontrado", "Rodada não encontrada.");
  const live = jogos.some((j) => j.status === "ao_vivo" || j.status === "intervalo") || hasLiveMatch(d);
  return {
    data: jogos,
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: isStale(d.updatedAt, 7200), proximaAtualizacaoSugerida: live ? 60 : 600 },
    ttl: live ? TTL.campeonatoComJogo : TTL.campeonatoParado,
  };
});
```

`src/app/v1/campeonatos/[slug]/artilharia/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship } from "@/lib/public-api/v1/sources";
import { toArtilharia } from "@/lib/public-api/v1/map-championship";
import { getScorersFor } from "@/lib/data/scorers";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string }>("artilharia", async (_req, { slug }) => {
  const { t, d } = await championship(slug);
  const list = d.topScorers?.length ? d.topScorers : await getScorersFor(t);
  return {
    data: toArtilharia(list || []),
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: false, proximaAtualizacaoSugerida: 3600 },
    ttl: 1800,
  };
});
```

`src/app/v1/jogos/hoje/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { todayStore, isStale } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-hoje", async () => {
  const { leagues, updatedAt } = await todayStore();
  return {
    data: toDia(leagues),
    meta: { atualizadoEm: isoBrt(updatedAt || Date.now()), desatualizado: isStale(updatedAt, 300), proximaAtualizacaoSugerida: 30 },
    ttl: TTL.hoje,
  };
});
```

`src/app/v1/jogos/ao-vivo/route.ts`: same as `hoje` but `routeName "jogos-ao-vivo"`, `data: toDia(leagues, true)`, `proximaAtualizacaoSugerida: 10`, `ttl: TTL.aoVivo`.
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { todayStore, isStale } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-ao-vivo", async () => {
  const { leagues, updatedAt } = await todayStore();
  return {
    data: toDia(leagues, true),
    meta: { atualizadoEm: isoBrt(updatedAt || Date.now()), desatualizado: isStale(updatedAt, 300), proximaAtualizacaoSugerida: 10 },
    ttl: TTL.aoVivo,
  };
});
```

`src/app/v1/jogos/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseDay } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { getFootballAgendaForDay } from "@/lib/data/agenda";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-data", async (req) => {
  const day = parseDay(new URL(req.url).searchParams.get("data"));
  const past = day.getTime() < Date.now() - 86400_000;
  const groups = await getFootballAgendaForDay(day);
  return {
    data: toDia(groups),
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: past ? 86400 : 600 },
    ttl: past ? TTL.diaPassado : TTL.diaFuturo,
  };
});
```

`src/app/v1/jogos/[id]/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { toJogoCompleto } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { matchTtl, suggestedRefresh } from "@/lib/public-api/v1/ttl";
import { getMatchDetail } from "@/lib/data/match-detail";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ id: string }>("jogo", async (_req, { id }) => {
  const d = await getMatchDetail(parseId(id));
  if (!d) throw new V1ErrorLike(404, "nao_encontrado", "Jogo não encontrado.");
  const j = toJogoCompleto(d);
  return {
    data: j,
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: !!d.stale, proximaAtualizacaoSugerida: suggestedRefresh(j.status) },
    ttl: matchTtl(j.status),
  };
});
```

`src/app/v1/jogos/[id]/ao-vivo/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { toJogo } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { matchTtl, suggestedRefresh } from "@/lib/public-api/v1/ttl";
import { getMatchLive, getMatchDetail } from "@/lib/data/match-detail";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Enxuto para polling. Fornecedor fora → cai para o snapshot do jogo (getMatchDetail) e marca desatualizado.
export const GET = withPublicApi<{ id: string }>("jogo-ao-vivo", async (_req, { id }) => {
  const mid = parseId(id);
  const live = await getMatchLive(mid);
  const src = live ?? (await getMatchDetail(mid));
  if (!src) throw new V1ErrorLike(404, "nao_encontrado", "Jogo não encontrado.");
  const j = toJogo(src);
  return {
    data: j,
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: !live, proximaAtualizacaoSugerida: suggestedRefresh(j.status) },
    ttl: matchTtl(j.status),
  };
});
```

`src/app/v1/times/[id]/route.ts`:
```ts
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { fromTeamMatch, teamRef } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { TTL } from "@/lib/public-api/v1/ttl";
import { getTeamNextEvents, getTeamPreviousEvents } from "@/lib/data/team";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ id: string }>("time", async (_req, { id }) => {
  const tid = parseId(id);
  const [next, prev] = await Promise.all([getTeamNextEvents(tid), getTeamPreviousEvents(tid)]);
  const any = next[0] ?? prev[0];
  if (!any) throw new V1ErrorLike(404, "nao_encontrado", "Time não encontrado ou sem jogos.");
  const nome = any.homeId === tid ? any.home : any.away;
  return {
    data: { ...teamRef(tid, nome), proximos: next.map(fromTeamMatch), ultimos: prev.map(fromTeamMatch) },
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: 600 },
    ttl: TTL.time,
  };
});
```

- [ ] **Step 5: Regenerate reserved paths, typecheck, test**

Run: `npm run gen:paths && npm run typecheck && npm test 2>&1 | tail -5`
Expected: `reserved-paths.generated.ts` now contains `"v1"`; no type errors; `# fail 0`.

- [ ] **Step 6: Local smoke test** (sem chave dá 401; com chave de teste em `data/api-keys.json` local)

```bash
node -e 'import("./src/lib/public-api/keys.ts").then(({newRecord})=>{const {key,record}=newRecord("local",["*"]);require("fs").writeFileSync("data/api-keys.json",JSON.stringify([record]));console.log(key)})' --experimental-strip-types > /tmp/pdbkey.txt
npm run dev   # outra janela
curl -s localhost:3000/v1/campeonatos | head -c 200                      # → {"erro":{"codigo":"chave_ausente",...
curl -s -H "x-api-key: $(cat /tmp/pdbkey.txt)" localhost:3000/v1/campeonatos | head -c 300   # → {"data":[{"slug":"brasileirao-serie-a"...
curl -s -H "x-api-key: $(cat /tmp/pdbkey.txt)" localhost:3000/v1/jogos/abc   # → 400 parametro_invalido
curl -s -H "x-api-key: $(cat /tmp/pdbkey.txt)" localhost:3000/v1/campeonatos/nao-existe   # → 404 nao_encontrado
```
Delete the local `data/api-keys.json` afterwards (`data/` is not committed — confirm with `git status`).

- [ ] **Step 7: Commit**
```bash
git add src/app/v1 src/lib/public-api src/cms/lib/reserved-paths.generated.ts
git commit -m "feat(api-v1): rotas de campeonatos, rodadas, artilharia, jogos (dia, hoje, ao vivo, detalhe) e times"
```

---

### Task 6: Imagens e documentação (`/v1/imagens/*`, `/v1/docs`, OpenAPI)

**Files:**
- Create: `src/app/v1/imagens/time/[id]/route.ts`, `src/app/v1/imagens/jogador/[id]/route.ts`, `src/lib/public-api/v1/image.ts`, `src/lib/public-api/v1/openapi.yaml`, `src/app/v1/docs/route.ts`
- Test: `src/lib/public-api/v1/image.test.ts`

**Interfaces:**
- Consumes: `withPublicApiRaw`, `parseId`.
- Produces: `imageType(buf: Uint8Array): "image/png" | "image/webp" | "image/jpeg" | null`; `serveImage(kind: "team" | "player", id: number): Promise<Response>` — disco (`data/team-images/{id}.png` ou `data/player-images/{id}.{png,jpg,webp}` — verificar nomes com `ls` no Step 2) ▸ origem `PDB_IMG_ORIGIN` (default `http://127.0.0.1:3000`) em `/api/team-img/{id}` | `/api/player-img/{id}` ▸ 404 JSON. Nunca grava em disco.

- [ ] **Step 1: Failing test** — `src/lib/public-api/v1/image.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { imageType } from "./image-type.ts";

test("detecta png/webp/jpeg pelos magic bytes", () => {
  assert.equal(imageType(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), "image/png");
  assert.equal(imageType(new Uint8Array([...Buffer.from("RIFF"), 0, 0, 0, 0, ...Buffer.from("WEBP")])), "image/webp");
  assert.equal(imageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(imageType(new Uint8Array([1, 2, 3])), null);
});
```
Run → FAIL.

- [ ] **Step 2: Check file naming on disk**

Run: `sed -n 1,30p "src/app/api/player-img/[id]/route.ts"` and note the directory and extension used for player photos. Use exactly that in `image.ts` (`PLAYER_FILE`).

- [ ] **Step 3: Implement** `src/lib/public-api/v1/image-type.ts`:
```ts
export function imageType(b: Uint8Array): "image/png" | "image/webp" | "image/jpeg" | null {
  if (b[0] === 0x89 && b[1] === 0x50) return "image/png";
  if (b[0] === 0xff && b[1] === 0xd8) return "image/jpeg";
  if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 4)) === "RIFF" && String.fromCharCode(...b.subarray(8, 12)) === "WEBP") return "image/webp";
  return null;
}
```
`src/lib/public-api/v1/image.ts`:
```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { imageType } from "./image-type.ts";
import { fail } from "../envelope.ts";

const DIRS = { team: join(process.cwd(), "data", "team-images"), player: join(process.cwd(), "data", "player-images") };
const ROUTE = { team: "team-img", player: "player-img" };
const CC = "public, max-age=2592000";

// Disco primeiro; se não houver, pede à rota do site (no container da API, PDB_IMG_ORIGIN aponta para o dev,
// que baixa e grava no volume). A API nunca grava.
export async function serveImage(kind: "team" | "player", id: number): Promise<Response> {
  try {
    const buf = await readFile(join(DIRS[kind], `${id}.png`)); // ajustar para o nome visto no Step 2
    const ct = imageType(buf);
    if (ct) return new Response(new Uint8Array(buf), { headers: { "content-type": ct, "cache-control": CC } });
  } catch { /* não está no disco */ }
  const origin = process.env.PDB_IMG_ORIGIN || "http://127.0.0.1:3000";
  try {
    const r = await fetch(`${origin}/api/${ROUTE[kind]}/${id}`, { redirect: "manual", signal: AbortSignal.timeout(8000) });
    if (r.ok) {
      const buf = new Uint8Array(await r.arrayBuffer());
      const ct = imageType(buf);
      if (ct) return new Response(buf, { headers: { "content-type": ct, "cache-control": CC } });
    }
  } catch { /* origem fora */ }
  return fail(404, "nao_encontrado", "Imagem não encontrada.");
}
```
Routes:
```ts
// src/app/v1/imagens/time/[id]/route.ts
import { withPublicApiRaw } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { serveImage } from "@/lib/public-api/v1/image";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const GET = withPublicApiRaw<{ id: string }>("imagem-time", async (_req, { id }) => serveImage("team", parseId(id)));
```
```ts
// src/app/v1/imagens/jogador/[id]/route.ts
import { withPublicApiRaw } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { serveImage } from "@/lib/public-api/v1/image";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const GET = withPublicApiRaw<{ id: string }>("imagem-jogador", async (_req, { id }) => serveImage("player", parseId(id)));
```

- [ ] **Step 4: OpenAPI + docs page**

Write `src/lib/public-api/v1/openapi.yaml` (OpenAPI 3.1) with: `servers: [{url: https://api.papodebola.com.br}]`, `components.securitySchemes.chave: {type: apiKey, in: header, name: x-api-key}`, global `security: [{chave: []}]`, schemas `Meta`, `Erro` and every DTO from Task 2 `dto.ts` (same field names/types), and one path per route from Task 5/6 with params, `200` (envelope with `data` schema), `400/401/403/404/429/503` → `Erro`. Each path gets one `example`.

`src/app/v1/docs/route.ts` (pública, sem dados):
```ts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export async function GET() {
  const yaml = await readFile(join(process.cwd(), "src/lib/public-api/v1/openapi.yaml"), "utf-8");
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>API Papo de Bola v1</title>
<style>body{font:15px/1.5 system-ui;max-width:960px;margin:24px auto;padding:0 16px;background:#F2F3F5;color:#111}pre{background:#fff;padding:16px;overflow:auto;border-radius:8px}</style></head>
<body><h1>API Papo de Bola — v1</h1><p>Autenticação: cabeçalho <code>x-api-key</code>, chamado pelo servidor (nunca pelo navegador). Respostas: <code>{ data, meta }</code>. Use <code>meta.proximaAtualizacaoSugerida</code> como intervalo de polling.</p>
<pre>${esc(yaml)}</pre></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" } });
}
```
The Dockerfile must copy `src/lib/public-api/v1/openapi.yaml` into the runtime image: check `Dockerfile` (`grep -n "COPY" Dockerfile`). If the runner stage only copies `.next/standalone`, add `COPY --from=builder /app/src/lib/public-api/v1/openapi.yaml ./src/lib/public-api/v1/openapi.yaml` in the runner stage.

- [ ] **Step 5: gen:paths, typecheck, test, smoke**

Run: `npm run gen:paths && npm run typecheck && npm test 2>&1 | tail -5`, then with `npm run dev`: `curl -s -o /dev/null -w '%{http_code} %{content_type}\n' -H "x-api-key: $(cat /tmp/pdbkey.txt)" localhost:3000/v1/imagens/time/1963` → `200 image/png` (or webp); `curl -s localhost:3000/v1/docs | head -5` → HTML.

- [ ] **Step 6: Commit**
```bash
git add src/app/v1 src/lib/public-api Dockerfile src/cms/lib/reserved-paths.generated.ts
git commit -m "feat(api-v1): escudos e fotos do disco, OpenAPI e página /v1/docs"
```

---

### Task 7: Aba "API" no painel (chaves e uso)

**Files:**
- Create: `src/app/api/painel-api-keys/route.ts`, `src/app/(site)/painel-pdb-9x/api/page.tsx`
- Modify: `src/middleware.ts` (`protectedPaths` e `matcher`: adicionar `/api/painel-api-keys`), `src/app/(site)/painel-pdb-9x/layout.tsx` (aba)

**Interfaces:**
- Consumes: `getSession` (`@/lib/auth/jwt`), `loadKeys`, `saveKeys`, `newRecord`, `readUsage`.
- Produces: `GET /api/painel-api-keys` → `{ keys: Omit<ApiKeyRecord,"hash">[], usage: Record<date, Record<keyId, {...}>> }`; `POST` `{nome, ips: string[], cota?}` → `{ key, record }` (key exibida uma vez); `PATCH` `{id, ativa?, ips?, cota?, rotate?: true}` → `{ ok, key? }`.

- [ ] **Step 1: Route**
```ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { loadKeys, saveKeys } from "@/lib/public-api/keys-store";
import { newRecord, generateKey, hashKey } from "@/lib/public-api/keys";
import { readUsage } from "@/lib/public-api/usage";
export const dynamic = "force-dynamic";

const IP_RE = /^(\*|(\d{1,3}\.){3}\d{1,3}|[0-9a-f:]+)$/i;
const cleanIps = (v: unknown) => (Array.isArray(v) ? v : String(v || "").split(/[\s,]+/)).map((s) => String(s).trim()).filter((s) => s && IP_RE.test(s));
const strip = <T extends { hash: string }>({ hash: _h, ...r }: T) => r;

export async function GET() {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const [keys, usage] = await Promise.all([loadKeys(), readUsage(14)]);
  return NextResponse.json({ keys: keys.map(strip), usage });
}

export async function POST(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const b = await req.json();
  const nome = String(b.nome || "").trim().slice(0, 80);
  const ips = cleanIps(b.ips);
  if (!nome || !ips.length) return NextResponse.json({ error: "nome e ao menos um IP são obrigatórios" }, { status: 400 });
  const { key, record } = newRecord(nome, ips, Math.min(Math.max(Number(b.cota) || 600, 10), 6000));
  await saveKeys([...(await loadKeys()), record]);
  return NextResponse.json({ key, record: strip(record) });
}

export async function PATCH(req: NextRequest) {
  if (!(await getSession())) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const b = await req.json();
  const list = await loadKeys();
  const r = list.find((x) => x.id === b.id);
  if (!r) return NextResponse.json({ error: "chave não encontrada" }, { status: 404 });
  if (typeof b.ativa === "boolean") r.ativa = b.ativa;
  if (b.ips !== undefined) { const ips = cleanIps(b.ips); if (ips.length) r.ipsPermitidos = ips; }
  if (b.cota !== undefined) r.cotaPorMinuto = Math.min(Math.max(Number(b.cota) || 600, 10), 6000);
  let key: string | undefined;
  if (b.rotate === true) { key = generateKey(); r.hash = hashKey(key); r.prefixo = key.slice(0, 8); }
  await saveKeys(list);
  return NextResponse.json({ ok: true, ...(key ? { key } : {}) });
}
```
Note: `loadKeys` caches 30 s; `saveKeys` resets the cache in this process; the API container picks up changes within 30 s.

- [ ] **Step 2: Middleware** — in `src/middleware.ts`, add `"/api/painel-api-keys"` to `protectedPaths` and `"/api/painel-api-keys/:path*"` to `config.matcher` (next to `/api/transmissoes`).

- [ ] **Step 3: Panel tab** — in `layout.tsx`, import `KeyRound` from `lucide-react` and add after Transmissões: `{ href: "/painel-pdb-9x/api", label: "API", icon: KeyRound },`.

- [ ] **Step 4: Page** `src/app/(site)/painel-pdb-9x/api/page.tsx` — client component following the Transmissões page style (`Button`, `Input` from `@/components/ui`):
  - Form "Nova chave": Nome, IPs (texto, separados por vírgula), Cota/min (padrão 600) → `POST`; on success, show the returned `key` in a highlighted box with "Copiar" (`navigator.clipboard.writeText`) and the text "Guarde agora: ela não aparece de novo."
  - Table of keys: nome, prefixo + "…", IPs, cota, ativa, criada em, uso hoje (`usage[hoje][id].total`), último acesso; actions: Ativar/Desativar (`PATCH {id, ativa}`), Trocar chave (`PATCH {id, rotate:true}` with `useConfirm()` from `src/components/studio/use-confirm.tsx`, shows new key once), Editar IPs (inline input → `PATCH {id, ips}`).
  - Footer line with the link `/v1/docs`.
  - Font sizes per `padrao_legibilidade_fonte` (no `text-[10px]/[11px]`); no new icons beyond the tab icon.

- [ ] **Step 5: gen:paths, typecheck, test** — `npm run gen:paths && npm run typecheck && npm test 2>&1 | tail -5` → clean.

- [ ] **Step 6: Commit**
```bash
git add src/app/api/painel-api-keys "src/app/(site)/painel-pdb-9x" src/middleware.ts src/cms/lib/reserved-paths.generated.ts
git commit -m "feat(painel): aba API — criar, desativar e trocar chaves da API pública e ver o uso"
```

---

### Task 8: Publicar no development e validar

- [ ] **Step 1:** `git pushdev` (push + rebuild do dev). Wait for the rebuild log: `ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 "tail -5 \$(ls -t /home/ivan/papodebola-next-dev/logs/rebuild_*.log | head -1)"` → health check OK. Check the build log shows the `/v1/*` routes as `ƒ` (expected: authenticated handlers) and that pages kept their `●`.
- [ ] **Step 2:** Log into the dev panel, open **API**, create key "Teste dev" with IP `*`. Save the key in the scratchpad only.
- [ ] **Step 3:** From the local machine, run against `https://development.papodebola.com.br`:
```bash
K=<chave>; B=https://development.papodebola.com.br
for p in /v1/campeonatos /v1/campeonatos/brasileirao-serie-a /v1/campeonatos/brasileirao-serie-a/rodadas/34 /v1/campeonatos/brasileirao-serie-a/artilharia /v1/jogos/hoje /v1/jogos/ao-vivo "/v1/jogos?data=2026-11-18" /v1/times/1963; do
  printf '%-60s ' "$p"; curl -s -o /dev/null -w '%{http_code} %{time_total}s\n' -H "x-api-key: $K" "$B$p"; done
curl -s -o /dev/null -w '%{http_code}\n' "$B/v1/campeonatos"                 # 401
curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: $K" "$B/v1/jogos/abc"   # 400
curl -s -o /dev/null -w '%{http_code}\n' -H "x-api-key: $K" "$B/v1/campeonatos/xyz"  # 404
```
Expected: all 200 (except the negative checks), a finished match id from the round response returns `/v1/jogos/{id}` with `lances` non-empty, and Série D (`brasileirao-serie-d`) returns multiple `tabela` groups.
- [ ] **Step 4:** Deactivate "Teste dev" in the panel; confirm the same key now returns 403 `chave_desativada` within 30 s.
- [ ] **Step 5:** Tell Ivan it is ready on dev and wait for his ok before promoting.

---

### Task 9: Infra do container `papodebola-api` (servidor) e promote

**Files (servidor, fora do git):**
- Create: `/home/ivan/papodebola-api/docker-compose.yml`
- Modify: `/home/ivan/papodebola-next/rebuild.sh` (recriar a API depois da prod), `/home/ivan/papodebola-next-dev/docker-compose.override.yml` (montar `pdb-api-state:ro`)
- Create: `/www/server/panel/vhost/nginx/api.papodebola.com.br.conf`
- Create (repo): `docs/knowledge/2026-11-16-api-publica.md`; Modify: `CLAUDE.md`

- [ ] **Step 1: Promote** — only after Ivan's ok: `git promote` (use `nohup` on the server if long, per handoff 02/10). Confirm prod health.
- [ ] **Step 2: Volume + compose** (backup first: none exists). On the server:
```bash
docker volume create pdb-api-state
mkdir -p /home/ivan/papodebola-api && cat > /home/ivan/papodebola-api/docker-compose.yml <<'EOF'
services:
  api:
    image: papodebola-next-nextjs:latest
    container_name: papodebola-api
    restart: unless-stopped
    ports: ["127.0.0.1:3002:3000"]
    env_file: [/home/ivan/papodebola-next/.env.local]
    environment:
      PDB_API_MODE: "1"
      PDB_API_STATE_DIR: /app/data-api
      PDB_IMG_ORIGIN: http://host.docker.internal:3001
    volumes:
      - papodebola-next_pdb-data:/app/data:ro
      - pdb-api-state:/app/data-api
    extra_hosts: ["host.docker.internal:host-gateway"]
    networks: [pdb-net]
    mem_limit: 512m
volumes:
  papodebola-next_pdb-data: { external: true }
  pdb-api-state: { external: true }
networks:
  pdb-net: { external: true }
EOF
cd /home/ivan/papodebola-api && docker compose up -d && sleep 5 && curl -s -o /dev/null -w '%{http_code}\n' 127.0.0.1:3002/v1/campeonatos   # 401
```
Confirm the image name with `docker images | grep papodebola-next` before `up` and adjust `image:` if different.
- [ ] **Step 3: Dev override** — add `- pdb-api-state:/app/data-api:ro` to the dev service `volumes` and `pdb-api-state: { external: true }` under `volumes:` in `/home/ivan/papodebola-next-dev/docker-compose.override.yml` (backup `*.bak.20261116`), then `cd /home/ivan/papodebola-next-dev && docker compose up -d`.
- [ ] **Step 4: rebuild.sh da prod** — backup, then append after the prod health check succeeds: `(cd /home/ivan/papodebola-api && docker compose up -d --force-recreate) || echo "WARN: api nao recriada"`. The rollback branch of the script must also run the same line after re-tagging `:previous`.
- [ ] **Step 5: nginx vhost** `api.papodebola.com.br.conf` (backup none; test with `nginx -t` before reload):
```nginx
limit_req_zone $binary_remote_addr zone=pdb_api:10m rate=20r/s;
server {
    listen 80;
    server_name api.papodebola.com.br;
    # Só Cloudflare (https://www.cloudflare.com/ips-v4 e ips-v6 — colar a lista atual)
    include /www/server/panel/vhost/nginx/cloudflare-allow.inc;   # allow <cada faixa>; ... deny all;
    real_ip_header CF-Connecting-IP;
    include /www/server/panel/vhost/nginx/cloudflare-realip.inc;  # set_real_ip_from <cada faixa>;
    location /v1/ {
        limit_req zone=pdb_api burst=40 nodelay;
        limit_req_status 429;
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_read_timeout 30s;
        proxy_cache off;
    }
    location / { return 404; }
}
```
Generate both `.inc` files from `curl -s https://www.cloudflare.com/ips-v4; curl -s https://www.cloudflare.com/ips-v6`. If the server's nginx runs in the `signsimples-nginx-1` container rather than aaPanel's, check first where `development.papodebola.com.br.conf` is actually loaded (`docker exec signsimples-nginx-1 nginx -T | grep -n server_name | head`) and put the vhost in the same place. SSL: Cloudflare Flexible like dev (HTTP on origin) unless Ivan prefers Full with a certificate.
- [ ] **Step 6: Cloudflare (Ivan, no dashboard)** — send Ivan these exact steps: (1) DNS: `A api → 138.117.60.14`, proxied (laranja). (2) Security → WAF → Custom rule "API sem chave": `(http.host eq "api.papodebola.com.br" and not any(http.request.headers.names[*] eq "x-api-key"))` → Block. (3) Rate limiting rule: host `api.papodebola.com.br`, 300 requests / 10 s per IP → Block 60 s. (4) SSL/TLS: Flexible for this host (Configuration Rule) if the origin has no certificate.
- [ ] **Step 7: Key do site novo** — in the prod/dev panel, create key "Site novo" with the IP of Ivan's new server (ask him), cota 600. Deliver key privately + `https://api.papodebola.com.br/v1/docs`.
- [ ] **Step 8: Verify on prod**
```bash
curl -s -o /dev/null -w '%{http_code}\n' https://api.papodebola.com.br/v1/campeonatos           # 403 (WAF, sem chave)
curl -s -o /dev/null -w '%{http_code}\n' -H 'x-api-key: pdb_x' https://api.papodebola.com.br/v1/campeonatos  # 401
curl -s -o /dev/null -w '%{http_code}\n' --resolve api.papodebola.com.br:80:138.117.60.14 http://api.papodebola.com.br/v1/campeonatos  # 403 (nginx: não é Cloudflare)
curl -s -o /dev/null -w '%{http_code}\n' https://api.papodebola.com.br/cms   # 404
ssh ... "docker logs papodebola-api 2>&1 | grep -ci rapidapi"   # 0 chamadas diretas
```
With a temporary key (IP `*`): one call per route returns 200, then deactivate it.
- [ ] **Step 9: Docs** — write `docs/knowledge/2026-11-16-api-publica.md` (arquitetura, onde ficam chaves/uso, como adicionar rota nova: conversor + rota com `withPublicApi` + TTL + teste + `openapi.yaml`, regra de nunca fallback direto, checklist de verificação) and add a section "API pública /v1" to `CLAUDE.md` (container `papodebola-api` :3002, vhost `api`, volume `pdb-api-state`, `PDB_API_MODE`, aba API do painel, rebuild.sh recria a API). Add a memory file `api_publica_v1.md` + pointer in `MEMORY.md`. Commit, `git pushdev`, and promote together with the next change (docs only).
```bash
git add docs/knowledge/2026-11-16-api-publica.md CLAUDE.md
git commit -m "docs: API pública /v1 (container, chaves, como incluir rota nova)"
```

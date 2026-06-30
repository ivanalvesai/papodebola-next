---
area: data
data: 2026-06-09
arquivos:
  - src/lib/data/scorers.ts
  - src/lib/api/allsports.ts
  - src/app/api/sports-proxy/[...path]/route.ts
---

# API: artilharia da Copa (endpoint statistics) e arquitetura de proxy

## getWorldCupScorers() — 1 request, já ordenada por gols

Função nova em `src/lib/data/scorers.ts`. A AllSportsApi **não tem** endpoint de artilharia
de torneio (`top-players/overall` retorna "does not exist"). A artilharia do Brasileirão é
por time (`team/.../best-players`), o que para 48 seleções seria muita request.

**Endpoint que funciona (1 request):**
```
tournament/16/season/58210/statistics?order=-goals&limit=20&accumulation=total&group=summary
```
Retorna `results[]` com `goals`, `player` (nome+id) e `team` (país). Já ordenado por gols.
Antes da Copa começar retorna `{"results":[]}` (HTTP 200) → popula sozinho no 1º gol.
IDs da Copa: tournament **16**, season **58210**. Nome do país traduzido via `translateCountry`.

## Arquitetura de proxy (economia de quota) — confirmação importante

- **PROD consulta os esportes via proxy → DEV** (`SPORTS_PROXY_URL` aponta para o container
  dev). O dev é o cache da API; assim a AllSportsApi não é consultada 2x (dev + prod).
- A `sports-proxy` (`src/app/api/sports-proxy/[...path]/route.ts`) **repassa a query string**
  (`request.nextUrl.search`), então endpoints com `?order=-goals&...` funcionam via proxy.
- `fetchAllSports` (`src/lib/api/allsports.ts`) monta `${base}/${endpoint}` — passar a query
  string no endpoint funciona nos dois caminhos (proxy e direto).
- Qualquer nova função de dados que use `fetchAllSports` herda esse comportamento de
  proxy/cache automaticamente — não gasta quota em dobro.

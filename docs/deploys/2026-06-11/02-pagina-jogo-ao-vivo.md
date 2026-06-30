---
area: feature-jogo-ao-vivo
data: 2026-06-11
---

# Página de jogo ao vivo da Copa (estilo ge.globo)

## Rota e resolução
`/futebol/copa-do-mundo/jogo/[data]/[slug]` — ex: `/futebol/copa-do-mundo/jogo/11-06-2026/mexico-africa-do-sul`.
- `data` = `DD-MM-YYYY` no fuso de Brasília; `slug` = `{casaSlug}-{foraSlug}`.
- Resolve varrendo os fixtures da Copa (`getWorldCupFixtures`, rounds 1-3) e comparando
  `matchDateSlug` + `matchPairSlug` — evita o split ambíguo de hífen (ex: "africa-do-sul").
- Slug das seleções: `selecaoSlugById` em `src/lib/selecoes.ts` (id Sofascore → nome PT → slug).
- Helpers de URL **puros** (client-safe, sem import de servidor): `src/lib/world-cup-match-url.ts`.
- Slug inválido → `notFound()` (renderiza "Jogo não encontrado"; é soft-404/HTTP 200, limitação
  do Next em rota dinâmica — `generateStaticParams` não serve porque o build pula a API).

## Camada de dados — `src/lib/data/match-detail.ts`
Endpoints AllSportsApi/Sofascore (forma `match/{id}`):
- `match/{id}` → event (placar, status, tempo)
- `match/{id}/incidents` → gols/cartões/subs (estruturado, **sempre completo**)
- `match/{id}/commentary` → lance a lance em texto (EN); **o GOL vem como `scoreChange`**
- `match/{id}/lineups` → formação + jogadores (com `confirmed`)
- `match/{id}/statistics` → posse, finalizações etc.
- `getMatchGroup(homeId, awayId)` → classificação do grupo do jogo.
- TTL adaptativo via `liveTtl`: ao vivo 10s, encerrado 24h, não-iniciado 600s.

## Componente — `src/components/world-cup/live-match.tsx`
Cliente, recebe `initial: MatchDetail` + `group`. Layout full-width (max-w-1240):
- **Esquerda:** escalação (2 colunas, nome+posição+marcas) + estatísticas (barras)
- **Meio:** lance a lance (feed)
- **Direita:** classificação do grupo (destaca os 2 times)
- **Cabeçalho:** placar, selo AO VIVO/cronômetro, contagem regressiva no pré-jogo, botão de som.
- **Polling:** `/api/copa/jogo/[id]` — ao vivo 12s, pré-jogo 45s (15s a ≤5min do apito),
  para quando `finished`. Atualiza event/incidents/commentary/stats.

## Endpoints de API
- `src/app/api/copa/jogo/[id]/route.ts` → `getMatchLive(id)` (event+incidents+commentary+stats),
  `Cache-Control: no-store`, fetch interno cacheia ~10s (compartilhado entre clientes).
- `src/app/api/copa/ao-vivo/route.ts` → `getWorldCupLiveScores()` (placares da rodada atual).

## Selo AO VIVO e placar na tabela da Copa
- `src/components/world-cup/copa-live-provider.tsx` — provider (context) que faz polling de
  `/api/copa/ao-vivo` a cada 15s; a página `/futebol/copa-do-mundo` envolve os grupos nele.
- `group-row.tsx` (`MatchMini`) — o confronto inteiro vira link pra página do jogo; placar
  atualiza ao vivo (vermelho) + selo AO VIVO via `useLiveScore(m.id)`.

## Não tem
Vídeo/highlights (direito de transmissão) nem campo com player-tracking ao vivo (só formação).

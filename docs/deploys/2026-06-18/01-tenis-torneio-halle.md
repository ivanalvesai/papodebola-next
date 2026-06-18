---
area: frontend
data: 2026-06-18
---

# Tênis — coleta ao vivo + página de chaveamento de torneio

## Contexto

A seção "ao vivo" da página `/tenis` ficava **sempre vazia**, mesmo com jogos rolando.
Causa: o código buscava `tennis/matches/live`, que retorna **HTTP 404** — tênis usa
`tennis/events/live`. A partir daí, criamos a primeira página de **chaveamento de torneio
de tênis ao vivo** (modelo `/tenis/halle-2026`, ATP 500 de Halle / Terra Wortmann Open).

## Gotchas dos endpoints de tênis (AllSportsApi)

Descobertos investigando a API direto. Importam pra qualquer evolução de tênis:

| Assunto | Achado |
|---|---|
| **Live / por data** | Tênis usa `events/*` (`tennis/events/live`, `tennis/events/{d}/{m}/{y}`). Os `matches/*` dão **404**. É o **inverso** de basquete/vôlei/NFL (que usam `matches/*`). |
| **Foto do atleta** | No tênis o jogador é modelado como **`team`** → foto em `/img/team/{id}/image`. O `player/{id}/image` retorna **0 bytes**. O id vem como `participant.team.id` no cuptree. |
| **País (bandeira)** | Só vem do `match/{id}` (`homeTeam.country.alpha2`). O cuptree **não** traz país. |
| **Chaveamento** | `tournament/{ut}/season/{se}/cuptrees` (~80KB): `rounds[]` → `blocks[]` com `participants[{team,winner,order,teamSeed}]`, `result` "2:1", `events[0]` (id do jogo), `finished`, `eventInProgress`. |
| **Placar set a set** | Só no `match/{id}` (`homeScore.period1..5` = games por set, `period{n}TieBreak`, `point` = 0/15/30/40/50→AD). ~6KB por jogo — barato enriquecer os ~31 jogos do chave. |
| **Slots futuros** | Vêm com nome placeholder "Qf1"/"WQF1"/"WSF1" (regex `/^[wqsf]+\d+$/i` → "A definir"). |
| **`matches/round/N`** | Dá **204** (vazio) pra tênis — não serve; usar `cuptrees`. |

## Arquivos

**Novos**
- `src/lib/data/tennis.ts` — `getTennisDraw(slug)` monta o chaveamento a partir do
  `cuptrees`, enriquece cada jogo via `match/{id}` (TTL por status: encerrado 24h, agendado
  30min) e **sobrepõe placar ao vivo** com o feed `tennis/events/live` (pequeno, TTL 15s).
  `TENNIS_TOURNAMENTS` é o registro de torneios (precisa `uniqueTournamentId` + `seasonId`).
- `src/components/tennis/tennis-draw.tsx` — client component: cards de jogo por rodada
  (Final no topo), foto do atleta com fallback bandeira→iniciais, placar set a set, vencedor
  destacado (verde + troféu), badge **AO VIVO · 2º set** / **Encerrado** / horário. Polling
  em `/api/tenis/{slug}` (20s ao vivo, 60s pré-jogo; para quando tudo encerra).
- `src/app/tenis/halle-2026/page.tsx` — server component, `revalidate = 60`, SEO próprio.
- `src/app/api/tenis/[slug]/route.ts` — rota pública de polling do chaveamento ao vivo.

**Editados**
- `src/lib/data/sports.ts`:
  - `fetchSportEvents(api, path, ttl)` — fallback `matches/ → events/` (conserta o ao vivo
    de tênis e cobre os demais esportes sem config por esporte).
  - `filterEvents` / `TENNIS_KEEP` — mantém **ATP, WTA, WTA 125, Grand Slam, Davis Cup,
    Billie Jean King Cup, United/Laver Cup**; descarta ITF/UTR/Challenger (o feed por data
    traz ~1.500 jogos/dia, quase tudo irrelevante).
  - **`skipDateFeeds: true`** no tênis — ver "Cuidado com banda" abaixo.
- `src/types/sport.ts` — flag `skipDateFeeds?` no `SportConfig`.
- `src/components/sports/sport-page-content.tsx` — prop `featured?: ReactNode` (destaque no
  topo da coluna principal).
- `src/app/tenis/page.tsx` — banner de destaque linkando `/tenis/halle-2026`.
- `src/app/sitemap.ts` — `/tenis/halle-2026` no sitemap.

## Cuidado com banda (regressão evitada)

O fallback `events/*` fez o `/tenis` passar a buscar `tennis/events/{data}`, que tem
**~1.500 jogos do mundo todo no dia (9MB+)**. Isso estoura o limite de **2MB do data cache
do Next** (`items over 2MB can not be cached`) → no dev (que bate direto na API, sem o proxy
que enxuga) re-busca a cada render = banda queimada. Ver `incidente_sports_proxy_2mb`.

**Correção:** `skipDateFeeds: true` no tênis — a landing `/tenis` **não** busca hoje/calendário
(que eram vazios mesmo, já que o `matches/{data}` dava 404). O conteúdo rico vive na página do
torneio, que usa só `cuptrees` (80KB) + `match/{id}` (~6KB) + `events/live` (pequeno), tudo
abaixo de 2MB. A landing mantém **ao vivo** (feed pequeno) + **ranking ATP** + notícias.

## Como adicionar um novo torneio

1. Pegar `uniqueTournamentId` + `seasonId` (ex.: `GET match/{id}` de qualquer jogo →
   `event.tournament.uniqueTournament.id` e `event.season.id`).
2. Adicionar uma entrada em `TENNIS_TOURNAMENTS` (`src/lib/data/tennis.ts`).
3. Criar `src/app/tenis/{slug}/page.tsx` (copiar de `halle-2026`) + entrada no sitemap.

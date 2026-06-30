---
area: frontend
data: 2026-06-09
arquivos:
  - src/components/match-bar/match-bar.tsx
  - src/lib/data/matches.ts
  - src/types/match.ts
---

# Barra de jogos de hoje: ordenação por status e horário

## Problema
A barra horizontal de "jogos de hoje" mostrava os jogos na ordem da API, com **jogos já
encerrados na frente** — o usuário precisava rolar para achar o jogo ao vivo (ex.: Argentina).

## Correção
Em `src/components/match-bar/match-bar.tsx`, os `todayMatches` agora são ordenados (via
`useMemo`) por prioridade de status e, dentro do grupo, por horário (`time`, "HH:MM"):

```
STATUS_PRIORITY = { live: 0, halftime: 0, scheduled: 1, finished: 2, postponed: 3, cancelled: 3 }
```

Ordem: **ao vivo/intervalo → próximos (por horário) → encerrados → adiados/cancelados**.
Assim o jogo ao vivo fica sempre no começo da barra.

## Escopo
A ordenação fica **dentro da MatchBar** (não mexe em `getTodayMatches` nem no widget
"Últimos Resultados" do sidebar, que também recebe `todayMatches`). O tipo
`NormalizedMatch` (`src/types/match.ts`) tem `status` e `time`, sem timestamp numérico —
como são jogos do mesmo dia, ordenar pela string "HH:MM" é cronológico.

---
area: frontend
data: 2026-06-15
---

# Features de frontend — carrosséis, traduções, substituições

## Carrosséis de "jogos de hoje" por campeonato

Novo componente reutilizável **`src/components/match-bar/match-carousel.tsx`** (`MatchCarousel`):
título do campeonato + carrossel horizontal de `MatchBarCard` (mesmo card da barra "Hoje"
da home), com setas. Usa o `MatchBarCardProps` (agora exportado de `match-bar-card.tsx`).

- **`/futebol`** (`src/app/futebol/page.tsx`): seção "Jogos de Hoje" no topo — um carrossel
  por campeonato. Dados de `getTodayFootballByLeague()` em `src/lib/data/matches.ts`,
  **restrito aos campeonatos principais** (`FUTEBOL_TODAY_ORDER`) — sem o filtro, o feed
  global gerava 600+ carrosséis.
- **`/jogos-de-hoje`** (geral): a lista vertical virou carrosséis por campeonato dentro de
  cada esporte. Dados de `getGeneralAgenda()` em `src/lib/data/agenda.ts`, agrupados por liga.

## Cards de jogo clicáveis (fim do beco sem saída)

Em `/jogos-de-hoje`, todo card agora linka (`AgendaEvent.href`, montado em `agenda.ts`):
- Copa → página do jogo (`worldCupMatchHref`, lance a lance);
- futebol não-Copa → página do campeonato (`/futebol/[slug]` se houver);
- outros esportes → página do esporte (`/basquete`, `/volei`, …).

## Traduções (tudo PT-BR, exceto nome de clube)

- **Vôlei**: seleções da Liga das Nações/Golden League vinham em inglês. `agenda.ts` passou a
  traduzir via `translateCountry` (`src/lib/i18n/countries.ts`), que ganhou ~16 países de
  vôlei (Itália, Polônia, Sérvia, Eslovênia, etc.).
- **Copa**: o nome da liga vinha "FIFA World Cup" → exibe "Copa do Mundo" (igual à home).

## Substituições na escalação do jogo ao vivo

Em `src/components/world-cup/live-match.tsx`, a "Escalação confirmada" agora mostra as
substituições sem precisar abrir o lance a lance:
- quem **saiu** → nome em vermelho + seta pra baixo (`ArrowDown`) + minuto;
- quem **entrou** → em verde logo abaixo do titular (pareamento saiu→entrou), e nas Reservas
  fica verde com o minuto;
- legenda "saiu/entrou" aparece quando há substituições.

Reaproveita o sistema de "marks" (gols/cartões) — `buildMarks` ganhou `subOut`/`subIn` a partir
dos incidentes (`type: "substitution"`, casado por nome). Atualiza **ao vivo** porque o
componente já faz polling de 12s dos incidentes.

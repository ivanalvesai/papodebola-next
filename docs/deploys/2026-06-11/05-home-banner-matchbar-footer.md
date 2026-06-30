---
area: home-institucional
data: 2026-06-11
---

# Home: barra de jogos da Copa, banner dourado, rodapé

## Barra de jogos (topo da home) — `match-bar`
Durante a Copa, a aba "Hoje" mostra os **jogos da Copa do dia** com link pra página do jogo.
- `matches.ts > normalizeEvent`: jogos com `leagueId === 16` (World Cup) ganham nome em PT
  (`translateCountry`), `homeId`/`awayId`, e `href` = `worldCupMatchHref(...)` (só se ambos os
  times estão em `SELECAO_BY_ID`). Nome da liga "FIFA World Cup" → "Copa do Mundo".
- `page.tsx` (home): `const copaToday = todayMatches.filter(m => m.href)`; passa esses pra
  `MatchBar` se houver, senão os jogos gerais.
- `match-bar-card.tsx`: card inteiro vira `<Link>` quando tem `href`. `NormalizedMatch` ganhou
  `homeId/awayId/href`.

## Banner da Copa — `src/components/world-cup-banner.tsx`
A Copa começou (11/06), então o banner deixou de ser contagem regressiva e virou comemorativo:
- Fundo **dourado** (gradiente em ouro), título **"A COPA DO MUNDO COMEÇOU: RUMO AO HEXA!"**
  (texto verde, tema Brasil), 🏆, botão "Acompanhe" verde. Removida a contagem regressiva.

## Rodapé — `src/components/layout/footer.tsx`
Copyright passou de "© 2026" para **"© 2004–{ano atual}"** (ano final dinâmico via
`new Date().getFullYear()`).

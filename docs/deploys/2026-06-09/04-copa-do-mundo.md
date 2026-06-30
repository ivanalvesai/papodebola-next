---
area: frontend
data: 2026-06-09
arquivos:
  - src/app/futebol/copa-do-mundo/page.tsx
  - src/components/world-cup/world-cup-scorers.tsx
  - src/components/world-cup-banner.tsx
  - src/app/page.tsx
---

# Página da Copa do Mundo: artilharia, notícias, banner e sidebar

A página `/futebol/copa-do-mundo` (`src/app/futebol/copa-do-mundo/page.tsx`) ganhou novas
seções. Ordem final da página: **Grupos → Artilharia → Seleções → Notícias da Copa**.

## Artilharia (tabela de gols)

Nova seção entre as tabelas de grupos e o carrossel de seleções, componente
`src/components/world-cup/world-cup-scorers.tsx`. Colunas: posição, jogador (foto + nome),
país (bandeira + nome), gols. Dados via `getWorldCupScorers()` (ver doc da API).
Antes da Copa começar mostra placeholder; popula sozinho no primeiro gol.

## Feed de notícias da Copa

No fim da página (após as seleções), o mesmo `NewsFeed` da home, com
`category="Copa do Mundo"` e rolagem infinita. Filtra por categoria via
`getArticles({ category: "Copa do Mundo" })` + `/api/articles?cat=Copa do Mundo`.
Existem 23 artigos publicados nessa categoria.

## Banner da Copa — link corrigido

O `src/components/world-cup-banner.tsx` apontava para `/noticias/copa-do-mundo` (listagem
de notícias). Corrigido para **`/futebol/copa-do-mundo`** (a página com grupos/jogos).

## Reordenação do sidebar da home

Em `src/app/page.tsx`, o `<aside>` foi reordenado (desktop):
**Copa do Mundo → Classificação Brasileirão → Meu Time → Próximo Jogo → Artilharia → Resultados**.
Antes: Meu Time/Próximo Jogo vinham antes da Copa. Objetivo: o widget `WorldCupGroupsWidget`
fica no topo, alinhado com as "Últimas Notícias" da coluna principal.

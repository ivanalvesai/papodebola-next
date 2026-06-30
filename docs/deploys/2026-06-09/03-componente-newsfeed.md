---
area: frontend
data: 2026-06-09
arquivos:
  - src/components/news/news-feed.tsx
  - src/app/api/articles/route.ts
---

# Componente compartilhado NewsFeed (feed + rolagem infinita / botão)

Para não duplicar código entre a home e a página da Copa, o feed de coluna única +
paginação foi extraído num componente reutilizável: `src/components/news/news-feed.tsx`.

## Exporta
- `FeedItem` — item do feed (imagem 16/9 à esquerda, editoria + título + trecho à direita).
- `NewsFeed` — feed com paginação.

## Props do NewsFeed
- `initial: Article[]` — artigos já carregados no servidor (semente).
- `category?: string` — nome da categoria WP para filtrar (`?cat=`).
- `infinite?: boolean` (default `true`) — `true` = rolagem infinita via IntersectionObserver;
  `false` = só botão "Mostrar mais".
- `initialVisible?: number` — quantos exibir de início no modo botão.
- `step?: number` (default 10) — quantos revelar/buscar por clique.
- `excludeSlugs?: string[]` — slugs já exibidos fora do feed (ex.: destaques da home).
- `seeAllHref?: string` — destino do "Ver todas" quando acaba.

## Como pagina
- Busca os próximos lotes em `GET /api/articles?page=N&limit=20&cat=...` (`src/app/api/articles/route.ts`).
- `PAGE_SIZE = 20` deve bater com o `perPage` do load inicial para não pular itens (offset
  do WordPress é `page*limit`).
- Dedup por slug via `Set` (`seen`).

## Usos
- **Home** (`news-section.tsx`): `infinite={false}`, `initialVisible={10}`, mostra 10 + botão.
- **Copa** (`/futebol/copa-do-mundo`): `infinite={true}`, `category="Copa do Mundo"`, rolagem infinita.

Qualquer ajuste futuro no layout/comportamento do feed vale para os dois lugares de uma vez.

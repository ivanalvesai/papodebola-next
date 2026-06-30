# Graph Report - .  (2026-06-10)

## Corpus Check
- Corpus is ~2,876 words - fits in a single context window. You may not need a graph.

## Summary
- 68 nodes · 97 edges · 8 communities detected
- Extraction: 80% EXTRACTED · 19% INFERRED · 1% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Cache persistente .next/cache em volume por ambiente` - 12 edges
2. `Componente NewsFeed reutilizavel` - 10 edges
3. `Resumo da sessao 2026-06-09` - 10 edges
4. `proxy_cache off no nginx (nao cacheia HTML)` - 8 edges
5. `Renderer HTML real do WordPress (contentHtml)` - 7 edges
6. `getWorldCupScorers() (statistics?order=-goals)` - 7 edges
7. `fetchAllSports / src/lib/api/allsports.ts` - 7 edges
8. `Warm sequencial no rebuild.sh` - 7 edges
9. `MatchBar ordenacao por status e horario` - 6 edges
10. `src/components/home/news-section.tsx` - 5 edges

## Surprising Connections (you probably didn't know these)
- `proxy_cache off no nginx (nao cacheia HTML)` --semantically_similar_to--> `Cache persistente .next/cache em volume por ambiente`  [INFERRED] [semantically similar]
  07-nginx-cache-html.md → 08-cache-persistente-deploy.md
- `nginx proxy_cache cache_one global (proxy.conf)` --semantically_similar_to--> `ISR / .next/cache (fetch-cache)`  [INFERRED] [semantically similar]
  07-nginx-cache-html.md → 08-cache-persistente-deploy.md
- `Home: rolagem infinita -> 10 + botao Mostrar mais` --semantically_similar_to--> `Feed de noticias da Copa (NewsFeed filtrado)`  [INFERRED] [semantically similar]
  02-home-noticias.md → 04-copa-do-mundo.md
- `fetchAllSports / src/lib/api/allsports.ts` --conceptually_related_to--> `WordPress (CMS headless)`  [AMBIGUOUS]
  05-artilharia-api.md → 00-resumo.md
- `Eyebrow vira categoria do post (+ fix de corte leading-4)` --shares_data_with--> `Decodificacao de entidades HTML (decodeEntities)`  [INFERRED]
  02-home-noticias.md → 01-renderer-artigos.md

## Hyperedges (group relationships)
- **Sistema de deploy e cache** — cache_persistente_volume, warm_sequencial, nginx_proxy_cache_off, backups_gitignore, rebuild_sh, isr_next_cache [INFERRED 0.80]
- **Feed de noticias reutilizavel** — componente_newsfeed, file_news_section, feed_noticias_copa, rolagem_10_mais_botao, feed_coluna_unica [INFERRED 0.85]
- **Dados de esportes via proxy** — get_world_cup_scorers, fetch_allsports, sports_proxy, arquitetura_proxy, allsports_max_concurrent [INFERRED 0.85]

## Communities

### Community 0 - "Esportes, proxy e cache"
Cohesion: 0.18
Nodes (16): ALLSPORTS_MAX_CONCURRENT=2 (semaforo), Arquitetura de proxy dev->prod (economia de quota), Cache persistente .next/cache em volume por ambiente, fetchAllSports / src/lib/api/allsports.ts, docker-compose.yml, docker-compose.override.yml (dev), Dockerfile, src/lib/data/scorers.ts (+8 more)

### Community 1 - "Feed de noticias (NewsFeed)"
Cohesion: 0.25
Nodes (11): Componente NewsFeed reutilizavel, Feed em coluna unica (foto esquerda, titulo+trecho direita), Feed de noticias da Copa (NewsFeed filtrado), src/app/api/articles/route.ts, src/components/news/news-feed.tsx, src/components/home/news-section.tsx, Rationale: botao no lugar de infinito porque infinito nunca deixava chegar ao rodape, Rationale: extrair NewsFeed pra nao duplicar codigo entre home e Copa (+3 more)

### Community 2 - "Renderer de artigos / WordPress"
Cohesion: 0.25
Nodes (9): Decodificacao de entidades HTML (decodeEntities), src/types/article.ts, src/lib/data/articles.ts, src/app/artigos/[slug]/page.tsx, Imagem destacada removida do topo do artigo, Rationale: remover imagem em codigo, nao no WP, senao sumiria dos cards da home, Rationale: sanitizacao leve porque conteudo vem de CMS proprio confiavel, Renderer HTML real do WordPress (contentHtml) (+1 more)

### Community 3 - "Pagina da Copa e home"
Cohesion: 0.25
Nodes (8): Secao de Artilharia da Copa (world-cup-scorers), Banner da Copa - link corrigido para /futebol/copa-do-mundo, src/app/futebol/copa-do-mundo/page.tsx, src/app/page.tsx, src/components/world-cup-banner.tsx, src/components/world-cup/world-cup-scorers.tsx, HighlightsSection desativada (comentada), Sidebar da home reordenado (Copa no topo)

### Community 4 - "Cache de HTML no nginx"
Cohesion: 0.29
Nodes (7): Cloudflare (Purge Everything), Validar via curl: cuidado com RSC e redirect 301, development.papodebola.com.br.conf (nginx dev), papodebola.com.br.conf (nginx prod), nginx proxy_cache cache_one global (proxy.conf), proxy_cache off no nginx (nao cacheia HTML), Rationale: proxy_cache off porque nginx armazenava HTML antes do header virar no-store

### Community 5 - "SEO, AdSense e layout"
Cohesion: 0.29
Nodes (7): ads.txt na raiz, Google AdSense (meta verificacao + Auto Ads pendente), Eyebrow vira categoria do post (+ fix de corte leading-4), src/components/layout/header.tsx, src/app/layout.tsx, src/middleware.ts, Resumo da sessao 2026-06-09

### Community 6 - "Barra de jogos (MatchBar)"
Cohesion: 0.4
Nodes (5): src/components/match-bar/match-bar.tsx, src/types/match.ts (NormalizedMatch), src/lib/data/matches.ts, MatchBar ordenacao por status e horario, Rationale: ordenar pela string HH:MM e cronologico porque sao jogos do mesmo dia

### Community 7 - "Fluxo de deploy e watcher"
Cohesion: 0.5
Nodes (5): Backups *.bak no .gitignore (watcher bloqueou promote), Fluxo de deploy (pushdev -> promote), promote.sh, rebuild.sh, Watcher do dev (inotify + git add -A)

## Ambiguous Edges - Review These
- `fetchAllSports / src/lib/api/allsports.ts` → `WordPress (CMS headless)`  [AMBIGUOUS]
  05-artilharia-api.md · relation: conceptually_related_to

## Knowledge Gaps
- **28 isolated node(s):** `Rationale: sanitizacao leve porque conteudo vem de CMS proprio confiavel`, `Rationale: remover imagem em codigo, nao no WP, senao sumiria dos cards da home`, `src/types/article.ts`, `HighlightsSection desativada (comentada)`, `Rationale: botao no lugar de infinito porque infinito nunca deixava chegar ao rodape` (+23 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `fetchAllSports / src/lib/api/allsports.ts` and `WordPress (CMS headless)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `Resumo da sessao 2026-06-09` connect `SEO, AdSense e layout` to `Esportes, proxy e cache`, `Feed de noticias (NewsFeed)`, `Renderer de artigos / WordPress`, `Pagina da Copa e home`, `Cache de HTML no nginx`, `Barra de jogos (MatchBar)`, `Fluxo de deploy e watcher`?**
  _High betweenness centrality (0.552) - this node is a cross-community bridge._
- **Why does `Cache persistente .next/cache em volume por ambiente` connect `Esportes, proxy e cache` to `Cache de HTML no nginx`, `SEO, AdSense e layout`, `Fluxo de deploy e watcher`?**
  _High betweenness centrality (0.222) - this node is a cross-community bridge._
- **Why does `Componente NewsFeed reutilizavel` connect `Feed de noticias (NewsFeed)` to `Renderer de artigos / WordPress`, `SEO, AdSense e layout`?**
  _High betweenness centrality (0.207) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Cache persistente .next/cache em volume por ambiente` (e.g. with `Marcador de dados = nomes, nao logos` and `proxy_cache off no nginx (nao cacheia HTML)`) actually correct?**
  _`Cache persistente .next/cache em volume por ambiente` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Componente NewsFeed reutilizavel` (e.g. with `Feed em coluna unica (foto esquerda, titulo+trecho direita)` and `WordPress (CMS headless)`) actually correct?**
  _`Componente NewsFeed reutilizavel` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Rationale: sanitizacao leve porque conteudo vem de CMS proprio confiavel`, `Rationale: remover imagem em codigo, nao no WP, senao sumiria dos cards da home`, `src/types/article.ts` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
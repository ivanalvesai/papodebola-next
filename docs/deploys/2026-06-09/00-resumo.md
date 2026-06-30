---
area: indice
data: 2026-06-09
---

# Resumo da sessão de 2026-06-09 — papodebola-next

Conjunto de mudanças feitas em uma sessão, documentadas para consulta futura e para não
perder contexto entre deploys. Cada arquivo detalha uma área.

## Frontend
- **01-renderer-artigos** — página do artigo renderiza HTML real do WordPress (h2/h3/listas),
  decodifica entidades nos títulos, e não exibe mais a imagem destacada no topo.
- **02-home-noticias** — eyebrow vira categoria (+ fix de corte), 3 destaques, Destaques
  desativado, rolagem infinita da home virou 10 + botão, feed em coluna única.
- **03-componente-newsfeed** — componente reutilizável NewsFeed (modos infinito/botão).
- **04-copa-do-mundo** — artilharia, feed de notícias filtrado, link do banner, sidebar reordenado.
- **06-match-bar** — barra de jogos de hoje ordenada por status (ao vivo → próximos → encerrados).

## Dados / API
- **05-artilharia-api** — getWorldCupScorers via endpoint `statistics?order=-goals`; arquitetura
  de proxy (prod consulta via dev) confirmada.

## Infra
- **07-nginx-cache-html** — `proxy_cache off` no nginx: fim do "não vejo a mudança" no deploy.
- **08-cache-persistente-deploy** — volume `.next/cache` por ambiente + warm sequencial:
  o site não fica vazio após deploy.
- **10-deploy-gotchas** — armadilhas (backups no watcher, marcador de dados, RSC/redirect, Cloudflare).

## SEO
- **09-ads-adsense** — ads.txt + estado da ativação do AdSense.

## Temas transversais (god nodes esperados)
- **Deploy / rebuild.sh / promote.sh** — toca cache persistente, warm, nginx, gotchas.
- **NewsFeed** — usado por home e Copa.
- **fetchAllSports / proxy** — toca artilharia, match-bar, cache persistente.
- **WordPress / articles** — toca renderer, home, feed da Copa.

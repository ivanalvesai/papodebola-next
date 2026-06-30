---
area: indice
data: 2026-06-11
---

# Resumo da sessão de 2026-06-11 — papodebola-next (estreia da Copa do Mundo 2026)

Maratona no dia da abertura da Copa (México 2x0 África do Sul). Construímos do zero a
página de jogo ao vivo estilo ge.globo, resolvemos o bloqueio de imagens do Sofascore,
instalamos tradução self-hosted, som de gol, e ajustes de home/SEO/infra.

## Infra / imagens
- **01-imagens-rapidapi** — `/img/*` parou de bater no Sofascore (que bloqueou o IP) e
  passou a usar a **AllSportsApi (RapidAPI)** com a key. Fim do bloqueio; fotos de jogador
  e escudos sempre carregam.

## Página de jogo ao vivo (a grande feature)
- **02-pagina-jogo-ao-vivo** — rota `/futebol/copa-do-mundo/jogo/[data]/[slug]`, camada de
  dados `match-detail.ts`, componente `live-match.tsx`, endpoints `/api/copa/jogo/[id]` e
  `/api/copa/ao-vivo`, provider de polling da tabela.
- **03-lance-a-lance-e-traducao** — feed via `commentary`, merge dos `incidents` (gols não
  somem), substituição Entra/Sai, motivo do cartão, foto do jogador, marcas na escalação,
  selo de fase; + tradução EN→PT via **LibreTranslate** self-hosted (sem tokens).
- **04-som-de-gol** — torcida (Web Audio) ao sair gol, por página de jogo, botão liga/desliga.

## Home / SEO / institucional
- **05-home-banner-matchbar-footer** — barra de jogos vira jogos da Copa com link AO VIVO;
  banner dourado "Rumo ao Hexa"; rodapé 2004–2026.
- **06-posts-seo** — post da Copa 2026 (publicado) e do Quiñones (rascunho), padrão Rank Math.

## Consumo / arquitetura
- **07-consumo-api-e-arquitetura** — TTLs e cadência ajustados pro rate limit/bandwidth;
  poll do pré-jogo aperta perto do apito; regra "só o dev consulta a API, prod usa o dev".

## God nodes esperados
- **match-detail.ts** — toca lance a lance, tradução, merge, placares ao vivo, resolução de jogo.
- **live-match.tsx** — toca render do jogo, som, polling, escalação, estatísticas, classificação.
- **AllSportsApi / proxy / RapidAPI** — toca dados, imagens, consumo, arquitetura.
- **LibreTranslate** — toca tradução do lance a lance.

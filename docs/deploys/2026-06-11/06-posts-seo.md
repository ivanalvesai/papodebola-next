---
area: conteudo-seo
data: 2026-06-11
---

# Posts criados (padrão Rank Math)

## Padrão usado
- Cria o post no WordPress via REST API (`/wp-json/wp/v2/posts`) com Basic Auth do `.env.local`.
  Categoria/tags vão pelo REST normalmente (resolve/cria a tag se não existir). Status `draft`
  por padrão pra revisar antes; vira `publish` no editor do WP ou via REST.
- Conteúdo SEO: H1 (título), H2/H3 hierárquicos, bloco de resumo/FAQ, links internos/externos,
  slug com a palavra-chave. Keyword no título, slug, 1º parágrafo, num H2 e repetida no corpo.
- **Tamanho: alvo 2000+ palavras, mas NÃO é obrigatório.** Se o tema não rende conteúdo real,
  um post menor e denso é melhor que encher linguiça (a pedido do Ivan, 12/06). Qualidade do
  Humanizer > contagem de palavras.
- **Rank Math via wp-cli** (o REST do WP NÃO persiste os campos `rank_math_*` — não estão
  registrados com `show_in_rest`). No container `wordpress-papodebola-wordpress-1`:
  ```bash
  ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 bash <<'EOF'
  C=wordpress-papodebola-wordpress-1
  docker exec $C wp post meta update {ID} rank_math_focus_keyword 'keyword' --allow-root
  docker exec $C wp post meta update {ID} rank_math_title 'titulo <60 chars' --allow-root
  docker exec $C wp post meta update {ID} rank_math_description 'meta ~150 chars com CTA' --allow-root
  docker exec $C wp post meta update {ID} rank_math_rich_snippet 'article' --allow-root
  docker exec $C wp post meta update {ID} rank_math_snippet_article_type 'NewsArticle' --allow-root
  docker exec $C wp post meta update {ID} rank_math_robots '["index","follow","max-snippet:-1","max-image-preview:large"]' --format=json --allow-root
  docker exec $C wp post meta update {ID} rank_math_facebook_title 'titulo social' --allow-root
  docker exec $C wp post meta update {ID} rank_math_facebook_description 'desc social' --allow-root
  docker exec $C wp post meta update {ID} rank_math_twitter_use_facebook 'on' --allow-root
  EOF
  ```
  Usar heredoc `<<'EOF'` (não aspas aninhadas) — acentos passam OK via SSH/UTF-8 (conferido).
- Falta só a **imagem destacada** (manual no WP) pra fechar 100%.

## Posts desta sessão
1. **Copa do Mundo 2026** (ID 1949) — "Copa do Mundo 2026: recorde de seleções, novo formato e
   o que muda". **Publicado**. Focus: "Copa do Mundo 2026". slug `copa-do-mundo-2026-recorde-de-selecoes`.
2. **Julián Quiñones** (ID 1953) — "Saiu o primeiro gol da Copa do Mundo: conheça Julián Quiñones".
   **Rascunho** (aguardando aprovação). Focus: "Julián Quiñones". slug
   `julian-quinones-primeiro-gol-copa-do-mundo-2026`. Pesquisado: colombiano naturalizado mexicano,
   Tigres→Atlas (bicampeão, fim de jejum de 70 anos)→América→Al-Qadsiah (venda recorde, artilheiro
   33 gols), 13 títulos, autor do 1º gol da Copa 2026 (9', no Azteca).
3. **Onde assistir a Copa 2026** (ID 1956, criado 12/06) — "Onde assistir a Copa do Mundo 2026 na
   TV e online". **Rascunho** (Ivan revisando). Focus: "onde assistir a Copa do Mundo 2026". slug
   `onde-assistir-copa-do-mundo-2026`. ~2200 palavras, evergreen. Transmissão validada (Goal,
   Terra, Wikipédia, não copiou a UOL): Cazé TV no YouTube com os 104 jogos de graça, Globo+SBT
   aberta, SporTV fechada, Globoplay/ge streaming, N Sports extra. Tem caixa de resumo + bloco FAQ.

## Bug latente registrado
A rota de publicação do kanban (`src/app/api/kanban/route.ts`) tenta gravar os `rank_math_*` via
`meta:{}` no REST — **não persiste** (campos não registrados com `show_in_rest`). Combinado com o
Ivan: deixa assim e usa o wp-cli/manual pros ajustes de SEO.

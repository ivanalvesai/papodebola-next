---
area: frontend
data: 2026-06-09
arquivos:
  - src/lib/data/articles.ts
  - src/app/artigos/[slug]/page.tsx
  - src/types/article.ts
---

# Renderer de artigos: HTML real do WordPress, entidades e imagem destacada

## Problema 1 — o renderer destruía a formatação (H2/H3, listas, espaçamento)

A página `src/app/artigos/[slug]/page.tsx` rodava `stripHtml()` no conteúdo do WordPress
e colapsava todas as quebras de linha. Resultado ao vivo: todo artigo virava **um único
parágrafo gigante**, sem títulos, listas ou espaçamento. O WordPress guarda HTML rico
(`<h2>`, `<ul>`, `<a>`, caixa "Neste artigo"), mas tudo era apagado na exibição.

### Correção
- `normalizeArticle` em `src/lib/data/articles.ts` agora preserva `post.content.rendered`
  num novo campo **`Article.contentHtml`** (adicionado em `src/types/article.ts`).
- `rewrittenText` continua como texto puro (`stripHtml`) — usado só para meta description,
  excerpt nas listas e contagem de palavras.
- A página renderiza `contentHtml` sanitizado (remove `<script>`/`<style>`/handlers `on*`/
  `javascript:`) via `dangerouslySetInnerHTML`, com fallback para o comportamento antigo
  (`formatParagraphs`) quando não há HTML.
- Ampliei o CSS `.prose-article` para estilizar `h2`, `h3`, listas, links, tabelas,
  citações e imagens com espaçamento generoso (estilo ge.globo.com).

**Por quê:** o conteúdo vem do CMS próprio (autores confiáveis) e a página já usava
`dangerouslySetInnerHTML`, então sanitização leve é suficiente. Conserta TODOS os
artigos do site de uma vez. Validado: o post do Corinthians passou de 0 para 8 `<h2>`.

## Problema 2 — títulos com acentos/aspas quebrados (entidades HTML)

Títulos apareciam com entidades cruas, ex.: `Ancelotti sobre Neymar na Copa: &#8216;Não é
uma decisão simples&#8217;`. **Não era charset** (o `ã` de "Não" renderizava certo) — era
o `stripHtml` que só decodificava `&amp; &lt; &gt; &quot; &#039;` e ignorava as numéricas
(`&#8216;` `&#8217;` `&#8230;` = aspas curvas, reticências).

### Correção
- Função `decodeEntities()` em `src/lib/data/articles.ts` decodifica entidades numéricas
  decimais (`&#NNN;`) e hex (`&#xNN;`) + nomeadas comuns. `stripHtml` passou a usá-la.
- Corrige o título em **todo o site**: home, /noticias e página do artigo.

## Problema 3 — imagem destacada repetida no topo do artigo

A featured image já aparece nos cards da home; repeti-la ao abrir o artigo era redundante.

### Correção
- Removida a exibição da `<Image>` hero no topo de `src/app/artigos/[slug]/page.tsx`
  (deixada como comentário explicativo). Mostra **só o título** (categoria + título + data).
- A imagem **continua** no OpenGraph/SEO (`generateMetadata`) e nos cards da home.

**Importante:** NÃO remover a featured image manualmente no WordPress — isso a tiraria
também dos cards da home. A solução correta é em código (vale para todos os posts).

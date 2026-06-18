---
area: seo-legal
data: 2026-06-18
---

# Páginas legais (AdSense) + correção de soft-404

## Páginas legais
- **/privacidade**: reescrita com política LGPD detalhada (10 seções + Encarregado/DPO) e
  menção explícita ao **Google AdSense + cookie DoubleClick** (+ link de opt-out) — exigência do
  AdSense.
- **/termos**: Termos de Uso completos (12 seções: identificação com CNPJ, uso permitido,
  condutas proibidas, propriedade intelectual Lei 9.610/1998, isenção, links de terceiros,
  publicidade/Google Ads, privacidade, foro SP). OG title/description próprios.
- **/sobre**: reescrito mais robusto (história, cobertura, como produzimos, independência,
  contato) — E-E-A-T.
- Link "Termos de Uso" no rodapé; `/privacidade` e `/termos` no sitemap.
- ads.txt (pub-5802007717322888) e meta `google-adsense-account` já existiam e servem OK em prod.

## Correção de soft-404 (HTTP 200 → 404 real)
Sintoma: rotas dinâmicas inexistentes (ex: `/artigos/xxx`, `/tenis/halle-2026/fake`,
`/futebol/campeonato-inventado`) retornavam **HTTP 200** com a tela de "não encontrado"
(soft-404), ruim para SEO/AdSense.

**Causa:** o `src/app/loading.tsx` GLOBAL (que era o skeleton da home) criava um Suspense na
raiz → o shell era transmitido com 200 antes do `notFound()` resolver.

**Correções:**
1. `loading.tsx` movido para um route group **`src/app/(home)/`** (junto com a home `page.tsx`).
   Agora o skeleton só vale na home; as demais rotas não têm Suspense na raiz → `notFound()`
   volta a emitir **404 real**. Bônus: some o bug de mostrar skeleton-de-home em qualquer página.
2. `/futebol/[slug]` era client component e renderizava "Campeonato não encontrado" inline
   (sempre 200, sem noindex). Convertido: `page.tsx` virou server component com
   `generateStaticParams` (slugs de `TOURNAMENT_BY_SLUG`) + `dynamicParams = false` → slug
   inválido dá 404 real antes de renderizar. A UI interativa virou `championship-client.tsx`.
   Ganho extra: `generateMetadata` com title/description por campeonato.

URLs totalmente fora de padrão (ex: `/pagina-xyz`) já davam 404 (caem no `not-found.tsx`).

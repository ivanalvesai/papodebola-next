---
area: seo
data: 2026-06-15
---

# SEO / marketing — auditoria das 44 skills (3 lotes + AI-SEO)

Origem: auditoria do site com as skills do `marketingskills` (instaladas em
`.claude/skills/`, untracked). Achados executados em lotes.

## Host www (P0)

Canonicais, sitemap (324+ URLs) e `og:image` apontavam pro **apex**, que faz 301 → www →
diluía sinal e gastava crawl. Fix: `NEXT_PUBLIC_SITE_URL=https://www.papodebola.com.br` nos
`.env.local` de **dev e prod** + fallback `www` no código (`layout.tsx`, `sitemap.ts`,
`robots.ts`, `article-schema.tsx`).

## Schema (JSON-LD)

| Tipo | Onde | Arquivo |
|---|---|---|
| Organization + WebSite + SearchAction | layout raiz (todas as páginas) | `src/components/seo/site-schema.tsx` |
| NewsArticle | artigos | `src/components/seo/article-schema.tsx` (datas com `-03:00`, autor `Person` quando há nome, logo PNG, publisher `@id`) |
| SportsTeam | 222 hubs de time (via layout) | `src/components/seo/sports-team-schema.tsx` |
| SportsEvent | páginas de jogo da Copa | `src/components/seo/sports-event-schema.tsx` |
| ItemList | `/noticias` | `src/components/seo/item-list-schema.tsx` |
| BreadcrumbList | já existia; agora inclui o nó **"Futebol"** | `team-breadcrumb.tsx`, `futebol/[slug]`, página de jogo |

- **logo**: `public/logotipo-papo-de-bola.png` (wordmark 710×135, PNG — formato correto pra
  `logo`; SVG é rejeitado pelo Google).
- **sameAs**: Instagram (`@papodebola.com.br`), X (`sitepapodebola`), YouTube (`@opapodebola`).

## Canonical em todas as páginas

Sweep: canonical auto-referente em todas as páginas públicas (estáticas + dinâmicas via slug;
`/futebol/[slug]` e `/municipal` são client → canonical via `layout.tsx` server novo). Admin
(`painel-pdb-9x`, `studio-pdb`) com **`X-Robots-Tag: noindex`** via headers do `next.config.ts`.

## Linking interno (hub-and-spoke)

- Classificação linka os times (StandingsWidget da home + tabela do campeonato) quando o time
  tem página no cluster (`TEAM_BY_ID`).
- `/futebol` ganhou seção **"Campeonatos"** (links server-side pros silos, antes só no menu client).
- Footer ganhou colunas **Campeonatos** e **Esportes**.

## Outros

- **H1 na home** (sr-only) — faltava.
- **Acentuação** PT-BR em `/noticias` e páginas de time; fix de **marca duplicada**
  (`| Papo de Bola | Papo de Bola`) em copa-do-mundo, parceiros e studio.
- **Artigos `/artigos/[slug]` no sitemap** (cauda longa) — `getArticles({perPage:100})`.

## AI-SEO / GEO

- **Bots de IA liberados** no Cloudflare: o "managed robots.txt" do **AI Crawl Control**
  injetava `Disallow: /` pra GPTBot/ClaudeBot/Google-Extended/CCBot/Bytespider + `Content-Signal:
  ai-train=no`. Desligado → vale o `robots.ts` do código (`Allow: /`, bloqueando só
  painel/admin/api). Agora ChatGPT/Perplexity/Claude/AI Overviews podem rastrear e citar.
- **`/llms.txt`** — rota `src/app/llms.txt/route.ts` (padrão llmstxt.org), gerada do `config`
  (campeonatos, 37 times, esportes), aponta as seções de maior valor.

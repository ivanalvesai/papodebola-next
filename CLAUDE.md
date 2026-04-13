# Papo de Bola — Next.js

Portal de futebol brasileiro e mundial. Migrado de HTML/CSS/JS estático para Next.js 16.

**URL**: https://papodebola.com.br
**GitHub**: https://github.com/ivanalvesai/papodebola-next
**Projeto anterior (estático)**: https://github.com/ivanalvesai/site-papodebola

---

## Stack

| Camada | Tecnologia |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Linguagem** | TypeScript |
| **UI** | Tailwind CSS v4 + shadcn/ui |
| **CMS** | WordPress 6 (headless, Docker) |
| **APIs de dados** | AllSportsApi (Sofascore) via RapidAPI — Pro $19.99/mês |
| **API Calendário** | CBF API (gratuita) |
| **Geração de artigos** | Claude Sonnet (Anthropic API) via cron |
| **Analytics** | Google Analytics 4 + Microsoft Clarity (via GTM) |
| **Tag Manager** | Google Tag Manager |
| **Imagens** | Proxy Sofascore via nginx + next/image |
| **Auth** | JWT (jose) em httpOnly cookies |
| **Servidor** | Debian Linux, Docker |
| **CDN/SSL** | Cloudflare (Full mode) |

---

## Servidor

| | |
|---|---|
| **IP** | 138.117.60.14 |
| **Porta SSH** | 1822 |
| **Usuário** | ivan |
| **SSH Key** | ~/.ssh/debian_ed25519 |
| **Comando SSH** | `ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14` |

### Diretórios no servidor
- **Next.js**: `/home/ivan/papodebola-next` (Docker)
- **Projeto anterior**: `/home/ivan/site-papodebola` (backup/rollback)
- **WordPress**: `/home/ivan/wordpress-papodebola` (docker-compose)
- **Nginx config**: `/opt/signsimples/nginx/nginx.conf`

### Containers Docker
| Container | Porta | Função |
|---|---|---|
| `papodebola-next` | 3000 | Next.js (site principal) |
| `signsimples-nginx-1` | 80, 443 | Nginx (proxy + SSL) |
| `wordpress-papodebola-wordpress-1` | 8091 | WordPress headless |
| `wordpress-papodebola-db-1` | 3306 | MariaDB |

### Deploy
```bash
cd /home/ivan/papodebola-next
git pull
sudo docker compose build --no-cache
sudo docker compose up -d --force-recreate
```
Após deploy visual: **Purge Everything** no Cloudflare.

---

## Estrutura de Arquivos

```
papodebola-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (GTM, font, providers)
│   │   ├── page.tsx                            # Homepage
│   │   ├── loading.tsx                         # Skeleton loading
│   │   ├── not-found.tsx                       # 404
│   │   ├── error.tsx                           # Error boundary
│   │   ├── sitemap.ts                          # Sitemap dinâmico (~350 URLs)
│   │   ├── robots.ts                           # Robots.txt
│   │   ├── manifest.ts                         # PWA manifest
│   │   ├── ao-vivo/page.tsx                    # Jogos ao vivo / hoje
│   │   ├── noticias/page.tsx                   # Listagem com filtros e paginação
│   │   ├── agenda/page.tsx                     # Calendário CBF
│   │   ├── campeonato/[slug]/page.tsx          # Classificação + rodadas (client)
│   │   ├── esporte/[slug]/page.tsx             # NBA, Tênis, F1, MMA, etc.
│   │   ├── artigos/[slug]/page.tsx             # Artigo com SEO completo
│   │   ├── sobre/page.tsx                      # Institucional
│   │   ├── contato/page.tsx                    # Contato
│   │   ├── privacidade/page.tsx                # LGPD
│   │   ├── times/[slug]/                       # Cluster SEO de times
│   │   │   ├── layout.tsx                      # Header time + nav cluster
│   │   │   ├── page.tsx                        # HUB do time
│   │   │   ├── jogo-hoje/page.tsx              # Pilar: jogo de hoje
│   │   │   ├── onde-assistir/page.tsx          # Pilar: transmissão
│   │   │   ├── escalacao/page.tsx              # Pilar: escalação
│   │   │   ├── proximos-jogos/page.tsx         # Pilar: calendário
│   │   │   └── estatisticas/page.tsx           # Pilar: stats 2026
│   │   ├── painel-pdb-9x/                      # Admin panel (URL oculta)
│   │   │   ├── login/page.tsx
│   │   │   ├── artigos/page.tsx
│   │   │   ├── usuarios/page.tsx
│   │   │   ├── jogos/page.tsx
│   │   │   └── config/page.tsx
│   │   ├── api/                                # 8 Route Handlers
│   │   │   ├── auth/login/route.ts
│   │   │   ├── articles/route.ts
│   │   │   ├── articles/[slug]/route.ts
│   │   │   ├── championship/[slug]/route.ts
│   │   │   ├── upload/route.ts
│   │   │   ├── users/route.ts
│   │   │   ├── users/[username]/route.ts
│   │   │   └── revalidate/route.ts
│   │   └── img/[type]/[id]/image/route.ts      # Proxy Sofascore
│   ├── components/
│   │   ├── layout/                             # Header, nav, side panel, footer, cookie, my-team
│   │   ├── match-bar/                          # Match bar (Hoje/Próximos)
│   │   ├── home/                               # Highlights, news, transfers
│   │   ├── sidebar/                            # Standings, scorers, next match, meu time
│   │   ├── championship/                       # Round nav
│   │   ├── article/                            # Share buttons
│   │   ├── seo/                                # JSON-LD schema
│   │   └── ui/                                 # shadcn components
│   ├── lib/
│   │   ├── config.ts                           # Torneios, times, categorias
│   │   ├── translations.ts                     # Tradução status EN→PT-BR
│   │   ├── standings-utils.ts                  # Form dots (funções puras, sem API)
│   │   ├── api/                                # Fetch wrappers (AllSportsApi, CBF, WP)
│   │   ├── data/                               # Data functions com ISR
│   │   └── auth/                               # JWT + users
│   ├── types/                                  # TypeScript interfaces
│   └── middleware.ts                           # Protege painel, bloqueia /admin
├── scripts/warm-cache.sh                       # (desativado)
├── data/                                       # Volume Docker (users.json)
├── Dockerfile                                  # Multi-stage build (standalone)
├── docker-compose.yml
├── nginx.conf                                  # Proxy Next.js + Sofascore images
├── .env.local                                  # API keys (não comitado)
└── .env.example
```

---

## Analytics e Tags

Gerenciado pelo **Google Tag Manager** (`GTM-MMRXG48R`).
Para adicionar novos pixels: tagmanager.google.com → Tags → Nova → All Pages → Publicar.

| Serviço | ID | Via |
|---|---|---|
| **Google Tag Manager** | `GTM-MMRXG48R` | Código (layout.tsx) |
| **Google Analytics 4** | `G-GPNEBS61PX` | Tag no GTM |
| **Microsoft Clarity** | `wb3iawtabh` | Tag no GTM |

---

## APIs

### AllSportsApi (Sofascore) — RapidAPI Pro
- **Key**: em `.env.local`
- **Plano**: Pro ($19.99/mês, 10.000 req/mês)

### CBF API (Gratuita)
- **Base**: `https://gweb.cbf.com.br/api/site/v1`
- **Token**: `Cbf@2022!`
- **IDs 2026**: Série A (1260611), Série B (1260612), Copa do Brasil (1260615)

### WordPress REST API
- **Base**: `https://admin.papodebola.com.br/wp-json/wp/v2`
- **Auth**: Basic Auth (ivanalves + App Password em .env.local)

---

## Cluster SEO de Times

37 times × 6 páginas = **222 URLs**

### Série A 2026 (20 times):
Palmeiras (1963), Flamengo (5981), São Paulo (1981), Fluminense (1961), Bahia (1955), Athletico-PR (1967), Coritiba (1982), Atlético-MG (1977), Bragantino (1999), Vitória (1962), Botafogo (1958), Grêmio (5926), Vasco (1974), Internacional (1966), Santos (1968), Corinthians (1957), Cruzeiro (1954), Remo (2012), Chapecoense (21845), Mirassol (21982)

### Europa (17 times):
Real Madrid (2829), Barcelona (2817), Liverpool (44), Man City (17), Man United (35), Chelsea (38), Tottenham (33), Arsenal (42), Juventus (2687), Milan (2692), Inter Milan (2697), Bayern (2672), PSG (1644), Porto (3002), Nott. Forest (174), Aston Villa (40), Dortmund (2673)

### Navegação:
- **Menu "Times"**: só Série A com escudo
- **Menu lateral**: Série A + Europa
- **"Meu Time"**: favorito salvo em localStorage

---

## ISR

| Dados | Revalidação | Requests |
|---|---|---|
| Homepage | 30min | ~5 |
| Classificação | 1h | 1 |
| Bolinhas de resultados | — | 0 (dados já carregados) |
| Artigos | 30min | 1 (WordPress) |
| CBF Calendário | 12h | 3 |
| Esportes | 24h | ~8 |

**IMPORTANTE**: `standings-utils.ts` calcula form dots sem requests extras.

---

## Admin Panel

**URL**: `https://papodebola.com.br/painel-pdb-9x/login`
- `/admin` retorna 404

| Aba | Função |
|---|---|
| Artigos | CRUD artigos (WordPress) |
| Usuários | Criar/excluir + trocar senha (ícone cadeado) |
| Jogos | Placeholder |
| Config | Trocar senha + limpar cache ISR |

---

## Cron

Único cron ativo (projeto anterior):
```
*/30 * * * * /bin/bash /home/ivan/site-papodebola/cache/update.sh
```
Gera artigos via Claude → WordPress → Next.js lê via ISR.

---

## Nginx

Proxy reverso para Next.js. Mudanças vs anterior:
- Removido: `root /var/www/papodebola`, `try_files`, `/pdb-api/`
- Adicionado: `proxy_pass http://172.17.0.1:3000`
- Mantido: proxy imagens Sofascore (nginx cache 7d), SSL, redirects `.html→clean`
- Redirects: `/pages/noticias.html→/noticias`, `/artigos/*.html→/artigos/*`

---

## Design

| | |
|---|---|
| **Cor primária** | `#00965E` |
| **Fundo** | `#F2F3F5` |
| **Fonte** | Open Sans (next/font) |
| **Ícones** | Lucide React |
| **Componentes** | shadcn/ui |

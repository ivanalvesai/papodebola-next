# Papo de Bola — Next.js

Portal de futebol brasileiro e mundial. Migrado de HTML/CSS/JS estático para Next.js 16.

**URL produção**: https://papodebola.com.br
**URL staging**: https://development.papodebola.com.br
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
| **API esportes** | AllSportsApi (Sofascore) via RapidAPI — Pro $19.99/mês |
| **API calendário BR** | CBF API (gratuita) |
| **Geração de artigos** | Claude Sonnet (Anthropic API) via cron |
| **Analytics** | GA4 + Microsoft Clarity (via GTM) |
| **Auth admin** | JWT (jose) em httpOnly cookies |
| **Servidor** | Debian Linux, Docker |
| **Painel gestão** | aaPanel |
| **CDN/SSL** | Cloudflare (Full mode em prod, Flexible em dev) |

---

## Servidor

| | |
|---|---|
| **IP** | 138.117.60.14 |
| **Porta SSH** | 1822 |
| **Usuário** | ivan |
| **SSH Key** | `~/.ssh/debian_ed25519` |
| **Comando SSH** | `ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14` |

### Diretórios

| Diretório | Branch | Ambiente |
|---|---|---|
| `/home/ivan/papodebola-next` | `master` | **produção** |
| `/home/ivan/papodebola-next-dev` | `development` | **staging** |
| `/home/ivan/site-papodebola` | — | projeto antigo (rollback) |
| `/home/ivan/wordpress-papodebola` | — | WordPress Docker |
| `/www/server/panel/vhost/nginx/` | — | configs nginx do aaPanel |
| `/var/promote-keys/` | — | SSH key pro container executar promote |
| `/tmp/promote-jobs/` | — | estado dos jobs de promoção |

### Containers Docker

| Container | Porta host | Função |
|---|---|---|
| `papodebola-next` | 3000 | Next.js produção |
| `papodebola-next-dev` | 3001 | Next.js staging |
| `signsimples-nginx-1` | 80, 443 | Nginx proxy + SSL |
| `wordpress-papodebola-wordpress-1` | 8091 | WordPress headless |
| `wordpress-papodebola-db-1` | 3306 | MariaDB |

Os 2 containers Next compartilham o volume `papodebola-next_pdb-data` (via `pdb-data-shared` external no override do dev).

### Nginx no aaPanel

Configs em `/www/server/panel/vhost/nginx/`:
- `papodebola.com.br.conf` → proxy `127.0.0.1:3000` (prod, SSL Let's Encrypt)
- `development.papodebola.com.br.conf` → proxy `127.0.0.1:3001` (dev, HTTP only, SSL via Cloudflare Flexible)
- `admin.papodebola.com.br.conf` → WordPress :8091

**Proxy de imagens (logos de time/jogador `/img/team/*`, `/img/player/*`) — só o DEV bate no Sofascore (desde 2026-06-11).** Segue a mesma regra dos dados: apenas um ambiente consulta a API externa, o outro reaproveita.
- **Dev** (`development.papodebola.com.br.conf`): `proxy_pass https://api.sofascore.app/api/v1/{team,player}/` direto, com `proxy_cache` (zone `img_cache_pdb_dev`). É o único que contata o Sofascore.
- **Prod** (`papodebola.com.br.conf`): `proxy_pass http://127.0.0.1:80/img/{team,player}/` + `proxy_set_header Host development.papodebola.com.br` → cai no vhost do dev (loopback interno). Mantém cache próprio (`img_cache_pdb`) e só encaminha *miss* pro dev. **Nunca apontar prod direto pro Sofascore.**
- Ambos os blocks têm hardening contra rate-limit/IP block do Sofascore: `proxy_cache_use_stale ... http_403 http_429 ...` (serve cópia cacheada se o upstream der 403), `proxy_cache_valid 403/429 30s`, `proxy_cache_lock on`, `proxy_cache_background_update on`, `max_size=3g`. Ver Troubleshooting "Logos de times/jogadores sumiram".
- Por que: antes prod e dev batiam direto no Sofascore → dobrava requisições → Sofascore bloqueou o IP do servidor → todos os escudos quebraram (prod e dev). Backups dos confs: `*.bak.20260611-*`.

**Dev tem `proxy_read_timeout 600s`** pra suportar requests longos (ex: POST do botão Promover).

### Cache-Control: prod NÃO deixa CDN cachear HTML (2026-06-02)

O `papodebola.com.br.conf` tem um `map $upstream_http_content_type $pdb_cc` (topo do arquivo, contexto http) + override no `location /`:

```nginx
map $upstream_http_content_type $pdb_cc {
    default              $upstream_http_cache_control;   # estáticos: mantém o original
    "~*text/html"        "private, no-store, must-revalidate";
    "~*text/x-component" "private, no-store, must-revalidate";   # RSC
}
# ... dentro do location / :
proxy_hide_header Cache-Control;
add_header Cache-Control $pdb_cc always;
add_header Strict-Transport-Security "max-age=31536000" always;   # re-add: add_header no location anula o herdado
```

**Por quê:** o Next.js manda `Cache-Control: s-maxage=31536000` (1 ano) nas páginas pré-renderizadas. Se a CDN cacheia esse HTML, um deploy seguinte apaga os chunks JS que o HTML referencia → 404 do chunk → página trava ("Algo deu errado" / spinner infinito). Com `no-store` só no HTML/RSC, os `/_next/static/*` continuam `immutable` (cacheados pra sempre, hash muda por build) e o HTML sempre vem fresco. Backup do conf original em `*.conf.bak.TIMESTAMP`. Ver Troubleshooting "Página quebra após deploy".

---

## Fluxo de deploy — dev primeiro, depois promove

```
Edita (Windows/Claude ou aaPanel)
      │
      ▼
GitHub branch development
      │
      ▼
container dev (papodebola-next-dev :3001)
      │   URL: development.papodebola.com.br
      ▼
VALIDA visualmente
      │
      ▼ [promote.sh ou botão no painel]
GitHub branch master (merge commit)
      │
      ▼
container prod (papodebola-next :3000)
      │   URL: papodebola.com.br
      ▼
Purge Cloudflare (Purge Everything)
```

### Do lado do Ivan (Windows)

Branch local: **`development`** (nunca `master` direto).

Workflow padrão:
```powershell
cd C:\Users\ivans\Documents\papodebola-next
git pull --rebase origin development
# ... edita arquivos ...
git add .
git commit -m "msg"
git pushdev       # push + rebuild dev remoto num comando só
# valida em development.papodebola.com.br
git promote       # merge pra master + rebuild prod (SSH pro promote.sh)
```

**Aliases configurados em `.git/config` local:**
- `git pushdev` → `git push origin development && ssh ... "cd /home/ivan/papodebola-next-dev && git pull --rebase && bash rebuild.sh"`
- `git promote` → `ssh ... "bash /home/ivan/promote.sh"` (interativo, pede confirmação)

**Pre-push hook** em `.git/hooks/pre-push`: bloqueia push se branch local estiver atrás do remoto (evita sobrescrever trabalho das outras pessoas).

### Do lado das outras pessoas (aaPanel)

Editam arquivos direto em `/home/ivan/papodebola-next-dev/` via File Manager.

Watcher systemd (`papodebola-watch-dev.service`) detecta com inotify, espera 5s de debounce, e executa pipeline:
1. `git pull --rebase origin development`
2. `git add -A && git commit -m "auto(dev): edit via aaPanel TIMESTAMP"`
3. `git push origin development`
4. `bash rebuild.sh` (build + rollback se falhar)

Depois validam em `development.papodebola.com.br`. **Não** promovem direto — avisam alguém com acesso ou usam o botão do painel.

### Botão "Promover" no painel admin

**URL**: `https://development.papodebola.com.br/painel-pdb-9x/promote`
(também existe em prod mas geralmente usa via dev)

Fluxo interno:
1. GET mostra diff `origin/master..origin/development` (commits + arquivos) via SSH → wrapper → `git log`
2. POST dispara job async via SSH → wrapper `promote-async` → retorna `{jobId}`
3. Cliente faz polling `GET /api/promote?jobId=X` a cada 3s
4. Wrapper retorna `{status, output (últimas 200 linhas), exitCode}`
5. UI mostra log ao vivo + resultado final

Protegido por JWT (mesmo do painel) + SSH com forced command + token no header.

### Watcher do prod (DESATIVADO)

`papodebola-watch.service` existe mas está **disabled**. Prod só atualiza via `promote.sh`. Isso evita que uma edição acidental no workspace prod bypasse a revisão.

---

## Arquitetura de API (economia de banda)

> **Plano Pro $19.99/mês = requests ILIMITADOS.** NÃO existe cota de 10k req/mês
> (entendimento antigo, corrigido em 2026-06-11). Os limites reais são:
> - **Rate limit: 6 req/s** → estourar vira HTTP 429 (cadência interna fica em ~4 req/s).
> - **Bandwidth: 10 GB/mês** incluídos, depois $0,001/MB → é o **único custo** real.
>
> Logo, "economia" aqui é de **banda/rate-limit**, não de contagem de requisições.
> Pode encurtar TTL de dados live/hoje sem medo de quota; só evite respostas gigantes
> (ver [[incidente_sports_proxy_2mb]]) e bursts acima de 6 req/s.

```
                           ┌─────────────────────┐
                           │   AllSportsApi      │
                           │   (RapidAPI Pro)    │
                           │  req ilimitado      │
                           │  6 req/s · 10GB/mês │
                           └──────────▲──────────┘
                                      │
                      ┌───────────────┘
                      │ (única conexão direta)
                      │
  ┌──────────────────────────────────────────┐
  │  container dev (papodebola-next-dev :3001)│
  │  - fetch AllSportsApi direto              │
  │  - /api/sports-proxy/[...path]            │
  │    (revalidate 30min, auth header)        │
  └──────────────────────────────────────────┘
                      ▲
                      │ host.docker.internal:3001
                      │
  ┌──────────────────────────────────────────┐
  │  container prod (papodebola-next :3000)   │
  │  - SPORTS_PROXY_URL aponta pro dev        │
  │  - fallback direct se dev cair (runtime)  │
  │  - no build: skip direct (ENOTFOUND)      │
  └──────────────────────────────────────────┘
```

### fetchAllSports (`src/lib/api/allsports.ts`)

Resiliência contra caprichos da API (implementada nessa ordem):

1. **Semaphore in-memory** limita 2 requests simultâneas (`ALLSPORTS_MAX_CONCURRENT`)
2. Se `SPORTS_PROXY_URL` + `SPORTS_PROXY_TOKEN` setados → tenta proxy primeiro
3. **Fast-fail em ENOTFOUND/ECONNREFUSED** (sem retry — erro de DNS/rede é permanente)
4. Retry **apenas em HTTP 429**, com **tempo total limitado**: backoff 300/600/1200ms (cap 1500, max 3) ≈ ~2s no pior caso. **NÃO** ~15s — render não pode pendurar (ver incidente 504 de 20/06). `AbortSignal.timeout(8s)` por fetch aborta socket pendurado.
5. Se proxy falhar **durante build** (`NEXT_PHASE==='phase-production-build'`): skip direct, retorna null — ISR popula em runtime
6. **Fallback direct SÓ se o proxy estiver INACESSÍVEL** (`reason: "unreachable"` = ENOTFOUND/ECONNREFUSED/timeout). Se o proxy **respondeu erro http (429/5xx)**, devolve `null` e **NÃO** re-consulta direto — senão dobraria o hang e o prod bateria no rapidapi tomando 429 também (viola "só o dev consulta a API"). O cliente faz polling.
7. **HTTP 404 com body válido** é aceito (provider tem esse bug)
8. **HTTP 204 No Content** é sucesso com `data=null` (não é erro)
9. Body `{message: "... does not exist"}` é rejeitado
10. Qualquer outro 4xx é erro

> **Regra de ouro (pós-incidente 20/06):** nada que dependa da AllSportsApi pode **pendurar** num render
> (ISR/SSR). As chamadas são limitadas no tempo; quando a API está lenta/429, a página serve o que tem
> (ou semeia do fixture) e o **cliente preenche/atualiza via polling** (compartilhado, cacheado ~10s →
> N viewers = 1 chamada). Páginas de jogo: ISR + polling, nunca `force-dynamic`.

### Sports-proxy (`/api/sports-proxy/[...path]/route.ts`)

Apenas no dev (prod também expõe, mas ninguém acessa). Catch-all que:
- Valida `x-proxy-auth: SPORTS_PROXY_TOKEN`
- Repassa pra `https://allsportsapi2.p.rapidapi.com/api/[...path]` com API key
- `next: { revalidate: 1800 }` → Next.js cacheia 30min
- Propaga status e body originais (inclusive 404-with-body)

### Endpoints da AllSportsApi (atualizados)

A API mudou schemas e paths em 2026 — **padrão geral: `events/*` virou `matches/*`**:

| Antes (deprecated) | Agora |
|---|---|
| `team/{id}/events/next/0` | `team/{id}/matches/next/0` |
| `team/{id}/events/last/0` | `team/{id}/matches/previous/0` |
| `{sport}/events/live` | `{sport}/matches/live` |
| `{sport}/events/{d}/{m}/{y}` | `{sport}/matches/{d}/{m}/{y}` |
| `bestPlayers.goals` | `topPlayers.goals` (código suporta ambos) |

Endpoints `events/live` deprecated retornam `HTTP 404 text/plain` (não JSON) — por isso são detectados como erro e descartados. Código atualizado em `src/lib/data/sports.ts` e `src/lib/data/team.ts`.

### CBF API (gratuita)

- **Base**: `https://gweb.cbf.com.br/api/site/v1`
- **Auth**: `Authorization: Bearer Cbf@2022!`
- **Uso**: calendário BR (datas, horários, estádios)
- **IDs 2026**: Série A (1260611), Série B (1260612), Copa do Brasil (1260615)

### WordPress REST API

- **Base**: `https://admin.papodebola.com.br/wp-json/wp/v2`
- **Auth**: Basic Auth (user `ivanalves` + App Password em `.env.local`)

### Estimativa de consumo mensal

Como o plano é **ilimitado em requisições**, a "estimativa" abaixo é só ordem de grandeza —
o que importa é **não passar de 6 req/s** (rate limit) e **ficar dentro de 10 GB/mês** (banda).

| API | req/dia | req/mês | Observação |
|---|---|---|---|
| CBF | 6 | 180 | grátis |
| **AllSportsApi (só dev)** | ~130 | ~3.900 | sem limite de contagem; pesa só na banda |
| **Antes (dev+prod separados)** | ~260 | ~7.800 | manter só-dev reduz banda pela metade |

Prod build **não bate na API** (proxy não resolve no builder, skip direct, ISR popula depois).

---

## Envs por ambiente

### Prod (`/home/ivan/papodebola-next/.env.local`)
```
ALLSPORTS_API_KEY=...
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
ANTHROPIC_API_KEY=...
JWT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://www.papodebola.com.br   ← www (apex 301→www); era apex, mudou 15/06
REVALIDATION_SECRET=...
WP_APP_PASSWORD=...
WP_BASE_URL=https://admin.papodebola.com.br/wp-json/wp/v2
CBF_TOKEN=Cbf@2022!
SPORTS_PROXY_URL=http://host.docker.internal:3001/api/sports-proxy   ← só em prod
SPORTS_PROXY_TOKEN=<token compartilhado com dev>
# Web push (VAPID) — MESMO par em dev E prod (store de assinaturas é compartilhada)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:contato@papodebola.com.br
```

### Dev (`/home/ivan/papodebola-next-dev/.env.local`)
Mesmas variáveis **exceto** `SPORTS_PROXY_URL` (ausente, então dev chama direto). As chaves
VAPID são **idênticas** às do prod (a store de assinaturas vive no volume compartilhado).

---

## Scripts no servidor

| Script | Local | Função |
|---|---|---|
| `rebuild.sh` | `/home/ivan/papodebola-next/` e `/home/ivan/papodebola-next-dev/` | **Guard de disco (prune do build cache se `/` >75%)** + Build + tag `:previous` + up -d + health check + rollback automático se falhar |
| `watch-rebuild.sh` | `/home/ivan/papodebola-next-dev/` | Loop inotifywait → debounce 5s → pull/commit/push/rebuild |
| `promote.sh` | `/home/ivan/promote.sh` | Fetch, mostra diff, merge `development→master`, push, rebuild prod. Flag `-y` pula confirmação |
| `promote-wrapper.sh` | `/home/ivan/promote-wrapper.sh` | Despacha `SSH_ORIGINAL_COMMAND` em `preview` / `promote-async` / `status <jobId>` |

### SSH keys extras

| Chave | Uso | authorized_keys |
|---|---|---|
| `~/.ssh/papodebola_deploy` | GitHub deploy (servidor push/pull) | Adicionada no GitHub como Deploy Key (write access) |
| `~/.ssh/promote_executor` | Container dev chama host pra promover | `command="/home/ivan/promote-wrapper.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding` |

Também copiada em `/var/promote-keys/promote_executor` (owner UID 1001, chmod 400) pra container ler.

### Systemd services

| Service | Estado | Função |
|---|---|---|
| `papodebola-watch-dev.service` | **enabled** | Watcher automático do dev (debounce 5s) |
| `papodebola-watch.service` | **disabled** | Watcher do prod (não queremos edições diretas em prod) |

### Logs úteis

```bash
tail -f /home/ivan/papodebola-next-dev/logs/watch.log          # watcher dev
tail -f /home/ivan/papodebola-next-dev/logs/rebuild_*.log      # builds dev
tail -f /home/ivan/papodebola-next/logs/rebuild_*.log          # builds prod
tail -f /home/ivan/papodebola-next/logs/promote-audit.log      # auditoria promoções
ls /tmp/promote-jobs/                                           # jobs async (status + log)
```

### docker-compose.override.yml (só no dev)

Gitignored. Sobrescreve o compose base pra:
- `container_name: papodebola-next-dev`
- `ports: !override ["3001:3000"]`
- `volumes: !override [pdb-data-shared:/app/data, /var/promote-keys/promote_executor:/app/.ssh/promote_executor:ro]`
- `extra_hosts: host.docker.internal:host-gateway` (já está no compose base também)
- Envs `PROMOTE_SSH_*` pro container chamar host

### git config

Nos workspaces do servidor:
- `core.filemode false` — ignora mudanças de bit executável (aaPanel às vezes faz chmod em massa)
- SSH alias `github-papodebola` em `~/.ssh/config` → usa `papodebola_deploy`

---

## Estrutura de Arquivos

```
papodebola-next/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout (GTM, font, providers)
│   │   ├── page.tsx                            # Homepage
│   │   ├── loading.tsx / not-found.tsx / error.tsx
│   │   ├── sitemap.ts / robots.ts / manifest.ts
│   │   ├── ao-vivo/page.tsx
│   │   ├── noticias/page.tsx
│   │   ├── agenda/page.tsx
│   │   ├── futebol/[slug]/page.tsx             # Campeonato (classificação + rodadas)
│   │   ├── basquete/                           # /basquete (landing) + /basquete/nba
│   │   ├── boxe/page.tsx
│   │   ├── combate/page.tsx                    # conteúdo UFC
│   │   ├── esports/page.tsx
│   │   ├── formula-1/page.tsx
│   │   ├── futebol-americano/page.tsx          # conteúdo NFL
│   │   ├── futsal/page.tsx
│   │   ├── tenis/page.tsx
│   │   ├── volei/page.tsx
│   │   ├── parceiros/page.tsx                  # institucional
│   │   ├── artigos/[slug]/page.tsx             # Artigo com SEO
│   │   ├── sobre/contato/privacidade           # Institucional
│   │   ├── municipal/                          # Futebol municipal (SisGel)
│   │   ├── futebol/times/[slug]/               # Cluster SEO de times (222 URLs)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                        # HUB
│   │   │   ├── jogo-hoje/page.tsx
│   │   │   ├── onde-assistir/page.tsx
│   │   │   ├── escalacao/page.tsx
│   │   │   ├── proximos-jogos/page.tsx
│   │   │   └── estatisticas/page.tsx
│   │   ├── painel-pdb-9x/                      # Admin panel
│   │   │   ├── login/page.tsx
│   │   │   ├── artigos/usuarios/jogos/config
│   │   │   └── promote/page.tsx                # Botão promover (async + polling)
│   │   ├── studio-pdb/page.tsx                 # Editor de artigos (IA + Humanizer)
│   │   ├── api/
│   │   │   ├── auth/login/route.ts
│   │   │   ├── articles/ articles/[slug]/
│   │   │   ├── championship/[slug]/
│   │   │   ├── kanban/ kanban/write/ kanban/gallery/ etc.
│   │   │   ├── municipal/ custom-teams/ custom-leagues/ custom-games/
│   │   │   ├── upload/ users/ users/[username]/
│   │   │   ├── revalidate/                     # Força ISR (com REVALIDATION_SECRET)
│   │   │   ├── promote/route.ts                # Proxy pra SSH wrapper
│   │   │   └── sports-proxy/[...path]/route.ts # ← novo: proxy AllSportsApi
│   │   └── img/[type]/[id]/image/route.ts
│   ├── components/
│   │   ├── layout/ match-bar/ home/ sidebar/
│   │   ├── championship/ article/ seo/ ui/
│   ├── lib/
│   │   ├── config.ts                           # Torneios, times
│   │   ├── translations.ts                     # Status EN→PT-BR
│   │   ├── standings-utils.ts                  # Form dots sem API extra
│   │   ├── api/
│   │   │   ├── allsports.ts                    # ★ proxy + retry + concurrency
│   │   │   ├── cbf.ts
│   │   │   └── wordpress.ts
│   │   ├── data/                               # Data functions com ISR
│   │   │   ├── home.ts scorers.ts standings.ts
│   │   │   ├── championship.ts matches.ts team.ts sports.ts
│   │   │   ├── cbf-calendar.ts articles.ts
│   │   │   ├── custom-store.ts kanban-store.ts
│   │   ├── services/
│   │   │   ├── writer-agent.ts                 # Gerador de artigos (Claude + Humanizer)
│   │   │   ├── image-agent.ts image-sources.ts image-optimizer.ts
│   │   │   └── learning-store.ts
│   │   └── auth/                               # JWT + users
│   ├── types/
│   └── middleware.ts                           # Protege painel + /api/kanban + /api/promote
├── public/
│   ├── escudos-municipal/                      # ~76 escudos SisGel
│   └── favicons, og-image, simbolo
├── scripts/
│   ├── warm-cache.sh                           # (desativado)
│   ├── scrape-sisgel.js + update-sisgel.sh
├── data/                                       # Volume Docker (users.json, cache API)
├── Dockerfile                                  # node:20-alpine + openssh-client + /app/.ssh
├── docker-compose.yml                          # extra_hosts:host.docker.internal
├── nginx.conf                                  # (histórico, aaPanel gerencia ativo)
├── rebuild.sh                                  # gitignored
├── watch-rebuild.sh                            # gitignored
├── .env.local                                  # gitignored
└── .env.example
```

---

## Sistema de artigos

### Status: automação **DESLIGADA** (2026-05-13)

O cron `*/30 * * * * /bin/bash /home/ivan/site-papodebola/cache/update.sh` está comentado no crontab do user `ivan`. Backup do crontab original em `~/crontab.backup.20260513-172817`.

**Por quê desligado:** o `build-articles.js` lia RSS, reescrevia com Claude e publicava no WordPress sem dedupe semântico. Resultado: o mesmo artigo de "ciberseguranca-lidera-crescimento-de-vagas-no-brasil" foi publicado 21+ vezes (sufixos -2…-21), e o RSS trazia spam de cassinos online (instaspin, fresh-casino, winthrone, betsson, bet3000, kingmaker) que ia direto pro ar. 33 posts spam foram movidos pra lixeira do WP nessa mesma data.

**Como reativar (se algum dia for):** `crontab -e` no user `ivan`, remover o prefixo `# DESATIVADO em 2026-05-13 a pedido do Ivan:`. **Antes**, adicionar dedupe semântico no `build-articles.js` (hash do título canonicalizado) ou trocar as fontes de RSS — caso contrário o spam volta na primeira hora.

**Geração manual continua funcionando:** `/studio-pdb` (writer-agent com Humanizer + Rank Math 85+) é independente do cron e está OK.

### Fluxo (quando ligado)
```
RSS → Claude (humanizer + SEO) → WordPress → Next.js lê via ISR 30min
                                     │
                                     └─ mu-plugin papodebola-revalidate dispara /api/revalidate
```

### mu-plugin `papodebola-revalidate.php`

Instalado em 2026-05-13 em `/var/www/html/wp-content/mu-plugins/` no container `wordpress-papodebola-wordpress-1`. Como é must-use, carrega automaticamente sem precisar ativar.

**O que faz:** dispara POST não-bloqueante para `https://www.papodebola.com.br/api/revalidate` nos hooks `save_post`, `wp_trash_post`, `untrash_post`, `before_delete_post` e `transition_post_status`. Resultado: deletes/edições no WP somem do site em segundos, não em 30 min (TTL do ISR em `fetchWP`).

**Atenção URL:** usa `www.papodebola.com.br` porque o apex `papodebola.com.br` redireciona 301 no Cloudflare e POST não sobrevive a redirect. Se mudar essa regra DNS/CF, atualizar o plugin.

**Token:** `REVALIDATION_SECRET` está hard-coded no PHP (mesmo valor do `.env.local` do prod). Se rotacionar, atualizar nos dois lugares.

### Cron de push da Copa (`# copa-kickoff-push`)

No crontab do user `ivan`, de 1/min, aponta pro **dev** (quem consulta a API):
```
* * * * * curl -fsS "https://development.papodebola.com.br/api/push/cron/copa-kickoff?secret=<REVALIDATION_SECRET>" >/dev/null 2>&1 # copa-kickoff-push
```
Dispara push de **"começou o jogo"** e **"GOL"** da Copa (ver seção "Web push"). **Desligar
após a Copa** (comentar a linha). É barato: só consulta o feed ao vivo na janela dos jogos.

### Outros crons que NÃO mexem no Papo de Bola
Os crons "Ofertas Tech do Dia" e "Ofertas Canais (Telegram/WhatsApp)" do `/home/ivan/automacao-site` continuam ativos — apontam para outro WP (`WP_USER=admin_5sr4xje0`, projeto signsimples/AI Tecnologia). Não confundir.

---

## Web push (VAPID) — notificações

Sistema de push **próprio** (sem OneSignal), chaves VAPID, lib `web-push`. Instalado em 15/06.
Doc completo: `docs/deploys/2026-06-15/04-web-push.md`.

| Parte | Onde |
|---|---|
| Service worker | `public/sw.js` |
| Opt-in: botão no menu + modal "Eu quero" | `src/components/push/*`, `src/lib/push-client.ts` |
| Store assinaturas (volume compartilhado) | `src/lib/data/push-store.ts` → `data/push-subscriptions.json` |
| Envio | `src/lib/services/push.ts` (`sendToAll`) |
| Rotas | `/api/push/{subscribe,unsubscribe}` (públicas), `/api/push/send` (JWT), `/api/push/cron/copa-kickoff` (secret) |
| Painel | aba **Notificações** (`/painel-pdb-9x/notificacoes`) |

- **Chaves VAPID**: mesmas em dev e prod (store compartilhada). Ver "Envs por ambiente".
- **Disparo automático da Copa**: o cron `copa-kickoff-push` chama o endpoint; "começou o jogo"
  (1x, apito real ≤20min, dedup em `data/push-kickoffs.json`) e "GOL" (highwater de placar em
  `data/push-scores.json`). Fonte = `matches/live` filtrado por torneio id 16 → **qualquer fase
  futura funciona sem mudar código**.
- **Gotcha**: `web-push` é bundlado no server do Next (não em `node_modules`); pra enviar fora do
  painel, mintar JWT com `JWT_SECRET` (cookie `pdb_auth`, HS256, `jose`) e POST `/api/push/send`.
- **iOS**: só funciona em PWA instalado (limitação Apple).
- **Pendente**: alertas por time/campeonato (cadastro já tem campo `topics`); push ao publicar post no WP.

## SEO / AI crawlers (notas 15/06)

- **Host www**: `NEXT_PUBLIC_SITE_URL` aponta pro **www** (apex 301→www). Canonical/sitemap/OG batem.
- **Bots de IA liberados**: no Cloudflare → **AI Crawl Control** → "Manage robots.txt" foi
  **desligado**. Antes injetava `Disallow: /` pra GPTBot/ClaudeBot/Google-Extended. Agora vale o
  `src/app/robots.ts` (`Allow: /`). Se algum dia sumirem citações em IA, conferir esse toggle.
- **`/llms.txt`**: rota `src/app/llms.txt/route.ts` (guia pros agentes).
- **Schemas**: `src/components/seo/` — site (Organization+WebSite+SearchAction), article (NewsArticle),
  sports-team, sports-event, item-list, breadcrumb. Doc: `docs/deploys/2026-06-15/03-seo-marketing.md`.
- **Google Search Console via API** (service account, desde 20/06): cred em `C:/Users/ivans/.gsc/papodebola.json`
  (fora do repo). `node scripts/gsc-top-pages.mjs` (top páginas/queries) e `node scripts/gsc-inspect.mjs <url>`
  (status de indexação). Propriedade é **URL-prefix** (`https://www.papodebola.com.br/`), SA "Restrito" = só
  leitura (não reenvia sitemap/indexação via API). Doc: `docs/knowledge/2026-06-20-gsc-seo-copa-tenis.md`.
- **Páginas de jogo (Copa e Tênis) — SEO por status** (20/06): título/description mudam por status
  (encerrado mostra placar/resultado; futuro "horário/onde assistir/escalação"); bloco de pré-jogo
  (onde assistir + horário); schema `SportsEvent` com `location`/venue + organizer + superEvent; o
  `sitemap.ts` (revalidate runtime) lista as 72 páginas de jogo da Copa pra o Google descobrir antes do apito.
- **Tênis (Halle)**: o chaveamento vem dos **feeds por data** (`tennis/events/d/m/y`), não do `cuptrees`
  (que só traz o qualifying). Ver `getTennisDraw` em `src/lib/data/tennis.ts`.

---

## Campeonato Municipal (SisGel — Santana de Parnaíba)

`scripts/scrape-sisgel.js` raspa os campeonatos da prefeitura (HTML, regex) 2x/dia (cron `0 8,20`), gera `data/sisgel.json` e baixa escudos pra `public/escudos-municipal/`. `update-sisgel.sh` roda o scraper no workspace **de prod** e faz `docker cp` pro container (volume `/app/data` é compartilhado → dev e prod veem o mesmo arquivo). Frontend: `/municipal` (client component) lê via `/api/municipal`.

**Particularidades do HTML da prefeitura (descobertas em 2026-06-02):**

- **Rodadas são 0-indexed no site:** cada rodada é um `<li class="rodada" data-rodada="N">` e a nav usa `<span data-rodada="N">`. A "5ª Rodada" é `data-rodada="4"`. O scraper faz **`round = N + 1`** pra bater com a prefeitura.
- **Parse por container, não por proximidade:** `parseMatches` segmenta o HTML por container de rodada e parseia os jogos dentro de cada um. (A versão antiga detectava rodada via `indexOf` + lookback de 5000 chars e **descartava jogos** no fim de containers longos — a rodada 5 vinha com só 2 dos 6 jogos.)
- **Fase:** `parseRoundMeta` lê fase + rótulo da nav (ex: `Primeira Fase`, `5ª Rodada - Grupos`) e expõe em `roundMeta[round]`. A página mostra a fase acima do número da rodada.
- **Nomes divergem entre abas:** a aba EQUIPES usa nome completo ("UNIÃO DO PARQUE"), os blocos de jogo usam abreviado ("U PARQUE"). Por isso o mapa de escudos é por nome e os dois conjuntos quase não se sobrepõem.
- **Escudos re-baixados todo run:** `downloadBadges` antes pulava arquivo já existente (`if !exists`), então um escudo errado/stale nunca era corrigido (o União do Morro ficou com o escudo do Flamengo de um scrape antigo). Agora re-baixa sempre e só grava se os bytes mudarem (evita churn no git).
- **Atenção no promote:** o cron de prod baixa escudos novos como **untracked** no workspace de prod; o merge do `promote.sh` pode abortar por conflito. Solução: `git clean -fd public/escudos-municipal` no workspace de prod antes de promover (o merge restaura as versões commitadas).

---

## Cluster SEO de Times

**37 times × 6 páginas = 222 URLs**

### Série A 2026 (20 times)
Palmeiras (1963), Flamengo (5981), São Paulo (1981), Fluminense (1961), Bahia (1955), Athletico-PR (1967), Coritiba (1982), Atlético-MG (1977), Bragantino (1999), Vitória (1962), Botafogo (1958), Grêmio (5926), Vasco (1974), Internacional (1966), Santos (1968), Corinthians (1957), Cruzeiro (1954), Remo (2012), Chapecoense (21845), Mirassol (21982)

### Europa (17 times)
Real Madrid (2829), Barcelona (2817), Liverpool (44), Man City (17), Man United (35), Chelsea (38), Tottenham (33), Arsenal (42), Juventus (2687), Milan (2692), Inter Milan (2697), Bayern (2672), PSG (1644), Porto (3002), Nott. Forest (174), Aston Villa (40), Dortmund (2673)

### Sub-rotas por time
- `/futebol/times/{slug}` (HUB)
- `/futebol/times/{slug}/jogo-hoje`
- `/futebol/times/{slug}/proximos-jogos`
- `/futebol/times/{slug}/onde-assistir`
- `/futebol/times/{slug}/escalacao`
- `/futebol/times/{slug}/estatisticas`

URLs antigas (`/times/*` e `/campeonato/*`) têm 301 redirect em `next.config.ts` pra preservar SEO.

---

## ISR

| Dados | Revalidação | Requests |
|---|---|---|
| Homepage | 30min | ~5 |
| Classificação | 1h | 1 |
| Form dots | — | 0 (calcula local) |
| Artigos | 30min | 1 (WordPress) |
| CBF Calendário | 12h | 3 |
| Esportes (NBA/F1/etc) | 24h | ~8 |
| Times (páginas cluster) | 30min | via proxy |

### Rotas públicas principais

| Rota | Descrição |
|---|---|
| `/` | Homepage |
| `/futebol/[slug]` | Campeonato específico (Brasileirão, Libertadores, etc) |
| `/futebol/times/[slug]` | Hub do time |
| `/futebol/times/[slug]/{jogo-hoje,proximos-jogos,onde-assistir,escalacao,estatisticas}` | Subrotas cluster SEO |
| `/basquete` + `/basquete/nba` | Basquete (landing) + NBA (torneio) |
| `/boxe` `/combate` `/esports` `/formula-1` `/futebol-americano` `/futsal` `/tenis` `/volei` | Single-page por esporte |
| `/parceiros` | Institucional — parcerias comerciais |
| `/artigos/[slug]` | Artigo |
| `/noticias` `/ao-vivo` | Seções gerais |
| `/jogos-de-hoje` + `/jogos-de-hoje/futebol` | Jogos de hoje (multiesporte) + calendário CBF. **Era `/agenda` (301 desde 15/06)**. Padrão futuro `/jogos-de-hoje/{esporte}` |
| `/sp` → `/sp/santana-de-parnaiba` → `/sp/santana-de-parnaiba/municipal` | Hierarquia geográfica: estado (Paulista) → cidade (notícias + tabela 1ª div) → municipal SisGel. **`/municipal` virou 301 pra cá (15/06)** |

**Redirects 301/308 (em `next.config.ts`):** `/agenda*`→`/jogos-de-hoje*`, `/municipal`→`/sp/santana-de-parnaiba/municipal`, `/futebol/jogos-hoje`→`/jogos-de-hoje/futebol` (+ os antigos `/campeonato/*`, `/times/*`, `/esporte/*`).

Forçar revalidação manual:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"secret":"<REVALIDATION_SECRET>","paths":["/","/times/palmeiras"]}' \
  https://papodebola.com.br/api/revalidate
```

---

## Admin Panel

**URL**: `https://papodebola.com.br/painel-pdb-9x/login` (prod) ou `https://development.papodebola.com.br/painel-pdb-9x/login` (dev).
- `/admin` retorna 404 (rewrite no middleware)
- Sessão JWT 4h em cookie httpOnly

| Aba | Função |
|---|---|
| Artigos | CRUD artigos WordPress |
| Usuários | CRUD + trocar senha |
| Jogos | Placeholder |
| **Notificações** | Web push: nº de inscritos + envio manual (presets + form) pra todos |
| Config | Trocar senha + limpar cache ISR |
| **Promover** | Lista commits dev→prod + botão de promoção async |

Middleware protege `/painel-pdb-9x`, `/studio-pdb`, `/api/kanban`, `/api/ideas`, `/api/meu-kanban`, `/api/promote`, `/api/push/send`.
- Sem token: **API retorna 401 JSON**, páginas redirecionam para login.

### Studio + Kanbans (telas cheias, noindex, JWT)

Doc completo: `docs/knowledge/2026-06-20-studio-kanbans.md`. Navegação compartilhada: dropdown
**"Painel ▾"** (`src/components/studio/panel-menu.tsx`) em todas as telas do Studio.

| Tela | Rota | O que é |
|---|---|---|
| Studio | `/studio-pdb` | Kanban de **posts** (publicação de artigos: IA + Humanizer). Store `kanban-store.ts`, `/api/kanban` |
| **Mural de Ideias** | `/studio-pdb/ideias` | Kanban **compartilhado** de ideias/pendências do **site**. Store `ideas-store.ts` (`data/ideas.json`), `/api/ideas` |
| **Meu Kanban** | `/studio-pdb/meu-kanban` | Kanban **pessoal, isolado por `owner=session.username`** (admin e luke não veem o do outro). Multi-quadro agrupado por organização, colunas customizáveis. Store `personal-kanban-store.ts`, `/api/meu-kanban` |

- **Fotos nos cards**: `images: string[]` (várias, empilhadas) + lightbox com zoom
  (`image-lightbox.tsx`). Upload base64 → volume `data/{ideas,personal-kanban}-images/`, servido por
  route `?f=` (NÃO usar `/api/upload`, que grava em `public/` efêmero). Excluir card/quadro apaga as imagens.
- **Exclusão segura**: `useConfirm()` (`src/components/studio/use-confirm.tsx`) — modal próprio com
  "Cancelar" como padrão (Enter não apaga). Usado em todos os deletes dos kanbans.

---

## Analytics e Tags

GTM (`GTM-MMRXG48R`) gerencia:

| Serviço | ID |
|---|---|
| Google Analytics 4 | `G-GPNEBS61PX` |
| Microsoft Clarity | `wb3iawtabh` |

Novos pixels: tagmanager.google.com → Tags → Nova → All Pages → Publicar. **Não precisa mudar código.**

---

## Design

| | |
|---|---|
| Cor primária | `#00965E` (verde) |
| Cor live | `#E8312A` (vermelho) |
| Fundo | `#F2F3F5` |
| Fonte | Open Sans (next/font) |
| Ícones | Lucide React |
| Componentes | shadcn/ui |

---

## Troubleshooting

### Build de prod falha com "ENOTFOUND host.docker.internal"
Esperado: o `extra_hosts` só se aplica em runtime, não no build. O código já trata:
`fetchAllSports` detecta `NEXT_PHASE==='phase-production-build'` e pula o fallback direct, retornando null. Páginas renderizam vazias no SSG; ISR popula em runtime (ou chame `/api/revalidate`).

### Páginas com "Artilharia indisponível" em prod após promoção
Após rebuild, as páginas SSG estão vazias. Soluções:
1. Aguarde 30min (ISR revalida sozinho ao próximo hit)
2. Force imediato:
   ```bash
   curl -X POST -H 'Content-Type: application/json' \
     -d '{"secret":"<REVALIDATION_SECRET>","paths":["/","/campeonato/brasileirao"]}' \
     https://papodebola.com.br/api/revalidate
   ```
3. Acesse a página uma vez — segunda visita já vem populada

### 429 rate limit no build
`ALLSPORTS_MAX_CONCURRENT=2` limita; retry 5× com backoff. Se ainda estourar, diminua pra 1 ou aguarde reset.

### VPS inteira travou durante um build (disco cheio / build cache do Docker)

Sintoma (visto em 2026-06-13): durante um `next build`, **prod + dev + signsimples + WP caem juntos**. `ping` responde (~4ms), mas **SSH trava no "banner exchange"**, todo HTTP dá **000**, e o `journalctl --list-boots` mostra um gap de minutos sem log. É **I/O lockup por disco cheio**, NÃO RAM.

**Causa:** o `/` encheu (build cache do Docker chega a dezenas de GB) e o `docker compose build` escrevendo layers travou o I/O → processos em D-state → nem sshd/journald rodam.

**Diagnóstico:** `df -h /` (cheio?) e `docker system df` (Build Cache gigante?). `free -h` mostra RAM sobrando → confirma que **não é RAM** (aumentar RAM não resolve).

**Fix:** reboot (containers voltam pela restart policy) + liberar disco:
```bash
docker builder prune -f      # costuma liberar dezenas de GB
docker image prune -f
df -h /
```
Depois, rebuild **throttled** pra não travar de novo: `nohup nice -n 10 ionice -c2 -n7 bash rebuild.sh &` monitorando `uptime`/`df -h /`.

**Prevenção (já aplicada):** os dois `rebuild.sh` têm um guard no topo — se `/` > 75%, rodam `docker builder prune -f` antes do build. Pendência: mover `/var/lib/docker` pra um 2º disco no ESXi (isola o Docker do disco do SO). Doc completo: `docs/deploys/2026-06-13/01-incidente-disco-build-cache.md`.

### Push bloqueado pelo pre-push hook
Hook avisa: rode `git pull --rebase origin <branch>` e tente de novo. **Nunca use `git push --force`**.

### Watcher do dev criando commits com arquivos demais
Arquivos com permissão alterada (ex: aaPanel rodou chmod) aparecem como modified. Já está aplicado `git config core.filemode false` nos workspaces do servidor — se aparecer de novo em outro workspace, reaplique.

### Arquivos criados pelo aaPanel em paths estranhos
Às vezes o File Manager do aaPanel cria arquivos em paths aninhados (ex: `src/app/home/ivan/papodebola-next-dev/src/app/teste.txt`). Owner é `www`, precisa sudo pra limpar:
```bash
sudo rm -rf /home/ivan/papodebola-next-dev/src/app/home
```

### Site cai com 504 Gateway Timeout (Cloudflare) — páginas de jogo penduram

Incidente 20/06: páginas de jogo da Copa davam **504** (pior no mobile/tráfego), chegando a
afetar o servidor todo. **Causa**: a página `/futebol/copa-do-mundo/jogo/[data]/[slug]` estava
`export const dynamic = "force-dynamic"` → **sem cache**, refazia **4+ chamadas** à AllSportsApi
**por acesso**. Sob tráfego real → API devolvia **429 (rate-limit)** → os **retries com backoff
(até ~16s)** do `fetchAllSports` penduravam cada render até timeout → 504.

**Diagnóstico**: `curl` na página de jogo na origem (`:3000`) dava `000`/timeout enquanto home e
Copa hub (ISR) respondiam em 0.02s; `docker logs papodebola-next | grep 429` mostrava enxurrada de
`SportsProxy[...] 429 rate-limited, retry N/5`.

**Fix (3 camadas, todas em prod 20/06):**
1. **`force-dynamic` → `revalidate = 30`** (ISR): a página cacheia e serve na hora.
2. **`fetchAllSports` não cai mais pro fetch direto quando o proxy responde 429** (só se o dev estiver
   inacessível). Antes, no 429 o prod re-batia direto no rapidapi e tomava 429 também → **dobrava o
   hang** (15s proxy + 15s direto = 30s+ → 504). Agora devolve null rápido. Retries 429 limitados a ~2s
   (era ~15s) + `AbortSignal.timeout(8s)`.
3. **Cliente**: a página **semeia o `LiveMatch` do fixture** se o SSR não trouxe detalhe (nunca mostra
   "indisponível"); o **polling re-tenta em 5s** quando falha e **nunca sobrescreve a tela boa com vazio**.

O **ao vivo vem do polling do cliente** (`/api/copa/jogo/[id]`, TTL ~10s, compartilhado → N viewers =
1 call). **Regra: páginas que batem na API esportiva NUNCA `force-dynamic` — sempre ISR + polling.**
O 429 se auto-cura ao parar o burst; jogo encerrado cacheia 24h. Doc:
`docs/knowledge/2026-06-20-gsc-seo-copa-tenis.md`.

### Rollback manual de emergência (prod)
```bash
cd /home/ivan/papodebola-next
docker tag papodebola-next-nextjs:previous papodebola-next-nextjs:latest
docker compose up -d
```

### Parar watcher do dev temporariamente
```bash
sudo systemctl stop papodebola-watch-dev
# reativar:
sudo systemctl start papodebola-watch-dev
```

### Verificar auditoria de promoções
```bash
tail /home/ivan/papodebola-next/logs/promote-audit.log
```

### Container dev não responde mas prod tá OK
Proxy vai falhar → prod faz fallback direto pra AllSportsApi → dois ambientes batendo na API (mais banda + risco de passar de 6 req/s e tomar 429). Arrume o dev ASAP ou desative temporariamente `SPORTS_PROXY_URL` no `.env.local` do prod e recrie o container.

### Logos de times/jogadores sumiram (escudos quebrados em prod e dev)

Sintoma (visto em 2026-06-11): **todos** os escudos/fotos somem em prod E dev ao mesmo tempo. As imagens (`/img/team/*`, `/img/player/*`) são um proxy nginx que bate no Sofascore — **separado** da API de dados (AllSportsApi).

**Diagnóstico:** de fora dá 200, mas um burst de ~40 logos dá 403 em todos. No servidor:
```bash
curl -s -o /dev/null -w '%{http_code}\n' -H 'Referer: https://www.sofascore.com/' \
  https://api.sofascore.app/api/v1/team/1963/image    # 403 = IP do servidor bloqueado pelo Sofascore
```
Causa: requisições demais ao Sofascore (cache frio / dois ambientes batendo direto) → rate-limit → bloqueio do IP. Como o 403 não era cacheado, o nginx martelava e mantinha o bloqueio.

**Correções (já aplicadas, ver seção "Proxy de imagens"):**
1. Prod passou a consultar via dev (loopback), só dev bate no Sofascore.
2. `proxy_cache_use_stale ... http_403 ...` serve a cópia cacheada mesmo com upstream 403 → restaura os logos já cacheados na hora.
3. `max_size=3g` (fim da eviction churn) + `proxy_cache_valid 403/429 30s` (throttle).

**Recuperação:** logos já cacheados voltam imediato; os nunca-cacheados voltam quando o Sofascore desbloquear o IP (auto-cura ao parar de martelar). Melhoria pendente: Cache Rule "Cache Everything" pra `/img/*` no dashboard Cloudflare (hoje `Cf-Cache-Status: DYNAMIC`) tira quase toda a carga do origin.

### Post deletado no WP continua aparecendo no site
Verifique se o mu-plugin `papodebola-revalidate` está carregado:
```bash
ssh -i ~/.ssh/debian_ed25519 -p 1822 ivan@138.117.60.14 \
  "docker exec wordpress-papodebola-wordpress-1 wp plugin list --status=must-use --allow-root"
```
Se não aparecer, reinstale a partir de `wp-mu-plugins/papodebola-revalidate.php` (ver `wp-mu-plugins/README.md`). Para forçar revalidate manual:
```bash
curl -X POST -H 'Content-Type: application/json' \
  -d '{"secret":"<REVALIDATION_SECRET>","paths":["/","/noticias"]}' \
  https://www.papodebola.com.br/api/revalidate
```

### Página quebra após deploy ("Algo deu errado" / spinner infinito só na prod)

Sintoma clássico (visto em 2026-06-02 com `/municipal`): **dev funciona, prod quebra**, e o "Purge Everything" do Cloudflare não resolve. Causa: o Cloudflare guardou em cache o HTML **antigo** de uma página que você editou; esse HTML aponta pra um chunk JS (`/_next/static/chunks/XXX.js`) que o rebuild apagou → 404 do chunk → a página não hidrata.

**Por que só a página editada quebra:** páginas que você não tocou mantêm o mesmo hash de chunk, então o HTML cacheado ainda acha o arquivo. Só a editada muda de hash.

**Diagnóstico rápido (a origem quase sempre está OK — o problema é a CDN):**
```bash
# 1) chunk que a ORIGEM serve (sem Cloudflare) — deve dar 200
curl -s http://127.0.0.1:3000/SUA_ROTA | grep -o '/_next/static/chunks/[^"]*\.js' | head -1
# 2) chunk que o CLOUDFLARE serve — se for diferente e der 404, é cache da CDN
curl -s https://www.papodebola.com.br/SUA_ROTA | grep -o '/_next/static/chunks/[^"]*\.js' | head -1
# 3) prova: cache-buster ignora o cache da CDN e mostra o build certo
curl -s 'https://www.papodebola.com.br/SUA_ROTA?cb=123' | grep -o '/_next/static/chunks/[^"]*\.js' | head -1
```
Se a origem (`:3000`) está certa e o Cloudflare está errado, **NÃO adianta reimplantar** — o deploy já está em prod, o cache da CDN é que está velho.

**Correções:**
1. **Permanente (já aplicada):** nginx manda `no-store` no HTML — ver seção "Cache-Control" acima. Isso evita o problema em deploys futuros, mas **não limpa a entrada já cacheada**.
2. **Limpar a entrada presa:** "Purge Everything" às vezes não pega essa página (regra de cache / Always Online segurando). Tente **purge pela URL específica** (`https://www.papodebola.com.br/SUA_ROTA` + a versão apex), ou ligue **Development Mode** (Caching → Configuration) por 3h pra bypassar todo o cache na hora.
3. Não há token de API do Cloudflare no servidor — purge/regras só pelo dashboard.

### Quero reativar a geração automática de artigos
Hoje desligada (ver "Sistema de artigos"). Antes de descomentar o cron `*/30 ... update.sh`, adicione dedupe semântico no `build-articles.js` (hash do título canonicalizado contra `articles.json`) ou troque as fontes RSS — caso contrário o spam de cassinos e a duplicação de "ciberseguranca-lidera-crescimento-de-vagas-no-brasil" voltam na primeira hora.

---

## Checklist pra novos devs

1. Clone: `git clone https://github.com/ivanalvesai/papodebola-next.git`
2. Mude pra branch `development`: `git checkout development`
3. `npm install`
4. Crie `.env.local` com as chaves (peça pra um admin)
5. `npm run dev` — roda em `http://localhost:3000`
6. Configure aliases locais:
   ```
   git config --local alias.pushdev '!git push origin development && ssh ...'
   git config --local alias.promote '!ssh ... "bash /home/ivan/promote.sh"'
   ```
7. Instale o pre-push hook (copia do repo ou peça)
8. **Nunca** commita direto na `master`. Use o botão Promover ou `git promote`.
9. **Nunca** edita em `/home/ivan/papodebola-next/` no servidor — só em `-dev/`.
10. Após mudanças visuais, faça **Purge Everything** no Cloudflare.

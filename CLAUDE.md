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

Proxy de imagens Sofascore (`/img/team/*`, `/img/player/*`) funciona em prod e dev (cada um com seu `proxy_cache_path`).

**Dev tem `proxy_read_timeout 600s`** pra suportar requests longos (ex: POST do botão Promover).

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

## Arquitetura de API (economia de quota)

```
                           ┌─────────────────────┐
                           │   AllSportsApi      │
                           │   (RapidAPI Pro)    │
                           │   10k req/mês       │
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
4. Retry exponencial **apenas em HTTP 429** (rate limit): 500ms, 1s, 2s, 4s, 8s+jitter (max 5)
5. Se proxy falhar **durante build** (`NEXT_PHASE==='phase-production-build'`): skip direct, retorna null — ISR popula em runtime
6. Fallback direct em runtime (se proxy falhar por outro motivo)
7. **HTTP 404 com body válido** é aceito (provider tem esse bug)
8. **HTTP 204 No Content** é sucesso com `data=null` (não é erro)
9. Body `{message: "... does not exist"}` é rejeitado
10. Qualquer outro 4xx é erro

### Sports-proxy (`/api/sports-proxy/[...path]/route.ts`)

Apenas no dev (prod também expõe, mas ninguém acessa). Catch-all que:
- Valida `x-proxy-auth: SPORTS_PROXY_TOKEN`
- Repassa pra `https://allsportsapi2.p.rapidapi.com/api/[...path]` com API key
- `next: { revalidate: 1800 }` → Next.js cacheia 30min
- Propaga status e body originais (inclusive 404-with-body)

### Endpoints da AllSportsApi (atualizados)

A API mudou schemas e paths em 2026:

| Antes (deprecated) | Agora |
|---|---|
| `team/{id}/events/next/0` | `team/{id}/matches/next/0` |
| `team/{id}/events/last/0` | `team/{id}/matches/previous/0` |
| `bestPlayers.goals` | `topPlayers.goals` (código suporta ambos) |

### CBF API (gratuita)

- **Base**: `https://gweb.cbf.com.br/api/site/v1`
- **Auth**: `Authorization: Bearer Cbf@2022!`
- **Uso**: calendário BR (datas, horários, estádios)
- **IDs 2026**: Série A (1260611), Série B (1260612), Copa do Brasil (1260615)

### WordPress REST API

- **Base**: `https://admin.papodebola.com.br/wp-json/wp/v2`
- **Auth**: Basic Auth (user `ivanalves` + App Password em `.env.local`)

### Estimativa de consumo mensal

| API | req/dia | req/mês | % plano |
|---|---|---|---|
| CBF | 6 | 180 | — (grátis) |
| **AllSportsApi (só dev)** | ~130 | ~3.900 | **~39% do Pro** |
| **Antes (dev+prod separados)** | ~260 | ~7.800 | ~78% |

Prod build **não gasta quota** (proxy não resolve no builder, skip direct, ISR popula depois).

---

## Envs por ambiente

### Prod (`/home/ivan/papodebola-next/.env.local`)
```
ALLSPORTS_API_KEY=...
ALLSPORTS_API_HOST=allsportsapi2.p.rapidapi.com
ANTHROPIC_API_KEY=...
JWT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://papodebola.com.br
REVALIDATION_SECRET=...
WP_APP_PASSWORD=...
WP_BASE_URL=https://admin.papodebola.com.br/wp-json/wp/v2
CBF_TOKEN=Cbf@2022!
SPORTS_PROXY_URL=http://host.docker.internal:3001/api/sports-proxy   ← só em prod
SPORTS_PROXY_TOKEN=<token compartilhado com dev>
```

### Dev (`/home/ivan/papodebola-next-dev/.env.local`)
Mesmas variáveis **exceto** `SPORTS_PROXY_URL` (ausente, então dev chama direto).

---

## Scripts no servidor

| Script | Local | Função |
|---|---|---|
| `rebuild.sh` | `/home/ivan/papodebola-next/` e `/home/ivan/papodebola-next-dev/` | Build + tag `:previous` + up -d + health check + rollback automático se falhar |
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
│   │   ├── campeonato/[slug]/page.tsx          # Classificação + rodadas
│   │   ├── esporte/[slug]/page.tsx             # NBA, Tênis, F1, MMA
│   │   ├── artigos/[slug]/page.tsx             # Artigo com SEO
│   │   ├── sobre/contato/privacidade           # Institucional
│   │   ├── municipal/                          # Futebol municipal (SisGel)
│   │   ├── times/[slug]/                       # Cluster SEO de times (222 URLs)
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

Cron no projeto antigo (único ativo):
```
*/30 * * * * /bin/bash /home/ivan/site-papodebola/cache/update.sh
```

Fluxo:
```
RSS → Claude (humanizer + SEO) → WordPress → Next.js lê via ISR 30min
```

Também há geração manual via `/studio-pdb` (writer-agent com Humanizer + Rank Math 85+).

---

## Cluster SEO de Times

**37 times × 6 páginas = 222 URLs**

### Série A 2026 (20 times)
Palmeiras (1963), Flamengo (5981), São Paulo (1981), Fluminense (1961), Bahia (1955), Athletico-PR (1967), Coritiba (1982), Atlético-MG (1977), Bragantino (1999), Vitória (1962), Botafogo (1958), Grêmio (5926), Vasco (1974), Internacional (1966), Santos (1968), Corinthians (1957), Cruzeiro (1954), Remo (2012), Chapecoense (21845), Mirassol (21982)

### Europa (17 times)
Real Madrid (2829), Barcelona (2817), Liverpool (44), Man City (17), Man United (35), Chelsea (38), Tottenham (33), Arsenal (42), Juventus (2687), Milan (2692), Inter Milan (2697), Bayern (2672), PSG (1644), Porto (3002), Nott. Forest (174), Aston Villa (40), Dortmund (2673)

### Sub-rotas por time
- `/times/{slug}` (HUB)
- `/times/{slug}/jogo-hoje`
- `/times/{slug}/proximos-jogos`
- `/times/{slug}/onde-assistir`
- `/times/{slug}/escalacao`
- `/times/{slug}/estatisticas`

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
| Config | Trocar senha + limpar cache ISR |
| **Promover** | Lista commits dev→prod + botão de promoção async |

Middleware protege `/painel-pdb-9x`, `/studio-pdb`, `/api/kanban`, `/api/promote`.
- Sem token: **API retorna 401 JSON**, páginas redirecionam para login.

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

### Push bloqueado pelo pre-push hook
Hook avisa: rode `git pull --rebase origin <branch>` e tente de novo. **Nunca use `git push --force`**.

### Watcher do dev criando commits com arquivos demais
Arquivos com permissão alterada (ex: aaPanel rodou chmod) aparecem como modified. Já está aplicado `git config core.filemode false` nos workspaces do servidor — se aparecer de novo em outro workspace, reaplique.

### Arquivos criados pelo aaPanel em paths estranhos
Às vezes o File Manager do aaPanel cria arquivos em paths aninhados (ex: `src/app/home/ivan/papodebola-next-dev/src/app/teste.txt`). Owner é `www`, precisa sudo pra limpar:
```bash
sudo rm -rf /home/ivan/papodebola-next-dev/src/app/home
```

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
Proxy vai falhar → prod faz fallback direto pra AllSportsApi → gasta quota. Arrume o dev ASAP ou desative temporariamente `SPORTS_PROXY_URL` no `.env.local` do prod e recrie o container.

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

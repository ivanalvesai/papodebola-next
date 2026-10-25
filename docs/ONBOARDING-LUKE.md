# Começando no Papo de Bola — guia do Luke

Atualizado em 25/10/2026. O `CLAUDE.md` na raiz do repositório é a referência completa: servidor, deploy, API, CMS e troubleshooting. Este guia é o caminho mais curto pra começar a mexer.

---

## 1. Acessos que você já tem

| Onde | Acesso |
|---|---|
| **GitHub** `ivanalvesai/papodebola-next` | Colaborador `lukelinux` com escrita: push, branches, PRs. Configurações do repositório ficam com o Ivan, porque repositório pessoal não tem "admin" pra colaborador. |
| **Servidor** `138.117.60.14`, porta `1822` | Usuário `luke`, só por chave (senha desativada). Grupos `sudo` (sem senha) e `docker`: o mesmo poder do Ivan. |
| **Chave SSH** | `papodebola_luke` (OpenSSH) e `papodebola_luke.ppk` (PuTTY), que o Ivan te mandou. Ponha uma senha nela: `ssh-keygen -p -f ~/.ssh/papodebola_luke`. |
| **/cms** (Payload) | Peça ao Ivan um usuário com papel `admin`. |
| **Painel** `/painel-pdb-9x` e **Studio** `/studio-pdb` | Peça ao Ivan um usuário. |

> Com `sudo` + `docker` você tem poder de root no servidor inteiro, que também roda outros projetos (signsimples, WordPress, e-mail). Mexa só no que é do Papo de Bola: `/home/ivan/papodebola-next*`, containers `papodebola-*` e `pdb-postgres`.

---

## 2. Preparar o computador (uma vez)

### 2.1 SSH

Copie `papodebola_luke` para `C:\Users\<você>\.ssh\` e crie ou edite `C:\Users\<você>\.ssh\config`:

```
Host papodebola
    HostName 138.117.60.14
    Port 1822
    User luke
    IdentityFile ~/.ssh/papodebola_luke
```

Teste. Na primeira vez ele pergunta do host key; responda `yes`:

```bash
ssh papodebola "whoami && sudo -n true && echo sudo-ok && docker ps --format '{{.Names}}' | grep papodebola"
```

Tem que aparecer `luke`, `sudo-ok` e os containers `papodebola-next` / `papodebola-next-dev`.

### 2.2 Projeto

Precisa de Git e Node 20.

```bash
git clone https://github.com/ivanalvesai/papodebola-next.git
cd papodebola-next
git checkout development
npm install
```

### 2.3 `.env.local`

O arquivo **não está no Git**, porque tem chaves de API. Peça ao Ivan por um canal privado (nunca commitar nem colar em issue ou PR). A lista de variáveis está em `.env.example` e na seção "Envs por ambiente" do `CLAUDE.md`.

Localmente, o Postgres do Payload só existe no servidor. Por isso o `/cms` e os posts não carregam no `npm run dev`; o resto do site funciona. Pra testar algo de CMS, use o dev remoto (seção 3).

```bash
npm run dev        # http://localhost:3000
npm test           # testes unitários (node --test)
npm run typecheck  # tsc
```

### 2.4 Atalhos de deploy (aliases) e hook

Rode **dentro da pasta do projeto**. São os mesmos atalhos do Ivan, ajustados pro seu usuário: os workspaces e a chave do GitHub no servidor são do usuário `ivan`, então os scripts rodam como `ivan` via `sudo`.

```bash
git config --local alias.pushdev '!git push origin development && ssh papodebola "sudo -iu ivan bash -lc '"'"'cd /home/ivan/papodebola-next-dev && git pull --rebase origin development && bash rebuild.sh'"'"'"'
git config --local alias.promote '!ssh -t papodebola "sudo -iu ivan bash /home/ivan/promote.sh"'

# hook que bloqueia push se você estiver atrás do remoto (evita sobrescrever trabalho do Ivan)
cp scripts/git-hooks/pre-push .git/hooks/pre-push
```

No Windows, use o **Git Bash** pra esses comandos. As aspas do PowerShell são diferentes.

---

## 3. Fluxo de trabalho do dia a dia

```
edita no PC → commit → git pushdev → valida em development.papodebola.com.br → git promote → produção
```

```bash
git pull --rebase origin development    # sempre antes de começar
# ... edita ...
npm test && npm run typecheck
git add <arquivos>
git commit -m "fix: descrição curta"
git pushdev        # push + rebuild do dev (~5 min, rollback automático se o build falhar)
# abre https://development.papodebola.com.br e confere
git promote        # merge development → master + rebuild da produção (pede confirmação)
```

Regras:

- **Nunca** commitar na `master`. Ela só muda pelo `promote`.
- **Nunca** `git push --force`.
- Se o hook bloquear o push, rode `git pull --rebase origin development` e tente de novo.
- Promote demorado: se o SSH puder cair, rode no servidor com `nohup` (veja 6).
- Depois de promover mudança visual: **Purge Everything** no Cloudflare. Hoje só o Ivan tem acesso; peça o seu.
- Outra opção pro promote: o botão **Promover** em `development.papodebola.com.br/painel-pdb-9x/promote`.

---

## 4. Regras que não podem quebrar (aprendidas em incidentes)

1. **Só o container dev consulta a API de esportes** (AllSportsApi/RapidAPI). A produção pega pelo proxy do dev. O mesmo vale pras imagens de escudo.
2. **Página que usa a API de esportes nunca pode ser `force-dynamic`.** Sempre ISR (`revalidate`) + polling no cliente. O `force-dynamic` derrubou o site com 504 em 20/06.
3. **A API tem rate limit de 6 req/s e 10 GB/mês de banda.** Nada de loop de chamadas; tudo em cache.
4. **O banco (Postgres do Payload) é compartilhado entre dev e prod.**
   - Publicar no dev publica na produção.
   - Mudança de schema só com DDL **aditivo** (CREATE/ADD), com backup antes. Receita no `CLAUDE.md`.
   - Depois de mexer em config do Payload, confira se o CMS sobe: `docker logs papodebola-next-dev | grep payloadInitError` tem que vir vazio.
5. **Disco do servidor em ~92%.** O `rebuild.sh` limpa o cache de build sozinho acima de 75%. Se o servidor travar no build, é disco, não RAM (ver Troubleshooting no `CLAUDE.md`).
6. **`seasonId` dos campeonatos vira todo ano:** europeus em agosto, brasileiros e sul-americanos em janeiro (`src/lib/config.ts`). Em 25/10 os europeus ainda estavam na temporada passada.

---

## 5. Claude Code no seu computador

O `CLAUDE.md` do projeto manda usar a chave e o usuário do Ivan (`debian_ed25519` / `ivan`). Crie um **`CLAUDE.local.md`** na raiz do projeto. Ele não vai pro Git (está no `.gitignore`) e corrige isso:

```markdown
# Ambiente do Luke

- Acesso ao servidor: `ssh papodebola` (usuário `luke`, chave `~/.ssh/papodebola_luke`). NÃO usar `debian_ed25519` nem o usuário `ivan`.
- `luke` tem sudo sem senha e grupo docker.
- Comandos que o CLAUDE.md descreve como do `ivan` (git pull nos workspaces, rebuild.sh, promote.sh) rodam como `ivan` via:
  `ssh papodebola "sudo -iu ivan bash -lc 'cd /home/ivan/papodebola-next-dev && <comando>'"`
- Deploy: `git pushdev` / `git promote` (aliases locais).
```

---

## 6. Comandos úteis no servidor

```bash
ssh papodebola

# logs
docker logs --since 30m papodebola-next-dev 2>&1 | tail -50        # dev
docker logs --since 30m papodebola-next 2>&1 | tail -50            # prod
tail -f /home/ivan/papodebola-next-dev/logs/rebuild_*.log          # build do dev
tail /home/ivan/papodebola-next/logs/promote-audit.log             # histórico de promoções

# promote sem depender da conexão SSH
sudo -iu ivan bash -lc 'nohup bash /home/ivan/promote.sh -y > /tmp/promote.log 2>&1 &'
tail -f /tmp/promote.log

# rollback de emergência da produção
sudo -iu ivan bash -lc 'cd /home/ivan/papodebola-next && docker tag papodebola-next-nextjs:previous papodebola-next-nextjs:latest && docker compose up -d'

# disco
df -h / && docker system df
```

---

## 7. O que mudou em 25/10/2026 (auditoria de SEO)

Documentos: `docs/superpowers/specs/2026-10-25-seo-retencao-teia-do-jogo-design.md` (o porquê) e `docs/superpowers/plans/2026-10-25-seo-retencao-teia-do-jogo.md` (o como). Em produção desde o promote `a36b65a`.

**Diagnóstico (Google Search Console, 28 dias):**
- 5,7 milhões de impressões e 6,7 mil cliques: CTR de 0,12%, posição média ~9.
- 89% dos cliques vêm das páginas de time (`/futebol/times/{time}/...`). A aba "próximos jogos" tem 3,7 mi de impressões e CTR de 0,08%; "onde assistir" tem 0,87%.
- As páginas eram beco sem saída e as notícias pararam em ~28/09.

**O que entrou:**
- **Links:** todo card de jogo leva à página do jogo, e os nomes dos times levam às páginas deles (`src/lib/match-href.ts`, `src/components/team/match-link.tsx`).
- **Rodapé nas abas do time** (`src/components/team/team-cross-links.tsx`): notícias do time, posição na tabela, próximo adversário. H1 próprio por aba.
- **Campo "Times" nos posts** (`/cms` → Posts): a notícia aparece sozinha nas páginas daquele time e dos jogos dele. **Preencha sempre ao criar post.**
- **Títulos dinâmicos:** por exemplo, "Próximo jogo do Palmeiras: x Santos, qua 28/10, 19h30". No `/cms` dá pra usar `{adversario} {data} {hora} {campeonato}` no título de SEO das abas do time.
- **Página de jogo:** antes do jogo mostra quando é, onde assistir, como chegam e notícias; o título muda depois do jogo.
- **Técnico:** feed RSS em `/feed.xml`, sitemap de notícias em `/news-sitemap.xml`, sitemap com todos os posts, imagens antigas `.jpg` redirecionando pro `.webp`, 410 pra URLs mortas, `/favicon.svg` (404 em toda página) corrigido.
- **Bugs graves corrigidos:**
  - Campeonatos europeus mostravam a temporada passada.
  - "Jogos de hoje" mostrava "Nenhum jogo" em domingo sem Brasileirão (agora inclui as ligas europeias).
  - O schema mandava pro Google os jogos do Brasileirão como "Copa do Mundo FIFA 2026".

**Pra medir:** `node scripts/gsc-report.mjs` (precisa da credencial do Search Console, que fica fora do repositório; peça ao Ivan). Comparar daqui a ~28 dias.

---

## 8. Próximos passos que mais importam

1. **Voltar a publicar notícias todo dia (3 a 5 posts).** É o que mais segura o leitor e o que pode levar o site ao Google Notícias e ao Discover (a entrada lá é automática; não existe mais cadastro).
   - Priorize pré-jogo e pós-jogo dos times com mais busca: Flamengo, Palmeiras, Corinthians, Vasco, Santos, Grêmio, Botafogo, Sport, Vila Nova, Remo.
   - Roteiro do pré-jogo: "{Casa} x {Fora}: onde assistir, horário e escalações"; seções Onde assistir · Horário e local · Como chegam · Prováveis escalações · Desfalques · link pra página do jogo.
   - Campos **Times** e **ID do jogo** preenchidos.
2. **Conteúdo com algo próprio** (dados, análise, cobertura local do municipal). Não reescrever matéria do ge ou do Lance.
3. **Página de política editorial** (ainda não existe) e autores reais nos posts.
4. **Pendências pequenas** (lista "Deferred minors" no plano de 25/10): título de jogo adiado, `cache()` na página de jogo, tipo da imagem no RSS.

---

## 9. Tarefas comuns: onde mexer e comandos

Regra geral: **conteúdo, textos e SEO se editam no `/cms`**, sem código e sem deploy (vale na hora, dev e prod, porque o banco é compartilhado). **Layout, componentes e dados novos se fazem em código** e passam por `pushdev` → validar → `promote`.

Antes de qualquer tarefa de código:

```bash
cd papodebola-next
git checkout development
git pull --rebase origin development
npm install          # só se o package.json mudou
```

### 9.1 Criar uma página (sem código)

`/cms` → **Páginas** → *Create new*:

- **Título** e **Caminho**, por exemplo `/futebol/guia-do-brasileirao`. Vazio = `/paginas/{slug}`.
- Monte com blocos: texto, hero, cards, FAQ, formulário, jogos de hoje, classificação, artilharia, feed de notícias, jogo ao vivo etc. O **Live Preview** mostra no celular, tablet e desktop.
- Aba **SEO**: meta title e description.
- Salve como **rascunho**, confira em `/cms-preview/pagina/{id}` e publique.
- Se o caminho já existir em código, a rota do código ganha.

Guia do editor: `/cms-guia` (logado). Doc técnico: `docs/knowledge/2026-09-30-cms-page-builder.md` e `2026-10-01-cms-elementor.md`. A pasta `docs/knowledge` não está no Git; peça ao Ivan se precisar.

### 9.2 Editar SEO (sem código)

| O quê | Onde |
|---|---|
| Home, `/sobre`, hub da Copa e as ~35 rotas em código (title, description, textos) | `/cms` → **Textos e SEO** (collection `pageTexts`, um documento por rota; aceita padrões como `:slug`) |
| Nome do site, título e descrição padrão | `/cms` → **Configurações do site** (`siteSettings`) |
| Cada time e cada aba (hub, próximos jogos, jogo de hoje, onde assistir, escalação, estatísticas) | `/cms` → **Times** → o time → grupos de SEO por aba. Aceita `{adversario} {data} {hora} {campeonato}`. Deixar o texto padrão = título dinâmico automático. |
| Post | `/cms` → **Posts** → campo **SEO** (meta title/description) + **Resumo** |
| Página criada no CMS | aba SEO da própria página |

Depois de salvar, a página se revalida sozinha. Se não atualizar, use a revalidação forçada da seção 9.6.

### 9.3 Publicar uma notícia (sem código)

`/cms` → **Posts** → *Create new*:

- Título, categoria, capa (a imagem vira WebP sozinha), conteúdo no editor visual (aceita embed de X, Instagram e YouTube).
- **Times** (sempre), **ID do jogo** (pré-jogo e pós-jogo), autor, resumo.
- Dá pra agendar (Schedule Publish).
- O `/studio-pdb` gera rascunho com IA + Humanizer. Revise antes de publicar.

### 9.4 Criar uma página em código (rota nova)

```bash
# 1. cria a rota
mkdir -p "src/app/(site)/minha-rota"
#    e escreve src/app/(site)/minha-rota/page.tsx (copie o padrão de uma rota parecida,
#    ex.: src/app/(site)/sobre/page.tsx, com generateMetadata via buildMetadata)

# 2. obrigatório quando cria pasta nova em src/app (senão um teste falha)
npm run gen:paths

# 3. se a página deve ser indexada, adicione no src/app/sitemap.ts

# 4. confere
npm run dev            # http://localhost:3000/minha-rota
npm test
npm run typecheck

# 5. sobe
git status        # confira: nada de .env, chave ou arquivo solto
git add "src/app/(site)/minha-rota" src/cms/lib/reserved-paths.generated.ts src/app/sitemap.ts
git commit -m "feat: página minha-rota"
git pushdev            # valida em development.papodebola.com.br/minha-rota
git promote
```

Se a página usa a API de esportes: `export const revalidate = 300` (ou mais). **Nunca** `force-dynamic`.

### 9.5 Mexer em times, campeonatos e temporadas (código)

- **Campeonatos e temporadas:** `src/lib/config.ts` (`TOURNAMENTS`: `id`, `seasonId`, `slug`). Pra achar a temporada atual:
  ```bash
  ssh papodebola 'T=$(grep ^SPORTS_PROXY_TOKEN= /home/ivan/papodebola-next/.env.local | cut -d= -f2-); curl -s -H "x-proxy-auth: $T" http://127.0.0.1:3001/api/sports-proxy/tournament/17/seasons | head -c 300'
  ```
  (troque o `17`, que é a Premier League, pelo id do campeonato)
- **Times:** a identidade e o SEO de todos os 57 ficam no `/cms` → Times. O `config.ts` (`TEAMS`) é a rede de segurança se o banco cair.
- **Componentes das páginas de time:** `src/components/team/` (classic/, match-hero, team-cross-links).
- **Página de jogo:** `src/app/(site)/futebol/[slug]/jogo/[data]/[match]/page.tsx` + `src/components/match/match-preview.tsx`.

### 9.6 Comandos rápidos

```bash
npm run dev                      # site local
npm test                         # testes
npm run typecheck                # TypeScript
git pushdev                      # sobe pro dev
git promote                      # sobe pra produção

# forçar revalidação de páginas em produção (o secret está no .env.local: REVALIDATION_SECRET)
curl -X POST -H 'Content-Type: application/json' \
  -d '{"secret":"<REVALIDATION_SECRET>","paths":["/","/futebol/times/flamengo"]}' \
  https://www.papodebola.com.br/api/revalidate

# medir SEO (credencial do Search Console com o Ivan)
node scripts/gsc-report.mjs
```

### 9.6.0 /cms local com CÓPIA do banco (recomendado)

No `npm run dev` o `/cms` não abre porque o Postgres só existe dentro da rede Docker do servidor, e ele é o banco de produção. O jeito seguro é rodar uma **cópia** no seu PC: você mexe à vontade e nada chega no site no ar. O banco tem ~58 MB. Precisa do **Docker Desktop**.

```bash
# 1. baixa uma cópia atual do banco (Git Bash, na pasta do projeto)
ssh papodebola "docker exec pdb-postgres pg_dump -U pdb -d pdb_payload --no-owner --no-privileges" > pdb_local.sql

# 2. sobe um Postgres 16 local (mesma versão do servidor)
docker run -d --name pdb-local -e POSTGRES_USER=pdb -e POSTGRES_PASSWORD=pdb -e POSTGRES_DB=pdb_payload -p 5432:5432 postgres:16-alpine
sleep 5

# 3. restaura a cópia
docker exec -i pdb-local psql -q -U pdb -d pdb_payload < pdb_local.sql

# 4. no .env.local, aponte pro banco local:
#    DATABASE_URI=postgres://pdb:pdb@127.0.0.1:5432/pdb_payload
#    (mantenha PAYLOAD_SECRET igual; NÃO adicione PAYLOAD_DB_PUSH)

# 5. reinicia o npm run dev → http://localhost:3000/cms
#    Login: os mesmos usuários do /cms de produção.

# atualizar a cópia depois (apaga a local e baixa de novo):
docker exec pdb-local psql -q -U pdb -d postgres -c "DROP DATABASE pdb_payload" -c "CREATE DATABASE pdb_payload OWNER pdb"
docker exec -i pdb-local psql -q -U pdb -d pdb_payload < pdb_local.sql
```

- **Imagens:** os arquivos de mídia ficam no volume do servidor, então as capas aparecem quebradas no local. Pra ter as imagens (~69 MB): `ssh papodebola "docker exec papodebola-next tar -C /app/data -cf - cms-media" | tar -C data -xf -` (cria `data/cms-media`, que não vai pro Git).
- **`pdb_local.sql` tem dados reais** (usuários, e-mails, senhas criptografadas). Não comite (já está no `.gitignore`) nem compartilhe.
- O que você salvar no `/cms` local fica **só na cópia**. Pra valer no site, faça no `/cms` de produção (ou do dev, que é o mesmo banco).

### 9.6.1 /cms local (túnel pro banco) — evite (é o banco de PRODUÇÃO)

No `npm run dev` o `/cms` não abre: o Postgres só existe dentro da rede Docker do servidor (`pdb-net`), sem porta no host. Dá pra abrir um túnel, mas **é o banco de PRODUÇÃO**: salvar ou publicar no `/cms` local vale no site no ar. Na dúvida, teste no dev remoto (`git pushdev`).

```bash
# 1. IP do container do Postgres (muda se o container reiniciar)
ssh papodebola "docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' pdb-postgres"

# 2. túnel (deixe esse terminal aberto); troque <IP> pelo valor acima
ssh -N -L 5433:<IP>:5432 papodebola

# 3. no .env.local, DATABASE_URI apontando pra 127.0.0.1:5433 (mesmo usuário/senha/banco)
#    NUNCA ponha PAYLOAD_DB_PUSH=true no seu .env.local: o Payload alteraria o schema
#    da produção pra bater com o seu código local.
```

### 9.7 Mudar o schema do CMS (collections e campos novos)

É o único ponto que pode derrubar o `/cms` inteiro. O Payload em produção **não** cria tabela sozinho.

1. Edite `src/payload.config.ts` (ou `src/cms/collections/*`).
2. Gere e aplique **só o DDL aditivo** (CREATE TABLE / ADD COLUMN), com backup antes. Receita completa na seção "Receita de migrations" do `CLAUDE.md`. Exemplo real: `~/pdb-ddl-20261025-posts-teams.sql` no servidor.
3. **Nunca** dar a um array ou bloco o nome `texts`, `numbers` ou `rels` sem `dbName`: colide com tabelas internas e quebra o CMS.
4. Depois do deploy: `docker logs papodebola-next-dev 2>&1 | grep payloadInitError` tem que vir vazio.

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

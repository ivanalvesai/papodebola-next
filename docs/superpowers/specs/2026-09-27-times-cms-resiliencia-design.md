# Times no CMS + site resiliente sem a API + correção de páginas quebradas

Data: 27/09/2026 · Autor: Claude (aprovação delegada pelo Ivan: "execute tudo sem me perguntar")

## 1. Entendimento

**O que o Ivan pediu (literal):**
- Retomar a análise do site para destravar o AdSense (recusa por "conteúdo de baixo valor", 23/09).
- Copiar **todos os times** para o CMS, para editar todo o SEO sem deploy.
- Corrigir as páginas com erro (404 etc.).
- As páginas precisam **funcionar sem a API de esportes**: se ela parar, os dados não podem sumir do site.
- Entregar pronto, validado e testado (frontend com o `agent-browser`), sem perguntas no meio.

**Suposições (decididas por mim):**
- "Todos os times" = os 37 que ainda vivem no `config.ts` (20 da Série A + 17 da Europa). A Série B (20) já está no CMS desde 26/06.
- Visual das páginas **não muda** no dia da troca. O ganho é poder editar.
- Os blocos de dados continuam vindo da API; o CMS guarda identidade, textos, SEO e layout.
- O `config.ts` **continua** como registro de identidade dos 37 times. Ele é a rede de segurança: se o Postgres cair, as páginas desses times seguem no ar. Não é vestígio.
- Publicar os docs dos times no CMS está autorizado por esta ordem do Ivan (a regra "nunca publicar sem ordem" é satisfeita).

**Critérios de sucesso:**
1. As 57 × 6 = 342 páginas de time renderizam pelo CMS, com SEO editável **por aba**.
2. HTML das páginas migradas igual ao de antes (fora do que foi corrigido de propósito).
3. Com a API desligada, toda página que já foi vista uma vez continua mostrando os últimos dados salvos.
4. Nenhuma URL do sitemap ou de link interno devolve 404/5xx.
5. Build de produção limpo, init do Payload sem `payloadInitError`, teste visual no navegador ok.

## 2. Frentes

### A. Resiliência: último dado bom salvo em disco para TODA chamada à API

**Problema.** Só championship, standings, worldcup, getMatchDetail e rodadas têm snapshot. Dados de time (próximos jogos, resultados, artilharia), `/tenis`, `/nba`, esportes, `/ao-vivo`, transferências etc. somem se a API parar.

**Abordagens consideradas:**
1. *Embrulhar cada função de dados com `withSnapshot`* — dezenas de pontos, fácil esquecer um.
2. **Cache durável dentro do `fetchAllSports` (recomendada)** — um ponto só, cobre tudo o que existe e o que vier.
3. *Crawler que salva páginas HTML* — congela visual, não serve o cliente/polling, duplica o site.

**Desenho (abordagem 2):**
- `fetchAllSports` passa a separar "API respondeu" de "API falhou" (`{ ok, data }`). HTTP 204 continua sendo sucesso com `data = null` (não é falha).
- Sucesso com dado → grava `data/api-cache/{sha1(endpoint)}.json` = `{ endpoint, savedAt, data }`.
  - Escrita atômica (tmp + rename), no máximo **1 escrita por endpoint a cada 10 min por processo** (o corpo da função roda mesmo quando o fetch vem do cache do Next).
  - Não grava respostas > 5 MB (feeds por data do tênis têm ~9 MB e já são pulados).
- Falha (`ok: false`) → lê o último dado bom do disco e devolve.
  - **Exceção:** endpoints ao vivo (`revalidate < 60`, ex.: `matches/live`, placar em andamento) **não** caem para o disco. Dado velho de "ao vivo" é pior que vazio (lição do incidente de 16/07, placares falsos).
- Volume `data/` já é compartilhado dev/prod → o que o dev grava, a prod lê.
- Build: o builder não tem o volume; leitura falha e devolve `null` como hoje.
- **Dado velho de "próximos jogos"**: `getTeamPageDataFor` descarta da lista de próximos jogos os que começaram há mais de 3 h (quando a API está fora, o que "era próximo" já passou).

### B. Todos os times no CMS

Base já pronta (26/06): collection `teams`, 6 rotas + `layout.tsx` que olham o Payload primeiro, blocos dinâmicos, `DEFAULT_TEAM_LAYOUTS` idêntico ao visual do config.

**Lacunas a fechar antes de migrar:**
1. **SEO por aba.** Hoje um `seo` só vale para as 6 rotas → título duplicado. Novo:
   - `seo` (existente) passa a ser **só do Hub**.
   - Novos grupos `seoJogoHoje`, `seoOndeAssistir`, `seoEscalacao`, `seoProximos`, `seoEstatisticas` (`metaTitle`, `metaDescription`), cada um dentro da aba correspondente no admin.
   - Cada rota lê o seu grupo e cai no padrão do código se vazio.
   - Função única `teamSeo(doc, page, name)` com os padrões atuais (um lugar só para os textos-padrão; as rotas deixam de repetir string).
2. **Torneio Europa.** Nova opção `europa` no select `tournament`. `teamTournament()` passa a respeitar `tournament === "europa"` (além da lista de slugs, que continua como fallback para os times do config).
3. **Texto automático como bloco.** Novo bloco `teamAutoText` ("Texto automático do time") para layouts personalizados. Renderiza o texto gerado dos dados (na aba Escalação, a provável escalação antes do texto). Layout personalizado sem o bloco recebe o texto no fim, uma vez. Na página clássica o texto fica onde já está.
4. **Aba vazia = página clássica (achado em 27/09).** A visão por blocos do CMS é de uma coluna (860px); a página do código tem coluna lateral (1240px). Migrar como está mudaria o visual dos 37 times. Correção: o corpo de cada uma das 6 rotas vira um componente "clássico" (`src/components/team/classic/*.tsx`, recebe `TeamPageData`), usado tanto pelo config quanto pelo CMS quando a aba está vazia. Blocos só entram quando o editor monta um layout próprio. No banco, **nenhum time tem layout personalizado** (0 linhas em todas as tabelas `teams_blocks_*`), então a Série B também passa a usar a página clássica, igual à Série A. Rótulos fixos "Brasileirão 2026" e o link da tabela passam a vir de `data.tournament` (Série B aponta pra tabela da Série B).
5. **SEO já preenchido.** Só o América-MG tem `seo` preenchido (hoje vale pras 6 rotas; passa a valer só pro Hub). O seed preenche os grupos vazios dos 57 times com o texto-padrão atual, sem sobrescrever o que já existe.

**Schema:** migration aditiva no Postgres compartilhado, pela receita `payload_migrations_recipe`: colunas novas de SEO em `teams` e `_teams_v`, valor `europa` nos dois enums de torneio, tabelas `teams_blocks_team_auto_text` e `_teams_v_blocks_team_auto_text`. Backup antes. Nenhum DROP.

**Pré-visualização segura (dev vê rascunho, prod só publicado):**
- Env `TEAMS_CMS_DRAFTS=1` só no `.env.local` do dev. Com ela, `getTeam`/`getPayloadTeamSlugs` leem rascunhos (`draft: true`).
- Fica como recurso permanente: editor revisa um time no dev antes de publicar.

**Migração dos 37 times:**
- Script de seed idempotente rodado com `npx payload run` (fora do repo, apagado depois — o Ivan não quer vestígio de código de uso único).
- Para cada time do `config.ts`: cria o doc como **rascunho** com nome, slug, id, torneio (`serie-a`/`europa`), layouts vazios (= padrão) e os 6 grupos de SEO **preenchidos com os textos que a rota gera hoje** (o editor vê e edita o valor real).
- Se o doc já existe (slug), não duplica.
- Comparação: para cada time × 6 rotas, HTML do dev (CMS, rascunho) × prod (config), normalizando hashes de build e ids do React. Diferença inesperada = parar e corrigir.
- Com tudo igual: publica os 37 docs de uma vez → a prod passa a renderizar pelo CMS.
- Cruzeiro primeiro (validação isolada), depois os outros 36.

### C. Páginas com erro

Levantamento feito por agente (crawl do sitemap na origem, links internos de páginas-chave, GSC, redirects legados). Cada grupo de URLs quebradas vira uma tarefa com causa e correção no plano. Regras:
- URL que não deveria existir: sai do sitemap e dos links internos; se tiver tráfego/backlink, ganha 301 para o destino certo.
- URL que deveria existir: corrige a rota/dado.
- 404 tem que ser 404 real (não soft-404), testado em **build de produção** (lição de 18/06: `npm run dev` engana).

### D. AdSense

O que é técnico já foi feito e promovido em 25/09. Depois das frentes A–C, uma revisão final do que o robô vê: home, sitemap limpo, páginas de time com texto próprio, páginas legais. O fator que falta é humano: publicar notícias com regularidade por 3–4 semanas antes de pedir revisão. Fica registrado no relatório final.

## 3. Tratamento de erros

- Payload fora: `getTeam` → `null` → os 37 times caem no config (renderizam); Série B depende do CMS (como hoje).
- API fora: último dado bom do disco; sem dado salvo, o bloco mostra o estado vazio que já existe.
- Disco cheio/somente leitura: gravação falha em silêncio, render segue.

## 4. Testes e validação

Sem framework de testes no projeto; a validação é:
1. `tsc --noEmit` e `next build` limpos (build local de produção para as rotas de 404).
2. Init do Payload no dev e na prod: sem `payloadInitError`, `/cms-api/teams` responde.
3. Comparação de HTML dev × prod dos 37 times × 6 rotas antes de publicar.
4. **Simulação de API fora do ar:** container temporário da imagem do dev, com o volume de dados, sem proxy e com chave inválida, porta local. Conferir que hub de time, estatísticas, `/tenis`, `/nba`, campeonato e jogo encerrado mostram dados. Container removido depois.
5. Recrawl das URLs quebradas do levantamento: todas 200 ou 404/301 corretos.
6. `agent-browser`: hub de time (Série A, Europa, Série B), uma subpágina de cada, `/cms` com a aba de SEO, home, página de jogo; desktop e celular.

## 5. Fora do escopo

- Tirar os 37 times do `config.ts` (é a rede de segurança sem banco).
- Variáveis de modelo no SEO (`{time}`): textos semeados já vêm com o nome.
- Escrever notícias.

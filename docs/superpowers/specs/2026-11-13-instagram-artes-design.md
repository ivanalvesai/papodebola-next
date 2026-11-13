# Instagram do Papo de Bola: artes dos posts + publicação com aprovação

**Data:** 13/11/2026 · **Pedido:** Ivan · **Conta:** [@papodebola.com.br](https://www.instagram.com/papodebola.com.br/) (Empresa, vinculada à Página do Facebook)

## 1. Objetivo

Todo post publicado no site vira, automaticamente, um rascunho de Instagram no `/cms`: duas artes de nível profissional (feed 4:5 e stories 9:16) e uma legenda escrita pela IA. O Ivan aprova, escolhe onde sai (feed, stories ou os dois) e quando (agora ou agendado). Só então o sistema publica pela API oficial da Meta. As artes também podem ser baixadas para postar à mão pelo celular (para pôr link ou adesivo).

**Critérios de sucesso**

- Nada vai pro Instagram sem aprovação de admin/editor.
- Artes com qualidade comparável às do Lance: escudos/bandeiras grandes e nítidos, tipografia forte, fundos variados.
- Artes não repetem o mesmo visual em sequência.
- Um item nunca é publicado duas vezes.
- Velocidade e regra de ouro: artes, escudos e fundos saem do disco (volume), nunca da API esportiva.
- Artes apagadas do servidor 7 dias depois; o registro do item fica.

**Fora do escopo (etapa 2)**

- Formatos "Confronto definido", "Chaveamento", "Placar final" e "Citação" (modelos gerados no `/cms` com um clique).
- Ilustrações próprias de troféus.
- Carrossel no feed.
- Métricas do Instagram no painel.

## 2. Decisões tomadas com o Ivan

| Tema | Decisão |
|---|---|
| Fluxo | Gera automaticamente, Ivan aprova, sistema publica |
| Entrada na fila | Todo post publicado no site (inclusive os agendados) |
| Onde sai | Escolhido por item: só stories (padrão), só feed ou os dois |
| Legenda | Escrita pela IA (Claude Sonnet), editável antes de aprovar |
| Quando sai | "Publicar agora" ou horário; o sistema sugere |
| Estilo de jogo | Base "gramado + faixa diagonal amarela", com variações; o "estádio noturno" também entra no rodízio, com a faixa abaixo dos escudos (nunca por cima) |
| Estilo de notícia | Foto cheia com título por cima (estilo A), versão profissional |
| Download | Botões "Baixar feed (JPG)", "Baixar stories (JPG)" e "Copiar legenda" |
| Limpeza | Artes apagadas do servidor após 7 dias; o item continua no `/cms` |
| Construção | Dentro do próprio site (Payload + Next), sem ferramenta externa |

## 3. Arquitetura

```
post publicado (hook afterChange, _status=published)
        │
        ▼
 instagramPosts (rascunho) ──► gerar artes (Chrome headless, HTML/CSS) ──► data/instagram/{id}-{feed|story}.jpg
        │                  └─► legenda (Claude Sonnet; fallback por modelo)
        ▼
 /cms: Ivan revisa, escolhe feed/stories + horário, aprova
        │
        ▼
 job "instagramPublish" (fila de jobs, cron 1/min SÓ no prod)
        │  1. POST /{ig-user-id}/media (image_url pública + caption | media_type=STORIES)
        │  2. GET /{container-id}?fields=status_code até FINISHED
        │  3. POST /{ig-user-id}/media_publish
        ▼
 item = Publicado (media id + permalink)      cron diário: apaga JPGs > 7 dias
```

### 3.1 Collection `instagramPosts` (Payload)

Arquivo: `src/cms/collections/instagram-posts.ts`, no grupo do admin "Comercial". Acesso: admin e editor; o papel `seo` não vê.

| Campo | Tipo | Observação |
|---|---|---|
| `post` | relationship → posts | obrigatório, único (um item por post) |
| `template` | select | `jogo`, `noticia` (etapa 2 adiciona outros) |
| `visual` | json | variação + fundo sorteados (para "Trocar visual" e para o rodízio) |
| `highlight` | text | palavra(s) em destaque amarelo no título (opcional) |
| `feedFile`, `storyFile` | text | nome do JPG em `data/instagram/`; vazio depois da limpeza |
| `caption` | textarea | legenda da IA, editável |
| `toFeed` | checkbox | padrão falso |
| `toStory` | checkbox | padrão verdadeiro |
| `publishAt` | date | vazio = agora; sugestão preenchida |
| `status` | select | `rascunho` → `aprovado` → `publicando` → `publicado` / `erro` / `descartado` |
| `result` | group | `feedMediaId`, `feedPermalink`, `storyMediaId`, `error`, `attempts` |
| `artsDeletedAt` | date | quando a limpeza apagou os JPGs |

- Botões no admin (componentes do item): "Aprovar", "Publicar agora", "Trocar visual", "Regerar artes", "Baixar feed", "Baixar stories", "Copiar legenda", "Tentar de novo", "Descartar".
- A prévia das duas artes fica no topo do item.
- Banco: tabela nova `instagram_posts` (+ rels), criada por **DDL aditivo** seguindo a receita (`payload_migrations_recipe`): backup → migration → só `CREATE` → dry-run → aplicar.
- Nenhum array chamado `texts`, `numbers` ou `rels` (gotcha do Drizzle).

### 3.2 Entrada na fila

- Hook `afterChange` em `posts`: quando o doc passa a `_status=published` e ainda não há item para ele, cria o rascunho e dispara a geração em segundo plano. Funciona para publicação manual e agendada (o job `schedulePublish` também passa pelo hook).
- Template:
  - `jogo` se o post é da categoria "Onde Assistir" ou tem `matchId`;
  - senão, `noticia`.
- Horário sugerido (`publishAt`):
  - jogo: 2 h antes do apito, ou agora se já passou;
  - notícia: agora.
- Se o post for editado antes da aprovação, aparece o aviso "post mudou" e o botão "Regerar artes".

### 3.3 Geração das artes

**Motor**

- HTML/CSS renderizado em **Chromium headless** (`puppeteer-core` + pacote `chromium` do Alpine no Dockerfile, cerca de 200 MB).
- Viewport 1080×1350 (feed) e 1080×1920 (stories), `deviceScaleFactor` 1.
- Saída PNG convertida em **JPEG q90** com `sharp`, porque a Meta só aceita JPEG.
- Uma instância de browser por vez, com fila: renders sequenciais, nunca em paralelo, para não pesar no servidor.

**Templates** (`src/lib/instagram/templates/`, um arquivo por template, cada um exporta `html(data, visual)`):

- **Jogo:** escudos/bandeiras grandes, nomes em Barlow Condensed itálico 900, faixa com dia/hora e canal, selo da competição, logo do Papo de Bola. Variações (`visual.layout`) que se alternam:
  1. faixa diagonal amarela subindo (base aprovada);
  2. faixa diagonal descendo (invertida);
  3. faixa verde com texto branco;
  4. faixa reta no rodapé com recorte em ângulo;
  5. estádio noturno, com escudos no terço de cima e a faixa de horário numa área própria abaixo deles (nunca sobre os escudos).
- **Notícia:** capa do post em tela cheia, degradê escuro, etiqueta da categoria, título em fonte condensada (Anton) com a palavra de `highlight` em amarelo e tamanho que se ajusta para caber em até 4 linhas, logo no canto.

**Dados do template de jogo**

- vêm do snapshot do jogo (`data/snapshots/matches/{matchId}.json`): times, ids e horário;
- o canal vem do bloco `matchInfo` do post; a competição, do torneio.
- Sem snapshot: tenta `getMatchDetail` uma vez; se falhar, usa os dados do post.

**Áreas seguras**

- Stories: nada de texto nos 250 px de cima e nos 340 px de baixo (barra do perfil e caixa de resposta).
- Feed 4:5: margem de 60 px.
- Stories levam "Leia em papodebola.com.br" escrito na arte (a API não permite adesivo de link).

**Tipografia:** Anton e Barlow Condensed (OFL) nos títulos, Open Sans nas informações. Arquivos TTF em `src/lib/instagram/fonts/`, carregados localmente (sem Google Fonts no render).

**Fundos** (`data/instagram/fundos/`, volume):

- Fotos de estádio, gramado e torcida de bancos com licença comercial (Unsplash/Pexels), baixadas uma vez, com a origem registrada em `fundos/CREDITOS.md`.
- Fundos gerados por CSS: gramado com as linhas do campo, granulado escuro, raios de luz.
- Tema de cor por competição: Série A verde, Série B azul, Libertadores e Copa do Brasil preto e dourado, Liga das Nações azul-marinho, Seleção verde e amarelo, Amistosos neutro.
- Upload de fundos próprios pelo `/cms` (collection `media` com a tag `instagram-fundo`).

**Rodízio**

- `visual` é sorteado evitando o layout e o fundo usados nos últimos 3 itens.
- "Trocar visual" sorteia de novo com a mesma regra e regera as artes.

**Escudos em alta**

- **Seleções:** bandeiras em SVG de domínio público (flagcdn), salvas em `data/instagram/bandeiras/{codigo}.svg`. Mapa id → código ISO em `src/lib/instagram/flags.ts`.
- **Clubes:** campo novo **"Escudo HD"** (upload, PNG transparente com pelo menos 800 px ou SVG) na collection `teams`. Os 57 times do site são pré-preenchidos com versões em alta.
- **Fallback:** sem escudo HD, usa o de 150 px num círculo menor, nunca esticado. O item mostra o aviso "escudo em baixa: subir HD".
- Escudos são marcas dos clubes; o uso é editorial, como no mercado (Lance, ge).

**Arquivos**

- `data/instagram/{itemId}-{feed|story}-{hash}.jpg`. O hash muda a cada regeração, para a Meta e a CDN não pegarem versão velha.
- Servidos por `/api/instagram/media/[file]` (ISR não se aplica; leitura do disco com `cache-control: public, max-age=604800`).
- A rota não lista diretório e valida o nome do arquivo (só `^[0-9]+-(feed|story)-[a-f0-9]{8}\.jpg$`).
- A URL entregue à Meta é sempre a do **prod** (`https://www.papodebola.com.br/api/instagram/media/...`), mesmo que a arte tenha sido gerada no dev: o volume é compartilhado.

**Onde roda:** o hook pode disparar no dev (publicação manual) ou no prod (publicação agendada), então os dois containers têm o Chromium. Como o banco é compartilhado, a unicidade "um item por post" é garantida por índice único em `post_id` na tabela, não só no código.

### 3.4 Legenda pela IA

- Claude Sonnet (modelo mais recente) via API da Anthropic, chave `ANTHROPIC_API_KEY`, que já existe.
- Entrada: título, resumo, categoria, times/horário/canal (jogo). Instrução de **não inventar nada** que não esteja nesses dados.
- Saída:
  - até cerca de 600 caracteres, tom de Instagram, sem travessão em excesso;
  - "🔗 Link na bio";
  - de 6 a 10 hashtags (competição, times, #futebol, #papodebola).
- Timeout de 20 s. Se falhar, entra uma legenda por modelo: título + resumo + "Link na bio" + hashtags fixas.
- Custo estimado: menos de R$ 0,05 por post.

### 3.5 Publicação (Meta Graph API)

**Conexão (o Ivan faz uma vez, com roteiro)**

- App em developers.facebook.com, do tipo Empresa, com o produto "Instagram Graph API" e login do Facebook.
- Permissões: `instagram_basic`, `instagram_content_publish`, `pages_show_list`, `pages_read_engagement`.
- Token de Página de longa duração (sem validade), gerado a partir do token longo do usuário.
- Envs no `.env.local` do **prod** (e do dev, para teste da conexão):

  ```
  META_PAGE_TOKEN=...
  IG_USER_ID=...
  META_GRAPH_VERSION=v23.0
  ```

  Nunca no código e nunca ecoados em log.

**Job `instagramPublish`**

- Registrado em `jobs.tasks` do Payload e processado pelo cron 1/min que já existe **só no prod**.
- Aprovar cria o job com `waitUntil = publishAt`.
- Ao rodar:
  1. trava o item (`status = publicando`, update condicional: só se ainda `aprovado`), o que impede publicação dupla;
  2. para cada destino marcado: cria o container, faz polling de `status_code` (a cada 3 s, até 60 s) e publica;
  3. grava `mediaId`/`permalink` (o permalink vem de `GET /{media-id}?fields=permalink`).
- Erros: até 3 tentativas (1 min, 5 min, 15 min). Depois, `status = erro` com a mensagem da Meta em `result.error` e o botão "Tentar de novo".
- **Limite:** a API aceita 50 publicações por 24 h.
  - Antes de publicar, consulta `GET /{ig-user-id}/content_publishing_limit`.
  - O `/cms` mostra o uso do dia e não deixa aprovar acima do limite.
- **Saúde do token:** um cron diário chama `GET /me?access_token=...`. Se falhar, aparece um aviso no dashboard do `/cms` ("Conexão com o Instagram caiu: refazer login").

### 3.6 Limpeza (7 dias)

- Cron diário (mesma infraestrutura dos crons do servidor, tag `# pdb-instagram-limpeza`) chama `/api/instagram/cleanup` com `CRON_SECRET`.
- Apaga os JPGs de itens criados há mais de 7 dias, zera `feedFile`/`storyFile` e preenche `artsDeletedAt`.
- O item fica, com status, legenda, permalink e histórico. "Regerar artes" refaz as imagens se precisar.

## 4. Erros e casos de borda

| Caso | Comportamento |
|---|---|
| Post despublicado ou apagado antes da aprovação | Item vira `descartado` automaticamente |
| Post despublicado depois de publicado no Instagram | Nada é apagado no Instagram; o item mostra o aviso "post saiu do site" |
| Chrome falha ao renderizar | Item fica `rascunho` com o erro e o botão "Regerar artes"; não trava a publicação do post no site |
| Capa do post ausente (notícia) | Usa um fundo da biblioteca no lugar da foto |
| Escudo HD ausente | Fallback de 150 px em tamanho menor e aviso no item |
| Meta recusa a imagem (formato/tamanho) | `erro` com a mensagem; as artes já saem em JPEG, dentro do limite de 8 MB |
| Token inválido | Jobs param com `erro`, aviso no dashboard, nenhuma tentativa em loop |
| Dois cliques em "Publicar agora" | A trava do status garante uma única publicação |

## 5. Testes

- **Unitários** (`node --test`):
  - escolha do template;
  - horário sugerido;
  - rodízio de visual (não repete nos últimos 3);
  - validação do nome de arquivo da rota de mídia;
  - montagem da legenda de fallback;
  - trava de status.
- **Render:** script `scripts/instagram/render-sample.mjs` gera todas as variações para 3 posts reais (um jogo de clube, um de seleção e uma notícia) e salva em uma pasta, para o Ivan aprovar visualmente **antes** de ligar a publicação.
- **Integração Meta:**
  - teste de conexão (`GET /me` e `content_publishing_limit`) no dev;
  - primeira publicação real = **um único stories** aprovado pelo Ivan;
  - só depois libera o resto.
- **Validação no servidor:**
  - `data/instagram/` com os JPGs;
  - item com `publicado` e permalink;
  - limpeza testada com um item datado de 8 dias atrás.

## 6. Entrega em etapas

1. **Artes:**
   - Chromium no Dockerfile, fontes, fundos, bandeiras e escudos HD;
   - templates de jogo (5 variações) e notícia;
   - script de amostras → **aprovação visual do Ivan**.
2. **Fila no `/cms`:** collection + DDL, hook de entrada, legenda da IA, prévia, download, rodízio, limpeza.
3. **Publicação:** roteiro do app da Meta (Ivan executa), envs, job `instagramPublish`, limite, saúde do token → **primeiro stories de teste** → liberação.
4. **(Depois)** Formatos extras: confronto definido, chaveamento, placar, citação.

Cada etapa vai para o dev, é validada e só sobe para o prod com a ordem do Ivan.

## 7. Riscos

- **Imagem do container maior (cerca de 200 MB):** o `rebuild.sh` já tem o guard de disco; conferir `df -h /` no primeiro build.
- **Revisão do app pela Meta:** para publicar na **própria** conta, o app em modo de desenvolvimento com o Ivan como administrador basta, sem revisão. Se a Meta exigir revisão, a etapa 3 espera; as etapas 1 e 2 já entregam valor (download + legenda).
- **Escudos HD:** dependem de fonte externa uma única vez; depois ficam no volume.

# "Onde assistir": posts padronizados + nova /ao-vivo — design (RASCUNHO em análise)

> Status: **em análise / aguardando aprovação do Ivan** (12/11/2026 ~22h).
> Documento vivo: atualizado a cada etapa para não perder contexto se o PC reiniciar.
> Antes de publicar o perf (commit 4fbecae: páginas de jogo/notícia em cache + NavProgress),
> o Ivan pediu estas melhorias. O promote vai junto, depois da aprovação do layout no dev.

## Pedido do Ivan (resumo fiel)
- `/ao-vivo` está fora do layout do site: tabela enorme, sem texto e fraca de SEO.
- Referência: lance.com.br/onde-assistir (hub) e o post
  `/onde-assistir/inglaterra-x-croacia-onde-assistir-horario-e-escalacoes.html`.
- Padronizar posts "onde assistir" (título padrão, vários cards).
- O post deve **aparecer também no hub do campeonato** (ex.: Liga das Nações), **sem duplicar**:
  um card lá, mas o clique leva à URL onde o post realmente mora (canonical única).
- Criar os posts dos jogos de **amanhã (13/11)** da Liga das Nações, **1 a cada 10 min antes da
  meia-noite**. O layout vem antes, para o Ivan aprovar no dev.
- SEO "ultra profissional": canonical, title, description, schema e o resto.

## Diagnóstico: nossa /ao-vivo hoje (prod, 12/11)
- title: "Jogos Ao Vivo - Placares em Tempo Real | Papo de Bola"; description sem acento
  ("Brasileirao"), genérica; canonical ok.
- H1 "Ao Vivo (N)"; **nenhum texto**, nenhum H2 útil; largura de 800 px (as outras páginas usam 1240).
- Dados de `getTodayMatches()`. O endpoint por data `matches/{d}/{m}/{y}` está quebrado na API
  (logs: "endpoint invalido"), então a lista sai pobre ou vazia fora do horário dos jogos.
- Sem ItemList/CollectionPage. Não linka posts nem páginas de jogo como deveria.

## Benchmark Lance (coletado 12/11)
- **Hub /onde-assistir:** title "Onde Assistir"; description genérica; JSON-LD
  CollectionPage + ItemList (22 ListItem) + BreadcrumbList. Layout: grade de 9 cards 16:9 com
  título, mais a lista "Mais LANCE" (miniatura, título, tempo relativo) e "ver mais". Sem texto
  introdutório, sem FAQ, sem agrupar por data. **Pontos fracos que podemos superar:** texto,
  FAQ, agrupar por dia/campeonato, jogos do dia com canal.
- **Post:** URL `/onde-assistir/{a}-x-{b}-onde-assistir-horario-e-escalacoes.html`. title/H1
  "{A} x {B}: onde assistir, horário e escalações"; description "Saiba onde assistir a {A} x {B}
  pela {campeonato}. Veja o horário e as prováveis escalações". JSON-LD NewsArticle +
  BreadcrumbList + WebPage. **Sem SportsEvent.** Estrutura: breadcrumb (Onde Assistir) → H1 →
  linha fina (H2) → byline e data (publicado ~1 dia antes) → capa → lead (data/hora/estádio/o que
  está em jogo + link do tempo real) → H2 "Como chegam X e Y" (1 parágrafo por time) → "Ficha do
  jogo" (competição, data, horário, local, árbitro, onde assistir) → escalações prováveis (texto)
  → tags → "Sugerida para você" (6 cards da mesma seção) → componente "Ficha do jogo" (bandeiras,
  canal). Cerca de 350–450 palavras. **Falhas deles:** árbitro vazio no componente; canal
  divergente entre o texto e o card; sem FAQ; sem schema de evento.

## O que já temos no código (reaproveitar)
- Posts (Payload `posts`): `category` (define `/{categoria}/{slug}`), `tags`, `teams` (relação),
  **`matchId`** (liga o post ao jogo), `cover`, `excerpt`, `content` (Lexical), `authorProfile`,
  `publishedDate`, `seo.metaTitle/metaDescription`, **agendamento (schedulePublish)**.
- `MatchPreview` (página de jogo): "Quando é e onde assistir" + `BroadcastChannels`
  (`src/lib/broadcasters.ts`). **A Liga das Nações não tem canal mapeado** (o Lance diz ESPN 4 +
  Disney+). Confirmar antes de publicar.
- Página de jogo do campeonato: `/futebol/futebol-internacional/liga-das-nacoes/jogo/{data}/{a}-{b}`
  (lance a lance, snapshot salvo).
- Snapshot da Liga das Nações: 10 jogos em 13/11 (14h Moldávia x Cazaquistão; 16h45 os outros 9).

## Jogos de amanhã (13/11/2026, Liga das Nações), horário de Brasília
14:00 Moldávia x Cazaquistão (15534197) · 16:45 Andorra x Gibraltar (15537775) · Bulgária x
Islândia (15534234) · Escócia x Macedônia do Norte (15534110) · Eslováquia x Ilhas Faroé
(15534192) · Eslovênia x Suíça (15534113) · Holanda x Grécia (15534069) · Liechtenstein x
Azerbaijão (15534240) · Luxemburgo x Estônia (15537774) · Sérvia x Alemanha (15534059).

## Design APROVADO (Ivan, 12/11 ~22h10), com os ajustes dele
- Estrutura em **2 páginas** (opção recomendada): `/onde-assistir` é a casa dos posts; `/ao-vivo` é refeita.
- **Autores alternados:** Ivan Alves (authors id 1) e Lucas Lima (id 2), intercalando post a post.
- **Capa:** montada como as anteriores, com as **bandeiras das duas seleções** sobre foto real
  (área segura: bandeiras e texto entre y≈30 e y≈420 em 1200×675; ver feedback_capa_post_area_segura).
  Base: `~/capa-ln-foto.mjs` no servidor.
- **Publicação:** pode passar da meia-noite. **Publicar cada post assim que ficar pronto**
  (ordem explícita do Ivan para estes posts); sem agendamento em lote.
- **Transmissão:** checar a fonte jogo a jogo (ESPN/Disney+ e/ou SporTV/geTV). Sem confirmação,
  o post diz que a grade está a confirmar e cita os detentores, com fonte. Nunca chutar.

### 1. URLs e modelo de dados (sem migração)
| Página | URL | Intenção de busca |
|---|---|---|
| Hub dos posts (nova) | `/onde-assistir` | "onde assistir", "onde vai passar" |
| Post | `/onde-assistir/{a}-x-{b}-onde-assistir-horario-e-escalacoes` | "{A} x {B} onde assistir" |
| Ao vivo (refeita) | `/ao-vivo` | "jogos ao vivo hoje", "placar ao vivo" |

- Post = Payload `posts` com `category: "Onde Assistir"`. `CATEGORY_HUB["Onde Assistir"] = "/onde-assistir"`
  em `src/lib/config.ts` faz `articleHref` gerar `/onde-assistir/{slug}`.
- Liga o post ao jogo por `matchId` (já existe). `teams`: só os times que existem na collection
  (seleções não estão lá, então fica vazio). `tags`: `["Onde assistir", "Liga das Nações", A, B]`.
- **Silada** como Cupons (fora do feed principal da home e de /noticias), para não inundar a home
  com 10 posts iguais. Os posts aparecem em: /onde-assistir, /ao-vivo, hub do campeonato, página
  do jogo (lance a lance) e "Mais jogos para assistir" dentro dos próprios posts.
- **Sem duplicar:** fora do post, só aparece um CARD (título, capa, hora, canal) com link para a URL
  canônica do post. O corpo nunca é renderizado fora dela. A canonical do post é a própria URL.

### 2. Post (template)
Ordem: breadcrumb (Início › Onde Assistir › {campeonato}) → H1 "{A} x {B}: onde assistir, horário e
escalações" → linha fina → byline (autor alternado) e data → capa → **Ficha do jogo** (componente)
→ lead → H2 "Como chegam {A} e {B}" (posição no grupo + mini tabela do grupo) → H2 "Escalações
prováveis" → H2 "Perguntas frequentes" → "Mais jogos para assistir".
- **Ficha do jogo:** bloco Lexical novo `matchInfo` (sem migração, como `productGrid`), com campos
  editáveis `channels` (texto, ex.: "ESPN 4 e Disney+"), `channelsConfirmed` (checkbox),
  `channelsSource` (URL, só interno). O resto sai do jogo (`post.matchId` → `getMatchDetail`/
  fixture): bandeiras (`/api/team-img`), campeonato e rodada/grupo, data e hora de Brasília, estádio
  e cidade, árbitro (se houver), placar/status ao vivo, botão "Acompanhe o lance a lance" (href da
  página do jogo). Uma fonte só, então o card não diverge do texto.
- **FAQ** gerado dos mesmos dados (que horas, onde passa, onde é) + JSON-LD `FAQPage`.
- JSON-LD do post: `NewsArticle` (autor Person com url /autor/{slug}) + `SportsEvent` (homeTeam/
  awayTeam, startDate ISO com -03:00, location, superEvent = Liga das Nações, eventStatus) +
  `BreadcrumbList` + `FAQPage`.

### 3. Hub `/onde-assistir`
- H1 "Onde assistir futebol hoje: jogos, horários e canais", com intro editável no /cms (Páginas, slug
  `onde-assistir`, rota dedicada como a da Liga das Nações).
- "Jogos de hoje" e "Amanhã": por campeonato, cada jogo com hora, canal (do post, se houver) e
  link (post, senão lance a lance). Dados da agenda já salva (`data/snapshots/agenda`).
- Grade de cards 16:9 dos posts (mesmo visual da home), agrupada por dia do jogo; paginação "ver mais".
- FAQ editável + JSON-LD `CollectionPage` + `ItemList` (posts) + `BreadcrumbList`.
- SEO: title "Onde assistir futebol hoje: jogos, horários e canais | Papo de Bola"; description
  específica com acentos; canonical `/onde-assistir`; OG completo; ISR com generateStaticParams/
  revalidate (regra de velocidade).

### 4. `/ao-vivo` refeita
- Largura 1240 px, layout do site. "Ao vivo agora" em destaque (vermelho), depois "Ainda hoje" e
  "Encerrados", em cards agrupados por campeonato (escudos, placar, minuto).
- Cada card: canal + link "Onde assistir" (post) + "Lance a lance" (página do jogo).
- **Fonte de dados:** agenda salva (`getFootballAgenda`/store do dev, que grava a cada 1 min) em
  vez do `getTodayMatches()`, que depende do endpoint por data (quebrado). O placar se atualiza pelo
  polling que já existe (`/api/championship/{slug}/ao-vivo` / agenda), sem bater na API no render.
- Texto curto editável + strip "Onde assistir hoje" (cards dos posts do dia).
- SEO: title "Jogos ao vivo hoje: placares em tempo real e onde assistir | Papo de Bola";
  description com acentos e campeonatos do dia; canonical `/ao-vivo`; JSON-LD `CollectionPage` +
  `ItemList` de `SportsEvent` + `BreadcrumbList`.

### 5. Cards em outras páginas (sem duplicar)
- Hub da Liga das Nações: seção "Onde assistir os próximos jogos" (posts com tag "Liga das Nações"
  e category "Onde Assistir", jogos futuros/de hoje).
- Página do jogo (lance a lance): se existir post com `matchId` = jogo → card "Onde assistir {A} x {B}"
  no `MatchPreview`.
- Tudo linka a URL canônica do post.

### 6. Posts de 13/11 (10 jogos)
- Script `scripts/create-post-onde-assistir.mjs` (payload run) parametrizado por matchId: título,
  slug, excerpt/seo, Lexical (lead, como chegam, escalações, FAQ em texto), bloco `matchInfo` com o
  canal pesquisado, tags, autor alternado, capa (gerada no servidor com as bandeiras).
- **Texto humano e único por jogo** (contexto real do grupo, nada de template idêntico com nomes
  trocados, para não ser conteúdo raso).
- Fluxo por post: gerar → conferir no dev (`/cms-preview`) → publicar → próximo. Depois: pedir
  indexação no GSC e reenviar o news-sitemap.

### 7. Conteúdo rico e capa profissional (pedido do Ivan, 12/11 ~22h15)
"Arte bonita, profissional" e "bastante informação, como o Lance: cards, escalações possíveis,
árbitro, local do jogo etc." Cada post terá, além da Ficha do jogo:
- **Escalação no campo** (bloco existente `lineupField`, campinho com os 11 pela formação) para as
  duas seleções: escalação confirmada da API se já saiu; senão a provável (XI do jogo anterior via
  `/api/lineup-suggest`), rotulada "provável". Inclui técnico.
- **Card "Situação no grupo"** (bloco de card existente, com linhas rótulo/valor): posição, pontos e
  campanha de cada um, mais o que cada resultado significa (classificação/rebaixamento), com base na
  tabela salva.
- **Card "Arbitragem"**: árbitro (e nacionalidade) da API `match/{id}`. Se não houver, a seção não
  aparece; nada inventado.
- **Card "Local"**: estádio, cidade e capacidade (dados do venue).
- **Retrospecto/confronto direto** (`match/{id}/h2h` ou último encontro), se a API trouxer.
- **Destaques/quem observar** por seleção (jogador e motivo, a partir dos artilheiros/estatísticas
  da competição quando disponíveis), em texto.
- Texto: lead + "Como chegam" (um parágrafo por seleção) + "O que está em jogo" + FAQ: cerca de
  500–700 palavras, único por jogo, revisado (humanizer) e sem travessão em excesso.
- **Capa 1200×675:** foto real de estádio ao fundo com tratamento escuro/gradiente; as duas
  bandeiras grandes em círculo com sombra, "X" central; selo "LIGA DAS NAÇÕES · ONDE ASSISTIR",
  data e hora em destaque e canal. Tipografia Open Sans bold, verde da marca #00965E nos detalhes.
  Tudo na área segura (y≈30–420). Simular o overlay da home antes de subir. Gerada no servidor
  (sharp/SVG), um arquivo por jogo, enviado como mídia do Payload.

### Fora de escopo (YAGNI)
Filtro por time no topo do hub, página por canal, post diário "jogos de hoje" automático.

## Transmissão 13/11: pesquisa (12/11 ~22h30)
Regra geral: a página oficial da UEFA lista **Disney+ e sportv** para o Brasil
(pt.uefa.com/uefanationsleague/news/02a9-219aea41a16f-96f9d2449867-1000--onde-ver-a-nations-league-parceiros-tv-e-streams-em-directo/).
A Disney fica com a maioria dos jogos (ESPN/ESPN 4/YouTube da ESPN, ou só Disney+); o Globo pega jogos
escolhidos (SporTV/geTV). "Exclusividade da Disney+" (InfoMoney) está ERRADO.

| Jogo | Canal | Confiança |
|---|---|---|
| 14:00 Moldávia x Cazaquistão | ESPN 4 + Disney+ | 2 fontes |
| 16:45 Andorra x Gibraltar | Disney+ | 2 fontes |
| 16:45 Bulgária x Islândia | Disney+ | 2 fontes |
| 16:45 Escócia x Macedônia do Norte | ESPN Brasil (YouTube) + Disney+ | 2 fontes |
| 16:45 Eslováquia x Ilhas Faroé | Disney+ | 2 fontes |
| 16:45 Eslovênia x Suíça | ESPN 4 + Disney+ | 2 fontes |
| 16:45 Holanda x Grécia | ESPN + Disney+ (decisão do Ivan, 12/11) | 3 fontes |
| 16:45 Liechtenstein x Azerbaijão | Disney+ | 2 fontes |
| 16:45 Luxemburgo x Estônia | Disney+ | 2 fontes |
| 16:45 Sérvia x Alemanha | SporTV + geTV | 2+ fontes |

Fontes: antenadosnatvestreaming.com/2026/11/agenda-esportiva-sexta-feira-13-novembro-2026.html ·
arede.info/esporte/692758/... · gazetaesportiva.com (Sérvia x Alemanha; Holanda x Grécia) · terra.com.br (Holanda x Grécia).
Árbitros/estádios encontrados: Sérvia x Alemanha (Rajko Mitić, Belgrado; Javier Alberola Rojas, ESP).
Holanda x Grécia (Johan Cruijff Arena, Amsterdã; Rohit Saggi, NOR; VAR Guillermo Cuadra Fernández, ESP).
Os outros 8 jogos: completar com a API (`match/{id}` venue/referee). O que não houver não aparece.

## Progresso
- [x] Análise + benchmark (commit cad4556)
- [x] Design aprovado com os ajustes (12/11 ~22h10)
- [x] Spec APROVADA pelo Ivan (12/11 ~22h40). Regra: **posts NÃO citam fontes** (portais concorrentes); fontes só neste doc
- [ ] Plano (writing-plans)
- [ ] Implementação no dev → aprovação visual
- [ ] Posts 13/11, um a um

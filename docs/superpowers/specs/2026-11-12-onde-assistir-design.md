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

## Design proposto (a validar)
(preenchido na próxima etapa)

# CMS page builder: criar qualquer página do site pelo /cms — Design

**Data:** 2026-09-30 · **Status:** aprovado pelo Ivan (brainstorm desta sessão) · **Escopo:** arquitetural

## 1. Objetivo

Qualquer pessoa da equipe cria e monta páginas completas (texto, mídia, blocos de dados ao vivo) pelo
Payload (`/cms`), em qualquer URL que ainda não exista no site, vendo o resultado ao vivo enquanto
edita, sem depender da IA nem de deploy. A IA continua podendo desenhar um layout, mas o resultado é
um JSON que se cola no CMS.

### Restrições (não negociáveis)

- **Nada do que está no ar, indexado e com tráfego muda.** Rotas em código têm prioridade absoluta
  sobre páginas do CMS. Slugs de rotas existentes continuam travados no código. Páginas do CMS que já
  existem (`/paginas/{slug}` e as com rota dedicada) continuam renderizando exatamente como hoje.
- **Fallback no código sempre**: se o Postgres cair ou a página não existir, a rota faz o que faz hoje
  (renderiza o código, ou 404 real).
- **Banco compartilhado dev/prod**: schema só por DDL **aditivo** (receita `payload_migrations_recipe`),
  com backup antes. Nunca `payload migrate`.
- **Nunca publicar sem ordem**: todo conteúdo de teste é rascunho, visto via preview, e apagado.
- Páginas que batem na API esportiva: **ISR + polling, nunca `force-dynamic`** nos blocos de dados.
- Sem ícones novos em UI pública; fontes mínimas 13/15px (`padrao_legibilidade_fonte`).

## 2. Decisões de arquitetura

| Decisão | Escolha | Motivo |
|---|---|---|
| Editor principal | **Nativo melhorado** do Payload (Live Preview + autosave + galeria de blocos com thumbnail + grupos + rótulos + PT-BR) | 100% API pública, zero dependência frágil, sobrevive ao Payload 4 |
| Canvas drag & drop | **Piloto Puck** (`@puckeditor/core`, MIT) numa aba "Construtor" só em Páginas, campo paralelo `puckData`, marcado experimental | Ivan quer avaliar canvas real; isolado pra não arriscar o editor de blocos |
| Biblioteca de blocos | **Uma só**, em `src/cms/blocks/*.ts`, arrays JS compartilhados por `pages`, `pageTemplates` e (os já existentes) `teams` | Mesmo bloco, mesmo render, mesmo thumbnail em todo lugar |
| `blockReferences` | **Não usar** | Risco de mudar nomes de tabela no Postgres sem ganho real aqui |
| URL livre | Campo novo **`path`** (caminho completo) + catch-all `[...path]` + fallthrough nas rotas dinâmicas | `slug` existente fica intocado; página antiga não muda de URL |
| Preview | Rota `/cms-preview/pagina/[id]` (por id, porque `path` pode estar vazio) e `/cms-preview/time/[slug]/[aba]`; posts seguem em `/cms-preview/[slug]` | Preview renderiza o layout REAL do site, por id funciona antes de definir URL |
| Modelos | Collection **`pageTemplates`** + painel lateral na página (aplicar / salvar como modelo / exportar / importar JSON) | Editável no CMS, sem deploy; a IA gera JSON e a pessoa cola |
| Admin | `i18n` PT-BR, `admin.group` nas collections, `custom.scss` pra galeria de blocos, `admin.meta` com nome do site | Baixo custo, grande ganho de usabilidade |

## 3. Biblioteca de blocos (`src/cms/blocks/`)

### 3.1 Organização

```
src/cms/
  blocks/
    index.ts            # PAGE_BLOCKS (lista completa), SECTION_INNER_BLOCKS (sem `section`), helpers
    static/*.ts         # richText, heading, image, columns, table, gallery, quote, button, list, infoCard, note, youtube, linkCards
    layout/section.ts   # novo
    data/*.ts           # todayGames (existente), teamWidget, standings, scorers, newsFeed, liveMatch (novos)
    thumbs.ts           # thumbUrl(slug) → /cms-blocks/{slug}.svg
  components/           # componentes client do admin (Label de bloco, painel de modelos, Puck view)
public/cms-blocks/*.svg # thumbnails 3:2 (480×320) em wireframe verde/cinza, 1 por bloco
```

Regras:
- **Slugs e campos dos 15 blocos atuais não mudam** (tabelas `pages_blocks_*` ficam iguais). Só ganham
  `images.thumbnail`, `admin.group`, `labels` PT e `admin.components.Label` onde ajuda.
- Grupos no drawer: **"Texto e mídia"** (richText, heading, image, gallery, youtube, quote, list, table,
  note), **"Layout"** (section, columns, button, infoCard, linkCards), **"Dados ao vivo"** (todayGames,
  teamWidget, standings, scorers, newsFeed, liveMatch).
- `admin.initCollapsed: true` no campo `layout`; rótulo colapsado mostra um resumo
  (`BlockSummaryLabel`: ex. "Classificação · Brasileirão Série A", "Widget de time · Cruzeiro · Próximos jogos",
  "Texto · primeiras 60 letras"). Implementado com `useFormFields` lendo os campos do bloco pelo `path`.
- `payload.config.ts` passa a importar as listas; `teamLayoutBlocks` continua lá (ou migra pra
  `src/cms/blocks/team.ts` sem mudar slugs) e ganha thumbnails/grupos também.

### 3.2 Blocos novos (schema → render)

| Bloco | Campos | Render (reaproveita) |
|---|---|---|
| `section` | `title?`, `width` (`narrow` 720 / `wide` 1240 / `full`), `background` (`none` / `card` / `green` / `dark`), `columns[]` (1–3) cada uma com `span` (`1`/`2`) e `blocks` (nested, `SECTION_INNER_BLOCKS`) | Novo componente `SectionBlock`: grid responsivo, colunas empilham no mobile |
| `teamWidget` | `team` (relationship → `teams`, required), `widget` (select: todayMatch, upcoming, results, standing, news, scorers, whereToWatch, lineup), `title?`, `limit?` | `getTeamPageDataFor(teamInfoFromDoc(doc))` + `TeamBlock` com `blockType` mapeado (`team{Widget}`) |
| `standings` | `tournament` (select das chaves de `TOURNAMENTS` + `copa-do-mundo`), `title?`, `rows?` (padrão 20), `compact` (checkbox: só 10 linhas, estilo widget) | `getStandings(t.id, t.seasonId)` / `getWorldCupStandings()`; novo `StandingsTableBlock` (tabela completa, mesma linguagem visual do `StandingsWidget`) ou `StandingsWidget` se `compact` |
| `scorers` | `tournament` (mesmo select), `title?`, `limit?` | Brasileirão A: `getTopScorers()`; Copa: `getWorldCupScorers()`; outros: `getScorersFor(t)` (função nova que generaliza `getTopScorers` por torneio, via standings top-10 + `team/{id}/.../top-players`) → `ScorersWidget`-like |
| `newsFeed` | `source` (select: `latest` / `category` / `tag` / `team`), `value` (text; pra `team` é relationship → `teams`), `limit` (padrão 6), `layout` (`grid` / `list` / `featured`), `title?`, `seeAllHref?` | `getArticles({category|tag, perPage})`; `grid`/`featured` reaproveitam `FeaturedCard`/`NewsSection`; `list` reaproveita `FeedItem` |
| `liveMatch` | `matchId` (number, required), `competition?` (text), `title?` | `getMatchDetail(matchId)` com seed quando nulo (mesmo padrão da página de jogo da Copa) → `LiveMatch` (client, polling já existente em `/api/copa/jogo/[id]`) |
| `todayGames` | existente | `TodayGamesBlock` sai do `agenda-blocks.tsx` e passa a ser resolvido no `PageBlock` (lê `getTodayFootballByLeague()`); `AgendaBlockRenderer` vira wrapper fino |

Todos os blocos de dados são **server components async** que engolem erro (`catch → null` ou
empty-state curto). Dado vem via as funções existentes (cacheadas / snapshot / api-cache); nenhuma nova
chamada direta à API.

### 3.3 Render

- `src/components/payload/page-blocks.tsx` vira o renderer único: `PageBlock` (switch por `blockType`,
  async) + `PageBlocks` (page shell). O shell respeita `page.layoutStyle`.
- `src/components/payload/section-block.tsx`, `data-blocks.tsx` (os 5 novos), `standings-table-block.tsx`.
- Página shell (`PageBlocks`): hero (`style`: `centered` padrão atual / `left` / `banner` com `image`
  upload e overlay), breadcrumb opcional (gerado do `path`), container por `layoutStyle.width`
  (`narrow` = card 720 como hoje, `wide` = 1240 sem card, `full`), `showSponsors` como hoje.
- Páginas antigas sem `layoutStyle`/`hero.style` renderizam **idêntico ao HTML atual** (defaults =
  comportamento atual). Isso será verificado por diff de HTML em `/sobre` e `/paginas/{slug}` existente.

## 4. Páginas em URL livre

### 4.1 Campos novos em `pages`

| Campo | Tipo | Regras |
|---|---|---|
| `path` | text, unique, index, opcional | Começa com `/`, segmentos `[a-z0-9-]`, sem `/` final, máx. 6 segmentos. **Proibidos**: prefixos de rotas em código (lista `RESERVED_PATHS` gerada de `RESERVED_TOP_LEVEL` + pastas de `src/app/(site)` + `api`, `cms`, `cms-api`, `cms-preview`, `_next`, `img`, `paginas`, `studio-pdb`, `painel-pdb-9x`) **quando o caminho completo colide com uma rota estática conhecida** (ex.: `/futebol/times/x` é bloqueado; `/futebol/copa-america` é permitido porque `/futebol/[slug]` só responde a torneios do config e cai no fallthrough). Validação server-side (`validate`) com mensagem em PT. |
| `layoutStyle` | group: `width` (select, default `narrow`), `showBreadcrumb` (checkbox, default false) | Defaults reproduzem o visual atual |
| `hero.style` | select `centered` (default) / `left` / `banner` | |
| `hero.image` | upload → media | só usado em `banner` |
| `editor` | select `blocks` (default) / `puck` | Ver §7 |
| `puckData` | json | Ver §7 |
| `templateTools` | ui (sidebar) | Ver §6 |

`slug` segue obrigatório e único (é a chave das rotas dedicadas e do `/paginas/{slug}`). Descrição no
admin: "Caminho (URL final). Vazio = /paginas/{slug}".

### 4.2 Resolução de rota

```
src/app/(site)/[...path]/page.tsx        # catch-all: 1 e 3+ segmentos (2 segmentos cai em [categoria]/[slug])
src/app/(site)/[categoria]/[slug]/page.tsx  # fallthrough: sem artigo → tenta página por path → notFound
src/app/(site)/futebol/[slug]/page.tsx + layout.tsx  # fallthrough: slug fora de TOURNAMENT_BY_SLUG → página por path → notFound
```

- `getPayloadPageByPath(path)` em `payload-pages.ts` (publicada; com `draft` só na rota de preview).
  `cache()` por request; `null` em qualquer erro.
- Helper único `src/components/payload/cms-page-route.tsx`: `renderCmsPage(path)` e
  `cmsPageMetadata(path)` (title/description/canonical = `path`, OG image = hero.image ou padrão).
  As três rotas chamam o helper; se `null`, seguem o comportamento atual (`notFound()`).
- Catch-all: `export const revalidate = 300` (ISR; o hook de `afterChange` revalida na hora).
  Não é `force-dynamic` porque blocos de dados ao vivo rodam ali.
- `/paginas/{slug}` de uma página **com** `path` → `permanentRedirect(path)` (evita duplicata).
- Sitemap: página com `path` entra como `{BASE}{path}`; sem `path`, `/paginas/{slug}` como hoje.
- Hook `afterChange`/`afterDelete` em `pages`: `revalidatePath(path || /paginas/{slug})` +
  `revalidatePath(dedicatedRoute)` quando houver + `revalidatePath('/sitemap.xml')`.

### 4.3 Preview

- `src/app/(site)/cms-preview/pagina/[id]/page.tsx`: `force-dynamic`, noindex, mesma guarda de acesso
  (secret OU sessão do `/cms`), busca `findByID({ draft: true, depth: 2 })`, renderiza faixa "rascunho"
  + `PageBlocks` (ou `PuckRender` se `editor === 'puck'`) + `<LivePreviewListener/>`.
- `src/app/(site)/cms-preview/time/[slug]/[aba]/page.tsx`: idem pra `teams` (`aba` ∈ hub, jogo-hoje,
  onde-assistir, escalacao, proximos-jogos, estatisticas), renderiza `TeamCmsView` com o doc em draft.
- `/cms-preview/[slug]` (posts): só ganha `<LivePreviewListener/>`.
- `LivePreviewListener` (`src/components/payload/live-preview-listener.tsx`, client):
  `RefreshRouteOnSave` de `@payloadcms/live-preview-react` com `refresh={router.refresh}` e
  `serverURL={window.location.origin}`.

## 5. Experiência no admin

- `admin.livePreview` em `pages` (`url: ({data}) => /cms-preview/pagina/${data.id}?previewSecret=…`),
  `teams` (`/cms-preview/time/${data.slug}/hub?…`; a aba "Hub" como padrão, e um campo `ui` em cada aba
  do time com link "Ver esta aba no preview"), e `posts` (já existe). Breakpoints Mobile 390 / Tablet 768 /
  Desktop 1440 em todos. `admin.preview` também nos três.
- `versions.drafts.autosave: { interval: 1500 }` em `pages` e `teams` (não em `posts`, que tem
  `schedulePublish` e muitos editores). Exige coluna `autosave` nas tabelas `_pages_v` e `_teams_v`
  (DDL aditivo).
- `i18n: { supportedLanguages: { pt }, fallbackLanguage: 'pt' }` com `pt` de
  `@payloadcms/translations/languages/pt`.
- `admin.group` nas collections: **Conteúdo** (posts, pages, pageTemplates, media, authors),
  **Futebol** (teams, matchComments, municipalGames), **Comercial** (sponsors), **Sistema** (users).
- `admin.meta`: `titleSuffix: ' · Papo de Bola CMS'`, favicon do site.
- `custom.scss`: drawer de blocos em grid com thumbnails maiores e título legível, cabeçalho de bloco
  colapsado com o resumo em destaque, cores do site no botão primário. Só CSS, sem override de componente.
- Dashboard: sem componente custom (fora de escopo); grupos já organizam.
- `scripts/gen-importmap.mjs` precisa rodar e o `importMap.js` gerado é commitado (gotcha
  `editor_blocos_importmap`): novos componentes client = `BlockSummaryLabel`, `TemplateTools`,
  `PuckEditorView`, `TeamPreviewLink`.

## 6. Modelos de página + importar/exportar

- Collection `pageTemplates` (label "Modelos de página", grupo Conteúdo, sem drafts): `title` (required),
  `description` (textarea), `thumbnail` (upload → media, opcional), `hero` (mesmo group), `layoutStyle`
  (mesmo group), `layout` (blocks, mesma `PAGE_BLOCKS`). Acesso: leitura/escrita só logado.
- Campo `templateTools` (ui, sidebar) em `pages` → componente client `TemplateTools`:
  - **Aplicar modelo**: select com os modelos (REST `/cms-api/pageTemplates?limit=100`) → `PATCH
    /cms-api/pages/{id}?draft=true` com `{ layout, hero, layoutStyle }` do modelo → `window.location.reload()`.
    Se o doc ainda não tem `id`: botão desabilitado com dica "Salve a página primeiro".
    Antes de sobrescrever um layout não vazio, confirma com modal nativo do Payload (`useModal`) —
    **sem `window.confirm`**.
  - **Salvar como modelo**: pede título → `POST /cms-api/pageTemplates` com o layout atual (lido via
    `GET /cms-api/pages/{id}?draft=true`).
  - **Exportar layout (JSON)**: copia pro clipboard `{ hero, layoutStyle, layout }` do draft atual e
    mostra num `<textarea readonly>`.
  - **Importar layout (JSON)**: `<textarea>` → valida (`JSON.parse`, `Array.isArray(layout)`, cada item
    com `blockType` ∈ slugs conhecidos; remove `id`s) → mesmo PATCH + reload. Erros em PT.
- Semear 3 modelos via script de uso único no servidor (rascunho não existe nesta collection; são só
  modelos, não páginas públicas): **"Hub de campeonato"** (hero left + section wide [standings |
  newsFeed] + scorers + todayGames), **"Página institucional"** (hero centered + richText + infoCard),
  **"Landing de esporte"** (hero banner + newsFeed grid + linkCards + richText).
- Formato do JSON exportado = exatamente o shape do `layout` do Payload (o que a IA já sabe gerar).
  Documentar em `docs/knowledge/` como pedir pra IA.

## 7. Piloto Puck (aba "Construtor")

- Dependência `@puckeditor/core@^0.23`.
- `pages.admin.components.views.edit.construtor = { Component: '/cms/components/puck-view#PuckView',
  path: '/construtor', tab: { label: 'Construtor (beta)', order: '60' } }`.
- `PuckView` (server) → `PuckEditor` (client): lê `useDocumentInfo().id`; sem id mostra "Salve a página
  primeiro". Busca `GET /cms-api/pages/{id}?draft=true`, renderiza `<Puck config={editorConfig}
  data={puckData ?? emptyData} onPublish={save} />` com header próprio: botão "Salvar rascunho"
  (`PATCH …?draft=true` com `{ puckData, editor: 'puck' }`), botão "Voltar ao editor de blocos"
  (seta `editor: 'blocks'`, mantém `puckData`), aviso "Publicar continua na aba Editar".
  Viewports: 390 / 768 / 1440.
- `src/cms/puck/config.editor.tsx` (client): componentes `Heading`, `Text` (textarea), `Image` (URL de
  mídia via campo `external` que lista `/cms-api/media`), `Button`, `Columns` (slots 2/3), `Section`
  (slot), e os de dados `TeamWidget`, `Standings`, `Scorers`, `NewsFeed`, `LiveMatch`, `TodayGames` com os
  mesmos campos do §3.2 (select/number/text; `team` via `external` listando `/cms-api/teams`). No canvas,
  blocos de dados renderizam um **cartão placeholder** com título e resumo (não buscam dados).
- `src/cms/puck/config.server.tsx` (server): mesmos nomes; `render` converte props → shape de bloco e
  chama `PageBlock`; `Columns`/`Section` renderizam os slots. `PuckRender` = `Render` de
  `@puckeditor/core/rsc`.
- Front: `PageBlocks` renderiza `PuckRender` quando `editor === 'puck'` e `puckData?.content?.length`;
  senão blocos. Hero/breadcrumb/largura continuam vindo dos campos normais.
- Estilo no canvas do editor: componentes com estilos inline simplificados (fidelidade "wireframe"); a
  fidelidade real é o Live Preview. Documentado como limitação do piloto.

## 8. Schema (Postgres compartilhado)

DDL **aditivo** gerado pela receita (`Dockerfile.migrate` + `migrate:create` no container na `pdb-net`,
extração manual do `up()`), revisado linha a linha (só `CREATE TABLE`, `ADD COLUMN`, `CREATE INDEX`,
`ADD CONSTRAINT` novos), aplicado em transação via `psql`, após `pg_dump`. Esperado:

- `pages`: `path`, `layout_style_width`, `layout_style_show_breadcrumb`, `hero_style`, `hero_image_id`,
  `editor`, `puck_data`; índice único em `path`.
- `_pages_v`: espelho dos campos acima + `autosave`.
- `_teams_v`: `autosave`.
- Tabelas de blocos novos em `pages` e `_pages_v`: `section` (+ `section_columns` + nested blocks),
  `team_widget`, `standings`, `scorers`, `news_feed`, `live_match`.
- Collection `pageTemplates`: tabelas da collection + blocos + rels + coluna
  `page_templates_id` em `payload_locked_documents_rels`.
- Enums novos (`enum_pages_layout_style_width`, etc.) via `CREATE TYPE`.

Validação pós-DDL: sem `payloadInitError` nos logs do container, `/cms-api/pages?limit=1` e
`/cms-api/pageTemplates?limit=1` respondem 200, `/cms` abre a lista de Páginas.

## 9. Testes e validação

- **Unitário** (`npm test`, node:test): `validatePath` (reservados, formato), `blockSummary` (rótulos),
  `puckToBlocks` (conversão props → bloco), `importLayout` (validação do JSON), `resolveTournament`.
- **Typecheck** local `npx tsc --noEmit` antes de cada commit.
- **Build no dev** via `git pushdev`; conferir log do rebuild e `importMap.js` com os componentes novos.
- **Browser (agent-browser, dev)** com usuário temporário `cms-teste@papodebola.com.br` criado via
  REST (`POST /cms-api/users`, autenticado por um admin via script no servidor) e **apagado no fim**:
  1. `/cms` em PT-BR; menu agrupado; Páginas → Criar: drawer de blocos mostra thumbnails e grupos.
  2. Criar página rascunho `path=/teste-builder-2026` com section + teamWidget + standings + newsFeed;
     Live Preview atualiza ao salvar; viewports trocam.
  3. Painel de modelos: aplicar "Hub de campeonato", exportar JSON, importar JSON.
  4. Aba Construtor: arrastar Heading + Standings, salvar rascunho; preview renderiza via Puck.
  5. Preview de time `/cms-preview/time/cruzeiro/hub` atualiza ao salvar.
  6. Rotas: `/teste-builder-2026` → 404 enquanto rascunho (nunca publicar); `/sobre`, `/paginas/apostas`,
     `/futebol/brasileirao-serie-a`, `/noticias/x` e uma URL de notícia real respondem igual a antes
     (diff do HTML da origem antes/depois pra `/sobre` e um `/paginas/{slug}`).
  7. Limpeza: apagar página de teste, usuário de teste; revalidar.
- **Prod**: após promote, `curl` em 6 URLs de controle (home, `/sobre`, time, campeonato, notícia,
  `/paginas/{slug}`) com status 200 e mesmo `<title>`; `/cms` abre; nenhum `payloadInitError`.

## 10. Deploy

1. Branch `development` local → commits pequenos por tarefa.
2. DDL aplicado **antes** do primeiro build que usa os campos (senão Payload falha no init).
3. `git pushdev` → validar (§9) → `ssh … "bash /home/ivan/promote.sh -y"` → purge Cloudflare não é
   necessário (HTML `no-store`), mas revalidar `/sitemap.xml`.
4. `docs/knowledge/2026-09-30-cms-page-builder.md` + memória + `/graphify --update`.

## 11. Fora de escopo (sugestões pra depois)

- Roles no `/cms` (admin/editor/seo) — bloqueio nº 1 pra abrir pra terceiros (ver doc 24/08).
- Dashboard custom com atalhos ("Nova página", "Modelos", "Preview").
- Migrar `EDITABLE` (textos das rotas em código) pro Payload.
- Puck como editor principal, se o piloto convencer: fidelidade visual no canvas (injetar CSS do site no
  iframe), blocos de dados com preview real, templates Puck.
- Bloco "Jogo ao vivo" por campeonato (seletor de jogo em vez de id).

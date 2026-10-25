# SEO + retenção: "a teia do jogo" — design (25/10/2026)

## Contexto (dados de 25/10)

GSC, últimos 28 dias (propriedade `https://www.papodebola.com.br/`):

- 5,6 mi impressões, 6,7 mil cliques, **CTR 0,12%**, posição média ~8,8. 94% mobile. Discover e Google Notícias = 0.
- `/futebol/times/*` = 88% das impressões e 89% dos cliques. Só `/proximos-jogos` = 3,7 mi impressões.
- CTR por aba do time: `onde-assistir` **0,87%**, `estatisticas` 0,70%, `escalacao` 0,52%, `jogo-hoje` 0,08%, `proximos-jogos` 0,08%, hub 0,03%.
- 524 páginas entre a posição 5 e 10; só 20 no top 3 (36 impressões). Nas buscas "próximo jogo do X" o Google mostra o quadro de jogos antes de nós.
- Páginas de time não têm saída: os jogos não linkam a página do jogo (que existe: `/futebol/[camp]/jogo/[data]/[match]`, ~1.170 no sitemap), o adversário não linka o time, e as notícias do time vêm vazias (busca por tag = nome do time, quase nenhum post tem essa tag).
- O H1 das 6 abas é só o nome do time (vem do `layout.tsx`).
- Último post publicado: ~28/09.

Logs do nginx (7 dias): `/favicon.svg` 404 em toda página (o `manifest.ts` aponta pra ele), `/feed` e `/rss` 404 (não há feed), `/cms-api/media/file/*` dá 500 quando o arquivo sumiu do volume, URLs do site de 2005 (`/24horas`, `/papodemidia`...) e `/cache/*.json` do site estático antigo ainda são pedidas.

## Objetivo

1. Quem chega numa página de time visita mais de uma página (página do jogo, adversário, notícia, tabela).
2. Subir as páginas de time do 5º–10º pro top 3 com conteúdo único por jogo e linkagem interna forte.
3. Voltar a publicar notícias e entrar no Google Notícias/Discover.
4. Zerar os erros técnicos que o Google vê (404/500 recorrentes).

**Medição:** baseline GSC hoje (CTR por aba, posição, cliques) via `scripts/gsc-report.mjs`; comparar 28 dias depois de cada parte. GA4 (tempo de engajamento, páginas/sessão) entra quando o Ivan der acesso de Leitor à service account `gsc-papodebola@phrasal-planet-500013-q3.iam.gserviceaccount.com`.

## Parte 1 — Higiene técnica

- `manifest.ts`: ícones PNG (`/simbolo-papo-de-bola.png`, `/apple-touch-icon.png`) no lugar do `/favicon.svg` inexistente.
- Feed RSS 2.0 em `/feed.xml` (últimos 50 posts publicados, via `getArticles`); `/feed`, `/feed/` e `/rss` redirecionam (308) pra ele; `<link rel="alternate" type="application/rss+xml">` no layout do site.
- Sitemap de notícias em `/news-sitemap.xml` (posts das últimas 48h, formato `news:` do Google), listado no `robots.ts`.
- Mídia do CMS: arquivo ausente responde **404**, não 500. Levantar os posts com capa quebrada.
- **410 Gone** pros prefixos do site de 2005 e pros `/cache/*.json` (middleware), pra o Google parar de rastrear.
- H1 por aba: o nome do time no `layout.tsx` deixa de ser `<h1>`; cada aba renderiza seu H1 ("Próximos jogos do Flamengo", "Onde assistir Flamengo hoje" etc.). Vale pras views clássicas e pras do CMS.
- Corrigir o que o rastreamento do sitemap (25/10) achar quebrado depois da migração pro Payload (status ≠ 200, título/H1 vazios ou duplicados, textos "indisponível"/"undefined").

## Parte 2 — A teia do jogo (links)

- `TeamMatch` ganha `tournamentId` e `href: string | null`. Um helper único `matchHrefFor(match)` resolve: campeonato do `TOURNAMENTS` com página → `championshipMatchHref`; Copa → `worldCupMatchHref`; Seleção → `selecaoMatchHref`; senão `null` (card sem link).
- Todo card de jogo vira link quando há `href`: abas do time (hub, próximos, jogo de hoje, onde assistir, escalação, estatísticas) e jogos de hoje (futebol).
- Nome do adversário linka `/futebol/times/{slug}` quando o time é um dos 57 (mapa id → slug a partir do `config.ts` + collection `teams`).
- Rodapé de navegação em toda aba (`TeamCrossLinks`): "Últimas do {time}" (4 notícias), mini-tabela (o time e 2 vizinhos de cada lado, link pro campeonato), link pro próximo adversário.
- Posts ganham o campo **`teams`** (relationship → `teams`, `hasMany`) e **`matchId`** (number, opcional). DDL aditivo seguindo a receita de migrations (backup → DDL só ADD → transação).
- Notícias do time: posts com `teams` contendo o time **ou** tag igual ao nome (compatibilidade com os posts antigos).

## Parte 3 — Página de jogo rica (campeonatos)

Em `/futebol/[slug]/jogo/[data]/[match]`:

- Antes do jogo: resposta direta (data, hora, estádio, onde assistir), escalação provável (mesma fonte do `/api/lineup-suggest`), posição dos dois times na tabela, notícias dos dois times, links pras páginas de time.
- Durante/depois: `LiveMatch` (já existe) + resultado.
- Título e descrição por status: futuro "A x B: horário, onde assistir e escalações (dd/mm)"; ao vivo "A x B ao vivo"; encerrado "A 2x1 B: resultado e lance a lance".
- Regras da API: ISR + polling, nada de `force-dynamic`; dados extras em cache ≥ 1h.

## Parte 4 — Títulos dinâmicos

- `teamSeo` aceita placeholders `{adversario}`, `{data}`, `{hora}`, `{campeonato}` (também no título editado no `/cms`).
- Padrões: próximos "Próximo jogo do {time}: x {adversario}, {data}, {hora}"; jogo de hoje "{time} x {adversario} hoje: horário e onde assistir"; onde assistir "Onde assistir {time} x {adversario} hoje". Sem jogo → título atual.
- `revalidate` da aba próximos de 12h → 1h (a chamada à API segue em cache de 12h; não aumenta requisições).

## Parte 5 — Notícias

- Modelo de post "pré-jogo" no Studio (campos Times e Jogo preenchidos, link pra página do jogo), foco nos 10 times com mais impressões.
- Publicar continua sendo decisão do Ivan (nunca automático).
- Google Notícias: cadastro no Publisher Center + envio do `/news-sitemap.xml` no GSC (passos manuais do Ivan).
- Cadência alvo: 3–5 posts/dia.

## Fora do escopo

Core Web Vitals (cota do PageSpeed estourada em 25/10 — próximo ciclo), backlinks.

## Riscos

- Banco compartilhado dev/prod: o DDL vale na hora pros dois; só ADD, com backup.
- Página de jogo e cards: mais dados por página não podem virar mais chamadas à API por acesso (tudo cacheado, só o dev consulta a API).
- Títulos dinâmicos dependem do dado do próximo jogo; sem dado → título padrão.

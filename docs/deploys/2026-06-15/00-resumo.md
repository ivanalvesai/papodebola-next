---
area: indice
data: 2026-06-15
---

# Resumo da sessão de 2026-06-15 — papodebola-next

Sessão longa com muitas mudanças, em duas frentes: (A) features de produto e (B) um
plano de marketing/SEO derivado de uma auditoria com as skills do
[marketingskills](https://github.com/coreyhaines31/marketingskills), terminando no
sistema de **web push próprio (VAPID)**. Tudo já em produção.

## Features de produto
- **01-features-frontend** — carrosséis de "jogos de hoje" por campeonato (/futebol e
  /jogos-de-hoje), tradução dos países do vôlei e da Copa ("FIFA World Cup" → "Copa do
  Mundo"), cards de jogo clicáveis, substituições na escalação do jogo ao vivo
  (saiu vermelho / entrou verde).
- **02-rotas-jogos-de-hoje-e-sp** — `/agenda` → `/jogos-de-hoje` (+`/futebol`); nova
  hierarquia geográfica `/sp` → `/sp/santana-de-parnaiba` → `/sp/santana-de-parnaiba/municipal`
  (o antigo `/municipal`); `/futebol/jogos-hoje` → 301. Todos com redirect 301/308.

## Marketing / SEO (auditoria das 44 skills)
- **03-seo-marketing** — host www, schema de marca (Organization+WebSite+SearchAction),
  schema esportivo (SportsTeam/SportsEvent), NewsArticle, BreadcrumbList com `/futebol`,
  ItemList; canonical em todas as páginas + noindex no admin; H1 na home; linking interno
  (classificação → times, hub de campeonatos, footer); acentuação; artigos no sitemap;
  bots de IA liberados no Cloudflare; `/llms.txt`.

## Infra / notificações
- **04-web-push** — web push próprio com VAPID (sem OneSignal): opt-in (modal "Eu quero" +
  botão no menu), armazenamento, envio manual no painel, e **disparo automático de início
  de jogo e de GOL da Copa** via cron. Chaves, store e cron documentados.

## Pendências deixadas para depois
- Alertas de push por **time/campeonato específico** (o cadastro já tem campo `topics`).
- Push automático ao **publicar post** no WordPress (gancho tipo mu-plugin de revalidate).
- **Desligar o cron** `# copa-kickoff-push` no crontab do `ivan` após a Copa.
- Reenviar sitemap no Search Console (migração apex→www) e validar schemas no Rich Results Test.

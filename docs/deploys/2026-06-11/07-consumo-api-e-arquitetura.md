---
area: consumo-api-arquitetura
data: 2026-06-11
---

# Consumo da API e arquitetura

## Limites REAIS do plano Pro da AllSportsApi (correção de entendimento)
O plano **Pro $19.99/mês tem requests ILIMITADOS** — não existe cota de 10k/mês. Os limites são:
- **Rate limit: 6 req/s** → estourar vira HTTP 429 (era a causa do *success rate 77%* no painel).
- **Bandwidth: 10 GB/mês** incluídos, depois $0,001/MB → é o **custo** real (respostas grandes,
  ver [[incidente_sports_proxy_2mb]]).

## Tuning aplicado (commit perf)
- `championship.ts`: classificação/rounds-info 2h→6h; loop até `currentRound+1` (era +2); cadência
  150ms→**250ms** (4 req/s, abaixo de 6/s).
- `team.ts`: próximos/últimos jogos 1h→12h. Páginas de time: onde-assistir 30min→24h, escalação
  30min→12h, hub 1h→6h, próximos-jogos 1h→12h. `ao-vivo` 5min→15min.
- Regra: **curto só no que é live/hoje; longo no resto.**

## Ao vivo (página do jogo) — latência baixa
- Poll do cliente: 12s ao vivo; pré-jogo **45s** (15s a ≤5min do apito, agendador recursivo que
  recalcula o intervalo); para quando `finished`.
- TTL do cache ao vivo: 10s (match page), 15s (tabela `/api/copa/ao-vivo`).
- Tradução do feed roda em **background** (não bloqueia a request). Ver 03.

## Regra de ouro da arquitetura (sempre)
**Só o ambiente DEV consulta as APIs externas; o PROD passa pelo dev** (não dois batendo na API).
- Dados: prod tem `SPORTS_PROXY_URL` apontando pro container dev (`/api/sports-proxy/[...path]`).
  O proxy aceita `_pdbttl` pra respeitar o TTL curto do ao vivo (senão cacheava 1800s fixos).
- Imagens: prod `/img/*` faz loopback pro vhost dev, que é o único que bate na RapidAPI (ver 01).
- Ver [[arquitetura_so_dev_consulta_api]].

## Gotcha de deploy observado
Num promote, o **container de prod não foi recriado** (um "Connection reset" cortou), e o prod
ficou rodando código antigo apesar do `git pull` ter atualizado os fontes. Sintoma: `docker ps`
mostra o container "Up X hours" antigo e o feature não aparece, mas `grep` no fonte mostra o código.
**Fix:** rodar `cd /home/ivan/papodebola-next && bash rebuild.sh` direto. Conferir uptime do
container após promotes importantes.

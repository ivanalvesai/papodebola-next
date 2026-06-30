---
area: infra-imagens
data: 2026-06-11
---

# Imagens (escudos e fotos de jogador) agora vêm da RapidAPI, não do Sofascore direto

## Problema
Todos os escudos de time e fotos de jogador quebraram (prod e dev) porque o **Sofascore
bloqueou o IP do servidor** para requisições de imagem (`/img/team/*`, `/img/player/*`).
De fora dava 200, mas do servidor dava **403** em todos os hosts do Sofascore. As fotos de
jogador (muitas e quase sempre "frias", não cacheadas) caíam sempre na bandeira.

## Diagnóstico
```bash
# do servidor: 403 = IP bloqueado
curl -H 'Referer: https://www.sofascore.com/' https://api.sofascore.app/api/v1/player/843114/image
```

## Solução definitiva
A **AllSportsApi (RapidAPI)** — que já pagamos, com requests ilimitados — **serve as imagens**
com a API key e **não bloqueia IP**:
```
GET https://allsportsapi2.p.rapidapi.com/api/player/{id}/image   (x-rapidapi-key)
GET https://allsportsapi2.p.rapidapi.com/api/team/{id}/image
```

Repontamos o proxy nginx de imagens (no **vhost do dev**, já que prod consulta via dev) de
`api.sofascore.app` para a RapidAPI:
- `proxy_pass https://allsportsapi2.p.rapidapi.com/api/{team,player}/`
- headers `x-rapidapi-key` + `x-rapidapi-host` + `proxy_ssl_server_name on`
- (sem mais o Referer do sofascore)
- Backup: `development.papodebola.com.br.conf.bak.20260611-img-rapidapi`

## Resultado / cuidados
- Fotos de jogador e escudos sempre carregam (mesmo frios). Fim do bloqueio de IP.
- Só conta **bandwidth** (imagens ~4-10KB, cacheadas 7d no nginx + 1 mês no Cloudflare).
- A **key fica hardcoded no vhost** (root). Se o aaPanel regenerar o vhost, **re-aplicar**.
- Prod continua via loopback pro dev (regra "só o dev bate na API"). Ver 07.
- O `PlayerAvatar` (live-match.tsx) usa `/img/player/{id}/image` com fallback pra bandeira.

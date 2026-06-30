---
area: indice
data: 2026-06-13
---

# Resumo da sessão de 2026-06-13 — papodebola-next (2º dia de jogos da Copa)

Dia de manutenção de infra + features da Copa. O destaque foi um **incidente de servidor**
(VPS inteira fora do ar durante um build) com causa raiz em disco cheio, resolvido e
blindado. Também foram pro ar ajustes da barra de jogos e da página da Copa, e um post.

## Infra / servidor (o foco)

- **01-incidente-disco-build-cache** — `next build` encheu o disco (`/` a 85%, build cache
  do Docker em 52GB) e **travou a VPS inteira** (prod + dev + signsimples + WP) por I/O
  lockup. Fix: `docker builder prune -f` (liberou 51GB → 33%). **Safeguard** adicionado nos
  dois `rebuild.sh`: se `/` > 75%, limpa o build cache antes do build. Não era RAM.
- **Builds de recuperação throttled** — passamos a rodar build pesado com
  `nice -n 10 ionice -c2 -n7` + monitorando load/disco, pra não competir com o site.
- **Pendência agendada (14h):** Opção B — 2º disco virtual no ESXi dedicado a
  `/var/lib/docker` (isola o Docker do disco do SO). Lembrete cloud
  `trig_01XshB8oZCYPKU1mcjmtkf2w` com o passo a passo.

## Deploys de app (prod)

- **Barra "Hoje" da home** — passou a ordenar por **timestamp real** (não mais string
  "HH:MM"), mostra **data + hora** no card e os jogos da Copa de **hoje + 2 dias**
  (`getWorldCupBarMatches`). Resolve jogo de madrugada aparecendo fora de ordem.
- **Selo "Veja como foi"** na rodada da `/futebol/copa-do-mundo` — aparece no apito final
  (status `finished`) substituindo o AO VIVO, sinalizando que o card leva ao lance a lance.
- Ambos promovidos pra prod com build throttled (pós-incidente), sem travar.

## WordPress / conteúdo

- Post **Brasil x Marrocos** (id 1961, publicado) criado e enriquecido: ficha, comparativo
  e escalações em tabela + 3 miniaturas de "melhores momentos" da CazéTV (link, não embed).
- Gotchas de WP REST/`wpautop` documentados na memória `criar_post_seo_rankmath`
  (resumo: bloco com grid/flex precisa ir **em uma linha só**, senão o `wpautop` enfia
  `<br>` e quebra o layout; vídeos da Copa têm embed bloqueado → usar miniatura+link; REST
  do WP precisa de **User-Agent de navegador** senão o Cloudflare bloqueia com erro 1010).
- Nome do autor nos posts: muda sozinho (display_name = render-time); não edita post.

## Arquivos-chave tocados

- `rebuild.sh` (prod + dev, no servidor) — **safeguard de disco** (gitignored, reaplicar se recriar).
- `src/lib/data/matches.ts`, `src/components/match-bar/*` — ordenação/data/multi-dia da barra.
- `src/components/world-cup/group-row.tsx` — selo "Veja como foi".

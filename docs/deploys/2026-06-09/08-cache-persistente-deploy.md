---
area: infra
data: 2026-06-09
arquivos:
  - Dockerfile
  - docker-compose.yml
  - docker-compose.override.yml (dev, no servidor)
  - /home/ivan/papodebola-next/rebuild.sh
  - /home/ivan/papodebola-next-dev/rebuild.sh
---

# Cache persistente entre deploys (o site não fica vazio ao dar deploy)

## Problema
Todo deploy zerava os dados da API (placares/classificação) e o site ficava vazio até o ISR
repopular. O cache ISR/fetch do Next vive em `.next/cache` DENTRO do container → some no
rebuild. Pior: o build pula a API de propósito (`NEXT_PHASE==='phase-production-build'` →
`fetchAllSports` retorna null), então os prerenders nascem **vazios** e ficam "frescos"
(revalidate 1800), e o Next serve o vazio sem revalidar.

Requisito do Ivan: cache que **sobrevive ao deploy** e só troca quando a API responde de novo.

## Parte 1 — persistir `.next/cache` em volume por ambiente
- `Dockerfile`: `RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app/.next/cache`
  antes de `USER nextjs` (volume nasce gravável pelo usuário nextjs).
- `docker-compose.yml` (prod, commitado): volume `pdb-next-cache:/app/.next/cache`.
- `docker-compose.override.yml` (dev, gitignored, no servidor): volume **separado**
  `pdb-next-cache-dev:/app/.next/cache` (o override usa `volumes: !override`, então TEM que
  listar o volume dele). Separar dev/prod evita contaminação (já compartilham `pdb-data`).
- Isso persiste o `fetch-cache` (respostas da API). Validado: 66 arquivos sobrevivem ao rebuild.
- Detalhe: no PROD o `fetch-cache` fica quase vazio (respostas grandes estouram o limite de
  2MB do Next, e o prod consulta via proxy→dev). Quem guarda o cache persistente dos esportes
  é o **DEV** (`pdb-next-cache-dev`). O prod re-renderiza puxando do proxy.

## Parte 2 — warm SEQUENCIAL no rebuild.sh
Após o health check, o `rebuild.sh` (dev e prod, gitignored/por-servidor, com backups)
**revalida + reaquece** as páginas-chave (`/`, `/futebol/copa-do-mundo`,
`/futebol/brasileirao-serie-a`), regenerando com os dados antes dos visitantes.

**CRÍTICO: sequencial, uma página por vez.** A 1ª versão aquecia tudo junto → as
revalidações em background disputavam o semáforo `ALLSPORTS_MAX_CONCURRENT=2` → fetch
falhava → página cacheava VAZIA (a Copa, que faz standings + 3 rodadas, foi a que mais
quebrou). Fazendo uma página de cada vez (revalidate do path + 3 hits com `sleep 3`), cada
render tem o semáforo livre e popula completo. O `revalidate` é necessário porque o prerender
vazio-mas-fresco do build não revalida sozinho.

## Resultado
Após o deploy o site já aparece com os dados (serve os antigos até a API responder com os
novos). Testado rebuildando a prod várias vezes seguidas — os dados continuaram lá.

## Limitação
Persistir cache também persiste entradas RUINS/vazias se uma API flakar na hora errada (um
rebuild antes limpava). Se ficar dado preso, force `/api/revalidate` do path.

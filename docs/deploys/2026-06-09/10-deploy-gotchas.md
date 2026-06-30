---
area: infra
data: 2026-06-09
arquivos:
  - .gitignore
  - /home/ivan/promote.sh
---

# Armadilhas e aprendizados de deploy (não perder nos próximos)

## Fluxo de deploy
`git pushdev` (push development + rebuild do container dev) → validar em
development.papodebola.com.br → `git promote` / `promote.sh -y` (merge development→master +
rebuild prod). O `promote.sh -y` pula a confirmação interativa.

## Backups commitados pelo watcher bloquearam o promote
Ao editar `rebuild.sh`/override no servidor, criei backups `*.bak.TIMESTAMP`. O **watcher do
dev** (inotify + `git add -A`) os commitou porque não estavam no `.gitignore`. Isso bloqueou
o merge no workspace de prod ("untracked working tree files would be overwritten").

**Correção:** adicionado `*.bak` e `*.bak.*` ao `.gitignore` + `git rm --cached` dos arquivos.
Lição: qualquer arquivo solto no workspace dev vira commit do watcher — manter o `.gitignore`
cobrindo backups/temporários.

## Marcador de "página tem dados" — use NOMES, não logos
Perdi tempo achando que a home estava vazia porque `/img/team/` (logos) dava 2. A home tinha
"Brasil", "Flamengo", "Grupo A".."Grupo L" normalmente. **Para checar se uma página tem dados,
procure NOMES de time/grupo, não contagem de logos.**

## Validar via curl: cuidado com RSC e redirect
- A home/páginas vêm como **payload RSC** (não HTML puro) — parsers de HTML por classe não
  funcionam direto.
- O apex `papodebola.com.br` faz 301 → `www`; usar `curl -L` (sem `-L` vem só o stub do redirect).
- Origem direta sem CDN: `http://127.0.0.1:3000` (prod) / `:3001` (dev) via SSH.

## Cloudflare
Mudança visual: lembrar do **Purge Everything** no Cloudflare. Mas com o `proxy_cache off` no
nginx, o HTML já reflete a origem (ver doc nginx-cache-html). Não há token de API do Cloudflare
no servidor — purge/regras só pelo dashboard.

## Relação com cache persistente
Os deploys agora aquecem as páginas (warm sequencial) e persistem o fetch-cache — ver
`08-cache-persistente-deploy.md`. Se após um deploy uma página ficar vazia, force
`/api/revalidate` daquele path com o `REVALIDATION_SECRET` do `.env.local`.
